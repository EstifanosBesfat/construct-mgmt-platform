import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  // Exported so the BOQ, progress and inventory modules can reuse
  // findActiveOrFail() instead of each re-implementing the soft-delete check.
  exports: [ProjectsService],
})
export class ProjectsModule {}
