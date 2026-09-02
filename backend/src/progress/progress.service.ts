import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
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
  select: { id: true, name: true, code: true, status: true },
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
    const project = await this.projectsService.findActiveOrFail(dto.projectId);

    // Cannot log milestone on completed projects
    if (project.status === ProjectStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot log milestone progress on a COMPLETED project. The project is already finalized.',
      );
    }

    // Progress percentage cannot go backwards
    const latestProgress = await this.prisma.progressRecord.findFirst({
      where: { projectId: dto.projectId },
      orderBy: [{ percentage: 'desc' }, { date: 'desc' }],
    });

    const newPercentage = Number(dto.percentage);
    if (latestProgress && newPercentage < Number(latestProgress.percentage)) {
      throw new BadRequestException(
        `Progress percentage cannot decrease. New milestone (${newPercentage}%) cannot be lower than current project progress (${latestProgress.percentage}%).`,
      );
    }

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
    const project = await this.projectsService.findActiveOrFail(projectId);

    if (project.status === ProjectStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot update milestone progress on a COMPLETED project.',
      );
    }

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
    const project = await this.projectsService.findActiveOrFail(
      existing.projectId,
    );

    if (project.status === ProjectStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot delete milestone progress from a COMPLETED project.',
      );
    }

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

    await this.projectsService.findActiveOrFail(record.projectId);

    return record;
  }
}
