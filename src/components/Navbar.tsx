import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass, Menu, X, Heart, User, LogOut, Building, ShieldCheck,
  ChevronDown, Home, Shield, ShoppingBag, Landmark, Hotel, Utensils,
  Sparkles, Info, Settings, LayoutDashboard, ShieldAlert, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../features/auth';
import { useTheme } from '../features/theme';
import { useLanguage, LanguageSelector } from '../features/i18n';
import { useFavorites } from '../hooks/useFavorites';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const isAdminEmail = user?.email?.toLowerCase().includes('admin');
  const effectiveRole: UserRole = (isAdminEmail || role === 'admin' || user?.role === 'admin') ? 'admin' : 'provider';
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const { favoriteIds } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const isExplore = location.pathname === '/explore';
  const isAbout = location.pathname === '/about';
  const isForts = location.pathname === '/forts';
  const isDashboardActive = location.pathname.startsWith('/dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="glass-panel border-b border-sunset-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sunset-accent via-sunset-accent-hot to-amber-300 flex items-center justify-center shadow-lg shadow-sunset-accent/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-sunset-on-accent stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-sunset-text">
                LocalLens
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-medium text-sunset-accent -mt-1">
                {t('brand.tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            
            {/* 1. Home */}
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isHome
                  ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                  : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('nav.home')}</span>
            </Link>

            {/* 2. Explore */}
            <Link
              to="/explore"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isExplore
                  ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                  : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t('nav.explore')}</span>
            </Link>

            {/* 3. Forts */}
            <Link
              to="/forts"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isForts
                  ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                  : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Forts</span>
            </Link>

            {/* 4. Role-Specific Links in Navbar */}
            {user && effectiveRole !== 'admin' && (
              <Link
                to="/dashboard/provider"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isDashboardActive
                    ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                    : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-400" />
                <span>{t('nav.providerPortal')}</span>
              </Link>
            )}

            {user && effectiveRole === 'admin' && (
              <Link
                to="/dashboard/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isDashboardActive
                    ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                    : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sunset-accent" />
                <span>{t('nav.adminConsole')}</span>
              </Link>
            )}

            {/* 5. About */}
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isAbout
                  ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                  : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>{t('nav.about')}</span>
            </Link>

          </nav>

          {/* Desktop Right Action Icons & User Dropdown (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl text-sunset-muted hover:text-sunset-accent hover:bg-sunset-bg/60 transition-all flex items-center justify-center border border-transparent hover:border-sunset-border"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 animate-fade-in" />
              ) : (
                <Moon className="w-5 h-5 text-sunset-accent animate-fade-in" />
              )}
            </button>

            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {/* Quick Favorites Access */}
            <Link
              to="/forts"
              title={t('nav.savedPlaces')}
              className="relative p-2.5 rounded-xl text-sunset-muted hover:text-sunset-accent hover:bg-sunset-bg/60 transition-all"
            >
              <Heart className="w-5 h-5" />
              {favoriteIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sunset-accent text-sunset-on-accent text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3.5 rounded-full glass-panel hover:border-sunset-accent transition-all"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-sunset-accent/40"
                  />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-sunset-text leading-tight line-clamp-1">{user.name}</p>
                    <span className="text-[10px] text-sunset-accent font-medium capitalize">
                      {effectiveRole}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-sunset-muted transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-sunset-border p-2 shadow-2xl animate-fade-in z-50 bg-sunset-surface">
                    <div className="p-3 border-b border-sunset-border mb-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-sunset-accent/40 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-sunset-text leading-tight truncate">{user.name}</p>
                          <p className="text-xs text-sunset-muted truncate mt-0.5">{user.email}</p>
                          <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sunset-accent/15 text-sunset-accent uppercase">
                            {effectiveRole}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role-Specific Navigation Links */}
                    {effectiveRole !== 'admin' && (
                      <Link
                        to="/dashboard/provider"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-sunset-text hover:bg-sunset-bg/70 rounded-lg transition-colors"
                      >
                        <Building className="w-4 h-4 text-emerald-400" />
                        <span>{t('nav.providerPortal')}</span>
                      </Link>
                    )}

                    {effectiveRole === 'admin' && (
                      <Link
                        to="/dashboard/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-sunset-text hover:bg-sunset-bg/70 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-sunset-accent" />
                        <span>{t('nav.adminConsole')}</span>
                      </Link>
                    )}

                    {/* Settings Page Link */}
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-sunset-text hover:bg-sunset-bg/70 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-sunset-accent" />
                      <span>{t('nav.settings')}</span>
                    </Link>

                    {/* User Role Display (Read-Only) */}
                    <div className="px-3 py-2 border-t border-sunset-border mt-1 flex items-center justify-between text-xs">
                      <span className="text-sunset-muted font-medium">Assigned Role:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        effectiveRole === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {effectiveRole}
                      </span>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1 border-t border-sunset-border"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-2 text-sm font-medium text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60 rounded-xl transition-all"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="btn-accent px-4 py-2 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Top Bar Actions (< 1024px) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            {/* Quick Theme Toggle on Mobile/Tablet */}
            <button
              onClick={toggleTheme}
              title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-sunset-muted hover:text-sunset-accent hover:bg-sunset-bg/60 transition-all flex items-center justify-center"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-sunset-accent" />
              )}
            </button>

            {/* Quick Favorites on Mobile/Tablet */}
            <Link
              to="/forts"
              className="relative p-2 text-sunset-muted hover:text-sunset-accent transition-colors"
              title={t('nav.savedPlaces')}
            >
              <Heart className="w-5 h-5" />
              {favoriteIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sunset-accent text-sunset-on-accent text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-sunset-accent" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Drawer Modal */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-black/60 backdrop-blur-sm animate-fade-in flex flex-col justify-start">
          <div className="glass-panel border-b border-sunset-border px-4 sm:px-6 pt-4 pb-6 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto bg-sunset-surface shadow-2xl">
            {/* Mobile Theme & Language Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-sunset-border/70">
              <span className="text-xs font-semibold text-sunset-muted uppercase tracking-wider">
                {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-xs font-medium text-sunset-text border border-sunset-border hover:border-sunset-accent transition-all"
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-sunset-accent" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-sunset-border/70">
              <span className="text-xs font-semibold text-sunset-muted uppercase tracking-wider">
                {t('nav.selectLanguage')}
              </span>
              <LanguageSelector />
            </div>

            <nav className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
              >
                <Home className="w-4 h-4 text-sunset-accent" />
                <span>{t('nav.home')}</span>
              </Link>

              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
              >
                <Compass className="w-4 h-4 text-sunset-accent" />
                <span>{t('nav.explore')}</span>
              </Link>

              <Link
                to="/forts"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
              >
                <Shield className="w-4 h-4 text-sunset-accent" />
                <span>Maharashtra Forts</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
              >
                <Info className="w-4 h-4 text-sunset-accent" />
                <span>{t('nav.about')}</span>
              </Link>

            {user && (
              <>
                <div className="pt-2 border-t border-sunset-border my-1" />
                <div className="p-3 rounded-2xl bg-sunset-bg/60 border border-sunset-border flex items-center gap-3 mb-2">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-sunset-accent/40 flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-sunset-text truncate">{user.name}</p>
                    <p className="text-xs text-sunset-muted truncate">{user.email}</p>
                    <span className="text-[10px] text-sunset-accent font-semibold uppercase">{effectiveRole}</span>
                  </div>
                </div>
                <Link
                  to={effectiveRole === 'admin' ? '/dashboard/admin' : '/dashboard/provider'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
                >
                  <LayoutDashboard className="w-4 h-4 text-sunset-accent" />
                  <span>{effectiveRole === 'provider' ? t('nav.providerPortal') : t('nav.adminConsole')}</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-sunset-accent" />
                  <span>{t('nav.settings')}</span>
                </Link>

                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.signOut')}</span>
                </button>
              </>
            )}

            {!user && (
              <div className="pt-3 flex gap-2">
                <Link
                  to="/auth?mode=login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold glass-panel rounded-xl text-sunset-text"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold btn-accent rounded-xl"
                >
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
      )}

    </header>
  );
};
