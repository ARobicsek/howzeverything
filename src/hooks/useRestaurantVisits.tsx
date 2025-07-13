// src/hooks/useRestaurantVisits.tsx
import { useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';

export const useRestaurantVisits = () => {
  const { user } = useAuth();

  const trackVisit = useCallback(async (restaurantId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('user_restaurant_visits')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId
        });
    } catch (error) {
      console.error('Error tracking restaurant visit:', error);
    }
  }, [user]);

  const getRecentVisits = useCallback(async () => {
    if (!user) return [];
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const { data, error } = await supabase
      .from('user_restaurant_visits')
      .select(`
        restaurant_id,
        restaurants (*)
      `)
      .eq('user_id', user.id)
      .gte('visited_at', twentyFourHoursAgo.toISOString())
      .order('visited_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching recent visits:', error);
      return [];
    }
    
    // Remove duplicates, keeping most recent visit
    const uniqueRestaurantsMap = new Map();
    data?.forEach(visit => {
      if (visit.restaurants && !uniqueRestaurantsMap.has(visit.restaurant_id)) {
        uniqueRestaurantsMap.set(visit.restaurant_id, visit.restaurants);
      }
    });
    
    let restaurants = Array.from(uniqueRestaurantsMap.values());

    if (restaurants.length > 0) {
      const restaurantIds = restaurants.map(r => r.id);
      const { data: stats, error: statsError } = await supabase.rpc('get_restaurants_stats', { p_restaurant_ids: restaurantIds });

      if (statsError) {
          console.error('Error fetching restaurant stats for recents:', statsError);
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

  return { trackVisit, getRecentVisits };
};