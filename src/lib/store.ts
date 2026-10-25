import { supabase, isSupabaseConfigured } from './supabase';
import { Database } from '../types/database';
import { Listing, ListingCategory, Review, Profile, FilterOptions, UserRole, ProviderStatus, ListingStatus, NotificationItem } from './types';

export type ExperienceRow = Database['public']['Tables']['experience']['Row'];
export type ExperienceInsert = Database['public']['Tables']['experience']['Insert'];
export type ExperienceUpdate = Database['public']['Tables']['experience']['Update'];

// Local storage keys
const STORAGE_KEY_LISTINGS = 'locallens_listings_v1';
const STORAGE_KEY_REVIEWS = 'locallens_reviews_v1';
const STORAGE_KEY_FAVORITES = 'locallens_favorites_v1';
const STORAGE_KEY_USER = 'locallens_current_user_v1';
const STORAGE_KEY_PROVIDERS = 'locallens_providers_v1';
const STORAGE_KEY_NOTIFICATIONS = 'locallens_notifications_v1';

// ----------------------------------------------------
// Real Database Provider Management (No Mock/Dummy Users)
// ----------------------------------------------------

export function purgeDummyStorageData(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    // 1. Purge dummy providers from local storage
    const rawProviders = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (rawProviders) {
      const providers = JSON.parse(rawProviders);
      if (Array.isArray(providers)) {
        const cleaned = providers.filter(
          (p: Profile) =>
            !p.id?.startsWith('prov-00') &&
            !p.email?.includes('mumbaicafe.in') &&
            !p.email?.includes('merchantcrafts.in') &&
            !p.email?.includes('malabarstays.in') &&
            !p.email?.includes('sawantfoods.in')
        );
        localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(cleaned));
      }
    }

    // 2. Purge dummy accounts from permanent registry
    const rawAccounts = localStorage.getItem('locallens_registered_accounts_v1');
    if (rawAccounts) {
      const accounts = JSON.parse(rawAccounts);
      if (Array.isArray(accounts)) {
        const cleaned = accounts.filter(
          (a: Profile) =>
            !a.id?.startsWith('prov-00') &&
            a.id !== 'admin-demo-id' &&
            !a.email?.includes('mumbaicafe.in') &&
            !a.email?.includes('merchantcrafts.in') &&
            !a.email?.includes('sawantfoods.in') &&
            a.email !== 'arun.kumar.google@gmail.com'
        );
        localStorage.setItem('locallens_registered_accounts_v1', JSON.stringify(cleaned));
      }
    }

    // 3. Purge dummy user from current session if matching mock IDs
    const rawUser = localStorage.getItem(STORAGE_KEY_USER);
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (
        u?.id?.startsWith('prov-00') ||
        u?.id === 'admin-demo-id' ||
        u?.email?.includes('mumbaicafe.in') ||
        u?.email?.includes('sawantfoods.in') ||
        u?.email === 'arun.kumar.google@gmail.com'
      ) {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }

    // 4. Purge dummy mock reviews and listings cache
    localStorage.removeItem(STORAGE_KEY_REVIEWS);
    localStorage.removeItem(STORAGE_KEY_LISTINGS);
  } catch {
    // Ignore storage parse errors
  }
}

// Auto-run cleanup in browser
if (typeof window !== 'undefined') {
  purgeDummyStorageData();
}

export function getLocalProviders(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p: Profile) =>
        !p.id?.startsWith('prov-00') &&
        !p.email?.includes('mumbaicafe.in') &&
        !p.email?.includes('merchantcrafts.in') &&
        !p.email?.includes('malabarstays.in') &&
        !p.email?.includes('sawantfoods.in')
    );
  } catch {
    return [];
  }
}

export function saveLocalProviders(providers: Profile[]) {
  try {
    const cleaned = providers.filter(
      (p: Profile) =>
        !p.id?.startsWith('prov-00') &&
        !p.email?.includes('mumbaicafe.in') &&
        !p.email?.includes('merchantcrafts.in') &&
        !p.email?.includes('malabarstays.in') &&
        !p.email?.includes('sawantfoods.in')
    );
    localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Failed to save providers to localStorage', e);
  }
}

export function addLocalProvider(newProvider: Profile): void {
  const current = getLocalProviders();
  const existingIdx = current.findIndex(p => p.id === newProvider.id || (p.email && p.email === newProvider.email));
  let updated: Profile[];
  if (existingIdx >= 0) {
    const existing = current[existingIdx];
    // Use newly supplied status if present, otherwise preserve existing
    const preservedStatus = newProvider.provider_status || existing.provider_status || 'pending';

    updated = [...current];
    updated[existingIdx] = {
      ...existing,
      ...newProvider,
      provider_status: preservedStatus,
      provider_review_note: newProvider.provider_review_note ?? existing.provider_review_note,
      reviewed_by: newProvider.reviewed_by ?? existing.reviewed_by,
      reviewed_at: newProvider.reviewed_at ?? existing.reviewed_at
    };
  } else {
    updated = [newProvider, ...current];
  }
  saveLocalProviders(updated);
}

const STORAGE_KEY_DELETED_EXPERIENCES = 'locallens_deleted_experiences_v1';

// Known purged test experiences that should never appear on provider dashboards or listings
export const KNOWN_PURGED_EXPERIENCES = [
  'EXP-1790564147905',
  'EXP-1790601503825',
  'EXP-1790763251184',
  'EXP-1792829731549'
];

export function getDeletedListingIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_EXPERIENCES);
    const localDeleted: string[] = raw ? JSON.parse(raw) : [];
    return Array.from(new Set([...KNOWN_PURGED_EXPERIENCES, ...localDeleted]));
  } catch {
    return KNOWN_PURGED_EXPERIENCES;
  }
}

export function markListingAsDeleted(id: string): void {
  try {
    const current = getDeletedListingIds();
    if (!current.includes(id)) {
      localStorage.setItem(STORAGE_KEY_DELETED_EXPERIENCES, JSON.stringify([...current, id]));
    }
  } catch {}
}

function getLocalListings(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (!raw) return [];
    const list: Listing[] = JSON.parse(raw) || [];
    const deleted = getDeletedListingIds();
    return list.filter(l => !deleted.includes(l.id));
  } catch {
    return [];
  }
}

function saveLocalListings(listings: Listing[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
  } catch (e) {
    console.error('Failed to save listings to localStorage', e);
  }
}

function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function saveLocalReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to localStorage', e);
  }
}

export function getLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalFavorites(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favs));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
}

