import { PartialType } from '@nestjs/swagger';
import { CreateMaterialDto } from './create-material.dto';

/**
 * currentStock is intentionally absent. Stock levels only change through
 * inventory stock-in and stock-out so the ledger stays consistent.
 */
export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}
