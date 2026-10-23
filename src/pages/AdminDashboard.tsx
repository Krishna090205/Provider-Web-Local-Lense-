import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldCheck, Users, Building2, MapPin, Check, X, AlertTriangle,
  Search, Filter, Eye, Star, Clock, AlertCircle, FileText, BarChart3,
  Calendar, ChevronRight, ShieldAlert, Sparkles, MessageSquare
} from 'lucide-react';
import { useAuth } from '../features/auth';
import { providerRejectionSchema, ProviderRejectionFormValues } from '../features/admin';
import { useProviders, useUpdateProviderApprovalMutation } from '../hooks/useProvidersQuery';
import { Profile, ProviderStatus, Listing, ListingStatus } from '../types';
import { fetchAllListingsForAdmin, updateListingStatus } from '../lib/store';

export const AdminDashboard: React.FC = () => {
  const { user, role } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'approvals' | 'listings' | 'stats' | 'users'>('approvals');

  // TanStack Query for Providers
  const { data: providersData = [], isLoading: loadingProviders, refetch: refetchProviders } = useProviders();
  const updateApprovalMutation = useUpdateProviderApprovalMutation();

  const [providerSearch, setProviderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProviderStatus>('all');

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Profile | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // React Hook Form for rejection
  const {
    register: registerReject,
    handleSubmit: handleSubmitRejectForm,
    reset: resetRejectForm,
    formState: { errors: rejectErrors, isSubmitting: isRejecting }
  } = useForm<ProviderRejectionFormValues>({
    resolver: zodResolver(providerRejectionSchema),
    defaultValues: { reason: '' }
  });

  // Listings data
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingSearch, setListingSearch] = useState('');

  // Route Guard: only admin allowed
  if (role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center space-y-6 text-sunset-text">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold font-serif text-sunset-text">Admin Access Required</h1>
        <p className="text-sm text-sunset-muted">
          Your current account role (<span className="capitalize font-semibold text-sunset-accent">{role}</span>) does not have privileges to view the administrative curation console.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link to="/" className="btn-accent px-6 py-2.5 text-xs">Return to Home</Link>
          <Link to="/dashboard" className="px-6 py-2.5 glass-panel rounded-xl text-xs text-sunset-text border border-sunset-border">
            My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const loadListings = async () => {
    setLoadingListings(true);
    try {
      const all = await fetchAllListingsForAdmin();
      setListings(all);
    } catch (e) {
      console.error('Failed to load listings', e);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  // Handle Provider Approval
  const handleApproveProvider = async (provider: Profile) => {
    try {
      await updateApprovalMutation.mutateAsync({
        providerId: provider.id,
        status: 'approved',
        adminId: user?.id
      });
      setActionFeedback(`Approved ${provider.name} (${provider.business_name || 'Provider'})! Listing publishing enabled.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve';
      setActionFeedback(`Error: ${msg}`);
    }
  };

  // Open Rejection Modal
  const openRejectModal = (provider: Profile) => {
    setSelectedProvider(provider);
    resetRejectForm({ reason: provider.provider_review_note || '' });
    setRejectModalOpen(true);
  };

  // Submit Rejection via React Hook Form
  const onSubmitReject = async (values: ProviderRejectionFormValues) => {
    if (!selectedProvider) return;
    try {
      await updateApprovalMutation.mutateAsync({
        providerId: selectedProvider.id,
        status: 'rejected',
        note: values.reason.trim(),
        adminId: user?.id
      });
      setActionFeedback(`Application for ${selectedProvider.name} rejected with reason logged.`);
      setTimeout(() => setActionFeedback(null), 4000);
      setRejectModalOpen(false);
      setSelectedProvider(null);
      resetRejectForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject';
      alert(`Error rejecting provider: ${msg}`);
    }
  };

  // Handle Suspend
  const handleSuspendProvider = async (provider: Profile) => {
    const note = prompt('Enter suspension reason:', 'Account flagged for compliance review.');
    if (note === null) return;
    try {
      await updateApprovalMutation.mutateAsync({
        providerId: provider.id,
        status: 'suspended',
        note,
        adminId: user?.id
      });
      setActionFeedback(`Suspended ${provider.name}. Public listings hidden.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to suspend';
      alert(`Error suspending provider: ${msg}`);
    }
  };

  // Handle Listing Status Toggle
  const handleToggleListingStatus = async (listing: Listing, newStatus: ListingStatus) => {
    const updated = await updateListingStatus(listing.id, newStatus);
    if (updated) {
      setListings(prev => prev.map(l => l.id === listing.id ? updated : l));
      setActionFeedback(`Listing "${listing.name}" set to ${newStatus.toUpperCase()}`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  // Filtered Providers
  const providers = providersData;
  const filteredProviders = providers.filter(p => {
    if (statusFilter !== 'all' && (p.provider_status || 'pending') !== statusFilter) return false;
    if (providerSearch.trim()) {
      const q = providerSearch.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.business_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Listings
  const filteredListings = listings.filter(l => {
    if (listingSearch.trim()) {
      const q = listingSearch.toLowerCase().trim();
      return l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q) || l.area.toLowerCase().includes(q);
    }
    return true;
  });

  // Stats calculation
  const pendingCount = providers.filter(p => (p.provider_status || 'pending') === 'pending').length;
  const approvedCount = providers.filter(p => p.provider_status === 'approved').length;
  const rejectedCount = providers.filter(p => p.provider_status === 'rejected').length;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-sunset-text">
      
      {/* Admin Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sunset-accent/15 text-sunset-accent border border-sunset-accent/25 uppercase font-serif">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Command Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-sunset-text">
            Admin Curation Center
          </h1>
          <p className="text-xs sm:text-sm text-sunset-muted">
            Review and approve provider credentials, moderate Mumbai listings, and safeguard authentic local data.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 bg-sunset-bg/60 p-3 rounded-2xl border border-sunset-border">
          <div className="text-center px-3 border-r border-sunset-border">
            <span className="block text-xl font-bold text-sunset-accent">{pendingCount}</span>
            <span className="text-[10px] uppercase font-semibold text-sunset-muted">Pending</span>
          </div>
          <div className="text-center px-3 border-r border-sunset-border">
            <span className="block text-xl font-bold text-emerald-400">{approvedCount}</span>
            <span className="text-[10px] uppercase font-semibold text-sunset-muted">Approved</span>
          </div>
          <div className="text-center px-3">
            <span className="block text-xl font-bold text-sunset-text">{listings.length}</span>
            <span className="text-[10px] uppercase font-semibold text-sunset-muted">Listings</span>
          </div>
        </div>
      </div>

      {/* Global Action Feedback Notice */}
      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-sunset-accent/15 border border-sunset-accent/30 text-sunset-accent text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-sunset-border pb-3">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'approvals'
              ? 'btn-accent shadow-lg'
              : 'glass-panel text-sunset-muted hover:text-sunset-text'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Provider Approvals ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'listings'
              ? 'btn-accent shadow-lg'
              : 'glass-panel text-sunset-muted hover:text-sunset-text'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>All Listings ({listings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'stats'
              ? 'btn-accent shadow-lg'
              : 'glass-panel text-sunset-muted hover:text-sunset-text'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Overview Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'btn-accent shadow-lg'
              : 'glass-panel text-sunset-muted hover:text-sunset-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Roles</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PROVIDER APPROVALS TABLE
         ========================================================================= */}
      {activeTab === 'approvals' && (
        <section className="space-y-6 animate-fade-in">
          
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
              <input
                type="text"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                placeholder="Search provider by name, email, or business name..."
                className="w-full h-10 glass-input rounded-xl pl-10 pr-4 text-xs"
              />
            </div>

            {/* Status Pills Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-sunset-muted mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </span>
              {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-sunset-accent text-sunset-on-accent shadow-sm'
                      : 'bg-sunset-bg/60 text-sunset-muted hover:text-sunset-text border border-sunset-border'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>

          {/* Providers Table */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-sunset-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-sunset-border bg-sunset-bg/80 text-sunset-muted uppercase font-semibold text-[11px] font-serif">
                    <th className="py-4 px-6">Provider / Contact</th>
                    <th className="py-4 px-6">Business Name</th>
                    <th className="py-4 px-6">Submitted Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Review Notes</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sunset-border">
                  {loadingProviders ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sunset-muted">
                        Loading registered providers...
                      </td>
                    </tr>
                  ) : filteredProviders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sunset-muted">
                        No providers found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProviders.map((prov) => {
                      const st = prov.provider_status || 'pending';
                      return (
                        <tr key={prov.id} className="hover:bg-sunset-bg/40 transition-colors">
                          
                          {/* Name & Avatar */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={prov.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80'}
                                alt={prov.name}
                                className="w-9 h-9 rounded-xl object-cover ring-2 ring-sunset-border"
                              />
                              <div>
                                <span className="font-bold text-sunset-text block text-sm">{prov.name}</span>
                                <span className="text-sunset-muted text-[11px]">{prov.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Business Name */}
                          <td className="py-4 px-6">
                            <span className="font-semibold text-sunset-text">
                              {prov.business_name || '—'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-6 text-sunset-muted">
                            {new Date(prov.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                st === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : st === 'rejected'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : st === 'suspended'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>{st}</span>
                            </span>
                          </td>

                          {/* Review Note */}
                          <td className="py-4 px-6 max-w-xs text-sunset-muted text-[11px]">
                            {prov.provider_review_note ? (
                              <span className="line-clamp-2 italic">"{prov.provider_review_note}"</span>
                            ) : (
                              <span>—</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {st !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveProvider(prov)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                                  title="Approve this provider to publish live listings"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {st !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => openRejectModal(prov)}
                                  className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white font-semibold text-xs border border-red-500/30 transition-all flex items-center gap-1.5"
                                  title="Reject application (reason required)"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Reject</span>
                                </button>
                              )}

                              {st === 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleSuspendProvider(prov)}
                                  className="px-2.5 py-1.5 rounded-xl bg-sunset-bg text-sunset-muted hover:text-red-400 text-xs border border-sunset-border transition-colors"
                                  title="Suspend Provider Account"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      )}

      {/* =========================================================================
          TAB 2: ALL LISTINGS MODERATION
         ========================================================================= */}
      {activeTab === 'listings' && (
        <section className="space-y-6 animate-fade-in">
          
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder="Search listings by title, category, or area..."
                className="w-full h-10 glass-input rounded-xl pl-10 pr-4 text-xs"
              />
            </div>
            <span className="text-xs text-sunset-muted font-semibold">
              Showing {filteredListings.length} listings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-sunset-border space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sunset-accent/15 text-sunset-accent">
                      {listing.category}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        listing.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : listing.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-sunset-text font-serif line-clamp-1">
                    {listing.name}
                  </h3>
                  <p className="text-xs text-sunset-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sunset-accent" />
                    <span>{listing.area}</span>
                  </p>
                  <p className="text-[11px] text-sunset-muted/80 line-clamp-2 mt-2 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-sunset-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-sunset-accent font-semibold">
                    <Star className="w-3.5 h-3.5 fill-sunset-accent" />
                    <span>{listing.rating > 0 ? listing.rating : '—'}</span>
                    <span className="text-sunset-muted text-[10px]">({listing.review_count || '0'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {listing.status !== 'approved' ? (
                      <button
                        type="button"
                        onClick={() => handleToggleListingStatus(listing, 'approved')}
                        className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[11px]"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleListingStatus(listing, 'rejected')}
                        className="px-2.5 py-1 bg-sunset-bg text-red-400 border border-red-500/30 rounded-lg text-[11px] hover:bg-red-500/10"
                      >
                        Hide
                      </button>
                    )}
                    <Link
                      to={`/listings/${listing.id}`}
                      target="_blank"
                      className="p-1 rounded text-sunset-muted hover:text-sunset-text"
                      title="View Public Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </section>
      )}

      {/* =========================================================================
          TAB 3: OVERVIEW STATS
         ========================================================================= */}
      {activeTab === 'stats' && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          
          <div className="glass-card p-6 rounded-3xl space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-sunset-accent">Total Providers</span>
            <div className="text-3xl font-extrabold font-serif text-sunset-text">{providers.length}</div>
            <p className="text-xs text-sunset-muted">Establishments registered on platform</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Pending Verification</span>
            <div className="text-3xl font-extrabold font-serif text-amber-400">{pendingCount}</div>
            <p className="text-xs text-sunset-muted">Requires admin documentation review</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Approved Providers</span>
            <div className="text-3xl font-extrabold font-serif text-emerald-400">{approvedCount}</div>
            <p className="text-xs text-sunset-muted">Active verified partners in Mumbai</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">Total Listings</span>
            <div className="text-3xl font-extrabold font-serif text-sunset-text">{listings.length}</div>
            <p className="text-xs text-sunset-muted">Heritage spots, cafes, forts & bazaars</p>
          </div>

        </section>
      )}

      {/* =========================================================================
          TAB 4: USERS & ROLES
         ========================================================================= */}
      {activeTab === 'users' && (
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold font-serif text-sunset-text">Active Platform Users</h2>
          <p className="text-xs text-sunset-muted">
            Overview of user roles. Role elevation to Admin can only be performed via SQL migrations or server-side admin credentials.
          </p>

          <div className="space-y-3 pt-3">
            <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sunset-accent/20 flex items-center justify-center text-sunset-accent font-bold">
                  AK
                </div>
                <div>
                  <p className="text-sm font-bold text-sunset-text">Arun Kumar</p>
                  <p className="text-xs text-sunset-muted">arun.tourist@locallens.in</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-sunset-accent/20 text-sunset-accent">
                Tourist
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  PS
                </div>
                <div>
                  <p className="text-sm font-bold text-sunset-text">Priya Shenoy</p>
                  <p className="text-xs text-sunset-muted">priya@malabarstays.in (Malabar Heritage Stays)</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400">
                Provider (Approved)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sunset-accent-hot/20 flex items-center justify-center text-sunset-accent-hot font-bold">
                  AD
                </div>
                <div>
                  <p className="text-sm font-bold text-sunset-text">Administrator Curation Team</p>
                  <p className="text-xs text-sunset-muted">admin.locallens@mumbai.gov.in</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-sunset-accent-hot/20 text-sunset-accent-hot">
                Admin
              </span>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          REJECTION MODAL WITH MANDATORY REASON
         ========================================================================= */}
      {rejectModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 border border-sunset-border bg-sunset-surface">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold font-serif text-sunset-text">Reject Provider Application</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="p-1 rounded-lg text-sunset-muted hover:text-sunset-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-sunset-muted leading-relaxed">
              Please provide a clear and specific reason for rejecting <strong className="text-sunset-text">{selectedProvider.name}</strong> ({selectedProvider.business_name || 'Business'}). This note will be displayed in the provider’s dashboard banner so they can rectify their application.
            </p>

            <form onSubmit={handleSubmitRejectForm(onSubmitReject)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-sunset-text block mb-1.5">
                  Rejection Reason (Required)
                </label>
                <textarea
                  rows={4}
                  {...registerReject('reason')}
                  placeholder="e.g. Municipal trade license documentation expired. Please re-upload current valid certificate or shop establishment license."
                  className="w-full glass-input rounded-xl p-3 text-xs leading-relaxed"
                />
                {rejectErrors.reason && (
                  <p className="mt-1 text-xs text-red-400">{rejectErrors.reason.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-sunset-muted hover:text-sunset-text border border-sunset-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isRejecting ? 'Confirming...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
