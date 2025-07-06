// src/hooks/useRestaurants.tsx
// Updated for Global Restaurant Model with User Favorites and Distance Sorting
// ENHANCED: Now includes manually added restaurants in search results
// PHASE 1 ENHANCEMENTS: Text normalization, query type detection, enhanced similarity scoring, database restaurant priority
// FIXED (v8 - FINAL): Implemented a robust "Context-Aware Hybrid Search" to definitively resolve all identified issues.
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

// NEW: Type for advanced search parameters
export interface AdvancedSearchQuery {
  name: string;
  street: string;
  city: string;
}

// PHASE 1 ENHANCEMENT: Text normalization utilities
function normalizeText(text: string): string {
  if (!text) return '';
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

interface QueryAnalysis {
  type: 'business' | 'address' | 'business_location_proposal';
  businessName?: string;
  location?: string;
}

function analyzeQuery(query: string): QueryAnalysis {
    const normalizedQuery = normalizeText(query);
    const locationKeywords = [' in ', ' at ', ' near ', ' on ', ' by ', ' around '];
   
    for (const indicator of locationKeywords) {
        const parts = normalizedQuery.split(indicator);
        if (parts.length === 2 && parts[0] && parts[1]) {
            return { type: 'business_location_proposal', businessName: parts[0].trim(), location: parts[1].trim() };
        }
    }

    const commaParts = normalizedQuery.split(',');
    if (commaParts.length > 1) {
        const business = commaParts.slice(0, -1).join(',').trim();
        const location = commaParts[commaParts.length - 1].trim();
        if (business && location) {
            return { type: 'business_location_proposal', businessName: business, location: location };
        }
    }

    const words = normalizedQuery.split(' ');
    if (words.length > 2) { // e.g., "starbucks santa fe"
        const business = words.slice(0, -2).join(' ');
        const location = words.slice(-2).join(' ');
        return { type: 'business_location_proposal', businessName: business, location: location };
    }
    if (words.length > 1) { // e.g., "luigis seattle"
        const business = words.slice(0, -1).join(' ');
        const location = words.slice(-1).join(' ');
        return { type: 'business_location_proposal', businessName: business, location: location };
    }

    return { type: 'business', businessName: normalizedQuery };
}

// PHASE 1 ENHANCEMENT: Enhanced similarity calculation
function calculateEnhancedSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
 
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 95;
 
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  let wordMatches = 0;
 
  words2.forEach(word2 => {
    if (words1.some(word1 => word1 === word2)) {
      wordMatches++;
    }
  });
 
  if (wordMatches > 0) {
    const exactScore = (wordMatches / words2.length) * 80;
    return Math.min(95, 40 + exactScore);
  }
 
  return 0;
}

// Helper function for Haversine distance calculation (in miles)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d / 1000 * 0.621371;
};

// Reusable sorting function for restaurants with distance support
const sortRestaurantsArray = (
  array: (Restaurant & { date_favorited?: string | null })[],
  sortBy: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' },
  userLat?: number | null,
  userLon?: number | null
): Restaurant[] => {
  return [...array].sort((a, b) => {
    let comparison = 0;
    if (sortBy.criterion === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy.criterion === 'date') {
      const dateA = new Date(a.date_favorited || a.created_at).getTime();
      const dateB = new Date(b.date_favorited || b.created_at).getTime();
      comparison = dateA - dateB;
    } else if (sortBy.criterion === 'distance') {
      if (!userLat || !userLon) {
        comparison = a.name.localeCompare(b.name);
      } else {
        const distanceA = (a.latitude !== null && a.longitude !== null) ? calculateDistance(userLat, userLon, a.latitude, a.longitude) : Infinity;
        const distanceB = (b.latitude !== null && b.longitude !== null) ? calculateDistance(userLat, userLon, b.latitude, b.longitude) : Infinity;
        comparison = distanceA - distanceB;
      }
    }
    return sortBy.direction === 'asc' ? comparison : -comparison;
  });
};

