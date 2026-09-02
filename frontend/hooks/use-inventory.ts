import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  InventoryTransaction,
  PaginatedResponse,
  StockInInput,
  StockMovementResult,
  StockOutInput,
  TransactionType,
} from '@/types';
import { toast } from 'sonner';

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  materialId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useInventoryTransactions(params?: InventoryQueryParams) {
  return useQuery({
    queryKey: ['inventory-transactions', params],
    queryFn: () =>
      api.get<PaginatedResponse<InventoryTransaction>>('/inventory/transactions', params),
  });
}

export function useStockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockInInput) =>
      api.post<StockMovementResult>('/inventory/stock-in', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(
        `Stock-in recorded (+${res.transaction.quantity} ${res.transaction.material.unit})`
      );
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record stock-in');
    },
  });
}

export function useStockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockOutInput) =>
      api.post<StockMovementResult>('/inventory/stock-out', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['project', res.transaction.projectId] });

      if (res.warning) {
        toast.warning(
          `Stock-out recorded (-${res.transaction.quantity} ${res.transaction.material.unit}). Warning: ${res.warning}`
        );
      } else {
        toast.success(
          `Stock-out recorded (-${res.transaction.quantity} ${res.transaction.material.unit})`
        );
      }
    },
    onError: (error: any) => {
      if (error.statusCode === 422 || error.message?.includes('exceeds')) {
        toast.error(
          `Rejection Warning: ${error.message || 'Requested quantity exceeds available stock!'}`
        );
      } else {
        toast.error(error.message || 'Failed to record stock-out');
      }
    },
  });
}
