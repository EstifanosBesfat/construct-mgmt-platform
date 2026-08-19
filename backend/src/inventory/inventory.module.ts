import { Module } from '@nestjs/common';
import { MaterialsModule } from '../materials/materials.module';
import { ProjectsModule } from '../projects/projects.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [MaterialsModule, ProjectsModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
