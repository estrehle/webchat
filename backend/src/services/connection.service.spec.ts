import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { ConnectionRepo } from '@src/db/connection.repo';
import {
  ConfirmedConnection,
  UnclaimedConnection,
  UnconfirmedConnection,
} from '@src/types/connection';
import { ConnectionService } from './connection.service';
import {
  ConnectionInfo,
  InvitationCodeService,
} from './invitation-code.service';
import { ColorPickerService } from './color-picker.service';
import { ServerApiOutboundService } from './server-api-outbound.service';

const moduleMocker = new ModuleMocker(global);

describe('ConnectionService', () => {
  let connectionService: ConnectionService;

  let colorPickerService: ColorPickerService;
  let configService: ConfigService;
  let connectionRepo: ConnectionRepo;
  let invitationCodeService: InvitationCodeService;
  let serverApiOutboundService: ServerApiOutboundService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ConnectionService],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    connectionService = moduleRef.get<ConnectionService>(ConnectionService);

    colorPickerService = moduleRef.get<ColorPickerService>(ColorPickerService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    connectionRepo = moduleRef.get<ConnectionRepo>(ConnectionRepo);
    invitationCodeService = moduleRef.get<InvitationCodeService>(
      InvitationCodeService,
    );
    serverApiOutboundService = moduleRef.get<ServerApiOutboundService>(
      ServerApiOutboundService,
    );
  });

  describe('createInvitation', () => {
    it('should add 1 UnclaimedConnection to repo', async () => {
      const spy = jest.spyOn(connectionRepo, 'add');

      connectionService.createInvitation();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'unclaimed' }),
      );
    });

    it('invitation should contain myName and myUrl from config', async () => {
      const myName = 'myName';
      const myUrl = 'myUrl';
      jest
        .spyOn(configService, 'get')
        .mockImplementation((val: string): string | undefined => {
          if (val === 'MY_NAME') {
            return myName;
          }
          if (val === 'MY_URL') {
            return myUrl;
          }
          return;
        });
      const spy = jest.spyOn(invitationCodeService, 'encode');

      connectionService.createInvitation();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ myName, myUrl }),
      );
    });

    it('should create different connection id on repeated calls', async () => {
      const spy = jest.spyOn(invitationCodeService, 'encode');

      connectionService.createInvitation();
      connectionService.createInvitation();

      const id0 = spy.mock.calls[0][0].connectionId;
      const id1 = spy.mock.calls[1][0].connectionId;
      expect(id0).toBeDefined();
      expect(id1).toBeDefined();
      expect(id0).not.toEqual(id1);
    });

    it('should return encoder output', async () => {
      const code = 'Example code';
      jest
        .spyOn(invitationCodeService, 'encode')
        .mockImplementation(() => code);

      const result = connectionService.createInvitation();

      expect(result).toEqual(code);
    });
  });

  describe('receiveInvitation', () => {
    const exampleConnInfo: ConnectionInfo = {
      connectionId: 'example connection id',
      myName: 'example name',
      myUrl: 'example url',
    };

    beforeEach(async () => {
      // receiveInvitation method will fail without this
      jest
        .spyOn(invitationCodeService, 'decode')
        .mockImplementation(() => exampleConnInfo);
    });

    it('should throw BadRequestException on failed decode', async () => {
      jest.spyOn(invitationCodeService, 'decode').mockImplementation(() => {
        throw new Error('decode failed');
      });

      await expect(async () => {
        await connectionService.receiveInvitation('Example code');
      }).rejects.toThrow(BadRequestException);
    });

    it('should add 1 unconfirmed connection to repo', async () => {
      const spy = jest.spyOn(connectionRepo, 'add');

      await connectionService.receiveInvitation('Example code');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'unconfirmed' }),
      );
    });

    it('added connection should contain values from connection info', async () => {
      const spy = jest.spyOn(connectionRepo, 'add');

      await connectionService.receiveInvitation('Example code');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: exampleConnInfo.connectionId,
          name: exampleConnInfo.myName,
          url: exampleConnInfo.myUrl,
        }),
      );
    });

    it('added connection should contain color chosen by ColorPickerService', async () => {
      const color = 'example color';
      jest
        .spyOn(colorPickerService, 'nextColor')
        .mockImplementation(() => color);
      const spy = jest.spyOn(connectionRepo, 'add');

      await connectionService.receiveInvitation('example code');

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ color }));
    });

    it('should trigger call to sendConfirmation', async () => {
      const spy = jest.spyOn(connectionService, 'sendConfirmation');

      await connectionService.receiveInvitation('example code');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should reject if sendConfirmation rejects', async () => {
      jest
        .spyOn(connectionService, 'sendConfirmation')
        .mockImplementation(async () => {
          throw new Error();
        });

      await expect(async () => {
        await connectionService.receiveInvitation('example code');
      }).rejects.toThrow();
    });
  });

  describe('sendConfirmation', () => {
    const exampleConn: UnconfirmedConnection = {
      id: 'example id',
      status: 'unconfirmed',
      name: 'example name',
      color: 'example color',
      url: 'example url',
    };

    it('should call ServerApiOutboundService.sendConfirmation() with correct arguments', async () => {
      const myName = 'myName';
      const myUrl = 'myUrl';
      jest
        .spyOn(configService, 'get')
        .mockImplementation((val: string): string | undefined => {
          if (val === 'MY_NAME') {
            return myName;
          }
          if (val === 'MY_URL') {
            return myUrl;
          }
          return;
        });
      const url = exampleConn.url;
      const connInfo: ConnectionInfo = {
        connectionId: exampleConn.id,
        myName,
        myUrl,
      };
      const spy = jest.spyOn(serverApiOutboundService, 'sendConfirmation');

      await connectionService.sendConfirmation(exampleConn);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(url, connInfo);
    });

    it('should throw InternalServerErrorException if sending confirmation fails', async () => {
      jest
        .spyOn(serverApiOutboundService, 'sendConfirmation')
        .mockImplementation(async () => {
          throw new Error();
        });

      await expect(async () => {
        await connectionService.sendConfirmation(exampleConn);
      }).rejects.toThrow();
    });

    it('should update connection in repo with correct arguments', async () => {
      const id = exampleConn.id;
      const conn: ConfirmedConnection = {
        ...exampleConn,
        status: 'confirmed',
        messages: [],
      };
      const spy = jest.spyOn(connectionRepo, 'update');

      await connectionService.sendConfirmation(exampleConn);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(id, conn);
    });
  });

  describe('receiveConfirmation', () => {
    const exampleConnInfo: ConnectionInfo = {
      connectionId: 'example connection id',
      myName: 'example name',
      myUrl: 'example url',
    };

    it('should throw NotFoundException on unknown connection id', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => undefined);

      expect(() => {
        connectionService.receiveConfirmation(exampleConnInfo);
      }).toThrow(NotFoundException);
    });

    it('should throw BadRequestException when connection is already confirmed', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => {
        const conn: ConfirmedConnection = {
          id: 'example connection id 2',
          status: 'confirmed',
          name: 'example name 2',
          color: 'example color 2',
          url: 'example url 2',
          messages: [],
        };
        return conn;
      });

      expect(() => {
        connectionService.receiveConfirmation(exampleConnInfo);
      }).toThrow(BadRequestException);
    });

    it('should update connection in repo with correct arguments', async () => {
      const color = 'example color';
      jest
        .spyOn(colorPickerService, 'nextColor')
        .mockImplementation(() => color);
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => {
        const oldConn: UnclaimedConnection = {
          id: exampleConnInfo.connectionId,
          status: 'unclaimed',
        };
        return oldConn;
      });
      const id = exampleConnInfo.connectionId;
      const conn: ConfirmedConnection = {
        id: exampleConnInfo.connectionId,
        status: 'confirmed',
        name: exampleConnInfo.myName,
        color,
        url: exampleConnInfo.myUrl,
        messages: [],
      };
      const spy = jest.spyOn(connectionRepo, 'update');

      connectionService.receiveConfirmation(exampleConnInfo);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(id, conn);
    });
  });
});
