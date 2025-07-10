// src/hooks/useNearbyRestaurants.tsx
import { useCallback, useState } from 'react';
import { Restaurant } from '../types/restaurant';


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
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'API response was not valid JSON.' }));
        throw new Error(`Geoapify API failed with status ${response.status}: ${errorData.message || 'Unknown error'}`);
      }
      const data = await response.json();
     
      const formattedRestaurants: Restaurant[] = data.features.map((feature: any): Restaurant => ({
        id: feature.properties.place_id, // Using place_id as a temporary unique id for the list
        name: feature.properties.name,
        address: feature.properties.address_line1 || null,
        full_address: feature.properties.formatted,
        city: feature.properties.city || null,
        state: feature.properties.state || null,
        zip_code: feature.properties.postcode || null,
        country: feature.properties.country_code?.toUpperCase() || null,
        latitude: feature.properties.lat,
        longitude: feature.properties.lon,
        geoapify_place_id: feature.properties.place_id,
        website_url: feature.properties.website || feature.properties.contact?.website || null,
        phone: feature.properties.phone || feature.properties.contact?.phone || null,
        // Default values for fields not provided by Geoapify Places
        manually_added: false,
        created_at: new Date().toISOString(),
      }));


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