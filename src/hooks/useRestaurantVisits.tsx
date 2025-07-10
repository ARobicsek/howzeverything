// src/hooks/useRestaurantVisits.tsx
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';

export const useRestaurantVisits = () => {
  const { user } = useAuth();

  const trackVisit = async (restaurantId: string) => {
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
  };

  const getRecentVisits = async () => {
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
    const uniqueRestaurants = new Map();
    data?.forEach(visit => {
      if (!uniqueRestaurants.has(visit.restaurant_id)) {
        uniqueRestaurants.set(visit.restaurant_id, visit.restaurants);
      }
    });
    return Array.from(uniqueRestaurants.values());
  };

  return { trackVisit, getRecentVisits };
};