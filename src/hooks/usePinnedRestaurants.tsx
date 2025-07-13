// src/hooks/usePinnedRestaurants.tsx
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types/restaurant';
import { useAuth } from './useAuth';

export const usePinnedRestaurants = () => {
  const { user } = useAuth();
  const [pinnedRestaurantIds, setPinnedRestaurantIds] = useState<Set<string>>(new Set());

  const fetchPinnedRestaurants = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_pinned_restaurants')
      .select('restaurant_id')
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching pinned restaurants:', error);
      return;
    }
    const ids = new Set(data?.map(item => item.restaurant_id) || []);
    setPinnedRestaurantIds(ids);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPinnedRestaurants();
    }
  }, [user, fetchPinnedRestaurants]);

  const togglePin = useCallback(async (restaurantId: string) => {
    if (!user) return false;
    const isPinned = pinnedRestaurantIds.has(restaurantId);
    // Optimistic update
    const newPinnedIds = new Set(pinnedRestaurantIds);
    if (isPinned) {
      newPinnedIds.delete(restaurantId);
    } else {
      newPinnedIds.add(restaurantId);
    }
    setPinnedRestaurantIds(newPinnedIds);
    try {
      if (isPinned) {
        await supabase
          .from('user_pinned_restaurants')
          .delete()
          .match({ user_id: user.id, restaurant_id: restaurantId });
      } else {
        await supabase
          .from('user_pinned_restaurants')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId
          });
      }
      return true;
    } catch (error) {
      console.error('Error toggling pin:', error);
      // Revert optimistic update
      setPinnedRestaurantIds(pinnedRestaurantIds);
      return false;
    }
  }, [user, pinnedRestaurantIds]);

  const getPinnedRestaurants = useCallback(async (): Promise<Restaurant[]> => {
    if (!user) return [];
    const { data: linkData, error } = await supabase
      .from('user_pinned_restaurants')
      .select(`
        restaurant_id,
        restaurants (*)
      `)
      .eq('user_id', user.id)
      .order('pinned_at', { ascending: false });

    if (error) {
      console.error('Error fetching pinned restaurants:', error);
      return [];
    }

    let restaurants = linkData?.map(item => item.restaurants as Restaurant).filter(Boolean) || [];
    
    if (restaurants.length > 0) {
      const restaurantIds = restaurants.map(r => r.id);
      const { data: stats, error: statsError } = await supabase.rpc('get_restaurants_stats', { p_restaurant_ids: restaurantIds });

      if (statsError) {
          console.error('Error fetching restaurant stats:', statsError);
      } else if (stats) {
          const statsMap = new Map(stats.map((s: any) => [s.restaurant_id, s]));
          restaurants = restaurants.map(r => {
              const rStats = statsMap.get(r.id);
              return {
                  ...r,
                  dishCount: rStats?.dish_count ?? 0,
                  raterCount: rStats?.rater_count ?? 0,
              };
          });
      }
    }
    return restaurants;
  }, [user]);

  return { pinnedRestaurantIds, togglePin, getPinnedRestaurants, refreshPinned: fetchPinnedRestaurants };
};