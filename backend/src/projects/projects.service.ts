import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Project, ProjectStatus } from '@prisma/client';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import {
  ProjectSortField,
  QueryProjectsDto,
  SortOrder,
} from './dto/query-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

export type ProjectDetail = Project & {
  boqValue: Prisma.Decimal;
  boqItemCount: number;
  latestProgressPercentage: Prisma.Decimal | null;
  latestProgressDate: Date | null;
  progressRecordCount: number;
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    // New projects can only start as PLANNED or ONGOING
    if (dto.status === ProjectStatus.COMPLETED) {
      throw new BadRequestException(
        'New projects cannot be created with COMPLETED status. Please select PLANNED or ONGOING.',
      );
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        code: dto.code,
        clientName: dto.clientName,
        location: dto.location,
        startDate: dto.startDate,
        endDate: dto.endDate,
        budget: new Prisma.Decimal(dto.budget),
        status: dto.status ?? ProjectStatus.PLANNED,
      },
    });
  }

  async findAll(
    query: QueryProjectsDto,
  ): Promise<PaginatedResponseDto<Project>> {
    const { page, limit, status, search } = query;
    const sortBy = query.sortBy ?? ProjectSortField.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              {
                clientName: { contains: search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: query.skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<ProjectDetail> {
    const project = await this.findActiveOrFail(id);

    const [boqAggregate, latestProgress, progressRecordCount] =
      await Promise.all([
        this.prisma.boqItem.aggregate({
          where: { projectId: id },
          _sum: { total: true },
          _count: true,
        }),
        this.prisma.progressRecord.findFirst({
          where: { projectId: id },
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        }),
        this.prisma.progressRecord.count({ where: { projectId: id } }),
      ]);

    return {
      ...project,
      boqValue: boqAggregate._sum.total ?? new Prisma.Decimal(0),
      boqItemCount: boqAggregate._count,
      latestProgressPercentage: latestProgress?.percentage ?? null,
      latestProgressDate: latestProgress?.date ?? null,
      progressRecordCount,
    };
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const existing = await this.findActiveOrFail(id);

    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException('endDate must be after startDate');
    }

    // Forward-only status progression rule
    if (dto.status && dto.status !== existing.status) {
      const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
        PLANNED: [
          ProjectStatus.PLANNED,
          ProjectStatus.ONGOING,
          ProjectStatus.COMPLETED,
        ],
        ONGOING: [ProjectStatus.ONGOING, ProjectStatus.COMPLETED],
        COMPLETED: [ProjectStatus.COMPLETED],
      };

      if (!validTransitions[existing.status].includes(dto.status)) {
        throw new BadRequestException(
          `Cannot change project status backwards from ${existing.status} to ${dto.status}. Status can only progress forward (Planned → Ongoing → Completed).`,
        );
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.clientName !== undefined ? { clientName: dto.clientName } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
        ...(dto.budget !== undefined
          ? { budget: new Prisma.Decimal(dto.budget) }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  /**
   * Soft delete and free up the project code so it can be safely reused.
   */
  async remove(id: string): Promise<void> {
    const existing = await this.findActiveOrFail(id);

    await this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        code: `${existing.code}_deleted_${Date.now()}`, // Frees up unique code constraint
      },
    });
  }

  async findActiveOrFail(id: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" was not found`);
    }

    return project;
  }
}
