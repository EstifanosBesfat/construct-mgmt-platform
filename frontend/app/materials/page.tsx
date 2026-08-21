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
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { useMaterials, useDeleteMaterial } from '@/hooks/use-materials';
import { MaterialFormDialog } from '@/components/materials/material-form-dialog';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { MaterialWithStockFlag } from '@/types';

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

  const handleDeleteConfirm = async () => {
    if (!deletingMaterialId) return;
    await deleteMutation.mutateAsync(deletingMaterialId);
    setDeletingMaterialId(null);
  };

  const lowStockCount = materials.filter((m) => m.isLowStock).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Materials & Inventory Catalogue"
        description="Monitor warehouse stock levels, configure reorder minimums, and track material availability."
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
            <div className="text-center py-16 px-4">
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Code</th>
                    <th className="px-4 py-3.5 font-semibold">Material Name</th>
                    <th className="px-4 py-3.5 font-semibold">Unit</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Current Stock</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Min Threshold</th>
                    <th className="px-4 py-3.5 font-semibold">Stock Status</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {materials.map((mat) => (
                    <tr
                      key={mat.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-xs text-amber-500">
                        {mat.code}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-foreground">
                        {mat.name}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                        {mat.unit}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-right font-bold text-foreground">
                        {mat.currentStock} {mat.unit}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-right text-muted-foreground font-medium">
                        {mat.minimumStock} {mat.unit}
                      </td>
                      <td className="px-4 py-3.5">
                        {mat.isLowStock ? (
                          <Badge variant="warning" className="font-bold flex items-center w-fit">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" className="font-medium flex items-center w-fit">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Healthy
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickStockInId(mat.id)}
                            className="h-7 px-2 text-xs rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                            title="Quick Stock-In"
                          >
                            <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
                            In
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickStockOutId(mat.id)}
                            className="h-7 px-2 text-xs rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title="Quick Stock-Out"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                            Out
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingMaterial(mat)}
                            className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                            title="Edit Material"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingMaterialId(mat.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete Material"
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
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} materials
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
