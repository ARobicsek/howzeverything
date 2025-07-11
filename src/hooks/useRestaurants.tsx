// src/hooks/useRestaurants.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import * as favoritesService from '../services/favoritesService';
import * as restaurantDataService from '../services/restaurantDataService';
import { SearchService } from '../services/searchService';
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types/restaurant';
import { GeoapifyPlace, GeoapifyPlaceDetails, RestaurantWithStats, UseRestaurantsOptions } from '../types/restaurantSearch';
import { calculateDistance, formatDistanceMiles, sortRestaurantsArray } from '../utils/restaurantGeolocation';

const defaultSortBy = { criterion: 'name' as const, direction: 'asc' as const };

export const useRestaurants = (options: UseRestaurantsOptions = {}) => {
  const { sortBy = defaultSortBy, userLat, userLon, initialFetch = true } = options;

  // --- STATE MANAGEMENT ---
  const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(initialFetch);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [restaurantErrors, setRestaurantErrors] = useState<Map<string, string>>(new Map());

  // --- SERVICE INITIALIZATION ---
  const searchService = useRef(new SearchService());

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('User not authenticated'); setRestaurants([]); return; }

        const restaurantDetails = await restaurantDataService.fetchUserRestaurantsWithStats(user.id);
        
        const combinedData: RestaurantWithStats[] = (restaurantDetails as any[]).map((r: any) => {
          let distance: string | undefined = undefined;
          if (userLat != null && userLon != null && r.latitude != null && r.longitude != null) {
            const distMiles = calculateDistance(userLat, userLon, r.latitude, r.longitude);
            distance = formatDistanceMiles(distMiles);
          }
          return {
            ...r, dishCount: r.dish_count, raterCount: r.rater_count,
            date_favorited: r.date_favorited ?? undefined, dateAdded: r.dateAdded, distance,
          };
        });
        const sortedRestaurants = sortRestaurantsArray(combinedData, sortBy, userLat, userLon);
        setRestaurants(sortedRestaurants);
      } catch (err: any) {
        setError(err.message || 'Failed to load restaurants.');
      } finally {
        setIsLoading(false);
      }
    };
    if (initialFetch) {
        fetchRestaurants();
    }
  }, [sortBy, userLat, userLon, initialFetch]);

  // --- SEARCH ---
  const searchRestaurants = useCallback(async (
    searchParams: string,
    lat: number | null,
    lon: number | null
  ) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const results = await searchService.current.searchRestaurants(searchParams, lat, lon);
      setSearchResults(results);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setSearchError(err.message);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getRestaurantDetails = useCallback(async (placeId: string): Promise<GeoapifyPlaceDetails | null> => {
    setIsLoadingDetails(true);
    setRestaurantErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(placeId);
      return newErrors;
    });
    try {
      return await searchService.current.getRestaurantDetails(placeId);
    } catch (err: any) {
      setRestaurantErrors(prev => new Map(prev).set(placeId, err.message));
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // --- RESTAURANT & FAVORITES MANAGEMENT ---
  const isAlreadyFavorited = useCallback(async (restaurantId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    return favoritesService.isAlreadyFavorited(user.id, restaurantId);
  }, []);

  const addToFavorites = useCallback(async (restaurant: Restaurant): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');
    
    await favoritesService.addToFavorites(user.id, restaurant.id);
    // Add to local state if not already present
    if (!restaurants.some(r => r.id === restaurant.id)) {
      setRestaurants(prev => sortRestaurantsArray(
        [...prev, { ...restaurant, date_favorited: new Date().toISOString() }],
        sortBy, userLat, userLon
      ));
    }
  }, [restaurants, sortBy, userLat, userLon]);

  const removeFromFavorites = useCallback(async (restaurantId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated');
    
    await favoritesService.removeFromFavorites(user.id, restaurantId);
    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
  }, []);
  
  const addRestaurant = useCallback(async (restaurantDataOrName: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> | string): Promise<Restaurant | boolean | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to add restaurants');
    
    const result = await restaurantDataService.addRestaurant(restaurantDataOrName, user.id);
    if (result && typeof result === 'object' && 'id' in result) {
      // If a new restaurant was created and favorited, add it to local state
       if (!restaurants.some(r => r.id === result.id)) {
         setRestaurants(prev => sortRestaurantsArray([...prev, { ...result, date_favorited: new Date().toISOString() }], sortBy, userLat, userLon));
       }
    }
    return result;
  }, [restaurants, sortBy, userLat, userLon]);

  const addRestaurantAndFavorite = useCallback(async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> => {
    const result = await addRestaurant(restaurantData);
    if (typeof result === 'boolean' || !result) {
      throw new Error('Failed to add restaurant to catalog');
    }
    return result as Restaurant;
  }, [addRestaurant]);

  const updateRestaurant = useCallback(async (restaurantId: string, updates: Partial<Restaurant>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedRestaurant = await restaurantDataService.updateRestaurantInSupabase(restaurantId, updates, user.id);
      if (updatedRestaurant) {
        setRestaurants(prev => {
          const index = prev.findIndex(r => r.id === restaurantId);
          if (index === -1) return prev;
          const newRestaurants = [...prev];
          newRestaurants[index] = { ...newRestaurants[index], ...updatedRestaurant };
          return sortRestaurantsArray(newRestaurants, sortBy, userLat, userLon);
        });
        return true;
      }
      return false;
    } catch(err: any) {
      setError(`Failed to update restaurant: ${err.message}`);
      return false;
    }
  }, [sortBy, userLat, userLon]);

  const getOrCreateRestaurant = useCallback(async (place: GeoapifyPlace): Promise<Restaurant | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    return restaurantDataService.getOrCreateRestaurant(place, user.id);
  }, []);

  const importRestaurant = useCallback(async (geoapifyPlace: GeoapifyPlace): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('User must be authenticated'); }

    if (geoapifyPlace.place_id.startsWith('db_')) {
        const restaurantId = geoapifyPlace.place_id.substring(3);
        const { data: restaurant } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();
        if (restaurant) await addToFavorites(restaurant);
        return restaurantId;
    }
    
    const restaurant = await getOrCreateRestaurant(geoapifyPlace);
    if (restaurant) {
        await addToFavorites(restaurant);
        return restaurant.id;
    }
    return null;
  }, [addToFavorites, getOrCreateRestaurant]);

  // --- UTILITIES ---
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  const resetSearch = useCallback(() => {
    clearSearchResults();
    searchService.current.clearCache();
    searchService.current.abort();
  }, []);

  return {
    restaurants, isLoading, error, searchResults, isSearching, searchError, isLoadingDetails, restaurantErrors,
    searchRestaurants, getRestaurantDetails,
    addRestaurant, addToFavorites, addRestaurantAndFavorite, removeFromFavorites,
    isDuplicateRestaurant: restaurantDataService.isDuplicateRestaurant,
    findSimilarRestaurants: restaurantDataService.findSimilarRestaurants,
    isAlreadyFavorited,
    deleteRestaurant: removeFromFavorites,
    importRestaurant, clearSearchResults, resetSearch,
    updateRestaurant, getOrCreateRestaurant,
  };
};