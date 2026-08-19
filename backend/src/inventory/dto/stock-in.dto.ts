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

export class StockInDto {
  @ApiProperty({
    description: 'Material to receive',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty({ message: 'materialId is required' })
  materialId: string;

  @ApiPropertyOptional({
    description: 'Optional project this receipt is associated with',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({
    description: 'Quantity received. Must be greater than zero.',
    example: 800,
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
    description: 'Date of the receipt (ISO 8601)',
    type: String,
    format: 'date-time',
    example: '2026-08-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'date must be a valid ISO 8601 date' })
  date: Date;

  @ApiProperty({
    description: 'Goods-received / delivery note reference',
    example: 'GRN-2001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'reference is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(50, { message: 'reference cannot exceed 50 characters' })
  reference: string;

  @ApiPropertyOptional({
    description: 'Optional notes',
    example: 'Replenishment from Derba Cement',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'notes cannot exceed 500 characters' })
  notes?: string;
}
