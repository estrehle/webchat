import { ApiProperty } from '@nestjs/swagger';

export class SendMessageReqDto {
  @ApiProperty({
    description: 'Message',
    example: 'Hello, Alice! This is Bob.',
    required: true,
    type: String,
  })
  msg: string;
}
