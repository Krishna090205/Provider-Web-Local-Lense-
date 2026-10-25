import { useState, useEffect } from 'react';
import { getLocalFavorites, saveLocalFavorites } from '../lib/store';
import { useAuth } from '../features/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getLocalFavorites());

  useEffect(() => {
    async function loadFavorites() {
      if (user && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('listing_id')
            .eq('user_id', user.id);
          if (!error && data) {
            const ids = data.map(item => item.listing_id);
            setFavoriteIds(ids);
            saveLocalFavorites(ids);
            return;
          }
          if (error && error.code !== 'PGRST205') {
            console.warn('Supabase favorites query notice:', error.message);
          }
        } catch {
          // Graceful fallback to client storage
        }
      }
      setFavoriteIds(getLocalFavorites());
    }
    loadFavorites();
  }, [user]);

  const isFavorite = (listingId: string) => favoriteIds.includes(listingId);

  const toggleFavorite = async (listingId: string) => {
    let next: string[];
    const exists = favoriteIds.includes(listingId);

    if (exists) {
      next = favoriteIds.filter(id => id !== listingId);
    } else {
      next = [...favoriteIds, listingId];
    }

    setFavoriteIds(next);
    saveLocalFavorites(next);

    if (user && isSupabaseConfigured) {
      try {
        if (exists) {
          const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId);
          if (error && error.code !== 'PGRST205') console.warn('Supabase favorite delete notice:', error.message);
        } else {
          const { error } = await supabase.from('favorites').insert({ user_id: user.id, listing_id: listingId });
          if (error && error.code !== 'PGRST205') console.warn('Supabase favorite insert notice:', error.message);
        }
      } catch {
        // Fallback already saved locally
      }
    }
  };

  return { favoriteIds, isFavorite, toggleFavorite };
}
