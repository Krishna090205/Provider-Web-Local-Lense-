import { supabase, isSupabaseConfigured } from './supabase';
import { Listing, Review, Profile, FilterOptions, UserRole, ProviderStatus, ListingStatus, NotificationItem } from './types';
import { INITIAL_LISTINGS, INITIAL_REVIEWS } from './seedData';

// Local storage keys
const STORAGE_KEY_LISTINGS = 'locallens_listings_v1';
const STORAGE_KEY_REVIEWS = 'locallens_reviews_v1';
const STORAGE_KEY_FAVORITES = 'locallens_favorites_v1';
const STORAGE_KEY_USER = 'locallens_current_user_v1';
const STORAGE_KEY_PROVIDERS = 'locallens_providers_v1';
const STORAGE_KEY_NOTIFICATIONS = 'locallens_notifications_v1';

// Initial Mock Providers for rich demo testing
const INITIAL_PROVIDERS: Profile[] = [
  {
    id: 'prov-001',
    email: 'rajesh.kulkarni@mumbaicafe.in',
    name: 'Rajesh Kulkarni',
    business_name: 'Marine Sunset Cafe & Eatery',
    role: 'provider',
    provider_status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-10-21T10:30:00Z',
    theme: 'system'
  },
  {
    id: 'prov-002',
    email: 'farhan@merchantcrafts.in',
    name: 'Farhan Merchant',
    business_name: 'Colaba Heritage Curios & Crafts',
    role: 'provider',
    provider_status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-10-22T14:15:00Z',
    theme: 'system'
  },
  {
    id: 'prov-003',
    email: 'priya@malabarstays.in',
    name: 'Priya Shenoy',
    business_name: 'Malabar Hill Boutique Havens',
    role: 'provider',
    provider_status: 'approved',
    reviewed_by: 'admin-demo-id',
    reviewed_at: '2026-10-19T11:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-10-18T09:00:00Z',
    theme: 'system'
  },
  {
    id: 'prov-004',
    email: 'vikram@sawantfoods.in',
    name: 'Vikramaditya Sawant',
    business_name: 'Sawant Bandra Delicacies',
    role: 'provider',
    provider_status: 'rejected',
    provider_review_note: 'Food safety license documentation is expired. Please re-upload valid municipal trade license.',
    reviewed_by: 'admin-demo-id',
    reviewed_at: '2026-10-22T16:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-10-20T12:00:00Z',
    theme: 'system'
  }
];

function getLocalProviders(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(INITIAL_PROVIDERS));
      return INITIAL_PROVIDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROVIDERS;
  }
}

function saveLocalProviders(providers: Profile[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(providers));
  } catch (e) {
    console.error('Failed to save providers to localStorage', e);
  }
}

function getLocalListings(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(INITIAL_LISTINGS));
      return INITIAL_LISTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LISTINGS;
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
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEWS;
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
    if (raw) return JSON.parse(raw);
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
// Public API Functions: Listings
// ----------------------------------------------------

/**
 * Public listing fetch: only returns approved listings from approved providers
 * (or heritage catalog items without an unapproved provider).
 */
export async function fetchListings(filters?: FilterOptions): Promise<Listing[]> {
  const providers = getLocalProviders();
  const approvedProviderIds = new Set(
    providers.filter(p => p.provider_status === 'approved').map(p => p.id)
  );

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('listings')
        .select('*, photos:listing_photos(*)')
        .eq('status', 'approved');

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return (data as Listing[]).filter(l => !l.owner_id || approvedProviderIds.has(l.owner_id));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to verified local data', e);
    }
  }

  // Fallback to local verified listings
  let list = getLocalListings();

  // Public listings must be approved, and if owned by a provider, that provider must be approved
  list = list.filter(item => {
    if (item.status !== 'approved') return false;
    if (item.owner_id && !approvedProviderIds.has(item.owner_id)) return false;
    return true;
  });

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

  if (filters?.sortBy) {
    if (filters.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'reviews') {
      list.sort((a, b) => b.review_count - a.review_count);
    } else if (filters.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return list;
}

/**
 * Fetch all listings for Admin oversight (includes pending, approved, rejected)
 */
export async function fetchAllListingsForAdmin(): Promise<Listing[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('listings').select('*, photos:listing_photos(*)');
      if (!error && data) return data as Listing[];
    } catch (e) {
      console.warn('Supabase admin fetch failed', e);
    }
  }
  return getLocalListings();
}

