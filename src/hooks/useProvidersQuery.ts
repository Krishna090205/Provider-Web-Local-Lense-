import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProviderStatus } from '../types';
import { fetchProviders, updateProviderApproval } from '../lib/store';
import { LISTINGS_QUERY_KEY } from './useListingsQuery';

export const PROVIDERS_QUERY_KEY = ['admin', 'providers'];

export function useProviders() {
  return useQuery({
    queryKey: PROVIDERS_QUERY_KEY,
    queryFn: () => fetchProviders(),
  });
}

export function useUpdateProviderApprovalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      providerId,
      status,
      note,
      adminId,
    }: {
      providerId: string;
      status: ProviderStatus;
      note?: string;
      adminId?: string;
    }) => updateProviderApproval(providerId, status, note, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
    },
  });
}
