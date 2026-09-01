import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Material,
  Prisma,
  ProjectStatus,
  TransactionType,
} from '@prisma/client';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from '../common/dto/paginated-response.dto';
import {
  MaterialsService,
  MaterialWithStockFlag,
} from '../materials/materials.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import {
  QueryTransactionsDto,
  TransactionSortOrder,
} from './dto/query-transactions.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';

const LOW_STOCK_WARNING =
  'Current stock is at or below the minimum stock level';

const transactionInclude = {
  material: {
    select: { id: true, name: true, code: true, unit: true },
  },
  project: {
    select: { id: true, name: true, code: true, status: true },
  },
} satisfies Prisma.InventoryTransactionInclude;

type TransactionWithRelations = Prisma.InventoryTransactionGetPayload<{
  include: typeof transactionInclude;
}>;

export type StockMovementResult = {
  transaction: TransactionWithRelations;
  material: MaterialWithStockFlag;
  warning: string | null;
};

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly materialsService: MaterialsService,
    private readonly projectsService: ProjectsService,
  ) {}

  async stockIn(dto: StockInDto): Promise<StockMovementResult> {
    if (dto.projectId) {
      const project = await this.projectsService.findActiveOrFail(
        dto.projectId,
      );
      if (project.status === ProjectStatus.PLANNED) {
        throw new BadRequestException(
          'Cannot link material receipts to a PLANNED project. Project must be ONGOING.',
        );
      }
      if (project.status === ProjectStatus.COMPLETED) {
        throw new BadRequestException(
          'Cannot link material receipts to a COMPLETED project.',
        );
      }
    }

    await this.materialsService.findOrFail(dto.materialId);

    const quantity = new Prisma.Decimal(dto.quantity);

    const { transaction, material } = await this.prisma.$transaction(
      async (tx) => {
        const updated = await tx.material.update({
          where: { id: dto.materialId },
          data: { currentStock: { increment: quantity } },
        });

        const created = await tx.inventoryTransaction.create({
          data: {
            materialId: dto.materialId,
            projectId: dto.projectId ?? null,
            type: TransactionType.STOCK_IN,
            quantity,
            date: dto.date,
            reference: dto.reference,
            notes: dto.notes ?? null,
          },
          include: transactionInclude,
        });

        return { transaction: created, material: updated };
      },
    );

    return this.toMovementResult(transaction, material);
  }

  async stockOut(dto: StockOutDto): Promise<StockMovementResult> {
    const project = await this.projectsService.findActiveOrFail(dto.projectId);

    // Business Rule: Materials can only be issued to ONGOING / active construction sites
    if (project.status === ProjectStatus.PLANNED) {
      throw new BadRequestException(
        'Cannot allocate materials to a PLANNED project. The project must be ONGOING (in progress) to receive site materials.',
      );
    }

    if (project.status === ProjectStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot allocate materials to a COMPLETED project. The project is already finalized.',
      );
    }

    const quantity = new Prisma.Decimal(dto.quantity);

    const { transaction, material } = await this.prisma.$transaction(
      async (tx) => {
        const decremented = await tx.material.updateMany({
          where: {
            id: dto.materialId,
            currentStock: { gte: quantity },
          },
          data: { currentStock: { decrement: quantity } },
        });

        if (decremented.count === 0) {
          const existing = await tx.material.findUnique({
            where: { id: dto.materialId },
          });

          if (!existing) {
            throw new NotFoundException(
              `Material with id "${dto.materialId}" was not found`,
            );
          }

          throw new UnprocessableEntityException({
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: `Requested quantity (${quantity.toString()}) exceeds available stock (${existing.currentStock.toString()}).`,
            availableStock: existing.currentStock.toNumber(),
            requestedQuantity: quantity.toNumber(),
          });
        }

        const updated = await tx.material.findUniqueOrThrow({
          where: { id: dto.materialId },
        });

        const created = await tx.inventoryTransaction.create({
          data: {
            materialId: dto.materialId,
            projectId: dto.projectId,
            type: TransactionType.STOCK_OUT,
            quantity,
            date: dto.date,
            reference: dto.reference,
            notes: dto.notes ?? null,
          },
          include: transactionInclude,
        });

        return { transaction: created, material: updated };
      },
    );

    return this.toMovementResult(transaction, material);
  }

  async findTransactions(
    query: QueryTransactionsDto,
  ): Promise<PaginatedResponseDto<TransactionWithRelations>> {
    const { page, limit, type, materialId, projectId, dateFrom, dateTo } =
      query;
    const sortOrder = query.sortOrder ?? TransactionSortOrder.DESC;

    const dateFilter: Prisma.DateTimeFilter | undefined =
      dateFrom || dateTo
        ? {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          }
        : undefined;

    const where: Prisma.InventoryTransactionWhereInput = {
      ...(type ? { type } : {}),
      ...(materialId ? { materialId } : {}),
      ...(projectId ? { projectId } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventoryTransaction.findMany({
        where,
        include: transactionInclude,
        orderBy: [{ date: sortOrder }, { createdAt: sortOrder }],
        skip: query.skip,
        take: limit,
      }),
      this.prisma.inventoryTransaction.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  private toMovementResult(
    transaction: TransactionWithRelations,
    material: Material,
  ): StockMovementResult {
    const flagged = MaterialsService.withFlag(material);

    return {
      transaction,
      material: flagged,
      warning: flagged.isLowStock ? LOW_STOCK_WARNING : null,
    };
  }
}
