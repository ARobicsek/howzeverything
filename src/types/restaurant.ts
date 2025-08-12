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
    manually_added: boolean | null;
    created_at: string;
    latitude: number | null; // Allow null as per database schema
    longitude: number | null; // Allow null as per database schema
    // Fields from the favorite link (optional as they come from user_favorite_restaurants join)
    dateAdded?: string; // When user favorited the restaurant
    date_favorited?: string; // Explicit favorite date
    // --- FIX: Align all nullable fields with the database schema ---
    geoapify_place_id: string | null;
    phone: string | null;
    website_url: string | null;
    rating: number | null; // Community rating, not personal
    price_tier: number | null;
    category: string | null;
    opening_hours: Record<string, unknown> | null;
    created_by: string | null; // Who originally created this global restaurant
    total_unique_raters?: number;
    // Add dishCount and raterCount here to be populated by RPC
    dishCount?: number;
    raterCount?: number;
}

export interface UserRestaurantVisit {
  id: string;
  user_id: string;
  restaurant_id: string;
  visited_at: string;
}

export interface RestaurantWithPinStatus extends Restaurant {
  is_pinned?: boolean;
  distance?: number | string;
}