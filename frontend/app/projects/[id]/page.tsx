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
  CheckCircle2,
  Clock,
  MapPin,
  User,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { useProjectDetail, useDeleteProject } from '@/hooks/use-projects';
import { useProjectBoq, useDeleteBoqItem } from '@/hooks/use-boq';
import { useProgressRecords, useDeleteProgress } from '@/hooks/use-progress';
import { useInventoryTransactions } from '@/hooks/use-inventory';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { BoqItemDialog } from '@/components/boq/boq-item-dialog';
import { BoqTable } from '@/components/boq/boq-table';
import { ProgressFormDialog } from '@/components/progress/progress-form-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { BoqItem, ProgressRecord } from '@/types';
import { formatCurrency, formatDate, getStatusBadgeClass, exportToCsv } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = React.useState('overview');
  const [editProjectOpen, setEditProjectOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  // BOQ Dialogs
  const [addBoqOpen, setAddBoqOpen] = React.useState(false);
  const [editingBoqItem, setEditingBoqItem] = React.useState<BoqItem | null>(null);
  const [deletingBoqId, setDeletingBoqId] = React.useState<string | null>(null);

  // Progress Dialogs
  const [addProgressOpen, setAddProgressOpen] = React.useState(false);
  const [editingProgress, setEditingProgress] = React.useState<ProgressRecord | null>(null);
  const [deletingProgressId, setDeletingProgressId] = React.useState<string | null>(null);

  // Stock Out Dialog
  const [stockOutOpen, setStockOutOpen] = React.useState(false);

  const { data: project, isLoading: projectLoading } = useProjectDetail(id);
  const { data: boqData, isLoading: boqLoading } = useProjectBoq(id);
  const { data: progressData, isLoading: progressLoading } = useProgressRecords({
    projectId: id,
    limit: 50,
  });
  const { data: txData, isLoading: txLoading } = useInventoryTransactions({
    projectId: id,
    limit: 50,
  });

  const deleteProjectMutation = useDeleteProject();
  const deleteBoqMutation = useDeleteBoqItem(id);
  const deleteProgressMutation = useDeleteProgress(id);

  if (projectLoading || !project) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const boqItems = boqData?.items ?? [];
  const boqSummary = boqData?.summary;
  const progressRecords = progressData?.data ?? [];
  const projectTransactions = txData?.data ?? [];

  const totalBoqValue = boqSummary?.totalBoqValue ?? Number(project.boqValue || 0);
  const budgetAdherence =
    project.budget > 0 ? (totalBoqValue / Number(project.budget)) * 100 : 0;
  const latestProgressPct = Number(project.latestProgressPercentage || 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Building2 className="h-4 w-4" /> },
    {
      id: 'boq',
      label: 'Bill of Quantities (BOQ)',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      badge: boqItems.length,
    },
    {
      id: 'progress',
      label: 'Milestone Progress',
      icon: <TrendingUp className="h-4 w-4" />,
      badge: progressRecords.length,
    },
    {
      id: 'inventory',
      label: 'Material Usage',
      icon: <Boxes className="h-4 w-4" />,
      badge: projectTransactions.length,
    },
  ];

  const handleExportBoq = () => {
    const exportData = boqItems.map((item, index) => ({
      'Item #': index + 1,
      'Description': item.description,
      'Unit': item.unit,
      'Quantity': item.quantity,
      'Unit Price (ETB)': item.unitPrice,
      'Total (ETB)': item.total,
    }));
    exportToCsv(exportData, `BOQ_${project.code}_${new Date().toISOString().split('T')[0]}`);
  };

  const handleDeleteProject = async () => {
    await deleteProjectMutation.mutateAsync(project.id);
    router.push('/projects');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-sky-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <Link
              href="/projects"
              className="inline-flex items-center text-[11px] font-medium text-muted-foreground hover:text-sky-600"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Projects
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
                {project.code}
              </span>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                {project.name}
              </h1>
              <Badge variant="outline" className={getStatusBadgeClass(project.status)}>
                {project.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
              <span className="flex items-center">
                <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Client: <strong className="ml-1 text-foreground">{project.clientName}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Location: <strong className="ml-1 text-foreground">{project.location}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {formatDate(project.startDate)} → {formatDate(project.endDate)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditProjectOpen(true)}
              className="rounded-lg"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-2/3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Completion</span>
              <span className="font-semibold text-sky-600">{latestProgressPct}%</span>
            </div>
            <Progress value={latestProgressPct} className="h-2" />
          </div>
          <Button
            variant="amber"
            size="sm"
            onClick={() => setAddProgressOpen(true)}
            className="rounded-lg text-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Update Progress
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* 4 Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">
                  Authorized Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-extrabold text-foreground">
                  {formatCurrency(project.budget)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Contract value ceiling</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">
                  Total BOQ Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-extrabold text-sky-500">
                  {formatCurrency(totalBoqValue)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {boqItems.length} measured rate items
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">
                  Budget Committed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-extrabold text-foreground">
                  {budgetAdherence.toFixed(1)}%
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {totalBoqValue <= Number(project.budget)
                    ? 'Within allocated budget'
                    : 'Exceeds contract budget'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">
                  Latest Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-extrabold text-emerald-500">
                  {latestProgressPct}%
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {project.latestProgressDate
                    ? formatDate(project.latestProgressDate)
                    : 'No progress recorded yet'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick BOQ & Progress Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BOQ Summary Card */}
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Bill of Quantities Highlights</CardTitle>
                  <CardDescription className="text-xs">
                    Primary cost components defined for this project.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('boq')}
                  className="text-xs text-sky-500"
                >
                  View All ({boqItems.length})
                </Button>
              </CardHeader>
              <CardContent>
                {boqItems.length > 0 ? (
                  <div className="space-y-2">
                    {boqItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/60 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{item.description}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-bold text-foreground">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    No BOQ items added yet. Click BOQ tab to add items.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Progress Milestone History Card */}
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Recent Milestone Reports</CardTitle>
                  <CardDescription className="text-xs">
                    Latest field progress updates.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('progress')}
                  className="text-xs text-blue-500"
                >
                  View Timeline
                </Button>
              </CardHeader>
              <CardContent>
                {progressRecords.length > 0 ? (
                  <div className="space-y-2.5">
                    {progressRecords.slice(0, 4).map((record) => (
                      <div
                        key={record.id}
                        className="p-2.5 rounded-xl bg-background/50 border border-border/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {record.description}
                          </span>
                          <Badge variant="success" className="text-[10px]">
                            {record.percentage}%
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(record.date)} {record.notes ? `• ${record.notes}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    No progress milestones logged yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: BOQ MANAGER */}
      {activeTab === 'boq' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="glass-panel border-border/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-sky-500" />
                  <span>Bill of Quantities (BOQ)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Line items and unit rates. Total is automatically calculated as Quantity × Unit Price.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportBoq}
                  disabled={boqItems.length === 0}
                  className="rounded-xl text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export CSV
                </Button>
                <Button
                  variant="amber"
                  size="sm"
                  onClick={() => {
                    setEditingBoqItem(null);
                    setAddBoqOpen(true);
                  }}
                  className="rounded-xl text-xs shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add BOQ Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {boqLoading ? (
                <div className="space-y-3 py-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              ) : boqItems.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
                  <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <h3 className="text-sm font-bold text-foreground">No BOQ items added</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Add measured rate items to define estimated project costs and quantities.
                  </p>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => {
                      setEditingBoqItem(null);
                      setAddBoqOpen(true);
                    }}
                    className="mt-4 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <BoqTable
                  items={boqItems}
                  totalBoqValue={totalBoqValue}
                  onEdit={(item) => {
                    setEditingBoqItem(item);
                    setAddBoqOpen(true);
                  }}
                  onDelete={setDeletingBoqId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: PROGRESS TRACKING */}
      {activeTab === 'progress' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="glass-panel border-border/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Milestone Progress History</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Physical execution percentage logged by site supervisors over time.
                </CardDescription>
              </div>
              <Button
                variant="amber"
                size="sm"
                onClick={() => {
                  setEditingProgress(null);
                  setAddProgressOpen(true);
                }}
                className="rounded-xl text-xs shadow-sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Record Progress
              </Button>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="space-y-3 py-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : progressRecords.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
                  <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <h3 className="text-sm font-bold text-foreground">No progress records</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Record milestone completions to update the project completion percentage.
                  </p>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => {
                      setEditingProgress(null);
                      setAddProgressOpen(true);
                    }}
                    className="mt-4 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Record First Milestone
                  </Button>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-border space-y-6 my-2">
                  {progressRecords.map((record) => (
                    <div key={record.id} className="relative group">
                      {/* Timeline node */}
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background bg-sky-500 shadow-sm" />

                      <div className="p-4 rounded-xl border border-border/80 bg-background/50 hover:border-border transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant="success" className="font-bold text-sm px-2.5 py-0.5">
                              {record.percentage}%
                            </Badge>
                            <span className="font-bold text-foreground text-sm">
                              {record.description}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{formatDate(record.date)}</span>
                            <div className="flex items-center space-x-1 pl-2 border-l border-border">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingProgress(record);
                                  setAddProgressOpen(true);
                                }}
                                className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingProgressId(record.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {record.notes && (
                          <p className="mt-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg italic">
                            &ldquo;{record.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: INVENTORY USAGE */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="glass-panel border-border/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center space-x-2">
                  <Boxes className="h-5 w-5 text-purple-500" />
                  <span>Site Material Consumption</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Stock-out vouchers issued from the central inventory to {project.name}.
                </CardDescription>
              </div>
              <Button
                variant="amber"
                size="sm"
                onClick={() => setStockOutOpen(true)}
                className="rounded-xl text-xs shadow-sm"
              >
                <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                Issue Material to Site
              </Button>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-3 py-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : projectTransactions.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
                  <Boxes className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <h3 className="text-sm font-bold text-foreground">No material issues</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    No Stock-Out transactions have been assigned to this project yet.
                  </p>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => setStockOutOpen(true)}
                    className="mt-4 rounded-xl"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1.5" />
                    Issue First Material
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-muted-foreground bg-muted/40 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Reference</th>
                        <th className="px-4 py-3 font-semibold">Material Code & Name</th>
                        <th className="px-4 py-3 font-semibold text-right">Quantity Consumed</th>
                        <th className="px-4 py-3 font-semibold">Issue Date</th>
                        <th className="px-4 py-3 font-semibold">Notes / Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {projectTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-xs text-sky-500">
                            {tx.reference}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-foreground">{tx.material.name}</span>
                            <span className="text-xs text-muted-foreground ml-1.5 font-mono">
                              ({tx.material.code})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-bold text-rose-500">
                            -{tx.quantity} {tx.material.unit}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground italic">
                            {tx.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Project Dialog */}
      <ProjectFormDialog
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        projectToEdit={project}
      />

      {/* Delete Project Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Soft Delete"
        description={`Are you sure you want to delete "${project.name}" (${project.code})? It will be archived and hidden from project views.`}
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteProjectMutation.isPending}
            onClick={handleDeleteProject}
          >
            Delete Project
          </Button>
        </div>
      </Dialog>

      {/* BOQ Item Dialog */}
      <BoqItemDialog
        isOpen={addBoqOpen}
        onClose={() => {
          setAddBoqOpen(false);
          setEditingBoqItem(null);
        }}
        projectId={project.id}
        itemToEdit={editingBoqItem}
      />

      {/* Delete BOQ Item Dialog */}
      <Dialog
        isOpen={Boolean(deletingBoqId)}
        onClose={() => setDeletingBoqId(null)}
        title="Remove BOQ Item"
        description="Are you sure you want to remove this BOQ line item?"
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => setDeletingBoqId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteBoqMutation.isPending}
            onClick={async () => {
              if (deletingBoqId) {
                await deleteBoqMutation.mutateAsync(deletingBoqId);
                setDeletingBoqId(null);
              }
            }}
          >
            Remove Item
          </Button>
        </div>
      </Dialog>

      {/* Progress Dialog */}
      <ProgressFormDialog
        isOpen={addProgressOpen}
        onClose={() => {
          setAddProgressOpen(false);
          setEditingProgress(null);
        }}
        defaultProjectId={project.id}
        recordToEdit={editingProgress}
      />

      {/* Delete Progress Record Dialog */}
      <Dialog
        isOpen={Boolean(deletingProgressId)}
        onClose={() => setDeletingProgressId(null)}
        title="Delete Milestone Record"
        description="Are you sure you want to remove this milestone record?"
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => setDeletingProgressId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteProgressMutation.isPending}
            onClick={async () => {
              if (deletingProgressId) {
                await deleteProgressMutation.mutateAsync(deletingProgressId);
                setDeletingProgressId(null);
              }
            }}
          >
            Delete Record
          </Button>
        </div>
      </Dialog>

      {/* Stock Out Shortcut Modal */}
      <StockOutDialog
        isOpen={stockOutOpen}
        onClose={() => setStockOutOpen(false)}
        defaultProjectId={project.id}
      />
    </div>
  );
}
