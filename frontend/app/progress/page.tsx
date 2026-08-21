'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { useProgressRecords, useDeleteProgress } from '@/hooks/use-progress';
import { useProjects } from '@/hooks/use-projects';
import { ProgressFormDialog } from '@/components/progress/progress-form-dialog';
import { ProgressRecord } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ProgressPage() {
  const [projectFilter, setProjectFilter] = React.useState<string>('');
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [addProgressOpen, setAddProgressOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<ProgressRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = React.useState<string | null>(null);

  const { data: progressData, isLoading } = useProgressRecords({
    page,
    limit,
    projectId: projectFilter || undefined,
  });

  const { data: projectsData } = useProjects({ limit: 100 });

  const deleteMutation = useDeleteProgress(projectFilter || undefined);

  const records = progressData?.data ?? [];
  const meta = progressData?.meta;
  const projects = projectsData?.data ?? [];

  const handleDeleteConfirm = async () => {
    if (!deletingRecordId) return;
    await deleteMutation.mutateAsync(deletingRecordId);
    setDeletingRecordId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Project Progress & Milestones"
        description="Chronological log of construction completion stages across all ongoing and completed sites."
        actions={
          <Button
            variant="amber"
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setAddProgressOpen(true);
            }}
            className="rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Log Milestone
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Filter by Project:
            </span>
            <Select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64 text-xs h-9"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {records.length} milestone updates
          </p>
        </CardContent>
      </Card>

      {/* Progress Milestones Feed */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 px-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-foreground">No progress records found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {projectFilter
                  ? 'No progress reports logged for this selected project.'
                  : 'Start tracking project execution by logging milestone completions.'}
              </p>
              <Button
                variant="amber"
                size="sm"
                onClick={() => {
                  setEditingRecord(null);
                  setAddProgressOpen(true);
                }}
                className="mt-4 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Log First Milestone
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-background/50 border border-border/80 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/projects/${record.project.id}`}
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          {record.project.code}
                        </Link>
                        <Link
                          href={`/projects/${record.project.id}`}
                          className="font-bold text-foreground hover:text-amber-500 hover:underline text-sm"
                        >
                          {record.project.name}
                        </Link>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {record.description}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant="success" className="font-bold text-sm px-3 py-1">
                        {record.percentage}% Complete
                      </Badge>
                      <div className="flex items-center space-x-1 pl-2 border-l border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRecord(record);
                            setAddProgressOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingRecordId(record.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {record.notes && (
                    <p className="mt-3 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl italic">
                      &ldquo;{record.notes}&rdquo;
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Milestone Date: {formatDate(record.date)}
                    </span>
                    <span>Logged {formatDate(record.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.pageCount > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border text-xs">
              <span className="text-muted-foreground">
                Showing {((meta.page - 1) * meta.limit) + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} reports
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage(page - 1)}
                  className="h-8 px-2.5"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="font-semibold text-foreground px-2">
                  Page {meta.page} of {meta.pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage(page + 1)}
                  className="h-8 px-2.5"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Modal */}
      <ProgressFormDialog
        isOpen={addProgressOpen}
        onClose={() => {
          setAddProgressOpen(false);
          setEditingRecord(null);
        }}
        recordToEdit={editingRecord}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingRecordId)}
        onClose={() => setDeletingRecordId(null)}
        title="Delete Milestone Record"
        description="Are you sure you want to remove this milestone record?"
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => setDeletingRecordId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={handleDeleteConfirm}
          >
            Delete Record
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
