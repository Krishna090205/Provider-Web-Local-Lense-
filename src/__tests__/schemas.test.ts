import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../features/auth/authSchema';
import { listingFormSchema } from '../features/dashboard/listingSchema';
import { providerRejectionSchema } from '../features/admin/adminSchema';
import { reviewFormSchema } from '../features/dashboard/reviewSchema';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const valid = { email: 'explorer@example.com', password: 'SecretPassword123' };
      const parsed = loginSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('rejects malformed email', () => {
      const invalid = { email: 'not-an-email', password: 'Password123' };
      const parsed = loginSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toContain('valid email');
      }
    });

    it('rejects short passwords under 6 characters', () => {
      const invalid = { email: 'explorer@example.com', password: '123' };
      const parsed = loginSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toContain('6 characters');
      }
    });
  });

  describe('registerSchema', () => {
    it('accepts admin registration without business name', () => {
      const validAdmin = {
        name: 'Aarav Patel',
        email: 'aarav@mumbai.in',
        password: 'PassWord!123',
        role: 'admin' as const,
      };
      const parsed = registerSchema.safeParse(validAdmin);
      expect(parsed.success).toBe(true);
    });

    it('requires business name for provider registrations', () => {
      const invalidProvider = {
        name: 'Kavita Roy',
        email: 'kavita@cafe.in',
        password: 'PassWord!123',
        role: 'provider' as const,
        businessName: '',
      };
      const parsed = registerSchema.safeParse(invalidProvider);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toContain('Business name is required');
      }
    });

    it('accepts provider registration when business name is provided', () => {
      const validProvider = {
        name: 'Kavita Roy',
        email: 'kavita@cafe.in',
        password: 'PassWord!123',
        role: 'provider' as const,
        businessName: 'Marine Heritage Cafe',
      };
      const parsed = registerSchema.safeParse(validProvider);
      expect(parsed.success).toBe(true);
    });
  });

  describe('listingFormSchema', () => {
    it('validates a complete listing with operating hours and coordinates', () => {
      const validListing = {
        name: 'Taj Mahal Palace Hotel & Tower',
        category: 'hotels' as const,
        description: 'Iconic heritage landmark established in 1903 overlooking Mumbai Harbour and the Gateway of India.',
        address: 'Apollo Bunder, Colaba, Mumbai 400001',
        area: 'Colaba',
        lat: '18.9217',
        lng: '72.8332',
        phone: '+91 22 6665 3366',
        website: 'https://tajhotels.com',
        price_level: '₹₹₹₹',
        photoUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
        hoursText: 'Open 24 Hours',
      };
      const parsed = listingFormSchema.safeParse(validListing);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid coordinates', () => {
      const invalidListing = {
        name: 'Cafe Leopold',
        category: 'restaurants' as const,
        description: 'Historic cafe open since 1871.',
        address: 'Colaba Causeway',
        area: 'Colaba',
        lat: 'not-a-number',
        lng: '72.8332',
        price_level: '₹₹',
        photoUrl: '',
        hoursText: '8:00 AM - 12:00 AM',
      };
      const parsed = listingFormSchema.safeParse(invalidListing);
      expect(parsed.success).toBe(false);
    });
  });

  describe('providerRejectionSchema', () => {
    it('requires a detailed rejection reason of at least 8 characters', () => {
      const tooShort = { reason: 'No' };
      const parsed = providerRejectionSchema.safeParse(tooShort);
      expect(parsed.success).toBe(false);

      const valid = { reason: 'Commercial license documentation is expired. Please re-upload.' };
      const parsedValid = providerRejectionSchema.safeParse(valid);
      expect(parsedValid.success).toBe(true);
    });
  });

  describe('reviewFormSchema', () => {
    it('accepts reviews with ratings between 1 and 5 and comments', () => {
      const validReview = { rating: 5, comment: 'Spectacular sunset views over the Arabian Sea!' };
      const parsed = reviewFormSchema.safeParse(validReview);
      expect(parsed.success).toBe(true);
    });

    it('rejects empty comments', () => {
      const invalid = { rating: 4, comment: '  ' };
      const parsed = reviewFormSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });
});
