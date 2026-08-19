import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'Material name',
    example: 'Portland Cement 42.5N',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(150, { message: 'name cannot exceed 150 characters' })
  name: string;

  @ApiProperty({
    description:
      'Unique material code. Stored uppercase; letters, digits and hyphens only.',
    example: 'MAT-001',
    maxLength: 20,
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

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'bag',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'unit is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(20, { message: 'unit cannot exceed 20 characters' })
  unit: string;

  @ApiPropertyOptional({
    description:
      'Minimum stock level that triggers the low-stock flag. Defaults to 0. ' +
      'Opening stock is recorded through POST /inventory/stock-in, not here.',
    example: 500,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'minimumStock must be a number with at most 3 decimal places' },
  )
  @Min(0, { message: 'minimumStock cannot be negative' })
  minimumStock?: number;
}
