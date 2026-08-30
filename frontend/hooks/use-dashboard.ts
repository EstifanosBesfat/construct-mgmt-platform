import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardSummary } from '@/types';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get<DashboardSummary>('/dashboard/summary'),
    refetchInterval: 30000, // auto refresh every 30s
  });
}
