// src/supabaseClient.ts
import type { PostgrestResponse, PostgrestSingleResponse, Session, User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase'; // Import Database type-only


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})


// Export auth-related types and functions for convenience
export const {
  auth: supabaseAuth,
  from: supabaseFrom,
  storage: supabaseStorage
} = supabase


// Type definitions for our database schema - derived directly from 'Database' for consistency
export type DatabaseUser = Database['public']['Tables']['users']['Row'];
export type RestaurantDish = Database['public']['Tables']['restaurant_dishes']['Row'];
export type DishRating = Database['public']['Tables']['dish_ratings']['Row'];


// Expanded Restaurant type for UI/Hooks - combines table row with additional derived/joined properties
// Changed from interface extends to type intersection to fix ts(2499)
export type Restaurant = Database['public']['Tables']['restaurants']['Row'] & {
  // These fields are added by the `useRestaurants` hook logic,
  // either from `user_favorite_restaurants` or `restaurants.created_at`.
  dateAdded: string;
  date_favorited?: string; // Explicitly from user_favorite_restaurants
  // `created_by` is already in `Database['public']['Tables']['restaurants']['Row']`, so no need to redeclare
  dishes?: RestaurantDish[]; // For joined queries, if any
};




// Combined types for UI components
export interface DishWithRatings extends RestaurantDish {
  ratings?: DishRating[]
  user_rating?: DishRating // Current user's rating if exists
}


export interface UserWithProfile {
  id: string
  email: string
  profile?: DatabaseUser
}


// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}


export const getCurrentUserProfile = async () => {
  const user = await getCurrentUser()
  if (!user) return null
 
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
 
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return profile
}


export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}


// Re-export specific types needed for other files from supabase-js
export type { PostgrestResponse, PostgrestSingleResponse, Session, User };


// NEW: withTimeout function
export const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 20000): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutError = new Error(`Query timed out after ${timeoutMs}ms`);
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(timeoutError), timeoutMs);
  });


  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
};


export default supabase