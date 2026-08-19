import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { QueryProgressDto } from './dto/query-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

const projectSelect = {
  select: { id: true, name: true, code: true },
} satisfies Prisma.ProgressRecordInclude['project'];

const progressInclude = {
  project: projectSelect,
} satisfies Prisma.ProgressRecordInclude;

export type ProgressRecordWithProject = Prisma.ProgressRecordGetPayload<{
  include: typeof progressInclude;
}>;

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(dto: CreateProgressDto): Promise<ProgressRecordWithProject> {
    await this.projectsService.findActiveOrFail(dto.projectId);

    return this.prisma.progressRecord.create({
      data: {
        projectId: dto.projectId,
        date: dto.date,
        description: dto.description,
        percentage: new Prisma.Decimal(dto.percentage),
        notes: dto.notes ?? null,
      },
      include: progressInclude,
    });
  }

  async findAll(
    query: QueryProgressDto,
  ): Promise<PaginatedResponseDto<ProgressRecordWithProject>> {
    const { page, limit, projectId } = query;

    if (projectId) {
      await this.projectsService.findActiveOrFail(projectId);
    }

    const where: Prisma.ProgressRecordWhereInput = projectId
      ? { projectId }
      : { project: { deletedAt: null } };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.progressRecord.findMany({
        where,
        include: progressInclude,
        // Plan: return records ordered by date DESC. createdAt breaks ties
        // when several records share one date, matching GET /projects/:id.
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: query.skip,
        take: limit,
      }),
      this.prisma.progressRecord.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<ProgressRecordWithProject> {
    return this.findOrFail(id);
  }

  async update(
    id: string,
    dto: UpdateProgressDto,
  ): Promise<ProgressRecordWithProject> {
    const existing = await this.findOrFail(id);

    const projectId = dto.projectId ?? existing.projectId;
    await this.projectsService.findActiveOrFail(projectId);

    return this.prisma.progressRecord.update({
      where: { id },
      data: {
        ...(dto.projectId !== undefined ? { projectId: dto.projectId } : {}),
        ...(dto.date !== undefined ? { date: dto.date } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.percentage !== undefined
          ? { percentage: new Prisma.Decimal(dto.percentage) }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: progressInclude,
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOrFail(id);
    await this.projectsService.findActiveOrFail(existing.projectId);

    await this.prisma.progressRecord.delete({ where: { id } });
  }

  private async findOrFail(id: string): Promise<ProgressRecordWithProject> {
    const record = await this.prisma.progressRecord.findUnique({
      where: { id },
      include: progressInclude,
    });

    if (!record) {
      throw new NotFoundException(
        `Progress record with id "${id}" was not found`,
      );
    }

    // Hide records that belong to a soft-deleted project, matching every
    // other read in the API.
    await this.projectsService.findActiveOrFail(record.projectId);

    return record;
  }
}
