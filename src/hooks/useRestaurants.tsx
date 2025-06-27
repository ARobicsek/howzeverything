// src/hooks/useRestaurants.tsx    
// Updated for Global Restaurant Model with User Favorites and Distance Sorting    
// ENHANCED: Now includes manually added restaurants in search results  
// PHASE 1 ENHANCEMENTS: Text normalization, query type detection, enhanced similarity scoring, database restaurant priority
import { useCallback, useEffect, useRef, useState } from 'react'; // Added useCallback  
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types/restaurant'; // MODIFIED: Import Restaurant interface from central type file

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

// PHASE 1 ENHANCEMENT: Text normalization utilities
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/&/g, 'and')
    .replace(/\b(st|street)\b/g, 'street')
    .replace(/\b(ave|avenue)\b/g, 'avenue')
    .replace(/\b(rd|road)\b/g, 'road')
    .replace(/\b(blvd|boulevard)\b/g, 'boulevard')
    .replace(/\b(dr|drive)\b/g, 'drive')
    .replace(/\b(ln|lane)\b/g, 'lane')
    .replace(/\b(ct|court)\b/g, 'court')
    .replace(/\b(pl|place)\b/g, 'place')
    .replace(/\b(pkwy|parkway)\b/g, 'parkway')
    .replace(/\s+/g, ' ')
    .trim();
}

// PHASE 1 ENHANCEMENT: Basic phonetic matching for restaurant names
function generatePhoneticKey(text: string): string {
  const normalized = normalizeText(text);
  
  // Handle common restaurant name variations
  return normalized
    .replace(/mcdonald/g, 'mcdnld')
    .replace(/burger/g, 'brgr')
    .replace(/pizza/g, 'pza')
    .replace(/cafe|café/g, 'cfe')
    .replace(/restaurant/g, 'rstnt')
    .replace(/kitchen/g, 'ktchn')
    .replace(/grill/g, 'grl')
    .replace(/bistro/g, 'bstro')
    .replace(/[aeiou]/g, '') // Remove vowels for basic soundex-like matching
    .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric
}

// PHASE 1 ENHANCEMENT: Entity type detection
interface QueryAnalysis {
  type: 'business' | 'address' | 'business_location';
  businessName?: string;
  location?: string;
  hasLocationKeywords: boolean;
  isMultiPart: boolean;
}

function analyzeQuery(query: string): QueryAnalysis {
  const normalizedQuery = normalizeText(query);
  
  // Detect if query contains address patterns
  const hasStreetNumber = /^\d+\s/.test(normalizedQuery);
  const hasZipCode = /\b\d{5}\b/.test(normalizedQuery);
  
  // Known location keywords
  const locationKeywords = ['near', 'in', 'at', 'on', 'by', 'around', 'close to'];
  const hasLocationKeywords = locationKeywords.some(kw => normalizedQuery.includes(kw));
  
  // Street type indicators
  const streetTypes = [
    'street', 'avenue', 'road', 'boulevard', 'lane', 'drive', 'court', 
    'place', 'parkway', 'highway', 'way', 'circle'
  ];
  
  // Check for location indicators in the query
  for (const indicator of [' in ', ' at ', ' near ', ' on ', ' by ', ' around ']) {
    const indicatorIndex = normalizedQuery.indexOf(indicator);
    if (indicatorIndex > 0 && indicatorIndex < normalizedQuery.length - indicator.length) {
      const beforeIndicator = normalizedQuery.substring(0, indicatorIndex).trim();
      const afterIndicator = normalizedQuery.substring(indicatorIndex + indicator.length).trim();
      
      if (beforeIndicator.length > 0 && afterIndicator.length > 0) {
        return {
          type: 'business_location',
          businessName: beforeIndicator,
          location: afterIndicator,
          hasLocationKeywords: true,
          isMultiPart: true
        };
      }
    }
  }
  
  // Check if it's primarily an address
  if (hasStreetNumber || hasZipCode || streetTypes.some(type => normalizedQuery.includes(type))) {
    return {
      type: 'address',
      hasLocationKeywords,
      isMultiPart: false
    };
  }
  
  return {
    type: 'business',
    hasLocationKeywords,
    isMultiPart: false
  };
}

