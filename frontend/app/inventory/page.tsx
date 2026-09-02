'use client';

import * as React from 'react';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { useInventoryTransactions } from '@/hooks/use-inventory';
import { useMaterials } from '@/hooks/use-materials';
import { useProjects } from '@/hooks/use-projects';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import {
  InventoryTransaction,
  MaterialWithStockFlag,
  Project,
  TransactionType,
} from '@/types';
import { formatDate } from '@/lib/utils';
import { exportToStyledExcel, exportToStyledPdf, exportToCsv } from '@/lib/export-utils';
import { TableSortHeader, useTableSort } from '@/components/ui/table-sort';

export default function InventoryPage() {
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | undefined>(undefined);
  const [materialFilter, setMaterialFilter] = React.useState<string>('');
  const [projectFilter, setProjectFilter] = React.useState<string>('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);

  const [stockInOpen, setStockInOpen] = React.useState(false);
  const [stockOutOpen, setStockOutOpen] = React.useState(false);

  const { sortKey, sortDirection, toggleSort, sortItems } = useTableSort<InventoryTransaction>(
    null,
    null,
    {
      quantity: (t) => Number(t.quantity),
      material: (t) => t.material?.name ?? '',
      project: (t) => t.project?.name ?? '',
    }
  );

  const { data: txData, isLoading } = useInventoryTransactions({
    page,
    limit: pageSize,
    type: typeFilter,
    materialId: materialFilter || undefined,
    projectId: projectFilter || undefined,
  });

  const { data: materialsData } = useMaterials({ limit: 100 });
  const { data: projectsData } = useProjects({ limit: 100 });

  const rawTransactions = txData?.data ?? [];
  const meta = txData?.meta;
  const materials: MaterialWithStockFlag[] = materialsData?.data ?? [];
  const projects: Project[] = projectsData?.data ?? [];

  const transactions = React.useMemo(() => sortItems(rawTransactions), [rawTransactions, sortItems]);

  const totalResults = meta?.total ?? transactions.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;

  const inventoryColumnsDef = [
    { header: 'Type', key: 'type', width: 14, align: 'center' as const },
    { header: 'Reference', key: 'reference', width: 18, align: 'left' as const },
    { header: 'Material Code', key: 'materialCode', width: 16, align: 'left' as const },
    { header: 'Material Name', key: 'materialName', width: 26, align: 'left' as const },
    { header: 'Quantity', key: 'quantity', width: 14, align: 'right' as const, format: 'number' as const },
    { header: 'Unit', key: 'unit', width: 10, align: 'center' as const },
    { header: 'Project / Destination', key: 'project', width: 24, align: 'left' as const },
    { header: 'Date', key: 'date', width: 14, align: 'center' as const },
    { header: 'Notes', key: 'notes', width: 28, align: 'left' as const },
  ];

  const exportData = transactions.map((t) => ({
    type: t.type === 'STOCK_IN' ? 'STOCK IN' : 'STOCK OUT',
    reference: t.reference,
    materialCode: t.material.code,
    materialName: t.material.name,
    quantity: Number(t.quantity),
    unit: t.material.unit,
    project: t.project ? `${t.project.name} (${t.project.code})` : 'Central Warehouse',
    date: formatDate(t.date),
    notes: t.notes || '',
  }));

  const handleExportExcel = () => {
    setExportMenuOpen(false);
    exportToStyledExcel({
      title: 'Inventory Stock Movements & Audit Ledger',
      subtitle: 'ConstructCMS Real-time Material Inflow & Site Consumption Report',
      filename: `ConstructCMS_Inventory_${new Date().toISOString().slice(0, 10)}`,
      columns: inventoryColumnsDef,
      data: exportData,
    });
  };

  const handleExportPdf = () => {
    setExportMenuOpen(false);
    exportToStyledPdf({
      title: 'Inventory Movement & Audit Ledger',
      subtitle: 'Material Inflow Receipts & Site Consumption Records',
      filename: `ConstructCMS_Inventory_${new Date().toISOString().slice(0, 10)}`,
      columns: inventoryColumnsDef,
      data: exportData,
    });
  };

  const handleExportCsv = () => {
    setExportMenuOpen(false);
    exportToCsv(exportData, `ConstructCMS_Inventory_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <PageHeader
        title="Inventory Movements & Ledger"
        description="Audit material inflow receipts and site outflow consumption."
      />

      {/* Subcategory Status Tabs */}
      <div className="flex items-center space-x-1 border-b border-border pb-2 text-xs">
        <button
          onClick={() => {
            setTypeFilter(undefined);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            typeFilter === undefined
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All Movements
        </button>
        <button
          onClick={() => {
            setTypeFilter('STOCK_IN');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            typeFilter === 'STOCK_IN'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Stock In (Receipts)
        </button>
        <button
          onClick={() => {
            setTypeFilter('STOCK_OUT');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            typeFilter === 'STOCK_OUT'
              ? 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Stock Out (Issues)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Material Filter */}
          <select
            value={materialFilter}
            onChange={(e) => {
              setMaterialFilter(e.target.value);
              setPage(1);
            }}
            className="h-7 text-xs px-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <option value="">+ All Materials</option>
            {materials.map((m: MaterialWithStockFlag) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
            className="h-7 text-xs px-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <option value="">+ All Destinations</option>
            {projects.map((p: Project) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Dropdown */}
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
            variant="outline"
            size="xs"
            onClick={() => setStockInOpen(true)}
            className="text-xs"
          >
            <ArrowDownLeft className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
            Stock In
          </Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => setStockOutOpen(true)}
            className="text-xs font-semibold"
          >
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Stock Out
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold text-foreground">No stock movements found</p>
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
                      label="Type"
                      sortKey="type"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <TableSortHeader
                      label="Reference"
                      sortKey="reference"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <TableSortHeader
                      label="Material"
                      sortKey="material"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <TableSortHeader
                      label="Quantity"
                      sortKey="quantity"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                      align="right"
                    />
                    <TableSortHeader
                      label="Destination / Project"
                      sortKey="project"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <TableSortHeader
                      label="Date"
                      sortKey="date"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                    <TableSortHeader
                      label="Notes"
                      sortKey="notes"
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      onSort={toggleSort}
                    />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            tx.type === 'STOCK_IN'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          {tx.type === 'STOCK_IN' ? '+ Stock In' : '- Stock Out'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {tx.reference}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground">
                        {tx.material.name} <span className="text-[10px] text-muted-foreground font-mono">({tx.material.code})</span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        <span className={tx.type === 'STOCK_IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                          {tx.type === 'STOCK_IN' ? '+' : '-'}
                          {tx.quantity} {tx.material.unit}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {tx.project ? (
                          <span className="font-medium text-foreground">
                            {tx.project.name} <span className="text-[10px] text-muted-foreground">({tx.project.code})</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Central Warehouse</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">
                        {tx.notes || '—'}
                      </td>
                    </tr>
                  ))}
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