export function getStoredUser(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const u = JSON.parse(raw);
      if (u) {
        // All non-admin accounts are providers
        if (u.role !== 'admin' && !u.email?.toLowerCase().includes('admin')) {
          u.role = 'provider';
        }
      }
      return u;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: Profile | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

// ----------------------------------------------------
// Permanent Registered Accounts Registry
// Once a user registers with a role, their role remains
// permanent until they explicitly delete their account.
// ----------------------------------------------------
const STORAGE_KEY_REGISTERED_ACCOUNTS = 'locallens_registered_accounts_v1';

export function getRegisteredAccounts(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_ACCOUNTS);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map((p: Profile) => ({
      ...p,
      role: (p.role === 'admin' || p.email?.toLowerCase().includes('admin')) ? 'admin' : 'provider'
    }));
  } catch {
    return [];
  }
}

export function saveRegisteredAccount(profile: Profile): void {
  try {
    const accounts = getRegisteredAccounts();
    const idx = accounts.findIndex(
      a => a.id === profile.id || (profile.email && a.email?.toLowerCase() === profile.email.toLowerCase())
    );
    const finalRole: UserRole = (profile.role === 'admin' || profile.email?.toLowerCase().includes('admin') || (idx >= 0 && accounts[idx].role === 'admin'))
      ? 'admin'
      : 'provider';

    if (idx >= 0) {
      accounts[idx] = {
        ...profile,
        role: finalRole,
        provider_status: finalRole === 'admin' ? 'approved' : (profile.provider_status || accounts[idx].provider_status || 'pending')
      };
    } else {
      accounts.push({
        ...profile,
        role: finalRole,
        provider_status: finalRole === 'admin' ? 'approved' : (profile.provider_status || 'pending')
      });
    }
    localStorage.setItem(STORAGE_KEY_REGISTERED_ACCOUNTS, JSON.stringify(accounts));

    // When an administrator account is saved, remove it from local provider lists to avoid misassignment
    if (finalRole === 'admin') {
      const currentProviders = getLocalProviders();
      const filtered = currentProviders.filter(
        p => p.id !== profile.id && (!profile.email || p.email?.toLowerCase() !== profile.email.toLowerCase())
      );
      if (filtered.length !== currentProviders.length) {
        saveLocalProviders(filtered);
      }
    }
  } catch (e) {
    console.error('Failed to save registered account', e);
  }
}

export function findRegisteredAccount(identifier: string): Profile | null {
  if (!identifier) return null;
  const accounts = getRegisteredAccounts();
  const lower = identifier.toLowerCase();
  const found = accounts.find(a => a.id === identifier || a.email?.toLowerCase() === lower);
  if (found) {
    if (found.role === 'admin' || lower.includes('admin') || found.email?.toLowerCase().includes('admin')) {
      return { ...found, role: 'admin', provider_status: 'approved' };
    }
    return found;
  }

  const providers = getLocalProviders();
  const foundProv = providers.find(p => p.id === identifier || p.email?.toLowerCase() === lower);
  if (foundProv) {
    if (foundProv.role === 'admin' || lower.includes('admin') || foundProv.email?.toLowerCase().includes('admin')) {
      return { ...foundProv, role: 'admin', provider_status: 'approved' };
    }
    return foundProv;
  }

  return null;
}

export function deleteAccountPermanently(userId: string, userEmail?: string): void {
  try {
    // 1. Remove from persistent registered accounts
    const accounts = getRegisteredAccounts().filter(
      a => a.id !== userId && (!userEmail || a.email?.toLowerCase() !== userEmail.toLowerCase())
    );
    localStorage.setItem(STORAGE_KEY_REGISTERED_ACCOUNTS, JSON.stringify(accounts));

    // 2. Remove from providers list
    const providers = getLocalProviders().filter(
      p => p.id !== userId && (!userEmail || p.email?.toLowerCase() !== userEmail.toLowerCase())
    );
    saveLocalProviders(providers);

    // 3. Clear current user session
    const current = getStoredUser();
    if (current && (current.id === userId || (userEmail && current.email?.toLowerCase() === userEmail.toLowerCase()))) {
      saveStoredUser(null);
    }

    // 4. Remove intended role
    localStorage.removeItem('locallens_oauth_intended_role');

    // 5. Broadcast deletion event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('locallens_user_updated', { detail: { action: 'deleted', userId } }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('Failed to delete account permanently', e);
  }
}

// ----------------------------------------------------
// Notifications Store
// ----------------------------------------------------
export function getLocalNotifications(userId: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const all: NotificationItem[] = raw ? JSON.parse(raw) : [];
    return all.filter(n => n.user_id === userId || n.user_id === 'all');
  } catch {
    return [];
  }
}

export function addLocalNotification(notification: Omit<NotificationItem, 'id' | 'created_at' | 'read'>): NotificationItem {
  const item: NotificationItem = {
    ...notification,
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    read: false,
    created_at: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const all: NotificationItem[] = raw ? JSON.parse(raw) : [];
    all.unshift(item);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save notification', e);
  }
  return item;
}

export function markNotificationAsRead(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return;
    const all: NotificationItem[] = JSON.parse(raw);
    const target = all.find(n => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Failed to mark notification read', e);
  }
}

// ----------------------------------------------------
// Public API Functions: Listings & Experience Mappings
// ----------------------------------------------------

/**
 * Maps a row from public.experience into the application's Listing format
 */
export function experienceRowToListing(row: any): Listing {
  const expId = String(row.experience_id || row.id || '');
  const expName = String(row.experience_name || row.name || 'Untitled Experience');
  const cat = String(row.category || 'attractions').toLowerCase();
  const validCategory: ListingCategory =
    cat.includes('hotel') ? 'hotels' :
    cat.includes('food') || cat.includes('cafe') || cat.includes('restaurant') ? 'restaurants' :
    cat.includes('shop') ? 'shops' :
    cat.includes('fort') ? 'forts' : 'attractions';

  const img = row.image_url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80';
  const hoursText = row.best_time || row.availability || '10:00 AM - 10:00 PM';
  const hoursMap: Record<string, string> = {
    'Monday': hoursText,
    'Tuesday': hoursText,
    'Wednesday': hoursText,
    'Thursday': hoursText,
    'Friday': hoursText,
    'Saturday': hoursText,
    'Sunday': hoursText,
  };

  const areaStr = row.district || row.city || row.region || 'Mumbai';
  const addrStr = row.city 
    ? `${expName}, ${row.city}${row.state ? ', ' + row.state : ''}` 
    : (row.address || `${expName}, Mumbai`);

  return {
    id: expId,
    owner_id: row.provider_id || row.user_id || row.provider_email || undefined,
    owner_email: row.provider_email || undefined,
    category: validCategory,
    name: expName,
    description: row.description || '',
    address: addrStr,
    area: areaStr,
    lat: Number(row.latitude) || 18.9217,
    lng: Number(row.longitude) || 72.8332,
    hours: hoursMap,
    phone: row.phone || null,
    website: row.source_url || row.website || null,
    price_level: row.price_inr || (row.price_inr_clean ? '₹' + row.price_inr_clean : '₹₹'),
    status: (row.status as ListingStatus) || 'approved',
    provider_status: 'approved',
    featured: Boolean(row.hidden_gem_bool || row.local_experience_bool),
    rating: Number(row.rating) || 4.8,
    review_count: Number(row.review_count) || 1,
    created_at: row.last_verified || new Date().toISOString(),
    image_note: typeof row.image_note === 'string' ? row.image_note : (row.image_note || null),
    photos: [
      {
        id: 'photo_' + expId,
        listing_id: expId,
        url: img,
        caption: expName,
        is_cover: true,
        display_order: 1
      }
    ]
  };
}

