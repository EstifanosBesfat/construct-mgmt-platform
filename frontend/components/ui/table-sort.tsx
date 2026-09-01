'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | string | null;
  direction: SortDirection;
}

interface TableSortHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string | null;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function TableSortHeader({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  align = 'left',
  className = '',
}: TableSortHeaderProps) {
  const isSorted = currentSortKey === sortKey && currentDirection !== null;

  const getAlignClass = () => {
    if (align === 'right') return 'justify-end text-right';
    if (align === 'center') return 'justify-center text-center';
    return 'justify-start text-left';
  };

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-3 py-2 font-semibold select-none cursor-pointer transition-colors hover:text-foreground hover:bg-muted/80 group ${
        isSorted ? 'text-[#EA580C] dark:text-orange-400 font-bold bg-muted/60' : ''
      } ${className}`}
    >
      <div className={`inline-flex items-center space-x-1 w-full ${getAlignClass()}`}>
        <span>{label}</span>
        <span className="shrink-0 transition-opacity">
          {isSorted ? (
            currentDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-[#EA580C] dark:text-orange-400 stroke-[2.5]" />
            ) : (
              <ArrowDown className="h-3 w-3 text-[#EA580C] dark:text-orange-400 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="h-2.5 w-2.5 opacity-30 group-hover:opacity-80 transition-opacity" />
          )}
        </span>
      </div>
    </th>
  );
}

export function useTableSort<T>(
  initialKey: string | null = null,
  initialDirection: SortDirection = null,
  customExtractors?: Record<string, (item: T) => any>
) {
  const [sortKey, setSortKey] = React.useState<string | null>(initialKey);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(initialDirection);

  const toggleSort = React.useCallback((key: string) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDirection('asc');
        return key;
      }
      setSortDirection((prevDir) => {
        if (prevDir === 'asc') return 'desc';
        if (prevDir === 'desc') return null;
        return 'asc';
      });
      return key;
    });
  }, []);

  const sortItems = React.useCallback(
    (items: T[]): T[] => {
      if (!sortKey || !sortDirection || !items.length) {
        return items;
      }

      return [...items].sort((a, b) => {
        let valA: any;
        let valB: any;

        if (customExtractors && customExtractors[sortKey]) {
          valA = customExtractors[sortKey](a);
          valB = customExtractors[sortKey](b);
        } else {
          // Handle nested keys e.g. "material.name" or "project.code"
          const keys = sortKey.split('.');
          valA = keys.reduce((acc, k) => (acc ? acc[k] : undefined), a as any);
          valB = keys.reduce((acc, k) => (acc ? acc[k] : undefined), b as any);
        }

        if (valA === null || valA === undefined) return sortDirection === 'asc' ? 1 : -1;
        if (valB === null || valB === undefined) return sortDirection === 'asc' ? -1 : 1;

        // Number or numeric string comparison
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        // Date comparison
        if (valA instanceof Date || (typeof valA === 'string' && !isNaN(Date.parse(valA)) && (valA.includes('-') || valA.includes('/')))) {
          const dateA = new Date(valA).getTime();
          const dateB = new Date(valB).getTime();
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          }
        }

        // String comparison
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    },
    [sortKey, sortDirection, customExtractors]
  );

  return {
    sortKey,
    sortDirection,
    toggleSort,
    sortItems,
  };
}
