import { Injectable, NotFoundException } from '@nestjs/common';
import { BoqItem, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateBoqItemDto } from './dto/create-boq-item.dto';
import { UpdateBoqItemDto } from './dto/update-boq-item.dto';

export type BoqSummary = {
  projectId: string;
  itemCount: number;
  totalValue: Prisma.Decimal;
};

export type BoqList = {
  data: BoqItem[];
  summary: BoqSummary;
};

@Injectable()
export class BoqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Line total is always derived. Decimal.js `toDecimalPlaces(2)` uses
   * ROUND_HALF_UP, matching the `Decimal(15, 2)` column.
   */
  static computeTotal(
    quantity: Prisma.Decimal | number,
    unitPrice: Prisma.Decimal | number,
  ): Prisma.Decimal {
    return new Prisma.Decimal(quantity)
      .mul(new Prisma.Decimal(unitPrice))
      .toDecimalPlaces(2);
  }

  async create(projectId: string, dto: CreateBoqItemDto): Promise<BoqItem> {
    await this.projectsService.findActiveOrFail(projectId);

    return this.prisma.boqItem.create({
      data: {
        projectId,
        description: dto.description,
        unit: dto.unit,
        quantity: new Prisma.Decimal(dto.quantity),
        unitPrice: new Prisma.Decimal(dto.unitPrice),
        total: BoqService.computeTotal(dto.quantity, dto.unitPrice),
      },
    });
  }

  async findAllForProject(projectId: string): Promise<BoqList> {
    await this.projectsService.findActiveOrFail(projectId);

    const data = await this.prisma.boqItem.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      data,
      summary: this.buildSummary(projectId, data),
    };
  }

  async summarize(projectId: string): Promise<BoqSummary> {
    await this.projectsService.findActiveOrFail(projectId);

    const aggregate = await this.prisma.boqItem.aggregate({
      where: { projectId },
      _sum: { total: true },
      _count: true,
    });

    return {
      projectId,
      itemCount: aggregate._count,
      totalValue: aggregate._sum.total ?? new Prisma.Decimal(0),
    };
  }

  async update(id: string, dto: UpdateBoqItemDto): Promise<BoqItem> {
    const existing = await this.findOrFail(id);
    await this.projectsService.findActiveOrFail(existing.projectId);

    const quantity =
      dto.quantity !== undefined
        ? new Prisma.Decimal(dto.quantity)
        : existing.quantity;
    const unitPrice =
      dto.unitPrice !== undefined
        ? new Prisma.Decimal(dto.unitPrice)
        : existing.unitPrice;

    return this.prisma.boqItem.update({
      where: { id },
      data: {
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.quantity !== undefined ? { quantity } : {}),
        ...(dto.unitPrice !== undefined ? { unitPrice } : {}),
        total: BoqService.computeTotal(quantity, unitPrice),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOrFail(id);
    await this.projectsService.findActiveOrFail(existing.projectId);

    await this.prisma.boqItem.delete({ where: { id } });
  }

  private async findOrFail(id: string): Promise<BoqItem> {
    const item = await this.prisma.boqItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException(`BOQ item with id "${id}" was not found`);
    }

    return item;
  }

  private buildSummary(projectId: string, items: BoqItem[]): BoqSummary {
    const totalValue = items.reduce(
      (sum, item) => sum.add(item.total),
      new Prisma.Decimal(0),
    );

    return {
      projectId,
      itemCount: items.length,
      totalValue,
    };
  }
}
