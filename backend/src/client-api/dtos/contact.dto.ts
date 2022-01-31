import { ApiProperty } from '@nestjs/swagger';
import { ConfirmedConnection } from '@src/types/connection';

export class ContactDto {
  @ApiProperty({
    description: 'Connection ID',
    example: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
    required: true,
    type: String,
    format: 'UUID v4',
  })
  id: string;

  @ApiProperty({
    description: 'Contact name',
    example: 'Bob',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Contact color. Useful for UI customization.',
    example: '#4e79a7',
    required: true,
    type: String,
    format: 'Hex color code',
    pattern: '^#(?:[0-9a-fA-F]{3}){1, 2}$',
  })
  color: string;

  static fromConnection(conn: ConfirmedConnection): ContactDto {
    return {
      id: conn.id,
      name: conn.name,
      color: conn.color,
    };
  }
}
