import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
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

/**
 * A project row enriched with the aggregates the detail view needs. Decimal
 * columns stay as Prisma Decimals here; DecimalSerializerInterceptor converts
 * them to numbers on the way out.
 */
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
    // A duplicate `code` surfaces as Prisma error P2002, which
    // PrismaExceptionFilter turns into HTTP 409. Note that soft-deleted
    // projects still hold their code, since the unique index cannot ignore
    // them.
    return this.prisma.project.create({
      data: {
        name: dto.name,
        code: dto.code,
        clientName: dto.clientName,
        location: dto.location,
        startDate: dto.startDate,
        endDate: dto.endDate,
        budget: new Prisma.Decimal(dto.budget),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async findAll(query: QueryProjectsDto): Promise<PaginatedResponseDto<Project>> {
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
              { clientName: { contains: search, mode: 'insensitive' as const } },
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
        // "Latest" means the most recent progress date. createdAt breaks ties
        // when several records share one date.
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

    // UpdateProjectDto only sees the fields present in the request, so the
    // date ordering rule is re-checked here against the stored values.
    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException('endDate must be after startDate');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.clientName !== undefined
          ? { clientName: dto.clientName }
          : {}),
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
   * Soft delete. The row is retained so that inventory transactions and audit
   * entries referencing this project keep their context.
   */
  async remove(id: string): Promise<void> {
    await this.findActiveOrFail(id);

    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Shared by the BOQ, progress and inventory modules so that they never
   * attach records to a missing or soft-deleted project.
   */
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
