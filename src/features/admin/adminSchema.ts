import { z } from 'zod';

export const providerRejectionSchema = z.object({
  reason: z.string().min(5, 'A clear reason of at least 5 characters is required to notify the applicant'),
});
export type ProviderRejectionFormValues = z.infer<typeof providerRejectionSchema>;
