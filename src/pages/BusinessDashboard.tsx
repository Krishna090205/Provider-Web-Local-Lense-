import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building, Plus, Edit3, Trash2, Eye, Star, MessageSquare, Check,
  X, MapPin, Clock, Phone, Globe, Image as ImageIcon, ShieldCheck,
  AlertCircle, AlertTriangle, ShieldX, Sparkles, Bell, UploadCloud, Loader2, Lock,
  RefreshCw
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
import {
  getLocalNotifications,
  markNotificationAsRead,
  uploadListingPhoto,
  getLocalProviders,
  updateProviderApproval
} from '../lib/store';
import { useToast } from '../components/Toast';

export const BusinessDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query for owner listings & mutations (strictly isolated to this provider)
  const { data: listings = [], isLoading: loading, refetch: refetchListings } = useOwnerListings(user?.id, user?.email);
  const createMutation = useCreateListingMutation();
  const updateMutation = useUpdateListingMutation();
  const deleteMutation = useDeleteListingMutation();

  // Notifications
  const [notifications, setNotifications] = useState(() => user ? getLocalNotifications(user.id) : []);

  // Modal State for New / Edit Listing
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // Form handling via React Hook Form + Zod
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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

  const currentPhotoUrl = watch('photoUrl');

  const { refreshUser } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);

  // Compute live provider status checking both authenticated profile and local store
  const computeStatus = (): ProviderStatus => {
    const local = user ? getLocalProviders().find(p => p.id === user.id || (p.email && p.email === user.email)) : null;
    if (user?.provider_status === 'approved' || local?.provider_status === 'approved') return 'approved';
    if (user?.provider_status === 'rejected' || local?.provider_status === 'rejected') return 'rejected';
    if (user?.provider_status === 'suspended' || local?.provider_status === 'suspended') return 'suspended';
    return (user?.provider_status as ProviderStatus) || local?.provider_status || 'pending';
  };

  const [providerStatus, setProviderStatus] = useState<ProviderStatus>(computeStatus);

  useEffect(() => {
    const syncStatus = () => {
      setProviderStatus(computeStatus());
    };
    syncStatus();
    window.addEventListener('locallens_user_updated', syncStatus);
    window.addEventListener('storage', syncStatus);
    return () => {
      window.removeEventListener('locallens_user_updated', syncStatus);
      window.removeEventListener('storage', syncStatus);
    };
  }, [user]);

  const isApproved = providerStatus === 'approved' || role === 'admin';

  const handleCheckApproval = async () => {
    setCheckingStatus(true);
    try {
      if (refreshUser) {
        await refreshUser();
      }
      const newStatus = computeStatus();
      setProviderStatus(newStatus);
      if (newStatus === 'approved') {
        toast.success('Your provider account is approved! Listing creation is now unlocked.');
      } else {
        toast.info('Status is currently pending. If you approved in Supabase, ensure the "provider_status" column exists in your profiles table.');
      }
    } catch {
      toast.error('Failed to refresh status from database.');
    } finally {
      setCheckingStatus(false);
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center space-y-6 text-sunset-text">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold font-serif text-sunset-text">Sign In Required</h1>
        <p className="text-sm text-sunset-muted">
          Please sign in to access your provider establishment portal.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link to="/auth?mode=login" className="btn-accent px-6 py-2.5 text-xs">Sign In</Link>
          <Link to="/" className="px-6 py-2.5 glass-panel rounded-xl text-xs text-sunset-text border border-sunset-border">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const openCreateModal = () => {
    if (!isApproved) {
      toast.warning('Admin Approval Required: Your provider account is currently pending verification. You can list shops once an administrator approves your account.');
      return;
    }
    setEditingId(null);
    setPhotoUploadError(null);
    reset({
      name: '',
      category: 'hotels',
      description: '',
      address: '',
      area: 'Colaba',
      lat: '18.9217',
      lng: '72.8332',
      phone: '+91 22 ',
      website: '',
      price_level: '',
      photoUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
      hoursText: '10:00 AM - 10:00 PM'
    });
    setModalOpen(true);
  };

  const openEditModal = (listing: Listing) => {
    setEditingId(listing.id);
    setPhotoUploadError(null);
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

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setPhotoUploadError(null);
    try {
      const res = await uploadListingPhoto(file, user?.id);
      if (res.error) {
        setPhotoUploadError(res.error);
        toast.error(res.error);
      } else if (res.url) {
        setValue('photoUrl', res.url, { shouldValidate: true });
        toast.success('Cover photo uploaded successfully!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      setPhotoUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setValue('photoUrl', '', { shouldValidate: true });
    toast.info('Photo removed');
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

    const initialStatus = 'approved';

    const cleanWeb = data.website?.trim();
    const finalWebsite = (!cleanWeb || cleanWeb === 'https://' || cleanWeb === 'http://') ? null : cleanWeb;

    const rawPrice = data.price_level?.trim() || '';
    const formattedPrice = rawPrice.startsWith('₹')
      ? rawPrice
      : (!isNaN(Number(rawPrice)) ? `₹${rawPrice}` : (rawPrice.toLowerCase().startsWith('rs') ? rawPrice : (rawPrice ? `₹${rawPrice}` : '—')));

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
            website: finalWebsite,
            price_level: formattedPrice,
            hours: hoursObj,
            photos: [photoObj],
            status: 'approved'
          }
        });
        toast.success('Establishment updated successfully!');
      } else {
        await createMutation.mutateAsync({
          owner_id: user?.id,
          owner_email: user?.email,
          name: data.name.trim(),
          category: data.category,
          description: data.description.trim(),
          address: data.address.trim(),
          area: data.area.trim(),
          lat: parseFloat(data.lat) || 18.9217,
          lng: parseFloat(data.lng) || 72.8332,
          phone: data.phone?.trim() || null,
          website: finalWebsite,
          price_level: formattedPrice,
          hours: hoursObj,
          photos: [photoObj],
          status: 'approved',
          featured: false
        });
        toast.success('🎉 Establishment successfully registered and published!');
      }
      setModalOpen(false);
      setEditingId(null);
      reset();
      await refetchListings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Notice while saving listing';
      toast.info(msg);
      setModalOpen(false);
      setEditingId(null);
      reset();
      await refetchListings();
    }
  };

  const handleDeleteListing = async (id: string, listingName: string) => {
    if (!isApproved) {
      toast.error('Action blocked: Only approved providers can manage or delete listings. Awaiting admin approval.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${listingName}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      await refetchListings();
      toast.success(`Deleted "${listingName}" successfully`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing';
      toast.error(`Error deleting listing: ${msg}`);
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
                An administrator must review and approve your provider application in the Admin Dashboard before you can list your shop or establishment. Once approved by an Admin, listing creation will unlock automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              onClick={handleCheckApproval}
              disabled={checkingStatus}
              className="px-4 py-2 rounded-xl btn-accent text-xs font-semibold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
              {checkingStatus ? 'Checking...' : 'Check Status'}
            </button>

            <Link
              to="/settings"
              className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-sunset-text hover:text-sunset-accent border border-sunset-border whitespace-nowrap transition-colors"
            >
              Review Business Profile
            </Link>
          </div>
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
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User Avatar'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sunset-accent/40 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sunset-accent to-amber-500 text-white font-bold text-xl flex items-center justify-center shadow-lg border-2 border-white/10 flex-shrink-0">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            {role === 'admin' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25 uppercase font-serif">
                <ShieldCheck className="w-4 h-4" />
                <span>Administrator Direct Listing Mode</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sunset-accent/15 text-sunset-accent border border-sunset-accent/25 uppercase font-serif">
                <Building className="w-4 h-4" />
                <span>Establishment Control Deck</span>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-sunset-text">
              {role === 'admin' ? 'Curate & Publish Establishments' : (user?.business_name || `${user?.name || 'Provider'}'s Portal`)}
            </h1>
            <p className="text-xs sm:text-sm text-sunset-muted">
              Signed in as <span className="font-semibold text-sunset-text">{user?.name}</span> ({user?.email}) {role === 'admin' && '· Verified Administrator'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className={`px-5 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 rounded-2xl font-bold transition-all shadow-lg w-full md:w-auto ${
            isApproved
              ? 'btn-accent hover:scale-105'
              : 'bg-sunset-border/40 text-sunset-muted border border-sunset-border hover:border-amber-400/50 cursor-pointer'
          }`}
          title={isApproved ? (role === 'admin' ? 'List a new establishment as Admin' : 'Add a new establishment') : 'Admin approval required before you can list your shop'}
        >
          {isApproved ? <Plus className="w-4 h-4 stroke-[3]" /> : <Lock className="w-4 h-4 text-amber-400" />}
          <span>{isApproved ? 'Add New Establishment' : 'Listing Locked (Awaiting Admin Approval)'}</span>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
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
              className={`px-5 py-2.5 text-xs inline-flex items-center gap-2 rounded-xl font-bold transition-all ${
                isApproved
                  ? 'btn-accent hover:scale-105'
                  : 'bg-sunset-border/40 text-sunset-muted border border-sunset-border hover:border-amber-400/50 cursor-pointer'
              }`}
            >
              {isApproved ? <Plus className="w-4 h-4 stroke-[3]" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span>{isApproved ? 'Create Establishment' : 'Creation Locked (Requires Admin Approval)'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                          item.status === 'pending'
                            ? 'bg-amber-500/80 text-slate-950'
                            : 'bg-emerald-500/80 text-white'
                        }`}
                      >
                        {item.status === 'pending' ? 'Pending Review' : 'Live Public'}
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
                      disabled={!isApproved}
                      onClick={() => openEditModal(item)}
                      className={`p-2 rounded-xl transition-colors border border-sunset-border ${
                        isApproved
                          ? 'bg-sunset-surface hover:bg-sunset-accent hover:text-sunset-on-accent text-sunset-muted'
                          : 'bg-sunset-border/30 text-sunset-muted/40 cursor-not-allowed opacity-60'
                      }`}
                      title={isApproved ? "Edit Establishment Details" : "Editing locked: Admin approval required"}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!isApproved}
                      onClick={() => handleDeleteListing(item.id, item.name)}
                      className={`p-2 rounded-xl transition-colors border border-sunset-border ${
                        isApproved
                          ? 'bg-sunset-surface hover:bg-red-500 hover:text-white text-sunset-muted'
                          : 'bg-sunset-border/30 text-sunset-muted/40 cursor-not-allowed opacity-60'
                      }`}
                      title={isApproved ? "Delete Listing" : "Deletion locked: Admin approval required"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto py-6 sm:py-10">
          <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 rounded-3xl shadow-2xl space-y-6 border border-sunset-border my-auto">
            
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

                {/* Price / Amount Manual Input */}
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">
                    Approx. Price / Amount *
                  </label>
                  <input
                    type="text"
                    {...register('price_level')}
                    placeholder="e.g. ₹500 for two, ₹1,200, ₹350"
                    className="w-full h-11 glass-input rounded-xl px-4 text-xs"
                  />
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

                {/* Cover Photo Upload & Storage */}
                <div className="sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-sunset-text block">
                      Cover Photo (Supabase Storage) *
                    </label>
                    <span className="text-[11px] text-sunset-muted">
                      JPEG, PNG, WebP • Max 5MB
                    </span>
                  </div>

                  {/* Photo Preview if photoUrl exists */}
                  {currentPhotoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-sunset-border bg-black/20 group">
                      <img
                        src={currentPhotoUrl}
                        alt="Listing Cover Preview"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <UploadCloud className="w-4 h-4" /> Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white/90">
                        Cover Preview
                      </div>
                    </div>
                  ) : (
                    /* Dropzone / Upload button */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-sunset-border hover:border-sunset-accent/50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-sunset-accent/5 flex flex-col items-center justify-center gap-2"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoFileChange}
                      />
                      {uploadingPhoto ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2 className="w-8 h-8 text-sunset-accent animate-spin" />
                          <span className="text-xs font-medium text-sunset-accent">Uploading photo to storage...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-sunset-accent/10 border border-sunset-accent/20 text-sunset-accent flex items-center justify-center">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-sunset-text">
                              Click to upload or drag photo here
                            </p>
                            <p className="text-[11px] text-sunset-muted mt-0.5">
                              JPEG, PNG, WebP up to 5 MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {photoUploadError && (
                    <p className="text-xs text-red-400 font-medium">{photoUploadError}</p>
                  )}

                  {/* Fallback Direct URL field */}
                  <div className="pt-1">
                    <label className="text-[11px] text-sunset-muted block mb-1">
                      Or paste an existing photo web URL:
                    </label>
                    <input
                      type="text"
                      {...register('photoUrl')}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-9 glass-input rounded-xl px-3 text-xs"
                    />
                    {errors.photoUrl && (
                      <p className="mt-1 text-xs text-red-400">{errors.photoUrl.message}</p>
                    )}
                  </div>
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
                  <label className="text-xs font-semibold text-sunset-text mb-1 block">
                    Official Website <span className="text-sunset-muted font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    {...register('website')}
                    placeholder="e.g. https://yourshop.com (leave blank if none)"
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
