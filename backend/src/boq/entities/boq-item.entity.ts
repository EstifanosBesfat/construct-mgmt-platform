import { ApiProperty } from '@nestjs/swagger';

export class BoqItemEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  projectId: string;

  @ApiProperty({ example: 'Reinforced concrete foundation' })
  description: string;

  @ApiProperty({ example: 'm3' })
  unit: string;

  @ApiProperty({ type: Number, example: 860 })
  quantity: number;

  @ApiProperty({ type: Number, example: 4850 })
  unitPrice: number;

  @ApiProperty({
    type: Number,
    example: 4171000,
    description: 'Computed server-side as quantity × unitPrice, rounded to 2 decimals',
  })
  total: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class BoqSummaryEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  projectId: string;

  @ApiProperty({
    type: Number,
    description: 'Number of BOQ items on the project',
    example: 5,
  })
  itemCount: number;

  @ApiProperty({
    type: Number,
    description: 'Sum of every item total',
    example: 26584200,
  })
  totalValue: number;
}

export class BoqListEntity {
  @ApiProperty({ type: [BoqItemEntity] })
  data: BoqItemEntity[];

  @ApiProperty({ type: BoqSummaryEntity })
  summary: BoqSummaryEntity;
}
