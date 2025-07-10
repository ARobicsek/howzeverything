// src/types/restaurant.ts
// Centralized interface for the Restaurant model
export interface Restaurant {
    id: string;
    name: string;
    address: string | null; // Parsed street address e.g. "123 Main St"
    full_address: string | null; // The original, unparsed address from user input
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    manually_added: boolean;
    created_at: string;
    latitude: number | null; // Allow null as per database schema
    longitude: number | null; // Allow null as per database schema
    // Fields from the favorite link (optional as they come from user_favorite_restaurants join)
    dateAdded?: string; // When user favorited the restaurant
    date_favorited?: string; // Explicit favorite date
    // Optional fields for imported restaurants (from Geoapify)
    geoapify_place_id?: string;
    phone?: string;
    website_url?: string;
    rating?: number; // Community rating, not personal
    price_tier?: number;
    category?: string;
    opening_hours?: any; // Consider a more specific type if known
    created_by?: string; // Who originally created this global restaurant
}

export interface UserRestaurantVisit {
  id: string;
  user_id: string;
  restaurant_id: string;
  visited_at: string;
}

export interface RestaurantWithPinStatus extends Restaurant {
  is_pinned?: boolean;
  total_unique_raters?: number;
}