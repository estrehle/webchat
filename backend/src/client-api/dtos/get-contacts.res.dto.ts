import { ApiProperty } from '@nestjs/swagger';
import { ContactDto } from './contact.dto';

export class GetContactsResDto {
  @ApiProperty({
    required: true,
    type: () => [ ContactDto ],
  })
  result: ContactDto[];
}
