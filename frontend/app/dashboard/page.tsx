'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Building2,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { formatCurrency, formatNumber, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { ProjectPerformanceItem, RecentTransactionItem, RecentProgressItem } from '@/types';
import { TableSortHeader, useTableSort } from '@/components/ui/table-sort';

// Avatar initial helper
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function DashboardPage() {
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const { sortKey, sortDirection, toggleSort, sortItems } = useTableSort<ProjectPerformanceItem>(
    null,
    null,
    {
      budget: (p) => Number(p.budget),
      boqValue: (p) => Number(p.boqValue),
      latestProgress: (p) => Number(p.latestProgress || 0),
    }
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  if (isError && !summary) {
    return (
      <div className="space-y-4">
        <PageHeader title="Executive Overview" />
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <h3 className="font-semibold text-sm text-foreground">Unable to connect to the backend server</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              The dashboard could not load data from the backend API. Please make sure the backend is running at{' '}
              <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">http://localhost:4002</code>.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !summary) {
    return (
      <div className="space-y-4">
        <PageHeader title="Executive Overview" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  const { projects, inventory, projectPerformance, recentTransactions, recentProgress } = summary;
  const sortedPerformance = sortItems(projectPerformance);

  // Chart 1: Project Status Breakdown with theme-aware high contrast
  const statusPieData = [
    { name: 'Planned', value: projects.planned, color: isDark ? '#94A3B8' : '#64748B' },
    { name: 'Ongoing', value: projects.ongoing, color: isDark ? '#FB923C' : '#EA580C' },
    { name: 'Completed', value: projects.completed, color: isDark ? '#4ADE80' : '#16A34A' },
  ].filter((item) => item.value > 0);

  // Chart 2: Budget vs BOQ Value (Top 5 Projects)
  const budgetVsBoqData = projectPerformance.slice(0, 5).map((p: ProjectPerformanceItem) => ({
    code: p.code,
    name: p.name.length > 16 ? p.name.slice(0, 16) + '...' : p.name,
    budget: Number(p.budget),
    boqValue: Number(p.boqValue),
  }));

  const totalPortfolioBudget = projectPerformance.reduce(
    (acc: number, p: ProjectPerformanceItem) => acc + Number(p.budget),
    0
  );
  const totalPortfolioBoq = projectPerformance.reduce(
    (acc: number, p: ProjectPerformanceItem) => acc + Number(p.boqValue),
    0
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <PageHeader
        title="Executive Overview"
        description="Real-time portfolio budget, measured rates, and inventory status."
      />

      {/* KPI Cards Row (Clean, Compact, No Bloat) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Projects */}
        <Card>
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Projects
              </p>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-xl font-bold text-foreground">
                  {projects.total}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ({projects.ongoing} active)
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {projects.completed} completed • {projects.planned} planned
              </p>
            </div>
            <div className="h-8 w-8 rounded-md bg-orange-50 text-[#EA580C] dark:bg-orange-950/50 dark:text-orange-400 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Materials & Inventory */}
        <Card>
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Materials Catalogue
              </p>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-xl font-bold text-foreground">
                  {inventory.totalMaterials}
                </span>
                <span className="text-[11px] text-muted-foreground">items</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {inventory.lowStockCount > 0 ? (
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    ⚠️ {inventory.lowStockCount} below minimum
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Healthy inventory</span>
                )}
              </p>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Portfolio Budget */}
        <Card>
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Budget
              </p>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-lg font-bold text-foreground tracking-tight">
                  {formatNumber(totalPortfolioBudget, 0)}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  ETB
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Authorized contract value
              </p>
            </div>
            <div className="h-8 w-8 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total BOQ Value */}
        <Card>
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total BOQ Value
              </p>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-lg font-bold text-foreground tracking-tight">
                  {formatNumber(totalPortfolioBoq, 0)}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  ETB
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Measured line items sum
              </p>
            </div>
            <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Row (Theme-Aware High Contrast) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Budget vs BOQ Value Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-2.5 px-3.5">
            <CardTitle>Budget vs. BOQ Value Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-3.5">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetVsBoqData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.15 : 0.25} stroke={isDark ? '#475569' : '#CBD5E1'} vertical={false} />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} stroke={isDark ? '#475569' : '#CBD5E1'} />
                  <YAxis
                    tick={{ fontSize: 10, fill: isDark ? '#94A3B8' : '#64748B' }}
                    stroke={isDark ? '#475569' : '#CBD5E1'}
                    tickFormatter={(val) => `${(val / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value), '']}
                    contentStyle={{
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderRadius: '0.375rem',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    }}
                    itemStyle={{
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                    labelStyle={{
                      color: isDark ? '#94A3B8' : '#64748B',
                      fontWeight: 600,
                    }}
                  />
                  <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey="budget"
                    name="Authorized Budget"
                    fill={isDark ? '#60A5FA' : '#1E293B'}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="boqValue"
                    name="BOQ Total Value"
                    fill={isDark ? '#FB923C' : '#EA580C'}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Pie Chart */}
        <Card>
          <CardHeader className="py-2.5 px-3.5">
            <CardTitle>Project Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 flex flex-col items-center justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderRadius: '0.375rem',
                      fontSize: '11px',
                    }}
                    itemStyle={{
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full grid grid-cols-3 gap-1 text-center text-xs pt-2 border-t border-border mt-1">
              <div>
                <p className="text-muted-foreground text-[10px]">Planned</p>
                <p className="font-semibold text-[#64748B] dark:text-[#94A3B8]">{projects.planned}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Ongoing</p>
                <p className="font-semibold text-[#EA580C] dark:text-[#FB923C]">{projects.ongoing}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Completed</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{projects.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
          <CardTitle>Active Projects & Progress</CardTitle>
          <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center font-medium">
            View All Projects
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <TableSortHeader
                    label="Project"
                    sortKey="name"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                  />
                  <TableSortHeader
                    label="Code"
                    sortKey="code"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                  />
                  <TableSortHeader
                    label="Client"
                    sortKey="clientName"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                  />
                  <TableSortHeader
                    label="Location"
                    sortKey="location"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                  />
                  <TableSortHeader
                    label="Budget"
                    sortKey="budget"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                    align="right"
                  />
                  <TableSortHeader
                    label="BOQ Value"
                    sortKey="boqValue"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                    align="right"
                  />
                  <TableSortHeader
                    label="Progress"
                    sortKey="latestProgress"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                  />
                  <TableSortHeader
                    label="Status"
                    sortKey="status"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={toggleSort}
                  />
                  <th className="px-3 py-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedPerformance.slice(0, 5).map((project: ProjectPerformanceItem) => {
                  const progressPct = Number(project.latestProgress || 0);
                  const initials = getInitials(project.name);

                  return (
                    <tr key={project.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground font-semibold flex items-center justify-center text-[10px] shrink-0">
                            {initials}
                          </div>
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {project.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {project.code}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {project.clientName}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {project.location}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {formatNumber(project.budget, 0)} <span className="text-[10px] text-muted-foreground">ETB</span>
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {formatNumber(project.boqValue, 0)} <span className="text-[10px]">ETB</span>
                      </td>
                      <td className="px-3 py-2 min-w-[100px]">
                        <div className="flex items-center space-x-2">
                          <Progress value={progressPct} className="h-1.5 flex-1" />
                          <span className="text-[11px] font-medium w-7 text-right">
                            {progressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(project.status) + ' text-[10px] py-0'}
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" size="xs">
                            Details
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

      {/* Bottom Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Stock Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
            <CardTitle>Recent Stock Movements</CardTitle>
            <Link href="/inventory" className="text-xs text-muted-foreground hover:text-foreground font-medium">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentTransactions.slice(0, 4).map((tx: RecentTransactionItem) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 text-xs hover:bg-muted/30">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`h-5 w-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
                        tx.type === 'STOCK_IN'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'STOCK_IN' ? '+' : '-'}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{tx.materialName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Ref: {tx.reference} • {tx.projectCode ? tx.projectCode : 'Central Warehouse'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${
                        tx.type === 'STOCK_IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'STOCK_IN' ? '+' : '-'}
                      {tx.quantity} {tx.unit}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Milestone Updates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
            <CardTitle>Recent Milestone Updates</CardTitle>
            <Link href="/progress" className="text-xs text-muted-foreground hover:text-foreground font-medium">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentProgress.slice(0, 4).map((pr: RecentProgressItem) => (
                <div key={pr.id} className="p-2.5 text-xs space-y-1 hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      <span className="text-muted-foreground font-mono mr-1.5">[{pr.projectCode}]</span>
                      {pr.projectName}
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      {pr.percentage}%
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{pr.description}</p>
                  <p className="text-[10px] text-muted-foreground/80">{formatDate(pr.date)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
