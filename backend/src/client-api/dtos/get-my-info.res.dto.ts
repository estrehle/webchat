import { ApiProperty } from '@nestjs/swagger';

export class GetMyInfoResDto {
  @ApiProperty({
    description: "User's name",
    example: 'Alice',
    required: true,
    type: String,
  })
  name: string;
}
