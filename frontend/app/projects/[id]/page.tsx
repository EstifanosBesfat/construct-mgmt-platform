'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Boxes,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  Download,
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { useProjectDetail, useDeleteProject } from '@/hooks/use-projects';
import { useProjectBoq, useDeleteBoqItem } from '@/hooks/use-boq';
import { useProgressRecords, useDeleteProgress } from '@/hooks/use-progress';
import { useInventoryTransactions } from '@/hooks/use-inventory';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { BoqItemDialog } from '@/components/boq/boq-item-dialog';
import { ProgressFormDialog } from '@/components/progress/progress-form-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { BoqItem, ProgressRecord, InventoryTransaction } from '@/types';
import { formatCurrency, formatNumber, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { exportToStyledExcel } from '@/lib/export-utils';
import { TableSortHeader, useTableSort } from '@/components/ui/table-sort';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = React.useState<'overview' | 'boq' | 'progress' | 'inventory'>('overview');

  // Modals state
  const [editProjectOpen, setEditProjectOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const [addBoqOpen, setAddBoqOpen] = React.useState(false);
  const [editingBoqItem, setEditingBoqItem] = React.useState<BoqItem | null>(null);
  const [deletingBoqId, setDeletingBoqId] = React.useState<string | null>(null);

  const [addProgressOpen, setAddProgressOpen] = React.useState(false);
  const [editingProgress, setEditingProgress] = React.useState<ProgressRecord | null>(null);
  const [deletingProgressId, setDeletingProgressId] = React.useState<string | null>(null);

  const [stockOutOpen, setStockOutOpen] = React.useState(false);

  // Sorting hooks
  const boqSort = useTableSort<BoqItem>(null, null, {
    quantity: (i) => Number(i.quantity),
    unitPrice: (i) => Number(i.unitPrice),
    total: (i) => Number(i.total),
  });

  const inventorySort = useTableSort<InventoryTransaction>(null, null, {
    quantity: (t) => Number(t.quantity),
    material: (t) => t.material?.name ?? '',
  });

  // Data fetching
  const { data: project, isLoading: projectLoading, isError } = useProjectDetail(id);
  const { data: boqData, isLoading: boqLoading } = useProjectBoq(id);
  const { data: progressData, isLoading: progressLoading } = useProgressRecords({ projectId: id });
  const { data: txData, isLoading: txLoading } = useInventoryTransactions({ projectId: id });

  const deleteProjectMutation = useDeleteProject();
  const deleteBoqMutation = useDeleteBoqItem(id);
  const deleteProgressMutation = useDeleteProgress(id);

  if (projectLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <h2 className="text-sm font-bold text-foreground">Project Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1">
          The requested project might have been deleted or archived.
        </p>
        <Link href="/projects" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const rawBoqItems = (boqData?.data ?? boqData?.items ?? []) as BoqItem[];
  const boqItems = boqSort.sortItems(rawBoqItems);
  const boqSummary = boqData?.summary;
  const progressRecords = progressData?.data ?? [];
  const rawProjectTransactions = (txData?.data ?? []) as InventoryTransaction[];
  const projectTransactions = inventorySort.sortItems(rawProjectTransactions);

  const isCompleted = project.status === 'COMPLETED';
  const isPlanned = project.status === 'PLANNED';
  const isOngoing = project.status === 'ONGOING';

  const totalBoqValue = Number(
    boqSummary?.totalValue ?? boqSummary?.totalBoqValue ?? project.boqValue ?? 0
  );
  const budgetAdherence =
    project.budget > 0 ? (totalBoqValue / Number(project.budget)) * 100 : 0;
  const latestProgressPct = Number(project.latestProgressPercentage || 0);

  const handleExportBoq = () => {
    const columnsDef = [
      { header: '#', key: 'index', width: 8, align: 'center' as const },
      { header: 'Description', key: 'description', width: 32, align: 'left' as const },
      { header: 'Unit', key: 'unit', width: 12, align: 'center' as const },
      { header: 'Quantity', key: 'quantity', width: 14, align: 'right' as const, format: 'number' as const },
      { header: 'Unit Price (ETB)', key: 'unitPrice', width: 18, align: 'right' as const, format: 'currency' as const },
      { header: 'Total (ETB)', key: 'total', width: 18, align: 'right' as const, format: 'currency' as const },
    ];
    const exportData = boqItems.map((item, index) => ({
      index: index + 1,
      description: item.description,
      unit: item.unit,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    }));
    exportToStyledExcel({
      title: `Bill of Quantities (BOQ) - ${project.name}`,
      subtitle: `Project Code: ${project.code} | Client: ${project.clientName} | Budget: ${formatNumber(project.budget, 2)} ETB`,
      filename: `BOQ_${project.code}_${new Date().toISOString().slice(0, 10)}`,
      columns: columnsDef,
      data: exportData,
      summaryTotals: { total: totalBoqValue },
    });
  };

  const handleDeleteProject = async () => {
    await deleteProjectMutation.mutateAsync(project.id);
    router.push('/projects');
  };

  return (
    <div className="space-y-3">
      {/* Top Header Strip (Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center space-x-2">
          <Link href="/projects" className="text-muted-foreground hover:text-foreground">
            <Button variant="ghost" size="xs" className="h-6 px-1.5">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Projects
            </Button>
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="font-mono text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
            {project.code}
          </span>
          <h1 className="text-sm font-bold text-foreground truncate max-w-sm">
            {project.name}
          </h1>
          <Badge variant="outline" className={getStatusBadgeClass(project.status) + ' text-[10px] py-0'}>
            {project.status}
          </Badge>
        </div>

        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setEditProjectOpen(true)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="xs"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Compact Project Metadata Strip */}
      <div className="bg-card border border-border rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center">
            <User className="h-3 w-3 mr-1 text-muted-foreground" />
            Client: <strong className="ml-1 text-foreground font-medium">{project.clientName}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
            Location: <strong className="ml-1 text-foreground font-medium">{project.location}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
            Timeline: <span className="ml-1 font-medium">{formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-foreground">Progress:</span>
          <div className="w-24">
            <Progress value={latestProgressPct} className="h-1.5" />
          </div>
          <span className="font-bold text-foreground text-[11px]">{latestProgressPct}%</span>
        </div>
      </div>

      {/* Subcategory Tabs */}
      <div className="flex items-center space-x-1 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('boq')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'boq'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Bill of Quantities ({boqItems.length})
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'progress'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Milestones ({progressRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Materials Consumed ({projectTransactions.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Authorized Budget</p>
                <p className="text-base font-bold text-foreground mt-0.5">
                  {formatNumber(project.budget, 0)} <span className="text-[10px] text-muted-foreground">ETB</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Contract ceiling</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Total BOQ Value</p>
                <p className="text-base font-bold text-[#EA580C] mt-0.5">
                  {formatNumber(totalBoqValue, 0)} <span className="text-[10px] text-muted-foreground">ETB</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{boqItems.length} measured rate lines</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Budget Committed</p>
                <p className="text-base font-bold text-foreground mt-0.5">{budgetAdherence.toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {totalBoqValue <= Number(project.budget) ? 'Within budget' : 'Exceeds budget'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Completion Progress</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">{latestProgressPct}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {project.latestProgressDate ? formatDate(project.latestProgressDate) : 'No progress logged'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Quick BOQ */}
            <Card>
              <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                <CardTitle>BOQ Highlights</CardTitle>
                <Button variant="ghost" size="xs" onClick={() => setActiveTab('boq')} className="text-[11px]">
                  View All ({boqItems.length})
                </Button>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-xs">
                {boqItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No BOQ items added yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {boqItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="truncate max-w-[200px] text-foreground font-medium">{item.description}</span>
                        <span className="font-mono text-muted-foreground">
                          {item.quantity} {item.unit} • <strong className="text-foreground">{formatNumber(item.total, 0)} ETB</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Milestones */}
            <Card>
              <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                <CardTitle>Recent Milestones</CardTitle>
                <Button variant="ghost" size="xs" onClick={() => setActiveTab('progress')} className="text-[11px]">
                  View All ({progressRecords.length})
                </Button>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-xs">
                {progressRecords.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No milestones recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {progressRecords.slice(0, 3).map((pr) => (
                      <div key={pr.id} className="p-2 rounded bg-muted/40 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <Badge variant="success" className="text-[10px]">{pr.percentage}%</Badge>
                            <span className="font-medium text-foreground">{pr.description}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(pr.date)} {pr.notes ? `• "${pr.notes}"` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: BOQ MANAGER */}
      {activeTab === 'boq' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Measured rate items and automated line totals.</span>
            <div className="flex items-center space-x-1.5">
              <Button variant="outline" size="xs" onClick={handleExportBoq} disabled={boqItems.length === 0}>
                <FileSpreadsheet className="h-3 w-3 mr-1 text-emerald-600" />
                Export Excel
              </Button>
              {!isCompleted && (
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => {
                    setEditingBoqItem(null);
                    setAddBoqOpen(true);
                  }}
                  className="font-semibold"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add BOQ Item
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {boqLoading ? (
                <div className="p-3 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded" />
                  ))}
                </div>
              ) : boqItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No BOQ items added yet.</p>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase text-muted-foreground bg-muted/60 border-b border-border">
                    <tr>
                      <th className="px-3 py-2 w-10">#</th>
                      <TableSortHeader
                        label="Description"
                        sortKey="description"
                        currentSortKey={boqSort.sortKey}
                        currentDirection={boqSort.sortDirection}
                        onSort={boqSort.toggleSort}
                      />
                      <TableSortHeader
                        label="Unit"
                        sortKey="unit"
                        currentSortKey={boqSort.sortKey}
                        currentDirection={boqSort.sortDirection}
                        onSort={boqSort.toggleSort}
                      />
                      <TableSortHeader
                        label="Quantity"
                        sortKey="quantity"
                        currentSortKey={boqSort.sortKey}
                        currentDirection={boqSort.sortDirection}
                        onSort={boqSort.toggleSort}
                        align="right"
                      />
                      <TableSortHeader
                        label="Unit Price (ETB)"
                        sortKey="unitPrice"
                        currentSortKey={boqSort.sortKey}
                        currentDirection={boqSort.sortDirection}
                        onSort={boqSort.toggleSort}
                        align="right"
                      />
                      <TableSortHeader
                        label="Total (ETB)"
                        sortKey="total"
                        currentSortKey={boqSort.sortKey}
                        currentDirection={boqSort.sortDirection}
                        onSort={boqSort.toggleSort}
                        align="right"
                      />
                      {!isCompleted && <th className="px-3 py-2 font-semibold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {boqItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{index + 1}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{item.description}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.unit}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{formatNumber(item.unitPrice, 2)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground">{formatNumber(item.total, 2)}</td>
                        {!isCompleted && (
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                  setEditingBoqItem(item);
                                  setAddBoqOpen(true);
                                }}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setDeletingBoqId(item.id)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-border bg-muted/30 font-semibold text-xs">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right uppercase tracking-wider text-[11px]">
                        Total Measured BOQ Value:
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-foreground">
                        {formatCurrency(totalBoqValue)}
                      </td>
                      {!isCompleted && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: MILESTONES */}
      {activeTab === 'progress' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Historical milestone completions logged by supervisors.</span>
            {!isCompleted && (
              <Button
                variant="default"
                size="xs"
                onClick={() => {
                  setEditingProgress(null);
                  setAddProgressOpen(true);
                }}
                className="font-semibold"
              >
                <Plus className="h-3 w-3 mr-1" />
                Log Milestone
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {progressLoading ? (
                <div className="p-3 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              ) : progressRecords.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No milestones logged yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {progressRecords.map((record) => (
                    <div key={record.id} className="p-3 text-xs flex items-center justify-between hover:bg-muted/30">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="success" className="text-[10px] font-bold">{record.percentage}%</Badge>
                          <span className="font-semibold text-foreground">{record.description}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Date: {formatDate(record.date)} {record.notes ? `• "${record.notes}"` : ''}
                        </p>
                      </div>
                      {!isCompleted && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setEditingProgress(record);
                              setAddProgressOpen(true);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setDeletingProgressId(record.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: SITE INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Materials issued from central warehouse to this project.</span>
            {isOngoing && (
              <Button
                variant="default"
                size="xs"
                onClick={() => setStockOutOpen(true)}
                className="font-semibold"
              >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Issue Material
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {txLoading ? (
                <div className="p-3 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded" />
                  ))}
                </div>
              ) : projectTransactions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {isPlanned
                    ? 'No materials issued. Site material allocation is enabled when project status is Ongoing.'
                    : 'No material issues logged for this site.'}
                </p>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase text-muted-foreground bg-muted/60 border-b border-border">
                    <tr>
                      <TableSortHeader
                        label="Reference"
                        sortKey="reference"
                        currentSortKey={inventorySort.sortKey}
                        currentDirection={inventorySort.sortDirection}
                        onSort={inventorySort.toggleSort}
                      />
                      <TableSortHeader
                        label="Material"
                        sortKey="material"
                        currentSortKey={inventorySort.sortKey}
                        currentDirection={inventorySort.sortDirection}
                        onSort={inventorySort.toggleSort}
                      />
                      <TableSortHeader
                        label="Quantity"
                        sortKey="quantity"
                        currentSortKey={inventorySort.sortKey}
                        currentDirection={inventorySort.sortDirection}
                        onSort={inventorySort.toggleSort}
                        align="right"
                      />
                      <TableSortHeader
                        label="Date"
                        sortKey="date"
                        currentSortKey={inventorySort.sortKey}
                        currentDirection={inventorySort.sortDirection}
                        onSort={inventorySort.toggleSort}
                      />
                      <TableSortHeader
                        label="Notes"
                        sortKey="notes"
                        currentSortKey={inventorySort.sortKey}
                        currentDirection={inventorySort.sortDirection}
                        onSort={inventorySort.toggleSort}
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{tx.reference}</td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {tx.material.name} <span className="text-[10px] text-muted-foreground">({tx.material.code})</span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-red-600 dark:text-red-400">
                          -{tx.quantity} {tx.material.unit}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{formatDate(tx.date)}</td>
                        <td className="px-3 py-2 text-muted-foreground">{tx.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog Modals */}
      <ProjectFormDialog
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        projectToEdit={project}
      />

      <BoqItemDialog
        isOpen={addBoqOpen}
        onClose={() => {
          setAddBoqOpen(false);
          setEditingBoqItem(null);
        }}
        projectId={project.id}
        itemToEdit={editingBoqItem}
      />

      <ProgressFormDialog
        isOpen={addProgressOpen}
        onClose={() => {
          setAddProgressOpen(false);
          setEditingProgress(null);
        }}
        defaultProjectId={project.id}
        recordToEdit={editingProgress}
      />

      <StockOutDialog
        isOpen={stockOutOpen}
        onClose={() => setStockOutOpen(false)}
        defaultProjectId={project.id}
      />

      {/* Delete Project Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Project"
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{project.name} ({project.code})</strong>?
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="xs" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="xs"
              isLoading={deleteProjectMutation.isPending}
              onClick={handleDeleteProject}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete BOQ Item Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingBoqId)}
        onClose={() => setDeletingBoqId(null)}
        title="Delete BOQ Line Item"
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            Are you sure you want to delete this BOQ rate item?
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="xs" onClick={() => setDeletingBoqId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="xs"
              isLoading={deleteBoqMutation.isPending}
              onClick={async () => {
                if (deletingBoqId) {
                  await deleteBoqMutation.mutateAsync(deletingBoqId);
                  setDeletingBoqId(null);
                }
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Progress Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingProgressId)}
        onClose={() => setDeletingProgressId(null)}
        title="Delete Milestone Record"
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            Are you sure you want to delete this progress milestone record?
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="xs" onClick={() => setDeletingProgressId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="xs"
              isLoading={deleteProgressMutation.isPending}
              onClick={async () => {
                if (deletingProgressId) {
                  await deleteProgressMutation.mutateAsync(deletingProgressId);
                  setDeletingProgressId(null);
                }
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
