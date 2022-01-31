import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SendMessageReqDto } from '@src/client-api/dtos';
import { SendConfirmationReqDto } from '@src/server-api/dtos/send-confirmation.req.dto';
import { ConnectionInfo } from './invitation-code.service';

@Injectable()
export class ServerApiOutboundService {
  constructor(private readonly http: HttpService) {}

  async sendConfirmation(url: string, connInfo: ConnectionInfo): Promise<void> {
    const body: SendConfirmationReqDto = {
      myName: connInfo.myName,
      myUrl: connInfo.myUrl,
    };
    return this.post(`${url}/server/${connInfo.connectionId}/confirm`, body);
  }

  async sendMessage(
    url: string,
    connectionId: string,
    msg: string,
  ): Promise<void> {
    const body: SendMessageReqDto = { msg };
    return this.post(`${url}/server/${connectionId}`, body);
  }

  private post(url: string, body: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<void>(url, body).subscribe({
        next: (res) => {
          if (res.status < 200 || res.status > 299) {
            reject(`http error ${res.status}`);
          }
          resolve();
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
}
