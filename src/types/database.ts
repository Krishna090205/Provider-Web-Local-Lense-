export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'provider' | 'admin';
export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ListingCategory = 'hotels' | 'restaurants' | 'shops' | 'attractions' | 'forts';
export type ListingStatus = 'pending' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          name: string;
          full_name?: string | null;
          email?: string | null;
          avatar: string | null;
          avatar_url?: string | null;
          business_name: string | null;
          provider_status: ProviderStatus;
          provider_review_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          theme: 'light' | 'dark' | 'system';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          name?: string;
          full_name?: string | null;
          email?: string | null;
          avatar?: string | null;
          avatar_url?: string | null;
          business_name?: string | null;
          provider_status?: ProviderStatus;
          provider_review_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          theme?: 'light' | 'dark' | 'system';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          name?: string;
          full_name?: string | null;
          email?: string | null;
          avatar?: string | null;
          avatar_url?: string | null;
          business_name?: string | null;
          provider_status?: ProviderStatus;
          provider_review_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          theme?: 'light' | 'dark' | 'system';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string | null;
          category: ListingCategory;
          name: string;
          description: string;
          address: string;
          area: string;
          lat: number;
          lng: number;
          hours: Json;
          phone: string | null;
          website: string | null;
          price_level: string;
          status: ListingStatus;
          featured: boolean;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          category: ListingCategory;
          name: string;
          description: string;
          address: string;
          area: string;
          lat: number;
          lng: number;
          hours?: Json;
          phone?: string | null;
          website?: string | null;
          price_level?: string;
          status?: ListingStatus;
          featured?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          category?: ListingCategory;
          name?: string;
          description?: string;
          address?: string;
          area?: string;
          lat?: number;
          lng?: number;
          hours?: Json;
          phone?: string | null;
          website?: string | null;
          price_level?: string;
          status?: ListingStatus;
          featured?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      experience: {
        Row: {
          experience_id: string | null;
          experience_name: string | null;
          city: string | null;
          district: string | null;
          state: string | null;
          region: string | null;
          latitude: number | null;
          longitude: number | null;
          category: string | null;
          sub_category: string | null;
          description: string | null;
          tags: string | null;
          price_inr: string | null;
          duration_hours: string | null;
          best_for: string | null;
          min_group_size: number | null;
          max_group_size: number | null;
          rating: number | null;
          review_count: number | null;
          best_time: string | null;
          season: string | null;
          indoor_outdoor: string | null;
          booking_required: string | null;
          advance_booking_days: string | null;
          availability: string | null;
          accessibility: string | null;
          local_experience: string | null;
          hidden_gem: string | null;
          estimated_travel_time_from_city_center: string | null;
          estimated_travel_time_from_panvel: string | null;
          source_name: string | null;
          source_url: string | null;
          last_verified: string | null;
          price_inr_clean: number | null;
          duration_hours_clean: number | null;
          advance_booking_days_clean: number | null;
          travel_time_city_center_min: number | null;
          travel_time_panvel_hrs: number | null;
          travel_dist_panvel_km: number | null;
          local_experience_bool: boolean | null;
          hidden_gem_bool: boolean | null;
          booking_required_detail: string | null;
          booking_required_bool: boolean | null;
          indoor_outdoor_clean: string | null;
          rating_missing: boolean | null;
          review_count_missing: boolean | null;
          max_group_size_missing: boolean | null;
          image_url: string | null;
          image_note: string | null;
          provider_id: string | null;
          user_id: string | null;
          provider_email: string | null;
        };
        Insert: {
          experience_id?: string | null;
          experience_name?: string | null;
          city?: string | null;
          district?: string | null;
          state?: string | null;
          region?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          category?: string | null;
          sub_category?: string | null;
          description?: string | null;
          tags?: string | null;
          price_inr?: string | null;
          duration_hours?: string | null;
          best_for?: string | null;
          min_group_size?: number | null;
          max_group_size?: number | null;
          rating?: number | null;
          review_count?: number | null;
          best_time?: string | null;
          season?: string | null;
          indoor_outdoor?: string | null;
          booking_required?: string | null;
          advance_booking_days?: string | null;
          availability?: string | null;
          accessibility?: string | null;
          local_experience?: string | null;
          hidden_gem?: string | null;
          estimated_travel_time_from_city_center?: string | null;
          estimated_travel_time_from_panvel?: string | null;
          source_name?: string | null;
          source_url?: string | null;
          last_verified?: string | null;
          price_inr_clean?: number | null;
          duration_hours_clean?: number | null;
          advance_booking_days_clean?: number | null;
          travel_time_city_center_min?: number | null;
          travel_time_panvel_hrs?: number | null;
          travel_dist_panvel_km?: number | null;
          local_experience_bool?: boolean | null;
          hidden_gem_bool?: boolean | null;
          booking_required_detail?: string | null;
          booking_required_bool?: boolean | null;
          indoor_outdoor_clean?: string | null;
          rating_missing?: boolean | null;
          review_count_missing?: boolean | null;
          max_group_size_missing?: boolean | null;
          image_url?: string | null;
          image_note?: string | null;
          provider_id?: string | null;
          user_id?: string | null;
          provider_email?: string | null;
        };
        Update: {
          experience_id?: string | null;
          experience_name?: string | null;
          city?: string | null;
          district?: string | null;
          state?: string | null;
          region?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          category?: string | null;
          sub_category?: string | null;
          description?: string | null;
          tags?: string | null;
          price_inr?: string | null;
          duration_hours?: string | null;
          best_for?: string | null;
          min_group_size?: number | null;
          max_group_size?: number | null;
          rating?: number | null;
          review_count?: number | null;
          best_time?: string | null;
          season?: string | null;
          indoor_outdoor?: string | null;
          booking_required?: string | null;
          advance_booking_days?: string | null;
          availability?: string | null;
          accessibility?: string | null;
          local_experience?: string | null;
          hidden_gem?: string | null;
          estimated_travel_time_from_city_center?: string | null;
          estimated_travel_time_from_panvel?: string | null;
          source_name?: string | null;
          source_url?: string | null;
          last_verified?: string | null;
          price_inr_clean?: number | null;
          duration_hours_clean?: number | null;
          advance_booking_days_clean?: number | null;
          travel_time_city_center_min?: number | null;
          travel_time_panvel_hrs?: number | null;
          travel_dist_panvel_km?: number | null;
          local_experience_bool?: boolean | null;
          hidden_gem_bool?: boolean | null;
          booking_required_detail?: string | null;
          booking_required_bool?: boolean | null;
          indoor_outdoor_clean?: string | null;
          rating_missing?: boolean | null;
          review_count_missing?: boolean | null;
          max_group_size_missing?: boolean | null;
          image_url?: string | null;
          image_note?: string | null;
          provider_id?: string | null;
          user_id?: string | null;
          provider_email?: string | null;
        };
        Relationships: [];
      };
      listing_photos: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          caption: string | null;
          is_cover: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          url: string;
          caption?: string | null;
          is_cover?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          url?: string;
          caption?: string | null;
          is_cover?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          listing_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { check_uid?: string };
        Returns: boolean;
      };
      is_approved_provider: {
        Args: { check_uid?: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      provider_status_enum: ProviderStatus;
      listing_category: ListingCategory;
      listing_status: ListingStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
