import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidV4 } from 'uuid';
import { ConnectionRepo } from '@src/db/connection.repo';
import {
  ConfirmedConnection,
  UnclaimedConnection,
  UnconfirmedConnection,
} from '@src/types/connection';
import { Message } from '@src/types/message';
import { ColorPickerService } from './color-picker.service';
import {
  ConnectionInfo,
  InvitationCodeService,
} from './invitation-code.service';
import { ServerApiOutboundService } from './server-api-outbound.service';

@Injectable()
export class ConnectionService {
  constructor(
    private colorPicker: ColorPickerService,
    private config: ConfigService,
    private connections: ConnectionRepo,
    private invitationCode: InvitationCodeService,
    private outbound: ServerApiOutboundService,
  ) {}

  createInvitation(): string {
    // create new connection for invitee
    const conn: UnclaimedConnection = {
      id: uuidV4(),
      status: 'unclaimed',
    };
    this.connections.add(conn);

    const connInfo = this.myConnectionInfo(conn.id);
    const code = this.invitationCode.encode(connInfo);

    return code;
  }

  async receiveInvitation(code: string): Promise<void> {
    let connInfo: ConnectionInfo;
    try {
      connInfo = this.invitationCode.decode(code);
    } catch (e) {
      throw new BadRequestException(e);
    }

    const conn: UnconfirmedConnection = {
      id: connInfo.connectionId,
      status: 'unconfirmed',
      name: connInfo.myName,
      color: this.colorPicker.nextColor(),
      url: connInfo.myUrl,
    };
    this.connections.add(conn);

    // send confirmation to inviter
    await this.sendConfirmation(conn);
  }

  async sendConfirmation(conn: UnconfirmedConnection): Promise<void> {
    const connInfo = this.myConnectionInfo(conn.id);

    try {
      await this.outbound.sendConfirmation(conn.url, connInfo);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    const confirmedConn: ConfirmedConnection = {
      ...conn,
      status: 'confirmed',
      messages: [] as Message[],
    };
    this.connections.update(conn.id, confirmedConn);
  }

  receiveConfirmation(connInfo: ConnectionInfo): void {
    const conn = this.connections.find(connInfo.connectionId);
    if (!conn) {
      throw new NotFoundException('unknown connection id');
    }
    if (conn.status === 'confirmed') {
      throw new BadRequestException('connection already confirmed');
    }

    const confirmedConn: ConfirmedConnection = {
      ...conn,
      status: 'confirmed',
      name: connInfo.myName,
      color: this.colorPicker.nextColor(),
      url: connInfo.myUrl,
      messages: [] as Message[],
    };
    this.connections.update(conn.id, confirmedConn);
  }

  private myConnectionInfo(connectionId: string): ConnectionInfo {
    return {
      connectionId,
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      myName: this.config.get('MY_NAME')!,
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      myUrl: this.config.get('MY_URL')!,
    };
  }
}