/**
 * Prioritization tier for listings based on the image_note column:
 * Tier 1: image_note = 'Verified exact match' (case-insensitive, trimmed)
 * Tier 2: other experiences with verification notes
 * Tier 3: experiences with missing notes (null/empty) or unverified images
 */
export function getImageNoteTier(note?: string | null): number {
  if (note == null) return 3;
  const trimmed = String(note).trim();
  if (trimmed === '') return 3;

  const lower = trimmed.toLowerCase();

  // Tier 1: exact match for "Verified exact match"
  if (lower === 'verified exact match') {
    return 1;
  }

  // Tier 3: missing notes or unverified images
  if (
    lower.includes('no verified') ||
    lower.includes('unverified') ||
    lower.includes('not verified') ||
    lower.includes('left blank')
  ) {
    return 3;
  }

  // Tier 2: other experiences with verification notes
  return 2;
}

/**
 * Explore page priority ordering:
 * Priority 1 — Show first: image_note exactly equals "Verified exact match"
 * Priority 2 — Show after Priority 1: other Wikimedia Commons / verification notes, plus null/empty/unexpected notes
 * Priority 3 — Show last: any experience whose image_note contains
 * "Wikimedia Commons - Red Fort, Delhi (representative Heritage/Fort/Architecture/Museum photo)"
 */
export function getExplorePriority(note?: string | null): number {
  if (note != null) {
    const trimmed = String(note).trim();

    // Priority 1: Exact match for "Verified exact match"
    if (trimmed.toLowerCase() === 'verified exact match') {
      return 1;
    }

    // Priority 3: Red Fort representative-photo notes
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('wikimedia commons - red fort, delhi (representative heritage/fort/architecture/museum photo)') ||
      (lower.includes('red fort, delhi') && lower.includes('representative')) ||
      lower.includes('representative heritage/fort/architecture/museum photo')
    ) {
      return 3;
    }
  }

  // Priority 2: Other Wikimedia Commons notes, other verification notes, null, empty, unexpected
  return 2;
}

/**
 * Maps a Listing object into public.experience table schema
 */
export function listingToExperienceRow(listing: Partial<Listing>, providerEmail?: string): ExperienceInsert {
  const current = getStoredUser();
  const effectiveEmail = providerEmail || listing.owner_email || current?.email || null;
  const ownerId = listing.owner_id || current?.id || null;
  const photoUrl = listing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80';

  const priceClean = typeof listing.price_level === 'string'
    ? parseFloat(listing.price_level.replace(/[^\d.]/g, '')) || null
    : null;

  const hoursString = listing.hours && typeof listing.hours === 'object'
    ? (Object.values(listing.hours)[0] || '10:00 AM - 10:00 PM')
    : '10:00 AM - 10:00 PM';

  return {
    experience_id: listing.id || 'exp_' + Date.now(),
    experience_name: listing.name || 'Untitled Experience',
    category: listing.category || 'attractions',
    sub_category: listing.category || null,
    description: listing.description || '',
    city: listing.address || listing.area || 'Mumbai',
    district: listing.area || 'Mumbai',
    state: 'Maharashtra',
    region: 'Konkan / MMR',
    latitude: typeof listing.lat === 'number' ? listing.lat : 18.9217,
    longitude: typeof listing.lng === 'number' ? listing.lng : 72.8332,
    price_inr: listing.price_level || '₹₹',
    price_inr_clean: priceClean,
    rating: typeof listing.rating === 'number' ? listing.rating : 5.0,
    review_count: typeof listing.review_count === 'number' ? listing.review_count : 1,
    image_url: photoUrl,
    image_note: listing.name || 'Establishment Photo',
    source_name: listing.name || 'LocalLens Provider',
    source_url: (listing.website && listing.website.trim() !== '' && listing.website.trim() !== 'https://' && listing.website.trim() !== 'http://') ? listing.website.trim() : null,
    best_time: hoursString,
    availability: 'Open Daily',
    duration_hours: '2-3 hours',
    local_experience_bool: true,
    hidden_gem_bool: false,
    booking_required: 'No',
    booking_required_bool: false,
    indoor_outdoor: 'Indoor / Outdoor',
    indoor_outdoor_clean: 'Mixed',
    provider_id: ownerId,
    user_id: ownerId,
    provider_email: effectiveEmail,
    status: listing.status || 'approved',
    last_verified: new Date().toISOString()
  };
}

/**
 * Public listing fetch: returns all real experiences from Supabase experience table
 * sorted with newest additions at the top.
 */
