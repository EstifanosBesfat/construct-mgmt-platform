import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsAfterDate } from '../../common/validators/is-after-date.validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    minLength: 3,
    maxLength: 100,
    example: 'Riverside Office Complex',
  })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(3, 100, { message: 'name must be between 3 and 100 characters' })
  name: string;

  @ApiProperty({
    description:
      'Unique project code. Stored uppercase; letters, digits and hyphens only.',
    maxLength: 20,
    example: 'PRJ-001',
  })
  @IsString()
  @IsNotEmpty({ message: 'code is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @MaxLength(20, { message: 'code cannot exceed 20 characters' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'code may only contain letters, digits and hyphens',
  })
  code: string;

  @ApiProperty({ description: 'Client name', example: 'Addis Holdings PLC' })
  @IsString()
  @IsNotEmpty({ message: 'clientName is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(150)
  clientName: string;

  @ApiProperty({ description: 'Project location', example: 'Bole, Addis Ababa' })
  @IsString()
  @IsNotEmpty({ message: 'location is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(150)
  location: string;

  @ApiProperty({
    description: 'Project start date (ISO 8601)',
    type: String,
    format: 'date-time',
    example: '2026-01-15T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'startDate must be a valid ISO 8601 date' })
  startDate: Date;

  @ApiProperty({
    description: 'Project end date (ISO 8601). Must be after startDate.',
    type: String,
    format: 'date-time',
    example: '2026-12-31T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'endDate must be a valid ISO 8601 date' })
  @IsAfterDate('startDate', { message: 'endDate must be after startDate' })
  endDate: Date;

  @ApiProperty({
    description: 'Total project budget. Must be greater than zero.',
    example: 5000000.0,
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'budget must be a number with at most 2 decimal places' },
  )
  @IsPositive({ message: 'budget must be greater than 0' })
  budget: number;

  // Left without a default initializer on purpose: UpdateProjectDto extends
  // this class through PartialType, which inherits initializers, and a default
  // here would silently reset status on every partial update. Prisma's
  // @default(PLANNED) supplies the value when it is omitted on create.
  @ApiPropertyOptional({
    description: 'Project status. Defaults to PLANNED when omitted.',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNED,
    example: ProjectStatus.PLANNED,
  })
  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: `status must be one of: ${Object.values(ProjectStatus).join(', ')}`,
  })
  status?: ProjectStatus;
}
