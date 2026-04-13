import { ApiProperty } from '@nestjs/swagger';

export class GetAuditLogFilterOptionsResponseDto {
  @ApiProperty({ type: [String], example: ['sale_invoice', 'bill', 'payment'] })
  subjects: string[];

  @ApiProperty({ type: [String], example: ['created', 'edited', 'deleted'] })
  actions: string[];
}
