import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBoqItemDto {
  @ApiProperty({
    description: 'Work item description',
    example: 'Reinforced concrete foundation',
    maxLength: 250,
  })
  @IsString()
  @IsNotEmpty({ message: 'description is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(250, { message: 'description cannot exceed 250 characters' })
  description: string;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'm3',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'unit is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(20, { message: 'unit cannot exceed 20 characters' })
  unit: string;

  @ApiProperty({
    description:
      'Quantity. Must be greater than zero. At most 3 decimal places.',
    example: 860,
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
    description:
      'Unit price. Must be zero or greater. At most 2 decimal places. ' +
      'The line total is computed server-side as quantity × unitPrice; do not send it.',
    example: 4850,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'unitPrice must be a number with at most 2 decimal places' },
  )
  @Min(0, { message: 'unitPrice cannot be negative' })
  unitPrice: number;
}
