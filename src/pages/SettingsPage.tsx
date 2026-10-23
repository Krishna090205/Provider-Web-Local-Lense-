import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sun, Moon, Monitor, Shield, User, Mail, Briefcase, Check, Sparkles, KeyRound } from 'lucide-react';
import { useAuth, profileUpdateSchema, ProfileUpdateFormValues } from '../features/auth';
import { useTheme, ThemePreference } from '../features/theme';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, updateUserTheme, resetPassword } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      businessName: user?.business_name || ''
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        businessName: user.business_name || ''
      });
    }
  }, [user, reset]);

  const handleThemeChange = async (newTheme: ThemePreference) => {
    setTheme(newTheme);
    await updateUserTheme(newTheme);
  };

  const onSaveProfile = async (values: ProfileUpdateFormValues) => {
    await updateProfile(values.name.trim(), undefined, values.businessName?.trim() || undefined);
    setSaveStatus('Profile updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handlePasswordReset = async () => {
    if (user?.email) {
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    }
  };

  const themeOptions: { id: ThemePreference; title: string; desc: string; icon: typeof Sun }[] = [
    {
      id: 'system',
      title: 'System Default',
      desc: 'Automatically matches your device operating system preference',
      icon: Monitor
    },
    {
      id: 'dark',
      title: 'Dusk & Sunset (Dark)',
      desc: 'Atmospheric deep purple & golden sunset hues for low light',
      icon: Moon
    },
    {
      id: 'light',
      title: 'Mumbai Daylight (Light)',
      desc: 'Crisp warm cream & vibrant terracotta for bright spaces',
      icon: Sun
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 text-sunset-text">
      
      {/* Page Title */}
      <div className="space-y-1 border-b border-sunset-border pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sunset-accent/15 text-sunset-accent border border-sunset-accent/25 uppercase font-serif">
          <Sparkles className="w-3.5 h-3.5" />
          <span>User Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-sunset-text">
          Settings & Preferences
        </h1>
        <p className="text-sm text-sunset-muted">
          Manage your theme appearance, profile information, and account security.
        </p>
      </div>

      {/* SECTION 1: APPEARANCE & THEME (Settings only) */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div>
          <h2 className="text-xl font-bold font-serif text-sunset-text flex items-center gap-2">
            <span>Appearance & Theme</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sunset-accent/20 text-sunset-accent font-sans font-medium">
              Current: {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-sunset-muted mt-1">
            Choose your preferred color theme. Your preference is saved locally and synced to your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleThemeChange(opt.id)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all relative group ${
                  isSelected
                    ? 'bg-sunset-accent/15 border-sunset-accent shadow-lg shadow-sunset-accent/10'
                    : 'bg-sunset-bg/60 border-sunset-border hover:border-sunset-accent/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-sunset-accent text-sunset-on-accent'
                          : 'bg-sunset-bg border border-sunset-border text-sunset-muted group-hover:text-sunset-accent'
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-sunset-accent">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-sunset-text mb-1">{opt.title}</h3>
                  <p className="text-xs text-sunset-muted leading-relaxed">{opt.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-sunset-border/60 flex items-center justify-between text-[11px] text-sunset-muted">
                  <span>Palette preview</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{
                        backgroundColor: opt.id === 'light' ? '#fff7ee' : '#1a1226'
                      }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{
                        backgroundColor: opt.id === 'light' ? '#e8751a' : '#ffb25e'
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: PROFILE INFORMATION */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div>
          <h2 className="text-xl font-bold font-serif text-sunset-text">
            Profile Details
          </h2>
          <p className="text-xs sm:text-sm text-sunset-muted mt-1">
            Update your public name and view your verified membership status.
          </p>
        </div>

        {saveStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Display Name */}
            <div>
              <label className="text-xs font-semibold text-sunset-text mb-1.5 block">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                <input
                  type="text"
                  {...register('name')}
                  className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                  placeholder="Your Name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-xs font-semibold text-sunset-text mb-1.5 block">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@locallens.in'}
                  className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Business Name (if Provider) */}
            {user?.role === 'provider' && (
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-sunset-text mb-1.5 block">
                  Business / Establishment Name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                  <input
                    type="text"
                    {...register('businessName')}
                    className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                    placeholder="Business Name"
                  />
                </div>
                {errors.businessName && (
                  <p className="mt-1 text-xs text-red-400">{errors.businessName.message}</p>
                )}
              </div>
            )}

          </div>

          {/* Account Role & Status Badges */}
          <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-sunset-accent" />
              <span className="font-medium text-sunset-muted">Platform Role:</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-sunset-accent/20 text-sunset-accent uppercase">
                {user?.role || 'Tourist'}
              </span>
            </div>

            {user?.role === 'provider' && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sunset-muted">Approval Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    user.provider_status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : user.provider_status === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {user.provider_status || 'Pending'}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent px-6 py-2.5 text-xs font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 3: SECURITY & PASSWORD */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-sunset-text">
            Security & Authentication
          </h2>
          <p className="text-xs sm:text-sm text-sunset-muted mt-1">
            Request password resets or manage authentication tokens securely.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm font-semibold text-sunset-text">Reset Account Password</p>
            <p className="text-xs text-sunset-muted">We will dispatch password change instructions to your email address.</p>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="px-4 py-2 rounded-xl border border-sunset-border hover:border-sunset-accent text-xs font-semibold text-sunset-text hover:bg-sunset-surface transition-all flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-sunset-accent" />
            <span>{resetSent ? 'Instructions Sent!' : 'Send Reset Email'}</span>
          </button>
        </div>
      </section>

    </div>
  );
};
