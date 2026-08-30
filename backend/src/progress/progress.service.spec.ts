import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;

  const prisma = {
    progressRecord: {
      create: jest.fn(),
    },
  };

  const projectsService = {
    findActiveOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
        { provide: ProjectsService, useValue: projectsService },
      ],
    }).compile();

    service = module.get(ProgressService);
    jest.clearAllMocks();
  });

  it('records project progress against an active project', async () => {
    projectsService.findActiveOrFail.mockResolvedValue({ id: 'proj-1' });

    const dto: CreateProgressDto = {
      projectId: 'proj-1',
      date: new Date('2026-08-21T00:00:00.000Z'),
      description: 'Foundation work completed',
      percentage: 35,
      notes: 'Ready for superstructure',
    };

    const created = {
      id: 'prog-1',
      ...dto,
      percentage: new Prisma.Decimal(35),
      project: { id: 'proj-1', name: 'Riverside Office Complex', code: 'PRJ-001' },
    };
    prisma.progressRecord.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(projectsService.findActiveOrFail).toHaveBeenCalledWith('proj-1');
    expect(prisma.progressRecord.create).toHaveBeenCalledWith({
      data: {
        projectId: 'proj-1',
        date: dto.date,
        description: dto.description,
        percentage: new Prisma.Decimal(35),
        notes: dto.notes,
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
      },
    });
    expect(result.percentage.toNumber()).toBe(35);
    expect(result.description).toBe('Foundation work completed');
  });
});
