'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Boxes,
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { useMaterials, useDeleteMaterial } from '@/hooks/use-materials';
import { MaterialFormDialog } from '@/components/materials/material-form-dialog';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { MaterialWithStockFlag } from '@/types';
import { exportToStyledExcel, exportToStyledPdf, exportToCsv } from '@/lib/export-utils';
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

function MaterialsTableContent() {
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get('highlight');
  const searchParam = searchParams.get('search');

  const [search, setSearch] = React.useState(searchParam || '');
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Track highlighted material
  const [selectedMaterialId, setSelectedMaterialId] = React.useState<string | null>(highlightParam);
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
  const highlightTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<MaterialWithStockFlag | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = React.useState<string | null>(null);

  const [quickStockInId, setQuickStockInId] = React.useState<string | null>(null);
  const [quickStockOutId, setQuickStockOutId] = React.useState<string | null>(null);

  const { sortKey, sortDirection, toggleSort, sortItems } = useTableSort<MaterialWithStockFlag>(
    null,
    null,
    {
      currentStock: (m) => Number(m.currentStock),
      minimumStock: (m) => Number(m.minimumStock),
      status: (m) => (m.isLowStock ? 0 : 1),
    }
  );

  const { data: materialsData, isLoading } = useMaterials({
    page,
    limit: pageSize,
    search: search || undefined,
    lowStock: lowStockOnly ? true : undefined,
  });

  const deleteMutation = useDeleteMaterial();
  const rawMaterials = materialsData?.data ?? [];
  const meta = materialsData?.meta;
  const materials = React.useMemo(() => sortItems(rawMaterials), [rawMaterials, sortItems]);

  const totalResults = meta?.total ?? materials.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;

  const triggerHighlight = React.useCallback((id: string) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    setSelectedMaterialId(id);

    highlightTimeoutRef.current = setTimeout(() => {
      setSelectedMaterialId(null);
    }, 3000);
  }, []);

  React.useEffect(() => {
    if (highlightParam) {
      triggerHighlight(highlightParam);

      const scrollTimer = setTimeout(() => {
        const rowEl = document.getElementById(`material-row-${highlightParam}`);
        if (rowEl) {
          rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);

      return () => clearTimeout(scrollTimer);
    }
  }, [highlightParam, triggerHighlight]);

  React.useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingMaterialId) return;
    await deleteMutation.mutateAsync(deletingMaterialId);
    setDeletingMaterialId(null);
  };

  const columnsDef = [
    { header: 'Material Code', key: 'code', width: 16, align: 'left' as const },
    { header: 'Material Name', key: 'name', width: 28, align: 'left' as const },
    { header: 'Unit', key: 'unit', width: 12, align: 'center' as const },
    { header: 'Current Stock', key: 'currentStock', width: 16, align: 'right' as const, format: 'number' as const },
    { header: 'Min Threshold', key: 'minimumStock', width: 16, align: 'right' as const, format: 'number' as const },
    { header: 'Stock Status', key: 'status', width: 16, align: 'center' as const },
  ];

  const exportData = materials.map((m) => ({
    code: m.code,
    name: m.name,
    unit: m.unit,
    currentStock: Number(m.currentStock),
    minimumStock: Number(m.minimumStock),
    status: m.isLowStock ? 'LOW STOCK' : 'HEALTHY',
  }));

  const handleExportExcel = () => {
    setExportMenuOpen(false);
    exportToStyledExcel({
      title: 'Materials Inventory & Warehouse Stock Report',
      subtitle: 'ConstructCMS Real-time Stock Ledger & Safety Thresholds',
      filename: `ConstructCMS_Materials_${new Date().toISOString().slice(0, 10)}`,
      columns: columnsDef,
      data: exportData,
    });
  };

  const handleExportPdf = () => {
    setExportMenuOpen(false);
    exportToStyledPdf({
      title: 'Materials Inventory Report',
      subtitle: 'Warehouse Stock Ledger & Reorder Thresholds',
      filename: `ConstructCMS_Materials_${new Date().toISOString().slice(0, 10)}`,
      columns: columnsDef,
      data: exportData,
    });
  };

  const handleExportCsv = () => {
    setExportMenuOpen(false);
    exportToCsv(exportData, `ConstructCMS_Materials_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <PageHeader
        title="Materials Catalogue"
        description="Warehouse stock inventory, minimum reorder thresholds, and material ledger."
      />

      {/* Subcategory Status Tabs */}
      <div className="flex items-center space-x-1 border-b border-border pb-2 text-xs">
        <button
          onClick={() => {
            setLowStockOnly(false);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            !lowStockOnly
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All Materials
        </button>
        <button
          onClick={() => {
            setLowStockOnly(true);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            lowStockOnly
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Low Stock Alerts
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
        <div className="relative w-56 sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search materials..."
            className="pl-8 h-7 text-xs bg-card"
          />
        </div>

        <div className="flex items-center space-x-2 relative">
          {/* Export Dropdown Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="font-medium"
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
            className="font-semibold"
          >
            <Plus className="h-3 w-3 mr-1" />
            New Material
          </Button>
        </div>
      </div>

      {/* Materials Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Boxes className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold text-foreground">No materials found</p>
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
                      label="Material"
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
                      label="Unit"
                      sortKey="unit"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <TableSortHeader
                      label="Current Stock"
                      sortKey="currentStock"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                      align="right"
                    />
                    <TableSortHeader
                      label="Min Threshold"
                      sortKey="minimumStock"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                      align="right"
                    />
                    <TableSortHeader
                      label="Stock Status"
                      sortKey="status"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <th className="px-3 py-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {materials.map((mat) => {
                    const initials = getInitials(mat.name);
                    const isHighlighted = selectedMaterialId === mat.id || selectedMaterialId === mat.code;

                    return (
                      <tr
                        key={mat.id}
                        id={`material-row-${mat.id}`}
                        onClick={() => triggerHighlight(mat.id)}
                        className={`transition-all duration-500 cursor-pointer ${
                          isHighlighted
                            ? 'bg-orange-50/90 dark:bg-orange-950/60 ring-2 ring-[#EA580C] dark:ring-orange-500 shadow-xs font-medium'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-6 w-6 rounded-md font-semibold flex items-center justify-center text-[10px] shrink-0 transition-colors duration-500 ${
                                isHighlighted
                                  ? 'bg-[#EA580C] text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {initials}
                            </div>
                            <span className="font-medium text-foreground">{mat.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {mat.code}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{mat.unit}</td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground">
                          {mat.currentStock} <span className="text-[10px] text-muted-foreground">{mat.unit}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {mat.minimumStock} <span className="text-[10px]">{mat.unit}</span>
                        </td>
                        <td className="px-3 py-2">
                          {mat.isLowStock ? (
                            <Badge variant="warning" className="text-[10px] py-0">
                              ⚠️ Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] py-0">
                              Healthy
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div
                            className="flex items-center justify-end space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setQuickStockInId(mat.id)}
                              className="h-6 px-1.5 text-emerald-700 dark:text-emerald-400"
                              title="Stock In"
                            >
                              +In
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setQuickStockOutId(mat.id)}
                              className="h-6 px-1.5 text-red-700 dark:text-red-400"
                              title="Stock Out"
                            >
                              -Out
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setEditingMaterial(mat)}
                              className="h-6 px-1.5 text-muted-foreground hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setDeletingMaterialId(mat.id)}
                              className="h-6 px-1.5 text-muted-foreground hover:text-destructive"
                              title="Delete"
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

      {/* Dialog Modals */}
      <MaterialFormDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
      <MaterialFormDialog
        isOpen={!!editingMaterial}
        onClose={() => setEditingMaterial(null)}
        materialToEdit={editingMaterial}
      />
      <StockInDialog
        isOpen={!!quickStockInId}
        onClose={() => setQuickStockInId(null)}
        defaultMaterialId={quickStockInId || undefined}
      />
      <StockOutDialog
        isOpen={!!quickStockOutId}
        onClose={() => setQuickStockOutId(null)}
        defaultMaterialId={quickStockOutId || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deletingMaterialId}
        onClose={() => setDeletingMaterialId(null)}
        title="Delete Material"
      >
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            Are you sure you want to delete this material catalogue entry? This action cannot be undone if there are existing inventory stock movements linked to it.
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setDeletingMaterialId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="xs"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-3">
          <PageHeader title="Materials Catalogue" description="Loading materials catalogue..." />
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </div>
      }
    >
      <MaterialsTableContent />
    </React.Suspense>
  );
}
