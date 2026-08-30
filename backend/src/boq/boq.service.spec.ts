import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateBoqItemDto } from './dto/create-boq-item.dto';
import { BoqService } from './boq.service';

describe('BoqService', () => {
  let service: BoqService;

  const prisma = {
    boqItem: {
      create: jest.fn(),
    },
  };

  const projectsService = {
    findActiveOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoqService,
        { provide: PrismaService, useValue: prisma },
        { provide: ProjectsService, useValue: projectsService },
      ],
    }).compile();

    service = module.get(BoqService);
    jest.clearAllMocks();
  });

  it('calculates line total as quantity × unitPrice', () => {
    expect(BoqService.computeTotal(860, 4850).toNumber()).toBe(4_171_000);
    expect(BoqService.computeTotal(2.5, 10).toNumber()).toBe(25);
  });

  it('stores the server-computed total and never a client-supplied total', async () => {
    projectsService.findActiveOrFail.mockResolvedValue({ id: 'proj-1' });

    const dto: CreateBoqItemDto = {
      description: 'Reinforced concrete foundation',
      unit: 'm3',
      quantity: 860,
      unitPrice: 4850,
    };

    prisma.boqItem.create.mockImplementation(({ data }) => Promise.resolve(data));

    const created = await service.create('proj-1', dto);

    expect(projectsService.findActiveOrFail).toHaveBeenCalledWith('proj-1');
    expect(prisma.boqItem.create).toHaveBeenCalledWith({
      data: {
        projectId: 'proj-1',
        description: dto.description,
        unit: dto.unit,
        quantity: new Prisma.Decimal(860),
        unitPrice: new Prisma.Decimal(4850),
        total: BoqService.computeTotal(860, 4850),
      },
    });
    expect(created.total.toNumber()).toBe(4_171_000);
    expect(created).not.toHaveProperty('clientTotal');
  });
});
