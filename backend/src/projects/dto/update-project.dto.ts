import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

/**
 * Every field is optional on update.
 *
 * The "endDate after startDate" rule still fires when both dates are sent in
 * the same request. When only one of them is sent, the DTO cannot see the
 * stored value, so ProjectsService re-checks the rule against the persisted
 * record before writing.
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
