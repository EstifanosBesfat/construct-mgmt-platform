import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/paginated-response.dto';

export class MaterialEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'Portland Cement 42.5N' })
  name: string;

  @ApiProperty({ example: 'MAT-001' })
  code: string;

  @ApiProperty({ example: 'bag' })
  unit: string;

  @ApiProperty({ type: Number, example: 1240 })
  currentStock: number;

  @ApiProperty({ type: Number, example: 500 })
  minimumStock: number;

  @ApiProperty({
    description: 'True when currentStock is less than or equal to minimumStock',
    example: false,
  })
  isLowStock: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class PaginatedMaterialsEntity {
  @ApiProperty({ type: [MaterialEntity] })
  data: MaterialEntity[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
