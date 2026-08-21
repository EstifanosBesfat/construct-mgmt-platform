import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CreateProgressInput,
  PaginatedResponse,
  ProgressRecord,
  UpdateProgressInput,
} from '@/types';
import { toast } from 'sonner';

export interface ProgressQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
}

export function useProgressRecords(params?: ProgressQueryParams) {
  return useQuery({
    queryKey: ['progress-records', params],
    queryFn: () =>
      api.get<PaginatedResponse<ProgressRecord>>('/progress', params),
  });
}

export function useCreateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgressInput) =>
      api.post<ProgressRecord>('/progress', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['progress-records'] });
      queryClient.invalidateQueries({ queryKey: ['project', res.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Progress logged: ${res.percentage}%`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record progress');
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProgressInput }) =>
      api.put<ProgressRecord>(`/progress/${id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['progress-records'] });
      queryClient.invalidateQueries({ queryKey: ['project', res.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Progress record updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update progress record');
    },
  });
}

export function useDeleteProgress(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/progress/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-records'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Progress record deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete progress record');
    },
  });
}