// PHASE 1 ENHANCEMENT: N-gram generation for better partial matching
function generateNgrams(text: string, n: number = 3): string[] {
  const normalized = normalizeText(text);
  const ngrams: string[] = [];
  
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.push(normalized.slice(i, i + n));
  }
  
  return ngrams;
}

// PHASE 1 ENHANCEMENT: Enhanced similarity calculation
function calculateEnhancedSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  // Exact match - highest score
  if (s1 === s2) return 100;
  
  // Contains match - very high score
  if (s1.includes(s2) || s2.includes(s1)) return 95;
  
  // Phonetic matching
  const phonetic1 = generatePhoneticKey(s1);
  const phonetic2 = generatePhoneticKey(s2);
  if (phonetic1 === phonetic2 && phonetic1.length > 2) return 90;
  
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
  
  // N-gram matching for character-level similarity
  const ngrams1 = generateNgrams(s1);
  const ngrams2 = generateNgrams(s2);
  
  if (ngrams1.length === 0 || ngrams2.length === 0) return 0;
  
  const commonNgrams = ngrams1.filter(ng => ngrams2.includes(ng)).length;
  const totalNgrams = Math.max(ngrams1.length, ngrams2.length);
  const ngramScore = (commonNgrams / totalNgrams) * 40;
  
  return Math.max(0, ngramScore);
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
        const distanceA = (a.latitude !== null && a.longitude !== null)    
          ? calculateDistance(userLat, userLon, a.latitude, a.longitude)    
          : Infinity; // Restaurants without coordinates go to the end    
        const distanceB = (b.latitude !== null && b.longitude !== null)    
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
          const sortedRestaurants = sortRestaurantsArray(combinedData as Restaurant[], sortBy, userLat, userLon); // Cast to Restaurant[]  
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
          return existingByPlaceId as Restaurant;  
        }    
      }

      // Then check by name and address similarity using enhanced matching
      const { data: allRestaurants } = await supabase    
        .from('restaurants')    
        .select('*');

      if (!allRestaurants) return null;

      const normalizedNewName = normalizeText(newName);    
      const normalizedNewAddress = newAddress ? normalizeText(newAddress) : undefined;

      const duplicate = allRestaurants.find(existing => {    
        const existingName = normalizeText(existing.name);    
        const existingAddress = existing.address ? normalizeText(existing.address) : undefined;

        // Use enhanced similarity for name matching
        const nameScore = calculateEnhancedSimilarity(existingName, normalizedNewName);
        const nameMatch = nameScore > 80; // Higher threshold for duplicates

        if (!nameMatch) return false;

        // If both have addresses, check address similarity    
        if (existingAddress && normalizedNewAddress) {    
          const addressScore = calculateEnhancedSimilarity(existingAddress, normalizedNewAddress);
          return addressScore > 70;
        }

        // If only one has an address, still consider it a match if names are very similar    
        return nameScore > 90;
      });

      return duplicate ? (duplicate as Restaurant) : null;    
    } catch (err) {    
      console.error('Error checking for duplicates:', err);    
      return null;    
    }    
  };

  // Check if user has already favorited a global restaurant    
  const isAlreadyFavorited = useCallback(async (restaurantId: string): Promise<boolean> => {    
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
  }, []); // Empty dependency array as it only depends on supabase and user.id (which is stable)

  // REMOVED: Old calculateSimilarity function - now using calculateEnhancedSimilarity

  // Add abort controller reference at the hook level    
  const abortControllerRef = useRef<AbortController | null>(null);

  // ENHANCED: Search restaurants - now includes manually added restaurants from database with Phase 1 improvements  
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
      // PHASE 1 ENHANCEMENT: Analyze query type
      const queryAnalysis = analyzeQuery(query);
      console.log('🔍 Query analysis:', queryAnalysis);

      // STEP 1: PRIORITY SEARCH - Database restaurants (with enhanced matching)
      console.log('🔍 Searching existing restaurants in database with enhanced matching...');
      const { data: allDbRestaurants, error: dbError } = await supabase
        .from('restaurants')
        .select('*');

      if (dbError) {
        console.error('Error searching database restaurants:', dbError);
      }

      // Enhanced database search with similarity scoring
      const databaseResults: GeoapifyPlace[] = [];
      if (allDbRestaurants && allDbRestaurants.length > 0) {
        const scoredDbRestaurants = allDbRestaurants.map(restaurant => {
          let maxSimilarity = calculateEnhancedSimilarity(restaurant.name, query);

          // Boost similarity if query matches any address component
          if (restaurant.address) maxSimilarity = Math.max(maxSimilarity, calculateEnhancedSimilarity(restaurant.address, query));
          if (restaurant.city) maxSimilarity = Math.max(maxSimilarity, calculateEnhancedSimilarity(restaurant.city, query));
          if (restaurant.state) maxSimilarity = Math.max(maxSimilarity, calculateEnhancedSimilarity(restaurant.state, query));
          if (restaurant.zip_code) maxSimilarity = Math.max(maxSimilarity, calculateEnhancedSimilarity(restaurant.zip_code, query));
          if (restaurant.country) maxSimilarity = Math.max(maxSimilarity, calculateEnhancedSimilarity(restaurant.country, query));

          return {
            restaurant,
            similarity: maxSimilarity,
            distance: (restaurant.latitude !== null && restaurant.longitude !== null && userLat && userLon)
              ? calculateDistance(userLat, userLon, restaurant.latitude, restaurant.longitude)
              : Infinity
          };
        })
        .filter(item => item.similarity > 30) // Only include reasonable matches
        .sort((a, b) => b.similarity - a.similarity) // Sort by similarity
        .slice(0, 10) // Top 10 database matches
        .map(item => ({
          place_id: `db_${item.restaurant.id}`,
          properties: {
            name: item.restaurant.name,
            formatted: [
              item.restaurant.address,
              item.restaurant.city,
              item.restaurant.state,
              item.restaurant.zip_code,
              item.restaurant.country
            ].filter(Boolean).join(', ').trim().replace(/^,\s*|,\s*$/g, '') || 'Address not provided',
            address_line1: item.restaurant.address || undefined,
            address_line2: undefined,
            city: item.restaurant.city || undefined,
            state: item.restaurant.state || undefined,
            postcode: item.restaurant.zip_code || undefined,
            country: item.restaurant.country || undefined,
            lat: item.restaurant.latitude || 0,
            lon: item.restaurant.longitude || 0,
            categories: ['database_restaurant'],
            datasource: {
              sourcename: 'database',
              attribution: 'Our Database'
            }
          }
        }));

        databaseResults.push(...scoredDbRestaurants);
        console.log(`✅ Found ${databaseResults.length} database restaurants with enhanced matching`);
      }

      // STEP 2: Continue with existing API search logic but with query analysis
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;    
      console.log('🔑 API Key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');    
         
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {    
        // If API key is missing, at least return database results  
        if (databaseResults.length > 0) {  
          setSearchResults(databaseResults);  
          return;  
        }  
        throw new Error('API key is missing or not set properly');    
      }

      // Use user's current location for proximity bias, fallback to Seattle if not available    
      const biasLat = userLat || 47.6062; // Default Seattle latitude    
      const biasLon = userLon || -122.3321; // Default Seattle longitude

      let allResults: (GeoapifyPlace & { similarity: number; distance: number })[] = [];

      // Add database results with high priority scores
      const prioritizedDbResults = databaseResults.map(r => {
        const similarity = calculateEnhancedSimilarity(r.properties.name, query);
        return {
          ...r,
          similarity: similarity + 30, // MAJOR boost for database restaurants
          distance: (r.properties.lat !== null && r.properties.lon !== null && userLat && userLon)
            ? calculateDistance(userLat, userLon, r.properties.lat, r.properties.lon)
            : Infinity
        };
      });
      allResults.push(...prioritizedDbResults);

      // [REST OF THE EXISTING SEARCH LOGIC CONTINUES HERE WITH QUERY ANALYSIS INTEGRATION]
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

      // PHASE 1 ENHANCED: Query analysis-based search strategy
      if (queryAnalysis.type === 'business_location' && queryAnalysis.businessName && queryAnalysis.location) {
        console.log('🎯 Strategy: Business + Location Search');
        
        // First, geocode the location to get coordinates    
        const locationGeocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryAnalysis.location)}&limit=1&apiKey=${apiKey}`;    
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
            const radius = 25000; // 25km radius    
            const placesUrl = `https://api.geoapify.com/v2/places?categories=${restaurantCategories.join(',')}&filter=circle:${locationCoords.lon},${locationCoords.lat},${radius}&limit=50&apiKey=${apiKey}`;    
            console.log('🔍 Searching for businesses near location (25km radius)...');    
               
            const placesResponse = await fetch(placesUrl, { signal: abortController.signal });    
            if (placesResponse.ok) {    
              const placesData = await placesResponse.json();    
              const places = processFeatures(placesData.features || []);    
                 
              // Filter places by business name using enhanced similarity
              const filteredPlaces = places.filter(place => {
                const similarity = calculateEnhancedSimilarity(place.properties.name, queryAnalysis.businessName!);
                return similarity > 70;
              });    
                 
              const scoredResults = filteredPlaces.map(r => ({    
                ...r,    
                similarity: calculateEnhancedSimilarity(r.properties.name, queryAnalysis.businessName!) + 25, // Boost for location-specific searches
                distance: calculateDistance(locationCoords.lat, locationCoords.lon, r.properties.lat, r.properties.lon)    
              }));    
              allResults.push(...scoredResults);    
              console.log(`✅ Found ${scoredResults.length} businesses near ${queryAnalysis.location}`);    
            }    
          }    
        }
      } else if (queryAnalysis.type === 'address') {
        console.log('🎯 Strategy: Address/Location-focused Search');
        
        // Use geocoding API for address searches    
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=20&bias=proximity:${biasLon},${biasLat}&apiKey=${apiKey}`;    
        console.log('🔍 Geocoding address...');    
           
        const geocodeResponse = await fetch(geocodeUrl, { signal: abortController.signal });    
        if (geocodeResponse.ok) {    
          const geocodeData = await geocodeResponse.json();    
          const geocodeResults = processFeatures(geocodeData.features || [], false);    
             
          const scoredResults = geocodeResults.map(r => ({    
            ...r,    
            similarity: calculateEnhancedSimilarity(r.properties.formatted, query) + 20, // Boost for geocoding
            distance: calculateDistance(biasLat, biasLon, r.properties.lat, r.properties.lon)    
          }));    
          allResults.push(...scoredResults);    
          console.log(`✅ Found ${scoredResults.length} geocoded locations`);    
        }
      } else {
        console.log('🎯 Strategy: Business Name Search');
        
        // Pure business name search - use Places API with restaurant categories    
        const restaurantCategories = [    
          'catering.restaurant',    
          'catering.fast_food',    
          'catering.cafe',    
          'catering.bar',    
          'catering.pub',    
          'commercial.food_and_drink'    
        ];    
           
        const radius = userLat && userLon ? 50000 : 100000; // Larger radius if no user location    
        const placesUrl = `https://api.geoapify.com/v2/places?categories=${restaurantCategories.join(',')}&filter=circle:${biasLon},${biasLat},${radius}&bias=proximity:${biasLon},${biasLat}&limit=50&apiKey=${apiKey}`;    
        console.log('🔍 Searching places by business name...');    
           
        const placesResponse = await fetch(placesUrl, { signal: abortController.signal });    
        if (placesResponse.ok) {    
          const placesData = await placesResponse.json();    
          const places = processFeatures(placesData.features || []);    
             
          // Filter places by name similarity using enhanced matching
          const filteredPlaces = places.filter(place => {
            const similarity = calculateEnhancedSimilarity(place.properties.name, query);
            return similarity > 40; // Lower threshold for broader matching
          });    
             
          const scoredResults = filteredPlaces.map(r => ({    
            ...r,    
            similarity: calculateEnhancedSimilarity(r.properties.name, query) + 15, // Moderate boost for places API
            distance: calculateDistance(biasLat, biasLon, r.properties.lat, r.properties.lon)    
          }));    
          allResults.push(...scoredResults);    
          console.log(`✅ Found ${scoredResults.length} places matching business name`);    
        }
      }

      // Fallback: Text search if we don't have enough results    
      if (allResults.length < 5) {    
        console.log('🔍 Fallback: Text search for more results...');    
        const textSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=20&bias=proximity:${biasLon},${biasLat}&apiKey=${apiKey}`;    
           
        const textResponse = await fetch(textSearchUrl, { signal: abortController.signal });    
        if (textResponse.ok) {    
          const textData = await textResponse.json();    
          const textResults = processFeatures(textData.features || [], false);    
             
          const scoredResults = textResults.map(r => ({    
            ...r,    
            similarity: calculateEnhancedSimilarity(r.properties.name || r.properties.formatted, query) + 10, // Lower boost for fallback
            distance: calculateDistance(biasLat, biasLon, r.properties.lat, r.properties.lon)    
          }));    
          allResults.push(...scoredResults);    
          console.log(`✅ Found ${scoredResults.length} additional results from text search`);    
        }    
      }

      // Remove duplicates based on place_id    
      const uniqueResults = allResults.filter((result, index, array) =>    
        array.findIndex(r => r.place_id === result.place_id) === index    
      );

      // PHASE 1 ENHANCED: Sophisticated ranking algorithm
      const rankedResults = uniqueResults
        .sort((a, b) => {
          // Priority 1: Database restaurants get major boost (they already have +30 similarity)
          const aIsDb = a.place_id.startsWith('db_');
          const bIsDb = b.place_id.startsWith('db_');
          
          if (aIsDb && !bIsDb) return -1;
          if (!aIsDb && bIsDb) return 1;
          
          // Priority 2: Similarity score (higher is better)
          const similarityDiff = b.similarity - a.similarity;
          if (Math.abs(similarityDiff) > 10) {
            return similarityDiff;
          }
          
          // Priority 3: Distance (closer is better, but only if similarity is close)
          if (userLat && userLon) {
            const distanceDiff = a.distance - b.distance;
            return distanceDiff;
          }
          
          // Fallback: Name alphabetical
          return a.properties.name.localeCompare(b.properties.name);
        })
        .slice(0, 15); // Top 15 results

      // Remove the similarity and distance properties before setting results
      const finalResults = rankedResults.map(({ similarity, distance, ...result }) => result);

      console.log(`🎯 Final results: ${finalResults.length} restaurants (${databaseResults.length} from database)`);
      setSearchResults(finalResults);

    } catch (err: any) {    
      if (err.name === 'AbortError') {    
        console.log('🚫 Search aborted');    
        return; // Don't set error state for aborted requests    
      }    
         
      console.error('Error searching restaurants:', err);    
      setSearchError(`Search failed: ${err.message}`);    
    } finally {    
      setIsSearching(false);    
      abortControllerRef.current = null;    
    }    
  };

  // Get detailed restaurant information from Geoapify    
  const getRestaurantDetails = async (placeId: string): Promise<GeoapifyPlaceDetails | null> => {    
    setIsLoadingDetails(true);    
    setRestaurantErrors(new Map()); // Clear previous errors

    try {    
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;    
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {    
        throw new Error('Geoapify API key is not configured');    
      }

      const response = await fetch(`https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`);

      if (!response.ok) {    
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);    
      }

      const data = await response.json();

      if (!data.features || data.features.length === 0) {    
        throw new Error('No details found for this place');    
      }

      const feature = data.features[0];    
      return {    
        place_id: feature.properties.place_id,    
        properties: {    
          name: feature.properties.name,    
          formatted: feature.properties.formatted,    
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
          contact: feature.properties.contact,    
          datasource: feature.properties.datasource,    
        },    
      };    
    } catch (err: any) {    
      console.error(`Error fetching details for place ${placeId}:`, err);    
      setRestaurantErrors(prev => new Map(prev.set(placeId, err.message)));    
      return null;    
    } finally {    
      setIsLoadingDetails(false);    
    }    
  };

  // Add restaurant to global catalog    
  const addRestaurant = async (restaurantDataOrName: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> | string): Promise<Restaurant | boolean | null> => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        throw new Error('User must be authenticated to add restaurants');    
      }

      // Handle backward compatibility - if just a string is passed, create minimal restaurant data
      const restaurantData = typeof restaurantDataOrName === 'string' 
        ? {
            name: restaurantDataOrName,
            address: '', // Empty string for required field
            city: null, // null for nullable fields
            state: null,
            zip_code: null,
            country: null,
            latitude: null,
            longitude: null,
            manually_added: true,
            // Optional fields - these can be omitted or undefined
            geoapify_place_id: undefined,
            phone: undefined,
            website_url: undefined,
            rating: undefined,
            price_tier: undefined,
            category: undefined,
            opening_hours: undefined,
            created_by: undefined
          }
        : restaurantDataOrName;

      // Check for duplicates before adding using enhanced matching
      const duplicate = await isDuplicateRestaurant(    
        restaurantData.name,    
        restaurantData.address || undefined,    
        restaurantData.geoapify_place_id || undefined    
      );

      if (duplicate) {    
        console.log('Duplicate restaurant found:', duplicate);    
        // For backward compatibility, add to favorites if not already favorited
        const alreadyFavorited = await isAlreadyFavorited(duplicate.id);
        if (!alreadyFavorited) {
          await addToFavorites(duplicate);
        }
        return typeof restaurantDataOrName === 'string' ? true : duplicate;    
      }

      // Add to global restaurants table    
      const { data: newRestaurant, error: insertError } = await supabase    
        .from('restaurants')    
        .insert([{    
          ...restaurantData,    
          created_by: user.id, // Track who added it    
        }])    
        .select()    
        .single();

      if (insertError) {    
        console.error('Error inserting restaurant:', insertError);    
        throw insertError;    
      }

      if (!newRestaurant) {    
        throw new Error('Failed to create restaurant');    
      }

      const restaurant = newRestaurant as Restaurant;

      // Add to user's favorites
      await addToFavorites(restaurant);

      console.log('✅ Restaurant added to global catalog:', restaurant);    
      return typeof restaurantDataOrName === 'string' ? true : restaurant;    
    } catch (err: any) {    
      console.error('Error adding restaurant:', err);    
      if (typeof restaurantDataOrName === 'string') {
        return false; // Backward compatibility
      }
      throw err;    
    }    
  };

  // Add restaurant to user's favorites    
  const addToFavorites = async (restaurant: Restaurant): Promise<void> => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        throw new Error('User must be authenticated');    
      }

      // Check if already favorited    
      const alreadyFavorited = await isAlreadyFavorited(restaurant.id);    
      if (alreadyFavorited) {    
        console.log('Restaurant already in favorites');    
        return;    
      }

      // Add to user_favorite_restaurants    
      const { error: favoriteError } = await supabase    
        .from('user_favorite_restaurants')    
        .insert([{    
          user_id: user.id,    
          restaurant_id: restaurant.id,    
          added_at: new Date().toISOString(),    
        }]);

      if (favoriteError) {    
        console.error('Error adding to favorites:', favoriteError);    
        throw favoriteError;    
      }

      // Update local state    
      setRestaurants(prev => {    
        const updated = [...prev, { ...restaurant, dateAdded: new Date().toISOString() }];    
        return sortRestaurantsArray(updated, sortBy, userLat, userLon);    
      });

      console.log('✅ Restaurant added to favorites');    
    } catch (err: any) {    
      console.error('Error adding to favorites:', err);    
      throw err;    
    }    
  };

  // Combined add restaurant and favorite function    
  const addRestaurantAndFavorite = async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> => {    
    try {    
      // First add to global catalog (or get existing)    
      const result = await addRestaurant(restaurantData);    
      
      // Handle different return types from addRestaurant
      if (typeof result === 'boolean') {
        throw new Error('Expected Restaurant object but got boolean');
      }
      
      if (!result) {    
        throw new Error('Failed to add restaurant to catalog');    
      }

      // result is now guaranteed to be a Restaurant
      const restaurant = result as Restaurant;

      // Check if already favorited to avoid duplicate favorites
      const alreadyFavorited = await isAlreadyFavorited(restaurant.id);
      if (!alreadyFavorited) {
        await addToFavorites(restaurant);
      }

      return restaurant;    
    } catch (err) {    
      console.error('Error in addRestaurantAndFavorite:', err);    
      throw err;    
    }    
  };

  // Remove restaurant from user's favorites    
  const removeFromFavorites = async (restaurantId: string): Promise<void> => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        throw new Error('User must be authenticated');    
      }

      const { error } = await supabase    
        .from('user_favorite_restaurants')    
        .delete()    
        .eq('user_id', user.id)    
        .eq('restaurant_id', restaurantId);

      if (error) {    
        console.error('Error removing from favorites:', error);    
        throw error;    
      }

      // Update local state    
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));    
      console.log('✅ Restaurant removed from favorites');    
    } catch (err: any) {    
      console.error('Error removing from favorites:', err);    
      throw err;    
    }    
  };

  // MISSING FUNCTION 1: Delete restaurant (alias for removeFromFavorites for backward compatibility)
  const deleteRestaurant = async (restaurantId: string): Promise<void> => {
    return removeFromFavorites(restaurantId);
  };

  // MISSING FUNCTION 2: Import restaurant from search results
  const importRestaurant = async (geoapifyPlace: GeoapifyPlace): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Create restaurant data from GeoapifyPlace with proper type handling
      const restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
        name: geoapifyPlace.properties.name,
        address: geoapifyPlace.properties.address_line1 || '', // Empty string for required field
        city: geoapifyPlace.properties.city || null, // null for nullable fields
        state: geoapifyPlace.properties.state || null,
        zip_code: geoapifyPlace.properties.postcode || null,
        country: geoapifyPlace.properties.country || null,
        latitude: geoapifyPlace.properties.lat,
        longitude: geoapifyPlace.properties.lon,
        manually_added: false, // This was imported from an API
        // Optional fields - using undefined for optional properties
        geoapify_place_id: geoapifyPlace.place_id,
        phone: undefined,
        website_url: undefined,
        rating: undefined,
        price_tier: undefined,
        category: undefined,
        opening_hours: undefined,
        created_by: undefined
      };

      // Add restaurant and favorite it
      const restaurant = await addRestaurantAndFavorite(restaurantData);
      return restaurant.id;
    } catch (err: any) {
      console.error('Error importing restaurant:', err);
      throw err;
    }
  };

  // MISSING FUNCTION 3: Clear search results
  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  // MISSING FUNCTION 4: Reset search (clears results and any search state)
  const resetSearch = () => {
    clearSearchResults();
    // Cancel any in-flight search requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return {    
    restaurants,    
    isLoading,    
    error,    
    searchResults,    
    isSearching,    
    searchError,    
    isLoadingDetails,    
    restaurantErrors,    
    searchRestaurants,    
    getRestaurantDetails,    
    addRestaurant,    
    addToFavorites,    
    addRestaurantAndFavorite,    
    removeFromFavorites,    
    isDuplicateRestaurant,    
    isAlreadyFavorited,
    // Missing functions now added:
    deleteRestaurant,
    importRestaurant,
    clearSearchResults,
    resetSearch,
  };    
};