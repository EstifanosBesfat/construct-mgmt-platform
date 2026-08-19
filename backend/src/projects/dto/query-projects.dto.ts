import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum ProjectSortField {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  CODE = 'code',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  BUDGET = 'budget',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryProjectsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by project status',
    enum: ProjectStatus,
    example: ProjectStatus.ONGOING,
  })
  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: `status must be one of: ${Object.values(ProjectStatus).join(', ')}`,
  })
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description:
      'Case-insensitive partial match against project name, code or client name',
    example: 'riverside',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ProjectSortField,
    default: ProjectSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProjectSortField, {
    message: `sortBy must be one of: ${Object.values(ProjectSortField).join(', ')}`,
  })
  sortBy?: ProjectSortField;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'sortOrder must be either asc or desc' })
  sortOrder?: SortOrder;
}
