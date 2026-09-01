'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { Project, ProjectStatus } from '@/types';
import { formatNumber, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { exportToStyledExcel, exportToStyledPdf, exportToCsv } from '@/lib/export-utils';
import { Dialog } from '@/components/ui/dialog';
import { TableSortHeader, useTableSort } from '@/components/ui/table-sort';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProjectsPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | undefined>(undefined);
  const [locationFilter, setLocationFilter] = React.useState<string>('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = React.useState<string | null>(null);

  const { sortKey, sortDirection, toggleSort, sortItems } = useTableSort<Project>(
    null,
    null,
    {
      timeline: (p) => p.startDate,
      boqValue: (p) => (p as any).boqValue ?? p.budget,
    }
  );

  const { data: projectsData, isLoading } = useProjects({
    page,
    limit: pageSize,
    search: search || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeleteProject();
  const projects = projectsData?.data ?? [];
  const meta = projectsData?.meta;

  const locations = Array.from(new Set(projects.map((p) => p.location))).filter(Boolean);
  const filteredProjects = locationFilter
    ? projects.filter((p) => p.location.toLowerCase().includes(locationFilter.toLowerCase()))
    : projects;

  const sortedProjects = React.useMemo(() => sortItems(filteredProjects), [filteredProjects, sortItems]);

  const totalResults = meta?.total ?? filteredProjects.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;

  const handleDeleteConfirm = async () => {
    if (!deletingProjectId) return;
    await deleteMutation.mutateAsync(deletingProjectId);
    setDeletingProjectId(null);
  };

  const projectColumnsDef = [
    { header: 'Project Code', key: 'code', width: 16, align: 'left' as const },
    { header: 'Project Name', key: 'name', width: 28, align: 'left' as const },
    { header: 'Client', key: 'client', width: 20, align: 'left' as const },
    { header: 'Location', key: 'location', width: 18, align: 'left' as const },
    { header: 'Start Date', key: 'startDate', width: 14, align: 'center' as const },
    { header: 'End Date', key: 'endDate', width: 14, align: 'center' as const },
    { header: 'Budget (ETB)', key: 'budget', width: 18, align: 'right' as const, format: 'currency' as const },
    { header: 'BOQ Value (ETB)', key: 'boqValue', width: 18, align: 'right' as const, format: 'currency' as const },
    { header: 'Status', key: 'status', width: 14, align: 'center' as const },
  ];

  const exportData = filteredProjects.map((p) => ({
    code: p.code,
    name: p.name,
    client: p.clientName,
    location: p.location,
    startDate: formatDate(p.startDate),
    endDate: formatDate(p.endDate),
    budget: Number(p.budget),
    boqValue: Number((p as any).boqValue ?? p.budget),
    status: p.status,
  }));

  const totalBudget = exportData.reduce((acc, curr) => acc + curr.budget, 0);
  const totalBoq = exportData.reduce((acc, curr) => acc + curr.boqValue, 0);

  const handleExportExcel = () => {
    setExportMenuOpen(false);
    exportToStyledExcel({
      title: 'Project Portfolio & Contract Financial Summary',
      subtitle: 'ConstructCMS Enterprise Project Lifecycle Report',
      filename: `ConstructCMS_Projects_${new Date().toISOString().slice(0, 10)}`,
      columns: projectColumnsDef,
      data: exportData,
      summaryTotals: {
        budget: totalBudget,
        boqValue: totalBoq,
      },
    });
  };

  const handleExportPdf = () => {
    setExportMenuOpen(false);
    exportToStyledPdf({
      title: 'Project Portfolio Summary Report',
      subtitle: 'Contract Budgets, Measured BOQ, and Timelines',
      filename: `ConstructCMS_Projects_${new Date().toISOString().slice(0, 10)}`,
      columns: projectColumnsDef,
      data: exportData,
    });
  };

  const handleExportCsv = () => {
    setExportMenuOpen(false);
    exportToCsv(exportData, `ConstructCMS_Projects_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <PageHeader
        title="Project Management"
        description="Active construction sites, contract budgets, and project lifecycles."
      />

      {/* Subcategory Status Tabs */}
      <div className="flex items-center space-x-1 border-b border-border pb-2 text-xs">
        <button
          onClick={() => {
            setStatusFilter(undefined);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === undefined
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All Projects
        </button>
        <button
          onClick={() => {
            setStatusFilter('ONGOING');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === 'ONGOING'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Ongoing
        </button>
        <button
          onClick={() => {
            setStatusFilter('PLANNED');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === 'PLANNED'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Planned
        </button>
        <button
          onClick={() => {
            setStatusFilter('COMPLETED');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-56 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search projects..."
              className="pl-8 h-7 text-xs bg-card"
            />
          </div>

          {/* Location Filter Pill */}
          {locations.length > 0 && (
            <div className="flex items-center space-x-1">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-7 text-xs px-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <option value="">+ All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Export Dropdown Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="text-xs font-medium"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>

            {exportMenuOpen && (
              <div
                className="absolute right-0 mt-1 z-30 w-44 rounded-md border border-border bg-card shadow-lg p-1 text-xs animate-in fade-in-0 zoom-in-95"
                onMouseLeave={() => setExportMenuOpen(false)}
              >
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center px-2.5 py-1.5 text-left rounded hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                  <span>Excel Sheet (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center px-2.5 py-1.5 text-left rounded hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 mr-2 text-red-600" />
                  <span>PDF Document (.pdf)</span>
                </button>
              </div>
            )}
          </div>
          <Button
            variant="default"
            size="xs"
            onClick={() => setCreateDialogOpen(true)}
            className="text-xs font-semibold"
          >
            <Plus className="h-3 w-3 mr-1" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold text-foreground">No projects found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Try clearing search or filter parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase text-muted-foreground bg-muted/60 border-b border-border">
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
                      label="Timeline"
                      sortKey="timeline"
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
                      label="Status"
                      sortKey="status"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <th className="px-3 py-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedProjects.map((project) => {
                    const initials = getInitials(project.name);

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-muted/40 transition-colors group"
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-md bg-muted text-muted-foreground font-semibold flex items-center justify-center text-[10px] shrink-0">
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
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                          {formatDate(project.startDate)} → {formatDate(project.endDate)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatNumber(project.budget, 0)} <span className="text-[10px] text-muted-foreground">ETB</span>
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {formatNumber((project as any).boqValue ?? project.budget, 0)} <span className="text-[10px]">ETB</span>
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
                          <div className="flex items-center justify-end space-x-1">
                            <Link href={`/projects/${project.id}`}>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="h-6 px-1.5 text-muted-foreground hover:text-foreground"
                                title="View Details"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setEditingProject(project)}
                              className="h-6 px-1.5 text-muted-foreground hover:text-blue-600"
                              title="Edit Project"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setDeletingProjectId(project.id)}
                              className="h-6 px-1.5 text-muted-foreground hover:text-destructive"
                              title="Delete Project"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
        title="Confirm Project Deletion"
        description="Are you sure you want to delete this project? It will be archived and hidden from active views."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-2 pt-3">
          <Button variant="outline" size="sm" onClick={() => setDeletingProjectId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
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
