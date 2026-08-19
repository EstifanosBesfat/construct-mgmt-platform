import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { PaginationMetaDto } from '../../common/dto/paginated-response.dto';

/**
 * Response shape for a project. Declared separately from the Prisma model so
 * that Swagger documents Decimal columns as the numbers the API actually
 * returns (see DecimalSerializerInterceptor).
 */
export class ProjectEntity {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'Riverside Office Complex' })
  name: string;

  @ApiProperty({ example: 'PRJ-001' })
  code: string;

  @ApiProperty({ example: 'Addis Holdings PLC' })
  clientName: string;

  @ApiProperty({ example: 'Bole, Addis Ababa' })
  location: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endDate: Date;

  @ApiProperty({ type: Number, example: 5000000 })
  budget: number;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.ONGOING })
  status: ProjectStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class ProjectDetailEntity extends ProjectEntity {
  @ApiProperty({
    type: Number,
    description: 'Sum of every BOQ item total for this project',
    example: 4800000,
  })
  boqValue: number;

  @ApiProperty({
    type: Number,
    description: 'Number of BOQ items recorded against this project',
    example: 24,
  })
  boqItemCount: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description:
      'Percentage from the most recent progress record, or null when the ' +
      'project has no progress records yet',
    example: 65,
  })
  latestProgressPercentage: number | null;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Date of the most recent progress record',
  })
  latestProgressDate: Date | null;

  @ApiProperty({
    type: Number,
    description: 'Number of progress records recorded against this project',
    example: 8,
  })
  progressRecordCount: number;
}

/**
 * Concrete page-of-projects response. Swagger cannot express the generic
 * PaginatedResponseDto<T>, so each module declares a named class like this one
 * for its list endpoint.
 */
export class PaginatedProjectsEntity {
  @ApiProperty({ type: [ProjectEntity] })
  data: ProjectEntity[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
