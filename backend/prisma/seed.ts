import {
  Prisma,
  PrismaClient,
  ProjectStatus,
  TransactionType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const decimal = (value: number | string): Prisma.Decimal =>
  new Prisma.Decimal(value);

const date = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

type SeedBoqItem = {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
};

type SeedProgress = {
  date: string;
  description: string;
  percentage: number;
  notes?: string;
};

type SeedProject = {
  name: string;
  code: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  boqItems: SeedBoqItem[];
  progressRecords: SeedProgress[];
};

const projects: SeedProject[] = [
  {
    name: 'Riverside Office Complex',
    code: 'PRJ-001',
    clientName: 'Addis Holdings PLC',
    location: 'Bole, Addis Ababa',
    startDate: '2026-01-15',
    endDate: '2026-11-30',
    budget: 48_500_000,
    status: ProjectStatus.ONGOING,
    boqItems: [
      {
        description: 'Site clearing and excavation',
        unit: 'm3',
        quantity: 2400,
        unitPrice: 320.5,
      },
      {
        description: 'Reinforced concrete foundation',
        unit: 'm3',
        quantity: 860,
        unitPrice: 4850,
      },
      {
        description: 'Structural steel columns',
        unit: 'ton',
        quantity: 145.5,
        unitPrice: 92000,
      },
      {
        description: 'Hollow block masonry walls',
        unit: 'm2',
        quantity: 3200,
        unitPrice: 640,
      },
      {
        description: 'Aluminium curtain wall glazing',
        unit: 'm2',
        quantity: 1150,
        unitPrice: 5400,
      },
    ],
    progressRecords: [
      {
        date: '2026-02-28',
        description: 'Site clearing and excavation completed',
        percentage: 12,
        notes: 'Two weeks ahead of the baseline programme.',
      },
      {
        date: '2026-04-30',
        description: 'Foundation and ground beams poured',
        percentage: 34,
      },
      {
        date: '2026-06-30',
        description: 'Structural frame up to fourth floor',
        percentage: 58,
        notes: 'Steel delivery delay recovered with weekend shifts.',
      },
      {
        date: '2026-08-15',
        description: 'Masonry and first-fix services in progress',
        percentage: 71,
      },
    ],
  },
  {
    name: 'Meskel Square Retail Center',
    code: 'PRJ-002',
    clientName: 'Horizon Retail Group',
    location: 'Kirkos, Addis Ababa',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    budget: 32_750_000,
    status: ProjectStatus.ONGOING,
    boqItems: [
      {
        description: 'Bulk earthworks',
        unit: 'm3',
        quantity: 1800,
        unitPrice: 295,
      },
      {
        description: 'Reinforced concrete slab on grade',
        unit: 'm2',
        quantity: 2600,
        unitPrice: 1850,
      },
      {
        description: 'Precast concrete facade panels',
        unit: 'm2',
        quantity: 940,
        unitPrice: 3200,
      },
      {
        description: 'Electrical rough-in and distribution',
        unit: 'lot',
        quantity: 1,
        unitPrice: 2_450_000,
      },
    ],
    progressRecords: [
      {
        date: '2026-04-15',
        description: 'Earthworks and site setup complete',
        percentage: 9,
      },
      {
        date: '2026-06-15',
        description: 'Ground floor slab cast',
        percentage: 26,
      },
      {
        date: '2026-08-10',
        description: 'Precast panel erection started',
        percentage: 41,
        notes: 'Awaiting client sign-off on facade colour.',
      },
    ],
  },
  {
    name: 'Hawassa Industrial Warehouse',
    code: 'PRJ-003',
    clientName: 'Rift Valley Logistics',
    location: 'Hawassa, Sidama',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    budget: 21_200_000,
    status: ProjectStatus.COMPLETED,
    boqItems: [
      {
        description: 'Site grading and compaction',
        unit: 'm2',
        quantity: 6500,
        unitPrice: 180,
      },
      {
        description: 'Steel portal frame structure',
        unit: 'ton',
        quantity: 210,
        unitPrice: 88500,
      },
      {
        description: 'Insulated roof sheeting',
        unit: 'm2',
        quantity: 5800,
        unitPrice: 720,
      },
    ],
    progressRecords: [
      {
        date: '2025-11-30',
        description: 'Groundworks and foundations complete',
        percentage: 28,
      },
      {
        date: '2026-02-28',
        description: 'Portal frame erected and roof sheeted',
        percentage: 74,
      },
      {
        date: '2026-06-25',
        description: 'Snagging complete and handed over to client',
        percentage: 100,
        notes: 'Practical completion certificate issued.',
      },
    ],
  },
  {
    name: 'Bahir Dar Lakeside Hotel',
    code: 'PRJ-004',
    clientName: 'Blue Nile Hospitality',
    location: 'Bahir Dar, Amhara',
    startDate: '2026-09-01',
    endDate: '2027-12-20',
    budget: 76_400_000,
    status: ProjectStatus.PLANNED,
    boqItems: [
      {
        description: 'Piled foundations',
        unit: 'm',
        quantity: 1450,
        unitPrice: 6200,
      },
      {
        description: 'Reinforced concrete superstructure',
        unit: 'm3',
        quantity: 2100,
        unitPrice: 5100,
      },
    ],
    progressRecords: [],
  },
  {
    name: 'Adama Ring Road Bridge',
    code: 'PRJ-005',
    clientName: 'Oromia Roads Authority',
    location: 'Adama, Oromia',
    startDate: '2026-05-10',
    endDate: '2027-05-09',
    budget: 54_900_000,
    status: ProjectStatus.ONGOING,
    boqItems: [
      {
        description: 'Bored pile foundations',
        unit: 'm',
        quantity: 980,
        unitPrice: 7400,
      },
      {
        description: 'Pier columns and pile caps',
        unit: 'm3',
        quantity: 640,
        unitPrice: 5600,
      },
      {
        description: 'Prestressed concrete girders',
        unit: 'no',
        quantity: 48,
        unitPrice: 285000,
      },
      {
        description: 'Bridge deck and parapets',
        unit: 'm2',
        quantity: 1850,
        unitPrice: 3950,
      },
    ],
    progressRecords: [
      {
        date: '2026-07-01',
        description: 'Pile foundations 60% complete',
        percentage: 18,
      },
      {
        date: '2026-08-12',
        description: 'Pile caps cast on the eastern approach',
        percentage: 27,
      },
    ],
  },
];

type SeedMaterial = {
  name: string;
  code: string;
  unit: string;
  minimumStock: number;
  openingStock: number;
};

const materials: SeedMaterial[] = [
  { name: 'Portland Cement 42.5N', code: 'MAT-001', unit: 'bag', minimumStock: 500, openingStock: 2400 },
  { name: 'Reinforcement Bar 12mm', code: 'MAT-002', unit: 'ton', minimumStock: 10, openingStock: 46.5 },
  { name: 'Reinforcement Bar 16mm', code: 'MAT-003', unit: 'ton', minimumStock: 8, openingStock: 31.25 },
  { name: 'Washed River Sand', code: 'MAT-004', unit: 'm3', minimumStock: 120, openingStock: 640 },
  { name: 'Crushed Aggregate 20mm', code: 'MAT-005', unit: 'm3', minimumStock: 150, openingStock: 820 },
  { name: 'Hollow Concrete Block 200mm', code: 'MAT-006', unit: 'no', minimumStock: 2000, openingStock: 9500 },
  { name: 'Structural Steel Section', code: 'MAT-007', unit: 'ton', minimumStock: 15, openingStock: 62 },
  { name: 'Timber Formwork Plywood', code: 'MAT-008', unit: 'sheet', minimumStock: 200, openingStock: 780 },
  { name: 'Bitumen Waterproof Membrane', code: 'MAT-009', unit: 'roll', minimumStock: 40, openingStock: 150 },
  { name: 'PVC Conduit 25mm', code: 'MAT-010', unit: 'm', minimumStock: 1000, openingStock: 4200 },
];

/**
 * Stock movements applied after the opening stock-in. Written so that a few
 * materials finish below their minimum, which gives the dashboard's low-stock
 * count something real to report.
 */
type SeedMovement = {
  materialCode: string;
  projectCode: string | null;
  type: TransactionType;
  quantity: number;
  date: string;
  reference: string;
  notes?: string;
};

const movements: SeedMovement[] = [
  { materialCode: 'MAT-001', projectCode: 'PRJ-001', type: TransactionType.STOCK_OUT, quantity: 1200, date: '2026-03-04', reference: 'ISS-1001', notes: 'Foundation pour, block A' },
  { materialCode: 'MAT-001', projectCode: 'PRJ-002', type: TransactionType.STOCK_OUT, quantity: 760, date: '2026-06-18', reference: 'ISS-1002' },
  { materialCode: 'MAT-001', projectCode: null, type: TransactionType.STOCK_IN, quantity: 800, date: '2026-07-02', reference: 'GRN-2001', notes: 'Replenishment from Derba Cement' },
  { materialCode: 'MAT-002', projectCode: 'PRJ-001', type: TransactionType.STOCK_OUT, quantity: 18.75, date: '2026-04-11', reference: 'ISS-1003' },
  { materialCode: 'MAT-002', projectCode: 'PRJ-005', type: TransactionType.STOCK_OUT, quantity: 21.5, date: '2026-07-20', reference: 'ISS-1004', notes: 'Pile cages' },
  { materialCode: 'MAT-003', projectCode: 'PRJ-005', type: TransactionType.STOCK_OUT, quantity: 24.5, date: '2026-07-28', reference: 'ISS-1005' },
  { materialCode: 'MAT-004', projectCode: 'PRJ-001', type: TransactionType.STOCK_OUT, quantity: 310, date: '2026-05-06', reference: 'ISS-1006' },
  { materialCode: 'MAT-004', projectCode: 'PRJ-002', type: TransactionType.STOCK_OUT, quantity: 225, date: '2026-07-14', reference: 'ISS-1007' },
  { materialCode: 'MAT-005', projectCode: 'PRJ-005', type: TransactionType.STOCK_OUT, quantity: 480, date: '2026-06-30', reference: 'ISS-1008' },
  { materialCode: 'MAT-005', projectCode: null, type: TransactionType.STOCK_IN, quantity: 300, date: '2026-08-01', reference: 'GRN-2002' },
  { materialCode: 'MAT-006', projectCode: 'PRJ-001', type: TransactionType.STOCK_OUT, quantity: 6200, date: '2026-08-05', reference: 'ISS-1009', notes: 'Internal partition walls' },
  { materialCode: 'MAT-007', projectCode: 'PRJ-001', type: TransactionType.STOCK_OUT, quantity: 38, date: '2026-06-22', reference: 'ISS-1010' },
  { materialCode: 'MAT-008', projectCode: 'PRJ-002', type: TransactionType.STOCK_OUT, quantity: 640, date: '2026-07-09', reference: 'ISS-1011', notes: 'Slab formwork' },
  { materialCode: 'MAT-009', projectCode: 'PRJ-003', type: TransactionType.STOCK_OUT, quantity: 118, date: '2026-02-17', reference: 'ISS-1012' },
  { materialCode: 'MAT-010', projectCode: 'PRJ-002', type: TransactionType.STOCK_OUT, quantity: 1800, date: '2026-08-08', reference: 'ISS-1013' },
];

async function main(): Promise<void> {
  console.log('Clearing existing data...');

  // Ordered child-first so that foreign keys are never left dangling.
  await prisma.auditLog.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.progressRecord.deleteMany();
  await prisma.boqItem.deleteMany();
  await prisma.material.deleteMany();
  await prisma.project.deleteMany();

  console.log('Seeding projects, BOQ items and progress records...');

  const projectIdByCode = new Map<string, string>();

  for (const seed of projects) {
    const project = await prisma.project.create({
      data: {
        name: seed.name,
        code: seed.code,
        clientName: seed.clientName,
        location: seed.location,
        startDate: date(seed.startDate),
        endDate: date(seed.endDate),
        budget: decimal(seed.budget),
        status: seed.status,
        boqItems: {
          create: seed.boqItems.map((item) => ({
            description: item.description,
            unit: item.unit,
            quantity: decimal(item.quantity),
            unitPrice: decimal(item.unitPrice),
            // Mirrors the server-side rule: total is derived, never supplied.
            total: decimal(item.quantity).mul(decimal(item.unitPrice)),
          })),
        },
        progressRecords: {
          create: seed.progressRecords.map((record) => ({
            date: date(record.date),
            description: record.description,
            percentage: decimal(record.percentage),
            notes: record.notes ?? null,
          })),
        },
      },
    });

    projectIdByCode.set(seed.code, project.id);
  }

  console.log('Seeding materials with opening stock...');

  const materialIdByCode = new Map<string, string>();

  for (const seed of materials) {
    const material = await prisma.material.create({
      data: {
        name: seed.name,
        code: seed.code,
        unit: seed.unit,
        minimumStock: decimal(seed.minimumStock),
        currentStock: decimal(seed.openingStock),
        inventoryTransactions: {
          create: {
            type: TransactionType.STOCK_IN,
            quantity: decimal(seed.openingStock),
            date: date('2026-01-05'),
            reference: `OPEN-${seed.code}`,
            notes: 'Opening balance',
          },
        },
      },
    });

    materialIdByCode.set(seed.code, material.id);
  }

  console.log('Applying stock movements...');

  for (const movement of movements) {
    const materialId = materialIdByCode.get(movement.materialCode);

    if (!materialId) {
      throw new Error(`Unknown material code ${movement.materialCode}`);
    }

    const projectId = movement.projectCode
      ? (projectIdByCode.get(movement.projectCode) ?? null)
      : null;

    if (movement.projectCode && !projectId) {
      throw new Error(`Unknown project code ${movement.projectCode}`);
    }

    const quantity = decimal(movement.quantity);
    const isStockIn = movement.type === TransactionType.STOCK_IN;

    // Written as a transaction for the same reason the API does it: the stock
    // level and its movement record must never disagree.
    await prisma.$transaction([
      prisma.inventoryTransaction.create({
        data: {
          materialId,
          projectId,
          type: movement.type,
          quantity,
          date: date(movement.date),
          reference: movement.reference,
          notes: movement.notes ?? null,
        },
      }),
      prisma.material.update({
        where: { id: materialId },
        data: {
          currentStock: isStockIn
            ? { increment: quantity }
            : { decrement: quantity },
        },
      }),
    ]);
  }

  const [projectCount, boqCount, materialCount, txnCount, progressCount] =
    await Promise.all([
      prisma.project.count(),
      prisma.boqItem.count(),
      prisma.material.count(),
      prisma.inventoryTransaction.count(),
      prisma.progressRecord.count(),
    ]);

  const lowStock = await prisma.$queryRaw<
    { count: bigint }[]
  >`SELECT COUNT(*)::bigint AS count FROM "Material" WHERE "currentStock" <= "minimumStock"`;

  console.log('');
  console.log('Seed complete:');
  console.log(`  Projects              ${projectCount}`);
  console.log(`  BOQ items             ${boqCount}`);
  console.log(`  Materials             ${materialCount}`);
  console.log(`  Inventory movements   ${txnCount}`);
  console.log(`  Progress records      ${progressCount}`);
  console.log(`  Materials below min   ${Number(lowStock[0]?.count ?? 0)}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
