// src/hooks/useNearbyRestaurants.tsx
import { useCallback, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types/restaurant';
import { parseAddress } from '../utils/addressParser';
import { incrementGeoapifyCount, logGeoapifyCount } from '../utils/apiCounter';
import { calculateEnhancedSimilarity } from '../utils/textUtils';


// Helper function to calculate distance in miles
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // in metres
  return (d / 1000) * 0.621371; // convert to miles
};


interface NearbyRestaurantsOptions {
  latitude: number;
  longitude: number;
  radiusInMiles: number;
}


// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_INVALIDATION_DISTANCE_MILES = 0.31; // ~500 meters


export const useNearbyRestaurants = () => {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);


  const fetchNearbyRestaurants = useCallback(async (options: NearbyRestaurantsOptions) => {
    setLoading(true);
    setError(null);


    const cacheKey = `nearby_cache_${options.latitude.toFixed(4)}_${options.longitude.toFixed(4)}_${options.radiusInMiles}`;
    
    try {
      const cachedItem = localStorage.getItem(cacheKey);
      if (cachedItem) {
        const cachedData = JSON.parse(cachedItem);
        const isCacheStale = (Date.now() - cachedData.timestamp) > CACHE_TTL;
        const userMovedSignificantly = calculateDistance(
          options.latitude,
          options.longitude,
          cachedData.location.latitude,
          cachedData.location.longitude
        ) > CACHE_INVALIDATION_DISTANCE_MILES;


        if (!isCacheStale && !userMovedSignificantly) {
          setRestaurants(cachedData.results);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to read from nearby cache", e);
      localStorage.removeItem(cacheKey);
    }


    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    if (!apiKey) {
        setError("API key is not configured.");
        setLoading(false);
        return;
    }
   
    const radiusInMeters = options.radiusInMiles * 1609.34;
    const categories = 'catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub';
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${options.longitude},${options.latitude},${radiusInMeters}&bias=proximity:${options.longitude},${options.latitude}&limit=50&apiKey=${apiKey}`;


    try {
      incrementGeoapifyCount();
      logGeoapifyCount();
      const [apiResponse, dbResponse] = await Promise.all([
        fetch(url),
        supabase.from('restaurants').select('*')
      ]);


      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ message: 'API response was not valid JSON.' }));
        throw new Error(`Geoapify API failed with status ${apiResponse.status}: ${errorData.message || 'Unknown error'}`);
      }
      const data = await apiResponse.json();
      const allDbRestaurants = (dbResponse.data as Restaurant[]) || [];


      // 1. Find nearby restaurants from our DB
      const nearbyDbRestaurants = allDbRestaurants.filter(r =>
        r.latitude && r.longitude &&
        calculateDistance(options.latitude, options.longitude, r.latitude, r.longitude) <= options.radiusInMiles
      );


      // 2. Process API results, filtering out duplicates of *any* DB restaurant
      const uniqueApiRestaurants: Restaurant[] = [];
      for (const feature of data.features) {
        const props = feature.properties;
        if (!props || !props.name) continue;


        const isDuplicateInDb = allDbRestaurants.some(dbRestaurant => {
            const nameScore = calculateEnhancedSimilarity(dbRestaurant.name, props.name);
            if (nameScore < 95) return false;

            // Use a more robust address string for comparison
            const dbAddress = dbRestaurant.full_address || [dbRestaurant.address, dbRestaurant.city].filter(Boolean).join(', ');
            const apiAddress = props.address_line1 || props.formatted;
            
            if (dbAddress && apiAddress) {
                // If we have addresses, compare them.
                return calculateEnhancedSimilarity(dbAddress, apiAddress) > 65;
            }
            // If DB address is missing, a very high name score is enough to call it a duplicate.
            return nameScore > 98;
        });


        if (isDuplicateInDb) {
            continue;
        }


        let addressToParse = props.formatted;
        if (addressToParse.toLowerCase().startsWith(props.name.toLowerCase())) {
            addressToParse = addressToParse.substring(props.name.length).replace(/^,?\s*/, '');
        }
       
        const parsed = parseAddress(addressToParse);


        uniqueApiRestaurants.push({
          id: props.place_id, // Using place_id as a temporary unique id for the list
          name: props.name,
          address: parsed.data?.address || props.address_line1 || null,
          full_address: props.formatted,
          city: parsed.data?.city || props.city || null,
          state: parsed.data?.state || props.state || null,
          zip_code: parsed.data?.zip_code || props.postcode || null,
          country: parsed.data?.country || props.country_code?.toUpperCase() || null,
          latitude: props.lat,
          longitude: props.lon,
          geoapify_place_id: props.place_id,
          website_url: props.website || props.contact?.website || null,
          phone: props.phone || props.contact?.phone || null,
          manually_added: false,
          created_at: new Date().toISOString(),
        });
      }


      // 3. Combine and sort the lists
      const combinedResults = [...nearbyDbRestaurants, ...uniqueApiRestaurants].sort((a, b) => {
        const distA = a.latitude && a.longitude ? calculateDistance(options.latitude, options.longitude, a.latitude, a.longitude) : Infinity;
        const distB = b.latitude && b.longitude ? calculateDistance(options.latitude, options.longitude, b.latitude, b.longitude) : Infinity;
        return distA - distB;
      });


      try {
        const cachePayload = {
          results: combinedResults,
          timestamp: Date.now(),
          location: { latitude: options.latitude, longitude: options.longitude },
          radiusInMiles: options.radiusInMiles,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      } catch(e) {
        console.warn("Failed to write to nearby cache", e);
      }
      setRestaurants(combinedResults);
    } catch (e: any) {
      console.error('Error fetching nearby restaurants:', e);
      setError(e.message || "An unknown error occurred.");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);
 
  return { loading, restaurants, error, fetchNearbyRestaurants };
};