/**
 * Fetch listings belonging to a specific provider
 */
export async function fetchListingsByOwner(ownerId: string): Promise<Listing[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, photos:listing_photos(*)')
        .eq('owner_id', ownerId);
      if (!error && data) return data as Listing[];
    } catch (e) {
      console.warn('Supabase owner fetch failed', e);
    }
  }
  const all = getLocalListings();
  const owned = all.filter(l => l.owner_id === ownerId);
  return owned.length > 0 ? owned : all.slice(0, 3);
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, photos:listing_photos(*)')
        .eq('id', id)
        .single();
      if (!error && data) return data as Listing;
    } catch (e) {
      console.warn('Supabase fetchById failed, using local store', e);
    }
  }

  const list = getLocalListings();
  const match = list.find(item => item.id === id);
  return match || null;
}

// ----------------------------------------------------
// Public API Functions: Provider Approvals (Admin)
// ----------------------------------------------------

export async function fetchProviders(): Promise<Profile[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'provider')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Profile[];
    } catch (e) {
      console.warn('Supabase fetchProviders failed', e);
    }
  }
  return getLocalProviders();
}

export async function updateProviderApproval(
  providerId: string,
  newStatus: ProviderStatus,
  note?: string,
  adminId?: string
): Promise<Profile | null> {
  const reviewedAt = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          provider_status: newStatus,
          provider_review_note: note || null,
          reviewed_by: adminId || null,
          reviewed_at: reviewedAt
        })
        .eq('id', providerId)
        .select()
        .single();

      if (!error && data) {
        return data as Profile;
      }
    } catch (e) {
      console.warn('Supabase updateProviderApproval error', e);
    }
  }

  // Update in local store
  const providers = getLocalProviders();
  const index = providers.findIndex(p => p.id === providerId);
  let updatedProvider: Profile | null = null;

  if (index !== -1) {
    providers[index] = {
      ...providers[index],
      provider_status: newStatus,
      provider_review_note: note || undefined,
      reviewed_by: adminId || 'admin-demo-id',
      reviewed_at: reviewedAt
    };
    saveLocalProviders(providers);
    updatedProvider = providers[index];
  }

  // If the currently logged-in user is this provider, update their active profile
  const currentUser = getStoredUser();
  if (currentUser && currentUser.id === providerId) {
    currentUser.provider_status = newStatus;
    currentUser.provider_review_note = note;
    currentUser.reviewed_by = adminId || 'admin-demo-id';
    currentUser.reviewed_at = reviewedAt;
    saveStoredUser(currentUser);
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
        .from('listings')
        .update({ status })
        .eq('id', listingId)
        .select()
        .single();
      if (!error && data) return data as Listing;
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

export async function createListing(listingData: Omit<Listing, 'id' | 'created_at' | 'rating' | 'review_count'>): Promise<Listing> {
  const newListing: Listing = {
    ...listingData,
    id: 'list_' + Date.now(),
    created_at: new Date().toISOString(),
    rating: 5.0,
    review_count: 1,
    status: listingData.status || 'pending'
  };

  if (isSupabaseConfigured) {
    try {
      const { photos, provider_status, ...insertPayload } = newListing;
      const { data, error } = await supabase.from('listings').insert(insertPayload).select().single();
      if (!error && data) return { ...data, photos: photos || [], provider_status } as Listing;
    } catch (e) {
      console.warn('Supabase createListing failed, saving locally', e);
    }
  }

  const listings = getLocalListings();
  listings.unshift(newListing);
  saveLocalListings(listings);
  return newListing;
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
  if (isSupabaseConfigured) {
    try {
      const { photos, provider_status, ...updatePayload } = updates;
      const { data, error } = await supabase.from('listings').update(updatePayload).eq('id', id).select().single();
      if (!error && data) return { ...data, photos: photos || [], provider_status } as Listing;
    } catch (e) {
      console.warn('Supabase updateListing failed, updating locally', e);
    }
  }

  const listings = getLocalListings();
  const index = listings.findIndex(l => l.id === id);
  if (index !== -1) {
    listings[index] = { ...listings[index], ...updates };
    saveLocalListings(listings);
    return listings[index];
  }
  return null;
}

export async function deleteListing(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteListing failed, removing locally', e);
    }
  }

  const listings = getLocalListings();
  const filtered = listings.filter(l => l.id !== id);
  saveLocalListings(filtered);
  return true;
}
