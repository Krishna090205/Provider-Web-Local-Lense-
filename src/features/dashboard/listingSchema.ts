import { z } from 'zod';

export const listingFormSchema = z.object({
  name: z.string().min(2, 'Establishment name must be at least 2 characters'),
  category: z.enum(['hotels', 'restaurants', 'shops', 'attractions', 'forts']),
  description: z.string().min(10, 'Description must be at least 10 characters with historical details'),
  address: z.string().min(5, 'Full street address is required'),
  area: z.string().min(2, 'Area or neighborhood is required'),
  lat: z.string().refine((val) => !isNaN(Number(val)), { message: 'Must be a valid decimal latitude' }),
  lng: z.string().refine((val) => !isNaN(Number(val)), { message: 'Must be a valid decimal longitude' }),
  phone: z.string().optional(),
  website: z.string().optional(),
  price_level: z.string().default('₹₹'),
  photoUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  hoursText: z.string().min(2, 'Operating hours are required'),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
