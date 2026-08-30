'use client';

import * as React from 'react';
import {
  Boxes,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { useMaterials, useDeleteMaterial } from '@/hooks/use-materials';
import { MaterialFormDialog } from '@/components/materials/material-form-dialog';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { MaterialWithStockFlag } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { getPageCount } from '@/lib/utils';

export default function MaterialsPage() {
  const [search, setSearch] = React.useState('');
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<MaterialWithStockFlag | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = React.useState<string | null>(null);

  // Quick Action Dialogs for specific material
  const [quickStockInId, setQuickStockInId] = React.useState<string | null>(null);
  const [quickStockOutId, setQuickStockOutId] = React.useState<string | null>(null);

  const { data: materialsData, isLoading } = useMaterials({
    page,
    limit,
    search: search || undefined,
    lowStock: lowStockOnly ? true : undefined,
  });

  const deleteMutation = useDeleteMaterial();

  const materials = materialsData?.data ?? [];
  const meta = materialsData?.meta;
  const pageCount = getPageCount(meta);

  const columns = React.useMemo<ColumnDef<MaterialWithStockFlag>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-sky-500">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Material Name',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-medium">
            {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'currentStock',
        header: 'Current Stock',
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <span className="text-xs font-bold text-foreground">
            {row.original.currentStock} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'minimumStock',
        header: 'Min Threshold',
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-medium">
            {row.original.minimumStock} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'isLowStock',
        header: 'Stock Status',
        cell: ({ row }) =>
          row.original.isLowStock ? (
            <Badge variant="warning" className="font-bold flex items-center w-fit">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          ) : (
            <Badge variant="success" className="font-medium flex items-center w-fit">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Healthy
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickStockInId(row.original.id)}
              className="h-7 px-2 text-xs rounded-lg text-emerald-500 hover:bg-emerald-500/10"
              title="Quick Stock-In"
            >
              <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
              In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickStockOutId(row.original.id)}
              className="h-7 px-2 text-xs rounded-lg text-rose-500 hover:bg-rose-500/10"
              title="Quick Stock-Out"
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              Out
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingMaterial(row.original)}
              className="h-8 w-8 text-muted-foreground hover:text-blue-500"
              title="Edit Material"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingMaterialId(row.original.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete Material"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const handleDeleteConfirm = async () => {
    if (!deletingMaterialId) return;
    await deleteMutation.mutateAsync(deletingMaterialId);
    setDeletingMaterialId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Materials"
        description="Stock levels and reorder minimums."
        actions={
          <Button
            variant="amber"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Material
          </Button>
        }
      />

      {/* Filter and Search Controls */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by code, material name..."
              className="pl-9 bg-background/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={!lowStockOnly ? 'amber' : 'outline'}
              size="sm"
              onClick={() => {
                setLowStockOnly(false);
                setPage(1);
              }}
              className="text-xs h-8 rounded-lg"
            >
              All Materials
            </Button>
            <Button
              variant={lowStockOnly ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => {
                setLowStockOnly(true);
                setPage(1);
              }}
              className="text-xs h-8 rounded-lg"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Stock Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table View */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Boxes className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-foreground">No materials found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {search || lowStockOnly
                  ? 'No materials match your filter criteria.'
                  : 'Get started by creating your first material in the catalogue.'}
              </p>
              {!search && !lowStockOnly && (
                <Button
                  variant="amber"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                  className="mt-4 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Material
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={materials}
              getRowId={(material) => material.id}
              pagination={
                meta
                  ? {
                      page,
                      pageCount,
                      total: meta.total,
                      pageSize: meta.limit,
                      onPageChange: setPage,
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Material Dialog */}
      <MaterialFormDialog
        isOpen={createDialogOpen || Boolean(editingMaterial)}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingMaterial(null);
        }}
        materialToEdit={editingMaterial}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingMaterialId)}
        onClose={() => setDeletingMaterialId(null)}
        title="Delete Material"
        description="Are you sure you want to delete this material? Note: materials with existing stock movements cannot be deleted to protect audit history."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => setDeletingMaterialId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={handleDeleteConfirm}
          >
            Delete Material
          </Button>
        </div>
      </Dialog>

      {/* Stock In Quick Modal */}
      <StockInDialog
        isOpen={Boolean(quickStockInId)}
        onClose={() => setQuickStockInId(null)}
        defaultMaterialId={quickStockInId || undefined}
      />

      {/* Stock Out Quick Modal */}
      <StockOutDialog
        isOpen={Boolean(quickStockOutId)}
        onClose={() => setQuickStockOutId(null)}
        defaultMaterialId={quickStockOutId || undefined}
      />
    </div>
  );
}
