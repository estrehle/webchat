import { HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { SendMessageReqDto } from '@src/client-api/dtos';
import { SendConfirmationReqDto } from '@src/server-api/dtos/send-confirmation.req.dto';
import { AxiosResponse } from 'axios';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { of, throwError } from 'rxjs';
import { ConnectionInfo } from './invitation-code.service';
import { ServerApiOutboundService } from './server-api-outbound.service';

const moduleMocker = new ModuleMocker(global);

describe('ServerApiOutboundService', () => {
  let serverApiOutboundService: ServerApiOutboundService;

  let httpService: HttpService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ServerApiOutboundService],
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

    serverApiOutboundService = moduleRef.get<ServerApiOutboundService>(
      ServerApiOutboundService,
    );

    httpService = moduleRef.get<HttpService>(HttpService);
  });

  describe('sendConfirmation', () => {
    const exampleUrl = 'example url';
    const exampleConnInfo: ConnectionInfo = {
      connectionId: 'example connection id',
      myName: 'example name',
      myUrl: 'example url',
    };

    it('should call HttpService.post with correct arguments', async () => {
      const spy = jest.spyOn(httpService, 'post').mockImplementation(() => {
        const res: AxiosResponse<any> = {
          data: {},
          headers: {},
          config: {},
          status: 200,
          statusText: 'OK',
        };
        return of(res);
      });

      await serverApiOutboundService.sendConfirmation(
        exampleUrl,
        exampleConnInfo,
      );

      expect(spy).toHaveBeenCalledTimes(1);
      const url = spy.mock.calls[0][0];
      expect(url.includes(exampleConnInfo.myUrl)).toEqual(true);
      expect(url.includes(exampleConnInfo.connectionId)).toEqual(true);
      const correctBody: SendConfirmationReqDto = {
        myName: exampleConnInfo.myName,
        myUrl: exampleConnInfo.myUrl,
      };
      const body = spy.mock.calls[0][1];
      expect(body).toEqual(correctBody);
    });

    it('should reject on response status < 200', async () => {
      jest.spyOn(httpService, 'post').mockImplementation(() => {
        const res: AxiosResponse<any> = {
          data: {},
          headers: {},
          config: {},
          status: 199,
          statusText: 'not OK',
        };
        return of(res);
      });

      await expect(async () => {
        await serverApiOutboundService.sendConfirmation(
          exampleUrl,
          exampleConnInfo,
        );
      }).rejects.toBeTruthy();
    });

    it('should reject on response status >= 300', async () => {
      jest.spyOn(httpService, 'post').mockImplementation(() => {
        const res: AxiosResponse<any> = {
          data: {},
          headers: {},
          config: {},
          status: 300,
          statusText: 'not OK',
        };
        return of(res);
      });

      await expect(async () => {
        await serverApiOutboundService.sendConfirmation(
          exampleUrl,
          exampleConnInfo,
        );
      }).rejects.toBeTruthy();
    });

    it('should reject on error from HttpService.post', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error()));

      await expect(async () => {
        await serverApiOutboundService.sendConfirmation(
          exampleUrl,
          exampleConnInfo,
        );
      }).rejects.toBeTruthy();
    });
  });

  describe('sendMessage', () => {
    const exampleUrl = 'example url';
    const exampleConnectionId = 'example connection id';
    const exampleMsg = 'example msg';

    it('should call HttpService.post with correct arguments', async () => {
      const spy = jest.spyOn(httpService, 'post').mockImplementation(() => {
        const res: AxiosResponse<any> = {
          data: {},
          headers: {},
          config: {},
          status: 200,
          statusText: 'OK',
        };
        return of(res);
      });

      await serverApiOutboundService.sendMessage(
        exampleUrl,
        exampleConnectionId,
        exampleMsg,
      );

      expect(spy).toHaveBeenCalledTimes(1);
      const url = spy.mock.calls[0][0];
      expect(url.includes(exampleUrl)).toEqual(true);
      expect(url.includes(exampleConnectionId)).toEqual(true);
      const correctBody: SendMessageReqDto = {
        msg: exampleMsg,
      };
      const body = spy.mock.calls[0][1];
      expect(body).toEqual(correctBody);
    });

    it('should reject on response status < 200', async () => {
      jest.spyOn(httpService, 'post').mockImplementation(() => {
        const res: AxiosResponse<any> = {
          data: {},
          headers: {},
          config: {},
          status: 199,
          statusText: 'not OK',
        };
        return of(res);
      });

      await expect(async () => {
        await serverApiOutboundService.sendMessage(
          exampleUrl,
          exampleConnectionId,
          exampleMsg,
        );
      }).rejects.toBeTruthy();
    });

    it('should reject on response status >= 300', async () => {
      jest.spyOn(httpService, 'post').mockImplementation(() => {
        const res: AxiosResponse<any> = {
          data: {},
          headers: {},
          config: {},
          status: 300,
          statusText: 'not OK',
        };
        return of(res);
      });

      await expect(async () => {
        await serverApiOutboundService.sendMessage(
          exampleUrl,
          exampleConnectionId,
          exampleMsg,
        );
      }).rejects.toBeTruthy();
    });

    it('should reject on error from HttpService.post', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error()));

      await expect(async () => {
        await serverApiOutboundService.sendMessage(
          exampleUrl,
          exampleConnectionId,
          exampleMsg,
        );
      }).rejects.toBeTruthy();
    });
  });
});
