// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Type definitions for our database schema
export interface DatabaseUser {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  location?: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface RestaurantDish {
  id: string
  restaurant_id: string
  name: string
  description?: string | null
  category?: string | null
  is_active: boolean
  created_by: string
  verified_by_restaurant: boolean
  total_ratings: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface DishRating {
  id: string
  dish_id: string
  user_id: string
  rating: number
  notes?: string | null
  date_tried: string
  created_at: string
  updated_at: string
}

// Expanded Restaurant type to include the dishes relationship
export interface Restaurant {
  id: string
  name: string
  dateAdded: string
  created_at: string
  geoapify_place_id?: string | null
  address?: string | null
  phone?: string | null
  website_url?: string | null
  rating?: number | null
  price_tier?: number | null
  category?: string | null
  opening_hours?: any
  latitude?: number | null
  longitude?: number | null
  dishes?: RestaurantDish[] // For joined queries
}

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

export default supabase