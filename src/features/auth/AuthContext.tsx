import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Profile, UserRole, ProviderStatus } from '../../types';
import {
  getStoredUser,
  saveStoredUser,
  addLocalProvider,
  getLocalProviders,
  saveLocalProviders,
  saveRegisteredAccount,
  findRegisteredAccount,
  deleteAccountPermanently
} from '../../lib/store';

export interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, pass: string, name: string, role: UserRole, businessName?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string, selectedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (targetRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogleDirect: (targetRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuthToken: (tokenUrlOrHash: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (name: string, avatar?: string, businessName?: string) => Promise<{ success: boolean; error?: string }>;
  updateUserTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  refreshUser: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    return getStoredUser();
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const meta = session.user.user_metadata || {};
          const googleName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User';
          const googleAvatar = meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';
          const storedRole: UserRole = (localStorage.getItem('locallens_oauth_intended_role') as UserRole) || 'provider';

          // Match local provider store to preserve approval decisions
          const localMatch = getLocalProviders().find(
            p => p.id === session.user.id || (p.email && p.email === session.user.email)
          );

          // Check if this user was already registered with a permanent role
          const existingAccount = findRegisteredAccount(session.user.id) ||
            (session.user.email ? findRegisteredAccount(session.user.email) : null);

          // Look for role & status across profile table, auth metadata, and email
          const rawProfile = profile as Record<string, unknown> | null;
          const metaRole = (meta.role as UserRole) || (session.user.app_metadata?.role as UserRole);
          const dbRole = (profile?.role as UserRole) || (rawProfile?.role as UserRole);
          const emailRole: UserRole | undefined = session.user.email?.toLowerCase().includes('admin') ? 'admin' : undefined;

          // Admin role priority: If user chose admin, DB, metadata, email, or existing registered account designated admin, they are admin!
          // All other users are providers (tourist role is disabled).
          let permanentRole: UserRole = 'provider';
          const currentStored = getStoredUser();
          if (
            storedRole === 'admin' ||
            dbRole === 'admin' ||
            metaRole === 'admin' ||
            emailRole === 'admin' ||
            existingAccount?.role === 'admin' ||
            currentStored?.role === 'admin'
          ) {
            permanentRole = 'admin';
          } else {
            permanentRole = 'provider';
          }

          const dbStatus = (profile?.provider_status as ProviderStatus)
            || (rawProfile?.status as ProviderStatus)
            || (rawProfile?.approval_status as ProviderStatus)
            || (rawProfile?.is_approved ? 'approved' : undefined);

          // Check live experience records in Supabase if status is not yet approved in profiles
          let expStatus: ProviderStatus | undefined;
          if (isSupabaseConfigured && (!dbStatus || dbStatus === 'pending') && (session.user.id || session.user.email)) {
            try {
              const orParts: string[] = [];
              if (session.user.id) {
                orParts.push(`provider_id.eq.${session.user.id}`);
                orParts.push(`user_id.eq.${session.user.id}`);
              }
              if (session.user.email) {
                orParts.push(`provider_email.eq.${session.user.email.toLowerCase()}`);
              }
              const { data: expMatch } = await supabase
                .from('experience')
                .select('status')
                .or(orParts.join(','))
                .limit(10);

              if (expMatch && expMatch.some(e => e.status === 'approved')) {
                expStatus = 'approved';
              } else if (expMatch && expMatch.some(e => e.status === 'suspended')) {
                expStatus = 'suspended';
              } else if (expMatch && expMatch.length > 0 && expMatch.every(e => e.status === 'rejected')) {
                expStatus = 'rejected';
              }
            } catch (e) {
              console.warn('refreshUser experience status check notice:', e);
            }
          }

          const resolvedStatus: ProviderStatus = permanentRole === 'admin'
            ? 'approved'
            : (dbStatus
              || expStatus
              || (localMatch?.provider_status === 'approved' ? 'approved' : undefined)
              || existingAccount?.provider_status
              || localMatch?.provider_status
              || 'pending');

          const fullProfile: Profile = {
            id: session.user.id,
            email: session.user.email,
            role: permanentRole,
            provider_status: resolvedStatus,
            provider_review_note: profile?.provider_review_note ?? existingAccount?.provider_review_note ?? localMatch?.provider_review_note ?? undefined,
            reviewed_by: profile?.reviewed_by ?? existingAccount?.reviewed_by ?? localMatch?.reviewed_by ?? undefined,
            reviewed_at: profile?.reviewed_at ?? existingAccount?.reviewed_at ?? localMatch?.reviewed_at ?? undefined,
            business_name: profile?.business_name || (rawProfile?.business_name as string) || (meta.business_name as string) || existingAccount?.business_name || localMatch?.business_name || (permanentRole === 'provider' ? `${googleName}'s Establishment` : undefined),
            name: profile?.name || (rawProfile?.full_name as string) || (rawProfile?.name as string) || (meta.name as string) || (meta.full_name as string) || existingAccount?.name || localMatch?.name || googleName,
            avatar: profile?.avatar || (rawProfile?.avatar_url as string) || (rawProfile?.avatar as string) || (meta.avatar_url as string) || (meta.picture as string) || existingAccount?.avatar || localMatch?.avatar || googleAvatar,
            theme: profile?.theme || existingAccount?.theme || 'system',
            created_at: profile?.created_at || existingAccount?.created_at || localMatch?.created_at || new Date().toISOString()
          };

          saveRegisteredAccount(fullProfile);
          if (fullProfile.role === 'provider') {
            addLocalProvider(fullProfile);
          } else if (fullProfile.role === 'admin') {
            // Clean up any stale provider entry if previously misassigned
            const currentProviders = getLocalProviders();
            const cleanedProviders = currentProviders.filter(p => p.id !== session.user.id && (!session.user.email || p.email !== session.user.email));
            if (cleanedProviders.length !== currentProviders.length) {
              saveLocalProviders(cleanedProviders);
            }
          }
          setUser(fullProfile);
          saveStoredUser(fullProfile);
          return;
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Supabase session retrieval error';
        console.warn('Supabase session load error:', msg);
      }
    }

    const current = getStoredUser();
    if (current) {
      if (current.role !== 'admin' && !current.email?.toLowerCase().includes('admin')) {
        current.role = 'provider';
      }
      if (current.role === 'provider') {
        const localMatch = getLocalProviders().find(p => p.id === current.id || (p.email && p.email === current.email));
        if (localMatch?.provider_status && localMatch.provider_status !== current.provider_status) {
          current.provider_status = localMatch.provider_status;
          current.provider_review_note = localMatch.provider_review_note;
        }
        addLocalProvider(current);
      }
      saveStoredUser(current);
      setUser(current);
    }
  };

  useEffect(() => {
    const handleInitialAuth = async () => {
      if (isSupabaseConfigured) {
        // Clean any OAuth error query parameters if user cancelled
        const searchParams = new URLSearchParams(window.location.search);
        const urlError = searchParams.get('error') || searchParams.get('error_description');
        if (urlError) {
          console.warn('OAuth redirect notice:', urlError);
        }

        // Handle PKCE authorization code exchange if redirected with ?code=...
        const code = searchParams.get('code');
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
            window.history.replaceState(null, '', window.location.pathname);
          } catch (codeErr) {
            console.warn('Failed to exchange OAuth code for session:', codeErr);
          }
        }

        // Handle OAuth tokens if redirected with hash fragments (#access_token=...&refresh_token=...)
        if (window.location.hash.includes('access_token')) {
          try {
            const hash = window.location.hash.startsWith('#')
              ? window.location.hash.substring(1)
              : window.location.hash;
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              // Clean the token hash from the URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          } catch (err) {
            console.warn('Failed to parse OAuth tokens from URL hash:', err);
          }
        }
      }

      await refreshUser();
      setLoading(false);
    };

    handleInitialAuth();

    const onUserUpdated = () => {
      refreshUser();
    };

    window.addEventListener('locallens_user_updated', onUserUpdated);
    window.addEventListener('storage', onUserUpdated);

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          saveStoredUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('locallens_user_updated', onUserUpdated);
        window.removeEventListener('storage', onUserUpdated);
      };
    }

    return () => {
      window.removeEventListener('locallens_user_updated', onUserUpdated);
      window.removeEventListener('storage', onUserUpdated);
    };
  }, []);

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    businessName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const safeRole: UserRole = role === 'provider' ? 'provider' : 'admin';
    const providerStatus: ProviderStatus = safeRole === 'provider' ? 'pending' : 'approved';

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              name,
              role: safeRole,
              provider_status: providerStatus,
              business_name: businessName || name
            }
          }
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            email,
            name,
            role: safeRole,
            provider_status: providerStatus,
            business_name: businessName || (safeRole === 'provider' ? name : undefined),
            created_at: new Date().toISOString(),
            theme: 'system'
          };
          saveRegisteredAccount(newProfile);
          if (safeRole === 'provider') {
            addLocalProvider(newProfile);
          }
          setUser(newProfile);
          saveStoredUser(newProfile);

          // If session is immediately established, persist profile in Supabase public.profiles table
          if (data.session) {
            try {
              await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: name,
                email: email,
                role: safeRole,
                provider_status: providerStatus,
                business_name: businessName || (safeRole === 'provider' ? name : null),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            } catch (upsertErr) {
              console.warn('Supabase profile upsert on signup notice:', upsertErr);
            }
          }

          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred during registration';
        return { success: false, error: message };
      }
    }

    return { success: false, error: 'Database service is required for registration.' };
  };

  const signIn = async (email: string, pass: string, selectedRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
          const rawProfile = profile as Record<string, unknown> | null;
          const meta = data.user.user_metadata || {};
          const metaRole = (meta.role as UserRole) || (data.user.app_metadata?.role as UserRole);
          const dbRole = (profile?.role as UserRole) || (rawProfile?.role as UserRole);
          const existing = findRegisteredAccount(data.user.id) || (data.user.email ? findRegisteredAccount(data.user.email) : null);
          const emailRole: UserRole | undefined = email.toLowerCase().includes('admin') ? 'admin' : undefined;

          // Admin priority check: If user selected Administrator, or DB/metadata/email/existing account specifies admin, grant admin!
          let persistentRole: UserRole = 'provider';
          if (
            selectedRole === 'admin' ||
            dbRole === 'admin' ||
            metaRole === 'admin' ||
            emailRole === 'admin' ||
            existing?.role === 'admin'
          ) {
            persistentRole = 'admin';
          } else {
            persistentRole = 'provider';
          }

          const p: Profile = {
            id: data.user.id,
            email: data.user.email,
            name: profile?.name || (rawProfile?.full_name as string) || (rawProfile?.name as string) || (meta.name as string) || (meta.full_name as string) || existing?.name || email.split('@')[0],
            role: persistentRole,
            provider_status: persistentRole === 'admin' ? 'approved' : (profile?.provider_status || existing?.provider_status || 'pending'),
            provider_review_note: profile?.provider_review_note ?? existing?.provider_review_note ?? undefined,
            reviewed_by: profile?.reviewed_by ?? existing?.reviewed_by ?? undefined,
            reviewed_at: profile?.reviewed_at ?? existing?.reviewed_at ?? undefined,
            business_name: profile?.business_name ?? existing?.business_name ?? undefined,
            avatar: profile?.avatar ?? existing?.avatar ?? undefined,
            theme: profile?.theme || existing?.theme || 'system',
            created_at: profile?.created_at || existing?.created_at || new Date().toISOString()
          };

          saveRegisteredAccount(p);
          if (p.role === 'provider') {
            addLocalProvider(p);
          } else if (p.role === 'admin') {
            const providers = getLocalProviders();
            const filtered = providers.filter(prov => prov.id !== data.user.id && prov.email !== data.user.email);
            if (filtered.length !== providers.length) {
              saveLocalProviders(filtered);
            }
          }
          setUser(p);
          saveStoredUser(p);

          // Also update user metadata in Supabase Auth if admin selected
          try {
            await supabase.auth.updateUser({
              data: {
                role: persistentRole,
                provider_status: persistentRole === 'admin' ? 'approved' : p.provider_status
              }
            });
          } catch (metaErr) {
            console.warn('Supabase auth metadata update notice:', metaErr);
          }

          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid login credentials';
        return { success: false, error: message };
      }
    }

    return { success: false, error: 'Database service is required for sign in.' };
  };

  const signInWithGoogle = async (targetRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (targetRole) {
      localStorage.setItem('locallens_oauth_intended_role', targetRole);
    } else {
      localStorage.removeItem('locallens_oauth_intended_role');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Google authentication failed';
        return { success: false, error: msg };
      }
    }

    return { success: false, error: 'Database service is required for Google Sign In.' };
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active user session' };
    const uid = user.id;
    const uemail = user.email;

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', uid);
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase delete profile notice:', e);
      }
    }

    deleteAccountPermanently(uid, uemail);
    setUser(null);
    saveStoredUser(null);
    return { success: true };
  };

  const signInWithGoogleDirect = async (targetRole: UserRole = 'provider'): Promise<{ success: boolean; error?: string }> => {
    return signInWithGoogle(targetRole);
  };

  const signInWithOAuthToken = async (tokenUrlOrHash: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let hash = tokenUrlOrHash.trim();
      if (hash.includes('#')) {
        hash = hash.substring(hash.indexOf('#') + 1);
      } else if (hash.includes('?')) {
        hash = hash.substring(hash.indexOf('?') + 1);
      }
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        return { success: false, error: 'Could not find access_token in the provided string.' };
      }

      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        if (error) {
          return { success: false, error: error.message };
        }
        await refreshUser();
        return { success: true };
      }

      return { success: false, error: 'Supabase is not configured.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse session token';
      return { success: false, error: msg };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    saveStoredUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  };

  const updateProfile = async (
    name: string,
    avatar?: string,
    businessName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active user session' };

    const cleanName = name.trim();
    const cleanBiz = businessName !== undefined ? businessName.trim() : user.business_name;

    const updated: Profile = {
      ...user,
      name: cleanName,
      ...(avatar ? { avatar } : {}),
      ...(cleanBiz !== undefined ? { business_name: cleanBiz || undefined } : {})
    };

    // 1. Immediately update local state & active stored session
    setUser(updated);
    saveStoredUser(updated);

    // 2. Persist to permanent registered accounts registry
    saveRegisteredAccount(updated);

    // 3. Update providers directory if user is a registered provider
    const providers = getLocalProviders();
    const provIndex = providers.findIndex(p => p.id === user.id || (user.email && p.email === user.email));
    if (provIndex >= 0) {
      providers[provIndex] = {
        ...providers[provIndex],
        name: cleanName,
        ...(avatar ? { avatar } : {}),
        ...(cleanBiz !== undefined ? { business_name: cleanBiz || undefined } : {})
      };
      saveLocalProviders(providers);
    }

    // 4. Permanently persist in Supabase database and user auth metadata
    if (isSupabaseConfigured) {
      try {
        // A. Update public.profiles table with permitted profile fields
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: cleanName,
            avatar_url: avatar || user.avatar || null,
            business_name: cleanBiz || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (profileError) {
          console.warn('Supabase public.profiles update notice:', profileError.message);
        }

        // B. Update Supabase Auth user metadata so session tokens reflect the new name permanently
        await supabase.auth.updateUser({
          data: {
            name: cleanName,
            full_name: cleanName,
            ...(cleanBiz ? { business_name: cleanBiz } : {})
          }
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Database profile update notice';
        console.warn('Supabase profile persistence notice:', msg);
      }
    }

    // 5. Notify all components and tabs of the updated profile
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('locallens_user_updated', { detail: { action: 'profile_updated', user: updated } }));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true };
  };

  const updateUserTheme = async (theme: 'light' | 'dark' | 'system'): Promise<void> => {
    if (!user) return;
    const updated: Profile = { ...user, theme };
    setUser(updated);
    saveStoredUser(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ theme }).eq('id', user.id);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Database update error';
        console.warn('Failed to update theme in profile:', msg);
      }
    }
  };

  const switchDemoRole = (role: UserRole): void => {
    if (!user) return;
    const updated: Profile = {
      ...user,
      role,
      provider_status: role === 'provider' ? (user.provider_status || 'pending') : 'approved'
    };
    setUser(updated);
    saveStoredUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'provider',
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithGoogleDirect,
        signInWithOAuthToken,
        signOut,
        deleteAccount,
        resetPassword,
        updateProfile,
        updateUserTheme,
        refreshUser,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
