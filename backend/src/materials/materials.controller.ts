import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateMaterialDto } from './dto/create-material.dto';
import { QueryMaterialsDto } from './dto/query-materials.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import {
  MaterialEntity,
  PaginatedMaterialsEntity,
} from './entities/material.entity';
import { MaterialsService, MaterialWithStockFlag } from './materials.service';

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a material',
    description:
      'currentStock starts at 0. Record opening stock through POST /inventory/stock-in.',
  })
  @ApiCreatedResponse({
    description: 'The material was created',
    type: MaterialEntity,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'A material with this code already exists',
  })
  create(@Body() dto: CreateMaterialDto): Promise<MaterialWithStockFlag> {
    return this.materialsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List materials',
    description:
      'Paginated catalogue. Pass lowStock=true to restrict the list to ' +
      'materials at or below their minimum stock.',
  })
  @ApiOkResponse({
    description: 'A page of materials',
    type: PaginatedMaterialsEntity,
  })
  findAll(
    @Query() query: QueryMaterialsDto,
  ): Promise<PaginatedResponseDto<MaterialWithStockFlag>> {
    return this.materialsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single material' })
  @ApiParam({ name: 'id', description: 'Material id (cuid)' })
  @ApiOkResponse({ description: 'The material', type: MaterialEntity })
  @ApiNotFoundResponse({ description: 'No such material' })
  findOne(@Param('id') id: string): Promise<MaterialWithStockFlag> {
    return this.materialsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a material',
    description:
      'Does not accept currentStock. Change stock only through inventory endpoints.',
  })
  @ApiParam({ name: 'id', description: 'Material id (cuid)' })
  @ApiOkResponse({ description: 'The updated material', type: MaterialEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such material' })
  @ApiConflictResponse({
    description: 'Another material already uses this code',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ): Promise<MaterialWithStockFlag> {
    return this.materialsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a material',
    description:
      'Rejected with 409 when the material already has inventory movements.',
  })
  @ApiParam({ name: 'id', description: 'Material id (cuid)' })
  @ApiNoContentResponse({ description: 'The material was deleted' })
  @ApiNotFoundResponse({ description: 'No such material' })
  @ApiConflictResponse({
    description: 'The material has inventory movements and cannot be deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.materialsService.remove(id);
  }
}
