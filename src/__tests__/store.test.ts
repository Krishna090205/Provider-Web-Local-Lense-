import { describe, it, expect, beforeEach } from 'vitest';
import { uploadListingPhoto, fetchPublicListings, getLocalProviders, addLocalProvider, updateProviderApproval } from '../lib/store';
import { Listing, Profile } from '../types';

describe('Store & Storage Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('uploadListingPhoto validation', () => {
    it('rejects unsupported file mime types', async () => {
      const textFile = new File(['dummy content'], 'document.txt', { type: 'text/plain' });
      const res = await uploadListingPhoto(textFile, 'test-prov');
      expect(res.error).toBeDefined();
      expect(res.error).toContain('Only JPEG, PNG, and WebP');
      expect(res.url).toBeUndefined();
    });

    it('rejects files larger than 5MB', async () => {
      // 6MB dummy content
      const largeBytes = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([largeBytes], 'huge.png', { type: 'image/png' });
      const res = await uploadListingPhoto(largeFile, 'test-prov');
      expect(res.error).toBeDefined();
      expect(res.error).toContain('Maximum allowed upload size is 5 MB');
      expect(res.url).toBeUndefined();
    });

    it('processes valid image files within limits', async () => {
      const smallPng = new File(['fake-png-binary'], 'landmark.png', { type: 'image/png' });
      const res = await uploadListingPhoto(smallPng, 'test-prov');
      expect(res.error).toBeUndefined();
      expect(res.url).toBeDefined();
      expect(typeof res.url).toBe('string');
    });
  });

  describe('Public Listings Visibility and Approval Guards', () => {
    it('only presents approved listings from approved providers on public feeds', async () => {
      const listings = await fetchPublicListings();
      expect(Array.isArray(listings)).toBe(true);

      // Verify no rejected or pending provider listings slip into public view
      listings.forEach((item: Listing) => {
        if (item.provider_status) {
          expect(item.provider_status).toBe('approved');
        }
        if (item.status) {
          expect(item.status).toBe('approved');
        }
      });
    });
  });

  describe('Provider Admin Decision Notifications', () => {
    it('approves a provider and sets review note correctly', async () => {
      addLocalProvider({
        id: 'test-pending-1',
        email: 'test.pending1@example.com',
        name: 'Pending Test Provider',
        role: 'provider',
        provider_status: 'pending',
        created_at: new Date().toISOString()
      });

      const updated = await updateProviderApproval('test-pending-1', 'approved', undefined, 'admin-123');
      expect(updated).not.toBeNull();
      expect(updated?.provider_status).toBe('approved');
      expect(updated?.reviewed_by).toBe('admin-123');
    }, 15000);

    it('rejects a provider with mandatory reason note', async () => {
      addLocalProvider({
        id: 'test-pending-2',
        email: 'test.pending2@example.com',
        name: 'Test Provider 2',
        role: 'provider',
        provider_status: 'pending',
        created_at: new Date().toISOString()
      });

      const reason = 'FSSAI hygiene certification required.';
      const updated = await updateProviderApproval('test-pending-2', 'rejected', reason, 'admin-123');
      expect(updated).not.toBeNull();
      expect(updated?.provider_status).toBe('rejected');
      expect(updated?.provider_review_note).toBe(reason);
    });
  });
});
