import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BoqItem, BoqList, BoqSummary, CreateBoqItemInput, UpdateBoqItemInput } from '@/types';
import { toast } from 'sonner';

export function useProjectBoq(projectId: string) {
  return useQuery({
    queryKey: ['boq', projectId],
    queryFn: () => api.get<BoqList>(`/projects/${projectId}/boq`),
    enabled: Boolean(projectId),
  });
}

export function useBoqSummary(projectId: string) {
  return useQuery({
    queryKey: ['boq-summary', projectId],
    queryFn: () => api.get<BoqSummary>(`/projects/${projectId}/boq/summary`),
    enabled: Boolean(projectId),
  });
}

export function useCreateBoqItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoqItemInput) =>
      api.post<BoqItem>(`/projects/${projectId}/boq`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq', projectId] });
      queryClient.invalidateQueries({ queryKey: ['boq-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('BOQ item added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add BOQ item');
    },
  });
}

export function useUpdateBoqItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoqItemInput }) =>
      api.put<BoqItem>(`/boq/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq', projectId] });
      queryClient.invalidateQueries({ queryKey: ['boq-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('BOQ item updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update BOQ item');
    },
  });
}

export function useDeleteBoqItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/boq/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq', projectId] });
      queryClient.invalidateQueries({ queryKey: ['boq-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('BOQ item removed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove BOQ item');
    },
  });
}