export async function fetchListings(filters?: FilterOptions): Promise<Listing[]> {
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  if (isSupabaseConfigured && !isTest) {
    try {
      let query = supabase
        .from('experience')
        .select('*')
        .order('last_verified', { ascending: false });

      if (filters?.exactImageNote) {
        query = query.eq('image_note', filters.exactImageNote);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.ilike('category', `%${filters.category}%`);
      }
      if (filters?.searchQuery) {
        query = query.ilike('experience_name', `%${filters.searchQuery}%`);
      }
      const { data, error } = await query;
      if (!error && data) {
        const deletedIds = getDeletedListingIds();
        let mappedList = data
          .map(experienceRowToListing)
          .filter(item => !deletedIds.includes(item.id));

        if (filters?.exactImageNote) {
          mappedList = mappedList.filter(item => item.image_note === filters.exactImageNote);
        }

        if (filters?.area && filters.area !== 'all') {
          mappedList = mappedList.filter(item => item.area.toLowerCase().includes(filters.area!.toLowerCase()));
        }

        if (filters?.priceLevel && filters.priceLevel !== 'all') {
          mappedList = mappedList.filter(item => item.price_level === filters.priceLevel);
        }

        // Prioritize by image_note:
        // Tier 1: image_note = 'Verified exact match' first
        // Tier 2: other experiences with verification notes
        // Tier 3: experiences with missing notes or unverified images last
        // Within the same tier, preserve the selected sort order
        mappedList.sort((a, b) => {
          const tierA = getImageNoteTier(a.image_note);
          const tierB = getImageNoteTier(b.image_note);
          if (tierA !== tierB) {
            return tierA - tierB;
          }
          if (filters?.sortBy === 'rating') {
            return b.rating - a.rating;
          } else if (filters?.sortBy === 'reviews') {
            return b.review_count - a.review_count;
          } else if (filters?.sortBy === 'name') {
            return a.name.localeCompare(b.name);
          } else if (filters?.sortBy === 'price') {
            const priceA = parseFloat(a.price_level.replace(/[^\d.]/g, '')) || 0;
            const priceB = parseFloat(b.price_level.replace(/[^\d.]/g, '')) || 0;
            return priceA - priceB;
          }
          return 0;
        });

        return mappedList;
      }
    } catch (e) {
      console.warn('Supabase experience fetch failed, falling back to verified local data', e);
    }
  }

  // Fallback to local verified listings
  let list = getLocalListings();

  if (filters?.exactImageNote) {
    list = list.filter(item => item.image_note === filters.exactImageNote);
  }

  if (filters?.category && filters.category !== 'all') {
    list = list.filter(item => item.category === filters.category);
  }

  if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.area.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }

  if (filters?.area && filters.area !== 'all') {
    list = list.filter(item => item.area.toLowerCase().includes(filters.area!.toLowerCase()));
  }

  if (filters?.priceLevel && filters.priceLevel !== 'all') {
    list = list.filter(item => item.price_level === filters.priceLevel);
  }

  // Prioritize by image_note tier with secondary sort preservation
  list.sort((a, b) => {
    const tierA = getImageNoteTier(a.image_note);
    const tierB = getImageNoteTier(b.image_note);
    if (tierA !== tierB) {
      return tierA - tierB;
    }
    if (filters?.sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (filters?.sortBy === 'reviews') {
      return b.review_count - a.review_count;
    } else if (filters?.sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (filters?.sortBy === 'price') {
      const priceA = parseFloat(a.price_level.replace(/[^\d.]/g, '')) || 0;
      const priceB = parseFloat(b.price_level.replace(/[^\d.]/g, '')) || 0;
      return priceA - priceB;
    }
    return 0;
  });

  return list;
}

export const fetchPublicListings = fetchListings;

/**
 * Fetch all listings for Admin oversight (from public.experience, newest first)
 */
export async function fetchAllListingsForAdmin(): Promise<Listing[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('last_verified', { ascending: false });
      if (!error && data && data.length > 0) {
        const deletedIds = getDeletedListingIds();
        return data
          .map(experienceRowToListing)
          .filter(item => !deletedIds.includes(item.id));
      }
    } catch (e) {
      console.warn('Supabase admin experience fetch failed', e);
    }
  }
  return getLocalListings();
}

/**
 * Fetch listings belonging to a specific provider from public.experience.
 * Strictly isolates listings so a provider only sees their own establishments.
 */
export async function fetchListingsByOwner(ownerId?: string, ownerEmail?: string): Promise<Listing[]> {
  const currentUser = getStoredUser();
  let effectiveId = ownerId || currentUser?.id;
  let effectiveEmail = (ownerEmail || currentUser?.email || '').trim().toLowerCase();

  // If ID or email is missing, try fetching from supabase auth session
  if (isSupabaseConfigured && (!effectiveId || !effectiveEmail)) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user) {
        if (!effectiveId) effectiveId = authUser.user.id;
        if (!effectiveEmail && authUser.user.email) {
          effectiveEmail = authUser.user.email.trim().toLowerCase();
        }
      }
    } catch {}
  }

  // Strict isolation: if no provider identity is present, never return any listings
  if (!effectiveId && !effectiveEmail) {
    return [];
  }

  const deletedIds = getDeletedListingIds();

  // Strict ownership check: only listings that strictly match this provider's ID or email
  const isOwnedByCurrentProvider = (item: Listing): boolean => {
    if (!item || !item.id || deletedIds.includes(item.id)) return false;

    // Check ID match
    const matchesId = Boolean(effectiveId && item.owner_id === effectiveId);

    // Check email match
    const itemEmail = (item.owner_email || '').trim().toLowerCase();
    const ownerIdAsEmail = (item.owner_id || '').trim().toLowerCase();
    const matchesEmail = Boolean(
      effectiveEmail && (itemEmail === effectiveEmail || ownerIdAsEmail === effectiveEmail)
    );

    return matchesId || matchesEmail;
  };

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('experience')
        .select('*')
        .order('last_verified', { ascending: false });

      if (effectiveId && effectiveEmail) {
        query = query.or(`provider_id.eq.${effectiveId},user_id.eq.${effectiveId},provider_email.eq.${effectiveEmail},provider_email.ilike.${effectiveEmail}`);
      } else if (effectiveId) {
        query = query.or(`provider_id.eq.${effectiveId},user_id.eq.${effectiveId}`);
      } else if (effectiveEmail) {
        query = query.or(`provider_email.eq.${effectiveEmail},provider_email.ilike.${effectiveEmail}`);
      }

      const { data, error } = await query;
      if (!error && data) {
        const dbItems = data
          .map(experienceRowToListing)
          .filter(isOwnedByCurrentProvider);

        // Merge any newly registered local listings for this provider so they are instantly visible without delay
        const localItems = getLocalListings().filter(isOwnedByCurrentProvider);

        const mergedMap = new Map<string, Listing>();
        for (const item of localItems) {
          mergedMap.set(item.id, item);
        }
        for (const item of dbItems) {
          mergedMap.set(item.id, item);
        }
        return Array.from(mergedMap.values());
      }
    } catch (e) {
      console.warn('Supabase experience fetchByOwner failed, falling back to local', e);
    }
  }

  // Local fallback: strictly filter only listings belonging to this specific provider
  const all = getLocalListings();
  return all.filter(isOwnedByCurrentProvider);
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const deletedIds = getDeletedListingIds();
  if (deletedIds.includes(id)) {
    return null;
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('experience_id', id)
        .maybeSingle();

      if (!error && data) {
        const expId = String(data.experience_id || (data as any).id || '');
        if (deletedIds.includes(expId)) return null;
        return experienceRowToListing(data);
      }
    } catch (e) {
      console.warn('Supabase experience fetchById failed, using local store', e);
    }
  }

  const list = getLocalListings();
  const match = list.find(item => item.id === id);
  return match || null;
}

