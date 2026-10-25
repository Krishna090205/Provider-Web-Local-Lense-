import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Listing, FilterOptions, ListingStatus } from '../types';
import {
  fetchListings,
  fetchListingById,
  fetchAllListingsForAdmin,
  fetchListingsByOwner,
  createListing,
  updateListing,
  deleteListing,
  updateListingStatus,
} from '../lib/store';

export const LISTINGS_QUERY_KEY = ['listings'];

export function useListings(filters?: FilterOptions) {
  return useQuery({
    queryKey: [...LISTINGS_QUERY_KEY, filters],
    queryFn: () => fetchListings(filters),
  });
}

export function useListingById(id?: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => (id ? fetchListingById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useAdminListings() {
  return useQuery({
    queryKey: ['admin', 'listings'],
    queryFn: () => fetchAllListingsForAdmin(),
  });
}

export function useOwnerListings(ownerId?: string, ownerEmail?: string) {
  return useQuery({
    queryKey: ['owner', 'listings', ownerId, ownerEmail],
    queryFn: () => (ownerId || ownerEmail ? fetchListingsByOwner(ownerId, ownerEmail) : Promise.resolve([])),
    enabled: Boolean(ownerId || ownerEmail),
  });
}

export function useCreateListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newListing: Omit<Listing, 'id' | 'created_at' | 'rating' | 'review_count'> & { owner_email?: string }) =>
      createListing(newListing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner', 'listings'] });
    },
  });
}

export function useUpdateListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Listing> }) =>
      updateListing(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['listing', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner', 'listings'] });
    },
  });
}

export function useDeleteListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner', 'listings'] });
    },
  });
}

export function useUpdateListingStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) =>
      updateListingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
    },
  });
}
