import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus, TransactionType } from '@prisma/client';

export class ProjectsSummaryCountEntity {
  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 3 })
  planned!: number;

  @ApiProperty({ example: 7 })
  ongoing!: number;

  @ApiProperty({ example: 2 })
  completed!: number;
}

export class InventorySummaryCountEntity {
  @ApiProperty({ example: 15 })
  totalMaterials!: number;

  @ApiProperty({ example: 3 })
  lowStockCount!: number;

  @ApiProperty({ example: 450000 })
  totalStockValue?: number;
}

export class ProjectPerformanceItemEntity {
  @ApiProperty({ example: 'ck123456789' })
  id!: string;

  @ApiProperty({ example: 'Riverside Office Complex' })
  name!: string;

  @ApiProperty({ example: 'PRJ-001' })
  code!: string;

  @ApiProperty({ example: 'Addis Holdings PLC' })
  clientName!: string;

  @ApiProperty({ example: 'Bole, Addis Ababa' })
  location!: string;

  @ApiProperty({ example: '2026-01-15T00:00:00.000Z' })
  startDate!: Date;

  @ApiProperty({ example: '2026-11-30T00:00:00.000Z' })
  endDate!: Date;

  @ApiProperty({ example: 48500000 })
  budget!: number;

  @ApiProperty({ example: 47800000 })
  boqValue!: number;

  @ApiProperty({ example: 71, nullable: true })
  latestProgress!: number | null;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.ONGOING })
  status!: ProjectStatus;
}

export class RecentTransactionItemEntity {
  @ApiProperty({ example: 'tx123' })
  id!: string;

  @ApiProperty({ example: 'MAT-001' })
  materialCode!: string;

  @ApiProperty({ example: 'Portland Cement 42.5N' })
  materialName!: string;

  @ApiProperty({ example: 'bag' })
  unit!: string;

  @ApiProperty({ example: 'PRJ-001', nullable: true })
  projectCode!: string | null;

  @ApiProperty({ example: 'Riverside Office Complex', nullable: true })
  projectName!: string | null;

  @ApiProperty({ enum: TransactionType, example: TransactionType.STOCK_OUT })
  type!: TransactionType;

  @ApiProperty({ example: 1200 })
  quantity!: number;

  @ApiProperty({ example: '2026-08-05T00:00:00.000Z' })
  date!: Date;

  @ApiProperty({ example: 'ISS-1001' })
  reference!: string;
}

export class RecentProgressItemEntity {
  @ApiProperty({ example: 'pr123' })
  id!: string;

  @ApiProperty({ example: 'PRJ-001' })
  projectId!: string;

  @ApiProperty({ example: 'PRJ-001' })
  projectCode!: string;

  @ApiProperty({ example: 'Riverside Office Complex' })
  projectName!: string;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z' })
  date!: Date;

  @ApiProperty({ example: 'Masonry and first-fix services in progress' })
  description!: string;

  @ApiProperty({ example: 71 })
  percentage!: number;

  @ApiProperty({ example: 'Ahead of schedule', nullable: true })
  notes!: string | null;
}

export class MaterialStockSummaryItemEntity {
  @ApiProperty({ example: 'MAT-001' })
  code!: string;

  @ApiProperty({ example: 'Portland Cement 42.5N' })
  name!: string;

  @ApiProperty({ example: 'bag' })
  unit!: string;

  @ApiProperty({ example: 1240 })
  currentStock!: number;

  @ApiProperty({ example: 500 })
  minimumStock!: number;

  @ApiProperty({ example: false })
  isLowStock!: boolean;
}

export class DashboardSummaryEntity {
  @ApiProperty({ type: ProjectsSummaryCountEntity })
  projects!: ProjectsSummaryCountEntity;

  @ApiProperty({ type: InventorySummaryCountEntity })
  inventory!: InventorySummaryCountEntity;

  @ApiProperty({ type: [ProjectPerformanceItemEntity] })
  projectPerformance!: ProjectPerformanceItemEntity[];

  @ApiProperty({ type: [RecentTransactionItemEntity] })
  recentTransactions!: RecentTransactionItemEntity[];

  @ApiProperty({ type: [RecentProgressItemEntity] })
  recentProgress!: RecentProgressItemEntity[];

  @ApiProperty({ type: [MaterialStockSummaryItemEntity] })
  materialStockSummary!: MaterialStockSummaryItemEntity[];
}
