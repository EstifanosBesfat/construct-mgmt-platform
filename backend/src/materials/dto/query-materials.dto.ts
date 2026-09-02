import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum MaterialSortField {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  CODE = 'code',
  CURRENT_STOCK = 'currentStock',
  MINIMUM_STOCK = 'minimumStock',
}

export enum MaterialSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryMaterialsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive partial match against name or code',
    example: 'cement',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description:
      'When true, only materials whose currentStock is at or below minimumStock',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === '1') {
      return true;
    }
    if (value === false || value === 'false' || value === '0') {
      return false;
    }
    return value;
  })
  @IsBoolean({ message: 'lowStock must be a boolean' })
  lowStock?: boolean;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: MaterialSortField,
    default: MaterialSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(MaterialSortField, {
    message: `sortBy must be one of: ${Object.values(MaterialSortField).join(', ')}`,
  })
  sortBy?: MaterialSortField;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: MaterialSortOrder,
    default: MaterialSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(MaterialSortOrder, {
    message: 'sortOrder must be either asc or desc',
  })
  sortOrder?: MaterialSortOrder;
}
