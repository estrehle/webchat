import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConnectionRepo } from '@src/db/connection.repo';
import { ConfirmedConnection } from '@src/types/connection';
import { Message } from '@src/types/message';
import { ServerApiOutboundService } from './server-api-outbound.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly connections: ConnectionRepo,
    private readonly outbound: ServerApiOutboundService,
  ) {}

  receive(connectionId: string, msg: string): void {
    const conn = this.connections.find(connectionId);
    if (!conn) {
      throw new NotFoundException('unknown connection id');
    }
    if (conn.status !== 'confirmed') {
      throw new BadRequestException('connection not confirmed');
    }

    const id = this.nextMessageId(conn);
    const message: Message = {
      id,
      msg,
      sender: 'you',
      timestamp: Date.now(),
    };
    conn.messages.push(message);
  }

  async send(connectionId: string, msg: string): Promise<void> {
    const conn = this.connections.find(connectionId);
    if (!conn) {
      throw new NotFoundException('unknown connection id');
    }
    if (conn.status !== 'confirmed') {
      throw new BadRequestException('connection not confirmed');
    }

    // send to message receiver
    try {
      await this.outbound.sendMessage(conn.url, connectionId, msg);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }

    const id = this.nextMessageId(conn);
    const message: Message = {
      id,
      msg,
      sender: 'me',
      timestamp: Date.now(),
    };
    conn.messages.push(message);
  }

  private nextMessageId(conn: ConfirmedConnection): number {
    const ids = conn.messages.map((c) => c.id);
    if (ids.length === 0) {
      return 0;
    }
    return Math.max(...ids) + 1;
  }
}
