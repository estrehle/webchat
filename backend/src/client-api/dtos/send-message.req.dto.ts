import { ApiProperty } from '@nestjs/swagger';

export class SendMessageReqDto {
  @ApiProperty({
    description: 'Message',
    example: 'Hello, Bob! This is Alice.',
    required: true,
    type: String,
  })
  msg: string;
}
