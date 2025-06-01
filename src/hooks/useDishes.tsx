// src/hooks/useDishes.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Define proper interfaces that match the existing useComments interface
interface DishComment {
  id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

interface DishRating {
  id: string;
  user_id: string;
  rating: number;
  notes?: string | null;
  date_tried: string;
  created_at: string;
  updated_at: string;
  dish_id: string;
}

// Updated to match new restaurant_dishes table
interface RestaurantDish {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  is_active: boolean;
  created_by: string;
  verified_by_restaurant: boolean;
  total_ratings: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

interface DishWithDetails extends RestaurantDish {
  dish_comments: DishComment[];
  dish_ratings: DishRating[];
  // For backward compatibility with existing components
  rating: number; // Maps to average_rating
  dateAdded: string; // Maps to created_at
}

export const useDishes = (restaurantId: string, sortBy: 'name' | 'rating' | 'date') => {
  const [dishes, setDishes] = useState<DishWithDetails[]>([]);
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
          .from('restaurant_dishes')
          .select(`
            *,
            dish_comments (
              id, 
              comment_text, 
              created_at, 
              updated_at
            ),
            dish_ratings (
              id, 
              user_id, 
              rating, 
              notes, 
              date_tried, 
              created_at,
              updated_at,
              dish_id
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .order(
            sortBy === 'name' ? 'name' : sortBy === 'rating' ? 'average_rating' : 'created_at',
            { ascending: sortBy === 'name' ? true : false }
          )
          .order('created_at', { foreignTable: 'dish_comments', ascending: true })
          .order('created_at', { foreignTable: 'dish_ratings', ascending: false });

        if (fetchError) throw fetchError;
        
        const dishesWithDetails = data?.map(d => ({
          ...d,
          dish_comments: (d.dish_comments as DishComment[]) || [],
          dish_ratings: (d.dish_ratings as DishRating[]) || [],
          // Backward compatibility mappings
          rating: d.average_rating || 0,
          dateAdded: d.created_at
        })) || [];
        
        setDishes(dishesWithDetails as DishWithDetails[]);
      } catch (err: any) {
        console.error('Error fetching dishes:', err);
        setError(`Failed to load dishes: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId, sortBy]);

  // Note: This now creates a community dish, not a personal rating
  const addDish = async (name: string, rating: number) => {
    if (!name.trim()) return false;
    
    setError(null);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to add a dish');
        return false;
      }

      // First, create the restaurant dish
      const { data: dishData, error: dishError } = await supabase
        .from('restaurant_dishes')
        .insert([{
          name: name.trim(),
          restaurant_id: restaurantId,
          created_by: user.id,
          is_active: true,
          verified_by_restaurant: false,
          total_ratings: 1,
          average_rating: rating
        }])
        .select()
        .single();

      if (dishError) throw dishError;

      if (dishData) {
        // Then create the user's rating for this dish
        const { error: ratingError } = await supabase
          .from('dish_ratings')
          .insert([{
            dish_id: dishData.id,
            user_id: user.id,
            rating: rating
          }]);

        if (ratingError) {
          console.warn('Failed to create rating:', ratingError);
          // Don't fail the whole operation if rating creation fails
        }

        const newDish: DishWithDetails = {
          ...dishData,
          dish_comments: [],
          dish_ratings: [],
          rating: dishData.average_rating || 0,
          dateAdded: dishData.created_at
        };
        
        setDishes(prev => [newDish, ...prev].sort((a, b) => {
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          if (sortBy === 'rating') return b.average_rating - a.average_rating;
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
      // Check if user can delete (created by them or is admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to delete dishes');
        return false;
      }
      
      const dish = dishes.find(d => d.id === dishId);
      
      if (dish && user && dish.created_by !== user.id) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (!profile?.is_admin) {
          setError('You can only delete dishes you created');
          return false;
        }
      }

      const { error } = await supabase
        .from('restaurant_dishes')
        .delete()
        .eq('id', dishId);
        
      if (error) throw error;
      
      setDishes(prev => prev.filter(dish => dish.id !== dishId));
      return true;
    } catch (err: any) {
      console.error('Error deleting dish:', err);
      setError(`Failed to delete dish: ${err.message}`);
      return false;
    }
  };

  // This now updates the user's personal rating, not the dish itself
  const updateDishRating = async (dishId: string, newRating: number) => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to rate dishes');
        return false;
      }

      // Check if user already has a rating for this dish
      const { data: existingRating } = await supabase
        .from('dish_ratings')
        .select('id')
        .eq('dish_id', dishId)
        .eq('user_id', user.id)
        .single();

      let ratingOperation;
      if (existingRating) {
        // Update existing rating
        ratingOperation = supabase
          .from('dish_ratings')
          .update({ rating: newRating })
          .eq('id', existingRating.id);
      } else {
        // Create new rating
        ratingOperation = supabase
          .from('dish_ratings')
          .insert([{
            dish_id: dishId,
            user_id: user.id,
            rating: newRating
          }]);
      }

      const { error: ratingError } = await ratingOperation;
      if (ratingError) throw ratingError;

      // Fetch updated dish with new average
      const { data: updatedDish, error: fetchError } = await supabase
        .from('restaurant_dishes')
        .select(`
          *,
          dish_comments (
            id, 
            comment_text, 
            created_at, 
            updated_at
          ),
          dish_ratings (
            id, 
            user_id, 
            rating, 
            notes, 
            date_tried, 
            created_at,
            updated_at,
            dish_id
          )
        `)
        .eq('id', dishId)
        .single();

      if (fetchError) throw fetchError;

      if (updatedDish) {
        const dishWithDetails: DishWithDetails = {
          ...updatedDish,
          dish_comments: (updatedDish.dish_comments as DishComment[]) || [],
          dish_ratings: (updatedDish.dish_ratings as DishRating[]) || [],
          rating: updatedDish.average_rating || 0,
          dateAdded: updatedDish.created_at
        };

        setDishes(prev => prev.map(dish => 
          dish.id === dishId ? dishWithDetails : dish
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