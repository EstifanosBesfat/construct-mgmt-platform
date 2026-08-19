import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global so that feature modules can inject PrismaService without each of them
// importing PrismaModule.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
