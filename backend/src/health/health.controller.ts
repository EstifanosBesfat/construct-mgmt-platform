import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller(['health', ''])
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness and database connectivity check' })
  @ApiOkResponse({
    description: 'Service status',
    schema: {
      example: {
        status: 'ok',
        database: 'up',
        timestamp: '2026-08-19T12:00:00.000Z',
      },
    },
  })
  async check(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    let database = 'up';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
