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
        } catch (e) {
          console.warn('Could not load favorites from Supabase', e);
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
          await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId);
        } else {
          await supabase.from('favorites').insert({ user_id: user.id, listing_id: listingId });
        }
      } catch (e) {
        console.warn('Failed to sync favorite with Supabase', e);
      }
    }
  };

  return { favoriteIds, isFavorite, toggleFavorite };
}
