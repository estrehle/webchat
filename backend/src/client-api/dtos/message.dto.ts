import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@src/types/message';

export class MessageDto {
  @ApiProperty({
    description: "Message ID. Unique within this contact's messages",
    example: 0,
    required: true,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello Bob! This is Alice.',
    required: true,
    type: String,
  })
  msg: string;

  @ApiProperty({
    description: 'UNIX timestamp',
    example: 1640991600000,
    required: true,
    type: Number,
  })
  timestamp: number;

  @ApiProperty({
    description: 'Message sender',
    example: 'me',
    required: true,
    enum: ['me', 'you'],
  })
  sender: 'me' | 'you';

  static fromMessage(message: Message): MessageDto {
    return {
      id: message.id,
      msg: message.msg,
      timestamp: message.timestamp,
      sender: message.sender,
    };
  }
}
