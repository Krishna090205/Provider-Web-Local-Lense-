import { Database, UserRole, ProviderStatus, ListingCategory, ListingStatus } from './database';

export * from './database';

export interface Profile {
  id: string;
  email?: string;
  role: UserRole;
  name: string;
  avatar?: string;
  business_name?: string;
  provider_status?: ProviderStatus;
  provider_review_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  theme?: 'light' | 'dark' | 'system';
  created_at: string;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  url: string;
  caption?: string;
  is_cover: boolean;
  display_order?: number;
  created_at?: string;
}

export interface Listing {
  id: string;
  owner_id?: string;
  category: ListingCategory;
  name: string;
  description: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  hours: Record<string, string>;
  phone: string | null;
  website: string | null;
  price_level: string;
  status: ListingStatus;
  provider_status?: ProviderStatus;
  featured: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  photos?: ListingPhoto[];
}

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface FilterOptions {
  category?: ListingCategory | 'all';
  searchQuery?: string;
  area?: string;
  sortBy?: 'rating' | 'reviews' | 'name' | 'price';
  priceLevel?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}