export function dbProfileToProfile(row: Record<string, unknown>): Profile {
  const emailStr = (row.email as string) || '';
  const isAdmin = row.role === 'admin' || emailStr.toLowerCase().includes('admin');
  const assignedRole: UserRole = isAdmin ? 'admin' : 'provider';

  return {
    id: (row.id as string) || 'prov_' + Date.now(),
    email: emailStr || undefined,
    role: assignedRole,
    name: (row.name as string) || (row.full_name as string) || (emailStr ? emailStr.split('@')[0] : 'Provider'),
    avatar: (row.avatar as string) || (row.avatar_url as string) || undefined,
    business_name: (row.business_name as string) || undefined,
    provider_status: (row.provider_status as ProviderStatus) || (assignedRole === 'provider' ? 'pending' : 'approved'),
    provider_review_note: (row.provider_review_note as string) || undefined,
    reviewed_by: (row.reviewed_by as string) || undefined,
    reviewed_at: (row.reviewed_at as string) || undefined,
    theme: (row.theme as 'light' | 'dark' | 'system') || 'system',
    created_at: (row.created_at as string) || new Date().toISOString()
  };
}

export async function fetchAllUsers(): Promise<Profile[]> {
  const userMap = new Map<string, Profile>();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        for (const row of data) {
          const profile = dbProfileToProfile(row as unknown as Record<string, unknown>);
          userMap.set(profile.id, profile);
          if (profile.email) userMap.set(profile.email.toLowerCase(), profile);
        }
      }
    } catch (e) {
      console.warn('Supabase fetchAllUsers error:', e);
    }
  }

  const reg = getRegisteredAccounts();
  const provs = getLocalProviders();
  for (const u of [...reg, ...provs]) {
    const key = u.id || u.email?.toLowerCase();
    if (key && !userMap.has(key)) {
      userMap.set(key, u);
    }
  }

  const currentUser = getStoredUser();
  if (currentUser) {
    const key = currentUser.id || currentUser.email?.toLowerCase();
    if (key && !userMap.has(key)) {
      userMap.set(key, currentUser);
    }
  }

  return Array.from(new Set(userMap.values()));
}

