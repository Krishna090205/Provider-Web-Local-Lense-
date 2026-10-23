export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'tourist' | 'provider' | 'admin';
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
          avatar: string | null;
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
          name: string;
          avatar?: string | null;
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
          avatar?: string | null;
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
