import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, SlidersHorizontal, MapPin, Sparkles, RefreshCw,
  LayoutGrid, Columns2, Landmark, Shield, Utensils, ShoppingBag, Hotel,
  Compass, Star, Navigation, Train, Eye
} from 'lucide-react';
import { Listing, ListingCategory } from '../types';
import { useListings } from '../hooks/useListingsQuery';
import { getExplorePriority } from '../lib/store';
import { useLanguage } from '../features/i18n';
import { ListingCard } from '../components/ListingCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { MapComponent } from '../components/MapComponent';

// Haversine distance calculator in kilometers
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const ExplorePage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as ListingCategory) || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [category, setCategory] = useState<ListingCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name' | 'price'>('rating');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [showMapPreview, setShowMapPreview] = useState<boolean>(false);
  const [onlyMuseums, setOnlyMuseums] = useState<boolean>(false);
  const [selectedSpotlightId, setSelectedSpotlightId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setHasLocationPermission(true);
        },
        () => {
          setHasLocationPermission(false);
        },
        { timeout: 6000, maximumAge: 600000 }
      );
    }
  }, []);

  // TanStack Query for listings: all experiences fetched for Explore page
  const { data: rawListings = [], isLoading: loading } = useListings({
    category,
    searchQuery,
    sortBy,
    area: areaFilter,
    priceLevel: priceFilter,
  });

  // Priority-ordered listings across the complete dataset before pagination:
  // Priority 1: image_note === 'Verified exact match' (appears first)
  // Priority 2: other Wikimedia Commons & verification notes, plus null/empty/unexpected notes (appears second)
  // Priority 3: Wikimedia Commons - Red Fort, Delhi representative-photo notes (appears last)
  const listings = useMemo(() => {
    let list = rawListings;
    if (onlyMuseums) {
      list = list.filter(item => 
        item.name.toLowerCase().includes('museum') || 
        item.description.toLowerCase().includes('museum') ||
        item.description.toLowerCase().includes('gallery') ||
        item.name.toLowerCase().includes('gallery')
      );
    }

    return [...list].sort((a, b) => {
      const priorityA = getExplorePriority(a.image_note);
      const priorityB = getExplorePriority(b.image_note);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'reviews') {
        return b.review_count - a.review_count;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        const priceA = parseFloat(a.price_level.replace(/[^\d.]/g, '')) || 0;
        const priceB = parseFloat(b.price_level.replace(/[^\d.]/g, '')) || 0;
        return priceA - priceB;
      }
      return 0;
    });
  }, [rawListings, onlyMuseums, sortBy]);

  // Convert listings into markers for MapComponent
  const mapMarkers = useMemo(() => {
    return listings.map(l => ({
      id: l.id,
      name: l.name.replace('[Sample]', '').trim(),
      lat: l.lat,
      lng: l.lng,
      category: l.category
    }));
  }, [listings]);

  // Active spotlight destination for split view (defaults to top-ranked verified destination)
  const activeSpotlightListing = useMemo(() => {
    if (selectedSpotlightId) {
      const found = listings.find(l => l.id === selectedSpotlightId);
      if (found) return found;
    }
    return listings[0] || null;
  }, [selectedSpotlightId, listings]);

  // Pagination (12 items per page for expansive exploration)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12;

  // Sync category from URL if changes
  useEffect(() => {
    const urlCat = searchParams.get('category') as ListingCategory;
    if (urlCat && urlCat !== category) {
      setCategory(urlCat);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery, sortBy, areaFilter, priceFilter, onlyMuseums]);

  // Paginated items
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return listings.slice(start, start + ITEMS_PER_PAGE);
  }, [listings, currentPage]);

  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE) || 1;

  // Smart pagination items calculation (e.g., 1, 2, ..., totalPages with sliding window)
  const paginationItems = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 1;
    const range: (number | string)[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);

    if (left > 2) {
      range.push('...');
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) {
      range.push('...');
    }

    range.push(totalPages);
    return range;
  }, [currentPage, totalPages]);

  const categories = [
    { id: 'all', label: t('explore.allPlaces'), icon: Compass },
    { id: 'attractions', label: t('explore.museumsLandmarks'), icon: Landmark },
    { id: 'forts', label: t('explore.maharashtraForts'), icon: Shield },
    { id: 'hotels', label: t('explore.heritageHotels'), icon: Hotel },
    { id: 'restaurants', label: t('explore.iconicFood'), icon: Utensils },
    { id: 'shops', label: t('explore.historicBazaars'), icon: ShoppingBag },
  ];

  const renderSpotlight = () => {
    if (!selectedSpotlightId || !activeSpotlightListing) return null;
    return (
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-sunset-border shadow-lg animate-fade-in flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <img
            src={activeSpotlightListing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80'}
            alt={activeSpotlightListing.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0 border border-sunset-border"
          />
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold font-serif text-sunset-text truncate">
                {activeSpotlightListing.name.replace('[Sample]', '').trim()}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-sunset-accent/15 text-sunset-accent">
                {activeSpotlightListing.category}
              </span>
              {activeSpotlightListing.image_note === 'Verified exact match' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  ✓ Exact Match
                </span>
              )}
            </div>
            <p className="text-xs text-sunset-muted truncate">
              {activeSpotlightListing.area} • {activeSpotlightListing.price_level} • ⭐ {activeSpotlightListing.rating.toFixed(1)} ({activeSpotlightListing.review_count} reviews)
            </p>
            <p className="text-[11px] text-sunset-muted line-clamp-1">
              {activeSpotlightListing.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            to={`/listings/${activeSpotlightListing.id}`}
            className="btn-accent px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 flex-1 md:flex-initial shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${activeSpotlightListing.lat},${activeSpotlightListing.lng}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 glass-panel hover:border-sunset-accent text-sunset-text text-xs font-semibold rounded-xl border border-sunset-border flex items-center gap-1.5 transition-colors"
            title="Get Directions in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 text-sunset-accent" />
            <span>Directions</span>
          </a>
          <button
            type="button"
            onClick={() => setSelectedSpotlightId(null)}
            className="px-3 py-2 text-xs text-sunset-muted hover:text-sunset-text glass-panel rounded-xl border border-sunset-border"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => {
            setCurrentPage(prev => Math.max(1, prev - 1));
            window.scrollTo({ top: 200, behavior: 'smooth' });
          }}
          className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-sunset-muted hover:text-sunset-text disabled:opacity-40 disabled:cursor-not-allowed border border-sunset-border transition-all"
          aria-label="Previous page"
        >
          ←
        </button>

        <div className="flex items-center gap-1.5">
          {paginationItems.map((item, idx) => (
            item === '...' ? (
              <span
                key={`dots-${idx}`}
                className="w-8 text-center text-sunset-muted font-bold select-none text-xs"
              >
                …
              </span>
            ) : (
              <button
                key={`page-${item}`}
                onClick={() => {
                  setCurrentPage(Number(item));
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === item
                    ? 'btn-accent shadow-md scale-105'
                    : 'glass-panel text-sunset-muted hover:text-sunset-text border border-sunset-border'
                }`}
              >
                {item}
              </button>
            )
          ))}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => {
            setCurrentPage(prev => Math.min(totalPages, prev + 1));
            window.scrollTo({ top: 200, behavior: 'smooth' });
          }}
          className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-sunset-muted hover:text-sunset-text disabled:opacity-40 disabled:cursor-not-allowed border border-sunset-border transition-all"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    );
  };

  const renderNoResults = () => (
    <div className="glass-panel p-12 text-center rounded-3xl border border-sunset-border space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-sunset-accent/15 text-sunset-accent flex items-center justify-center mx-auto">
        <Filter className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold font-serif text-sunset-text">{t('explore.noResults')}</h3>
      <p className="text-xs text-sunset-muted max-w-md mx-auto">
        {t('explore.noResultsDesc')}
      </p>
      <button
        onClick={() => {
          setCategory('all');
          setSearchQuery('');
          setSortBy('rating');
          setAreaFilter('all');
          setPriceFilter('all');
          setOnlyMuseums(false);
          setSearchParams({});
        }}
        className="btn-accent px-5 py-2.5 text-xs font-bold"
      >
        {t('explore.resetFilters')}
      </button>
    </div>
  );

  // Compact Explore Nearby experiences computation
  const nearbyExperiences = useMemo(() => {
    if (!rawListings || rawListings.length === 0) return [];

    // Reference location: user coordinates if available -> otherwise active spotlight -> otherwise area/Mumbai center
    const refLat = userCoords ? userCoords.lat : (activeSpotlightListing?.lat || 18.94);
    const refLng = userCoords ? userCoords.lng : (activeSpotlightListing?.lng || 72.84);

    // Filter out the active spotlight listing if selected to avoid duplication
    let candidates = rawListings.filter(l => l.id !== selectedSpotlightId);

    // If no user location permission and a specific area is filtered, prioritize experiences in that area
    if (!userCoords && areaFilter !== 'all') {
      const areaMatches = candidates.filter(l => l.area.toLowerCase() === areaFilter.toLowerCase());
      if (areaMatches.length >= 2) {
        candidates = areaMatches;
      }
    }

    const withDist = candidates.map(item => ({
      item,
      distKm: getDistanceKm(refLat, refLng, item.lat, item.lng),
    }));

    withDist.sort((a, b) => a.distKm - b.distKm);

    return withDist.slice(0, 4).map(x => ({
      ...x.item,
      distanceKm: x.distKm,
    }));
  }, [rawListings, userCoords, activeSpotlightListing, selectedSpotlightId, areaFilter]);

  const categoryColors: Record<string, string> = {
    hotels: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    restaurants: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    shops: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    attractions: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    forts: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  };

  const renderExploreNearby = () => {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-sunset-border shadow-sm space-y-3 animate-fade-in">
        <div className="flex items-center justify-between gap-2 border-b border-sunset-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sunset-accent" />
            <h4 className="font-serif font-bold text-sm text-sunset-text">Explore Nearby</h4>
            {hasLocationPermission && (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Near You
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setAreaFilter('all');
              setSearchQuery('');
              setPriceFilter('all');
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="text-[11px] text-sunset-accent hover:underline font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All Experiences</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-sunset-bg/40 border border-sunset-border animate-pulse">
                <div className="w-14 h-14 rounded-lg bg-sunset-border/60 flex-shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3 w-3/4 bg-sunset-border/60 rounded" />
                  <div className="h-2.5 w-1/2 bg-sunset-border/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : nearbyExperiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
            {nearbyExperiences.map((place) => {
              const coverPhoto = place.photos?.find(p => p.is_cover)?.url ||
                place.photos?.[0]?.url ||
                'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80';
              const badgeStyle = categoryColors[place.category] || 'bg-sunset-accent/15 text-sunset-accent border-sunset-accent/30';

              return (
                <Link
                  key={`nearby-${place.id}`}
                  to={`/listings/${place.id}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-sunset-bg/50 hover:bg-sunset-bg hover:border-sunset-accent/40 border border-sunset-border transition-all group"
                >
                  <img
                    src={coverPhoto}
                    alt={place.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-sunset-border group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold font-serif text-sunset-text truncate group-hover:text-sunset-accent transition-colors">
                        {place.name.replace('[Sample]', '').trim()}
                      </h5>
                      {place.rating > 0 && (
                        <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-0.5 flex-shrink-0">
                          ⭐ {place.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-sunset-muted mt-0.5">
                      <span className="truncate">{place.area}</span>
                      {place.category && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold capitalize ${badgeStyle}`}>
                          {t(`categories.${place.category}`) || place.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 text-[10px] mt-0.5">
                      {place.price_level ? (
                        <span className="text-sunset-accent font-medium">{place.price_level}</span>
                      ) : (
                        <span />
                      )}
                      {hasLocationPermission && (
                        <span className="text-sunset-muted/70">{place.distanceKm.toFixed(1)} km</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center rounded-xl bg-sunset-bg/40 border border-sunset-border text-xs text-sunset-muted">
            No nearby experiences found.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] w-full mx-auto text-sunset-text transition-colors duration-200">
      
      {/* Page Title & Breadcrumb */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sunset-accent uppercase tracking-widest font-serif">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('explore.directoryBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-sunset-text">
            {t('explore.title')}
          </h1>
          <p className="text-sm sm:text-base text-sunset-muted max-w-3xl">
            {t('explore.subtitle')}
          </p>
        </div>

        {/* View Mode Switcher (Grid vs Split View) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-sunset-border w-fit self-start md:self-auto shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            title={t('explore.viewGrid')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'btn-accent shadow-md'
                : 'text-sunset-muted hover:text-sunset-text'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('explore.viewGrid')}</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            title={t('explore.viewSplit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'split'
                ? 'btn-accent shadow-md'
                : 'text-sunset-muted hover:text-sunset-text'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{t('explore.viewSplit')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Control Box */}
      <div className="glass-panel p-5 rounded-2xl border border-sunset-border mb-8 space-y-4 shadow-sm">
        
        {/* Category Pills & Museum Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none w-full sm:flex-1 -mx-1 px-1">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = category === c.id && !onlyMuseums;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setOnlyMuseums(false);
                    setCategory(c.id as ListingCategory | 'all');
                    setSearchParams(prev => {
                      if (c.id === 'all') prev.delete('category');
                      else prev.set('category', c.id);
                      return prev;
                    });
                  }}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isSelected
                      ? 'btn-accent shadow-md scale-[1.02]'
                      : 'glass-panel text-sunset-muted hover:text-sunset-text border border-sunset-border hover:border-sunset-accent/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Museum Filter Button */}
          <button
            onClick={() => {
              setOnlyMuseums(!onlyMuseums);
              if (!onlyMuseums) {
                setCategory('attractions');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border whitespace-nowrap self-start sm:self-auto flex-shrink-0 ${
              onlyMuseums
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                : 'glass-panel text-sunset-accent border-sunset-accent/30 hover:border-sunset-accent'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>🏛️ {t('explore.onlyMuseums')} ({rawListings.filter(l => l.name.toLowerCase().includes('museum') || l.description.toLowerCase().includes('museum') || l.name.toLowerCase().includes('gallery')).length})</span>
          </button>
        </div>

        {/* Search, Sort and Area Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-sunset-border">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
            <input
              type="text"
              placeholder={t('explore.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 glass-input rounded-xl text-xs"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              aria-label="Sort listings by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews' | 'name' | 'price')}
              className="w-full h-11 px-3 glass-input rounded-xl text-xs cursor-pointer"
            >
              <option value="rating" className="bg-sunset-surface text-sunset-text">{t('explore.sortHighestRated')}</option>
              <option value="reviews" className="bg-sunset-surface text-sunset-text">{t('explore.sortMostReviews')}</option>
              <option value="name" className="bg-sunset-surface text-sunset-text">{t('explore.sortName')}</option>
            </select>
          </div>

          {/* Area Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Area"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full h-11 px-3 glass-input rounded-xl text-xs cursor-pointer"
            >
              <option value="all" className="bg-sunset-surface text-sunset-text">{t('explore.allRegions')}</option>
              <option value="Colaba" className="bg-sunset-surface text-sunset-text">Colaba (South Mumbai)</option>
              <option value="Fort" className="bg-sunset-surface text-sunset-text">Fort & Kala Ghoda (Museums)</option>
              <option value="Byculla" className="bg-sunset-surface text-sunset-text">Byculla (Bhau Daji Lad Museum)</option>
              <option value="Bandra" className="bg-sunset-surface text-sunset-text">Bandra West & Promenade</option>
              <option value="Marine Drive" className="bg-sunset-surface text-sunset-text">Marine Drive Waterfront</option>
              <option value="Tardeo" className="bg-sunset-surface text-sunset-text">Tardeo</option>
              <option value="Vasai" className="bg-sunset-surface text-sunset-text">Vasai / Palghar Citadel</option>
              <option value="Raigad" className="bg-sunset-surface text-sunset-text">Raigad & Sahyadri Fortress Belt</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setSearchQuery('');
              setSortBy('rating');
              setAreaFilter('all');
              setPriceFilter('all');
              setOnlyMuseums(false);
              setSearchParams({});
            }}
            className="h-11 px-4 glass-panel hover:border-sunset-accent text-sunset-muted hover:text-sunset-text text-xs font-semibold rounded-xl border border-sunset-border flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('explore.resetFilters')}</span>
          </button>
        </div>
      </div>

      {/* Results Count & Action Controls */}
      <div className="flex flex-wrap justify-between items-center text-xs text-sunset-muted mb-6 gap-3">
        <div className="flex items-center gap-3">
          <span>
            {t('explore.showingPlaces', { count: listings.length })}
          </span>
          {viewMode === 'grid' && (
            <button
              type="button"
              onClick={() => setShowMapPreview(!showMapPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                showMapPreview
                  ? 'bg-sunset-accent text-sunset-on-accent border-sunset-accent shadow-sm'
                  : 'glass-panel text-sunset-muted hover:text-sunset-text border-sunset-border'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{showMapPreview ? 'Hide Map Overview' : 'Show Map Overview'}</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onlyMuseums && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
              🏛️ {t('explore.museumsFilterActive')}
            </span>
          )}
          {category !== 'all' && (
            <span className="capitalize text-sunset-accent font-semibold">
              {t('explore.categoryLabel')}: {t(`categories.${category}`) || category}
            </span>
          )}
        </div>
      </div>

      {/* Main View Content: Split View or Full-Width Grid */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-fade-in">
          {/* Left Side: Datas (Experience Cards) */}
          <div className="lg:col-span-7 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-fade-in">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : paginatedListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-fade-in">
                  {paginatedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              renderNoResults()
            )}
          </div>

          {/* Right Side: Interactive Map & Explore Nearby */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-none pb-2">
            <div className="glass-panel p-3.5 sm:p-4 rounded-3xl border border-sunset-border shadow-lg space-y-2.5">
              <MapComponent
                center={activeSpotlightListing ? [activeSpotlightListing.lat, activeSpotlightListing.lng] : [18.94, 72.84]}
                zoom={activeSpotlightListing ? 14 : 11}
                className="h-[360px] sm:h-[400px] lg:h-[420px] w-full rounded-2xl"
                markers={mapMarkers}
                onMarkerClick={(m) => setSelectedSpotlightId(m.id)}
              />

              <div className="flex flex-wrap items-center justify-between text-xs text-sunset-muted px-2 pt-1 gap-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sunset-accent" />
                  <strong className="text-sunset-text">{mapMarkers.length}</strong> Plotted Destinations
                </span>
                <span className="text-[11px] bg-sunset-accent/10 text-sunset-accent px-2.5 py-0.5 rounded-full border border-sunset-accent/20">
                  Click any marker to inspect
                </span>
              </div>
            </div>

            {/* Destination Spotlight Banner (when a marker is clicked in split view) */}
            {selectedSpotlightId && activeSpotlightListing && renderSpotlight()}

            {/* Compact Explore Nearby Section below the map */}
            {renderExploreNearby()}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Optional Map Preview Canvas in Grid Mode */}
          {showMapPreview && (
            <div className="space-y-4 animate-fade-in mb-8">
              <div className="glass-panel p-3.5 sm:p-4 rounded-3xl border border-sunset-border shadow-lg space-y-2.5">
                <MapComponent
                  center={activeSpotlightListing ? [activeSpotlightListing.lat, activeSpotlightListing.lng] : [18.94, 72.84]}
                  zoom={activeSpotlightListing ? 14 : 11}
                  className="h-[360px] sm:h-[420px] w-full rounded-2xl"
                  markers={mapMarkers}
                  onMarkerClick={(m) => setSelectedSpotlightId(m.id)}
                />

                <div className="flex flex-wrap items-center justify-between text-xs text-sunset-muted px-2 pt-1 gap-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sunset-accent" />
                    <strong className="text-sunset-text">{mapMarkers.length}</strong> Plotted Destinations
                  </span>
                  <span className="text-[11px] bg-sunset-accent/10 text-sunset-accent px-2.5 py-0.5 rounded-full border border-sunset-accent/20">
                    Click any marker to inspect destination details
                  </span>
                </div>
              </div>

              {selectedSpotlightId && activeSpotlightListing && renderSpotlight()}

              {/* Compact Explore Nearby Section below preview map */}
              {renderExploreNearby()}
            </div>
          )}

          {/* Main Experience Cards Grid (Full-Width Responsive 3-4 Columns on Desktop) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 animate-fade-in">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : paginatedListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 animate-fade-in">
                {paginatedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            renderNoResults()
          )}
        </div>
      )}

      {/* Transit & Explorer Insights (Full-Width Bottom Banner) */}
      <div className="mt-16 glass-panel p-5 sm:p-6 rounded-3xl border border-sunset-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sunset-border pb-3">
          <span className="font-serif font-bold text-sm sm:text-base text-sunset-text flex items-center gap-2">
            <Train className="w-4 h-4 text-cyan-400" />
            <span>Mumbai Transit & Explorer Notes</span>
          </span>
          <span className="text-xs text-sunset-muted">Verified Guidelines for Navigating Mumbai</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-sunset-bg/60 border border-sunset-border space-y-1">
            <span className="text-xs font-bold text-sunset-text block">🚆 Local Trains (Lifeline of Mumbai)</span>
            <p className="text-xs text-sunset-muted leading-relaxed">
              Western Line connects Churchgate to Fort, Marine Drive & Bandra. Central Line connects CSMT to Dadar & Ghatkopar.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sunset-bg/60 border border-sunset-border space-y-1">
            <span className="text-xs font-bold text-sunset-text block">🚕 Kaali-Peeli Metered Taxis</span>
            <p className="text-xs text-sunset-muted leading-relaxed">
              Flag fall starts at ₹28. Ideal for hopping between Colaba Art Deco, Kala Ghoda galleries, and Marine Drive.
            </p>
          </div>
        </div>

        {/* Quick Region Filters */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-sunset-muted uppercase font-bold tracking-wider font-serif mr-1">
            Quick Region Filters:
          </span>
          {['Colaba', 'Fort', 'Marine Drive', 'Bandra', 'Byculla'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setAreaFilter(areaFilter === r ? 'all' : r)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                areaFilter === r
                  ? 'bg-sunset-accent text-sunset-on-accent border-sunset-accent shadow-sm'
                  : 'bg-sunset-bg/70 text-sunset-muted hover:text-sunset-text border-sunset-border'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ExplorePage;
