import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, TransactionType } from '@prisma/client';
import { MaterialsService } from '../materials/materials.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { InventoryService } from './inventory.service';

const materialRow = (stock: number) => ({
  id: 'mat-1',
  name: 'Portland Cement 42.5N',
  code: 'MAT-001',
  unit: 'bag',
  currentStock: new Prisma.Decimal(stock),
  minimumStock: new Prisma.Decimal(500),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

describe('InventoryService', () => {
  let service: InventoryService;

  const prisma = {
    $transaction: jest.fn(),
  };

  const materialsService = {
    findOrFail: jest.fn(),
  };

  const projectsService = {
    findActiveOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
        { provide: MaterialsService, useValue: materialsService },
        { provide: ProjectsService, useValue: projectsService },
      ],
    }).compile();

    service = module.get(InventoryService);
    jest.clearAllMocks();
    materialsService.findOrFail.mockResolvedValue(materialRow(1000));
    projectsService.findActiveOrFail.mockResolvedValue({ id: 'proj-1' });
  });

  it('increases current stock on stock-in and writes a transaction', async () => {
    const dto: StockInDto = {
      materialId: 'mat-1',
      quantity: 800,
      date: new Date('2026-08-21T00:00:00.000Z'),
      reference: 'GRN-9001',
    };

    const tx = {
      material: {
        update: jest.fn().mockResolvedValue(materialRow(1800)),
      },
      inventoryTransaction: {
        create: jest.fn().mockResolvedValue({
          id: 'txn-in',
          type: TransactionType.STOCK_IN,
          quantity: new Prisma.Decimal(800),
          material: { id: 'mat-1', name: 'Portland Cement 42.5N', code: 'MAT-001', unit: 'bag' },
          project: null,
        }),
      },
    };

    prisma.$transaction.mockImplementation(async (fn: (client: typeof tx) => Promise<unknown>) =>
      fn(tx),
    );

    const result = await service.stockIn(dto);

    expect(tx.material.update).toHaveBeenCalledWith({
      where: { id: 'mat-1' },
      data: { currentStock: { increment: new Prisma.Decimal(800) } },
    });
    expect(tx.inventoryTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          materialId: 'mat-1',
          type: TransactionType.STOCK_IN,
          quantity: new Prisma.Decimal(800),
        }),
      }),
    );
    expect(result.material.currentStock.toNumber()).toBe(1800);
    expect(result.transaction.type).toBe(TransactionType.STOCK_IN);
  });

  it('decreases current stock on stock-out and writes a transaction', async () => {
    const dto: StockOutDto = {
      materialId: 'mat-1',
      projectId: 'proj-1',
      quantity: 10,
      date: new Date('2026-08-21T00:00:00.000Z'),
      reference: 'ISS-9001',
    };

    const tx = {
      material: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(materialRow(990)),
      },
      inventoryTransaction: {
        create: jest.fn().mockResolvedValue({
          id: 'txn-out',
          type: TransactionType.STOCK_OUT,
          quantity: new Prisma.Decimal(10),
          material: { id: 'mat-1', name: 'Portland Cement 42.5N', code: 'MAT-001', unit: 'bag' },
          project: { id: 'proj-1', name: 'Riverside', code: 'PRJ-001' },
        }),
      },
    };

    prisma.$transaction.mockImplementation(async (fn: (client: typeof tx) => Promise<unknown>) =>
      fn(tx),
    );

    const result = await service.stockOut(dto);

    expect(tx.material.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'mat-1',
        currentStock: { gte: new Prisma.Decimal(10) },
      },
      data: { currentStock: { decrement: new Prisma.Decimal(10) } },
    });
    expect(result.material.currentStock.toNumber()).toBe(990);
    expect(result.transaction.type).toBe(TransactionType.STOCK_OUT);
  });

  it('rejects stock-out when quantity exceeds available stock with HTTP 422', async () => {
    const dto: StockOutDto = {
      materialId: 'mat-1',
      projectId: 'proj-1',
      quantity: 999_999,
      date: new Date('2026-08-21T00:00:00.000Z'),
      reference: 'ISS-9999',
    };

    const tx = {
      material: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue(materialRow(150)),
      },
      inventoryTransaction: {
        create: jest.fn(),
      },
    };

    prisma.$transaction.mockImplementation(async (fn: (client: typeof tx) => Promise<unknown>) =>
      fn(tx),
    );

    await expect(service.stockOut(dto)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(tx.inventoryTransaction.create).not.toHaveBeenCalled();
  });
});
