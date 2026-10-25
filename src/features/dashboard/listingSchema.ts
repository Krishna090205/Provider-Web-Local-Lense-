import { z } from 'zod';

export const listingFormSchema = z.object({
  name: z.string()
    .transform((val) => (val || '').trim())
    .refine((val) => val.length >= 2, { message: 'Establishment name must be at least 2 characters' }),
  category: z.enum(['hotels', 'restaurants', 'shops', 'attractions', 'forts'], {
    message: 'Please select a valid category'
  }),
  description: z.string()
    .transform((val) => (val || '').trim())
    .refine((val) => val.length >= 10, { message: 'Description must be at least 10 characters with historical details' }),
  address: z.string()
    .transform((val) => (val || '').trim())
    .refine((val) => val.length >= 5, { message: 'Full street address is required' }),
  area: z.string()
    .transform((val) => (val || '').trim())
    .refine((val) => val.length >= 2, { message: 'Area or neighborhood is required' }),
  lat: z.union([z.string(), z.number()])
    .transform((val) => String(val ?? '18.9217').trim())
    .refine((val) => !isNaN(Number(val)) && val !== '', { message: 'Must be a valid decimal latitude' }),
  lng: z.union([z.string(), z.number()])
    .transform((val) => String(val ?? '72.8332').trim())
    .refine((val) => !isNaN(Number(val)) && val !== '', { message: 'Must be a valid decimal longitude' }),
  phone: z.string().nullable().optional()
    .transform((val) => (val || '').trim()),
  website: z.string().nullable().optional()
    .transform((val) => (val || '').trim()),
  price_level: z.string().nullable().optional()
    .transform((val) => (val || '').trim())
    .refine((val) => val.length > 0, { message: 'Please enter the amount or approximate price (e.g. ₹500 for two)' }),
  photoUrl: z.string().nullable().optional()
    .transform((val) => (val || '').trim())
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
      { message: 'Must be a valid web URL or uploaded image' }
    ),
  hoursText: z.string().nullable().optional()
    .transform((val) => (val || '10:00 AM - 10:00 PM').trim())
    .refine((val) => val.length >= 2, { message: 'Operating hours are required' }),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

