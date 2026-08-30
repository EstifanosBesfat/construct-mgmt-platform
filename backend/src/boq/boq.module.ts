import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { BoqController } from './boq.controller';
import { BoqService } from './boq.service';

@Module({
  imports: [ProjectsModule],
  controllers: [BoqController],
  providers: [BoqService],
  exports: [BoqService],
})
export class BoqModule {}
