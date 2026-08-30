'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { BoqItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BoqTableProps {
  items: BoqItem[];
  totalBoqValue: number;
  onEdit: (item: BoqItem) => void;
  onDelete: (id: string) => void;
}

export function BoqTable({ items, totalBoqValue, onEdit, onDelete }: BoqTableProps) {
  const [search, setSearch] = React.useState('');

  const columns = React.useMemo<ColumnDef<BoqItem>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        enableSorting: false,
        cell: ({ row, table }) => {
          const index = table
            .getSortedRowModel()
            .rows.findIndex((r) => r.id === row.id);
          return (
            <span className="text-xs text-muted-foreground font-mono">
              {index + 1}
            </span>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Item Description',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">{row.original.description}</span>
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
        accessorKey: 'quantity',
        header: 'Quantity',
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <span className="text-xs font-medium">{row.original.quantity}</span>
        ),
      },
      {
        accessorKey: 'unitPrice',
        header: 'Unit Price (ETB)',
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <span className="text-xs font-medium text-muted-foreground">
            {formatCurrency(row.original.unitPrice)}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total (ETB)',
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <span className="text-xs font-bold text-sky-500">
            {formatCurrency(row.original.total)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row.original)}
              className="h-7 w-7 text-muted-foreground hover:text-blue-500"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(row.original.id)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search BOQ items..."
          className="pl-9 h-9 text-xs bg-background/50"
        />
      </div>
      <DataTable
        columns={columns}
        data={items}
        getRowId={(item) => item.id}
        search={search}
        footer={
          <tfoot className="border-t-2 border-border bg-sky-500/5 font-bold text-sm">
            <tr>
              <td colSpan={5} className="px-4 py-3 text-right uppercase tracking-wider text-xs">
                Total BOQ Rate Value:
              </td>
              <td className="px-4 py-3 text-right font-extrabold text-sky-500 text-base">
                {formatCurrency(totalBoqValue)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        }
      />
    </div>
  );
}