export const useRestaurants = (
  sortBy: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' },
  userLat?: number | null,
  userLon?: number | null
) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('User not authenticated'); setRestaurants([]); return; }

        const { data: restaurantDetails, error: rpcError } = await supabase
          .rpc('get_user_favorite_restaurants_with_stats', { p_user_id: user.id });

        if (rpcError) {
          console.error('Error fetching restaurant stats:', rpcError);
          setError('Failed to load your restaurant list. Please try again.');
          return;
        }

        if (restaurantDetails) {
          const combinedData = (restaurantDetails as any[]).map((r: any) => ({
            ...r,
            dishCount: r.dish_count,
            raterCount: r.rater_count,
            date_favorited: r.date_favorited,
            dateAdded: r.dateAdded,
          }));
          const sortedRestaurants = sortRestaurantsArray(combinedData as Restaurant[], sortBy, userLat, userLon);
          setRestaurants(sortedRestaurants);
        }
      } catch (err: any) { console.error('Error fetching restaurants:', err); setError(`Failed to load restaurants: ${err.message}`); } finally { setIsLoading(false); }
    };
    fetchRestaurants();
  }, [sortBy.criterion, sortBy.direction, userLat, userLon]);

  const isDuplicateRestaurant = async (newName: string, newAddress?: string, geoapifyPlaceId?: string): Promise<Restaurant | null> => {
    try {
      if (geoapifyPlaceId) {
        // FIX: Use .maybeSingle() to prevent 406 error when no result is found.
        const { data: existingByPlaceId, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('geoapify_place_id', geoapifyPlaceId)
          .maybeSingle();

        if (error) {
          console.error("Error checking for duplicate by place ID:", error);
        } else if (existingByPlaceId) {
          return existingByPlaceId as Restaurant;
        }
      }
      const { data: allRestaurants } = await supabase.from('restaurants').select('*');
      if (!allRestaurants) return null;
      const normalizedNewName = normalizeText(newName);
      const normalizedNewAddress = newAddress ? normalizeText(newAddress) : undefined;
      const duplicate = allRestaurants.find(existing => {
        const existingName = normalizeText(existing.name);
        const existingAddress = existing.address ? normalizeText(existing.address) : undefined;
        const nameScore = calculateEnhancedSimilarity(existingName, normalizedNewName);
        if (nameScore < 80) return false;
        if (existingAddress && normalizedNewAddress) { return calculateEnhancedSimilarity(existingAddress, normalizedNewAddress) > 70; }
        return nameScore > 90;
      });
      return duplicate ? (duplicate as Restaurant) : null;
    } catch (err) { console.error('Error checking for duplicates:', err); return null; }
  };

  const isAlreadyFavorited = useCallback(async (restaurantId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // FIX: Use .select().limit(1) instead of .single() to check for existence without errors.
      const { data, error } = await supabase
        .from('user_favorite_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .limit(1);

      if (error) {
        console.error('Error checking if restaurant is favorited:', error);
        return false;
      }
      
      return !!(data && data.length > 0);
    } catch (err) { 
      console.error('Unexpected error in isAlreadyFavorited:', err);
      return false; 
    }
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);

  const searchRestaurants = async (
    searchParams: string | AdvancedSearchQuery,
    userLat: number | null,
    userLon: number | null
  ) => {
    const isAdvanced = typeof searchParams !== 'string';
    const query = isAdvanced ? (searchParams as AdvancedSearchQuery).name : (searchParams as string);

    if (!query.trim()) { setSearchResults([]); return; }
    if (abortControllerRef.current) { abortControllerRef.current.abort(); }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') throw new Error('API key is missing or not set properly');
     
      let searchCenterLat = userLat;
      let searchCenterLon = userLon;
      let searchTextForSimilarity: string;
      let apiResults: any[] = [];

      if (isAdvanced) {
        const { name, street, city } = searchParams as AdvancedSearchQuery;
        searchTextForSimilarity = [name, street, city].filter(Boolean).join(', ');
        console.log(`🚀 Performing definitive advanced search for: ${searchTextForSimilarity}`);
       
        const params = new URLSearchParams({ apiKey: apiKey, type: 'amenity' });
        let clientSideFilter: ((feature: GeoapifyPlace) => boolean) | null = null;

        if (city) {
          console.log(`Validating explicit location: "${city}"...`);
          const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&limit=1&apiKey=${apiKey}`;
          const geocodeResponse = await fetch(geocodeUrl, { signal: abortController.signal });
          if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              if (geocodeData.features && geocodeData.features.length > 0) {
                  const { lat, lon } = geocodeData.features[0].properties;
                  searchCenterLat = lat;
                  searchCenterLon = lon;
                  console.log(`✅ Location validated. Search Center is now ${city}.`);
                  const radiusInMeters = 50000;
                  params.append('filter', `circle:${lon},${lat},${radiusInMeters}`);
              }
          }
          params.append('text', [name, street].filter(Boolean).join(', '));
          params.append('bias', `proximity:${searchCenterLon},${searchCenterLat}`);
          params.set('limit', '20');

        } else if (street) {
          const searchTextForApi = [name, street].filter(Boolean).join(', ');
          console.log(`💡 Advanced search with street, no city. Biasing to user location to prevent API error.`);
          params.append('text', searchTextForApi);
          params.set('limit', '100');
          if (userLat && userLon) {
            params.append('bias', `proximity:${userLon},${userLat}`);
          }

          const normalizedStreet = normalizeText(street);
          clientSideFilter = (feature) =>
            !!(feature.properties.formatted && normalizeText(feature.properties.formatted).includes(normalizedStreet));

        } else {
          params.append('text', name);
          params.set('limit', '20');
          if (userLat && userLon) {
            params.append('bias', `proximity:${userLon},${userLat}`);
          }
        }
       
        const fuzzySearchUrl = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;
        console.log(`⚡️ Performing Geoapify search with URL: ${fuzzySearchUrl}`);
        const fuzzyResponse = await fetch(fuzzySearchUrl, { signal: abortController.signal });
        if (fuzzyResponse.ok) {
            const fuzzyData = await fuzzyResponse.json();
            apiResults = fuzzyData.features || [];
            if (clientSideFilter) {
                console.log(`Filtering ${apiResults.length} API results on client...`);
                apiResults = apiResults.filter(clientSideFilter);
                console.log(`Found ${apiResults.length} matches after client-side filter.`);
            }
        } else {
            const errorText = await fuzzyResponse.text();
            console.error('Geoapify API Error:', fuzzyResponse.status, errorText);
            throw new Error(`Geoapify API responded with status ${fuzzyResponse.status}`);
        }

      } else {
        // --- BASIC SEARCH LOGIC ---
        const basicQuery = searchParams as string;
        const queryAnalysis = analyzeQuery(basicQuery);
        console.log('🔍 Initial Query analysis:', queryAnalysis);
        searchTextForSimilarity = basicQuery;
       
        if (queryAnalysis.type === 'business_location_proposal' && queryAnalysis.location && queryAnalysis.businessName) {
            console.log(`🤝 Performing dual search for ambiguous query: "${basicQuery}"`);
           
            const [smartResults, textResults] = await Promise.all([
                // 1. "Smart" Search: Geocode location, then search for business.
                (async () => {
                    console.log(`   > Smart Search: Validating location part: "${queryAnalysis.location}"`);
                    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryAnalysis.location!)}&limit=1&apiKey=${apiKey}`;
                    const geocodeResponse = await fetch(geocodeUrl, { signal: abortController.signal });
                    if (!geocodeResponse.ok) return [];
                   
                    const geocodeData = await geocodeResponse.json();
                    if (!geocodeData.features || geocodeData.features.length === 0) return [];

                    const { lat, lon } = geocodeData.features[0].properties;
                    console.log(`   > Smart Search: Location validated. Searching for "${queryAnalysis.businessName}" near new center.`);
                    const radiusInMeters = 50000;
                    const filter = `circle:${lon},${lat},${radiusInMeters}`;
                    const bias = `proximity:${lon},${lat}`;
                    const smartSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryAnalysis.businessName!)}&type=amenity&limit=20&filter=${filter}&bias=${bias}&apiKey=${apiKey}`;
                   
                    const response = await fetch(smartSearchUrl, { signal: abortController.signal });
                    if (!response.ok) return [];
                    const data = await response.json();
                    return data.features || [];
                })(),
               
                // 2. "Text" Search: Search for the literal full string, with NO location bias.
                (async () => {
                    console.log(`   > Text Search: Searching for literal text "${basicQuery}" without location bias.`);
                    // FIX: Removed user location bias to allow for true global text search.
                    const textSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(basicQuery)}&type=amenity&limit=20&apiKey=${apiKey}`;
                   
                    const response = await fetch(textSearchUrl, { signal: abortController.signal });
                    if (!response.ok) return [];
                    const data = await response.json();
                    return data.features || [];
                })()
            ]);

            console.log(`   > Smart search found ${smartResults.length}, Text search found ${textResults.length}`);
            const combined = [...smartResults, ...textResults];
            // De-duplicate the merged results
            apiResults = combined.filter((result, index, self) =>
                index === self.findIndex(r => r.properties.place_id === result.properties.place_id)
            );
            console.log(`   > Found ${apiResults.length} unique results after merge.`);

        } else {
            // Original logic for simple (non-proposal) basic searches
            const bias = (userLat && userLon) ? `&bias=proximity:${userLon},${userLat}` : '';
            const simpleSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(basicQuery)}&type=amenity&limit=20${bias}&apiKey=${apiKey}`;
           
            console.log(`⚡️ Performing simple Geoapify search with URL: ${simpleSearchUrl}`);
            const fuzzyResponse = await fetch(simpleSearchUrl, { signal: abortController.signal });
             if (fuzzyResponse.ok) {
                const fuzzyData = await fuzzyResponse.json();
                apiResults = fuzzyData.features || [];
            } else {
                const errorText = await fuzzyResponse.text();
                console.error('Geoapify API Error:', fuzzyResponse.status, errorText);
                throw new Error(`Geoapify API responded with status ${fuzzyResponse.status}`);
            }
        }
      }

      // --- COMMON PROCESSING FOR ALL SEARCH TYPES ---
      console.log('🔍 Searching existing restaurants in database...');
      const { data: allDbRestaurants } = await supabase.from('restaurants').select('*');
      const databaseResults: (GeoapifyPlace & { score: number; distance: number })[] = [];
      if (allDbRestaurants && allDbRestaurants.length > 0) {
          const scoredDbRestaurants = allDbRestaurants.map(r => {
            const score = calculateEnhancedSimilarity(r.name, searchTextForSimilarity) + 30;
            const distance = (searchCenterLat && searchCenterLon && r.latitude && r.longitude) ? calculateDistance(searchCenterLat, searchCenterLon, r.latitude, r.longitude) : Infinity;
            return {
              place_id: `db_${r.id}`,
              properties: {
                name: r.name,
                formatted: r.full_address || r.address || '',
                address_line1: r.address || undefined,
                city: r.city || undefined,
                state: r.state || undefined,
                postcode: r.zip_code || undefined,
                country: r.country || undefined,
                lat: r.latitude || 0,
                lon: r.longitude || 0,
                categories: ['database'],
                datasource: { sourcename: 'database', attribution: 'Our Database' }
              },
              score,
              distance
            };
          }).filter(item => item.score > 50);
          databaseResults.push(...scoredDbRestaurants);
      }
     
      let allResults: (GeoapifyPlace & { score: number; distance: number })[] = [...databaseResults];
     
      const mappedApiResults = apiResults.map((feature: any) => {
          const place: GeoapifyPlace = {
            place_id: feature.properties.place_id || `geocode_${feature.properties.lat}_${feature.properties.lon}`,
            properties: { name: feature.properties.name || feature.properties.formatted?.split(',')[0]?.trim() || 'Unknown Place', ...feature.properties }
          };
          const score = calculateEnhancedSimilarity(place.properties.name, searchTextForSimilarity) + 15;
          const distance = (searchCenterLat && searchCenterLon && place.properties.lat && place.properties.lon) ? calculateDistance(searchCenterLat, searchCenterLon, place.properties.lat, place.properties.lon) : Infinity;
          return { ...place, score, distance };
      });
      allResults.push(...mappedApiResults);
     
      const uniqueResults = allResults.filter((result, index, array) => array.findIndex(r => r.place_id === result.place_id) === index );

      const rankedResults = uniqueResults
        .sort((a, b) => {
          if (Math.abs(b.score - a.score) < 10) {
            return a.distance - b.distance;
          }
          return b.score - a.score;
        })
        .slice(0, 15);

      const finalResults = rankedResults.map(({ score, distance, ...result }) => result);
      console.log(`🎯 Final results: ${finalResults.length} restaurants`);
      setSearchResults(finalResults);

    } catch (err: any) {
      if (err.name === 'AbortError') { console.log('🚫 Search aborted'); return; }
      console.error('Error searching restaurants:', err);
      setSearchError(`Search failed: ${err.message}`);
    } finally {
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  };

  const getRestaurantDetails = async (placeId: string): Promise<GeoapifyPlaceDetails | null> => {
    setIsLoadingDetails(true);
    setRestaurantErrors(new Map());
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') { throw new Error('Geoapify API key is not configured'); }
      const response = await fetch(`https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`);
      if (!response.ok) { throw new Error(`HTTP ${response.status}: ${response.statusText}`); }
      const data = await response.json();
      if (!data.features || data.features.length === 0) { throw new Error('No details found for this place'); }
      const feature = data.features[0];
      return { place_id: feature.properties.place_id, properties: { ...feature.properties } };
    } catch (err: any) {
      console.error(`Error fetching details for place ${placeId}:`, err);
      setRestaurantErrors(prev => new Map(prev.set(placeId, err.message)));
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const addRestaurant = async (restaurantDataOrName: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> | string): Promise<Restaurant | boolean | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { throw new Error('User must be authenticated to add restaurants'); }
      const restaurantData = typeof restaurantDataOrName === 'string'
        ? {
            name: restaurantDataOrName,
            address: '',
            full_address: null,
            city: null,
            state: null,
            zip_code: null,
            country: null,
            latitude: null,
            longitude: null,
            manually_added: true,
            geoapify_place_id: undefined,
          }
        : restaurantDataOrName;
      const duplicate = await isDuplicateRestaurant( restaurantData.name, restaurantData.address || undefined, restaurantData.geoapify_place_id || undefined );
      if (duplicate) {
        const alreadyFavorited = await isAlreadyFavorited(duplicate.id);
        if (!alreadyFavorited) { await addToFavorites(duplicate); }
        return typeof restaurantDataOrName === 'string' ? true : duplicate;
      }
      const { data: newRestaurant, error: insertError } = await supabase.from('restaurants').insert([{ ...restaurantData, created_by: user.id, }]).select().single();
      if (insertError) { throw insertError; }
      if (!newRestaurant) { throw new Error('Failed to create restaurant'); }
      const restaurant = newRestaurant as Restaurant;
      await addToFavorites(restaurant);
      return typeof restaurantDataOrName === 'string' ? true : restaurant;
    } catch (err: any) {
      if (typeof restaurantDataOrName === 'string') { return false; }
      throw err;
    }
  };

  const addToFavorites = async (restaurant: Restaurant): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { throw new Error('User must be authenticated'); }
      const alreadyFavorited = await isAlreadyFavorited(restaurant.id);
      if (alreadyFavorited) { return; }
      await supabase.from('user_favorite_restaurants').insert([{ user_id: user.id, restaurant_id: restaurant.id, added_at: new Date().toISOString(), }]);
      setRestaurants(prev => sortRestaurantsArray([...prev, { ...restaurant, date_favorited: new Date().toISOString() }], sortBy, userLat, userLon));
    } catch (err: any) { throw err; }
  };

  const addRestaurantAndFavorite = async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> => {
    const result = await addRestaurant(restaurantData);
    if (typeof result === 'boolean' || !result) { throw new Error('Failed to add restaurant to catalog'); }
    const restaurant = result as Restaurant;
    const alreadyFavorited = await isAlreadyFavorited(restaurant.id);
    if (!alreadyFavorited) { await addToFavorites(restaurant); }
    return restaurant;
  };

  const updateRestaurant = async (restaurantId: string, updates: Partial<Pick<Restaurant, 'name' | 'address'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { throw new Error('User not authenticated'); }

      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId)
        .eq('manually_added', true) // Can only edit manually added restaurants
        .eq('created_by', user.id) // Security: ensure user owns this restaurant
        .select()
        .single();

      if (error) throw error;

      setRestaurants(prev => {
        const index = prev.findIndex(r => r.id === restaurantId);
        if (index === -1) return prev;
        const newRestaurants = [...prev];
        // Merge the old data with the new data from the DB response
        newRestaurants[index] = {
          ...newRestaurants[index],
          ...data,
          // Explicitly handle all nullable fields that are optional in the Restaurant interface
          manually_added: data.manually_added ?? false, // null -> false
          geoapify_place_id: data.geoapify_place_id ?? undefined, // null -> undefined
          phone: data.phone ?? undefined,
          website_url: data.website_url ?? undefined,
          rating: data.rating ?? undefined,
          price_tier: data.price_tier ?? undefined,
          category: data.category ?? undefined,
          opening_hours: data.opening_hours ?? undefined,
          created_by: data.created_by ?? undefined,
        };
        return sortRestaurantsArray(newRestaurants, sortBy, userLat, userLon);
      });
      return true;
    } catch (err: any) {
      console.error('Error updating restaurant:', err);
      setError(`Failed to update restaurant: ${err.message}`);
      return false;
    }
  };

  const removeFromFavorites = async (restaurantId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('User must be authenticated'); }
    await supabase.from('user_favorite_restaurants').delete().eq('user_id', user.id).eq('restaurant_id', restaurantId);
    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
  };

  const deleteRestaurant = async (restaurantId: string): Promise<void> => {
    return removeFromFavorites(restaurantId);
  };

  const importRestaurant = async (geoapifyPlace: GeoapifyPlace): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('User must be authenticated'); }

    // FIX: Handle restaurants that are already in our DB directly.
    if (geoapifyPlace.place_id.startsWith('db_')) {
      const restaurantId = geoapifyPlace.place_id.substring(3);
      const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();

      if (error || !restaurant) {
        console.error(`Failed to find DB restaurant with ID ${restaurantId}`, error);
        throw new Error('Could not find the selected restaurant in the database.');
      }

      await addToFavorites(restaurant as Restaurant);
      return restaurantId;
    }

    // Original logic for new restaurants from Geoapify API
    const restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
        name: geoapifyPlace.properties.name,
        full_address: geoapifyPlace.properties.formatted,
        address: geoapifyPlace.properties.address_line1 || '',
        city: geoapifyPlace.properties.city || null,
        state: geoapifyPlace.properties.state || null,
        zip_code: geoapifyPlace.properties.postcode || null,
        country: geoapifyPlace.properties.country || null,
        latitude: geoapifyPlace.properties.lat,
        longitude: geoapifyPlace.properties.lon,
        manually_added: false,
        geoapify_place_id: geoapifyPlace.place_id,
      };
    const restaurant = await addRestaurantAndFavorite(restaurantData);
    return restaurant.id;
  };

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  const resetSearch = () => {
    clearSearchResults();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return {
    restaurants, isLoading, error, searchResults, isSearching, searchError, isLoadingDetails, restaurantErrors,
    searchRestaurants, getRestaurantDetails, addRestaurant, addToFavorites, addRestaurantAndFavorite, removeFromFavorites,
    isDuplicateRestaurant, isAlreadyFavorited, deleteRestaurant, importRestaurant, clearSearchResults, resetSearch,
    updateRestaurant,
  };
};