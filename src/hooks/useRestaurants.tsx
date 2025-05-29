// src/hooks/useRestaurants.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Restaurant {
  id: string;
  name: string;
  dateAdded: string;
  created_at: string;
}

export const useRestaurants = (sortBy: 'name' | 'date') => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .order(sortBy === 'name' ? 'name' : 'created_at', { 
            ascending: sortBy === 'name' ? true : false 
          });

        if (fetchError) {
          console.error('Error fetching restaurants:', fetchError);
          setError('Failed to load restaurants. Please try again.');
        } else if (data) {
          setRestaurants(data);
        }
      } catch (err: any) {
        console.error('Error fetching restaurants:', err);
        setError(`Failed to load restaurants: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [sortBy]);

  const addRestaurant = async (name: string) => {
    if (!name.trim()) return false;

    setError(null);
    try {
      const { data: newRestaurantData, error: insertError } = await supabase
        .from('restaurants')
        .insert([{
          name: name.trim(),
          dateAdded: new Date().toISOString(),
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error adding restaurant:', insertError);
        setError('Failed to add restaurant. Please try again.');
        throw insertError;
      }

      if (newRestaurantData) {
        setRestaurants(prevRestaurants => 
          [newRestaurantData, ...prevRestaurants].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return 0;
          })
        );
        return true;
      }
    } catch (catchedError) {
      console.error('Caught error in addRestaurant:', catchedError);
      return false;
    }
    return false;
  };

  const deleteRestaurant = async (restaurantId: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId);

      if (deleteError) {
        console.error('Error deleting restaurant:', deleteError);
        setError('Failed to delete restaurant. Please try again.');
        throw deleteError;
      }

      setRestaurants(prevRestaurants => 
        prevRestaurants.filter(r => r.id !== restaurantId)
      );
      return true;
    } catch (catchedError) {
      console.error('Caught error in deleteRestaurant:', catchedError);
      return false;
    }
  };

  return {
    restaurants,
    isLoading,
    error,
    setError,
    addRestaurant,
    deleteRestaurant,
    setRestaurants
  };
};