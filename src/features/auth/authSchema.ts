import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['provider', 'admin']),
  businessName: z.string().optional(),
}).refine((data) => {
  if (data.role === 'provider' && (!data.businessName || data.businessName.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Business name is required for local providers',
  path: ['businessName'],
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().optional(),
});
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
