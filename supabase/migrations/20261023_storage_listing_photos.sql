-- =========================================================================
-- LocalLens: Migration for Supabase Storage Bucket & Policies ('listing-photos')
-- =========================================================================

-- 1. Create Public Storage Bucket for listing photos if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-photos',
    'listing-photos',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage Objects RLS Policies

-- Anyone can view listing photos
CREATE POLICY "Public Access to Listing Photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-photos');

-- Authenticated approved providers and admins can upload photos
CREATE POLICY "Approved Providers and Admins can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'listing-photos'
        AND (auth.role() = 'authenticated')
        AND (
            public.is_admin(auth.uid()) 
            OR public.is_approved_provider(auth.uid())
        )
    );

-- Owners and admins can update their uploaded photos
CREATE POLICY "Users can update their own listing photos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'listing-photos'
        AND (auth.uid() = owner OR public.is_admin(auth.uid()))
    );

-- Owners and admins can delete their photos
CREATE POLICY "Users can delete their own listing photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'listing-photos'
        AND (auth.uid() = owner OR public.is_admin(auth.uid()))
    );
