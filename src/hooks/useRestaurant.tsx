// src/hooks/useRestaurant.tsx (Updated for consistency)
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Use the same interface as useRestaurants.tsx for consistency
interface Restaurant {
  id: string;
  name: string;
  dateAdded: string;
  created_at: string;
  geoapify_place_id?: string | null;
  address?: string | null;
  phone?: string | null;
  website_url?: string | null;
  rating?: number | null;
  price_tier?: number | null;
  category?: string | null;
  opening_hours?: any;
  latitude?: number | null;
  longitude?: number | null;
}

export const useRestaurant = (restaurantId: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*') // Get all fields for consistency
          .eq('id', restaurantId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Restaurant not found');
          } else {
            console.error('Error fetching restaurant details:', fetchError);
            setError('Failed to load restaurant details.');
          }
        } else if (data) {
          setRestaurant(data as Restaurant);
        }
      } catch (err: any) {
        console.error('Error fetching restaurant:', err);
        setError(`Failed to load restaurant: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  return {
    restaurant,
    isLoading,
    error,
    setError // Add this for consistency with other hooks
  };
};