import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import {
  PaginatedTransactionsEntity,
  StockMovementResultEntity,
} from './entities/inventory-transaction.entity';
import { InventoryService, StockMovementResult } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stock-in')
  @ApiOperation({
    summary: 'Record a stock-in',
    description:
      'Increases currentStock by quantity and writes an inventory transaction ' +
      'in the same database transaction. projectId is optional.',
  })
  @ApiCreatedResponse({
    description: 'The receipt was recorded and stock was increased',
    type: StockMovementResultEntity,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such material or project' })
  stockIn(@Body() dto: StockInDto): Promise<StockMovementResult> {
    return this.inventoryService.stockIn(dto);
  }

  @Post('stock-out')
  @ApiOperation({
    summary: 'Record a stock-out',
    description:
      'Decreases currentStock by quantity and writes an inventory transaction. ' +
      'Rejected with HTTP 422 when quantity exceeds available stock. ' +
      'projectId is required. A warning is returned when the remaining stock ' +
      'is at or below the material minimum.',
  })
  @ApiCreatedResponse({
    description: 'The issue was recorded and stock was decreased',
    type: StockMovementResultEntity,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such material or project' })
  @ApiUnprocessableEntityResponse({
    description: 'quantity exceeds available stock',
  })
  stockOut(@Body() dto: StockOutDto): Promise<StockMovementResult> {
    return this.inventoryService.stockOut(dto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'List inventory transactions',
    description:
      'Paginated history. Filter by type, material, project and date range.',
  })
  @ApiOkResponse({
    description: 'A page of inventory transactions',
    type: PaginatedTransactionsEntity,
  })
  findTransactions(
    @Query() query: QueryTransactionsDto,
  ): Promise<PaginatedResponseDto<StockMovementResult['transaction']>> {
    return this.inventoryService.findTransactions(query);
  }
}
