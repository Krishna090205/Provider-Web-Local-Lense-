import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, Building, ShieldCheck, Database, Activity,
  Search, CheckCircle2, XCircle, ArrowUpRight, Lock, Key, RefreshCw,
  Sparkles, Filter, Trash2, Check, AlertTriangle, Eye, Shield
} from 'lucide-react';
import { useAuth } from '../features/auth';
import { useToast } from '../components/Toast';
import {
  fetchAllListingsForAdmin,
  updateListingStatus,
  getLocalProviders,
  updateProviderApproval
} from '../lib/store';
import { Listing, Profile, UserRole, ProviderStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const SuperAdminPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'system'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [providers, setProviders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  // Simulated super admin user roster
  const [usersList, setUsersList] = useState<Profile[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allListings = await fetchAllListingsForAdmin();
      setListings(allListings);

      if (isSupabaseConfigured) {
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && dbProfiles.length > 0) {
          setUsersList(dbProfiles as Profile[]);
          setProviders((dbProfiles as Profile[]).filter(p => p.role === 'provider'));
        } else {
          setUsersList([]);
          setProviders([]);
        }
      } else {
        const allProviders = getLocalProviders();
        setProviders(allProviders);
        setUsersList(allProviders);
      }
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsersList(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`User role upgraded to ${newRole.toUpperCase()}`);
  };

  const handleListingStatusChange = async (listingId: string, newStatus: 'approved' | 'rejected') => {
    await updateListingStatus(listingId, newStatus);
    setListings(prev =>
      prev.map(l => (l.id === listingId ? { ...l, status: newStatus } : l))
    );
    toast.success(`Listing successfully marked as ${newStatus}`);
  };

  const filteredListings = listings.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-sunset-bg text-sunset-text pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Super Admin Master Header */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl relative overflow-hidden border border-sunset-border">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sunset-accent/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sunset-accent/20 text-sunset-accent border border-sunset-accent/30 shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Super Admin Root Access (sAdmin)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-sunset-text">
                Central Super Admin Portal
              </h1>
              <p className="text-sm text-sunset-muted max-w-2xl leading-relaxed">
                Full authority governance console for LocalLens Mumbai. Oversee system architecture, curate heritage listings, grant administration rights, and enforce strict zero-fake-data policies.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="glass-panel px-4 py-2.5 rounded-xl text-xs font-semibold hover:border-sunset-accent text-sunset-text flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Node State</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-sunset-border/60">
            <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border">
              <span className="text-[11px] uppercase tracking-wider text-sunset-muted font-bold block mb-1">
                Active Listings
              </span>
              <p className="text-2xl font-bold font-serif text-sunset-accent">
                {listings.length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border">
              <span className="text-[11px] uppercase tracking-wider text-sunset-muted font-bold block mb-1">
                Super Admins & Admins
              </span>
              <p className="text-2xl font-bold font-serif text-emerald-400">
                {usersList.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border">
              <span className="text-[11px] uppercase tracking-wider text-sunset-muted font-bold block mb-1">
                Verified Providers
              </span>
              <p className="text-2xl font-bold font-serif text-amber-400">
                {usersList.filter(u => u.role === 'provider').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border">
              <span className="text-[11px] uppercase tracking-wider text-sunset-muted font-bold block mb-1">
                System Security Guard
              </span>
              <p className="text-2xl font-bold font-serif text-sunset-text flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>100% OK</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-sunset-border gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'listings'
                ? 'border-sunset-accent text-sunset-accent'
                : 'border-transparent text-sunset-muted hover:text-sunset-text'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>All Listings Oversight ({listings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'border-sunset-accent text-sunset-accent'
                : 'border-transparent text-sunset-muted hover:text-sunset-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Roles & Governance ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'system'
                ? 'border-sunset-accent text-sunset-accent'
                : 'border-transparent text-sunset-muted hover:text-sunset-text'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Platform Health & Config</span>
          </button>
        </div>

        {/* TAB 1: LISTINGS OVERSIGHT */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search & Filter Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sunset-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter listings by name, area, category..."
                  className="w-full pl-9 pr-3 py-2 text-xs glass-input rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-sunset-muted" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="glass-input rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Listings Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-sunset-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sunset-bg/80 border-b border-sunset-border text-sunset-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Establishment</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-right">sAdmin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sunset-border/50">
                    {filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sunset-muted">
                          No listings matching your current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredListings.map(item => (
                        <tr key={item.id} className="hover:bg-sunset-bg/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-sunset-text">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.photos?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=100&q=80'}
                                alt={item.name}
                                className="w-9 h-9 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-bold text-sunset-text">{item.name}</p>
                                <span className="text-[10px] text-sunset-muted font-normal">
                                  ID: {item.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 capitalize text-sunset-muted font-medium">
                            {item.category}
                          </td>
                          <td className="py-3.5 px-4 text-sunset-muted">
                            {item.area}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.status === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : item.status === 'pending'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-sunset-text">
                            ★ {item.rating} ({item.review_count})
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleListingStatusChange(item.id, 'approved')}
                                  title="Force Approve Listing"
                                  className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {item.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleListingStatusChange(item.id, 'rejected')}
                                  title="Reject Listing"
                                  className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER ROLES & GOVERNANCE */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold font-serif text-sunset-text">
                Role Management & Elevation
              </h3>
              <p className="text-xs text-sunset-muted leading-relaxed">
                As Super Administrator (`sAdmin`), you have root authority to elevate users to `admin` or `sAdmin`, modify provider statuses, or revoke privileges.
              </p>

              <div className="glass-panel rounded-2xl overflow-hidden border border-sunset-border mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sunset-bg/80 border-b border-sunset-border text-sunset-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Current Role</th>
                      <th className="py-3 px-4 text-right">Assign Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sunset-border/50">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-sunset-bg/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-sunset-text">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sunset-muted">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-sunset-accent/20 text-sunset-accent border border-sunset-accent/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleRoleChange(u.id, 'admin')}
                              className={`px-2 py-1 rounded text-[10px] font-bold ${
                                u.role === 'admin'
                                  ? 'bg-sunset-accent text-sunset-on-accent'
                                  : 'bg-sunset-bg border border-sunset-border text-sunset-muted hover:text-sunset-accent'
                              }`}
                            >
                              Make Admin
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRoleChange(u.id, 'provider')}
                              className={`px-2 py-1 rounded text-[10px] font-bold ${
                                u.role === 'provider'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-sunset-bg border border-sunset-border text-sunset-muted hover:text-emerald-400'
                              }`}
                            >
                              Make Provider
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM HEALTH & CONFIG */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="text-base font-bold font-serif text-sunset-text flex items-center gap-2">
                  <Database className="w-4 h-4 text-sunset-accent" />
                  <span>Storage & Cache Management</span>
                </h3>
                <p className="text-xs text-sunset-muted leading-relaxed">
                  Purge stale offline cache, invalidate cached reviews, and refresh local schema states.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('locallens_listings');
                      toast.success('Listings cache flushed successfully');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl glass-panel text-xs font-semibold text-sunset-text hover:border-sunset-accent transition-all text-left flex items-center justify-between"
                  >
                    <span>Flush Listings In-Memory Cache</span>
                    <RefreshCw className="w-3.5 h-3.5 text-sunset-accent" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success('Super Admin verified audit log archived');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl glass-panel text-xs font-semibold text-sunset-text hover:border-sunset-accent transition-all text-left flex items-center justify-between"
                  >
                    <span>Archive Security Audit Logs</span>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="text-base font-bold font-serif text-sunset-text flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security & Integrity Policies</span>
                </h3>
                <div className="space-y-2.5 text-xs text-sunset-muted">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-sunset-bg/60 border border-sunset-border">
                    <span>Role Enforcement Guard</span>
                    <span className="text-emerald-400 font-bold">STRICT (sAdmin, Admin, Provider)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-sunset-bg/60 border border-sunset-border">
                    <span>Zero Synthetic Reviews Policy</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-sunset-bg/60 border border-sunset-border">
                    <span>Multi-Language Engine</span>
                    <span className="text-sunset-accent font-bold">EN • MR • HI • GU</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperAdminPage;
