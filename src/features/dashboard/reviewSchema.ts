import { z } from 'zod';

export const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
