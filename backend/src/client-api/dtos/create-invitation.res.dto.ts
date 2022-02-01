import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationResDto {
  @ApiProperty({
    description: 'Invitation code',
    example:
      'eyJjb25uZWN0aW9uSWQiOiI0NGVlMzJmOC03ZjI3LTQyZmYtYTMwYS1hMDdiMTIwOTRiZTgiLCJteU5hbWUiOiJBbGljZSIsIm15VXJsIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIn0=',
    required: true,
    type: String,
  })
  invitationCode: string;
}
