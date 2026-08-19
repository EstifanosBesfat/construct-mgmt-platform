import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL');
  }

  /**
   * Empties every table. Used by integration tests so each run starts from a
   * known state. Refuses to run outside test and development environments.
   */
  async truncateAll(): Promise<void> {
    if (!['test', 'development'].includes(process.env.NODE_ENV ?? '')) {
      throw new Error('truncateAll() is blocked outside test/development');
    }

    await this.$transaction([
      this.auditLog.deleteMany(),
      this.inventoryTransaction.deleteMany(),
      this.progressRecord.deleteMany(),
      this.boqItem.deleteMany(),
      this.material.deleteMany(),
      this.project.deleteMany(),
    ]);
  }
}