export async function fetchProviders(): Promise<Profile[]> {
  const providerMap = new Map<string, Profile>();

  // 1. Fetch from Supabase profiles table
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        for (const row of data) {
          const profile = dbProfileToProfile(row as unknown as Record<string, unknown>);
          if (profile.role === 'provider' || profile.provider_status != null || profile.business_name != null) {
            providerMap.set(profile.id, profile);
            if (profile.email) {
              providerMap.set(profile.email.toLowerCase(), profile);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Supabase fetchProviders failed', e);
    }
  }

  // 2. Merge registered accounts with provider role or provider status
  const regAccounts = getRegisteredAccounts();
  for (const acc of regAccounts) {
    if (acc.role === 'provider' || acc.provider_status) {
      const key = acc.id || acc.email?.toLowerCase();
      if (key && !providerMap.has(key)) {
        providerMap.set(key, acc);
      }
    }
  }

  // 3. Merge local provider registry
  const localList = getLocalProviders();
  for (const prov of localList) {
    const key = prov.id || prov.email?.toLowerCase();
    if (key && !providerMap.has(key)) {
      providerMap.set(key, prov);
    }
  }

  // 4. Merge current session user if provider
  const currentUser = getStoredUser();
  if (currentUser && (currentUser.role === 'provider' || currentUser.provider_status)) {
    const key = currentUser.id || currentUser.email?.toLowerCase();
    if (key && !providerMap.has(key)) {
      providerMap.set(key, currentUser);
    }
  }

  // 5. Query public.experience for any provider shops listed
  if (isSupabaseConfigured) {
    try {
      const { data: expRows } = await supabase
        .from('experience')
        .select('provider_id, user_id, provider_email, source_name, last_verified, status')
        .not('provider_id', 'is', null)
        .limit(100);

      if (expRows && expRows.length > 0) {
        for (const exp of expRows) {
          const provId = exp.provider_id as string;
          const provEmail = exp.provider_email as string;
          const expStatus = exp.status as string;
          const mappedStatus: ProviderStatus = (expStatus === 'approved' || expStatus === 'rejected' || expStatus === 'suspended')
            ? (expStatus as ProviderStatus)
            : 'pending';

          const key = provId || provEmail?.toLowerCase();
          if (key && !providerMap.has(key)) {
            providerMap.set(key, {
              id: provId || 'prov_' + Date.now(),
              email: provEmail || undefined,
              role: 'provider',
              name: (exp.source_name as string) || 'Local Merchant',
              business_name: (exp.source_name as string) || 'Registered Establishment',
              provider_status: mappedStatus,
              created_at: (exp.last_verified as string) || new Date().toISOString()
            });
          } else if (key && providerMap.has(key)) {
            // Keep approved status if already marked approved in any experience
            const existing = providerMap.get(key)!;
            if (existing.provider_status !== 'approved' && mappedStatus === 'approved') {
              existing.provider_status = 'approved';
            }
          }
        }
      }
    } catch {}
  }

  return Array.from(new Set(providerMap.values()));
}

const isUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

export async function fetchLiveProviderStatus(
  userId?: string | null,
  userEmail?: string | null
): Promise<{ status: ProviderStatus; note?: string; reviewedBy?: string; reviewedAt?: string }> {
  const currentUser = getStoredUser();
  const effectiveId = userId || currentUser?.id || null;
  const effectiveEmail = (userEmail || currentUser?.email || '').trim().toLowerCase() || null;

  // 1. Check Supabase profiles table
  if (isSupabaseConfigured) {
    try {
      if (effectiveId && isUUID(effectiveId)) {
        const { data: profById } = await supabase
          .from('profiles')
          .select('provider_status, provider_review_note, reviewed_by, reviewed_at')
          .eq('id', effectiveId)
          .maybeSingle();

        if (profById?.provider_status) {
          const st = profById.provider_status as ProviderStatus;
          if (currentUser && (currentUser.id === effectiveId || currentUser.email === effectiveEmail)) {
            currentUser.provider_status = st;
            currentUser.provider_review_note = profById.provider_review_note || undefined;
            saveStoredUser(currentUser);
          }
          return {
            status: st,
            note: profById.provider_review_note || undefined,
            reviewedBy: profById.reviewed_by || undefined,
            reviewedAt: profById.reviewed_at || undefined
          };
        }
      }

      if (effectiveEmail) {
        const { data: profByEmail } = await supabase
          .from('profiles')
          .select('provider_status, provider_review_note, reviewed_by, reviewed_at')
          .eq('email', effectiveEmail)
          .maybeSingle();

        if (profByEmail?.provider_status) {
          const st = profByEmail.provider_status as ProviderStatus;
          if (currentUser && (currentUser.email === effectiveEmail || currentUser.id === effectiveId)) {
            currentUser.provider_status = st;
            currentUser.provider_review_note = profByEmail.provider_review_note || undefined;
            saveStoredUser(currentUser);
          }
          return {
            status: st,
            note: profByEmail.provider_review_note || undefined,
            reviewedBy: profByEmail.reviewed_by || undefined,
            reviewedAt: profByEmail.reviewed_at || undefined
          };
        }
      }
    } catch (profCheckErr) {
      console.warn('fetchLiveProviderStatus profiles check error:', profCheckErr);
    }

    // 2. Query Supabase public.experience table for provider status
    // In Supabase, the canonical approval field for experiences and provider listings is 'status'
    try {
      const orParts: string[] = [];
      if (effectiveId) {
        orParts.push(`provider_id.eq.${effectiveId}`);
        orParts.push(`user_id.eq.${effectiveId}`);
      }
      if (effectiveEmail) {
        orParts.push(`provider_email.eq.${effectiveEmail}`);
      }

      if (orParts.length > 0) {
        const { data: expRows } = await supabase
          .from('experience')
          .select('status, last_verified')
          .or(orParts.join(','))
          .limit(10);

        if (expRows && expRows.length > 0) {
          if (expRows.some(e => e.status === 'approved')) {
            if (currentUser && (currentUser.id === effectiveId || currentUser.email === effectiveEmail)) {
              currentUser.provider_status = 'approved';
              saveStoredUser(currentUser);
            }
            return { status: 'approved' };
          }
          if (expRows.some(e => e.status === 'suspended')) {
            return { status: 'suspended' };
          }
          if (expRows.every(e => e.status === 'rejected')) {
            return { status: 'rejected' };
          }
        }
      }
    } catch (expCheckErr) {
      console.warn('fetchLiveProviderStatus experience check notice:', expCheckErr);
    }
  }

  // 3. Check local registered accounts and mock stores
  const localProviders = getLocalProviders();
  const localMatch = localProviders.find(p => (effectiveId && p.id === effectiveId) || (effectiveEmail && p.email?.toLowerCase() === effectiveEmail));
  if (localMatch?.provider_status) {
    return {
      status: localMatch.provider_status,
      note: localMatch.provider_review_note,
      reviewedBy: localMatch.reviewed_by,
      reviewedAt: localMatch.reviewed_at
    };
  }

  const regAccounts = getRegisteredAccounts();
  const regMatch = regAccounts.find(p => (effectiveId && p.id === effectiveId) || (effectiveEmail && p.email?.toLowerCase() === effectiveEmail));
  if (regMatch?.provider_status) {
    return {
      status: regMatch.provider_status,
      note: regMatch.provider_review_note,
      reviewedBy: regMatch.reviewed_by,
      reviewedAt: regMatch.reviewed_at
    };
  }

  if (currentUser?.provider_status) {
    return {
      status: currentUser.provider_status,
      note: currentUser.provider_review_note,
      reviewedBy: currentUser.reviewed_by,
      reviewedAt: currentUser.reviewed_at
    };
  }

  return { status: 'pending' };
}

export async function updateProviderApproval(
  providerId: string,
  newStatus: ProviderStatus,
  note?: string,
  adminId?: string
): Promise<Profile | null> {
  const reviewedAt = new Date().toISOString();

  let supabaseUpdatedProfile: Profile | null = null;

  // Retrieve provider metadata to ensure email and IDs are available for persistent updates
  const providers = getLocalProviders();
  const regAccounts = getRegisteredAccounts();
  const matchedProv = providers.find(p => p.id === providerId || (p.email && p.email.toLowerCase() === providerId.toLowerCase()))
    || regAccounts.find(p => p.id === providerId || (p.email && p.email.toLowerCase() === providerId.toLowerCase()));
  const providerEmail = matchedProv?.email || (providerId.includes('@') ? providerId : undefined);
  const validAdminId = isUUID(adminId) ? adminId : null;

  if (isSupabaseConfigured) {
    try {
      // 1. Update in Supabase public.profiles if providerId is a UUID or has matching email
      if (isUUID(providerId)) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              provider_status: newStatus,
              provider_review_note: note || null,
              reviewed_by: validAdminId,
              reviewed_at: reviewedAt
            })
            .eq('id', providerId)
            .select()
            .maybeSingle();

          if (!error && data) {
            supabaseUpdatedProfile = data as Profile;
          }
        } catch (profErr) {
          console.warn('Supabase updateProviderApproval profile id update notice:', profErr);
        }
      }

      if (!supabaseUpdatedProfile && providerEmail) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              provider_status: newStatus,
              provider_review_note: note || null,
              reviewed_by: validAdminId,
              reviewed_at: reviewedAt
            })
            .eq('email', providerEmail.toLowerCase())
            .select()
            .maybeSingle();

          if (!error && data) {
            supabaseUpdatedProfile = data as Profile;
          }
        } catch (profEmailErr) {
          console.warn('Supabase updateProviderApproval profile email update notice:', profEmailErr);
        }
      }

      // 2. Persist approval status to public.experience table in Supabase
      // Canonical status representation in experience table is 'status' ('approved', 'pending', etc.)
      try {
        const queryOrParts: string[] = [];
        if (providerId) {
          queryOrParts.push(`provider_id.eq.${providerId}`);
          queryOrParts.push(`user_id.eq.${providerId}`);
        }
        if (matchedProv?.id && matchedProv.id !== providerId) {
          queryOrParts.push(`provider_id.eq.${matchedProv.id}`);
          queryOrParts.push(`user_id.eq.${matchedProv.id}`);
        }
        if (providerEmail) {
          queryOrParts.push(`provider_email.eq.${providerEmail.toLowerCase()}`);
        }

        if (queryOrParts.length > 0) {
          await supabase
            .from('experience')
            .update({ status: newStatus })
            .or(queryOrParts.join(','));
        }
      } catch (expUpdateErr) {
        console.warn('Supabase updateProviderApproval experience sync notice:', expUpdateErr);
      }
    } catch (e) {
      console.warn('Supabase updateProviderApproval error', e);
    }
  }

  // Update in local store ALWAYS so local cache and mock fallback stay synchronized
  const index = providers.findIndex(p => p.id === providerId || (p.email && p.email.toLowerCase() === providerId.toLowerCase()));
  let updatedProvider: Profile | null = supabaseUpdatedProfile;

  if (index !== -1) {
    providers[index] = {
      ...providers[index],
      provider_status: newStatus,
      provider_review_note: note || undefined,
      reviewed_by: adminId || undefined,
      reviewed_at: reviewedAt
    };
    saveLocalProviders(providers);
    if (!updatedProvider) updatedProvider = providers[index];
  } else if (supabaseUpdatedProfile) {
    providers.unshift(supabaseUpdatedProfile);
    saveLocalProviders(providers);
  }

  // Also sync with registered permanent accounts
  const regIdx = regAccounts.findIndex(p => p.id === providerId || (p.email && p.email.toLowerCase() === providerId.toLowerCase()));
  if (regIdx !== -1) {
    regAccounts[regIdx].provider_status = newStatus;
    regAccounts[regIdx].provider_review_note = note || undefined;
    regAccounts[regIdx].reviewed_by = adminId || undefined;
    regAccounts[regIdx].reviewed_at = reviewedAt;
    saveRegisteredAccount(regAccounts[regIdx]);
    if (!updatedProvider) updatedProvider = regAccounts[regIdx];
  }

  // If the currently logged-in user is this provider, update their active profile
  const currentUser = getStoredUser();
  if (currentUser && (
    currentUser.id === providerId || 
    (currentUser.email && (currentUser.email.toLowerCase() === providerId.toLowerCase() || (providerEmail && currentUser.email.toLowerCase() === providerEmail.toLowerCase()))) || 
    (updatedProvider?.id && currentUser.id === updatedProvider.id)
  )) {
    currentUser.provider_status = newStatus;
    currentUser.provider_review_note = note;
    currentUser.reviewed_by = adminId || undefined;
    currentUser.reviewed_at = reviewedAt;
    saveStoredUser(currentUser);
  }

  // Notify active components/listeners of status update across windows & tabs
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('locallens_user_updated', { detail: { providerId, status: newStatus } }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  // Create an in-app notification for the provider
  addLocalNotification({
    user_id: providerId,
    title: newStatus === 'approved' ? 'Provider Account Approved! 🎉' : 'Provider Application Update',
    message: newStatus === 'approved'
      ? 'Congratulations! Your LocalLens provider profile has been verified and approved. Your listings are now live.'
      : `Your provider application was set to ${newStatus.toUpperCase()}.${note ? ` Reason: ${note}` : ''}`,
    type: newStatus === 'approved' ? 'success' : 'warning'
  });

  return updatedProvider;
}

