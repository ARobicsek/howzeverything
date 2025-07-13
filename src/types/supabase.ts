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
      dish_comments: {
        Row: {
          created_at: string
          dish_id: string
          id: string
          comment_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dish_id: string
          id?: string
          comment_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dish_id?: string
          id?: string
          comment_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_comments_dish_id_fkey"
            columns: ["dish_id"]
            referencedRelation: "restaurant_dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      dish_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          height: number | null
          id: string
          dish_id: string | null
          storage_path: string
          updated_at: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          dish_id?: string | null
          storage_path: string
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          dish_id?: string | null
          storage_path?: string
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dish_photos_dish_id_fkey"
            columns: ["dish_id"]
            referencedRelation: "restaurant_dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_photos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      dish_ratings: {
        Row: {
          created_at: string | null
          date_tried: string | null
          dish_id: string | null
          id: string
          notes: string | null
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_tried?: string | null
          dish_id?: string | null
          id?: string
          notes?: string | null
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_tried?: string | null
          dish_id?: string | null
          id?: string
          notes?: string | null
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dish_ratings_dish_id_fkey"
            columns: ["dish_id"]
            referencedRelation: "restaurant_dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_ratings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      restaurant_dishes: {
        Row: {
          average_rating: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string | null
          total_ratings: number | null
          updated_at: string | null
          verified_by_restaurant: boolean | null
        }
        Insert: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          verified_by_restaurant?: boolean | null
        }
        Update: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          verified_by_restaurant?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_dishes_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          dateAdded: string
          full_address: string | null
          geoapify_place_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          manually_added: boolean | null
          name: string
          opening_hours: Json | null
          phone: string | null
          price_tier: number | null
          rating: number | null
          state: string | null
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          dateAdded?: string
          full_address?: string | null
          geoapify_place_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          manually_added?: boolean | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          price_tier?: number | null
          rating?: number | null
          state?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          dateAdded?: string
          full_address?: string | null
          geoapify_place_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          manually_added?: boolean | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          price_tier?: number | null
          rating?: number | null
          state?: string | null
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_favorite_restaurants: {
        Row: {
          added_at: string | null
          restaurant_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          restaurant_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorite_restaurants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_pinned_restaurants: {
        Row: {
          user_id: string
          restaurant_id: string
          pinned_at: string | null
        }
        Insert: {
          user_id: string
          restaurant_id: string
          pinned_at?: string | null
        }
        Update: {
          user_id?: string
          restaurant_id?: string
          pinned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_pinned_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pinned_restaurants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_restaurant_visits: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_restaurant_visits_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restaurant_visits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          location: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          location?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          location?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_restaurant_and_children: {
        Args: {
          p_restaurant_id: string
        }
        Returns: undefined
      }
      get_restaurants_stats: {
        Args: {
          p_restaurant_ids: string[]
        }
        Returns: {
            restaurant_id: string
            dish_count: number
            rater_count: number
        }[]
      }
      get_user_favorite_restaurants_with_stats: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}