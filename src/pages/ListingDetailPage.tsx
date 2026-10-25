import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin, Star, Heart, Clock, Phone, Globe, Navigation, ArrowLeft,
  Share2, ShieldCheck, Check, MessageSquare
} from 'lucide-react';
import { Listing, Review } from '../types';
import { useListingById } from '../hooks/useListingsQuery';
import { useListingReviews, useAddReviewMutation } from '../hooks/useReviewsQuery';
import { reviewFormSchema, ReviewFormValues } from '../features/dashboard';
import { MapComponent } from '../components/MapComponent';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../features/auth';
import { useLanguage } from '../features/i18n';
import { useToast } from '../components/Toast';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { t } = useLanguage();

  // TanStack Queries & Mutations
  const { data: listing, isLoading: loadingListing } = useListingById(id);
  const { data: reviews = [], isLoading: loadingReviews } = useListingReviews(id);
  const addReviewMutation = useAddReviewMutation();

  const [activePhoto, setActivePhoto] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // React Hook Form for Reviews
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetReviewForm,
    formState: { errors: reviewErrors, isSubmitting: submittingReview }
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: ''
    }
  });

  const userRating = watch('rating');

  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const loading = loadingListing;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-5xl mx-auto px-4 flex flex-col items-center justify-center space-y-4 text-sunset-text">
        <div className="w-12 h-12 border-4 border-sunset-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-sunset-muted">Loading verified details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-4 text-sunset-text">
        <h2 className="text-2xl font-bold font-serif text-sunset-text">Discovery Not Found</h2>
        <p className="text-sm text-sunset-muted">The requested place is not registered or has been moved.</p>
        <Link to="/explore" className="btn-accent inline-block px-5 py-2.5 font-bold rounded-xl text-sm">
          Browse All Mumbai
        </Link>
      </div>
    );
  }

  const isFavorited = isFavorite(listing.id);
  const isSample = listing.name.includes('[Sample]');
  const cleanName = listing.name.replace('[Sample]', '').trim();
  const currentPhoto = activePhoto || listing.photos?.find(p => p.is_cover)?.url || listing.photos?.[0]?.url || '';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Listing link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const onReviewSubmit = async (values: ReviewFormValues) => {
    if (!id) return;
    try {
      await addReviewMutation.mutateAsync({
        listing_id: id,
        user_id: user?.id || 'anon_visitor',
        user_name: user?.name || 'Verified Explorer',
        user_avatar: user?.avatar,
        rating: values.rating,
        comment: values.comment.trim()
      });
      resetReviewForm({ rating: 5, comment: '' });
      setReviewSuccess(true);
      toast.success('Review posted successfully!');
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add review';
      toast.error(`Error submitting review: ${msg}`);
    }
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-sunset-text">
      
      {/* Top Breadcrumb & Share Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sunset-muted hover:text-sunset-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('listingDetail.backToExplore')}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-sunset-muted hover:text-sunset-text border border-sunset-border flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? t('listingDetail.shareCopied') : t('listingDetail.share')}</span>
          </button>

          {/* Save / Favorite */}
          <button
            onClick={() => toggleFavorite(listing.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isFavorited
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'glass-panel text-sunset-muted border-sunset-border hover:text-sunset-text'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorited ? t('listingDetail.saved') : t('listingDetail.save')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Core Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Left 2 Cols: Photo Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden glass-card border border-sunset-border bg-sunset-bg shadow-2xl">
              <img
                src={currentPhoto || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80'}
                alt={cleanName}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />
              
              {/* Top Category and Sample Tag */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-sunset-accent text-sunset-on-accent uppercase tracking-wider shadow-lg">
                    {listing.category}
                  </span>
                  {isSample && (
                    <span className="px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-black/80 text-sunset-accent border border-white/20 uppercase">
                      Sample Data
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
                <div className="min-w-0 pr-1">
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white font-serif drop-shadow-md break-words">
                    {cleanName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 mt-1 drop-shadow">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sunset-accent flex-shrink-0" />
                    <span className="truncate">{listing.area} • Mumbai</span>
                  </p>
                </div>

                <div className="self-start sm:self-auto flex-shrink-0 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-sunset-accent font-bold text-xs sm:text-sm">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-sunset-accent text-sunset-accent flex-shrink-0" />
                  <span>{listing.rating.toFixed(1)}</span>
                  <span className="text-[11px] sm:text-xs text-slate-300 font-normal">({listing.review_count})</span>
                </div>
              </div>
            </div>

            {/* Thumbnail Row */}
            {listing.photos && listing.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {listing.photos.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    onClick={() => setActivePhoto(p.url)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activePhoto === p.url ? 'border-sunset-accent scale-105 shadow-md' : 'border-sunset-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.caption || cleanName} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sunset-border space-y-4">
            <h2 className="text-xl font-bold font-serif text-sunset-text">About this Destination</h2>
            <p className="text-sm sm:text-base text-sunset-muted leading-relaxed font-normal">
              {listing.description}
            </p>

            <div className="pt-4 border-t border-sunset-border flex items-center gap-3 text-xs text-sunset-accent bg-sunset-accent/10 p-3.5 rounded-xl border border-sunset-accent/20">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-sunset-accent" />
              <span>Verified Local Information: Coordinates and schedule mapped directly from official tourism and municipal records.</span>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sunset-border space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sunset-accent/10 border border-sunset-accent/20 flex items-center justify-center text-sunset-accent">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-sunset-text">{t('listingDetail.reviewsTitle')}</h3>
                  <p className="text-xs text-sunset-muted">{reviews.length} genuine community experiences</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sunset-accent text-lg font-bold">
                <Star className="w-5 h-5 fill-sunset-accent text-sunset-accent" />
                <span>{listing.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Write a review form */}
            <form onSubmit={handleSubmit(onReviewSubmit)} className="p-4 rounded-2xl bg-sunset-bg/60 border border-sunset-border space-y-3">
              <p className="text-xs font-semibold text-sunset-text">{t('listingDetail.writeReview')}</p>
              
              {/* Star selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-sunset-muted">{t('listingDetail.ratingLabel')}:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setValue('rating', s)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          s <= userRating ? 'fill-sunset-accent text-sunset-accent' : 'text-sunset-muted/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-sunset-accent ml-2">{userRating} / 5</span>
              </div>

              <textarea
                rows={3}
                {...register('comment')}
                placeholder="What was your experience with the heritage, ambience, or menu? Honest feedback only..."
                className="w-full glass-input rounded-xl p-3 text-xs leading-relaxed"
              />
              {reviewErrors.comment && (
                <p className="text-xs text-red-400">{reviewErrors.comment.message}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                {reviewSuccess ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Review published!
                  </span>
                ) : (
                  <span className="text-[11px] text-sunset-muted">Posting as {user?.name || 'Explorer'}</span>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-accent px-5 py-2 text-xs font-bold disabled:opacity-50"
                >
                  {submittingReview ? t('common.loading') : t('listingDetail.submitReview')}
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-sunset-bg/40 border border-sunset-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sunset-accent/20 text-sunset-accent font-bold flex items-center justify-center border border-sunset-accent/30 text-xs">
                        {rev.user_name ? rev.user_name[0] : 'U'}
                      </div>
                      <span className="font-semibold text-sunset-text">{rev.user_name || 'Verified Explorer'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sunset-accent">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-sunset-accent text-sunset-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-sunset-muted font-normal leading-relaxed">
                    {rev.comment}
                  </p>
                  <span className="text-[10px] text-sunset-muted/60 block">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Info & Map Card */}
        <div className="space-y-6">
          
          {/* Primary Quick Info Card */}
          <div className="glass-panel p-6 rounded-3xl border border-sunset-border space-y-6">
            <h3 className="text-lg font-bold font-serif text-sunset-text border-b border-sunset-border pb-3">
              Essential Details
            </h3>

            {/* Address */}
            <div className="space-y-1">
              <span className="text-xs text-sunset-muted flex items-center gap-1.5 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-sunset-accent" />
                {t('listingDetail.locationAddress')}
              </span>
              <p className="text-xs sm:text-sm text-sunset-text pl-5">
                {listing.address || '—'}
              </p>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <span className="text-xs text-sunset-muted flex items-center gap-1.5 font-semibold">
                <Phone className="w-3.5 h-3.5 text-sunset-accent" />
                Direct Telephone
              </span>
              <p className="text-xs sm:text-sm pl-5">
                {listing.phone && listing.phone !== '—' ? (
                  <a href={`tel:${listing.phone}`} className="text-sunset-accent hover:underline">
                    {listing.phone}
                  </a>
                ) : (
                  <span className="text-sunset-muted">—</span>
                )}
              </p>
            </div>

            {/* Website */}
            <div className="space-y-1">
              <span className="text-xs text-sunset-muted flex items-center gap-1.5 font-semibold">
                <Globe className="w-3.5 h-3.5 text-sunset-accent" />
                Official Website
              </span>
              <p className="text-xs sm:text-sm pl-5 truncate">
                {listing.website && listing.website !== '—' ? (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sunset-accent hover:underline truncate inline-block max-w-full"
                  >
                    {listing.website}
                  </a>
                ) : (
                  <span className="text-sunset-muted">—</span>
                )}
              </p>
            </div>

            {/* Price Level */}
            <div className="space-y-1">
              <span className="text-xs text-sunset-muted font-semibold pl-5">
                Price Range: <strong className="text-sunset-accent">{listing.price_level}</strong>
              </span>
            </div>

            {/* Get Directions Button */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full btn-accent py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Get Directions in Google Maps</span>
            </a>
          </div>

          {/* Interactive Map Card (MapLibre GL JS with Free OSM tiles) */}
          <div className="glass-panel p-5 rounded-3xl border border-sunset-border space-y-3">
            <h4 className="text-sm font-bold font-serif text-sunset-text flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sunset-accent" />
              <span>Geographic Position</span>
            </h4>
            
            <MapComponent
              center={[listing.lat, listing.lng]}
              zoom={14}
              className="h-64 w-full rounded-2xl"
              markers={[{
                id: listing.id,
                name: cleanName,
                lat: listing.lat,
                lng: listing.lng,
                category: listing.category
              }]}
            />

            <div className="text-[11px] text-sunset-muted flex justify-between pt-1">
              <span>Lat: {listing.lat.toFixed(4)}</span>
              <span>Lng: {listing.lng.toFixed(4)}</span>
            </div>
          </div>

          {/* Opening Hours Schedule */}
          <div className="glass-panel p-5 rounded-3xl border border-sunset-border space-y-3">
            <h4 className="text-sm font-bold font-serif text-sunset-text flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sunset-accent" />
              <span>Operating Hours</span>
            </h4>

            {listing.hours && Object.keys(listing.hours).length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {Object.entries(listing.hours).map(([day, time]) => (
                  <div key={day} className="flex justify-between py-1 border-b border-sunset-border/60 last:border-none">
                    <span className="text-sunset-muted">{day}</span>
                    <span className="font-semibold text-sunset-text">{time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sunset-muted pl-2">—</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
