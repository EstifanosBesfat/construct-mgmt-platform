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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { QueryProgressDto } from './dto/query-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import {
  PaginatedProgressEntity,
  ProgressRecordEntity,
} from './entities/progress-record.entity';
import { ProgressService, ProgressRecordWithProject } from './progress.service';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Record project progress' })
  @ApiCreatedResponse({
    description: 'The progress record was created',
    type: ProgressRecordEntity,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such project' })
  create(@Body() dto: CreateProgressDto): Promise<ProgressRecordWithProject> {
    return this.progressService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List progress records',
    description:
      'Returns records ordered by date descending. Pass projectId to ' +
      'restrict the list to one project.',
  })
  @ApiOkResponse({
    description: 'A page of progress records',
    type: PaginatedProgressEntity,
  })
  @ApiNotFoundResponse({
    description: 'No such project (only when projectId is supplied)',
  })
  findAll(
    @Query() query: QueryProgressDto,
  ): Promise<PaginatedResponseDto<ProgressRecordWithProject>> {
    return this.progressService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single progress record' })
  @ApiParam({ name: 'id', description: 'Progress record id (cuid)' })
  @ApiOkResponse({ description: 'The progress record', type: ProgressRecordEntity })
  @ApiNotFoundResponse({ description: 'No such progress record' })
  findOne(@Param('id') id: string): Promise<ProgressRecordWithProject> {
    return this.progressService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a progress record' })
  @ApiParam({ name: 'id', description: 'Progress record id (cuid)' })
  @ApiOkResponse({
    description: 'The updated progress record',
    type: ProgressRecordEntity,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such progress record or project' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
  ): Promise<ProgressRecordWithProject> {
    return this.progressService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a progress record' })
  @ApiParam({ name: 'id', description: 'Progress record id (cuid)' })
  @ApiNoContentResponse({ description: 'The progress record was deleted' })
  @ApiNotFoundResponse({ description: 'No such progress record' })
  remove(@Param('id') id: string): Promise<void> {
    return this.progressService.remove(id);
  }
}
