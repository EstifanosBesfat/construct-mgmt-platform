import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryEntity } from './entities/dashboard-summary.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get dashboard summary metrics and statistics',
    description:
      'Aggregates project counts by status, inventory low-stock count, ' +
      'per-project performance with latest progress and BOQ value, plus recent activity.',
  })
  @ApiOkResponse({
    description: 'Dashboard aggregated summary',
    type: DashboardSummaryEntity,
  })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
