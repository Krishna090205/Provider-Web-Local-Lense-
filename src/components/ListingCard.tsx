import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowUpRight } from 'lucide-react';
import { Listing } from '../lib/types';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../features/i18n';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(listing.id);

  const coverPhoto = listing.photos?.find(p => p.is_cover)?.url ||
    listing.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80';

  const isSample = listing.name.includes('[Sample]');
  const displayName = listing.name.replace('[Sample]', '').trim();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  const categoryColors: Record<string, string> = {
    hotels: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    restaurants: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    shops: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    attractions: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    forts: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  };

  const categoryName = t(`categories.${listing.category}`) || listing.category;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col h-full relative border border-sunset-border">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-sunset-bg">
        <img
          src={coverPhoto}
          alt={displayName}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Subtle Dark Gradient Overlay for readability on images */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-auto gap-2">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 pr-1">
            <span className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold capitalize border backdrop-blur-md truncate max-w-full ${categoryColors[listing.category] || 'bg-black/60 text-white'}`}>
              {categoryName}
            </span>
            {isSample && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sunset-accent text-sunset-on-accent uppercase tracking-wider flex-shrink-0">
                {t('listingCard.sampleBadge')}
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-90 flex-shrink-0"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorited ? 'fill-red-500 text-red-500 scale-110' : 'text-white hover:text-red-400'
              }`}
            />
          </button>
        </div>

        {/* Price level badge on bottom right */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-sunset-accent">
          {listing.price_level}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Area & Rating */}
        <div className="flex items-center justify-between gap-2 text-xs text-sunset-muted mb-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <MapPin className="w-3.5 h-3.5 text-sunset-accent flex-shrink-0" />
            <span className="truncate">{listing.area}</span>
          </div>

          <div className="flex items-center gap-1 bg-sunset-accent/15 border border-sunset-accent/25 px-2 py-0.5 rounded text-sunset-accent font-semibold flex-shrink-0">
            <Star className="w-3 h-3 fill-sunset-accent text-sunset-accent" />
            <span>{listing.rating.toFixed(1)}</span>
            <span className="text-[10px] text-sunset-muted font-normal">({listing.review_count})</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/listings/${listing.id}`} className="group-hover:text-sunset-accent transition-colors block">
          <h3 className="text-base sm:text-lg font-bold text-sunset-text line-clamp-1 mb-2 font-serif break-words">
            {displayName}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-sunset-muted line-clamp-2 leading-relaxed mb-4 flex-1">
          {listing.description}
        </p>

        {/* Footer Details & Explore link */}
        <div className="pt-3 border-t border-sunset-border flex items-center justify-between gap-2 mt-auto">
          <span className="text-[11px] text-sunset-muted truncate">
            {listing.hours?.["Monday"] ? `Mon: ${listing.hours["Monday"]}` : 'Verified Schedule'}
          </span>

          <Link
            to={`/listings/${listing.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sunset-accent hover:underline group/link flex-shrink-0"
          >
            <span>{t('listingCard.viewDetails')}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
