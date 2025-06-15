// src/hooks/useRestaurants.tsx
// Updated for Global Restaurant Model with User Favorites and Distance Sorting
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Restaurant {
  id: string;
  name: string;
  dateAdded: string; // Now represents when user favorited the restaurant
  created_at: string; // When the global restaurant was first created
  // New fields for imported restaurants
  geoapify_place_id?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  rating?: number;
  price_tier?: number;
  category?: string;
  opening_hours?: any;
  latitude?: number;
  longitude?: number;
  // Fields from the favorite link
  date_favorited?: string; // When current user added to their list
  created_by?: string; // Who originally created this global restaurant
}

interface GeoapifyPlace {
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
    datasource: {
      sourcename: string;
      attribution: string;
    };
  };
}

interface GeoapifyPlaceDetails {
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
    opening_hours?: any;
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

// Helper function for Haversine distance calculation (in miles)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d / 1000 * 0.621371; // convert to miles
};

// UPDATED: Reusable sorting function for restaurants with distance support
const sortRestaurantsArray = (
  array: Restaurant[],
  sortBy: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' },
  userLat?: number | null,
  userLon?: number | null
): Restaurant[] => {
  return [...array].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy.criterion === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy.criterion === 'date') {
      // Sort by when user favorited the restaurant (dateAdded or created_at)
      const dateA = new Date(a.dateAdded || a.created_at).getTime();
      const dateB = new Date(b.dateAdded || b.created_at).getTime();
      comparison = dateA - dateB; // Default to ASC (oldest first)
    } else if (sortBy.criterion === 'distance') {
      // Distance sorting
      if (!userLat || !userLon) {
        // If no user location, fallback to name sorting
        comparison = a.name.localeCompare(b.name);
      } else {
        // Calculate distances to user location
        const distanceA = (a.latitude && a.longitude) 
          ? calculateDistance(userLat, userLon, a.latitude, a.longitude)
          : Infinity; // Restaurants without coordinates go to the end
        const distanceB = (b.latitude && b.longitude)
          ? calculateDistance(userLat, userLon, b.latitude, b.longitude)
          : Infinity;
        
        comparison = distanceA - distanceB; // Default to ASC (closest first)
      }
    }
    
    return sortBy.direction === 'asc' ? comparison : -comparison;
  });
};

