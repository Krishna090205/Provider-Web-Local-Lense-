import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, SlidersHorizontal, MapPin, Sparkles, RefreshCw,
  LayoutGrid, Map as MapIcon, Landmark, Shield, Utensils, ShoppingBag, Hotel,
  Compass, Star, Navigation, Train, Eye
} from 'lucide-react';
import { Listing, ListingCategory } from '../types';
import { useListings } from '../hooks/useListingsQuery';
import { getImageNoteTier } from '../lib/store';
import { useLanguage } from '../features/i18n';
import { ListingCard } from '../components/ListingCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { MapComponent } from '../components/MapComponent';

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
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('grid');
  const [onlyMuseums, setOnlyMuseums] = useState<boolean>(false);
  const [selectedSpotlightId, setSelectedSpotlightId] = useState<string | null>(null);

  // TanStack Query for listings
  const { data: rawListings = [], isLoading: loading } = useListings({
    category,
    searchQuery,
    sortBy,
    area: areaFilter,
    priceLevel: priceFilter
  });

  // Client-side quick filter for museums if toggled, prioritized by image_note tier
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
      const tierA = getImageNoteTier(a.image_note);
      const tierB = getImageNoteTier(b.image_note);
      if (tierA !== tierB) {
        return tierA - tierB;
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

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-sunset-text transition-colors duration-200">
      
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

        {/* View Mode Switcher (Grid vs Interactive Map) */}
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
            className={`hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'split'
                ? 'btn-accent shadow-md'
                : 'text-sunset-muted hover:text-sunset-text'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('explore.viewSplit')}</span>
          </button>

          <button
            onClick={() => setViewMode('map')}
            title={t('explore.viewMap')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'btn-accent shadow-md'
                : 'text-sunset-muted hover:text-sunset-text'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t('explore.viewMap')}</span>
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

      {/* Results Count & Current Filter Label */}
      <div className="flex flex-wrap justify-between items-center text-xs text-sunset-muted mb-6 gap-2">
        <span>
          {t('explore.showingPlaces', { count: listings.length })}
        </span>
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

      {/* 1. MAP-ONLY VIEW */}
      {viewMode === 'map' && (
        <div className="space-y-4 animate-fade-in mb-10">
          <div className="glass-panel p-4 rounded-3xl border border-sunset-border">
            <MapComponent
              center={[18.94, 72.84]}
              zoom={11}
              className="h-[600px] w-full rounded-2xl"
              markers={mapMarkers}
            />
          </div>
          <p className="text-xs text-sunset-muted text-center">
            {t('explore.mapHint')}
          </p>
        </div>
      )}

      {/* 2. SPLIT VIEW (Cards + Live Interactive Map) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12 animate-fade-in">
          {/* Left: Cards List (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : paginatedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedSpotlightId(listing.id)}
                    className={`transition-all rounded-3xl ${
                      activeSpotlightListing?.id === listing.id
                        ? 'ring-2 ring-sunset-accent shadow-xl scale-[1.01]'
                        : ''
                    }`}
                  >
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-8 text-center rounded-2xl border border-sunset-border text-sunset-muted text-xs">
                {t('explore.noResults')}
              </div>
            )}
          </div>

          {/* Right: Sticky Interactive Map (5 Cols) + Destination Spotlight & Transit Insights (Fills empty space) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            
            {/* Interactive Map Card */}
            <div className="glass-panel p-2.5 rounded-3xl border border-sunset-border shadow-xl space-y-2">
              <MapComponent
                center={activeSpotlightListing ? [activeSpotlightListing.lat, activeSpotlightListing.lng] : [18.94, 72.84]}
                zoom={activeSpotlightListing ? 14 : 11}
                className="h-[320px] sm:h-[360px] w-full rounded-2xl"
                markers={mapMarkers}
                onMarkerClick={(m) => setSelectedSpotlightId(m.id)}
              />

              <div className="flex items-center justify-between text-[11px] text-sunset-muted px-2 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sunset-accent" />
                  <strong className="text-sunset-text">{mapMarkers.length}</strong> Plotted Destinations
                </span>
                <span className="text-[10px] bg-sunset-accent/10 text-sunset-accent px-2 py-0.5 rounded-full border border-sunset-accent/20">
                  Click any marker or card to inspect
                </span>
              </div>
            </div>

            {/* 1. Selected Destination Spotlight Card */}
            {activeSpotlightListing && (
              <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-sunset-border shadow-lg space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs border-b border-sunset-border pb-2.5">
                  <div className="flex items-center gap-1.5 text-sunset-accent font-serif font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedSpotlightId ? 'Selected Destination Spotlight' : 'Curator Spotlight Recommendation'}</span>
                  </div>
                  {activeSpotlightListing.image_note === 'Verified exact match' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      ✓ Exact Match
                    </span>
                  )}
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-sunset-border flex-shrink-0 bg-sunset-bg">
                    <img
                      src={activeSpotlightListing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80'}
                      alt={activeSpotlightListing.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-black/75 backdrop-blur-sm text-sunset-accent">
                      {activeSpotlightListing.category}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm sm:text-base font-bold font-serif text-sunset-text truncate">
                      {activeSpotlightListing.name.replace('[Sample]', '').trim()}
                    </h4>
                    
                    <p className="text-xs text-sunset-muted flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-sunset-accent flex-shrink-0" />
                      <span>{activeSpotlightListing.area} • Mumbai</span>
                    </p>

                    <div className="flex items-center gap-2 pt-0.5 text-xs">
                      <span className="flex items-center gap-1 text-sunset-accent font-semibold">
                        <Star className="w-3.5 h-3.5 fill-sunset-accent" />
                        <span>{activeSpotlightListing.rating.toFixed(1)}</span>
                        <span className="text-sunset-muted text-[10px]">({activeSpotlightListing.review_count})</span>
                      </span>
                      <span className="text-sunset-muted font-normal">•</span>
                      <span className="font-semibold text-sunset-text text-xs">
                        {activeSpotlightListing.price_level}
                      </span>
                    </div>

                    <p className="text-[11px] text-sunset-muted line-clamp-2 leading-relaxed pt-0.5">
                      {activeSpotlightListing.description}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to={`/listings/${activeSpotlightListing.id}`}
                    className="flex-1 btn-accent py-2 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Destination</span>
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
                </div>
              </div>
            )}

            {/* 2. Transit & Heritage Insights Widget */}
            <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-sunset-border space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-sunset-border pb-2">
                <span className="font-serif font-bold text-sunset-text flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mumbai Transit & Explorer Notes</span>
                </span>
                <span className="text-[10px] text-sunset-muted">Verified Guidelines</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-sunset-bg/60 border border-sunset-border space-y-0.5">
                  <span className="text-[11px] font-bold text-sunset-text block">🚆 Local Trains (Lifeline of Mumbai)</span>
                  <p className="text-[11px] text-sunset-muted leading-relaxed">
                    Western Line connects Churchgate to Fort, Marine Drive & Bandra. Central Line connects CSMT to Dadar & Ghatkopar.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-sunset-bg/60 border border-sunset-border space-y-0.5">
                  <span className="text-[11px] font-bold text-sunset-text block">🚕 Kaali-Peeli Metered Taxis</span>
                  <p className="text-[11px] text-sunset-muted leading-relaxed">
                    Flag fall starts at ₹28. Ideal for hopping between Colaba Art Deco, Kala Ghoda galleries, and Marine Drive.
                  </p>
                </div>
              </div>

              {/* Popular Area Quick Jump Pills */}
              <div className="pt-1">
                <span className="text-[10px] text-sunset-muted uppercase font-bold tracking-wider block mb-1.5 font-serif">
                  Quick Region Filters
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Colaba', 'Fort', 'Marine Drive', 'Bandra', 'Byculla'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAreaFilter(areaFilter === r ? 'all' : r)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
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

          </div>
        </div>
      )}

      {/* 3. STANDARD GRID VIEW */}
      {viewMode === 'grid' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : paginatedListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
                {paginatedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
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
              )}
            </>
          ) : (
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
                  setAreaFilter('all');
                  setOnlyMuseums(false);
                }}
                className="btn-accent px-5 py-2.5 text-xs font-bold"
              >
                {t('explore.resetFilters')}
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default ExplorePage;
