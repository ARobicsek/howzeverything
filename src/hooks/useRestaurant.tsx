// src/hooks/useRestaurant.tsx
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Restaurant } from '../types/restaurant';


export const useRestaurant = (restaurantId: string) => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0); // State to trigger refresh


    const fetchRestaurant = useCallback(async () => {
        if (!restaurantId) {
            setIsLoading(false);
            return;
        }


        setIsLoading(true);
        setError(null);


        try {
            const { data, error: fetchError } = await supabase
                .from('restaurants')
                .select('*')
                .eq('id', restaurantId)
                .single();


            if (fetchError) {
                throw fetchError;
            }


            setRestaurant(data as Restaurant);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error("Error fetching restaurant:", errorMessage);
            setError(errorMessage);
            setRestaurant(null);
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId]);


    useEffect(() => {
        fetchRestaurant();
    }, [fetchRestaurant, key]); // Re-run effect when key changes


    const refreshRestaurant = useCallback(() => {
        setKey(prev => prev + 1);
    }, []);


    return { restaurant, isLoading, error, refreshRestaurant, setError };
};