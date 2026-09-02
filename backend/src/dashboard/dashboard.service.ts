import { Injectable } from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    // 1. Projects Breakdown
    const [totalProjects, plannedProjects, ongoingProjects, completedProjects] =
      await Promise.all([
        this.prisma.project.count({ where: { deletedAt: null } }),
        this.prisma.project.count({
          where: { deletedAt: null, status: ProjectStatus.PLANNED },
        }),
        this.prisma.project.count({
          where: { deletedAt: null, status: ProjectStatus.ONGOING },
        }),
        this.prisma.project.count({
          where: { deletedAt: null, status: ProjectStatus.COMPLETED },
        }),
      ]);

    // 2. Inventory Metrics
    const materials = await this.prisma.material.findMany({
      orderBy: { name: 'asc' },
    });

    const totalMaterials = materials.length;
    let lowStockCount = 0;
    const materialStockSummary = materials.map((m) => {
      const isLowStock = m.currentStock.lessThanOrEqualTo(m.minimumStock);
      if (isLowStock) {
        lowStockCount++;
      }
      return {
        id: m.id,
        code: m.code,
        name: m.name,
        unit: m.unit,
        currentStock: m.currentStock,
        minimumStock: m.minimumStock,
        isLowStock,
      };
    });

    // 3. Project Performance List
    const activeProjects = await this.prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        boqItems: {
          select: { total: true },
        },
        progressRecords: {
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
          take: 1,
          select: { percentage: true, date: true },
        },
      },
    });

    const projectPerformance = activeProjects.map((p) => {
      const boqValue = p.boqItems.reduce(
        (acc, item) => acc.plus(item.total),
        new Prisma.Decimal(0),
      );
      const latestProgress = p.progressRecords[0]?.percentage ?? null;

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        clientName: p.clientName,
        location: p.location,
        startDate: p.startDate,
        endDate: p.endDate,
        budget: p.budget,
        boqValue,
        latestProgress,
        status: p.status,
      };
    });

    // 4. Recent Transactions
    const recentTransactionsRaw =
      await this.prisma.inventoryTransaction.findMany({
        take: 6,
        where: {
          OR: [{ projectId: null }, { project: { deletedAt: null } }],
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          material: {
            select: { code: true, name: true, unit: true },
          },
          project: {
            select: { code: true, name: true },
          },
        },
      });

    const recentTransactions = recentTransactionsRaw.map((tx) => ({
      id: tx.id,
      materialCode: tx.material.code,
      materialName: tx.material.name,
      unit: tx.material.unit,
      projectCode: tx.project?.code ?? null,
      projectName: tx.project?.name ?? null,
      type: tx.type,
      quantity: tx.quantity,
      date: tx.date,
      reference: tx.reference,
    }));

    // 5. Recent Progress Records
    const recentProgressRaw = await this.prisma.progressRecord.findMany({
      take: 6,
      where: {
        project: { deletedAt: null },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        project: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    const recentProgress = recentProgressRaw.map((pr) => ({
      id: pr.id,
      projectId: pr.project.id,
      projectCode: pr.project.code,
      projectName: pr.project.name,
      date: pr.date,
      description: pr.description,
      percentage: pr.percentage,
      notes: pr.notes,
    }));

    return {
      projects: {
        total: totalProjects,
        planned: plannedProjects,
        ongoing: ongoingProjects,
        completed: completedProjects,
      },
      inventory: {
        totalMaterials,
        lowStockCount,
      },
      projectPerformance,
      recentTransactions,
      recentProgress,
      materialStockSummary,
    };
  }
}
