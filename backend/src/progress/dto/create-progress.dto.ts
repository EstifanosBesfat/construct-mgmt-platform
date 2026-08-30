import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProgressDto {
  @ApiProperty({
    description: 'Project this progress record belongs to',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty({ message: 'projectId is required' })
  projectId: string;

  @ApiProperty({
    description: 'Date the progress was observed (ISO 8601)',
    type: String,
    format: 'date-time',
    example: '2026-08-15T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'date must be a valid ISO 8601 date' })
  date: Date;

  @ApiProperty({
    description: 'What was accomplished',
    example: 'Masonry and first-fix services in progress',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'description is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'description cannot exceed 500 characters' })
  description: string;

  @ApiProperty({
    description: 'Completion percentage for the project at this date. 0 to 100.',
    example: 71,
    minimum: 0,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'percentage must be a number with at most 2 decimal places' },
  )
  @Min(0, { message: 'percentage cannot be below 0' })
  @Max(100, { message: 'percentage cannot exceed 100' })
  percentage: number;

  @ApiPropertyOptional({
    description: 'Optional notes',
    example: 'Steel delivery delay recovered with weekend shifts.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'notes cannot exceed 500 characters' })
  notes?: string;
}
