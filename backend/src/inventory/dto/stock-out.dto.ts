import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class StockOutDto {
  @ApiProperty({
    description: 'Material to issue',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty({ message: 'materialId is required' })
  materialId: string;

  @ApiProperty({
    description: 'Project the material is issued to. Required on stock-out.',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty({ message: 'projectId is required on stock-out' })
  projectId: string;

  @ApiProperty({
    description:
      'Quantity issued. Must be greater than zero and must not exceed available stock.',
    example: 120,
    minimum: 0.001,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'quantity must be a number with at most 3 decimal places' },
  )
  @IsPositive({ message: 'quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({
    description: 'Date of the issue (ISO 8601)',
    type: String,
    format: 'date-time',
    example: '2026-08-05T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'date must be a valid ISO 8601 date' })
  date: Date;

  @ApiProperty({
    description: 'Issue note / store requisition reference',
    example: 'ISS-1014',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'reference is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(50, { message: 'reference cannot exceed 50 characters' })
  reference: string;

  @ApiPropertyOptional({
    description: 'Optional notes',
    example: 'Foundation pour, block B',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'notes cannot exceed 500 characters' })
  notes?: string;
}
