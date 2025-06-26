// src/hooks/useDishes.tsx    
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Photo interface    
export interface DishPhoto {    
  id: string;    
  dish_id: string;    
  user_id: string;    
  storage_path: string;    
  caption?: string | null;    
  width?: number | null;    
  height?: number | null;    
  created_at: string;    
  updated_at: string;    
  // User information joined from users table    
  photographer_name?: string;    
  photographer_email?: string;    
  // Computed URL    
  url?: string;    
}

// Updated interfaces to include user information in comments    
export interface DishComment {    
  id: string;    
  dish_id: string; // Added missing property    
  comment_text: string;    
  created_at: string;    
  updated_at: string;    
  user_id: string;    
  // User information joined from users table    
  commenter_name?: string;    
  commenter_email?: string;    
}

export interface DishRating {    
  id: string;    
  user_id: string;    
  rating: number;    
  notes?: string | null;    
  date_tried: string;    
  created_at: string;    
  updated_at: string;    
  dish_id: string;    
}

export interface RestaurantDish {    
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

export interface DishWithDetails extends RestaurantDish {    
  dish_comments: DishComment[];    
  dish_ratings: DishRating[];    
  dish_photos: DishPhoto[];    
  dateAdded: string;    
}

// New interface for search/discovery results    
export interface DishSearchResult extends DishWithDetails {    
  similarityScore?: number;    
  isExactMatch?: boolean;    
  matchType?: 'exact' | 'fuzzy' | 'partial';    
}

// MODIFIED: Reusable sorting function for dishes, now accepts currentUserId    
const sortDishesArray = (    
  array: DishWithDetails[],    
  sortBy: { criterion: 'name' | 'your_rating' | 'community_rating' | 'date'; direction: 'asc' | 'desc' },    
  currentUserId: string | null    
): DishWithDetails[] => {    
  return [...array].sort((a, b) => {    
    let comparison = 0;    
    if (sortBy.criterion === 'name') {    
      comparison = a.name.localeCompare(b.name);    
    } else if (sortBy.criterion === 'community_rating') {    
      comparison = (a.average_rating || 0) - (b.average_rating || 0); // Default ASC    
    } else if (sortBy.criterion === 'your_rating') {    
      // Find current user's rating for dish A    
      const userRatingA = currentUserId    
        ? a.dish_ratings.find((r: DishRating) => r.user_id === currentUserId)?.rating || 0    
        : 0;    
      // Find current user's rating for dish B    
      const userRatingB = currentUserId    
        ? b.dish_ratings.find((r: DishRating) => r.user_id === currentUserId)?.rating || 0    
        : 0;    
      comparison = userRatingA - userRatingB; // Default ASC    
    } else { // 'date' (created_at)    
      const dateA = new Date(a.created_at).getTime();    
      const dateB = new Date(b.created_at).getTime();    
      comparison = dateA - dateB; // Default ASC (oldest first)    
    }    
    return sortBy.direction === 'asc' ? comparison : -comparison;    
  });    
};

// MODIFIED: Updated sortBy type    
export const useDishes = (restaurantId: string, sortBy: { criterion: 'name' | 'your_rating' | 'community_rating' | 'date'; direction: 'asc' | 'desc' }) => {    
  const [dishes, setDishes] = useState<DishWithDetails[]>([]);    
  const [isLoading, setIsLoading] = useState(true);    
  const [error, setError] = useState<string | null>(null);    
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user on mount    
  useEffect(() => {    
    const getCurrentUser = async () => {    
      const { data: { user } } = await supabase.auth.getUser();    
      setCurrentUserId(user?.id || null);    
    };    
    getCurrentUser();    
  }, []);

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
        // MODIFIED: Base order for database query, relying more on client-side sort for custom logic    
        let dbOrderByColumn: 'name' | 'average_rating' | 'created_at' = 'name';    
        let dbOrderAscending = true;

        if (sortBy.criterion === 'community_rating') {    
          dbOrderByColumn = 'average_rating';    
          dbOrderAscending = sortBy.direction === 'asc';    
        } else if (sortBy.criterion === 'date') {    
          dbOrderByColumn = 'created_at';    
          dbOrderAscending = sortBy.direction === 'asc';    
        } else { // Default to name for 'name' and 'your_rating'    
          dbOrderByColumn = 'name';    
          dbOrderAscending = sortBy.direction === 'asc';    
        }

        const { data, error: fetchError } = await supabase    
          .from('restaurant_dishes')    
          .select(`    
            *,    
            dish_comments (    
              id,    
              dish_id,    
              comment_text,    
              created_at,    
              updated_at,    
              user_id,    
              users (    
                full_name,    
                email    
              )    
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
            ),    
            dish_photos (    
              id,    
              dish_id,    
              user_id,    
              storage_path,    
              caption,    
              width,    
              height,    
              created_at,    
              updated_at,    
              users (    
                full_name,    
                email    
              )    
            )    
          `)    
          .eq('restaurant_id', restaurantId)    
          .eq('is_active', true)    
          // MODIFIED: Apply database sorting based on selected criterion for efficiency    
          .order(dbOrderByColumn, { ascending: dbOrderAscending })    
          .order('created_at', { foreignTable: 'dish_comments', ascending: true }) // Still sort comments by creation date    
          .order('created_at', { foreignTable: 'dish_ratings', ascending: false }) // Still sort ratings by creation date for fetching purposes    
          .order('created_at', { foreignTable: 'dish_photos', ascending: false }); // Sort photos by newest first

        if (fetchError) throw fetchError;    
           
        const dishesWithDetails = data?.map(d => {    
          const ratings = (d.dish_ratings as DishRating[]) || [];    
          const actualTotalRatings = ratings.length;    
          const actualAverageRating = actualTotalRatings > 0    
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / actualTotalRatings    
            : 0;

          // Debug logging for initial fetch    
          if (ratings.length > 0) {    
            console.log(`🔍 Initial fetch debug for dish "${d.name}":`);    
            console.log('Ratings:', ratings.map(r => ({ user_id: r.user_id.substring(0,8) + '...', rating: r.rating })));    
            console.log('Individual ratings:', ratings.map(r => r.rating));    
            console.log('Calculated average:', actualAverageRating);    
            console.log('Database stored average:', d.average_rating);    
          }

          // Process comments to include user information    
          const commentsWithUserInfo = (d.dish_comments as any[])?.map((comment: any) => ({    
            id: comment.id,    
            dish_id: comment.dish_id || d.id, // Ensure dish_id is always present    
            comment_text: comment.comment_text,    
            created_at: comment.created_at,    
            updated_at: comment.updated_at,    
            user_id: comment.user_id,    
            commenter_name: comment.users?.full_name || 'Anonymous User',    
            commenter_email: comment.users?.email    
          })) || [];

          // Process photos to include user information and URLs    
          const photosWithInfo = (d.dish_photos as any[])?.map((photo: any) => {    
            const { data } = supabase.storage    
              .from('dish-photos')    
              .getPublicUrl(photo.storage_path);    
               
            return {    
              id: photo.id,    
              dish_id: photo.dish_id || d.id,    
              user_id: photo.user_id,    
              storage_path: photo.storage_path,    
              caption: photo.caption,    
              width: photo.width,    
              height: photo.height,    
              created_at: photo.created_at,    
              updated_at: photo.updated_at,    
              photographer_name: photo.users?.full_name || 'Anonymous User',    
              photographer_email: photo.users?.email,    
              url: data?.publicUrl    
            };    
          }) || [];

          return {    
            ...d,    
            dish_comments: commentsWithUserInfo,    
            dish_ratings: ratings,    
            dish_photos: photosWithInfo,    
            // Use calculated values from actual ratings for consistency    
            total_ratings: actualTotalRatings,    
            average_rating: Math.round(actualAverageRating * 10) / 10,    
            dateAdded: d.created_at    
          };    
        }) || [];    
           
        // MODIFIED: Pass currentUserId to sortDishesArray    
        setDishes(sortDishesArray(dishesWithDetails as DishWithDetails[], sortBy, currentUserId));    
      } catch (err: any) {    
        console.error('Error fetching dishes:', err);    
        setError(`Failed to load dishes: ${err.message}`);    
      } finally {    
        setIsLoading(false);    
      }    
    };

    // MODIFIED: Update dependency array for sortBy object and currentUserId    
    fetchDishes();    
  }, [restaurantId, sortBy.criterion, sortBy.direction, currentUserId]);

  // Enhanced search function with better matching    
  const searchDishes = (searchTerm: string): DishSearchResult[] => {    
    if (!searchTerm.trim()) return dishes.map(d => ({ ...d, similarityScore: 100 }));

    const term = searchTerm.toLowerCase().trim();    
       
    return dishes.map(dish => {    
      const dishName = dish.name.toLowerCase();    
      let score = 0;    
      let matchType: 'exact' | 'fuzzy' | 'partial' = 'fuzzy';

      // Exact match    
      if (dishName === term) {    
        score = 100;    
        matchType = 'exact';    
      }    
      // Exact word match    
      else if (dishName.includes(term) || term.includes(dishName)) {    
        score = 95;    
        matchType = 'partial';    
      }    
      // Word-by-word matching    
      else {    
        const dishWords = dishName.split(/\s+/);    
        const searchWords = term.split(/\s+/);    
        let wordMatches = 0;    
        let partialMatches = 0;

        searchWords.forEach(searchWord => {    
          if (dishWords.some(dishWord => dishWord === searchWord)) {    
            wordMatches++;    
          } else if (dishWords.some(dishWord =>    
            dishWord.includes(searchWord) ||    
            searchWord.includes(dishWord) ||    
            // Handle common character substitutions    
            dishWord.replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e') === searchWord    
          )) {    
            partialMatches++;    
          }    
        });

        if (wordMatches > 0 || partialMatches > 0) {    
          const exactScore = (wordMatches / searchWords.length) * 80;    
          const partialScore = (partialMatches / searchWords.length) * 60;    
          score = Math.min(95, 40 + exactScore + partialScore);    
        } else {    
          // Character similarity as fallback    
          const longer = dishName.length > term.length ? dishName : term;    
          const shorter = dishName.length > term.length ? term : dishName;    
          if (longer.length === 0) {    
            score = 100;    
          } else {    
            let matches = 0;    
            for (let i = 0; i < shorter.length; i++) {    
              if (longer.includes(shorter[i])) matches++;    
            }    
            score = Math.max(0, (matches / longer.length) * 30);    
          }    
        }    
      }

      return {    
        ...dish,    
        similarityScore: score,    
        isExactMatch: matchType === 'exact',    
        matchType    
      };    
    })    
    .filter(dish => dish.similarityScore > 20)    
    .sort((a, b) => {    
      // Prioritize exact matches    
      if (a.isExactMatch && !b.isExactMatch) return -1;    
      if (!a.isExactMatch && b.isExactMatch) return 1;    
      // Then by similarity score    
      return (b.similarityScore || 0) - (a.similarityScore || 0);    
    });    
  };

  const addDish = async (name: string, rating: number) => {    
    if (!name.trim()) return false;    
       
    setError(null);    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to add a dish');    
        return false;    
      }

      // First, add the dish (let the trigger calculate the stats)    
      const { data: dishData, error: dishError } = await supabase    
        .from('restaurant_dishes')    
        .insert([{    
          name: name.trim(),    
          restaurant_id: restaurantId,    
          created_by: user.id,    
          is_active: true,    
          verified_by_restaurant: false    
          // Don't set total_ratings/average_rating - let the trigger handle it    
        }])    
        .select()    
        .single();

      if (dishError) throw dishError;

      if (dishData) {    
        // Only add the rating if it's not 0 (0 means no rating provided)
        if (rating > 0) {    
          const { error: ratingError } = await supabase    
            .from('dish_ratings')    
            .insert([{    
              dish_id: dishData.id,    
              user_id: user.id,    
              rating: rating    
            }]);

          if (ratingError) {    
            console.warn('Failed to create rating:', ratingError);    
          }
        }

        // Create the new dish object with the user's rating included (if provided)    
        const tempRating: DishRating | null = rating > 0 ? {    
          id: 'temp-' + Date.now(),    
          user_id: user.id,    
          rating: rating,    
          notes: null,    
          date_tried: new Date().toISOString(),    
          created_at: new Date().toISOString(),    
          updated_at: new Date().toISOString(),    
          dish_id: dishData.id    
        } : null;

        const newDish: DishWithDetails = {    
          ...(dishData as RestaurantDish),    
          dish_comments: [],    
          dish_ratings: tempRating ? [tempRating] : [],    
          dish_photos: [],    
          // Calculate from actual ratings    
          total_ratings: tempRating ? 1 : 0,    
          average_rating: tempRating ? rating : 0,    
          dateAdded: dishData.created_at    
        };

        // MODIFIED: Apply sort to include new dish, passing currentUserId    
        const updatedDishes = sortDishesArray([...dishes, newDish], sortBy, currentUserId);    
        setDishes(updatedDishes);    
      }

      return true;    
    } catch (err: any) {    
      console.error('Error adding dish:', err);    
      setError(`Failed to add dish: ${err.message}`);    
      return false;    
    }    
  };

  const deleteDish = async (dishId: string) => {    
    setError(null);    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to delete a dish');    
        return;    
      }

      // Try to delete the dish    
      const { error: deleteError } = await supabase    
        .from('restaurant_dishes')    
        .delete()    
        .eq('id', dishId)    
        .eq('created_by', user.id);

      if (deleteError) {    
        if (deleteError.code === 'PGRST116') {    
          setError('You can only delete dishes you created');    
        } else {    
          throw deleteError;    
        }    
        return;    
      }

      // Update local state    
      setDishes(dishes.filter(d => d.id !== dishId));    
    } catch (err: any) {    
      console.error('Error deleting dish:', err);    
      setError(`Failed to delete dish: ${err.message}`);    
    }    
  };

  const updateDishRating = async (dishId: string, rating: number) => {    
    setError(null);    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to rate a dish');    
        return;    
      }

      // Debug logging for rating update    
      console.log('📝 Updating rating:', { dishId, userId: user.id, newRating: rating });

      // Update existing rating or create new one    
      const { data: existingRating, error: fetchError } = await supabase    
        .from('dish_ratings')    
        .select('*')    
        .eq('dish_id', dishId)    
        .eq('user_id', user.id)    
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"    
        throw fetchError;    
      }

      if (existingRating) {    
        // Update existing rating    
        const { error: updateError } = await supabase    
          .from('dish_ratings')    
          .update({ rating, updated_at: new Date().toISOString() })    
          .eq('id', existingRating.id);

        if (updateError) throw updateError;    
        console.log('✅ Updated existing rating:', existingRating.id);    
      } else {    
        // Create new rating    
        const { data: newRating, error: insertError } = await supabase    
          .from('dish_ratings')    
          .insert([{    
            dish_id: dishId,    
            user_id: user.id,    
            rating: rating    
          }])    
          .select()    
          .single();

        if (insertError) throw insertError;    
        console.log('✅ Created new rating:', newRating?.id);    
      }

      // Fetch updated dish data immediately    
      const { data: updatedDish, error: dishFetchError } = await supabase    
        .from('restaurant_dishes')    
        .select(`    
          *,    
          dish_comments (    
            id,    
            dish_id,    
            comment_text,    
            created_at,    
            updated_at,    
            user_id,    
            users (    
              full_name,    
              email    
            )    
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
          ),    
          dish_photos (    
            id,    
            dish_id,    
            user_id,    
            storage_path,    
            caption,    
            width,    
            height,    
            created_at,    
            updated_at,    
            users (    
              full_name,    
              email    
            )    
          )    
        `)    
        .eq('id', dishId)    
        .single();

      if (dishFetchError) throw dishFetchError;

      if (updatedDish) {    
        const ratings = (updatedDish.dish_ratings as DishRating[]) || [];    
        const actualTotalRatings = ratings.length;    
        const actualAverageRating = actualTotalRatings > 0    
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / actualTotalRatings    
          : 0;

        // Debug logging for rating update    
        console.log(`🔍 After rating update for dish "${updatedDish.name}":`);    
        console.log('All ratings:', ratings.map(r => ({ user_id: r.user_id.substring(0,8) + '...', rating: r.rating })));    
        console.log('Current user rating:', ratings.find(r => r.user_id === user.id)?.rating);    
        console.log('Calculated average:', actualAverageRating);

        // Process comments and photos    
        const commentsWithUserInfo = (updatedDish.dish_comments as any[])?.map((comment: any) => ({    
          id: comment.id,    
          dish_id: comment.dish_id || dishId,    
          comment_text: comment.comment_text,    
          created_at: comment.created_at,    
          updated_at: comment.updated_at,    
          user_id: comment.user_id,    
          commenter_name: comment.users?.full_name || 'Anonymous User',    
          commenter_email: comment.users?.email    
        })) || [];

        const photosWithInfo = (updatedDish.dish_photos as any[])?.map((photo: any) => {    
          const { data } = supabase.storage    
            .from('dish-photos')    
            .getPublicUrl(photo.storage_path);    
               
          return {    
            id: photo.id,    
            dish_id: photo.dish_id || dishId,    
            user_id: photo.user_id,    
            storage_path: photo.storage_path,    
            caption: photo.caption,    
            width: photo.width,    
            height: photo.height,    
            created_at: photo.created_at,    
            updated_at: photo.updated_at,    
            photographer_name: photo.users?.full_name || 'Anonymous User',    
            photographer_email: photo.users?.email,    
            url: data?.publicUrl    
          };    
        }) || [];

        const updatedDishWithDetails: DishWithDetails = {    
          ...updatedDish,    
          dish_comments: commentsWithUserInfo,    
          dish_ratings: ratings,    
          dish_photos: photosWithInfo,    
          total_ratings: actualTotalRatings,    
          average_rating: Math.round(actualAverageRating * 10) / 10,    
          dateAdded: updatedDish.created_at    
        };

        // MODIFIED: Update and re-sort dishes, passing currentUserId    
        const newDishes = dishes.map(d =>    
          d.id === dishId ? updatedDishWithDetails : d    
        );    
        setDishes(sortDishesArray(newDishes, sortBy, currentUserId));    
      }    
    } catch (err: any) {    
      console.error('Error updating rating:', err);    
      setError(`Failed to update rating: ${err.message}`);    
    }    
  };

  const updateDishName = async (dishId: string, newName: string) => {    
    if (!newName.trim()) return;    
       
    setError(null);    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to update a dish');    
        return;    
      }

      const { error: updateError } = await supabase    
        .from('restaurant_dishes')    
        .update({ name: newName.trim() })    
        .eq('id', dishId)    
        .eq('created_by', user.id);

      if (updateError) {    
        if (updateError.code === 'PGRST116') {    
          setError('You can only edit dishes you created');    
        } else {    
          throw updateError;    
        }    
        return;    
      }

      // Update local state    
      setDishes(dishes.map(dish =>    
        dish.id === dishId ? { ...dish, name: newName.trim() } : dish    
      ));    
    } catch (err: any) {    
      console.error('Error updating dish name:', err);    
      setError(`Failed to update dish name: ${err.message}`);    
    }    
  };

  const addComment = async (dishId: string, text: string) => {    
    if (!text.trim()) return;    
    setError(null);    
       
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to add a comment');    
        return;    
      }

      const { error } = await supabase    
        .from('dish_comments')    
        .insert([{    
          dish_id: dishId,    
          user_id: user.id,    
          comment_text: text.trim()    
        }]);

      if (error) throw error;    
    } catch (err: any) {    
      console.error('Error adding comment:', err);    
      setError(`Failed to add comment: ${err.message}`);    
    }    
  };

  const updateComment = async (commentId: string, dishId: string, newText: string) => {    
    if (!newText.trim()) return;    
    setError(null);    
       
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to update a comment');    
        return;    
      }

      const { error } = await supabase    
        .from('dish_comments')    
        .update({ comment_text: newText.trim() })    
        .eq('id', commentId)    
        .eq('dish_id', dishId)    
        .eq('user_id', user.id);

      if (error) throw error;    
    } catch (err: any) {    
      console.error('Error updating comment:', err);    
      setError(`Failed to update comment: ${err.message}`);    
    }    
  };

  const deleteComment = async (dishId: string, commentId: string) => {    
    setError(null);    
       
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to delete a comment');    
        return;    
      }

      const { error } = await supabase    
        .from('dish_comments')    
        .delete()    
        .eq('id', commentId)    
        .eq('dish_id', dishId)    
        .eq('user_id', user.id);

      if (error) throw error;    
    } catch (err: any) {    
      console.error('Error deleting comment:', err);    
      setError(`Failed to delete comment: ${err.message}`);    
    }    
  };

  // Utility function to calculate string similarity (Levenshtein distance based)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return 100;
    
    // Check if one string contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
      const longerLength = Math.max(s1.length, s2.length);
      const shorterLength = Math.min(s1.length, s2.length);
      return (shorterLength / longerLength) * 90; // Up to 90% for contains
    }
    
    // Levenshtein distance calculation
    const matrix: number[][] = [];
    
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return Math.max(0, (1 - distance / maxLength) * 100);
  };

  // Check for similar dishes with a specific threshold
  const checkForSimilarDishes = (dishName: string, threshold: number = 80): DishSearchResult[] => {
    const trimmedName = dishName.trim();
    if (!trimmedName) return [];

    return dishes
      .map(dish => {
        const similarityScore = calculateSimilarity(dish.name, trimmedName);
        return {
          ...dish,
          similarityScore,
          isExactMatch: similarityScore === 100,
          matchType: similarityScore === 100 ? 'exact' : similarityScore > 90 ? 'partial' : 'fuzzy'
        } as DishSearchResult;
      })
      .filter(dish => dish.similarityScore >= threshold)
      .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
  };

  const addPhoto = async (dishId: string, file: File, caption?: string) => {    
    setError(null);    
       
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to add a photo');    
        return;    
      }

      // Upload file to storage    
      const fileExt = file.name.split('.').pop();    
      const fileName = `${user.id}_${dishId}_${Date.now()}.${fileExt}`;    
      const filePath = `dish-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage    
        .from('dish-photos')    
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get image dimensions    
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {    
        const img = new Image();    
        img.onload = () => resolve({ width: img.width, height: img.height });    
        img.src = URL.createObjectURL(file);    
      });

      // Create photo record    
      const { error: dbError } = await supabase    
        .from('dish_photos')    
        .insert([{    
          dish_id: dishId,    
          user_id: user.id,    
          storage_path: filePath,    
          caption: caption?.trim() || null,    
          width: dimensions.width,    
          height: dimensions.height    
        }]);

      if (dbError) {    
        // Try to clean up the uploaded file    
        await supabase.storage.from('dish-photos').remove([filePath]);    
        throw dbError;    
      }    
    } catch (err: any) {    
      console.error('Error adding photo:', err);    
      setError(`Failed to add photo: ${err.message}`);    
    }    
  };

  const deletePhoto = async (dishId: string, photoId: string) => {    
    setError(null);    
       
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to delete a photo');    
        return;    
      }

      // Get photo details before deleting    
      const { data: photo, error: fetchError } = await supabase    
        .from('dish_photos')    
        .select('storage_path')    
        .eq('id', photoId)    
        .eq('user_id', user.id)    
        .single();

      if (fetchError) throw fetchError;

      // Delete from database    
      const { error: deleteError } = await supabase    
        .from('dish_photos')    
        .delete()    
        .eq('id', photoId)    
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Delete from storage    
      if (photo?.storage_path) {    
        const { error: storageError } = await supabase.storage    
          .from('dish-photos')    
          .remove([photo.storage_path]);

        if (storageError) {    
          console.error('Error deleting photo from storage:', storageError);    
        }    
      }    
    } catch (err: any) {    
      console.error('Error deleting photo:', err);    
      setError(`Failed to delete photo: ${err.message}`);    
    }    
  };

  return {    
    dishes,    
    isLoading,    
    error,    
    currentUserId,    
    setError,    
    addDish,    
    deleteDish,    
    updateDishRating,    
    updateDishName,    
    searchDishes,    
    checkForSimilarDishes,
    addComment,    
    updateComment,    
    deleteComment,    
    addPhoto,    
    deletePhoto    
  };    
};