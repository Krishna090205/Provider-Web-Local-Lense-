import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Heart, MessageSquare, MapPin, Trash2, ArrowUpRight, Compass,
  Star, Settings, Sparkles, Calendar
} from 'lucide-react';
import { useAuth } from '../features/auth';
import { useFavorites } from '../hooks/useFavorites';
import { Listing, Review } from '../types';
import { useListings } from '../hooks/useListingsQuery';
import { useUserReviews, useDeleteReviewMutation } from '../hooks/useReviewsQuery';
import { useToast } from '../components/Toast';

export const TouristDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'saved' | 'reviews'>('saved');
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user?.name || '');

  // TanStack Queries
  const { data: allListings = [], isLoading: loadingListings } = useListings();
  const { data: myReviews = [], isLoading: loadingReviews } = useUserReviews(user?.id);
  const deleteReviewMutation = useDeleteReviewMutation();

  const savedListings = allListings.filter(item => favoriteIds.includes(item.id));
  const loading = loadingListings || loadingReviews;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    try {
      await updateProfile(nameInput.trim());
      setEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      toast.success('Review deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-sunset-text">
      
      {/* Profile Overview Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name || 'Tourist Profile'}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-sunset-accent/30 flex-shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold font-serif text-sunset-text">{user?.name || 'Local Explorer'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sunset-accent/20 text-sunset-accent border border-sunset-accent/30 uppercase">
                {user?.role || 'Tourist'}
              </span>
            </div>
            {user?.email && <p className="text-xs text-sunset-muted">{user.email}</p>}
            <p className="text-xs text-sunset-muted flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-sunset-accent flex-shrink-0" />
              <span>Exploring Mumbai Heritage & Sahyadri Trails</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Settings Link */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-1.5 glass-input rounded-xl text-xs"
                placeholder="Enter new name"
              />
              <button
                type="submit"
                className="btn-accent px-4 py-1.5 text-xs font-bold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="px-3 py-1.5 glass-panel rounded-xl text-xs text-sunset-muted hover:text-sunset-text"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => { setNameInput(user?.name || ''); setEditingProfile(true); }}
              className="px-4 py-2 glass-panel hover:border-sunset-accent text-sunset-text rounded-xl text-xs font-semibold transition-colors"
            >
              Edit Name
            </button>
          )}

          <Link
            to="/settings"
            className="px-4 py-2 glass-panel hover:border-sunset-accent text-sunset-muted hover:text-sunset-text rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-sunset-accent" />
            <span>Theme & Settings</span>
          </Link>
        </div>
      </div>

      {/* Tabs Switcher: Saved Places vs My Reviews */}
      <div className="flex items-center gap-2 border-b border-sunset-border pb-3">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'saved'
              ? 'btn-accent shadow-md'
              : 'glass-panel text-sunset-muted hover:text-sunset-text'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Places ({savedListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'reviews'
              ? 'btn-accent shadow-md'
              : 'glass-panel text-sunset-muted hover:text-sunset-text'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Reviews ({myReviews.length})</span>
        </button>
      </div>

      {/* TAB 1: SAVED PLACES */}
      {activeTab === 'saved' && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs text-sunset-muted">
              Places you bookmarked for your authentic Mumbai discovery itinerary
            </p>
            <Link
              to="/explore"
              className="text-xs font-semibold text-sunset-accent hover:underline flex items-center gap-1"
            >
              <span>Explore more places</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sunset-muted text-sm">Loading your saved destinations...</div>
          ) : savedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {savedListings.map((item) => {
                const cover = item.photos?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80';
                return (
                  <div key={item.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-sunset-border">
                    <div className="relative aspect-[16/10] bg-sunset-bg">
                      <img src={cover} alt={item.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-red-400 hover:text-white backdrop-blur-md transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sunset-accent text-sunset-on-accent uppercase">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-base font-bold text-sunset-text group-hover:text-sunset-accent transition-colors font-serif line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-sunset-muted line-clamp-2">{item.description}</p>
                      <div className="pt-2 flex justify-between items-center text-xs">
                        <span className="text-sunset-accent font-semibold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.rating > 0 ? item.rating : '—'}</span>
                        </span>
                        <Link
                          to={`/listings/${item.id}`}
                          className="text-sunset-accent font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-10 text-center rounded-2xl border border-sunset-border space-y-3">
              <Compass className="w-10 h-10 text-sunset-muted mx-auto opacity-50" />
              <h3 className="text-base font-bold font-serif text-sunset-text">No saved places yet</h3>
              <p className="text-xs text-sunset-muted max-w-sm mx-auto">
                Tap the heart icon on any heritage hotel, Irani restaurant, market, or fort to save it to your Mumbai itinerary.
              </p>
              <Link
                to="/explore"
                className="btn-accent inline-block px-5 py-2 text-xs font-bold"
              >
                Browse Destinations
              </Link>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: MY REVIEWS */}
      {activeTab === 'reviews' && (
        <section className="space-y-4 animate-fade-in">
          <p className="text-xs text-sunset-muted">
            Reviews and ratings you submitted for Mumbai locations
          </p>

          {myReviews.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-sunset-border space-y-3">
              <MessageSquare className="w-10 h-10 text-sunset-muted mx-auto opacity-50" />
              <h3 className="text-base font-bold font-serif text-sunset-text">No reviews written yet</h3>
              <p className="text-xs text-sunset-muted max-w-sm mx-auto">
                Visit any listing page to leave honest reviews, recommendations, and local travel tips.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="glass-card p-5 rounded-2xl border border-sunset-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-sunset-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'opacity-25'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-sunset-muted">
                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-sunset-text leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 rounded-xl text-sunset-muted hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1 text-xs"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
