import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass, Menu, X, Heart, User, LogOut, Building, ShieldCheck,
  ChevronDown, Home, Shield, ShoppingBag, Landmark, Hotel, Utensils,
  Sparkles, Info, Settings, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../features/auth';
import { useFavorites } from '../hooks/useFavorites';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, role, signOut, switchDemoRole } = useAuth();
  const { favoriteIds } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();

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

  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';
  const isForts = location.pathname === '/forts';
  const isExploreActive = location.pathname.startsWith('/explore');
  const isDashboardActive = location.pathname.startsWith('/dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="glass-panel border-b border-sunset-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sunset-accent via-sunset-accent-hot to-amber-300 flex items-center justify-center shadow-lg shadow-sunset-accent/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-sunset-on-accent stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight font-serif text-sunset-text">
                LocalLens
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-sunset-accent -mt-1">
                Mumbai Unveiled
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
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
              <span>Home</span>
            </Link>

            {/* 2. Explore (Direct link - no dropdown) */}
            <Link
              to="/explore"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isExploreActive
                  ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                  : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
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
              <span>Maharashtra Forts</span>
            </Link>

            {/* 4. Role-Specific Links in Navbar */}
            {user && role === 'provider' && (
              <Link
                to="/dashboard/provider"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isDashboardActive
                    ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                    : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Provider Portal</span>
              </Link>
            )}

            {user && role === 'admin' && (
              <Link
                to="/dashboard/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isDashboardActive
                    ? 'text-sunset-accent bg-sunset-accent/10 shadow-inner'
                    : 'text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sunset-accent" />
                <span>Admin Approvals</span>
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
              <span>About</span>
            </Link>

          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Saved Places Heart Icon for Tourists */}
            {(!user || role === 'tourist') && (
              <Link
                to="/dashboard/tourist"
                title="Saved Places"
                className="relative p-2.5 rounded-xl text-sunset-muted hover:text-sunset-accent hover:bg-sunset-bg/60 transition-all"
              >
                <Heart className="w-5 h-5" />
                {favoriteIds.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-sunset-accent text-sunset-on-accent text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>
            )}

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
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-sunset-muted transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-sunset-border p-2 shadow-2xl animate-fade-in z-50 bg-sunset-surface">
                    <div className="p-3 border-b border-sunset-border mb-1">
                      <p className="text-sm font-semibold text-sunset-text">{user.name}</p>
                      <p className="text-xs text-sunset-muted truncate">{user.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sunset-accent/15 text-sunset-accent uppercase">
                        Role: {user.role}
                      </div>
                    </div>

                    {/* Role-Specific Navigation Links */}
                    {role === 'tourist' && (
                      <Link
                        to="/dashboard/tourist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-sunset-text hover:bg-sunset-bg/70 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-sunset-accent" />
                        <span>Tourist Dashboard</span>
                      </Link>
                    )}

                    {role === 'provider' && (
                      <Link
                        to="/dashboard/provider"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-sunset-text hover:bg-sunset-bg/70 rounded-lg transition-colors"
                      >
                        <Building className="w-4 h-4 text-emerald-400" />
                        <span>Provider Dashboard</span>
                      </Link>
                    )}

                    {role === 'admin' && (
                      <Link
                        to="/dashboard/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-sunset-text hover:bg-sunset-bg/70 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-sunset-accent" />
                        <span>Admin Curation Console</span>
                      </Link>
                    )}

                    {/* Settings Page Link (Theme is ONLY in settings) */}
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-sunset-text hover:bg-sunset-bg/70 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-sunset-accent" />
                      <span>Settings & Theme</span>
                    </Link>

                    {/* Demo Role Switcher for instant testing */}
                    <div className="p-2 border-t border-sunset-border mt-1">
                      <p className="text-[10px] text-sunset-muted mb-1 font-semibold uppercase tracking-wider">
                        Demo Role Test Switcher:
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => { switchDemoRole('tourist'); setUserDropdownOpen(false); }}
                          className={`text-[10px] py-1 rounded font-semibold transition-all ${user.role === 'tourist' ? 'bg-sunset-accent text-sunset-on-accent' : 'bg-sunset-bg text-sunset-muted'}`}
                        >
                          Tourist
                        </button>
                        <button
                          type="button"
                          onClick={() => { switchDemoRole('provider'); setUserDropdownOpen(false); }}
                          className={`text-[10px] py-1 rounded font-semibold transition-all ${user.role === 'provider' ? 'bg-sunset-accent text-sunset-on-accent' : 'bg-sunset-bg text-sunset-muted'}`}
                        >
                          Provider
                        </button>
                        <button
                          type="button"
                          onClick={() => { switchDemoRole('admin'); setUserDropdownOpen(false); }}
                          className={`text-[10px] py-1 rounded font-semibold transition-all ${user.role === 'admin' ? 'bg-sunset-accent text-sunset-on-accent' : 'bg-sunset-bg text-sunset-muted'}`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1 border-t border-sunset-border"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
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
                  Log In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="btn-accent px-4 py-2 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {(!user || role === 'tourist') && (
              <Link
                to="/dashboard/tourist"
                className="p-2 text-sunset-muted hover:text-sunset-accent"
                title="Saved"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-sunset-muted hover:text-sunset-text hover:bg-sunset-bg/60 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-sunset-border px-4 pt-3 pb-6 space-y-3 animate-fade-in max-h-[85vh] overflow-y-auto bg-sunset-surface">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
            >
              <Home className="w-4 h-4 text-sunset-accent" />
              <span>Home</span>
            </Link>

            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-sunset-accent" />
              <span>Explore Mumbai Directory</span>
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
              <span>About LocalLens</span>
            </Link>

            {user && (
              <>
                <div className="pt-2 border-t border-sunset-border my-1" />
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
                >
                  <LayoutDashboard className="w-4 h-4 text-sunset-accent" />
                  <span>Dashboard ({user.role})</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-sunset-text hover:bg-sunset-bg flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-sunset-accent" />
                  <span>Settings & Appearance</span>
                </Link>

                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
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
                  Log In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold btn-accent rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

    </header>
  );
};
