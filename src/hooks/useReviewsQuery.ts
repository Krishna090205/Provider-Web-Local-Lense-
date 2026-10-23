import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Review } from '../types';
import { fetchReviewsByListing, fetchReviewsByUser, addReview, deleteReview } from '../lib/store';
import { LISTINGS_QUERY_KEY } from './useListingsQuery';

export function useListingReviews(listingId?: string) {
  return useQuery({
    queryKey: ['reviews', 'listing', listingId],
    queryFn: () => (listingId ? fetchReviewsByListing(listingId) : Promise.resolve([])),
    enabled: Boolean(listingId),
  });
}

export function useUserReviews(userId?: string) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => (userId ? fetchReviewsByUser(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
}

export function useAddReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newReview: Omit<Review, 'id' | 'created_at'>) => addReview(newReview),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'listing', variables.listing_id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user', variables.user_id] });
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listing_id] });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY });
    },
  });
}
