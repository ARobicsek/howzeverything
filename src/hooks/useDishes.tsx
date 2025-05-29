// src/hooks/useDishes.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface DishComment { 
  id: string; 
  comment_text: string; 
  created_at: string; 
  updated_at: string; 
}

interface Dish { 
  id: string; 
  name: string; 
  rating: number; 
  dateAdded: string; 
  restaurant_id: string; 
  created_at: string; 
}

interface DishWithComments extends Dish { 
  dish_comments: DishComment[]; 
}

export const useDishes = (restaurantId: string, sortBy: 'name' | 'rating' | 'date') => {
  const [dishes, setDishes] = useState<DishWithComments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('dishes')
          .select(`*, dish_comments (id, comment_text, created_at, updated_at)`)
          .eq('restaurant_id', restaurantId)
          .order(
            sortBy === 'name' ? 'name' : sortBy === 'rating' ? 'rating' : 'created_at',
            { ascending: sortBy === 'name' ? true : false }
          )
          .order('created_at', { foreignTable: 'dish_comments', ascending: true });

        if (fetchError) throw fetchError;
        
        const dishesWithComments = data?.map(d => ({
          ...d,
          dish_comments: d.dish_comments || []
        })) || [];
        
        setDishes(dishesWithComments as DishWithComments[]);
      } catch (err: any) {
        console.error('Error fetching dishes:', err);
        setError(`Failed to load dishes: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId, sortBy]);

  const addDish = async (name: string, rating: number) => {
    if (!name.trim()) return false;
    
    setError(null);
    try {
      const { data, error } = await supabase
        .from('dishes')
        .insert([{
          name: name.trim(),
          rating,
          dateAdded: new Date().toISOString(),
          restaurant_id: restaurantId,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newDish: DishWithComments = { ...data as Dish, dish_comments: [] };
        setDishes(prev => [newDish, ...prev].sort((a, b) => {
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          if (sortBy === 'rating') return b.rating - a.rating;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }));
        return true;
      }
    } catch (err: any) {
      console.error('Error adding dish:', err);
      setError(`Failed to add dish: ${err.message}`);
      return false;
    }
    return false;
  };

  const deleteDish = async (dishId: string) => {
    setError(null);
    try {
      const { error } = await supabase.from('dishes').delete().eq('id', dishId);
      if (error) throw error;
      
      setDishes(prev => prev.filter(dish => dish.id !== dishId));
      return true;
    } catch (err: any) {
      console.error('Error deleting dish:', err);
      setError(`Failed to delete dish: ${err.message}`);
      return false;
    }
  };

  const updateDishRating = async (dishId: string, newRating: number) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('dishes')
        .update({ rating: newRating, dateAdded: new Date().toISOString() })
        .eq('id', dishId)
        .select(`*, dish_comments (id, comment_text, created_at, updated_at)`)
        .single();

      if (error) throw error;

      if (data) {
        const updatedDish: DishWithComments = {
          ...data,
          dish_comments: data.dish_comments || []
        };
        setDishes(prev => prev.map(dish => 
          dish.id === dishId ? updatedDish : dish
        ));
        return true;
      }
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError(`Failed to update rating: ${err.message}`);
      return false;
    }
    return false;
  };

  return {
    dishes,
    isLoading,
    error,
    setError,
    addDish,
    deleteDish,
    updateDishRating,
    setDishes
  };
};