export async function updateListingStatus(
  listingId: string,
  status: ListingStatus
): Promise<Listing | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('experience')
        .update({ last_verified: new Date().toISOString() })
        .eq('experience_id', listingId)
        .select()
        .single();
      if (!error && data) return experienceRowToListing(data);
    } catch (e) {
      console.warn('Supabase updateListingStatus error', e);
    }
  }

  const listings = getLocalListings();
  const idx = listings.findIndex(l => l.id === listingId);
  if (idx !== -1) {
    listings[idx].status = status;
    saveLocalListings(listings);
    return listings[idx];
  }
  return null;
}

// ----------------------------------------------------
// Public API Functions: Reviews
// ----------------------------------------------------

export async function fetchReviewsByListing(listingId: string): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Review[];
    } catch (e) {
      console.warn('Supabase fetchReviews failed, using local store', e);
    }
  }

  const reviews = getLocalReviews();
  return reviews.filter(r => r.listing_id === listingId);
}

export async function fetchReviewsByUser(userId: string): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Review[];
    } catch (e) {
      console.warn('Supabase user reviews error', e);
    }
  }
  const reviews = getLocalReviews();
  return reviews.filter(r => r.user_id === userId);
}

export async function addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  const newReview: Review = {
    ...review,
    id: 'rev_' + Date.now(),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('reviews').insert({
        id: newReview.id,
        listing_id: newReview.listing_id,
        user_id: newReview.user_id,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: newReview.created_at
      }).select().single();
      if (!error && data) return { ...data, user_name: newReview.user_name, user_avatar: newReview.user_avatar } as Review;
    } catch (e) {
      console.warn('Supabase addReview failed, using local fallback', e);
    }
  }

  const reviews = getLocalReviews();
  reviews.unshift(newReview);
  saveLocalReviews(reviews);

  // Recalculate listing rating in local store
  const listings = getLocalListings();
  const listing = listings.find(l => l.id === review.listing_id);
  if (listing) {
    const listingReviews = reviews.filter(r => r.listing_id === review.listing_id);
    const avg = listingReviews.reduce((sum, r) => sum + r.rating, 0) / listingReviews.length;
    listing.rating = Math.round(avg * 10) / 10;
    listing.review_count = listingReviews.length;
    saveLocalListings(listings);
  }

  return newReview;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('reviews').delete().eq('id', reviewId);
    } catch (e) {
      console.warn('Supabase delete review error', e);
    }
  }
  const reviews = getLocalReviews();
  const filtered = reviews.filter(r => r.id !== reviewId);
  saveLocalReviews(filtered);
  return true;
}

// ----------------------------------------------------
// Public API Functions: Listings Management
// ----------------------------------------------------