// UPDATED: Modified sortBy type to include criterion and direction and distance
export const useRestaurants = (
  sortBy: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' },
  userLat?: number | null,
  userLon?: number | null
) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search-related state
  const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [restaurantErrors, setRestaurantErrors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          setRestaurants([]); // Clear restaurants if user not authenticated
          return;
        }

        // Fetch user's favorite restaurants with details
        const { data: favoriteLinks, error: favError } = await supabase
          .from('user_favorite_restaurants')
          .select('restaurant_id, added_at')
          .eq('user_id', user.id);

        if (favError) {
          console.error('Error fetching favorite links:', favError);
          setError('Failed to load your restaurant list. Please try again.');
          return;
        }

        if (!favoriteLinks || favoriteLinks.length === 0) {
          setRestaurants([]);
          return;
        }

        // Get restaurant IDs from favorites
        const restaurantIds = favoriteLinks.map(link => link.restaurant_id);

        // Fetch details for these restaurants from global catalog
        const { data: restaurantDetails, error: detailsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds);

        if (detailsError) {
          console.error('Error fetching restaurant details:', detailsError);
          setError('Failed to load restaurant details. Please try again.');
          return;
        }

        if (restaurantDetails) {
          // Combine favorite link data with restaurant details
          const combinedData = restaurantDetails.map(restaurant => {
            const favoriteLink = favoriteLinks.find(link => link.restaurant_id === restaurant.id);
            return {
              ...restaurant,
              dateAdded: favoriteLink?.added_at || restaurant.created_at, // When user favorited it
              date_favorited: favoriteLink?.added_at, // Explicit favorite date
            };
          });

          // UPDATED: Use reusable sort function with user location
          const sortedRestaurants = sortRestaurantsArray(combinedData, sortBy, userLat, userLon);
          setRestaurants(sortedRestaurants);
        }
      } catch (err: any) {
        console.error('Error fetching restaurants:', err);
        setError(`Failed to load restaurants: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // UPDATED: Update dependency array for sortBy object and user location
    fetchRestaurants();
  }, [sortBy.criterion, sortBy.direction, userLat, userLon]);

  // Enhanced duplicate detection for global restaurants
  const isDuplicateRestaurant = async (newName: string, newAddress?: string, geoapifyPlaceId?: string): Promise<Restaurant | null> => {
    try {
      // First check by geoapify_place_id if available
      if (geoapifyPlaceId) {
        const { data: existingByPlaceId } = await supabase
          .from('restaurants')
          .select('*')
          .eq('geoapify_place_id', geoapifyPlaceId)
          .single();

        if (existingByPlaceId) {
          return existingByPlaceId;
        }
      }

      // Then check by name and address similarity
      const { data: allRestaurants } = await supabase
        .from('restaurants')
        .select('*');

      if (!allRestaurants) return null;

      const normalizedNewName = newName.toLowerCase().trim();
      const normalizedNewAddress = newAddress?.toLowerCase().trim();

      const duplicate = allRestaurants.find(existing => {
        const existingName = existing.name.toLowerCase().trim();
        const existingAddress = existing.address?.toLowerCase().trim();

        // Check if names are very similar
        const nameMatch = (
          existingName === normalizedNewName ||
          existingName.includes(normalizedNewName) ||
          normalizedNewName.includes(existingName) ||
          // Handle common variations (spaces, punctuation)
          existingName.replace(/[^a-z0-9]/g, '') === normalizedNewName.replace(/[^a-z0-9]/g, '')
        );

        if (!nameMatch) return false;

        // If both have addresses, check address similarity
        if (existingAddress && normalizedNewAddress) {
          const addressMatch = (
            existingAddress === normalizedNewAddress ||
            existingAddress.includes(normalizedNewAddress) ||
            normalizedNewAddress.includes(existingAddress) ||
            // Check if they contain the same street number and street name
            (() => {
              const existingParts = existingAddress.split(',')[0]?.trim();
              const newParts = normalizedNewAddress.split(',')[0]?.trim();
              return existingParts && newParts && (
                existingParts === newParts ||
                existingParts.includes(newParts) ||
                newParts.includes(existingParts)
              );
            })()
          );
          return addressMatch;
        }

        // If only one has an address, still consider it a match if names are very similar
        const exactNameMatch = existingName === normalizedNewName;
        return exactNameMatch;
      });

      return duplicate || null;
    } catch (err) {
      console.error('Error checking for duplicates:', err);
      return null;
    }
  };

  // Check if user has already favorited a global restaurant
  const isAlreadyFavorited = async (restaurantId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('user_favorite_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  // IMPROVED SCORING: Enhanced for multi-part queries
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Exact match - highest score
    if (s1 === s2) return 100;
    
    // Contains match - very high score
    if (s1.includes(s2) || s2.includes(s1)) return 95;
    
    // Word-by-word comparison with better scoring
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    let wordMatches = 0;
    let partialMatches = 0;
    
    words2.forEach(word2 => {
      // Check for exact word matches
      if (words1.some(word1 => word1 === word2)) {
        wordMatches++;
      }
      // Check for partial word matches (e.g., "cafe" matches "café")
      else if (words1.some(word1 =>
        word1.includes(word2) ||
        word2.includes(word1) ||
        // Handle common variations
        (word1.replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e') === word2) ||
        (word2.replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e') === word1)
      )) {
        partialMatches++;
      }
    });
    
    if (wordMatches > 0 || partialMatches > 0) {
      // Score based on how many words matched
      const exactScore = (wordMatches / words2.length) * 80;
      const partialScore = (partialMatches / words2.length) * 60;
      return Math.min(95, 40 + exactScore + partialScore);
    }
    
    // Check for character similarity (basic Levenshtein-like)
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 100;
    
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    const charSimilarity = (matches / longer.length) * 30;
    return Math.max(0, charSimilarity);
  };

  // Add abort controller reference at the hook level
  const abortControllerRef = useRef<AbortController | null>(null);

  // Search restaurants - now accepts userLat, userLon for bias and flexible query
  const searchRestaurants = async (query: string, userLat: number | null, userLon: number | null) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this search
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsSearching(true);
    setSearchError(null);
    // Clear previous results to prevent confusion
    setSearchResults([]);

    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      console.log('🔑 API Key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('API key is missing or not set properly');
      }

      // Use user's current location for proximity bias, fallback to Seattle if not available
      const biasLat = userLat || 47.6062; // Default Seattle latitude
      const biasLon = userLon || -122.3321; // Default Seattle longitude

      // allResults will now consistently hold objects with similarity and distance
      let allResults: (GeoapifyPlace & { similarity: number; distance: number })[] = [];

      // Helper function to process Geoapify features into GeoapifyPlace objects
      const processFeatures = (features: any[], requireName: boolean = true) => {
        return features
          .filter((feature: any) => {
            const properties = feature.properties;
            
            // Must have location
            if (!properties.lat || !properties.lon) {
                return false;
            }

            // For Places API results, we require a name
            if (requireName && !properties.name) {
                console.log(`DEBUG processFeatures: Filtering out (missing name): ${properties.formatted || 'N/A'}`);
                return false;
            }

            // For geocoding results without a name, create one from the address
            if (!properties.name && properties.formatted) {
                // Extract the first part of the formatted address as a name
                const addressParts = properties.formatted.split(',');
                if (addressParts.length > 0) {
                    properties.name = addressParts[0].trim();
                }
            }

            return true;
          })
          .map((feature: any) => ({
            place_id: feature.properties.place_id || `geocode_${feature.properties.lat}_${feature.properties.lon}`,
            properties: {
              name: feature.properties.name || feature.properties.formatted?.split(',')[0]?.trim() || 'Unknown Place',
              formatted: feature.properties.formatted || `${feature.properties.address_line1 || ''}, ${feature.properties.city || ''}, ${feature.properties.state || ''}`.trim(),
              address_line1: feature.properties.address_line1,
              address_line2: feature.properties.address_line2,
              city: feature.properties.city,
              state: feature.properties.state,
              postcode: feature.properties.postcode,
              country: feature.properties.country,
              lat: feature.properties.lat,
              lon: feature.properties.lon,
              categories: feature.properties.categories || [],
              datasource: feature.properties.datasource || { sourcename: 'geoapify', attribution: 'Geoapify' }
            }
          }));
      };

      // IMPROVED: Helper to detect if query contains both business and location
      const parseBusinessLocationQuery = (query: string): { business?: string; location?: string; isMultiPart: boolean } => {
        const lowerQuery = query.toLowerCase().trim();
        const words = lowerQuery.split(/\s+/);
        
        // Multi-word business names that should NOT be split (common chains and patterns)
        const multiWordBusinesses = [
          "dunkin' donuts", "dunkin donuts", "burger king", "pizza hut", "taco bell",
          "five guys", "in-n-out", "jimmy john's", "jersey mike's", "panda express",
          "olive garden", "red lobster", "texas roadhouse", "outback steakhouse",
          "cheesecake factory", "pf chang's", "pf changs", "trader joe's", "whole foods",
          "papa john's", "domino's pizza", "little caesars", "panera bread",
          "chipotle mexican grill", "qdoba mexican", "moe's southwest", "del taco",
          "carl's jr", "jack in the box", "dairy queen", "sonic drive-in",
          "waffle house", "ihop", "denny's", "cracker barrel", "applebee's",
          "chili's", "buffalo wild wings", "wingstop", "popeyes louisiana",
          "raising cane's", "el pollo loco", "boston market", "corner bakery",
          "au bon pain", "le pain quotidien", "potbelly sandwich", "firehouse subs",
          "which wich", "jason's deli", "mcalister's deli", "einstein bros",
          "noah's bagels", "bruegger's bagels", "tim hortons", "krispy kreme",
          "baskin robbins", "cold stone", "ben & jerry's", "haagen dazs",
          "jamba juice", "smoothie king", "tropical smoothie", "planet smoothie",
          "steak 'n shake", "shake shack", "smashburger", "habit burger",
          "fatburger", "johnny rockets", "white castle", "krystal", "checkers",
          "noodles & company", "zaxby's", "bojangles", "church's chicken"
        ];
        
        // Check if the query starts with a known multi-word business
        for (const business of multiWordBusinesses) {
          if (lowerQuery.startsWith(business)) {
            const remainingQuery = lowerQuery.substring(business.length).trim();
            if (remainingQuery.length > 0) {
              // There's text after the business name, could be a location
              return {
                business: business,
                location: remainingQuery,
                isMultiPart: true
              };
            } else {
              // Just the business name, no location
              return { isMultiPart: false };
            }
          }
        }

        // Location indicators that suggest the rest is a location
        const locationIndicators = [
          ' in ', ' at ', ' near ', ' on ', ' off ', ' by ', ' around ', ' close to '
        ];
        
        // Street type indicators
        const streetTypes = [
          'street', 'st', 'avenue', 'ave', 'road', 'rd', 'boulevard', 'blvd',
          'lane', 'ln', 'drive', 'dr', 'court', 'ct', 'place', 'pl',
          'parkway', 'pkwy', 'highway', 'hwy', 'way', 'circle', 'cir'
        ];
        
        // Check for location indicators in the query
        for (const indicator of locationIndicators) {
          const indicatorIndex = lowerQuery.indexOf(indicator);
          if (indicatorIndex > 0 && indicatorIndex < lowerQuery.length - indicator.length) {
            const beforeIndicator = lowerQuery.substring(0, indicatorIndex).trim();
            const afterIndicator = lowerQuery.substring(indicatorIndex + indicator.length).trim();
            
            if (beforeIndicator.length > 0 && afterIndicator.length > 0) {
              return {
                business: beforeIndicator,
                location: afterIndicator,
                isMultiPart: true
              };
            }
          }
        }
        
        // Check if the last word is a street type (e.g., "dunkin donuts dempster")
        if (words.length >= 2) {
          const lastWord = words[words.length - 1];
          // const secondLastWord = words.length > 2 ? words[words.length - 2] : ''; // Removed unused variable
          
          // Check if last word could be a street name (not a street type itself)
          const couldBeStreetName = !streetTypes.includes(lastWord) &&
                                    lastWord.length > 2 &&
                                    !['the', 'and', 'or', 'of', 'for'].includes(lastWord);
          
          if (couldBeStreetName) {
            // Check if this might be "business streetname" pattern
            const possibleBusiness = words.slice(0, -1).join(' ');
            
            // Common business name patterns
            const businessPatterns = [
              'restaurant', 'cafe', 'bistro', 'grill', 'kitchen', 'bar', 'pub',
              'pizza', 'burger', 'taco', 'sushi', 'thai', 'chinese', 'mexican',
              'italian', 'indian', 'deli', 'bakery', 'coffee', 'tea', 'juice',
              'chicken', 'steak', 'bbq', 'barbecue', 'seafood', 'fish'
            ];
            
            // Check if the possible business contains common restaurant words
            const hasBusinessPattern = businessPatterns.some(pattern =>
              possibleBusiness.includes(pattern)
            );
            
            // If it looks like a business name followed by a potential street
            if (hasBusinessPattern || possibleBusiness.split(' ').length <= 2) {
              return {
                business: possibleBusiness,
                location: lastWord,
                isMultiPart: true
              };
            }
          }
        }
        
        // Check for apostrophe patterns (e.g., "Ludi's restaurant", "McDonald's")
        // These should generally NOT be split unless there's a clear location indicator
        if (lowerQuery.includes("'") || lowerQuery.includes("'")) {
          // Don't split possessive forms unless there's a clear location indicator
          return { isMultiPart: false };
        }
        
        // If none of the above patterns match, don't split the query
        return { isMultiPart: false };
      };

      // Helper function to determine if query looks location-specific
      const isLocationSpecific = (query: string): boolean => {
        const lowerCaseQuery = query.toLowerCase();
        // Strict keywords for cities, states, and common address indicators
        const locationKeywords = [
          /\bst(?:reet)?\b/, /\bave(?:nue)?\b/, /\brd|road\b/, /\bblvd|boulevard\b/, /\bln|lane\b/,
          /\bdr|drive\b/, /\bct|court\b/, /\bpl|place\b/, /\bpkwy|parkway\b/, /\bsq|square\b/, /\bway\b/, /\brte\b/, /\bhighway\b/,
          /\b(?:city|town|village|county|state|center|mall|plaza)\b/, // General location terms
          /\bseattle\b/, /\bportland\b/, /\blos angeles\b/, /\bnew york\b/, /\baustin\b/, /\bmiami\b/, /\bsanta fe\b/, /\balbuquerque\b/, /\bchicago\b/, /\bhouston\b/, /\bphiladelphia\b/, /\bphoenix\b/, /\bsan antonio\b/, /\bsan diego\b/, /\bdallas\b/, /\bsan jose\b/, /\bdenver\b/, /\bwashington\b/, /\bboston\b/, /\bdetroit\b/, /\bnashville\b/, /\bmemphis\b/, /\bbaltimore\b/, /\bmilwaukee\b/, /\boklahoma city\b/, /\blas vegas\b/, /\bcolumbus\b/, /\bcharlotte\b/, /\bel paso\b/, /\bfort worth\b/, /\bjacksonville\b/, /\bindianapolis\b/, /\bsan francisco\b/, /\bmichigan\b/, /\bnew mexico\b/,
          /\bwa\b/, /\bor\b/, /\bca\b/, /\bny\b/, /\btx\b/, /\bfl\b/, /\bal\b/, /\bak\b/, /\baz\b/, /\bar\b/, /\bco\b/, /\bct\b/, /\bde\b/, /\bdc\b/, /\bga\b/, /\bhi\b/, /\bid\b/, /\bil\b/, /\bin\b/, /\bia\b/, /\bks\b/, /\bky\b/, /\bla\b/, /\bme\b/, /\bmd\b/, /\bma\b/, /\bmi\b/, /\bmn\b/, /\bms\b/, /\bmo\b/, /\bmt\b/, /\bne\b/, /\bnv\b/, /\bnh\b/, /\bnj\b/, /\bnm\b/, /\bnc\b/, /\bnd\b/, /\boh\b/, /\bok\b/, /\bpa\b/, /\bri\b/, /\bsc\b/, /\bsd\b/, /\btn\b/, /\but\b/, /\bvt\b/, /\bva\b/, /\bwv\b/, /\bwi\b/, /\bwy\b/ // All US states
        ];
        
        // Check for 5-digit US zip code
        const hasZipCode = /\b\d{5}\b/.test(lowerCaseQuery);
        // Check for common street address pattern (number + one or more words + street type abbreviation/full)
        const hasStreetAddressPattern = /\b\d+\s+(?:\w+\s*){1,4}(?:st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane|dr|drive|ct|court|pl|place|pkwy|parkway|sq|square|way|rte|highway)\b/.test(lowerCaseQuery);
        // Check if query starts with a number followed by a word (common for house numbers, e.g., "123 Main")
        const startsWithNumberAndWord = /^\d+\s+\w+/.test(lowerCaseQuery);
        // Check for common combinations like "city, state" or "city state"
        const hasCityCommaState = /\b\w+,\s*(?:[a-z]{2,})\b/.test(lowerCaseQuery); // e.g., "seattle, wa", "santa fe, new mexico" (state needs to be at least 2 chars)
        const hasCitySpaceState = /\b\w+\s+(?:[a-z]{2,})\b/.test(lowerCaseQuery) && !/\b(?:st|ave|rd|blvd|ln|dr|ct|pl|pkwy|sq|way|rte|highway)\b/.test(lowerCaseQuery); // Avoid "north st" where "st" is a street type, not state

        const hasSpecificLocationKeyword = locationKeywords.some(keyword => keyword.test(lowerCaseQuery));

        const isLocation = hasZipCode || hasStreetAddressPattern || startsWithNumberAndWord || hasCityCommaState || hasCitySpaceState || hasSpecificLocationKeyword;

        console.log(`DEBUG isLocationSpecific("${query}"):
            hasZipCode: ${hasZipCode}
            hasStreetAddressPattern: ${hasStreetAddressPattern}
            startsWithNumberAndWord: ${startsWithNumberAndWord}
            hasCityCommaState: ${hasCityCommaState}
            hasCitySpaceState: ${hasCitySpaceState}
            hasSpecificLocationKeyword: ${hasSpecificLocationKeyword}
            -> Result: ${isLocation}`);
        return isLocation;
      };

      // Parse the query to detect business + location pattern
      const queryParts = parseBusinessLocationQuery(query);
      const initialQueryIsLocationSpecific = isLocationSpecific(query);
      
      console.log(`🤔 Query: "${query}" - Is location specific? ${initialQueryIsLocationSpecific}, Is multi-part? ${queryParts.isMultiPart}`);
      if (queryParts.isMultiPart) {
        console.log(`  📍 Business: "${queryParts.business}", Location: "${queryParts.location}"`);
      }

      // ENHANCED STRATEGY 1: Business + Location with Places API AND Geocoding fallback
      if (queryParts.isMultiPart && queryParts.business && queryParts.location) {
        const businessQuery = queryParts.business; // Extract to avoid TS issues
        const locationQuery = queryParts.location; // Extract to avoid TS issues
        
        console.log('🎯 Strategy 1 (Business + Location): First, geocoding the location:', locationQuery);
        
        // First, geocode the location to get coordinates
        const locationGeocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(locationQuery)}&limit=1&apiKey=${apiKey}`;
        const locationResponse = await fetch(locationGeocodeUrl, { signal: abortController.signal });
        
        if (locationResponse.ok) {
          const locationData = await locationResponse.json();
          if (locationData.features && locationData.features.length > 0) {
            const locationCoords = locationData.features[0].properties;
            console.log(`📍 Found location coordinates: ${locationCoords.city || locationCoords.name} (${locationCoords.lat}, ${locationCoords.lon})`);
            
            // Now search for the business near this location using Places API
            const restaurantCategories = [
              'catering.restaurant',
              'catering.fast_food',
              'catering.cafe',
              'catering.bar',
              'catering.pub',
              'commercial.food_and_drink',
              'commercial.shopping_mall'
            ];
            
            // Use a LARGER radius search around the found location
            const radius = 25000; // 25km radius (increased from 10km)
            const placesUrl = `https://api.geoapify.com/v2/places?categories=${restaurantCategories.join(',')}&filter=circle:${locationCoords.lon},${locationCoords.lat},${radius}&limit=50&apiKey=${apiKey}`;
            console.log('🔍 Searching for businesses near location (25km radius)...');
            
            const placesResponse = await fetch(placesUrl, { signal: abortController.signal });
            if (placesResponse.ok) {
              const placesData = await placesResponse.json();
              const places = processFeatures(placesData.features || []);
              
              // Filter places by business name
              const businessLower = businessQuery.toLowerCase();
              const filteredPlaces = places.filter(place => {
                const nameLower = place.properties.name.toLowerCase();
                return nameLower.includes(businessLower) || businessLower.includes(nameLower) ||
                       calculateSimilarity(place.properties.name, businessQuery) > 70;
              });
              
              const scoredResults = filteredPlaces.map(r => ({
                ...r,
                similarity: calculateSimilarity(r.properties.name, businessQuery) + 25, // Increased boost for being in the right location
                distance: calculateDistance(biasLat, biasLon, r.properties.lat, r.properties.lon)
              }));
              
              allResults.push(...scoredResults);
              console.log(`✅ Strategy 1 Places API: Found ${scoredResults.length} ${businessQuery} locations near ${locationQuery}`);
              
              // NEW: If Places API returns few results, also try geocoding search
              if (scoredResults.length < 5) {
                console.log('🔄 Strategy 1 Geocoding Fallback: Places API returned few results, trying geocoding...');
                
                // Search using geocoding API with the full query centered on the location
                const geocodeFallbackUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(businessQuery)}&bias=proximity:${locationCoords.lon},${locationCoords.lat}&limit=30&apiKey=${apiKey}`;
                const geocodeFallbackResponse = await fetch(geocodeFallbackUrl, { signal: abortController.signal });
                
                if (geocodeFallbackResponse.ok) {
                  const geocodeFallbackData = await geocodeFallbackResponse.json();
                  const geocodeResults = processFeatures(geocodeFallbackData.features || [], false);
                  
                  // Filter to only include results near the target location
                  const nearbyGeocodeResults = geocodeResults.filter(r => {
                    const distanceFromLocation = calculateDistance(locationCoords.lat, locationCoords.lon, r.properties.lat, r.properties.lon);
                    return distanceFromLocation < 15; // Within 15 miles of the location
                  });
                  
                  const scoredGeocodeResults = nearbyGeocodeResults.map(r => ({
                    ...r,
                    similarity: calculateSimilarity(r.properties.name, businessQuery) + 20, // Slightly lower boost than Places API
                    distance: calculateDistance(biasLat, biasLon, r.properties.lat, r.properties.lon)
                  }));
                  
                  allResults.push(...scoredGeocodeResults);
                  console.log(`✅ Strategy 1 Geocoding Fallback: Found ${scoredGeocodeResults.length} additional ${businessQuery} locations near ${locationQuery}`);
                }
              }
            }
          }
        }
      }

      // STRATEGY 2: Traditional location-specific search (if not already handled by business+location)
      if (!queryParts.isMultiPart && initialQueryIsLocationSpecific) {
          console.log('🎯 Strategy 2 (Location-Specific): Executing global geocoding API search for:', query);
          const globalGeocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=30&apiKey=${apiKey}`;
          const globalGeocodeResponse = await fetch(globalGeocodeUrl, { signal: abortController.signal });

          if (globalGeocodeResponse.ok) {
              const globalGeocodeData = await globalGeocodeResponse.json();
              console.log('Raw global geocode data feature count:', globalGeocodeData.features?.length || 0);
              const globalRestaurantResults = processFeatures(globalGeocodeData.features || [], false); // Don't require name for geocoding

              const scoredResults = globalRestaurantResults.map(r => ({
                  ...r,
                  similarity: Math.max(
                      calculateSimilarity(r.properties.name, query),
                      calculateSimilarity(r.properties.formatted, query)
                  ),
                  distance: calculateDistance(biasLat, biasLon, r.properties.lat, r.properties.lon)
              }));
              allResults.push(...scoredResults);
              console.log(`✅ Strategy 2: Added ${scoredResults.length} global results. Total allResults: ${allResults.length}`);
          }
      }

      // STRATEGY 3: Proximity-biased search (always run as fallback)
      console.log('🔄 Strategy 3 (Proximity-Biased): Executing geocoding API search for:', query);
      const biasedGeocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&bias=proximity:${biasLon},${biasLat}&limit=30&apiKey=${apiKey}`;
      const biasedGeocodeResponse = await fetch(biasedGeocodeUrl, { signal: abortController.signal });

      if (biasedGeocodeResponse.ok) {
          const biasedGeocodeData = await biasedGeocodeResponse.json();
          console.log('Raw biased geocode data feature count:', biasedGeocodeData.features?.length || 0);
          const biasedRestaurantResults = processFeatures(biasedGeocodeData.features || [], false); // Don't require name

          const scoredResults = biasedRestaurantResults.map(r => ({
              ...r,
              similarity: Math.max(
                  calculateSimilarity(r.properties.name, query),
                  calculateSimilarity(r.properties.formatted, query)
              ),
              distance: calculateDistance(biasLat, biasLon, r.properties.lat, r.properties.lon)
          }));
          
          // If this is a multi-part query, penalize local results that don't match the location
          if (queryParts.isMultiPart && queryParts.location) {
            const targetLocation = queryParts.location.toLowerCase(); // Extract to avoid TS issues
            scoredResults.forEach(result => {
              const addressLower = result.properties.formatted.toLowerCase();
              if (!addressLower.includes(targetLocation)) {
                result.similarity = Math.max(0, result.similarity - 30); // Penalize non-matching locations
              }
            });
          }
          
          allResults.push(...scoredResults);
          console.log(`🔄 Strategy 3: Added ${scoredResults.length} biased results. Total allResults: ${allResults.length}`);
      }

      // STRATEGY 4: Broad Places API search (if we still need more results)
      if (allResults.length < 10 && !queryParts.isMultiPart) {
          console.log('🚨 Strategy 4: Executing Places API fallback search (few results so far)');
          const restaurantCategories = [
            'catering.restaurant',
            'catering.fast_food',
            'catering.cafe',
            'catering.bar',
            'catering.pub'
          ];
          const placesSearchUrl = `https://api.geoapify.com/v2/places?categories=${restaurantCategories.join(',')}&filter=circle:${biasLon},${biasLat},15000&limit=20&apiKey=${apiKey}`;
          const placesResponse = await fetch(placesSearchUrl, { signal: abortController.signal });

          if (placesResponse.ok) {
              const placesData = await placesResponse.json();
              const placesResults = processFeatures(placesData.features || []);

              const scoredFilteredPlaces = placesResults.map(p => ({
                  ...p,
                  similarity: Math.max(
                      calculateSimilarity(p.properties.name, query),
                      calculateSimilarity(p.properties.formatted, query)
                  ),
                  distance: calculateDistance(biasLat, biasLon, p.properties.lat, p.properties.lon)
              })).filter(p => (p.similarity || 0) > 30);
              allResults.push(...scoredFilteredPlaces);
              console.log(`🔄 Strategy 4: Added ${scoredFilteredPlaces.length} places results. Total allResults: ${allResults.length}`);
          }
      }

      // --- ENHANCED Final Processing: Better De-duplication, Scoring, and Sorting ---
      const uniqueResults = allResults.filter((item: GeoapifyPlace & { similarity: number, distance: number }, index: number, self: (GeoapifyPlace & { similarity: number, distance: number })[]) => {
          return index === self.findIndex((t: GeoapifyPlace & { similarity: number, distance: number }) => {
              // Exact place_id match
              if (t.place_id && item.place_id && t.place_id === item.place_id) return true;
              
              // Calculate distance between two results
              const distance = calculateDistance(item.properties.lat, item.properties.lon, t.properties.lat, t.properties.lon);
              
              // For multi-part queries, be more lenient with deduplication to avoid removing valid results
              const distanceThreshold = queryParts.isMultiPart ? 0.1 : 0.05; // 0.1 miles for multi-part, 0.05 for others
              const similarityThreshold = queryParts.isMultiPart ? 90 : 80; // Higher threshold for multi-part
              
              return distance < distanceThreshold && ( // Within threshold
                  calculateSimilarity(t.properties.name, item.properties.name) > similarityThreshold || // Very similar names
                  calculateSimilarity(t.properties.formatted, item.properties.formatted) > similarityThreshold // Very similar addresses
              );
          });
      });

      console.log('🔀 Combined unique results after de-duplication:', uniqueResults.length);

      // Sort results with special handling for multi-part queries
      const finalSortedResults = uniqueResults.sort((a, b) => {
          // For multi-part queries, heavily prioritize similarity
          if (queryParts.isMultiPart) {
              if (Math.abs(a.similarity - b.similarity) > 10) {
                  return b.similarity - a.similarity;
              }
          }
          
          // Primary sort: similarity (descending)
          if (Math.abs(a.similarity - b.similarity) > 5) {
              return b.similarity - a.similarity;
          }
          
          // Secondary sort: distance (ascending) - but only for non-location-specific queries
          if (!initialQueryIsLocationSpecific && !queryParts.isMultiPart) {
              return a.distance - b.distance;
          }
          
          return 0;
      }).slice(0, 50); // Increased from 30 to allow more results

      console.log('🏆 Top 5 matches after final sorting:');
      finalSortedResults.slice(0, 5).forEach((result, i) => {
        console.log(`${i + 1}. ${result.properties.name} at ${result.properties.city || 'Unknown City'} (score: ${result.similarity.toFixed(2)}, distance: ${result.distance.toFixed(2)} miles)`);
      });

      // Filter for display based on query type
      let finalResultsForDisplay = finalSortedResults;
      
      if (queryParts.isMultiPart || initialQueryIsLocationSpecific) {
          // For location-specific queries, show results with good similarity
          const goodMatches = finalSortedResults.filter((r: any) => r.similarity > 50);
          if (goodMatches.length > 0) {
              finalResultsForDisplay = goodMatches.slice(0, 30); // Increased from 20
              console.log('📍 Showing location-specific matches.');
          }
      } else {
          // For general queries, prioritize very good matches
          const veryGoodMatches = finalSortedResults.filter((r: any) => r.similarity > 70);
          if (veryGoodMatches.length >= 3) {
              finalResultsForDisplay = veryGoodMatches;
              console.log('✨ Filtered to very relevant matches only for display.');
          } else if (finalSortedResults.length > 5) {
              finalResultsForDisplay = finalSortedResults.slice(0, 20); // Increased from 15
              console.log('📍 Kept top 20 results for display.');
          }
      }

      // Ensure we show something if we have results
      if (finalResultsForDisplay.length === 0 && finalSortedResults.length > 0) {
          finalResultsForDisplay = finalSortedResults.slice(0, Math.min(10, finalSortedResults.length)); // Increased from 5
          console.log(`⚠️ Final display results empty, showing top ${finalResultsForDisplay.length} as fallback.`);
      }

      const cleanResults = finalResultsForDisplay.map(({ similarity, distance, ...place }: any) => place);
      setSearchResults(cleanResults);
      
    } catch (err: any) {
      // Check if the error was due to abort
      if (err.name === 'AbortError') {
        console.log('🛑 Search cancelled for:', query);
        return; // Don't set error state for cancelled requests
      }
      
      console.error('🚨 Error searching restaurants:', err);
      setSearchError(`Failed to search restaurants: ${err.message}`);
      setSearchResults([]);
    } finally {
      // Only set loading false if this is the current request
      if (abortControllerRef.current === abortController) {
        setIsSearching(false);
      }
    }
  };

  // Get detailed restaurant information
  const getRestaurantDetails = async (placeId: string): Promise<GeoapifyPlaceDetails | null> => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      console.log('🏪 Fetching place details for:', placeId);
      
      if (placeId.startsWith('geocode_')) {
        console.log('🏪 Skipping place details for geocoded result - using available info.');
        // For geocoded results, we don't have a specific Geoapify place_id to fetch more details.
        // We'll just return null and use the basic info already obtained from the geocode search.
        return null;
      }
      
      const response = await fetch(
        `https://api.geoapify.com/v2/place-details?id=${placeId}&features=details&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get place details: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          place_id: placeId,
          properties: {
            name: feature.properties.name || 'Unknown Restaurant',
            formatted: feature.properties.formatted || feature.properties.address_line1 || '',
            address_line1: feature.properties.address_line1,
            address_line2: feature.properties.address_line2,
            city: feature.properties.city,
            state: feature.properties.state,
            postcode: feature.properties.postcode,
            country: feature.properties.country,
            lat: feature.properties.lat,
            lon: feature.properties.lon,
            categories: feature.properties.categories || [],
            website: feature.properties.website || feature.properties.contact?.website,
            phone: feature.properties.phone || feature.properties.contact?.phone,
            opening_hours: feature.properties.opening_hours,
            contact: feature.properties.contact, // Keep contact for potential future use
            datasource: feature.properties.datasource || { sourcename: 'geoapify', attribution: 'Geoapify' }
          }
        };
      }
      
      return null;
    } catch (err: any) {
      console.error('Error getting restaurant details:', err);
      // Don't throw here, allow the import process to continue with basic info
      return null;
    }
  };

  // UPDATED: Import restaurant with global model logic
  const importRestaurant = async (selectedPlace: GeoapifyPlace) => {
    setError(null);
    setIsLoadingDetails(true);
    
    // Clear any previous error for this restaurant
    setRestaurantErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(selectedPlace.place_id);
      return newErrors;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // STEP 1: Check if this restaurant already exists in the global catalog
      const existingGlobalRestaurant = await isDuplicateRestaurant(
        selectedPlace.properties.name,
        selectedPlace.properties.formatted,
        selectedPlace.place_id
      );

      if (existingGlobalRestaurant) {
        console.log('🌍 Found existing global restaurant:', existingGlobalRestaurant.name);
        
        // Check if user has already favorited this restaurant
        const alreadyFavorited = await isAlreadyFavorited(existingGlobalRestaurant.id);
        
        if (alreadyFavorited) {
          setRestaurantErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.set(selectedPlace.place_id, `"${existingGlobalRestaurant.name}" is already in your restaurant list.`);
            return newErrors;
          });
          return false;
        }

        // Add to user's favorites
        const { error: favoriteError } = await supabase
          .from('user_favorite_restaurants')
          .insert([{
            user_id: user.id,
            restaurant_id: existingGlobalRestaurant.id,
            added_at: new Date().toISOString()
          }]);

        if (favoriteError) {
          console.error('Error adding to favorites:', favoriteError);
          setRestaurantErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.set(selectedPlace.place_id, 'Failed to add restaurant to your list. Please try again.');
            return newErrors;
          });
          return false;
        }

        // Add to local state with favorite date
        const restaurantWithFavoriteDate = {
          ...existingGlobalRestaurant,
          dateAdded: new Date().toISOString(),
          date_favorited: new Date().toISOString()
        };

        // UPDATED: Use reusable sort function with user location
        setRestaurants(prevRestaurants =>
          sortRestaurantsArray([...prevRestaurants, restaurantWithFavoriteDate], sortBy, userLat, userLon)
        );

        return existingGlobalRestaurant.id;
      }

      // STEP 2: Restaurant doesn't exist globally, so create it and add to favorites
      console.log('🆕 Creating new global restaurant');

      // Get detailed information if available
      let placeDetails: GeoapifyPlaceDetails | null = null;
      
      try {
        placeDetails = await getRestaurantDetails(selectedPlace.place_id);
      } catch (detailsError) {
        console.log('Could not fetch place details, using basic info from initial search (this was already caught by getRestaurantDetails).');
      }

      // Safely combine properties, prioritizing details if available
      const propertiesFromDetails = placeDetails?.properties;
      const propertiesFromInitialSearch = selectedPlace.properties;

      // Construct final properties object by picking from details or initial search,
      // ensuring optional fields from GeoapifyPlaceDetails are handled.
      const finalProperties = {
          name: propertiesFromDetails?.name || propertiesFromInitialSearch.name,
          formatted: propertiesFromDetails?.formatted || propertiesFromInitialSearch.formatted,
          address_line1: propertiesFromDetails?.address_line1 || propertiesFromInitialSearch.address_line1,
          address_line2: propertiesFromDetails?.address_line2 || propertiesFromInitialSearch.address_line2,
          city: propertiesFromDetails?.city || propertiesFromInitialSearch.city,
          state: propertiesFromDetails?.state || propertiesFromInitialSearch.state,
          postcode: propertiesFromDetails?.postcode || propertiesFromInitialSearch.postcode,
          country: propertiesFromDetails?.country || propertiesFromInitialSearch.country,
          lat: propertiesFromDetails?.lat || propertiesFromInitialSearch.lat,
          lon: propertiesFromDetails?.lon || propertiesFromInitialSearch.lon,
          categories: propertiesFromDetails?.categories || propertiesFromInitialSearch.categories,
          // These fields exist ONLY on GeoapifyPlaceDetails, so they must be conditionally accessed
          website: propertiesFromDetails?.website || propertiesFromDetails?.contact?.website,
          phone: propertiesFromDetails?.phone || propertiesFromDetails?.contact?.phone,
          opening_hours: propertiesFromDetails?.opening_hours,
          datasource: propertiesFromDetails?.datasource || propertiesFromInitialSearch.datasource
      };
      
      const finalPlaceId = placeDetails?.place_id || selectedPlace.place_id;

      // Create new global restaurant
      const restaurantData = {
        name: finalProperties.name,
        geoapify_place_id: finalPlaceId,
        address: finalProperties.formatted,
        phone: finalProperties.phone || null, // Safely access potentially undefined field
        website_url: finalProperties.website || null, // Safely access potentially undefined field
        rating: null,
        price_tier: null,
        category: finalProperties.categories?.[0] || 'Restaurant',
        opening_hours: finalProperties.opening_hours || null, // Safely access potentially undefined field
        latitude: finalProperties.lat,
        longitude: finalProperties.lon,
        created_by: user.id
      };

      const { data: newGlobalRestaurant, error: insertError } = await supabase
        .from('restaurants')
        .insert([restaurantData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating global restaurant:', insertError);
        setRestaurantErrors(prev => {
          const newErrors = new Map(prev);
          newErrors.set(selectedPlace.place_id, 'Failed to create restaurant. Please try again.');
          return newErrors;
        });
        throw insertError;
      }

      // Add to user's favorites
      const { error: favoriteError } = await supabase
        .from('user_favorite_restaurants')
        .insert([{
          user_id: user.id,
          restaurant_id: newGlobalRestaurant.id,
          added_at: new Date().toISOString()
        }]);

      if (favoriteError) {
        console.error('Error adding new restaurant to favorites:', favoriteError);
        // If this fails, we should probably remove the global restaurant we just created
        // But for now, just show an error
        setRestaurantErrors(prev => {
          const newErrors = new Map(prev);
          newErrors.set(selectedPlace.place_id, 'Restaurant created but failed to add to your list. Please try again.');
          return newErrors;
        });
        return false;
      }

      // Add to local state
      const restaurantWithFavoriteDate = {
        ...newGlobalRestaurant,
        dateAdded: new Date().toISOString(),
        date_favorited: new Date().toISOString()
      };

      // UPDATED: Use reusable sort function with user location
      setRestaurants(prevRestaurants =>
        sortRestaurantsArray([...prevRestaurants, restaurantWithFavoriteDate], sortBy, userLat, userLon)
      );

      return newGlobalRestaurant.id;

    } catch (catchedError: any) {
      console.error('Caught error in importRestaurant:', catchedError);
      setRestaurantErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.set(selectedPlace.place_id, `Failed to import restaurant: ${catchedError.message}`);
        return newErrors;
      });
      return false;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // UPDATED: Manual add restaurant (creates global restaurant + favorite)
  const addRestaurant = async (name: string) => {
    if (!name.trim()) return false;

    setError(null);
    
    try {
      const { data: { user } = {} } = await supabase.auth.getUser(); // Safely destructure user
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      // Check for duplicates in global catalog
      const duplicateRestaurant = await isDuplicateRestaurant(name.trim());
      
      if (duplicateRestaurant) {
        // Check if user has already favorited this restaurant
        const alreadyFavorited = await isAlreadyFavorited(duplicateRestaurant.id);
        
        if (alreadyFavorited) {
          setError(`"${duplicateRestaurant.name}" is already in your restaurant list.`);
          return false;
        }

        // Add existing restaurant to favorites
        const { error: favoriteError } = await supabase
          .from('user_favorite_restaurants')
          .insert([{
            user_id: user.id,
            restaurant_id: duplicateRestaurant.id,
            added_at: new Date().toISOString()
          }]);

        if (favoriteError) {
          setError('Failed to add restaurant to your list. Please try again.');
          return false;
        }

        // Add to local state
        const restaurantWithFavoriteDate = {
          ...duplicateRestaurant,
          dateAdded: new Date().toISOString(),
          date_favorited: new Date().toISOString()
        };

        // UPDATED: Use reusable sort function with user location
        setRestaurants(prevRestaurants =>
          sortRestaurantsArray([...prevRestaurants, restaurantWithFavoriteDate], sortBy, userLat, userLon)
        );

        return true;
      }

      // Create new global restaurant
      const { data: newGlobalRestaurant, error: insertError } = await supabase
        .from('restaurants')
        .insert([{
          name: name.trim(),
          created_by: user.id
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error adding restaurant:', insertError);
        setError('Failed to add restaurant. Please try again.');
        throw insertError;
      }

      // Add to user's favorites
      const { error: favoriteError } = await supabase
        .from('user_favorite_restaurants')
        .insert([{
          user_id: user.id,
          restaurant_id: newGlobalRestaurant.id,
          added_at: new Date().toISOString()
        }]);

      if (favoriteError) {
        console.error('Error adding to favorites:', favoriteError);
        setError('Restaurant created but failed to add to your list. Please try again.');
        return false;
      }

      // Add to local state
      const restaurantWithFavoriteDate = {
        ...newGlobalRestaurant,
        dateAdded: new Date().toISOString(),
        date_favorited: new Date().toISOString()
      };

      // UPDATED: Use reusable sort function with user location
      setRestaurants(prevRestaurants =>
        sortRestaurantsArray([...prevRestaurants, restaurantWithFavoriteDate], sortBy, userLat, userLon)
      );

      return true;
    } catch (catchedError) {
      console.error('Caught error in addRestaurant:', catchedError);
      return false;
    }
  };

  // UPDATED: Delete restaurant (removes from favorites, doesn't delete global)
  const deleteRestaurant = async (restaurantId: string) => {
    setError(null);
    try {
      const { data: { user } = {} } = await supabase.auth.getUser(); // Safely destructure user
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      // Remove from user's favorites (not from global restaurants table)
      const { error: deleteError } = await supabase
        .from('user_favorite_restaurants')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      if (deleteError) {
        console.error('Error removing restaurant from favorites:', deleteError);
        setError('Failed to remove restaurant from your list. Please try again.');
        throw deleteError;
      }

      // Remove from local state
      setRestaurants(prevRestaurants =>
        prevRestaurants.filter(r => r.id !== restaurantId)
      );
      
      return true;
    } catch (catchedError) {
      console.error('Caught error in deleteRestaurant:', catchedError);
      return false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending searches
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset search function
  const resetSearch = () => {
    // Cancel any pending searches
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchResults([]);
    setSearchError(null);
    setRestaurantErrors(new Map());
  };

  return {
    restaurants,
    isLoading,
    error,
    setError,
    addRestaurant,
    deleteRestaurant,
    setRestaurants,
    // Search functionality
    searchResults,
    isSearching,
    searchError,
    isLoadingDetails,
    restaurantErrors,
    searchRestaurants,
    importRestaurant,
    clearSearchResults: () => setSearchResults([]),
    resetSearch
  };
};