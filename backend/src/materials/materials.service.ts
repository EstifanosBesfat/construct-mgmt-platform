import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Material, Prisma } from '@prisma/client';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import {
  MaterialSortField,
  MaterialSortOrder,
  QueryMaterialsDto,
} from './dto/query-materials.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

export type MaterialWithStockFlag = Material & { isLowStock: boolean };

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  static isLowStock(material: Material): boolean {
    return material.currentStock.lte(material.minimumStock);
  }

  static withFlag(material: Material): MaterialWithStockFlag {
    return { ...material, isLowStock: MaterialsService.isLowStock(material) };
  }

  async create(dto: CreateMaterialDto): Promise<MaterialWithStockFlag> {
    const material = await this.prisma.material.create({
      data: {
        name: dto.name,
        code: dto.code,
        unit: dto.unit,
        ...(dto.minimumStock !== undefined
          ? { minimumStock: new Prisma.Decimal(dto.minimumStock) }
          : {}),
      },
    });

    return MaterialsService.withFlag(material);
  }

  async findAll(
    query: QueryMaterialsDto,
  ): Promise<PaginatedResponseDto<MaterialWithStockFlag>> {
    const { page, limit, search, lowStock } = query;
    const sortBy = query.sortBy ?? MaterialSortField.CREATED_AT;
    const sortOrder = query.sortOrder ?? MaterialSortOrder.DESC;

    const where: Prisma.MaterialWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    // Prisma cannot compare two columns in a typed `where`, so the low-stock
    // filter is applied as an id IN (...) against a small raw query.
    if (lowStock === true) {
      const rows = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Material" WHERE "currentStock" <= "minimumStock"
      `;
      where.id = { in: rows.map((row) => row.id) };
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.material.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: query.skip,
        take: limit,
      }),
      this.prisma.material.count({ where }),
    ]);

    return buildPaginatedResponse(
      rows.map((row) => MaterialsService.withFlag(row)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<MaterialWithStockFlag> {
    const material = await this.findOrFail(id);
    return MaterialsService.withFlag(material);
  }

  async update(
    id: string,
    dto: UpdateMaterialDto,
  ): Promise<MaterialWithStockFlag> {
    await this.findOrFail(id);

    const material = await this.prisma.material.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.minimumStock !== undefined
          ? { minimumStock: new Prisma.Decimal(dto.minimumStock) }
          : {}),
      },
    });

    return MaterialsService.withFlag(material);
  }

  async remove(id: string): Promise<void> {
    await this.findOrFail(id);

    const movementCount = await this.prisma.inventoryTransaction.count({
      where: { materialId: id },
    });

    if (movementCount > 0) {
      throw new ConflictException(
        'This material has inventory movements and cannot be deleted',
      );
    }

    await this.prisma.material.delete({ where: { id } });
  }

  async findOrFail(id: string): Promise<Material> {
    const material = await this.prisma.material.findUnique({ where: { id } });

    if (!material) {
      throw new NotFoundException(`Material with id "${id}" was not found`);
    }

    return material;
  }
}
