import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/paginated-response.dto';

export class ProgressProjectEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'Riverside Office Complex' })
  name: string;

  @ApiProperty({ example: 'PRJ-001' })
  code: string;
}

export class ProgressRecordEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  projectId: string;

  @ApiProperty({ type: String, format: 'date-time' })
  date: Date;

  @ApiProperty({ example: 'Masonry and first-fix services in progress' })
  description: string;

  @ApiProperty({ type: Number, example: 71 })
  percentage: number;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Steel delivery delay recovered with weekend shifts.',
  })
  notes: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: ProgressProjectEntity })
  project: ProgressProjectEntity;
}

export class PaginatedProgressEntity {
  @ApiProperty({ type: [ProgressRecordEntity] })
  data: ProgressRecordEntity[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
