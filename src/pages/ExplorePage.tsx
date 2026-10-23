import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { Listing, ListingCategory } from '../types';
import { useListings } from '../hooks/useListingsQuery';
import { ListingCard } from '../components/ListingCard';
import { SkeletonCard } from '../components/SkeletonCard';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as ListingCategory) || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [category, setCategory] = useState<ListingCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name' | 'price'>('rating');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  // TanStack Query for listings
  const { data: listings = [], isLoading: loading } = useListings({
    category,
    searchQuery,
    sortBy,
    area: areaFilter,
    priceLevel: priceFilter
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Sync category from URL if changes
  useEffect(() => {
    const urlCat = searchParams.get('category') as ListingCategory;
    if (urlCat && urlCat !== category) {
      setCategory(urlCat);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery, sortBy, areaFilter, priceFilter]);

  // Paginated items
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return listings.slice(start, start + ITEMS_PER_PAGE);
  }, [listings, currentPage]);

  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE) || 1;

  const categories = [
    { id: 'all', label: 'All Mumbai' },
    { id: 'hotels', label: 'Heritage Hotels' },
    { id: 'restaurants', label: 'Iconic Cafes' },
    { id: 'shops', label: 'Bazaars & Markets' },
    { id: 'attractions', label: 'Waterfronts & Sites' },
    { id: 'forts', label: 'Maratha Forts' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-sunset-text">
      
      {/* Page Title & Breadcrumb */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-sunset-accent uppercase tracking-widest font-serif">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Local Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-sunset-text">
          Explore Mumbai & Forts
        </h1>
        <p className="text-sm sm:text-base text-sunset-muted max-w-3xl">
          Browse authentic accommodations, culinary institutions, markets, and historic Sahyadri ramparts. Filter by area, price, or category.
        </p>
      </div>

      {/* Filter and Search Bar Control Box */}
      <div className="glass-panel p-5 rounded-2xl border border-sunset-border mb-8 space-y-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id as ListingCategory | 'all');
                setSearchParams(prev => {
                  if (c.id === 'all') prev.delete('category');
                  else prev.set('category', c.id);
                  return prev;
                });
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                category === c.id
                  ? 'btn-accent shadow-md scale-[1.02]'
                  : 'glass-panel text-sunset-muted hover:text-sunset-text border border-sunset-border'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search, Sort and Area Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-sunset-border">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
            <input
              type="text"
              placeholder="Search keyword or area..."
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
              <option value="rating" className="bg-sunset-bg text-sunset-text">Sort: Highest Rated</option>
              <option value="reviews" className="bg-sunset-bg text-sunset-text">Sort: Most Reviews</option>
              <option value="name" className="bg-sunset-bg text-sunset-text">Sort: Name (A-Z)</option>
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
              <option value="all" className="bg-sunset-bg text-sunset-text">All Mumbai Neighborhoods</option>
              <option value="Colaba" className="bg-sunset-bg text-sunset-text">Colaba</option>
              <option value="Fort" className="bg-sunset-bg text-sunset-text">Fort & Ballard Estate</option>
              <option value="Bandra" className="bg-sunset-bg text-sunset-text">Bandra West</option>
              <option value="Marine Drive" className="bg-sunset-bg text-sunset-text">Marine Drive</option>
              <option value="Tardeo" className="bg-sunset-bg text-sunset-text">Tardeo</option>
              <option value="Vasai" className="bg-sunset-bg text-sunset-text">Vasai / Palghar</option>
              <option value="Raigad" className="bg-sunset-bg text-sunset-text">Raigad Belt</option>
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
              setSearchParams({});
            }}
            className="h-11 px-4 glass-panel hover:border-sunset-accent text-sunset-muted hover:text-sunset-text text-xs font-semibold rounded-xl border border-sunset-border flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs text-sunset-muted mb-6">
        <span>
          Showing <strong className="text-sunset-text">{listings.length}</strong> verified Mumbai discoveries
        </span>
        {category !== 'all' && (
          <span className="capitalize text-sunset-accent font-semibold">
            Filtered by: {category}
          </span>
        )}
      </div>

      {/* Grid of Cards or Skeleton Loader */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : paginatedListings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-sunset-muted hover:text-sunset-text disabled:opacity-40 disabled:cursor-not-allowed border border-sunset-border"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === idx + 1
                        ? 'btn-accent shadow-md'
                        : 'glass-panel text-sunset-muted hover:text-sunset-text border border-sunset-border'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-sunset-muted hover:text-sunset-text disabled:opacity-40 disabled:cursor-not-allowed border border-sunset-border"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl border border-sunset-border space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sunset-accent/15 text-sunset-accent flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-sunset-text">No discoveries found</h3>
          <p className="text-xs text-sunset-muted max-w-md mx-auto">
            We couldn't find listings matching your filter criteria. Try clearing the search query or selecting "All Mumbai".
          </p>
          <button
            onClick={() => {
              setCategory('all');
              setSearchQuery('');
              setAreaFilter('all');
            }}
            className="btn-accent px-5 py-2.5 text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
};