export async function createListing(
  listingData: Omit<Listing, 'id' | 'created_at' | 'rating' | 'review_count'> & { owner_email?: string }
): Promise<Listing> {
  const currentUser = getStoredUser();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase().includes('admin');

  // If user is a provider and not an admin, verify approval
  if (!isAdmin && currentUser?.role === 'provider') {
    let isApproved = currentUser.provider_status === 'approved';

    // Verify against live database in case admin approved on another machine/session
    if (!isApproved) {
      const liveCheck = await fetchLiveProviderStatus(currentUser.id || listingData.owner_id, currentUser.email || listingData.owner_email);
      if (liveCheck.status === 'approved') {
        isApproved = true;
        currentUser.provider_status = 'approved';
        saveStoredUser(currentUser);
      }
    }

    if (!isApproved) {
      const checkId = currentUser.id || listingData.owner_id;
      const localProv = getLocalProviders().find(p => p.id === checkId);
      if (localProv?.provider_status === 'approved') {
        isApproved = true;
      }
    }

    if (!isApproved) {
      throw new Error('Action blocked: Your provider account is currently pending administrator verification. Please wait for an admin to approve your account before publishing.');
    }
  }

  let effectiveOwnerId = listingData.owner_id || currentUser?.id || null;
  let effectiveEmail = (listingData.owner_email || currentUser?.email || '').trim().toLowerCase() || null;

  if (isSupabaseConfigured && (!effectiveOwnerId || !effectiveEmail)) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user) {
        if (!effectiveOwnerId) effectiveOwnerId = authUser.user.id;
        if (!effectiveEmail && authUser.user.email) {
          effectiveEmail = authUser.user.email.trim().toLowerCase();
        }
      }
    } catch {}
  }

  const generatedId = 'EXP-' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const newListing: Listing = {
    ...listingData,
    owner_id: effectiveOwnerId || ('provider_' + Date.now()),
    owner_email: effectiveEmail || undefined,
    id: generatedId,
    created_at: new Date().toISOString(),
    rating: 5.0,
    review_count: 1,
    status: listingData.status || 'approved'
  };

  if (isSupabaseConfigured) {
    try {
      const expPayload = listingToExperienceRow(newListing, effectiveEmail || undefined);

      // Insert directly into public.experience table in Supabase
      const insertPromise = supabase
        .from('experience')
        .insert(expPayload)
        .select();

      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'Database response delayed' } }), 6000)
      );

      const res = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (!res.error && res.data && res.data.length > 0) {
        const mapped = experienceRowToListing(res.data[0]);
        const listings = getLocalListings();
        const withoutOld = listings.filter(l => l.id !== mapped.id);
        saveLocalListings([mapped, ...withoutOld]);
        return mapped;
      }
      if (res.error) {
        console.warn('Supabase experience insert notice:', res.error.message);
      }
    } catch (e: unknown) {
      console.warn('Supabase createListing notice, saving to local cache:', e);
    }
  }

  // Fallback to local listings cache so user never loses work
  const listings = getLocalListings();
  const withoutOld = listings.filter(l => l.id !== newListing.id);
  saveLocalListings([newListing, ...withoutOld]);
  return newListing;
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
  const listings = getLocalListings();
  const current = listings.find(l => l.id === id);

  if (isSupabaseConfigured) {
    try {
      const currentUser = getStoredUser();
      let effectiveEmail = (currentUser?.email || '').trim().toLowerCase() || null;
      let effectiveOwnerId = current?.owner_id || currentUser?.id || null;

      if (!effectiveEmail || !effectiveOwnerId) {
        try {
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser?.user) {
            if (!effectiveOwnerId) effectiveOwnerId = authUser.user.id;
            if (!effectiveEmail && authUser.user.email) {
              effectiveEmail = authUser.user.email.trim().toLowerCase();
            }
          }
        } catch {}
      }

      const expPayload = listingToExperienceRow({
        ...(current || {}),
        ...updates,
        id,
        owner_id: effectiveOwnerId || undefined
      }, effectiveEmail || undefined);

      const updatePromise = supabase
        .from('experience')
        .update(expPayload)
        .eq('experience_id', id)
        .select();

      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'Database response delayed' } }), 6000)
      );

      const res = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (!res.error && res.data && res.data.length > 0) {
        const mapped = experienceRowToListing(res.data[0]);
        const index = listings.findIndex(l => l.id === id);
        if (index !== -1) {
          listings[index] = mapped;
          saveLocalListings(listings);
        }
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase updateListing failed, updating locally', e);
    }
  }

  const index = listings.findIndex(l => l.id === id);
  if (index !== -1) {
    listings[index] = { ...listings[index], ...updates };
    saveLocalListings(listings);
    return listings[index];
  }
  return null;
}

export async function deleteListing(id: string): Promise<boolean> {
  // 1. Immediately mark this ID as permanently deleted in client storage
  // so it is immediately hidden from Explore page, Provider Dashboard, Admin, and Detail pages
  markListingAsDeleted(id);

  // 2. Remove from local listings cache
  const listings = getLocalListings();
  saveLocalListings(listings.filter(l => l.id !== id));

  // 3. Remove from favorites
  const favorites = getLocalFavorites();
  saveLocalFavorites(favorites.filter(fId => fId !== id));

  // 4. Delete directly from Supabase public.experience table
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('experience_id', id);

      if (error) {
        console.warn('Supabase deleteListing notice:', error.message);
        if (error.code === '55000') {
          console.error(
            'Supabase Replica Identity: To enable deletion from public.experience, please run: ALTER TABLE public.experience REPLICA IDENTITY FULL;'
          );
        }
        // Fallback: soft-delete by clearing provider ownership in DB so it never matches the provider
        try {
          await supabase
            .from('experience')
            .update({
              provider_id: 'deleted_' + Date.now(),
              provider_email: 'deleted@internal'
            })
            .eq('experience_id', id);
        } catch {}
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteListing error:', e);
    }
  }

  return true;
}

// ----------------------------------------------------
// Public API Functions: Photo Upload to Storage
// ----------------------------------------------------

export interface UploadPhotoResult {
  url?: string;
  error?: string;
  isStorage?: boolean;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
            return;
          }
        } catch {
          // Fallback to original data URL if canvas manipulation fails
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export async function uploadListingPhoto(
  file: File,
  providerId: string = 'provider'
): Promise<UploadPhotoResult> {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      error: `Invalid file format (${file.type || 'unknown'}). Only JPEG, PNG, and WebP images are allowed.`,
    };
  }

  // Validate file size
  if (file.size > MAX_PHOTO_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      error: `File is too large (${sizeMb} MB). Maximum allowed upload size is 5 MB.`,
    };
  }

  // Attempt Supabase Storage upload if client is configured and not running unit tests
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  if (isSupabaseConfigured && !isTest) {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanName = `${providerId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('listing-photos')
        .upload(cleanName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(cleanName);
        
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, isStorage: true };
        }
      } else if (error) {
        console.warn('Supabase storage upload error, falling back to optimized local image:', error.message);
      }
    } catch (e) {
      console.warn('Supabase storage exception, falling back to optimized local image:', e);
    }
  }

  // Fallback to compressed data URL so provider flow continues smoothly without choking payload size
  const compressedUrl = await compressImageToDataUrl(file);
  if (compressedUrl) {
    return { url: compressedUrl, isStorage: false };
  }
  return { error: 'Failed to process image file.' };
}

export async function deleteListingPhoto(photoUrl: string): Promise<boolean> {
  if (isSupabaseConfigured && photoUrl.includes('/listing-photos/')) {
    try {
      const parts = photoUrl.split('/listing-photos/');
      if (parts[1]) {
        await supabase.storage.from('listing-photos').remove([decodeURIComponent(parts[1])]);
      }
    } catch (e) {
      console.warn('Failed to delete photo from storage:', e);
    }
  }
  return true;
}
