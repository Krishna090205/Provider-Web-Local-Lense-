-- LocalLens: Mumbai Discovery Database Schema with Row Level Security (RLS)

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('tourist', 'business_owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_category AS ENUM ('hotels', 'restaurants', 'shops', 'attractions', 'forts');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'tourist'::user_role NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Listings table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category listing_category NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    hours JSONB DEFAULT '{}'::jsonb NOT NULL,
    phone TEXT,
    website TEXT,
    price_level TEXT DEFAULT '₹₹' NOT NULL,
    status listing_status DEFAULT 'approved'::listing_status NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.5 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Listing Photos table
CREATE TABLE IF NOT EXISTS public.listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    is_cover BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_listing_review UNIQUE(listing_id, user_id)
);

-- 6. Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_favorite UNIQUE(user_id, listing_id)
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 8. Profiles Policies
-- Public can view basic profile info (name, avatar, role)
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 9. Listings Policies
-- Public read of approved listings
CREATE POLICY "Public read of approved listings" 
    ON public.listings FOR SELECT 
    USING (status = 'approved' OR auth.uid() = owner_id);

-- Business owners can insert their own listings
CREATE POLICY "Owners can insert their own listings" 
    ON public.listings FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

-- Owners can update only their own listings
CREATE POLICY "Owners can update own listings" 
    ON public.listings FOR UPDATE 
    USING (auth.uid() = owner_id);

-- Owners can delete only their own listings
CREATE POLICY "Owners can delete own listings" 
    ON public.listings FOR DELETE 
    USING (auth.uid() = owner_id);

-- 10. Listing Photos Policies
CREATE POLICY "Public can view listing photos" 
    ON public.listing_photos FOR SELECT 
    USING (true);

CREATE POLICY "Owners can insert photos for own listings" 
    ON public.listing_photos FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = listing_photos.listing_id 
            AND listings.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete photos of own listings" 
    ON public.listing_photos FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = listing_photos.listing_id 
            AND listings.owner_id = auth.uid()
        )
    );

-- 11. Reviews Policies
-- Public can read all reviews
CREATE POLICY "Public read reviews" 
    ON public.reviews FOR SELECT 
    USING (true);

-- Authenticated users can write only their own reviews
CREATE POLICY "Users write only own reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" 
    ON public.reviews FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" 
    ON public.reviews FOR DELETE 
    USING (auth.uid() = user_id);

-- 12. Favorites Policies
-- Users can read only their own favorites
CREATE POLICY "Users can view own favorites" 
    ON public.favorites FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites" 
    ON public.favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" 
    ON public.favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- 13. Storage Bucket Configuration (SQL definition)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true) ON CONFLICT DO NOTHING;
