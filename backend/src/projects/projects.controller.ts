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
import { Project } from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  PaginatedProjectsEntity,
  ProjectDetailEntity,
  ProjectEntity,
} from './entities/project.entity';
import { ProjectDetail, ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new construction project' })
  @ApiCreatedResponse({
    description: 'The project was created',
    type: ProjectEntity,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'A project with this code already exists',
  })
  create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List projects',
    description:
      'Returns a paginated list of projects. Supports filtering by status, ' +
      'free-text search across name, code and client name, and sorting. ' +
      'Soft-deleted projects are excluded.',
  })
  @ApiOkResponse({
    description: 'A page of projects',
    type: PaginatedProjectsEntity,
  })
  findAll(
    @Query() query: QueryProjectsDto,
  ): Promise<PaginatedResponseDto<Project>> {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single project',
    description:
      'Returns the project along with its total BOQ value and the percentage ' +
      'from its most recent progress record.',
  })
  @ApiParam({ name: 'id', description: 'Project id (cuid)' })
  @ApiOkResponse({ description: 'The project', type: ProjectDetailEntity })
  @ApiNotFoundResponse({ description: 'No such project' })
  findOne(@Param('id') id: string): Promise<ProjectDetail> {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', description: 'Project id (cuid)' })
  @ApiOkResponse({ description: 'The updated project', type: ProjectEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'No such project' })
  @ApiConflictResponse({
    description: 'Another project already uses this code',
  })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Performs a soft delete. The project stops appearing in reads but its ' +
      'row is retained so related inventory transactions keep their context.',
  })
  @ApiParam({ name: 'id', description: 'Project id (cuid)' })
  @ApiNoContentResponse({ description: 'The project was deleted' })
  @ApiNotFoundResponse({ description: 'No such project' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectsService.remove(id);
  }
}
