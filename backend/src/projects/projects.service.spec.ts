import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const prisma = {
    project: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    boqItem: {
      aggregate: jest.fn(),
    },
    progressRecord: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProjectsService);
    jest.clearAllMocks();
  });

  it('creates a project with the submitted fields', async () => {
    const dto: CreateProjectDto = {
      name: 'Bole Mixed-Use Tower',
      code: 'PRJ-DEMO',
      clientName: 'Addis Holdings PLC',
      location: 'Bole, Addis Ababa',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2027-06-30T00:00:00.000Z'),
      budget: 12_500_000,
      status: ProjectStatus.PLANNED,
    };

    const created = { id: 'proj-1', ...dto, budget: new Prisma.Decimal(dto.budget) };
    prisma.project.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        code: dto.code,
        clientName: dto.clientName,
        location: dto.location,
        startDate: dto.startDate,
        endDate: dto.endDate,
        budget: new Prisma.Decimal(dto.budget),
        status: ProjectStatus.PLANNED,
      },
    });
    expect(result.id).toBe('proj-1');
    expect(result.code).toBe('PRJ-DEMO');
  });

  it('returns the latest progress percentage on project detail', async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: 'proj-1',
      name: 'Riverside Office Complex',
      deletedAt: null,
    });
    prisma.boqItem.aggregate.mockResolvedValue({
      _sum: { total: new Prisma.Decimal(1000) },
      _count: 1,
    });
    prisma.progressRecord.findFirst.mockResolvedValue({
      percentage: new Prisma.Decimal(71),
      date: new Date('2026-08-21T00:00:00.000Z'),
    });
    prisma.progressRecord.count.mockResolvedValue(3);

    const detail = await service.findOne('proj-1');

    expect(prisma.progressRecord.findFirst).toHaveBeenCalledWith({
      where: { projectId: 'proj-1' },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    expect(detail.latestProgressPercentage?.toNumber()).toBe(71);
  });
});
