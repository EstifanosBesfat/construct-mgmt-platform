import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { PaginationMetaDto } from '../../common/dto/paginated-response.dto';
import { MaterialEntity } from '../../materials/entities/material.entity';

export class TransactionProjectEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'Riverside Office Complex' })
  name: string;

  @ApiProperty({ example: 'PRJ-001' })
  code: string;
}

export class TransactionMaterialEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'Portland Cement 42.5N' })
  name: string;

  @ApiProperty({ example: 'MAT-001' })
  code: string;

  @ApiProperty({ example: 'bag' })
  unit: string;
}

export class InventoryTransactionEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  materialId: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  projectId: string | null;

  @ApiProperty({ enum: TransactionType, example: TransactionType.STOCK_IN })
  type: TransactionType;

  @ApiProperty({ type: Number, example: 800 })
  quantity: number;

  @ApiProperty({ type: String, format: 'date-time' })
  date: Date;

  @ApiProperty({ example: 'GRN-2001' })
  reference: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Replenishment from Derba Cement',
  })
  notes: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: TransactionMaterialEntity })
  material: TransactionMaterialEntity;

  @ApiPropertyOptional({ type: TransactionProjectEntity, nullable: true })
  project: TransactionProjectEntity | null;
}

export class StockMovementResultEntity {
  @ApiProperty({ type: InventoryTransactionEntity })
  transaction: InventoryTransactionEntity;

  @ApiProperty({ type: MaterialEntity })
  material: MaterialEntity;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Set when the material is at or below its minimum stock after the movement',
    example: 'Current stock is at or below the minimum stock level',
  })
  warning: string | null;
}

export class PaginatedTransactionsEntity {
  @ApiProperty({ type: [InventoryTransactionEntity] })
  data: InventoryTransactionEntity[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
