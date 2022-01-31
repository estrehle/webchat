/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConnectionRepo } from '@src/db/connection.repo';
import {
  ConfirmedConnection,
  UnclaimedConnection,
  UnconfirmedConnection,
} from '@src/types/connection';
import { Message } from '@src/types/message';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { MessageService } from './message.service';
import { ServerApiOutboundService } from './server-api-outbound.service';

const moduleMocker = new ModuleMocker(global);

describe('MessageService', () => {
  let messageService: MessageService;

  let connectionRepo: ConnectionRepo;
  let serverApiOutboundService: ServerApiOutboundService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MessageService],
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

    messageService = moduleRef.get<MessageService>(MessageService);

    connectionRepo = moduleRef.get<ConnectionRepo>(ConnectionRepo);
    serverApiOutboundService = moduleRef.get<ServerApiOutboundService>(
      ServerApiOutboundService,
    );
  });

  describe('receive', () => {
    const exampleConnectionId = 'example connection id';
    const exampleMsg = 'example msg';

    let exampleMessages: Message[];
    let exampleConn: ConfirmedConnection;
    beforeEach(() => {
      // example connection is modified by some tests;
      // reset it here
      exampleMessages = [
        {
          id: 0,
          msg: 'example message',
          sender: 'me',
          timestamp: 0,
        },
        {
          id: 1,
          msg: 'example message',
          sender: 'me',
          timestamp: 0,
        },
        {
          id: 2,
          msg: 'example message',
          sender: 'me',
          timestamp: 0,
        },
      ];
      exampleConn = {
        id: exampleConnectionId,
        status: 'confirmed',
        name: 'example name',
        color: 'example color',
        url: 'example url',
        messages: exampleMessages,
      };
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => exampleConn);
    });

    it('should throw NotFoundException on unknown connection id', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => undefined);

      expect(() => {
        messageService.receive(exampleConnectionId, exampleMsg);
      }).toThrow(NotFoundException);
    });

    it('should throw BadRequestException if connection is unclaimed', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => {
        const conn: UnclaimedConnection = {
          id: exampleConnectionId,
          status: 'unclaimed',
        };
        return conn;
      });

      expect(() => {
        messageService.receive(exampleConnectionId, exampleMsg);
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if connection is unconfirmed', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => {
        const conn: UnconfirmedConnection = {
          id: exampleConnectionId,
          status: 'unconfirmed',
          name: 'example name',
          color: 'example color',
          url: 'example url',
        };
        return conn;
      });

      expect(() => {
        messageService.receive(exampleConnectionId, exampleMsg);
      }).toThrow(BadRequestException);
    });

    it('should add message to connection', async () => {
      const messageCountBefore = exampleConn.messages.length;

      messageService.receive(exampleConnectionId, exampleMsg);

      const messageCountAfter = exampleConn.messages.length;
      expect(messageCountAfter).toEqual(messageCountBefore + 1);
    });

    it('added message should be at end of connection.messages array', async () => {
      const messageIdsBefore = exampleConn.messages.map((m) => m.id);

      messageService.receive(exampleConnectionId, exampleMsg);

      const newMessages = exampleConn.messages.filter(
        (m) => !messageIdsBefore.includes(m.id),
      );
      expect(newMessages.length).toEqual(1);
      const newMessage = newMessages[0];
      expect(exampleConn.messages.pop()).toEqual(newMessage);
    });

    it('id of added message should be unique within connection messages', async () => {
      const messageIdsBefore = exampleConn.messages.map((m) => m.id);

      messageService.receive(exampleConnectionId, exampleMsg);

      const newMessageId = exampleConn.messages.pop()!.id;
      expect(messageIdsBefore.includes(newMessageId)).toEqual(false);
    });

    it('added message should have correct msg text', async () => {
      messageService.receive(exampleConnectionId, exampleMsg);

      const message = exampleConn.messages.pop()!;
      expect(message.msg).toEqual(exampleMsg);
    });

    it('added message should have sender `you`', async () => {
      messageService.receive(exampleConnectionId, exampleMsg);

      const message = exampleConn.messages.pop()!;
      expect(message.sender).toEqual('you');
    });

    it('added message should have Date.now() as timestamp', async () => {
      const timestamp = 12345;
      Date.now = jest.fn(() => timestamp);

      messageService.receive(exampleConnectionId, exampleMsg);

      const message = exampleConn.messages.pop()!;
      expect(message.timestamp).toEqual(timestamp);
    });

    it('should create different message id on each call', async () => {
      messageService.receive(exampleConnectionId, exampleMsg);
      messageService.receive(exampleConnectionId, exampleMsg);

      const message0 = exampleConn.messages.pop()!;
      const message1 = exampleConn.messages.pop()!;
      expect(message0.id).not.toEqual(message1.id);
    });
  });

  describe('send', () => {
    const exampleConnectionId = 'example connection id';
    const exampleMsg = 'example msg';

    let exampleMessages: Message[];
    let exampleConn: ConfirmedConnection;
    beforeEach(() => {
      // example connection is modified by some tests;
      // reset it here
      exampleMessages = [
        {
          id: 0,
          msg: 'example message',
          sender: 'me',
          timestamp: 0,
        },
        {
          id: 1,
          msg: 'example message',
          sender: 'me',
          timestamp: 0,
        },
        {
          id: 2,
          msg: 'example message',
          sender: 'me',
          timestamp: 0,
        },
      ];
      exampleConn = {
        id: exampleConnectionId,
        status: 'confirmed',
        name: 'example name',
        color: 'example color',
        url: 'example url',
        messages: exampleMessages,
      };
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => exampleConn);
    });

    it('should throw NotFoundException on unknown connection id', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => undefined);

      await expect(async () => {
        await messageService.send(exampleConnectionId, exampleMsg);
      }).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if connection is unclaimed', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => {
        const conn: UnclaimedConnection = {
          id: exampleConnectionId,
          status: 'unclaimed',
        };
        return conn;
      });

      await expect(async () => {
        await messageService.send(exampleConnectionId, exampleMsg);
      }).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if connection is unconfirmed', async () => {
      jest.spyOn(connectionRepo, 'find').mockImplementation(() => {
        const conn: UnconfirmedConnection = {
          id: exampleConnectionId,
          status: 'unconfirmed',
          name: 'example name',
          color: 'example color',
          url: 'example url',
        };
        return conn;
      });

      await expect(async () => {
        await messageService.send(exampleConnectionId, exampleMsg);
      }).rejects.toThrow(BadRequestException);
    });

    it('should send outbound message with correct arguments', async () => {
      const spy = jest.spyOn(serverApiOutboundService, 'sendMessage');

      await messageService.send(exampleConnectionId, exampleMsg);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        exampleConn.url,
        exampleConnectionId,
        exampleMsg,
      );
    });

    it('should throw InternalServerErrorException if outbound send throws', async () => {
      jest
        .spyOn(serverApiOutboundService, 'sendMessage')
        .mockImplementation(() => {
          throw new Error();
        });

      await expect(async () => {
        await messageService.send(exampleConnectionId, exampleMsg);
      }).rejects.toThrow(InternalServerErrorException);
    });

    it('should not store message internally if outbound send fails', async () => {
      jest
        .spyOn(serverApiOutboundService, 'sendMessage')
        .mockImplementation(() => {
          throw new Error();
        });
      const messageCountBefore = exampleConn.messages.length;

      try {
        await messageService.send(exampleConnectionId, exampleMsg);
      } catch {}

      const messageCountAfter = exampleConn.messages.length;
      expect(messageCountAfter).toEqual(messageCountBefore);
    });

    it('should add message to connection', async () => {
      const messageCountBefore = exampleConn.messages.length;

      await messageService.send(exampleConnectionId, exampleMsg);

      const messageCountAfter = exampleConn.messages.length;
      expect(messageCountAfter).toEqual(messageCountBefore + 1);
    });

    it('added message should be at end of connection.messages array', async () => {
      const messageIdsBefore = exampleConn.messages.map((m) => m.id);

      await messageService.send(exampleConnectionId, exampleMsg);

      const newMessages = exampleConn.messages.filter(
        (m) => !messageIdsBefore.includes(m.id),
      );
      expect(newMessages.length).toEqual(1);
      const newMessage = newMessages[0];
      expect(exampleConn.messages.pop()).toEqual(newMessage);
    });

    it('id of added message should be unique within connection messages', async () => {
      const messageIdsBefore = exampleConn.messages.map((m) => m.id);

      await messageService.send(exampleConnectionId, exampleMsg);

      const newMessageId = exampleConn.messages.pop()!.id;
      expect(messageIdsBefore.includes(newMessageId)).toEqual(false);
    });

    it('added message should have correct msg text', async () => {
      await messageService.send(exampleConnectionId, exampleMsg);

      const message = exampleConn.messages.pop()!;
      expect(message.msg).toEqual(exampleMsg);
    });

    it('added message should have sender `me`', async () => {
      await messageService.send(exampleConnectionId, exampleMsg);

      const message = exampleConn.messages.pop()!;
      expect(message.sender).toEqual('me');
    });

    it('added message should have Date.now() as timestamp', async () => {
      const timestamp = 12345;
      Date.now = jest.fn(() => timestamp);

      await messageService.send(exampleConnectionId, exampleMsg);

      const message = exampleConn.messages.pop()!;
      expect(message.timestamp).toEqual(timestamp);
    });

    it('should create different message id on each call', async () => {
      await messageService.send(exampleConnectionId, exampleMsg);
      await messageService.send(exampleConnectionId, exampleMsg);

      const message0 = exampleConn.messages.pop()!;
      const message1 = exampleConn.messages.pop()!;
      expect(message0.id).not.toEqual(message1.id);
    });
  });
});
