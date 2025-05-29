// src/hooks/useRestaurant.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface RestaurantInfo { 
  id: string; 
  name: string; 
}

export const useRestaurant = (restaurantId: string) => {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
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
          .select('id, name')
          .eq('id', restaurantId)
          .single();

        if (fetchError) {
          console.error('Error fetching restaurant details:', fetchError);
          setError('Failed to load restaurant details.');
          setRestaurant(null);
        } else if (data) {
          setRestaurant(data);
        } else {
          setError('Restaurant not found.');
          setRestaurant(null);
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
    error
  };
};