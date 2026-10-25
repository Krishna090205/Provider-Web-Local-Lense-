import { describe, it, expect, beforeEach } from 'vitest';
import { uploadListingPhoto, fetchPublicListings, getLocalProviders, addLocalProvider, updateProviderApproval, getExplorePriority } from '../lib/store';
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

  describe('Explore Page Priority Ordering', () => {
    const mockListings: Partial<Listing>[] = [
      {
        id: 'exp-p1-1',
        name: 'CSMT Heritage Museum',
        category: 'attractions',
        image_note: 'Verified exact match',
        status: 'approved',
        rating: 4.9,
        review_count: 100,
        area: 'Fort',
        price_level: '₹₹',
        hours: {},
        lat: 18.94,
        lng: 72.83,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p1-2',
        name: 'Gateway of India',
        category: 'attractions',
        image_note: 'Verified exact match',
        status: 'approved',
        rating: 4.7,
        review_count: 200,
        area: 'Colaba',
        price_level: '₹',
        hours: {},
        lat: 18.92,
        lng: 72.83,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p2-former',
        name: 'Fort Heritage Walk',
        category: 'attractions',
        image_note: 'Verified exact match (former Commons...)',
        status: 'approved',
        rating: 4.6,
        review_count: 40,
        area: 'Fort',
        price_level: '₹₹',
        hours: {},
        lat: 18.93,
        lng: 72.83,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p2-from',
        name: 'Bandra Promenade View',
        category: 'attractions',
        image_note: 'Verified exact match (from Commons...)',
        status: 'approved',
        rating: 4.8,
        review_count: 60,
        area: 'Bandra',
        price_level: '₹',
        hours: {},
        lat: 18.94,
        lng: 72.82,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p2-wiki-loves',
        name: 'Flora Fountain Monument',
        category: 'attractions',
        image_note: 'Verified exact match (Wiki Loves Monuments...)',
        status: 'approved',
        rating: 4.4,
        review_count: 30,
        area: 'Fort',
        price_level: '₹',
        hours: {},
        lat: 18.932,
        lng: 72.831,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p2-commons-other',
        name: 'Kala Ghoda Art Gallery',
        category: 'attractions',
        image_note: 'Wikimedia Commons - Jehangir Art Gallery facade',
        status: 'approved',
        rating: 4.5,
        review_count: 55,
        area: 'Fort',
        price_level: '₹',
        hours: {},
        lat: 18.928,
        lng: 72.832,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p2-null',
        name: 'Old Bombay Irani Cafe',
        category: 'restaurants',
        image_note: null,
        status: 'approved',
        rating: 4.3,
        review_count: 25,
        area: 'Colaba',
        price_level: '₹₹',
        hours: {},
        lat: 18.925,
        lng: 72.83,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p2-empty',
        name: 'Colaba Silk Emporium',
        category: 'shops',
        image_note: '',
        status: 'approved',
        rating: 4.2,
        review_count: 15,
        area: 'Colaba',
        price_level: '₹₹₹',
        hours: {},
        lat: 18.923,
        lng: 72.831,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p2-unexpected',
        name: 'Marine Plaza Boutique',
        category: 'hotels',
        image_note: 'Representative Photo Only',
        status: 'approved',
        rating: 4.1,
        review_count: 10,
        area: 'Marine Drive',
        price_level: '₹₹₹',
        hours: {},
        lat: 18.93,
        lng: 72.825,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p3-red-fort-1',
        name: 'Mahim Fort Bastion',
        category: 'forts',
        image_note: 'Wikimedia Commons - Red Fort, Delhi (representative Heritage/Fort/Architecture/Museum photo)',
        status: 'approved',
        rating: 4.9,
        review_count: 90,
        area: 'Mahim',
        price_level: '₹',
        hours: {},
        lat: 19.04,
        lng: 72.84,
        created_at: new Date().toISOString()
      },
      {
        id: 'exp-p3-red-fort-2',
        name: 'Sion Hillock Fort',
        category: 'forts',
        image_note: 'Wikimedia Commons - Red Fort, Delhi (representative Heritage/Fort/Architecture/Museum photo)',
        status: 'approved',
        rating: 4.7,
        review_count: 45,
        area: 'Sion',
        price_level: '₹',
        hours: {},
        lat: 19.045,
        lng: 72.86,
        created_at: new Date().toISOString()
      }
    ];

    it('correctly maps image_note to Priority 1, 2, and 3', () => {
      // Priority 1 — Show first
      expect(getExplorePriority('Verified exact match')).toBe(1);
      expect(getExplorePriority('  verified exact match  ')).toBe(1);

      // Priority 2 — Other Wikimedia Commons notes, verification notes, null, empty, unexpected
      expect(getExplorePriority('Verified exact match (former Commons...)')).toBe(2);
      expect(getExplorePriority('Verified exact match (from Commons...)')).toBe(2);
      expect(getExplorePriority('Verified exact match (Wiki Loves Monuments...)')).toBe(2);
      expect(getExplorePriority('Wikimedia Commons - Jehangir Art Gallery facade')).toBe(2);
      expect(getExplorePriority(null)).toBe(2);
      expect(getExplorePriority('')).toBe(2);
      expect(getExplorePriority(undefined)).toBe(2);
      expect(getExplorePriority('Some arbitrary unknown note')).toBe(2);

      // Priority 3 — Show last
      expect(getExplorePriority('Wikimedia Commons - Red Fort, Delhi (representative Heritage/Fort/Architecture/Museum photo)')).toBe(3);
      expect(getExplorePriority('Wikimedia Commons - Red Fort, Delhi (representative Heritage/Fort/Architecture/Museum photo) - Archive')).toBe(3);
    });

    it('keeps all records visible and orders Priority 1 first, Priority 2 middle, Priority 3 last', () => {
      const sorted = [...mockListings].sort((a, b) => {
        const priorityA = getExplorePriority(a.image_note);
        const priorityB = getExplorePriority(b.image_note);
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return (b.rating || 0) - (a.rating || 0);
      });

      // All 11 records must be kept (none filtered out)
      expect(sorted.length).toBe(mockListings.length);

      // Priority 1 records must appear first
      expect(sorted[0].id).toBe('exp-p1-1');
      expect(sorted[1].id).toBe('exp-p1-2');
      expect(getExplorePriority(sorted[0].image_note)).toBe(1);
      expect(getExplorePriority(sorted[1].image_note)).toBe(1);

      // Priority 2 records must appear in the middle
      for (let i = 2; i <= 8; i++) {
        expect(getExplorePriority(sorted[i].image_note)).toBe(2);
      }

      // Priority 3 generic Red Fort representative photos must appear last
      expect(getExplorePriority(sorted[9].image_note)).toBe(3);
      expect(getExplorePriority(sorted[10].image_note)).toBe(3);
      expect(sorted[9].id).toBe('exp-p3-red-fort-1');
      expect(sorted[10].id).toBe('exp-p3-red-fort-2');
    });

    it('ensures priority ordering applies across pagination pages', () => {
      // Simulate pagination with pageSize = 4 across the 11 records
      const sorted = [...mockListings].sort((a, b) => {
        const priorityA = getExplorePriority(a.image_note);
        const priorityB = getExplorePriority(b.image_note);
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return (b.rating || 0) - (a.rating || 0);
      });

      const PAGE_SIZE = 4;
      const page1 = sorted.slice(0, PAGE_SIZE);
      const page2 = sorted.slice(PAGE_SIZE, PAGE_SIZE * 2);
      const page3 = sorted.slice(PAGE_SIZE * 2, PAGE_SIZE * 3);

      // Page 1 contains all Priority 1 items
      expect(page1.some(item => getExplorePriority(item.image_note) === 1)).toBe(true);
      expect(getExplorePriority(page1[0].image_note)).toBe(1);
      expect(getExplorePriority(page1[1].image_note)).toBe(1);

      // Page 3 (last page) contains Priority 3 items
      expect(page3.some(item => getExplorePriority(item.image_note) === 3)).toBe(true);
      const lastItem = page3[page3.length - 1];
      expect(getExplorePriority(lastItem.image_note)).toBe(3);
      expect(lastItem.image_note).toContain('Red Fort, Delhi');
    });
  });
});
