import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum TransactionSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryTransactionsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by movement type',
    enum: TransactionType,
    example: TransactionType.STOCK_OUT,
  })
  @IsOptional()
  @IsEnum(TransactionType, {
    message: `type must be one of: ${Object.values(TransactionType).join(', ')}`,
  })
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter by material id',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsOptional()
  @IsString()
  materialId?: string;

  @ApiPropertyOptional({
    description: 'Filter by project id',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Inclusive start of the date range (ISO 8601)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dateFrom must be a valid ISO 8601 date' })
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Inclusive end of the date range (ISO 8601)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dateTo must be a valid ISO 8601 date' })
  dateTo?: Date;

  @ApiPropertyOptional({
    description: 'Sort direction for the date column',
    enum: TransactionSortOrder,
    default: TransactionSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(TransactionSortOrder, {
    message: 'sortOrder must be either asc or desc',
  })
  sortOrder?: TransactionSortOrder;
}
