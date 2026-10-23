import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Profile, UserRole, ProviderStatus } from '../../types';
import { getStoredUser, saveStoredUser } from '../../lib/store';

export interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, pass: string, name: string, role: 'tourist' | 'provider', businessName?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (name: string, avatar?: string, businessName?: string) => Promise<void>;
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
    const existing = getStoredUser();
    if (existing) return existing;
    return {
      id: 'demo-tourist-1',
      email: 'arun.tourist@locallens.in',
      name: 'Arun Kumar',
      role: 'tourist',
      provider_status: 'approved',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      created_at: new Date().toISOString(),
      theme: 'system'
    };
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
            .single();

          if (profile) {
            const fullProfile: Profile = {
              id: session.user.id,
              email: session.user.email,
              role: (profile.role as UserRole) || 'tourist',
              provider_status: (profile.provider_status as ProviderStatus) || (profile.role === 'provider' ? 'pending' : 'approved'),
              provider_review_note: profile.provider_review_note ?? undefined,
              reviewed_by: profile.reviewed_by ?? undefined,
              reviewed_at: profile.reviewed_at ?? undefined,
              business_name: profile.business_name ?? undefined,
              name: profile.name || session.user.email?.split('@')[0] || 'User',
              avatar: profile.avatar ?? undefined,
              theme: profile.theme || 'system',
              created_at: profile.created_at || new Date().toISOString()
            };
            setUser(fullProfile);
            saveStoredUser(fullProfile);
            return;
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Supabase session retrieval error';
        console.warn('Supabase session load error:', msg);
      }
    }

    const current = getStoredUser();
    if (current) setUser(current);
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    role: 'tourist' | 'provider',
    businessName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const safeRole: UserRole = role === 'provider' ? 'provider' : 'tourist';
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
            business_name: businessName || name,
            created_at: new Date().toISOString(),
            theme: 'system'
          };
          setUser(newProfile);
          saveStoredUser(newProfile);
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred during registration';
        return { success: false, error: message };
      }
    }

    // Local simulated auth
    const simulatedProfile: Profile = {
      id: 'usr_' + Date.now(),
      email,
      name,
      role: safeRole,
      provider_status: providerStatus,
      business_name: businessName || (safeRole === 'provider' ? `${name}'s Enterprises` : undefined),
      avatar: safeRole === 'provider'
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      created_at: new Date().toISOString(),
      theme: 'system'
    };
    setUser(simulatedProfile);
    saveStoredUser(simulatedProfile);
    return { success: true };
  };

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          const p: Profile = {
            id: data.user.id,
            email: data.user.email,
            name: profile?.name || email.split('@')[0],
            role: (profile?.role as UserRole) || 'tourist',
            provider_status: profile?.provider_status || (profile?.role === 'provider' ? 'pending' : 'approved'),
            provider_review_note: profile?.provider_review_note ?? undefined,
            reviewed_by: profile?.reviewed_by ?? undefined,
            reviewed_at: profile?.reviewed_at ?? undefined,
            business_name: profile?.business_name ?? undefined,
            avatar: profile?.avatar ?? undefined,
            theme: profile?.theme || 'system',
            created_at: profile?.created_at || new Date().toISOString()
          };
          setUser(p);
          saveStoredUser(p);
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid login credentials';
        return { success: false, error: message };
      }
    }

    // Local simulation logic
    const lower = email.toLowerCase();
    let detectedRole: UserRole = 'tourist';
    let status: ProviderStatus = 'approved';

    if (lower.includes('admin')) {
      detectedRole = 'admin';
    } else if (lower.includes('provider') || lower.includes('owner') || lower.includes('hotel') || lower.includes('biz')) {
      detectedRole = 'provider';
      status = 'approved';
    }

    const simUser: Profile = {
      id: detectedRole === 'admin' ? 'admin-demo-id' : detectedRole === 'provider' ? 'prov-003' : 'tourist-demo-id',
      email,
      name: email.split('@')[0].replace(/[._-]/g, ' '),
      role: detectedRole,
      provider_status: status,
      business_name: detectedRole === 'provider' ? 'Malabar Hill Boutique Havens' : undefined,
      avatar: detectedRole === 'admin'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : detectedRole === 'provider'
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      created_at: new Date().toISOString(),
      theme: 'system'
    };
    setUser(simUser);
    saveStoredUser(simUser);
    return { success: true };
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

  const updateProfile = async (name: string, avatar?: string, businessName?: string): Promise<void> => {
    if (!user) return;
    const updated: Profile = {
      ...user,
      name,
      ...(avatar ? { avatar } : {}),
      ...(businessName ? { business_name: businessName } : {})
    };
    setUser(updated);
    saveStoredUser(updated);

    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({
        name,
        avatar: avatar || user.avatar,
        business_name: businessName || user.business_name
      }).eq('id', user.id);
    }
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
        role: user?.role || 'tourist',
        loading,
        signUp,
        signIn,
        signOut,
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
