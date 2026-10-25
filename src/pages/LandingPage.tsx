import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Hotel, Utensils, ShoppingBag, Landmark, Shield, Sparkles, ArrowRight, Star } from 'lucide-react';
import { Listing, ListingCategory } from '../types';
import { useListings } from '../hooks/useListingsQuery';
import { useLanguage } from '../features/i18n';
import { ListingCard } from '../components/ListingCard';
import { SkeletonCard } from '../components/SkeletonCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'all'>('all');

  // Featured listings state via TanStack Query
  const { data: allListings = [], isLoading: loading } = useListings();
  const featured = allListings.filter((l) => l.featured).slice(0, 6);
  const featuredListings = featured.length > 0 ? featured : allListings.slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(`/explore?${params.toString()}`);
  };

  const categories = [
    { id: 'hotels', name: t('categories.hotels'), icon: Hotel, count: t('categories.hotelsCount'), desc: t('categories.hotelsDesc') },
    { id: 'restaurants', name: t('categories.restaurants'), icon: Utensils, count: t('categories.restaurantsCount'), desc: t('categories.restaurantsDesc') },
    { id: 'shops', name: t('categories.shops'), icon: ShoppingBag, count: t('categories.shopsCount'), desc: t('categories.shopsDesc') },
    { id: 'attractions', name: t('categories.attractions'), icon: Landmark, count: t('categories.attractionsCount'), desc: t('categories.attractionsDesc') },
    { id: 'forts', name: t('categories.forts'), icon: Shield, count: t('categories.fortsCount'), desc: t('categories.fortsDesc') },
  ];

  return (
    <div className="relative min-h-screen text-sunset-text flex flex-col bg-sunset-bg">
      
      {/* =========================================================================
          HERO SECTION: LIGHTWEIGHT, THEME-AWARE SUNSET MUMBAI
         ========================================================================= */}
      <section
        className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 overflow-hidden"
      >
        {/* Still Sunset-toned Mumbai Photo Background with theme-aware overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=2000&q=80"
            alt="Gateway of India Mumbai Sunset Horizon"
            className="w-full h-full object-cover object-center filter brightness-100 contrast-[1.12] saturate-[1.15] transition-all duration-700"
          />
          {/* Gentle radial vignette */}
          <div className="absolute inset-0 hero-vignette" />
          
          {/* Subtle bottom transition to next section that leaves the Gateway clear */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-sunset-bg via-sunset-bg/40 to-transparent" />
        </div>

        {/* Hero Interactive Content */}
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in relative z-10 w-full mt-4 sm:mt-0">
          
          {/* Authentic Local Verification Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-sunset-accent text-xs font-semibold uppercase tracking-widest shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-sunset-accent animate-pulse" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Grand Headline with Sunset Gradient */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-serif leading-[1.15] cinematic-glow px-2">
            {t('hero.titleLine1')} <br className="hidden sm:inline" />
            <span className="headline-gradient">
              {t('hero.titleLine2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base md:text-lg text-sunset-text max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-[0_1px_3px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] px-2">
            {t('hero.subtitle')}
          </p>

          {/* Search Form with Category Selector */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-3xl mx-auto glass-panel p-2.5 sm:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 sm:gap-2.5"
          >
            {/* Category Selector */}
            <div className="relative w-full md:w-48 flex-shrink-0">
              <select
                aria-label="Filter by Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ListingCategory | 'all')}
                className="w-full h-11 sm:h-12 glass-input rounded-xl px-3.5 text-xs sm:text-sm font-medium cursor-pointer"
              >
                <option value="all" className="bg-sunset-bg text-sunset-text">{t('categories.all')}</option>
                <option value="hotels" className="bg-sunset-bg text-sunset-text">{t('categories.hotels')}</option>
                <option value="restaurants" className="bg-sunset-bg text-sunset-text">{t('categories.restaurants')}</option>
                <option value="shops" className="bg-sunset-bg text-sunset-text">{t('categories.shops')}</option>
                <option value="attractions" className="bg-sunset-bg text-sunset-text">{t('categories.attractions')}</option>
                <option value="forts" className="bg-sunset-bg text-sunset-text">{t('categories.forts')}</option>
              </select>
            </div>

            {/* Keyword Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                className="w-full h-11 sm:h-12 glass-input rounded-xl pl-10 pr-4 text-xs sm:text-sm placeholder:text-sunset-muted/70"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-accent h-11 sm:h-12 px-6 sm:px-7 flex items-center justify-center gap-2 text-xs sm:text-sm flex-shrink-0"
            >
              <span>{t('hero.searchButton')}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Stats Highlights */}
          <div className="pt-2 flex flex-wrap justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-sunset-text">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sunset-surface/90 backdrop-blur-md border border-sunset-border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              100% Verified GPS Coordinates
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sunset-surface/90 backdrop-blur-md border border-sunset-border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sunset-accent flex-shrink-0" />
              Zero Fake Ratings
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sunset-surface/90 backdrop-blur-md border border-sunset-border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
              Real Sahyadri Fort Histories
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          QUICK CATEGORY CARDS SECTION
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <p className="text-xs uppercase tracking-widest text-sunset-accent font-semibold font-serif">Curated Horizons</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-sunset-text">Explore by Category</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const targetUrl = `/explore?category=${cat.id}`;
            return (
              <Link
                key={cat.id}
                to={targetUrl}
                className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-sunset-accent/10 border border-sunset-accent/20 text-sunset-accent flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-sunset-accent group-hover:text-sunset-on-accent transition-all duration-300">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold group-hover:text-sunset-accent transition-colors font-serif text-sunset-text">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-sunset-accent font-medium mb-1">{cat.count}</p>
                  <p className="text-[11px] text-sunset-muted leading-relaxed">{cat.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-sunset-border flex items-center justify-between text-xs text-sunset-muted group-hover:text-sunset-accent font-semibold">
                  <span>Discover</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FEATURED LISTINGS ROW
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full border-t border-sunset-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-sunset-accent font-semibold mb-1">
              <Star className="w-3.5 h-3.5 fill-sunset-accent text-sunset-accent" />
              <span>{t('featured.badge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-sunset-text">{t('featured.title')}</h2>
            <p className="text-xs sm:text-sm text-sunset-muted mt-1">
              {t('featured.subtitle')}
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-sunset-accent hover:text-sunset-text text-xs sm:text-sm font-semibold transition-all border border-sunset-border"
          >
            <span>{t('featured.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid of Listings or Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SPECIAL HISTORIC FORTS TEASER
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-sunset-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sunset-accent/10 text-sunset-accent border border-sunset-accent/20 uppercase tracking-widest">
              {t('fortsBanner.badge')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-sunset-text">
              {t('fortsBanner.title')}
            </h2>
            <p className="text-sm sm:text-base text-sunset-muted leading-relaxed">
              {t('fortsBanner.desc')}
            </p>

            <div className="pt-2">
              <Link
                to="/explore?category=forts"
                className="btn-accent inline-flex items-center gap-2.5 px-6 py-3"
              >
                <span>{t('fortsBanner.button')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
