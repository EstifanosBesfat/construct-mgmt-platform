import { PartialType } from '@nestjs/swagger';
import { CreateBoqItemDto } from './create-boq-item.dto';

export class UpdateBoqItemDto extends PartialType(CreateBoqItemDto) {}
