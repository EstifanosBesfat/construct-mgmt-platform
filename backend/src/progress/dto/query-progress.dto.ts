import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryProgressDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Restrict the list to one project. When omitted, records from every ' +
      'active (not soft-deleted) project are returned.',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}
