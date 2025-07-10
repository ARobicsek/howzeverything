// src/hooks/useRestaurants.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types/restaurant';
import { parseAddress } from '../utils/addressParser';
import { incrementGeoapifyCount, logGeoapifyCount } from '../utils/apiCounter';
import { calculateEnhancedSimilarity, normalizeText } from '../utils/textUtils';
interface RestaurantWithStats extends Restaurant {
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
export interface AdvancedSearchQuery {
  name: string;
  street: string;
  city: string;
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
    if (words.length > 2) {
        const business = words.slice(0, -2).join(' ');
        const location = words.slice(-2).join(' ');
        return { type: 'business_location_proposal', businessName: business, location: location };
    }
    if (words.length > 1) {
        const business = words.slice(0, -1).join(' ');
        const location = words.slice(-1).join(' ');
        return { type: 'business_location_proposal', businessName: business, location: location };
    }
    return { type: 'business', businessName: normalizedQuery };
}
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
const formatDistanceMiles = (distanceMiles: number): string => {
    if (distanceMiles < 0.2) {
        const feet = Math.round(distanceMiles * 5280);
        return `${feet} ft`;
    }
    if (distanceMiles < 10) {
        return `${distanceMiles.toFixed(1)} mi`;
    }
    return `${Math.round(distanceMiles)} mi`;
};
const sortRestaurantsArray = (
  array: RestaurantWithStats[],
  sortBy: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' },
  userLat?: number | null,
  userLon?: number | null
): RestaurantWithStats[] => {
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
const geocodeAddress = async (addressData: Partial<Restaurant>): Promise<{ latitude: number; longitude: number } | null> => {
  const addressString = [
    addressData.address,
    addressData.city,
    addressData.state,
    addressData.zip_code,
    addressData.country,
  ]
    .filter(Boolean)
    .join(', ');
  if (!addressString) {
    return null;
  }
  try {
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return null;
    }
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      addressString
    )}&limit=1&apiKey=${apiKey}`;
    incrementGeoapifyCount();
    logGeoapifyCount();
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const { lat, lon } = data.features[0].properties;
      return { latitude: lat, longitude: lon };
    } else {
      return null;
    }
  } catch (error) {
    console.error('An unexpected error occurred during geocoding:', error);
    return null;
  }
};
interface UseRestaurantsOptions {
  sortBy?: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' };
  userLat?: number | null;
  userLon?: number | null;
  initialFetch?: boolean;
}
const defaultSortBy = { criterion: 'name' as const, direction: 'asc' as const };
export const useRestaurants = (options: UseRestaurantsOptions = {}) => {
  const { sortBy = defaultSortBy, userLat, userLon, initialFetch = true } = options;
  const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(initialFetch);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [restaurantErrors, setRestaurantErrors] = useState<Map<string, string>>(new Map());
  const [searchCache, setSearchCache] = useState<Map<string, GeoapifyPlace[]>>(new Map());
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
          setError('Failed to load your restaurant list. Please try again.');
          return;
        }
        if (restaurantDetails) {
          const combinedData: RestaurantWithStats[] = (restaurantDetails as any[]).map((r: any) => {
            let distance: string | undefined = undefined;
            if (userLat != null && userLon != null && r.latitude != null && r.longitude != null) {
              const distMiles = calculateDistance(userLat, userLon, r.latitude, r.longitude);
              distance = formatDistanceMiles(distMiles);
            }
            return {
              ...r,
              dishCount: r.dish_count,
              raterCount: r.rater_count,
              date_favorited: r.date_favorited ?? undefined,
              dateAdded: r.dateAdded,
              distance,
            };
          });
          const sortedRestaurants = sortRestaurantsArray(combinedData, sortBy, userLat, userLon);
          setRestaurants(sortedRestaurants);
        }
      } catch (err: any) { setError(`Failed to load restaurants: ${err.message}`); } finally { setIsLoading(false); }
    };
    if (initialFetch) {
        fetchRestaurants();
    }
  }, [sortBy, userLat, userLon, initialFetch]);
  const isDuplicateRestaurant = useCallback(async (newName: string, newAddress?: string, geoapifyPlaceId?: string): Promise<Restaurant | null> => {
    try {
      if (geoapifyPlaceId) {
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
  }, []);
  const findSimilarRestaurants = useCallback(async (newName: string, newAddress?: string): Promise<Restaurant[]> => {
    try {
      const { data: allRestaurants } = await supabase.from('restaurants').select('*');
      if (!allRestaurants) return [];
      const normalizedNewName = normalizeText(newName);
      const normalizedNewAddress = newAddress ? normalizeText(newAddress) : undefined;
      const similar = allRestaurants.filter(existing => {
        const existingName = normalizeText(existing.name);
        const existingAddress = existing.address ? normalizeText(existing.address) : undefined;
        const nameScore = calculateEnhancedSimilarity(existingName, normalizedNewName);
        if (nameScore < 80) return false;
        if (existingAddress && normalizedNewAddress) {
          if (calculateEnhancedSimilarity(existingAddress, normalizedNewAddress) > 70) {
            return true;
          }
        }
        return nameScore > 90;
      });
      return similar as Restaurant[];
    } catch (err) {
      console.error('Error finding similar restaurants:', err);
      return [];
    }
  }, []);
  const isAlreadyFavorited = useCallback(async (restaurantId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase
        .from('user_favorite_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .limit(1);
      if (error) {
        return false;
      }
      return !!(data && data.length > 0);
    } catch (err) {
      return false;
    }
  }, []);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchRestaurants = useCallback(async (
    searchParams: string | AdvancedSearchQuery,
    userLat: number | null,
    userLon: number | null
  ) => {
    const isAdvanced = typeof searchParams !== 'string';
    const query = isAdvanced ? (searchParams as AdvancedSearchQuery).name : (searchParams as string);
    if (!query.trim()) { setSearchResults([]); return; }
    const latKey = userLat?.toFixed(4) || 'null';
    const lonKey = userLon?.toFixed(4) || 'null';
    const cacheKey = `search_${JSON.stringify(searchParams)}_${latKey}_${lonKey}`;
    if (searchCache.has(cacheKey)) {
        setSearchResults(searchCache.get(cacheKey)!);
        setIsSearching(false);
        return;
    }
    if (abortControllerRef.current) { abortControllerRef.current.abort(); }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') throw new Error('API key is missing or not set properly');
      let searchTextForSimilarity: string;
      let rawApiFeatures: any[] = [];
      if (isAdvanced) {
        const { name, street, city } = searchParams as AdvancedSearchQuery;
        searchTextForSimilarity = [name, street, city].filter(Boolean).join(', ');
        const params = new URLSearchParams({ apiKey: apiKey, type: 'amenity' });
        let clientSideFilter: ((feature: any) => boolean) | null = null;
        if (city) {
          const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&limit=1&apiKey=${apiKey}`;
          incrementGeoapifyCount();
          logGeoapifyCount();
          const geocodeResponse = await fetch(geocodeUrl, { signal: abortController.signal });
          if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              if (geocodeData.features && geocodeData.features.length > 0) {
                  const { lat, lon } = geocodeData.features[0].properties;
                  params.append('filter', `circle:${lon},${lat},50000`);
                  params.append('bias', `proximity:${lon},${lat}`);
              }
          }
          params.append('text', [name, street].filter(Boolean).join(', '));
          params.set('limit', '20');
        } else if (street) {
          params.append('text', [name, street].filter(Boolean).join(', '));
          params.set('limit', '100');
          if (userLat && userLon) params.append('bias', `proximity:${userLon},${userLat}`);
          const normalizedStreet = normalizeText(street);
          clientSideFilter = (f) => !!(f.properties.formatted && normalizeText(f.properties.formatted).includes(normalizedStreet));
        } else {
          params.append('text', name);
          params.set('limit', '20');
          if (userLat && userLon) params.append('bias', `proximity:${userLon},${userLat}`);
        }
        const fuzzySearchUrl = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;
        incrementGeoapifyCount();
        logGeoapifyCount();
        const fuzzyResponse = await fetch(fuzzySearchUrl, { signal: abortController.signal });
        if (fuzzyResponse.ok) {
            const fuzzyData = await fuzzyResponse.json();
            rawApiFeatures = fuzzyData.features || [];
            if (clientSideFilter) rawApiFeatures = rawApiFeatures.filter(clientSideFilter);
        } else { throw new Error(`Geoapify API responded with status ${fuzzyResponse.status}`); }
      } else {
        const basicQuery = searchParams as string;
        const queryAnalysis = analyzeQuery(basicQuery);
        searchTextForSimilarity = basicQuery;
        if (queryAnalysis.type === 'business_location_proposal' && queryAnalysis.location && queryAnalysis.businessName) {
            const [smartResults, textResults] = await Promise.all([
                (async () => {
                    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryAnalysis.location!)}&limit=1&apiKey=${apiKey}`;
                    incrementGeoapifyCount();
                    logGeoapifyCount();
                    const geocodeResponse = await fetch(geocodeUrl, { signal: abortController.signal });
                    if (!geocodeResponse.ok) return [];
                    const geocodeData = await geocodeResponse.json();
                    if (!geocodeData.features || geocodeData.features.length === 0) return [];
                    const { lat, lon } = geocodeData.features[0].properties;
                    const smartSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryAnalysis.businessName!)}&type=amenity&limit=20&filter=circle:${lon},${lat},50000&bias=proximity:${lon},${lat}&apiKey=${apiKey}`;
                    incrementGeoapifyCount();
                    logGeoapifyCount();
                    const response = await fetch(smartSearchUrl, { signal: abortController.signal });
                    return response.ok ? (await response.json()).features || [] : [];
                })(),
                (async () => {
                    const textSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(basicQuery)}&type=amenity&limit=20&apiKey=${apiKey}`;
                    incrementGeoapifyCount();
                    logGeoapifyCount();
                    const response = await fetch(textSearchUrl, { signal: abortController.signal });
                    return response.ok ? (await response.json()).features || [] : [];
                })()
            ]);
            const combined = [...smartResults, ...textResults];
            rawApiFeatures = combined.filter((result, index, self) =>
                index === self.findIndex(r => r.properties.place_id === result.properties.place_id)
            );
        } else {
            const bias = (userLat && userLon) ? `&bias=proximity:${userLon},${userLon}` : '';
            const simpleSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(basicQuery)}&type=amenity&limit=20${bias}&apiKey=${apiKey}`;
            incrementGeoapifyCount();
            logGeoapifyCount();
            const fuzzyResponse = await fetch(simpleSearchUrl, { signal: abortController.signal });
             if (fuzzyResponse.ok) {
                const fuzzyData = await fuzzyResponse.json();
                rawApiFeatures = fuzzyData.features || [];
            } else { throw new Error(`Geoapify API responded with status ${fuzzyResponse.status}`); }
        }
      }
      const apiPlaces: GeoapifyPlace[] = rawApiFeatures
        .filter(f => f && f.properties && f.properties.place_id)
        .map(f => {
          const props = f.properties;
          let cleanAddress = props.address_line1;
          let cleanCity = props.city;
          if (cleanAddress && calculateEnhancedSimilarity(cleanAddress, props.name) > 90) {
            cleanAddress = null;
          }
          if (!cleanAddress) {
              const addressToParseFrom = props.address_line2 || props.formatted;
              if (addressToParseFrom) {
                  const namePattern = new RegExp(`^${props.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[, ]*`, 'i');
                  const addressToParse = addressToParseFrom.replace(namePattern, '');
                  const parsed = parseAddress(addressToParse);
                  if (parsed.data) {
                      cleanAddress = parsed.data.address || cleanAddress;
                      cleanCity = parsed.data.city || cleanCity;
                  }
              }
          }
          return {
              place_id: props.place_id,
              properties: {
                  ...props,
                  address_line1: cleanAddress,
                  city: cleanCity,
              }
          };
        });
      const { data: allDbRestaurants } = await supabase.from('restaurants').select('*');
      const dbMatches = (allDbRestaurants || [])
        .map(r => ({
            restaurant: r,
            score: calculateEnhancedSimilarity(r.name, searchTextForSimilarity)
        }))
        .filter(item => item.score > 60)
        .map(match => {
            const r = match.restaurant;
            return {
                place_id: `db_${r.id}`,
                properties: {
                    name: r.name,
                    formatted: r.full_address || [r.address, r.city, r.state, r.zip_code].filter(Boolean).join(', '),
                    address_line1: r.address || undefined,
                    city: r.city || undefined,
                    state: r.state || undefined,
                    postcode: r.zip_code || undefined,
                    country: r.country || undefined,
                    lat: r.latitude || 0,
                    lon: r.longitude || 0,
                    categories: ['database'],
                    datasource: { sourcename: 'database', attribution: 'Our Database' }
                }
            };
        });
      const uniqueApiPlaces: GeoapifyPlace[] = [];
      for (const apiPlace of apiPlaces) {
          const isDuplicateOfDb = dbMatches.some(dbMatch =>
              calculateEnhancedSimilarity(dbMatch.properties.name, apiPlace.properties.name) > 95 &&
              calculateEnhancedSimilarity(dbMatch.properties.address_line1 || dbMatch.properties.formatted, apiPlace.properties.address_line1 || apiPlace.properties.formatted) > 70
          );
          if (isDuplicateOfDb) continue;
          const existingMatchIndex = uniqueApiPlaces.findIndex(uniquePlace =>
              calculateEnhancedSimilarity(uniquePlace.properties.name, apiPlace.properties.name) > 95 &&
              calculateEnhancedSimilarity(uniquePlace.properties.address_line1 || uniquePlace.properties.formatted, apiPlace.properties.address_line1 || apiPlace.properties.formatted) > 80
          );
          if (existingMatchIndex !== -1) {
              const existingPlace = uniqueApiPlaces[existingMatchIndex];
              const isNewPlaceBetter =
                  (apiPlace.properties.address_line1 && !existingPlace.properties.address_line1) ||
                  (apiPlace.properties.formatted.length > existingPlace.properties.formatted.length);
              if (isNewPlaceBetter) {
                  uniqueApiPlaces[existingMatchIndex] = apiPlace;
              }
          } else {
              uniqueApiPlaces.push(apiPlace);
          }
      }
      const combinedResults = [...dbMatches, ...uniqueApiPlaces];
      setSearchResults(combinedResults);
      setSearchCache(prev => new Map(prev).set(cacheKey, combinedResults));
    } catch (err: any) {
      if (err.name === 'AbortError') { return; }
      console.error('Error searching restaurants:', err);
      setSearchError(`Search failed: ${err.message}`);
    } finally {
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  }, [userLat, userLon, searchCache]);
  const getRestaurantDetails = useCallback(async (placeId: string): Promise<GeoapifyPlaceDetails | null> => {
    setIsLoadingDetails(true);
    setRestaurantErrors(new Map());
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') { throw new Error('Geoapify API key is not configured'); }
      incrementGeoapifyCount();
      logGeoapifyCount();
      const response = await fetch(`https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`);
      if (!response.ok) { throw new Error(`HTTP ${response.status}: ${response.statusText}`); }
      const data = await response.json();
      if (!data.features || data.features.length === 0) { throw new Error('No details found for this place'); }
      const feature = data.features[0];
      return { place_id: feature.properties.place_id, properties: { ...feature.properties } };
    } catch (err: any) {
      setRestaurantErrors(prev => new Map(prev.set(placeId, err.message)));
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);
  const addToFavorites = useCallback(async (restaurant: Restaurant): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { throw new Error('User must be authenticated'); }
      const alreadyFavorited = await isAlreadyFavorited(restaurant.id);
      if (alreadyFavorited) { return; }
      await supabase.from('user_favorite_restaurants').insert([{ user_id: user.id, restaurant_id: restaurant.id, added_at: new Date().toISOString(), }]);
      setRestaurants(prev => sortRestaurantsArray([...prev, { ...restaurant, date_favorited: new Date().toISOString() }], sortBy, userLat, userLon));
    } catch (err: any) { throw err; }
  }, [isAlreadyFavorited, sortBy, userLat, userLon]);
  const addRestaurant = useCallback(async (restaurantDataOrName: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> | string): Promise<Restaurant | boolean | null> => {
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
      if (restaurantData.address && (restaurantData.latitude === null || restaurantData.longitude === null)) {
        const coords = await geocodeAddress(restaurantData);
        if (coords) {
          restaurantData.latitude = coords.latitude;
          restaurantData.longitude = coords.longitude;
        }
      }
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
  }, [addToFavorites, isAlreadyFavorited, isDuplicateRestaurant]);
  const addRestaurantAndFavorite = useCallback(async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> => {
    const result = await addRestaurant(restaurantData);
    if (typeof result === 'boolean' || !result) { throw new Error('Failed to add restaurant to catalog'); }
    const restaurant = result as Restaurant;
    const alreadyFavorited = await isAlreadyFavorited(restaurant.id);
    if (!alreadyFavorited) { await addToFavorites(restaurant); }
    return restaurant;
  }, [addRestaurant, addToFavorites, isAlreadyFavorited]);
  const updateRestaurant = useCallback(async (restaurantId: string, updates: Partial<Restaurant>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { throw new Error('User not authenticated'); }
      const isAddressChanging = 'address' in updates || 'city' in updates || 'state' in updates || 'zip_code' in updates || 'country' in updates;
      if (isAddressChanging) {
        const { data: currentRestaurant } = await supabase
            .from('restaurants')
            .select('address, city, state, zip_code, country')
            .eq('id', restaurantId)
            .single();
        const addressForGeocoding = { ...(currentRestaurant || {}), ...updates };
        const coords = await geocodeAddress(addressForGeocoding);
        updates.latitude = coords?.latitude ?? null;
        updates.longitude = coords?.longitude ?? null;
      }
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId)
        .eq('manually_added', true)
        .eq('created_by', user.id)
        .select()
        .single();
      if (error) throw error;
      setRestaurants(prev => {
        const index = prev.findIndex(r => r.id === restaurantId);
        if (index === -1) return prev;
        const newRestaurants = [...prev];
        const updatedData = {
          ...newRestaurants[index],
          ...data,
          manually_added: data.manually_added ?? false, // Ensure boolean type
        };
        newRestaurants[index] = updatedData as RestaurantWithStats;
        return sortRestaurantsArray(newRestaurants, sortBy, userLat, userLon);
      });
      return true;
    } catch (err: any) {
      setError(`Failed to update restaurant: ${err.message}`);
      return false;
    }
  }, [sortBy, userLat, userLon]);
  const removeFromFavorites = useCallback(async (restaurantId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('User must be authenticated'); }
    await supabase.from('user_favorite_restaurants').delete().eq('user_id', user.id).eq('restaurant_id', restaurantId);
    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
  }, []);
  const deleteRestaurant = useCallback(async (restaurantId: string): Promise<void> => {
    return removeFromFavorites(restaurantId);
  }, [removeFromFavorites]);
  const importRestaurant = useCallback(async (geoapifyPlace: GeoapifyPlace): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('User must be authenticated'); }
    if (geoapifyPlace.place_id.startsWith('db_')) {
      const restaurantId = geoapifyPlace.place_id.substring(3);
      const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();
      if (error || !restaurant) {
        throw new Error('Could not find the selected restaurant in the database.');
      }
      await addToFavorites(restaurant as Restaurant);
      return restaurantId;
    }
    const placeName = geoapifyPlace.properties.name;
    let addressToParse = geoapifyPlace.properties.formatted;
    if (addressToParse.toLowerCase().startsWith(placeName.toLowerCase())) {
        addressToParse = addressToParse.substring(placeName.length).replace(/^,?\s*/, '');
    }
    const parsed = parseAddress(addressToParse);
    const restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
        name: geoapifyPlace.properties.name,
        full_address: geoapifyPlace.properties.formatted,
        address: parsed.data?.address || '',
        city: parsed.data?.city || null,
        state: parsed.data?.state || null,
        zip_code: parsed.data?.zip_code || null,
        country: parsed.data?.country || null,
        latitude: geoapifyPlace.properties.lat,
        longitude: geoapifyPlace.properties.lon,
        manually_added: false,
        geoapify_place_id: geoapifyPlace.place_id,
      };
    const restaurant = await addRestaurantAndFavorite(restaurantData);
    return restaurant.id;
  }, [addRestaurantAndFavorite, addToFavorites]);
  const getOrCreateRestaurant = useCallback(async (place: GeoapifyPlace): Promise<Restaurant | null> => {
    try {
      if (place.place_id.startsWith('db_')) {
        const restaurantId = place.place_id.substring(3);
        const { data: restaurant, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        if (error) throw new Error(`Could not find database restaurant: ${error.message}`);
        if (!restaurant) throw new Error(`Restaurant with ID ${restaurantId} not found.`);
        return restaurant as Restaurant;
      }
      const { data: existingByPlaceId } = await supabase
        .from('restaurants')
        .select('*')
        .eq('geoapify_place_id', place.place_id)
        .maybeSingle();
      if (existingByPlaceId) {
        return existingByPlaceId as Restaurant;
      }
      const duplicate = await isDuplicateRestaurant(
        place.properties.name,
        place.properties.address_line1 || place.properties.formatted,
        place.place_id
      );
      if (duplicate) {
        if (!duplicate.geoapify_place_id && place.place_id) {
          await supabase.from('restaurants').update({ geoapify_place_id: place.place_id }).eq('id', duplicate.id);
        }
        return duplicate;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const parsed = parseAddress(place.properties.formatted.replace(`${place.properties.name}, `, ''));
      const newRestaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
        name: place.properties.name,
        full_address: place.properties.formatted,
        address: parsed.data?.address || place.properties.address_line1 || null,
        city: parsed.data?.city || place.properties.city || null,
        state: parsed.data?.state || place.properties.state || null,
        zip_code: parsed.data?.zip_code || place.properties.postcode || null,
        country: parsed.data?.country || place.properties.country_code?.toUpperCase() || null,
        latitude: place.properties.lat,
        longitude: place.properties.lon,
        geoapify_place_id: place.place_id,
        website_url: place.properties.website || place.properties.contact?.website || undefined,
        phone: place.properties.phone || place.properties.contact?.phone || undefined,
        manually_added: false,
        created_by: user.id,
        dateAdded: new Date().toISOString(),
      };
      const { data: created, error: insertError } = await supabase
        .from('restaurants')
        .insert(newRestaurantData)
        .select()
        .single();
      if (insertError) throw insertError;
      return created as Restaurant;
    } catch (err) {
      console.error("Error in getOrCreateRestaurant:", err);
      return null;
    }
  }, [isDuplicateRestaurant]);
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);
  const resetSearch = useCallback(() => {
    clearSearchResults();
    setSearchCache(new Map());
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [clearSearchResults]);
  return {
    restaurants, isLoading, error, searchResults, isSearching, searchError, isLoadingDetails, restaurantErrors,
    searchRestaurants, getRestaurantDetails, addRestaurant, addToFavorites, addRestaurantAndFavorite, removeFromFavorites,
    isDuplicateRestaurant, isAlreadyFavorited, deleteRestaurant, importRestaurant, clearSearchResults, resetSearch,
    updateRestaurant, getOrCreateRestaurant, findSimilarRestaurants,
  };
};