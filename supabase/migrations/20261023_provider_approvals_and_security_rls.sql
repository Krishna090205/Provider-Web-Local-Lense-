-- =========================================================================
-- LocalLens: Migration for Provider Approvals, Role Security & Hardened RLS
-- =========================================================================

-- 1. Create Provider Status Enum
DO $$ BEGIN
    CREATE TYPE provider_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure 'provider' value exists on user_role enum
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'provider';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add Provider Columns to Profiles Table
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS provider_status provider_status_enum DEFAULT 'pending' NOT NULL,
    ADD COLUMN IF NOT EXISTS business_name TEXT,
    ADD COLUMN IF NOT EXISTS provider_review_note TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system' NOT NULL;

-- Ensure existing tourist profiles are marked approved by default
UPDATE public.profiles 
SET provider_status = 'approved' 
WHERE role = 'tourist' AND provider_status = 'pending';

-- 4. Helper Security Functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(check_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = check_uid AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_provider(check_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = check_uid 
          AND role = 'provider' 
          AND provider_status = 'approved'
    );
$$;

-- 5. Trigger to strictly PREVENT users from modifying their own role or provider_status
CREATE OR REPLACE FUNCTION public.enforce_profile_role_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Allow change only if executing user is an admin or server process (superuser / postgres)
    IF (OLD.role IS DISTINCT FROM NEW.role) OR (OLD.provider_status IS DISTINCT FROM NEW.provider_status) THEN
        IF NOT (public.is_admin(auth.uid()) OR auth.uid() IS NULL) THEN
            RAISE EXCEPTION 'Access Denied: Only administrators can modify user role or provider approval status.';
        END IF;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_profile_role_security ON public.profiles;
CREATE TRIGGER tr_enforce_profile_role_security
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_profile_role_security();

-- 6. Hardened Row Level Security Policies for Listings

-- Drop previous policies to replace with strict approval-aware policies
DROP POLICY IF EXISTS "Public read of approved listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Admins have full access to listings" ON public.listings;

-- Policy 1: Public read of approved listings from approved providers only (or heritage listings)
CREATE POLICY "Public read of approved listings from approved providers"
    ON public.listings FOR SELECT
    USING (
        public.is_admin(auth.uid())
        OR (auth.uid() = owner_id)
        OR (
            status = 'approved'
            AND (
                owner_id IS NULL 
                OR EXISTS (
                    SELECT 1 FROM public.profiles p 
                    WHERE p.id = listings.owner_id 
                      AND p.provider_status = 'approved'
                )
            )
        )
    );

-- Policy 2: Providers can insert only their own rows, and ONLY when approved (Admins can insert anytime)
CREATE POLICY "Approved providers can insert listings"
    ON public.listings FOR INSERT
    WITH CHECK (
        public.is_admin(auth.uid())
        OR (
            auth.uid() = owner_id 
            AND public.is_approved_provider(auth.uid())
        )
    );

-- Policy 3: Providers can update only their own rows, and ONLY when approved
CREATE POLICY "Approved providers can update own listings"
    ON public.listings FOR UPDATE
    USING (
        public.is_admin(auth.uid())
        OR (
            auth.uid() = owner_id 
            AND public.is_approved_provider(auth.uid())
        )
    );

-- Policy 4: Providers can delete only their own rows, and ONLY when approved
CREATE POLICY "Approved providers can delete own listings"
    ON public.listings FOR DELETE
    USING (
        public.is_admin(auth.uid())
        OR (
            auth.uid() = owner_id 
            AND public.is_approved_provider(auth.uid())
        )
    );

-- 7. Hardened Profiles RLS Policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Users can update only their own profile
CREATE POLICY "Users can update own profile fields"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- Admins can view and manage all profiles
CREATE POLICY "Admins full management of profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin(auth.uid()));
