import { ApiProperty } from '@nestjs/swagger';
import { MessageDto } from './message.dto';

export class GetMessagesResDto {
  @ApiProperty({
    required: true,
    type: () => [MessageDto],
  })
  result: MessageDto[];
}
