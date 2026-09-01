'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { useProgressRecords, useDeleteProgress } from '@/hooks/use-progress';
import { useProjects } from '@/hooks/use-projects';
import { ProgressFormDialog } from '@/components/progress/progress-form-dialog';
import { ProgressRecord, Project } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ProgressPage() {
  const [projectFilter, setProjectFilter] = React.useState<string>('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [addProgressOpen, setAddProgressOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<ProgressRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = React.useState<string | null>(null);

  const { data: progressData, isLoading } = useProgressRecords({
    page,
    limit: pageSize,
    projectId: projectFilter || undefined,
  });

  const { data: projectsData } = useProjects({ limit: 100 });
  const deleteMutation = useDeleteProgress(projectFilter || undefined);

  const records: ProgressRecord[] = progressData?.data ?? [];
  const meta = progressData?.meta;
  const projects: Project[] = projectsData?.data ?? [];

  const totalResults = meta?.total ?? records.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;

  const handleDeleteConfirm = async () => {
    if (!deletingRecordId) return;
    await deleteMutation.mutateAsync(deletingRecordId);
    setDeletingRecordId(null);
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <PageHeader
        title="Milestone Progress Tracking"
        description="Field progress completion logs across construction sites."
      />

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
        <div className="flex items-center space-x-2">
          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
            className="h-7 text-xs px-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <option value="">+ All Projects</option>
            {projects.map((p: Project) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="default"
          size="xs"
          onClick={() => {
            setEditingRecord(null);
            setAddProgressOpen(true);
          }}
          className="font-semibold"
        >
          <Plus className="h-3 w-3 mr-1" />
          Log Milestone
        </Button>
      </div>

      {/* Progress Records List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 px-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold text-foreground">No progress records found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Log a milestone to track execution.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {records.map((record: ProgressRecord) => (
                <div
                  key={record.id}
                  className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/projects/${record.project.id}`}
                        className="font-mono text-[11px] font-bold text-foreground bg-muted px-1.5 py-0.5 rounded hover:underline"
                      >
                        {record.project.code}
                      </Link>
                      <Link
                        href={`/projects/${record.project.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {record.project.name}
                      </Link>
                      <Badge variant="success" className="text-[10px] font-bold">
                        {record.percentage}%
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground text-xs">{record.description}</p>
                    {record.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        &ldquo;{record.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-muted-foreground text-[11px]">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(record.date)}
                    </span>
                    <div className="flex items-center space-x-1 pl-2 border-l border-border">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setEditingRecord(record);
                          setAddProgressOpen(true);
                        }}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setDeletingRecordId(record.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            totalResults={totalResults}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProgressFormDialog
        isOpen={addProgressOpen}
        onClose={() => {
          setAddProgressOpen(false);
          setEditingRecord(null);
        }}
        recordToEdit={editingRecord}
      />

      <Dialog
        isOpen={Boolean(deletingRecordId)}
        onClose={() => setDeletingRecordId(null)}
        title="Delete Milestone Record"
        description="Are you sure you want to delete this milestone record?"
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-2 pt-3">
          <Button variant="outline" size="sm" onClick={() => setDeletingRecordId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
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
