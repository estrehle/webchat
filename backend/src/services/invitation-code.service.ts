import { Injectable } from '@nestjs/common';

export interface ConnectionInfo {
  connectionId: string;
  myName: string;
  myUrl: string;
}

@Injectable()
export class InvitationCodeService {
  encode(connInfo: ConnectionInfo): string {
    return Buffer.from(JSON.stringify(connInfo), 'binary').toString('base64');
  }

  decode(code: string): ConnectionInfo {
    let connInfo: any = {};
    try {
      connInfo = JSON.parse(Buffer.from(code, 'base64').toString('binary'));
    } catch (e) {
      throw new Error('could not parse code');
    }
    if (!(connInfo.connectionId && connInfo.myName && connInfo.myUrl)) {
      throw new Error('invalid connection info');
    }
    return connInfo as ConnectionInfo;
  }
}
