import { ApiProperty } from '@nestjs/swagger';

export class SendConfirmationReqDto {
  @ApiProperty({
    description: "Sender's name",
    example: 'Bob',
    required: true,
    type: String,
  })
  myName: string;

  @ApiProperty({
    description: "Sender's Webchat API base URL",
    example: 'https://example.com/webchat',
    required: true,
    type: String,
  })
  myUrl: string;
}
