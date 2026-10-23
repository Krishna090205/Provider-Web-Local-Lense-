-- =========================================================================
-- LocalLens: Safe Seed Script to Promote/Create Initial Admin
-- =========================================================================
-- This script safely promotes a user to 'admin' using an environment variable
-- or psql variable without hard-coding any credentials.
--
-- Usage with psql CLI:
--   psql -d <database_url> -v admin_email="$ADMIN_EMAIL" -f seed_admin.sql
--
-- Or execute inside Supabase SQL editor by replacing the parameter below:

DO $$
DECLARE
    target_email TEXT := COALESCE(
        NULLIF(current_setting('app.admin_email', true), ''),
        NULLIF(:'admin_email', ''),
        '${ADMIN_EMAIL}' -- Placeholder for CLI env substitution
    );
    user_record RECORD;
BEGIN
    IF target_email IS NULL OR target_email = '' OR target_email = '${ADMIN_EMAIL}' THEN
        RAISE NOTICE 'No admin email provided. Set app.admin_email or pass -v admin_email="your@email.com".';
        RETURN;
    END IF;

    -- Look up the registered user in auth.users
    SELECT id, email INTO user_record 
    FROM auth.users 
    WHERE email = LOWER(TRIM(target_email));

    IF NOT FOUND THEN
        RAISE NOTICE 'User with email % is not yet registered in auth.users. Please sign up first, then rerun this script.', target_email;
        RETURN;
    END IF;

    -- Upsert profile with admin privileges and approved status
    INSERT INTO public.profiles (id, role, name, provider_status, created_at, updated_at)
    VALUES (
        user_record.id,
        'admin'::user_role,
        COALESCE(SPLIT_PART(target_email, '@', 1), 'System Administrator'),
        'approved'::provider_status_enum,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        role = 'admin'::user_role,
        provider_status = 'approved'::provider_status_enum,
        updated_at = NOW();

    RAISE NOTICE 'Successfully granted administrator role to: % (ID: %)', target_email, user_record.id;
END $$;
