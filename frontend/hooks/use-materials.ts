import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CreateMaterialInput,
  MaterialWithStockFlag,
  PaginatedResponse,
  UpdateMaterialInput,
} from '@/types';
import { toast } from 'sonner';

export interface MaterialQueryParams {
  page?: number;
  limit?: number;
  lowStock?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useMaterials(params?: MaterialQueryParams) {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () =>
      api.get<PaginatedResponse<MaterialWithStockFlag>>('/materials', params),
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => api.get<MaterialWithStockFlag>(`/materials/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaterialInput) =>
      api.post<MaterialWithStockFlag>('/materials', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Material added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add material');
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialInput }) =>
      api.put<MaterialWithStockFlag>(`/materials/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Material updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update material');
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Material deleted');
    },
    onError: (error: any) => {
      if (error.statusCode === 409) {
        toast.error('Cannot delete: material has existing inventory movements');
      } else {
        toast.error(error.message || 'Failed to delete material');
      }
    },
  });
}
