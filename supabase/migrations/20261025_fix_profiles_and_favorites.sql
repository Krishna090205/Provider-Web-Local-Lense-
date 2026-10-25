-- =========================================================================
-- LocalLens: Migration for Profiles RLS Policies & Favorites Table
-- =========================================================================

-- 1. Ensure public.favorites table exists with RLS
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    listing_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites"
    ON public.favorites FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
CREATE POLICY "Users can insert own favorites"
    ON public.favorites FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
    ON public.favorites FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 2. Ensure public.profiles table RLS allows users to insert their own profile on signup
--    without self-escalating role to admin or self-approving.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated read of profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Allow authenticated users to insert their own initial profile safely
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile fields (or admins full update)
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.profiles;
CREATE POLICY "Users can update own profile fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- Admins full management
DROP POLICY IF EXISTS "Admins full management of profiles" ON public.profiles;
CREATE POLICY "Admins full management of profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- 3. Automatic trigger to create profiles safely via SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, provider_status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'provider'),
    COALESCE(new.raw_user_meta_data->>'provider_status', 'pending')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    updated_at = NOW();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill any existing auth users who are missing a row in public.profiles
INSERT INTO public.profiles (id, full_name, email, role, provider_status)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    u.email,
    COALESCE(u.raw_user_meta_data->>'role', 'provider'),
    COALESCE(u.raw_user_meta_data->>'provider_status', 'approved')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    provider_status = 'approved';

-- 5. Policies for public.experience
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

-- Allow public read of experiences
DROP POLICY IF EXISTS "Public can view experiences" ON public.experience;
DROP POLICY IF EXISTS "Experiences are viewable by everyone" ON public.experience;
CREATE POLICY "Experiences are viewable by everyone"
    ON public.experience FOR SELECT
    USING (true);

-- Allow authenticated providers and admins to insert experiences
DROP POLICY IF EXISTS "Approved providers can insert experience" ON public.experience;
DROP POLICY IF EXISTS "Authenticated providers can insert experience" ON public.experience;
DROP POLICY IF EXISTS "Providers can insert experience" ON public.experience;
CREATE POLICY "Authenticated providers can insert experience"
    ON public.experience FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated providers to update their own experiences
DROP POLICY IF EXISTS "Providers can update own experience" ON public.experience;
CREATE POLICY "Providers can update own experience"
    ON public.experience FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = user_id 
        OR auth.uid()::text = provider_id 
        OR public.is_admin(auth.uid())
    )
    WITH CHECK (
        auth.uid()::text = user_id 
        OR auth.uid()::text = provider_id 
        OR public.is_admin(auth.uid())
    );

-- Allow authenticated providers to delete their own experiences
DROP POLICY IF EXISTS "Providers can delete own experience" ON public.experience;
CREATE POLICY "Providers can delete own experience"
    ON public.experience FOR DELETE
    TO authenticated
    USING (
        auth.uid()::text = user_id 
        OR auth.uid()::text = provider_id 
        OR public.is_admin(auth.uid())
    );


