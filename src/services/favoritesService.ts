// src/services/favoritesService.ts
import { supabase } from '../supabaseClient';

export const isAlreadyFavorited = async (userId: string, restaurantId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_favorite_restaurants')
      .select('restaurant_id')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
    return !!(data && data.length > 0);
  } catch (err) {
    console.error('Unexpected error checking favorite status:', err);
    return false;
  }
};

export const addToFavorites = async (userId: string, restaurantId: string): Promise<void> => {
  const alreadyFavorited = await isAlreadyFavorited(userId, restaurantId);
  if (alreadyFavorited) {
    console.log(`Restaurant ${restaurantId} is already a favorite for user ${userId}.`);
    return;
  }
  const { error } = await supabase.from('user_favorite_restaurants').insert([
    { user_id: userId, restaurant_id: restaurantId, added_at: new Date().toISOString() },
  ]);

  if (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, restaurantId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_favorite_restaurants')
    .delete()
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId);

  if (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};