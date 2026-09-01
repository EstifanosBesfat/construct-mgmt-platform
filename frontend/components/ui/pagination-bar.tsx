'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationBarProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  const startResult = totalResults === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endResult = Math.min(safeCurrentPage * pageSize, totalResults);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 text-xs text-muted-foreground border-t border-border bg-card/60 backdrop-blur-xs select-none',
        className
      )}
    >
      {/* Left: Showing results count */}
      <div className="font-normal text-muted-foreground/90">
        Showing <span className="font-medium text-foreground">{startResult}</span>–
        <span className="font-medium text-foreground">{endResult}</span> of{' '}
        <span className="font-medium text-foreground">{totalResults}</span> results
      </div>

      {/* Right: Rows per page + Page X of Y + Navigation Arrows */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground whitespace-nowrap">Rows per page</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded-md border border-input bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-[#EA580C] focus:border-[#EA580C] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page status */}
        <div className="whitespace-nowrap font-medium text-foreground">
          Page {safeCurrentPage} of {safeTotalPages}
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center space-x-1">
          {/* First Page */}
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange(1)}
            aria-label="First page"
            title="First page"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-input/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange(safeCurrentPage - 1)}
            aria-label="Previous page"
            title="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-input/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Next Page */}
          <button
            type="button"
            disabled={safeCurrentPage >= safeTotalPages}
            onClick={() => onPageChange(safeCurrentPage + 1)}
            aria-label="Next page"
            title="Next page"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-input/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={safeCurrentPage >= safeTotalPages}
            onClick={() => onPageChange(safeTotalPages)}
            aria-label="Last page"
            title="Last page"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-input/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
