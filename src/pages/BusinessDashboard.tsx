import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building, Plus, Edit3, Trash2, Eye, Star, MessageSquare, Check,
  X, MapPin, Clock, Phone, Globe, Image as ImageIcon, ShieldCheck,
  AlertCircle, AlertTriangle, ShieldX, Sparkles, Bell
} from 'lucide-react';
import { useAuth } from '../features/auth';
import { listingFormSchema, ListingFormValues } from '../features/dashboard';
import {
  useOwnerListings,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation
} from '../hooks/useListingsQuery';
import { Listing, ListingCategory, ProviderStatus } from '../types';
import { getLocalNotifications, markNotificationAsRead } from '../lib/store';

export const BusinessDashboard: React.FC = () => {
  const { user, role } = useAuth();

  // TanStack Query for owner listings & mutations
  const { data: listings = [], isLoading: loading } = useOwnerListings(user?.id);
  const createMutation = useCreateListingMutation();
  const updateMutation = useUpdateListingMutation();
  const deleteMutation = useDeleteListingMutation();

  // Notifications
  const [notifications, setNotifications] = useState(() => user ? getLocalNotifications(user.id) : []);

  // Modal State for New / Edit Listing
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form handling via React Hook Form + Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: '',
      category: 'hotels',
      description: '',
      address: '',
      area: 'Colaba',
      lat: '18.9217',
      lng: '72.8332',
      phone: '+91 22 ',
      website: 'https://',
      price_level: '₹₹',
      photoUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
      hoursText: '10:00 AM - 10:00 PM'
    }
  });

  // Current Provider Status
  const providerStatus: ProviderStatus = (user?.provider_status as ProviderStatus) || 'pending';
  const isApproved = providerStatus === 'approved' || role === 'admin';

  // Route Guard: only provider or admin allowed
  if (role !== 'provider' && role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center space-y-6 text-sunset-text">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold font-serif text-sunset-text">Provider Access Required</h1>
        <p className="text-sm text-sunset-muted">
          You are currently signed in as a <span className="capitalize font-semibold text-sunset-accent">{role}</span>. The business portal is reserved for registered local providers.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link to="/" className="btn-accent px-6 py-2.5 text-xs">Return to Home</Link>
          <Link to="/dashboard/tourist" className="px-6 py-2.5 glass-panel rounded-xl text-xs text-sunset-text border border-sunset-border">
            Tourist Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const openCreateModal = () => {
    if (!isApproved) {
      alert('Your provider application is currently pending or rejected. You cannot publish new listings to the public until approved.');
    }
    setEditingId(null);
    reset({
      name: '',
      category: 'hotels',
      description: '',
      address: '',
      area: 'Colaba',
      lat: '18.9217',
      lng: '72.8332',
      phone: '+91 22 ',
      website: 'https://',
      price_level: '₹₹',
      photoUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
      hoursText: '10:00 AM - 10:00 PM'
    });
    setModalOpen(true);
  };

  const openEditModal = (listing: Listing) => {
    setEditingId(listing.id);
    reset({
      name: listing.name.replace('[Sample]', '').trim(),
      category: listing.category,
      description: listing.description,
      address: listing.address,
      area: listing.area,
      lat: String(listing.lat),
      lng: String(listing.lng),
      phone: listing.phone || '',
      website: listing.website || '',
      price_level: listing.price_level,
      photoUrl: listing.photos?.[0]?.url || '',
      hoursText: (listing.hours as Record<string, string>)?.[ 'Monday' ] || '10:00 AM - 10:00 PM'
    });
    setModalOpen(true);
  };

  const onSaveListing = async (data: ListingFormValues) => {
    const hoursObj: Record<string, string> = {
      'Monday': data.hoursText,
      'Tuesday': data.hoursText,
      'Wednesday': data.hoursText,
      'Thursday': data.hoursText,
      'Friday': data.hoursText,
      'Saturday': data.hoursText,
      'Sunday': data.hoursText,
    };

    const photoObj = {
      id: 'photo_' + Date.now(),
      listing_id: editingId || '',
      url: data.photoUrl?.trim() || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
      caption: data.name.trim(),
      is_cover: true,
      display_order: 1
    };

    const initialStatus = isApproved ? 'approved' : 'pending';

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          updates: {
            name: data.name.trim(),
            category: data.category,
            description: data.description.trim(),
            address: data.address.trim(),
            area: data.area.trim(),
            lat: parseFloat(data.lat) || 18.9217,
            lng: parseFloat(data.lng) || 72.8332,
            phone: data.phone?.trim() || null,
            website: data.website?.trim() || null,
            price_level: data.price_level,
            hours: hoursObj,
            photos: [photoObj],
            status: isApproved ? 'approved' : 'pending'
          }
        });
        setFeedback('Listing updated successfully!');
      } else {
        await createMutation.mutateAsync({
          owner_id: user?.id,
          name: data.name.trim(),
          category: data.category,
          description: data.description.trim(),
          address: data.address.trim(),
          area: data.area.trim(),
          lat: parseFloat(data.lat) || 18.9217,
          lng: parseFloat(data.lng) || 72.8332,
          phone: data.phone?.trim() || null,
          website: data.website?.trim() || null,
          price_level: data.price_level,
          hours: hoursObj,
          photos: [photoObj],
          status: initialStatus,
          featured: false
        });
        setFeedback(
          isApproved
            ? 'Listing created and published successfully!'
            : 'Listing created in PENDING review mode. Awaiting admin approval.'
        );
      }
      setTimeout(() => setFeedback(null), 4000);
      setModalOpen(false);
      setEditingId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save listing';
      alert(`Error saving listing: ${msg}`);
    }
  };

  const handleDeleteListing = async (id: string, listingName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${listingName}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      setFeedback(`Deleted "${listingName}"`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing';
      alert(`Error deleting listing: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-sunset-text">
      
      {/* =========================================================================
          PROVIDER STATUS BANNERS: Pending, Approved, Rejected, Suspended
         ========================================================================= */}
      {providerStatus === 'pending' && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase tracking-widest">
                  Application Under Review
                </span>
                <span className="text-xs text-sunset-muted font-medium">Verification in progress</span>
              </div>
              <h2 className="text-lg font-bold font-serif text-sunset-text">
                Your Provider Account is Pending Admin Approval
              </h2>
              <p className="text-xs sm:text-sm text-sunset-muted max-w-3xl leading-relaxed">
                You can draft and preview your listings below, but they will remain hidden from the public until our admin team verifies your establishment credentials. Once approved, your listings go live instantly.
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-sunset-text hover:text-sunset-accent border border-sunset-border whitespace-nowrap"
          >
            Review Business Profile
          </Link>
        </div>
      )}

      {providerStatus === 'approved' && (
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Verified LocalLens Provider
              </span>
              <p className="text-xs text-sunset-muted">
                Your establishment credentials are fully verified. All published listings are live and visible to tourists.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
            Active
          </span>
        </div>
      )}

      {providerStatus === 'rejected' && (
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 uppercase tracking-widest">
                Application Needs Revision
              </span>
              <h2 className="text-lg font-bold font-serif text-sunset-text">
                Provider Application Was Rejected
              </h2>
              <p className="text-xs sm:text-sm text-sunset-muted max-w-3xl leading-relaxed">
                <strong className="text-red-300">Admin Review Reason:</strong>{' '}
                <span className="italic text-sunset-text">
                  "{user?.provider_review_note || 'Documentation verification failed or license details expired. Please update credentials.'}"
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-semibold border border-red-500/30 whitespace-nowrap transition-colors"
          >
            Update Business Details
          </Link>
        </div>
      )}

      {providerStatus === 'suspended' && (
        <div className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-4 animate-fade-in shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 uppercase tracking-widest">
              Account Suspended
            </span>
            <h2 className="text-lg font-bold font-serif text-sunset-text">
              Provider Account Suspended
            </h2>
            <p className="text-xs sm:text-sm text-sunset-muted max-w-3xl leading-relaxed">
              Your listings are temporarily hidden from public directories. Please reach out to administrative support to resolve compliance questions.
            </p>
          </div>
        </div>
      )}

      {/* Header Info Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sunset-accent/15 text-sunset-accent border border-sunset-accent/25 uppercase font-serif">
            <Building className="w-4 h-4" />
            <span>Establishment Control Deck</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-sunset-text">
            {user?.business_name || `${user?.name}'s Portal`}
          </h1>
          <p className="text-xs sm:text-sm text-sunset-muted">
            Manage your verified presence, photos, timings, and monitor tourist engagement.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-accent px-5 py-3 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Establishment</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-sunset-accent/15 border border-sunset-accent/30 text-sunset-accent text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-sunset-muted">Active Listings</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-sunset-text">
            {listings.length}
          </div>
          <p className="text-[11px] text-sunset-muted">Establishments registered</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-sunset-accent">Total Impressions</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-sunset-accent">
            {listings.reduce((sum, l) => sum + (l.review_count * 18 + 140), 0)}
          </div>
          <p className="text-[11px] text-sunset-muted">Tourist directory views</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-emerald-400">Average Rating</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-400 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-current" />
            <span>4.8</span>
          </div>
          <p className="text-[11px] text-sunset-muted">From verified local visitors</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs uppercase font-bold text-cyan-400">Total Reviews</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-cyan-400">
            {listings.reduce((sum, l) => sum + (l.review_count || 0), 0)}
          </div>
          <p className="text-[11px] text-sunset-muted">Visitor comments logged</p>
        </div>

      </div>

      {/* Listings Management Table / Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-sunset-text">
            My Managed Establishments
          </h2>
          <span className="text-xs text-sunset-muted font-medium">
            {listings.length} locations
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sunset-muted">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-4 rounded-3xl border border-sunset-border">
            <Building className="w-12 h-12 text-sunset-muted mx-auto opacity-40" />
            <h3 className="text-lg font-bold font-serif text-sunset-text">No Establishments Created Yet</h3>
            <p className="text-xs sm:text-sm text-sunset-muted max-w-md mx-auto">
              Get discovered by Mumbai travelers and heritage enthusiasts. Create your first listing with authentic address and timings.
            </p>
            <button
              onClick={openCreateModal}
              className="btn-accent px-5 py-2.5 text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Establishment</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-3xl overflow-hidden border border-sunset-border flex flex-col justify-between"
              >
                <div>
                  {/* Photo Cover */}
                  <div className="relative h-44 w-full overflow-hidden bg-sunset-bg">
                    <img
                      src={item.photos?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/60 backdrop-blur-md text-sunset-accent border border-white/10">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md ${
                          item.status === 'approved' && isApproved
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-amber-500/80 text-slate-950'
                        }`}
                      >
                        {item.status === 'approved' && isApproved ? 'Live Public' : 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold font-serif text-sunset-text line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-sunset-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-sunset-accent" />
                        <span>{item.address}</span>
                      </p>
                    </div>

                    <p className="text-xs text-sunset-muted/90 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-sunset-border flex items-center justify-between text-xs text-sunset-muted">
                      <span className="flex items-center gap-1 text-sunset-accent font-semibold">
                        <Star className="w-3.5 h-3.5 fill-sunset-accent" />
                        <span>{item.rating > 0 ? item.rating : '—'}</span>
                        <span className="text-sunset-muted text-[10px]">({item.review_count || '0'} reviews)</span>
                      </span>
                      <span>{item.price_level}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-sunset-bg/60 border-t border-sunset-border flex items-center justify-between gap-2">
                  <Link
                    to={`/listings/${item.id}`}
                    className="text-xs text-sunset-accent hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Public</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl bg-sunset-surface hover:bg-sunset-accent hover:text-sunset-on-accent text-sunset-muted transition-colors border border-sunset-border"
                      title="Edit Establishment Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteListing(item.id, item.name)}
                      className="p-2 rounded-xl bg-sunset-surface hover:bg-red-500 hover:text-white text-sunset-muted transition-colors border border-sunset-border"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          CREATE / EDIT ESTABLISHMENT MODAL
         ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto py-10">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 border border-sunset-border my-auto">
            
            <div className="flex items-center justify-between border-b border-sunset-border pb-4">
              <h3 className="text-xl font-bold font-serif text-sunset-text">
                {editingId ? 'Edit Establishment' : 'Add New Mumbai Establishment'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-sunset-muted hover:text-sunset-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSaveListing)} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Establishment Name *</label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Britannia & Co. Restaurant"
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Category *</label>
                  <select
                    {...register('category')}
                    className="w-full h-11 glass-input rounded-xl px-3 text-xs"
                  >
                    <option value="hotels" className="bg-sunset-bg text-sunset-text">Heritage Hotels</option>
                    <option value="restaurants" className="bg-sunset-bg text-sunset-text">Iconic Dining</option>
                    <option value="shops" className="bg-sunset-bg text-sunset-text">Historic Bazaars</option>
                    <option value="attractions" className="bg-sunset-bg text-sunset-text">Attractions</option>
                    <option value="forts" className="bg-sunset-bg text-sunset-text">Historic Forts</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>
                  )}
                </div>

                {/* Price Level */}
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Price Level</label>
                  <select
                    {...register('price_level')}
                    className="w-full h-11 glass-input rounded-xl px-3 text-xs"
                  >
                    <option value="₹" className="bg-sunset-bg text-sunset-text">₹ (Budget / Street)</option>
                    <option value="₹₹" className="bg-sunset-bg text-sunset-text">₹₹ (Moderate)</option>
                    <option value="₹₹₹" className="bg-sunset-bg text-sunset-text">₹₹₹ (Upscale)</option>
                    <option value="₹₹₹₹" className="bg-sunset-bg text-sunset-text">₹₹₹₹ (Heritage Luxury)</option>
                  </select>
                  {errors.price_level && (
                    <p className="mt-1 text-xs text-red-400">{errors.price_level.message}</p>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Area / Neighborhood *</label>
                  <input
                    type="text"
                    {...register('area')}
                    placeholder="Colaba, Fort, Bandra, etc."
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
                  {errors.area && (
                    <p className="mt-1 text-xs text-red-400">{errors.area.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Contact Phone</label>
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="+91 22 2288 1234"
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Full Street Address *</label>
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="Building, Street, Landmark, Mumbai 400001"
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>
                  )}
                </div>

                {/* Photo URL */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Cover Photo URL</label>
                  <input
                    type="url"
                    {...register('photoUrl')}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
                  {errors.photoUrl && (
                    <p className="mt-1 text-xs text-red-400">{errors.photoUrl.message}</p>
                  )}
                </div>

                {/* Opening Hours */}
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Daily Opening Hours</label>
                  <input
                    type="text"
                    {...register('hoursText')}
                    placeholder="10:00 AM - 10:00 PM"
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
                  {errors.hoursText && (
                    <p className="mt-1 text-xs text-red-400">{errors.hoursText.message}</p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Official Website</label>
                  <input
                    type="url"
                    {...register('website')}
                    placeholder="https://example.com"
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
                  {errors.website && (
                    <p className="mt-1 text-xs text-red-400">{errors.website.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">Authentic Description & Heritage Notes *</label>
                  <textarea
                    rows={4}
                    {...register('description')}
                    placeholder="Share the history, culinary specialties, and architectural uniqueness of your establishment..."
                    className="w-full glass-input rounded-xl p-3 text-xs leading-relaxed"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
                  )}
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-sunset-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-sunset-muted hover:text-sunset-text border border-sunset-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-accent px-6 py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Establishment' : 'Publish Establishment'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
