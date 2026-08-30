'use client';

import * as React from 'react';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { useInventoryTransactions } from '@/hooks/use-inventory';
import { useMaterials } from '@/hooks/use-materials';
import { useProjects } from '@/hooks/use-projects';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { InventoryTransaction, TransactionType } from '@/types';
import { formatDate, getPageCount } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';

export default function InventoryPage() {
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | undefined>(undefined);
  const [materialFilter, setMaterialFilter] = React.useState<string>('');
  const [projectFilter, setProjectFilter] = React.useState<string>('');
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [stockInOpen, setStockInOpen] = React.useState(false);
  const [stockOutOpen, setStockOutOpen] = React.useState(false);

  const { data: txData, isLoading } = useInventoryTransactions({
    page,
    limit,
    type: typeFilter,
    materialId: materialFilter || undefined,
    projectId: projectFilter || undefined,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
  });

  const { data: materialsData } = useMaterials({ limit: 100 });
  const { data: projectsData } = useProjects({ limit: 100 });

  const transactions = txData?.data ?? [];
  const meta = txData?.meta;
  const pageCount = getPageCount(meta);
  const materials = materialsData?.data ?? [];
  const projects = projectsData?.data ?? [];

  const columns = React.useMemo<ColumnDef<InventoryTransaction>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) =>
          row.original.type === 'STOCK_IN' ? (
            <Badge
              variant="success"
              className="font-bold flex items-center w-fit text-[11px]"
            >
              <ArrowDownLeft className="h-3 w-3 mr-1" />
              Stock In
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="font-bold flex items-center w-fit text-[11px]"
            >
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Stock Out
            </Badge>
          ),
      },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-sky-500">
            {row.original.reference}
          </span>
        ),
      },
      {
        id: 'material',
        accessorFn: (row) => row.material.name,
        header: 'Material',
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-foreground">{row.original.material.name}</span>
            <span className="text-xs text-muted-foreground ml-1.5 font-mono">
              ({row.original.material.code})
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <span
            className={`text-xs font-bold ${
              row.original.type === 'STOCK_IN' ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {row.original.type === 'STOCK_IN' ? '+' : '-'}
            {row.original.quantity} {row.original.material.unit}
          </span>
        ),
      },
      {
        id: 'project',
        accessorFn: (row) => row.project?.name ?? '',
        header: 'Project Destination',
        cell: ({ row }) =>
          row.original.project ? (
            <span className="text-xs font-medium text-foreground">
              {row.original.project.name}{' '}
              <span className="text-muted-foreground font-mono">
                ({row.original.project.code})
              </span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              General Warehouse Receipt
            </span>
          ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{formatDate(row.original.date)}</span>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground italic max-w-xs truncate block">
            {row.original.notes || '—'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventory"
        description="Stock-in and stock-out history."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockInOpen(true)}
              className="rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <ArrowDownLeft className="h-4 w-4 mr-1.5" />
              Stock In (Receipt)
            </Button>
            <Button
              variant="amber"
              size="sm"
              onClick={() => setStockOutOpen(true)}
              className="rounded-xl shadow-sm"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              Stock Out (Issue)
            </Button>
          </div>
        }
      />

      {/* Filter and Query Panel */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Transaction Type Filters */}
            <div className="flex items-center gap-1.5">
              <Button
                variant={typeFilter === undefined ? 'amber' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter(undefined);
                  setPage(1);
                }}
                className="text-xs h-9 rounded-lg"
              >
                All Movements
              </Button>
              <Button
                variant={typeFilter === 'STOCK_IN' ? 'amber' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter('STOCK_IN');
                  setPage(1);
                }}
                className="text-xs h-9 rounded-lg text-emerald-500"
              >
                <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
                Stock In
              </Button>
              <Button
                variant={typeFilter === 'STOCK_OUT' ? 'amber' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter('STOCK_OUT');
                  setPage(1);
                }}
                className="text-xs h-9 rounded-lg text-rose-500"
              >
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                Stock Out
              </Button>
            </div>

            {/* Material Filter */}
            <div className="w-48">
              <Select
                value={materialFilter}
                onChange={(e) => {
                  setMaterialFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs"
              >
                <option value="">All Materials</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </Select>
            </div>

            {/* Project Filter */}
            <div className="w-48">
              <Select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground ml-auto">
              <span>From:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-36 text-xs"
              />
              <span>To:</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-36 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table View */}
      <Card className="glass-panel border-border/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-foreground">No inventory transactions found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No movements match your criteria. Record a stock-in receipt or stock-out issue.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={transactions}
              getRowId={(tx) => tx.id}
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

      {/* Stock In & Stock Out Dialogs */}
      <StockInDialog
        isOpen={stockInOpen}
        onClose={() => setStockInOpen(false)}
      />
      <StockOutDialog
        isOpen={stockOutOpen}
        onClose={() => setStockOutOpen(false)}
      />
    </div>
  );
}
