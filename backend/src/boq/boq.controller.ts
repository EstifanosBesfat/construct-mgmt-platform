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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BoqItem } from '@prisma/client';
import { BoqService, BoqList, BoqSummary } from './boq.service';
import { CreateBoqItemDto } from './dto/create-boq-item.dto';
import { UpdateBoqItemDto } from './dto/update-boq-item.dto';
import {
  BoqItemEntity,
  BoqListEntity,
  BoqSummaryEntity,
} from './entities/boq-item.entity';

@ApiTags('BOQ')
@Controller()
export class BoqController {
  constructor(private readonly boqService: BoqService) {}

  @Post('projects/:id/boq')
  @ApiOperation({
    summary: 'Add a BOQ item to a project',
    description:
      'The line total is computed server-side as quantity × unitPrice. ' +
      'A client-supplied total is rejected.',
  })
  @ApiParam({ name: 'id', description: 'Project id (cuid)' })
  @ApiCreatedResponse({
    description: 'The BOQ item was created',
    type: BoqItemEntity,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such project' })
  create(
    @Param('id') projectId: string,
    @Body() dto: CreateBoqItemDto,
  ): Promise<BoqItem> {
    return this.boqService.create(projectId, dto);
  }

  @Get('projects/:id/boq/summary')
  @ApiOperation({ summary: 'Get the total BOQ value for a project' })
  @ApiParam({ name: 'id', description: 'Project id (cuid)' })
  @ApiOkResponse({ description: 'BOQ totals', type: BoqSummaryEntity })
  @ApiNotFoundResponse({ description: 'No such project' })
  summarize(@Param('id') projectId: string): Promise<BoqSummary> {
    return this.boqService.summarize(projectId);
  }

  @Get('projects/:id/boq')
  @ApiOperation({
    summary: 'List BOQ items for a project',
    description:
      'Returns every item ordered by creation time, plus a summary of the ' +
      'item count and total BOQ value.',
  })
  @ApiParam({ name: 'id', description: 'Project id (cuid)' })
  @ApiOkResponse({ description: 'BOQ items and summary', type: BoqListEntity })
  @ApiNotFoundResponse({ description: 'No such project' })
  findAll(@Param('id') projectId: string): Promise<BoqList> {
    return this.boqService.findAllForProject(projectId);
  }

  @Put('boq/:id')
  @ApiOperation({
    summary: 'Update a BOQ item',
    description:
      'If quantity or unitPrice changes, the line total is recomputed.',
  })
  @ApiParam({ name: 'id', description: 'BOQ item id (cuid)' })
  @ApiOkResponse({ description: 'The updated BOQ item', type: BoqItemEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such BOQ item or project' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBoqItemDto,
  ): Promise<BoqItem> {
    return this.boqService.update(id, dto);
  }

  @Delete('boq/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a BOQ item' })
  @ApiParam({ name: 'id', description: 'BOQ item id (cuid)' })
  @ApiNoContentResponse({ description: 'The BOQ item was deleted' })
  @ApiNotFoundResponse({ description: 'No such BOQ item or project' })
  remove(@Param('id') id: string): Promise<void> {
    return this.boqService.remove(id);
  }
}
