// src/types/restaurantSearch.ts
import { Restaurant } from './restaurant';

export interface RestaurantWithStats extends Restaurant {
  dishCount?: number;
  raterCount?: number;
  distance?: string;
}

export interface GeoapifyPlace {
  place_id: string;
  properties: {
    name: string;
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    lat: number;
    lon: number;
    categories: string[];
    website?: string;
    phone?: string;
    contact?: {
      website?: string;
      phone?: string;
    };
    datasource: {
      sourcename: string;
      attribution: string;
    };
  };
}

export interface GeoapifyPlaceDetails {
  place_id: string;
  properties: {
    name: string;
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    lat: number;
    lon: number;
    categories: string[];
    website?: string;
    phone?: string;
    opening_hours?: Record<string, unknown>;
    contact?: {
      website?: string;
      phone?: string;
      email?: string;
    };
    datasource: {
      sourcename: string;
      attribution: string;
    };
  };
}

// REMOVED: AdvancedSearchQuery is no longer needed.

export interface QueryAnalysis {
  type: 'business' | 'address' | 'business_location_proposal';
  businessName?: string;
  location?: string;
  streetName?: string; // Extracted street name when 'on' is used (e.g., "on dempster" -> "dempster")
  locationType?: 'street' | 'city' | 'general'; // Type of location specified
}

export interface UseRestaurantsOptions {
  sortBy?: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' };
  userLat?: number | null;
  userLon?: number | null;
  initialFetch?: boolean;
}