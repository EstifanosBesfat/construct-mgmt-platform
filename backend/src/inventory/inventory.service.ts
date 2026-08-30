import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Material, Prisma, TransactionType } from '@prisma/client';
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
    select: { id: true, name: true, code: true },
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
      await this.projectsService.findActiveOrFail(dto.projectId);
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
    await this.projectsService.findActiveOrFail(dto.projectId);

    const quantity = new Prisma.Decimal(dto.quantity);

    const { transaction, material } = await this.prisma.$transaction(
      async (tx) => {
        // Decrement only when currentStock is sufficient. The gte predicate
        // makes concurrent stock-outs race-safe: the second writer sees 0
        // rows updated and falls through to the 422 path.
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
            message: `Stock out of ${quantity.toString()} exceeds available stock of ${existing.currentStock.toString()}`,
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
