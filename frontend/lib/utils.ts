import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import Papa from 'papaparse';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPageCount(meta?: {
  totalPages?: number;
  pageCount?: number;
}): number {
  return meta?.pageCount ?? meta?.totalPages ?? 1;
}

export function formatCurrency(value: number | string | null | undefined, currency: string = 'ETB'): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0.00 ' + currency;
  }
  const num = Number(value);
  return `${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function formatCompactCurrency(value: number | string | null | undefined, currency: string = 'ETB'): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0 ' + currency;
  }
  const num = Number(value);
  if (Math.abs(num) >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}B ${currency}`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M ${currency}`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}k ${currency}`;
  }
  return formatCurrency(value, currency);
}

export function formatNumber(value: number | string | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  const num = Number(value);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy');
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch {
    return String(dateString);
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'ONGOING':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    case 'PLANNED':
      return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    default:
      return 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30';
  }
}

export function exportToCsv<T>(data: T[], filename: string) {
  const csv = Papa.unparse(data as any);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
