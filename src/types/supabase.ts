// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          website_url: string | null
          rating: number | null
          price_tier: number | null
          category: string | null
          opening_hours: Json | null
          latitude: number | null
          longitude: number | null
          geoapify_place_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          website_url?: string | null
          rating?: number | null
          price_tier?: number | null
          category?: string | null
          opening_hours?: Json | null
          latitude?: number | null
          longitude?: number | null
          geoapify_place_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          website_url?: string | null
          rating?: number | null
          price_tier?: number | null
          category?: string | null
          opening_hours?: Json | null
          latitude?: number | null
          longitude?: number | null
          geoapify_place_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_favorite_restaurants: {
        Row: {
          user_id: string
          restaurant_id: string
          added_at: string
        }
        Insert: {
          user_id: string
          restaurant_id: string
          added_at?: string
        }
        Update: {
          user_id?: string
          restaurant_id?: string
          added_at?: string
        }
      }
      restaurant_dishes: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          category: string | null
          is_active: boolean
          created_by: string
          verified_by_restaurant: boolean
          total_ratings: number
          average_rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          category?: string | null
          is_active?: boolean
          created_by: string
          verified_by_restaurant?: boolean
          total_ratings?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          category?: string | null
          is_active?: boolean
          created_by?: string
          verified_by_restaurant?: boolean
          total_ratings?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      dish_ratings: {
        Row: {
          id: string
          dish_id: string
          user_id: string
          rating: number
          notes: string | null
          date_tried: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dish_id: string
          user_id: string
          rating: number
          notes?: string | null
          date_tried?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dish_id?: string
          user_id?: string
          rating?: number
          notes?: string | null
          date_tried?: string
          created_at?: string
          updated_at?: string
        }
      }
      dish_comments: {
        Row: {
          id: string
          dish_id: string
          user_id: string
          comment_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dish_id: string
          user_id: string
          comment_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dish_id?: string
          user_id?: string
          comment_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      dish_photos: {
        Row: {
          id: string
          dish_id: string
          user_id: string
          storage_path: string
          caption: string | null
          width: number | null
          height: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dish_id: string
          user_id: string
          storage_path: string
          caption?: string | null
          width?: number | null
          height?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dish_id?: string
          user_id?: string
          storage_path?: string
          caption?: string | null
          width?: number | null
          height?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}