'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { Project, ProjectStatus } from '@/types';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { Dialog } from '@/components/ui/dialog';

export default function ProjectsPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = React.useState<string | null>(null);

  const { data: projectsData, isLoading } = useProjects({
    page,
    limit,
    search: search || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeleteProject();

  const projects = projectsData?.data ?? [];
  const meta = projectsData?.meta;

  const handleDeleteConfirm = async () => {
    if (!deletingProjectId) return;
    await deleteMutation.mutateAsync(deletingProjectId);
    setDeletingProjectId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Project Management"
        description="Create, monitor, and manage construction projects across all phases."
        actions={
          <Button
            variant="amber"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Project
          </Button>
        }
      />

      {/* Filter and Search Controls */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, code, client..."
              className="pl-9 bg-background/50"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={statusFilter === undefined ? 'amber' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(undefined);
                setPage(1);
              }}
              className="text-xs h-8 rounded-lg"
            >
              All Projects
            </Button>
            <Button
              variant={statusFilter === 'PLANNED' ? 'amber' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('PLANNED');
                setPage(1);
              }}
              className="text-xs h-8 rounded-lg"
            >
              Planned
            </Button>
            <Button
              variant={statusFilter === 'ONGOING' ? 'amber' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('ONGOING');
                setPage(1);
              }}
              className="text-xs h-8 rounded-lg"
            >
              Ongoing
            </Button>
            <Button
              variant={statusFilter === 'COMPLETED' ? 'amber' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('COMPLETED');
                setPage(1);
              }}
              className="text-xs h-8 rounded-lg"
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table View */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-foreground">No projects found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {search || statusFilter
                  ? 'Try clearing the search or filter criteria.'
                  : 'Get started by creating your first construction project.'}
              </p>
              {!search && !statusFilter && (
                <Button
                  variant="amber"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                  className="mt-4 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Code</th>
                    <th className="px-4 py-3.5 font-semibold">Project Name & Client</th>
                    <th className="px-4 py-3.5 font-semibold">Location</th>
                    <th className="px-4 py-3.5 font-semibold">Timeline</th>
                    <th className="px-4 py-3.5 font-semibold">Budget</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-xs text-amber-500">
                        {project.code}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-bold text-foreground hover:text-amber-500 hover:underline"
                        >
                          {project.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Client: {project.clientName}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {project.location}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {formatDate(project.startDate)} → {formatDate(project.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-foreground">
                        {formatCurrency(project.budget)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(project.status)}
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link href={`/projects/${project.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                              title="View Project Detail"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingProject(project)}
                            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                            title="Edit Project"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingProjectId(project.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete Project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.pageCount > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
              <span className="text-muted-foreground">
                Showing {((meta.page - 1) * meta.limit) + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} projects
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

      {/* Create / Edit Project Modal */}
      <ProjectFormDialog
        isOpen={createDialogOpen || Boolean(editingProject)}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingProject(null);
        }}
        projectToEdit={editingProject}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingProjectId)}
        onClose={() => setDeletingProjectId(null)}
        title="Confirm Soft Delete"
        description="Are you sure you want to delete this project? It will be archived and hidden from views, but historical inventory movements will be preserved."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setDeletingProjectId(null)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={handleDeleteConfirm}
          >
            Delete Project
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
