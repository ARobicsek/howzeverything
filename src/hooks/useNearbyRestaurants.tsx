// src/hooks/useNearbyRestaurants.tsx
import { useCallback, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types/restaurant';
import { parseAddress } from '../utils/addressParser';
import { calculateEnhancedSimilarity } from '../utils/textUtils';

interface NearbyRestaurantsOptions {
  latitude: number;
  longitude: number;
  radiusInMiles: number;
}

export const useNearbyRestaurants = () => {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyRestaurants = useCallback(async (options: NearbyRestaurantsOptions) => {
    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    if (!apiKey) {
        setError("API key is not configured.");
        setLoading(false);
        return;
    }
   
    const radiusInMeters = options.radiusInMiles * 1609.34;
    const categories = 'catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub';
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${options.longitude},${options.latitude},${radiusInMeters}&bias=proximity:${options.longitude},${options.latitude}&limit=20&apiKey=${apiKey}`;

    try {
      const [apiResponse, dbResponse] = await Promise.all([
        fetch(url),
        supabase.from('restaurants').select('*')
      ]);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ message: 'API response was not valid JSON.' }));
        throw new Error(`Geoapify API failed with status ${apiResponse.status}: ${errorData.message || 'Unknown error'}`);
      }
      const data = await apiResponse.json();
      const dbRestaurants = dbResponse.data || [];
      
      const formattedRestaurants: Restaurant[] = [];
      for (const feature of data.features) {
        const props = feature.properties;
        if (!props || !props.name) continue;

        const isDuplicateInDb = dbRestaurants.some(dbRestaurant => {
            const nameScore = calculateEnhancedSimilarity(dbRestaurant.name, props.name);
            if (nameScore < 95) return false;

            const dbAddress = dbRestaurant.address || dbRestaurant.full_address;
            const apiAddress = props.address_line1 || props.formatted;
            if (dbAddress && apiAddress) {
                return calculateEnhancedSimilarity(dbAddress, apiAddress) > 70;
            }
            return false;
        });

        if (isDuplicateInDb) {
            continue;
        }

        let addressToParse = props.formatted;
        if (addressToParse.toLowerCase().startsWith(props.name.toLowerCase())) {
            addressToParse = addressToParse.substring(props.name.length).replace(/^,?\s*/, '');
        }
        
        const parsed = parseAddress(addressToParse);

        formattedRestaurants.push({
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

      setRestaurants(formattedRestaurants);
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