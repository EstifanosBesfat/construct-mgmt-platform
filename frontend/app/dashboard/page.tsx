'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { formatCurrency, formatNumber, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';

const STATUS_COLORS = {
  PLANNED: '#94a3b8',
  ONGOING: '#3b82f6',
  COMPLETED: '#10b981',
};

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useDashboardSummary();
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [stockInOpen, setStockInOpen] = React.useState(false);
  const [stockOutOpen, setStockOutOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          description="Projects, inventory, and progress at a glance."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          description="Projects, inventory, and progress at a glance."
        />
        <Card className="glass-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Dashboard data could not be loaded. Check that the API is running on port 4000.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { projects, inventory, projectPerformance, recentTransactions, recentProgress } = summary;

  // Chart 1: Project Status Breakdown
  const statusPieData = [
    { name: 'Planned', value: projects.planned, color: STATUS_COLORS.PLANNED },
    { name: 'Ongoing', value: projects.ongoing, color: STATUS_COLORS.ONGOING },
    { name: 'Completed', value: projects.completed, color: STATUS_COLORS.COMPLETED },
  ].filter((item) => item.value > 0);

  // Chart 2: Budget vs BOQ Value (Top 5 Projects)
  const budgetVsBoqData = projectPerformance.slice(0, 5).map((p) => ({
    code: p.code,
    name: p.name.length > 18 ? p.name.slice(0, 18) + '...' : p.name,
    budget: Number(p.budget),
    boqValue: Number(p.boqValue),
  }));

  const totalPortfolioBudget = projectPerformance.reduce(
    (acc, p) => acc + Number(p.budget),
    0
  );
  const totalPortfolioBoq = projectPerformance.reduce(
    (acc, p) => acc + Number(p.boqValue),
    0
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Projects, inventory, and progress at a glance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockInOpen(true)}
              className="rounded-xl"
            >
              <ArrowDownLeft className="h-4 w-4 mr-1.5 text-emerald-500" />
              Stock In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockOutOpen(true)}
              className="rounded-xl"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5 text-rose-500" />
              Stock Out
            </Button>
            <Button
              variant="amber"
              size="sm"
              onClick={() => setNewProjectOpen(true)}
              className="rounded-xl shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Project
            </Button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Projects */}
        <Card className="glass-panel glass-panel-hover border-border/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Projects
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {projects.total}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center text-blue-500 font-semibold">
                {projects.ongoing} ongoing
              </span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">{projects.completed} done</span>
              <span>•</span>
              <span>{projects.planned} planned</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Materials & Inventory */}
        <Card className="glass-panel glass-panel-hover border-border/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Material Catalogue
            </CardTitle>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-500">
              <Boxes className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {inventory.totalMaterials}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs">
              {inventory.lowStockCount > 0 ? (
                <span className="inline-flex items-center font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {inventory.lowStockCount} below minimum
                </span>
              ) : (
                <span className="text-emerald-500 font-medium">All stock levels healthy</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Portfolio Budget */}
        <Card className="glass-panel glass-panel-hover border-border/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Budget
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-baseline flex-wrap gap-x-1.5"
              title={formatCurrency(totalPortfolioBudget)}
            >
              <span className="text-xl font-bold text-foreground tracking-tight">
                {formatNumber(totalPortfolioBudget, 2)}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                ETB
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Combined value of all projects
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Total BOQ Value */}
        <Card className="glass-panel glass-panel-hover border-border/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total BOQ Committed
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-baseline flex-wrap gap-x-1.5"
              title={formatCurrency(totalPortfolioBoq)}
            >
              <span className="text-xl font-bold text-foreground tracking-tight">
                {formatNumber(totalPortfolioBoq, 2)}
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md">
                ETB
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sum of measured rate items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget vs BOQ Value Bar Chart */}
        <Card className="lg:col-span-2 glass-panel border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Budget vs BOQ</span>
              <span className="text-xs font-normal text-muted-foreground">Top projects</span>
            </CardTitle>
            <CardDescription>
              Authorized budget compared with measured BOQ value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetVsBoqData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="code"
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    tickFormatter={(val) => `${(val / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value), '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="budget"
                    name="Authorized Budget"
                    fill="#0284c7"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="boqValue"
                    name="BOQ Total Value"
                    fill="#38bdf8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Pie Chart */}
        <Card className="glass-panel border-border/80 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <PieChartIcon className="h-4 w-4 text-sky-500" />
              <span>Project status</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Current project portfolio lifecycle state.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full grid grid-cols-3 gap-2 text-center text-xs mt-2 pt-3 border-t border-border">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase">Planned</p>
                <p className="font-bold text-slate-500">{projects.planned}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase">Ongoing</p>
                <p className="font-bold text-blue-500">{projects.ongoing}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase">Completed</p>
                <p className="font-bold text-emerald-500">{projects.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance Table */}
      <Card className="glass-panel border-border/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Project performance</CardTitle>
            <CardDescription>
              Budget, BOQ value, progress, and status.
            </CardDescription>
          </div>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-xs text-sky-500 hover:text-sky-600">
              View All Projects
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Project Name</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">BOQ Value</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projectPerformance.slice(0, 5).map((project) => {
                  const progressPct = Number(project.latestProgress || 0);
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-xs text-sky-500">
                        {project.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:underline hover:text-sky-500"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {project.clientName}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {formatCurrency(project.budget)}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                        {formatCurrency(project.boqValue)}
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <div className="flex items-center space-x-2">
                          <Progress value={progressPct} className="h-2 flex-1" />
                          <span className="text-xs font-semibold w-8 text-right">
                            {progressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(project.status)}
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/projects/${project.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground group-hover:text-sky-500"
                          >
                            Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row: Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Stock Transactions Feed */}
        <Card className="glass-panel border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <Boxes className="h-4 w-4 text-sky-500" />
                <span>Recent Inventory Movements</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Latest stock-in receipts and project material issues.
              </CardDescription>
            </div>
            <Link href="/inventory">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-sky-500">
                View History
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/60 hover:border-border transition-colors text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.type === 'STOCK_IN'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {tx.type === 'STOCK_IN' ? (
                        <ArrowDownLeft className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {tx.materialName} ({tx.materialCode})
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        Ref: <span className="font-mono">{tx.reference}</span> •{' '}
                        {tx.projectCode ? `Issued to ${tx.projectCode}` : 'Supplier Receipt'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold ${
                        tx.type === 'STOCK_IN' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {tx.type === 'STOCK_IN' ? '+' : '-'}
                      {tx.quantity} {tx.unit}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No inventory transactions recorded yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Milestone Progress Feed */}
        <Card className="glass-panel border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Recent Milestone Updates</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Field progress reports submitted by project managers.
              </CardDescription>
            </div>
            <Link href="/progress">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-sky-500">
                View Progress
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProgress.length > 0 ? (
              recentProgress.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3 rounded-xl bg-background/50 border border-border/60 hover:border-border transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center space-x-1.5">
                      <span className="text-sky-500 font-mono">[{pr.projectCode}]</span>
                      <span>{pr.projectName}</span>
                    </span>
                    <Badge variant="success" className="font-bold">
                      {pr.percentage}% Complete
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{pr.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>{formatDate(pr.date)}</span>
                    {pr.notes && <span className="italic truncate max-w-xs">{pr.notes}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No progress milestones logged yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Modals */}
      <ProjectFormDialog
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
      <StockInDialog
        isOpen={stockInOpen}
        onClose={() => setStockInOpen(false)}
      />
      <StockOutDialog
        isOpen={stockOutOpen}
        onClose={() => setStockOutOpen(false)}
      />
    </div>
  );
}
