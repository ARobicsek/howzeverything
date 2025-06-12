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
        ? a.dish_ratings.find(r => r.user_id === currentUserId)?.rating || 0
        : 0;
      // Find current user's rating for dish B
      const userRatingB = currentUserId
        ? b.dish_ratings.find(r => r.user_id === currentUserId)?.rating || 0
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
          const commentsWithUserInfo = (d.dish_comments as any[])?.map(comment => ({
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
          const photosWithInfo = (d.dish_photos as any[])?.map(photo => {
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
        // Then add the user's rating
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

        // Create the new dish object with the user's rating included
        const tempRating: DishRating = {
          id: 'temp-' + Date.now(),
          user_id: user.id,
          rating: rating,
          notes: null,
          date_tried: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dish_id: dishData.id
        };

        const newDish: DishWithDetails = {
          ...(dishData as RestaurantDish),
          dish_comments: [],
          dish_ratings: [tempRating],
          dish_photos: [],
          // Calculate from actual ratings
          total_ratings: 1,
          average_rating: rating,
          dateAdded: dishData.created_at
        };
        
        // MODIFIED: Use reusable sort function, passing currentUserId
        setDishes(prev => sortDishesArray([...prev, newDish], sortBy, currentUserId));
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to delete dishes');
        return false;
      }
      
      const dish = dishes.find(d => d.id === dishId);
      
      if (dish && user && dish.created_by !== user.id) {
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

  const updateDishRating = async (dishId: string, newRating: number) => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to rate dishes');
        return false;
      }

      // Handle clearing rating (rating = 0)
      if (newRating === 0) {
        // Delete the rating
        const { error: deleteError } = await supabase
          .from('dish_ratings')
          .delete()
          .eq('dish_id', dishId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Rating delete error:', deleteError);
          throw deleteError;
        }

        // Update local state to remove the rating
        setDishes(prev => sortDishesArray(prev.map(dish => {
          if (dish.id === dishId) {
            // Remove the user's rating
            const updatedRatings = dish.dish_ratings.filter(r => r.user_id !== user.id);
            
            // Calculate new averages
            const totalRatings = updatedRatings.length;
            const averageRating = totalRatings > 0
              ? updatedRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
              : 0;
            
            return {
              ...dish,
              dish_ratings: updatedRatings,
              total_ratings: totalRatings,
              average_rating: Math.round(averageRating * 10) / 10
            };
          }
          return dish;
        }), sortBy, currentUserId));

        return true;
      }

      // Use upsert to handle both insert and update in one operation
      const { error: ratingError } = await supabase
        .from('dish_ratings')
        .upsert([{
          dish_id: dishId,
          user_id: user.id,
          rating: newRating,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'dish_id,user_id'
        });

      if (ratingError) {
        console.error('Rating upsert error:', ratingError);
        throw ratingError;
      }

      // Wait for database trigger to update the dish stats
      await new Promise(resolve => setTimeout(resolve, 800));

      // Optimistically update the local state immediately
      // MODIFIED: Pass currentUserId to sortDishesArray
      setDishes(prev => sortDishesArray(prev.map(dish => {
        if (dish.id === dishId) {
          // Update or add the user's rating
          const updatedRatings = dish.dish_ratings.some(r => r.user_id === user.id)
            ? dish.dish_ratings.map(r =>
                r.user_id === user.id
                  ? { ...r, rating: newRating, updated_at: new Date().toISOString() }
                  : r
              )
            : [...dish.dish_ratings, {
                id: 'temp-' + Date.now(),
                user_id: user.id,
                rating: newRating,
                notes: null,
                date_tried: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                dish_id: dishId
              }];
          
          // Calculate new averages
          const totalRatings = updatedRatings.length;
          const averageRating = totalRatings > 0
            ? updatedRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            : 0;
          
          // Debug logging for optimistic update
          console.log(`🔍 Optimistic update debug for dish ${dishId}:`);
          console.log('Updated ratings:', updatedRatings.map(r => ({ user_id: r.user_id.substring(0,8) + '...', rating: r.rating })));
          console.log('Individual ratings:', updatedRatings.map(r => r.rating));
          console.log('Sum:', updatedRatings.reduce((sum, r) => sum + r.rating, 0));
          console.log('Total:', totalRatings);
          console.log('Average:', averageRating);
          
          return {
            ...dish,
            dish_ratings: updatedRatings,
            total_ratings: totalRatings,
            average_rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
          };
        }
        return dish;
      }), sortBy, currentUserId));

      // Then fetch the real data from the database to ensure accuracy
      setTimeout(async () => {
        try {
          const { data: refreshedDish } = await supabase
            .from('restaurant_dishes')
            .select(`
              id,
              total_ratings,
              average_rating,
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

          if (refreshedDish && refreshedDish.dish_ratings) {
            // Calculate the REAL averages from the actual ratings data
            // This is the source of truth, not the database fields which might be stale
            const ratings = refreshedDish.dish_ratings as DishRating[];
            const actualTotalRatings = ratings.length;
            const actualAverageRating = actualTotalRatings > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / actualTotalRatings
              : 0;

            // Debug logging to see what's happening
            console.log(`🔍 Dish rating debug for dish ${dishId}:`);
            console.log('Ratings data:', ratings.map(r => ({ user_id: r.user_id.substring(0,8) + '...', rating: r.rating })));
            console.log('Individual ratings:', ratings.map(r => r.rating));
            console.log('Sum of ratings:', ratings.reduce((sum, r) => sum + r.rating, 0));
            console.log('Total ratings:', actualTotalRatings);
            console.log('Calculated average:', actualAverageRating);
            console.log('Database stored average:', refreshedDish.average_rating);

            // MODIFIED: Pass currentUserId to sortDishesArray
            setDishes(prev => sortDishesArray(prev.map(dish =>
              dish.id === dishId
                ? {
                    ...dish,
                    // Use calculated values from actual ratings, not database fields
                    total_ratings: actualTotalRatings,
                    average_rating: Math.round(actualAverageRating * 10) / 10,
                    dish_ratings: ratings
                  }
                : dish
            ), sortBy, currentUserId));
          }
        } catch (refreshError) {
          console.warn('Could not refresh dish data:', refreshError);
        }
      }, 1500);

      return true;
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError(`Failed to update rating: ${err.message}`);
      return false;
    }
  };

  // NEW: Update dish name function
  const updateDishName = async (dishId: string, newName: string) => {
    if (!newName.trim()) return false;
    
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to edit dishes');
        return false;
      }

      const dish = dishes.find(d => d.id === dishId);
      
      // Check if user can edit this dish (must be creator or admin)
      if (dish && dish.created_by !== user.id) {
        const { data: profile } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (!profile?.is_admin) {
          setError('You can only edit dishes you created');
          return false;
        }
      }

      const { error } = await supabase
        .from('restaurant_dishes')
        .update({ 
          name: newName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', dishId);

      if (error) throw error;

      // Update local state
      setDishes(prev => sortDishesArray(prev.map(dish =>
        dish.id === dishId
          ? { ...dish, name: newName.trim(), updated_at: new Date().toISOString() }
          : dish
      ), sortBy, currentUserId));

      return true;
    } catch (err: any) {
      console.error('Error updating dish name:', err);
      setError(`Failed to update dish name: ${err.message}`);
      return false;
    }
  };

  // Updated addComment function to refresh with user information
  const addComment = async (dishId: string, commentText: string): Promise<void> => {
    if (!commentText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to add comments');
      return;
    }

    try {
      const { data: newComment, error } = await supabase
        .from('dish_comments')
        .insert([{
          dish_id: dishId,
          user_id: user.id,
          comment_text: commentText.trim()
        }])
        .select(`
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
        `)
        .single();

      if (error) throw error;

      if (newComment) {
        // Add the comment with user information to local state
        const commentWithUserInfo: DishComment = {
          id: newComment.id,
          dish_id: newComment.dish_id,
          comment_text: newComment.comment_text,
          created_at: newComment.created_at,
          updated_at: newComment.updated_at,
          user_id: newComment.user_id,
          commenter_name: (newComment.users as any)?.full_name || 'Anonymous User',
          commenter_email: (newComment.users as any)?.email
        };

        // MODIFIED: Ensure new comment is added to the correct dish and then the dishes array is sorted
        setDishes(prev => sortDishesArray(prev.map(dish =>
          dish.id === dishId
            ? { ...dish, dish_comments: [...dish.dish_comments, commentWithUserInfo] }
            : dish
        ), sortBy, currentUserId));
      }
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(`Failed to add comment: ${err.message}`);
    }
  };

  // Updated updateComment function
  const updateComment = async (commentId: string, dishId: string, newText: string): Promise<void> => {
    if (!newText.trim()) return;

    try {
      const { error } = await supabase
        .from('dish_comments')
        .update({
          comment_text: newText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      // Update local state
      // MODIFIED: Ensure the dishes array is sorted after updating a comment
      setDishes(prev => sortDishesArray(prev.map(dish =>
        dish.id === dishId
          ? {
              ...dish,
              dish_comments: dish.dish_comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, comment_text: newText.trim(), updated_at: new Date().toISOString() }
                  : comment
              )
            }
          : dish
      ), sortBy, currentUserId));
    } catch (err: any) {
      console.error('Error updating comment:', err);
      setError(`Failed to update comment: ${err.message}`);
    }
  };

  // Updated deleteComment function
  const deleteComment = async (dishId: string, commentId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('dish_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Remove from local state
      // MODIFIED: Ensure the dishes array is sorted after deleting a comment
      setDishes(prev => sortDishesArray(prev.map(dish =>
        dish.id === dishId
          ? {
              ...dish,
              dish_comments: dish.dish_comments.filter(comment => comment.id !== commentId)
            }
          : dish
      ), sortBy, currentUserId));
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(`Failed to delete comment: ${err.message}`);
    }
  };

  // NEW: Add photo function
  const addPhoto = async (dishId: string, file: File, caption?: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to add photos');
      return;
    }

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${dishId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('dish-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get image dimensions (optional)
      let width: number | null = null;
      let height: number | null = null;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        const imgPromise = new Promise<void>((resolve) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            resolve();
          };
        });
        img.src = URL.createObjectURL(file);
        await imgPromise;
      }

      // Save metadata to database
      const { data: photoData, error: dbError } = await supabase
        .from('dish_photos')
        .insert([{
          dish_id: dishId,
          user_id: user.id,
          storage_path: fileName,
          caption: caption?.trim(),
          width,
          height
        }])
        .select(`
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
        `)
        .single();

      if (dbError) throw dbError;

      if (photoData) {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('dish-photos')
          .getPublicUrl(fileName);

        const photoWithInfo: DishPhoto = {
          id: photoData.id,
          dish_id: photoData.dish_id,
          user_id: photoData.user_id,
          storage_path: photoData.storage_path,
          caption: photoData.caption,
          width: photoData.width,
          height: photoData.height,
          created_at: photoData.created_at,
          updated_at: photoData.updated_at,
          photographer_name: (photoData.users as any)?.full_name || 'Anonymous User',
          photographer_email: (photoData.users as any)?.email,
          url: urlData?.publicUrl
        };

        // Update local state
        setDishes(prev => sortDishesArray(prev.map(dish =>
          dish.id === dishId
            ? { ...dish, dish_photos: [...dish.dish_photos, photoWithInfo] }
            : dish
        ), sortBy, currentUserId));
      }
    } catch (err: any) {
      console.error('Error adding photo:', err);
      setError(`Failed to add photo: ${err.message}`);
    }
  };

  // NEW: Delete photo function
  const deletePhoto = async (dishId: string, photoId: string): Promise<void> => {
    try {
      // Get photo details first
      const photo = dishes.find(d => d.id === dishId)?.dish_photos.find(p => p.id === photoId);
      if (!photo) throw new Error('Photo not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('dish-photos')
        .remove([photo.storage_path]);

      if (storageError) console.warn('Error deleting from storage:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('dish_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Update local state
      setDishes(prev => sortDishesArray(prev.map(dish =>
        dish.id === dishId
          ? {
              ...dish,
              dish_photos: dish.dish_photos.filter(photo => photo.id !== photoId)
            }
          : dish
      ), sortBy, currentUserId));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      setError(`Failed to delete photo: ${err.message}`);
    }
  };

  // Helper function to check if a dish name might be a duplicate
  const checkForSimilarDishes = (dishName: string, threshold: number = 80): DishSearchResult[] => {
    return searchDishes(dishName).filter(dish =>
      (dish.similarityScore || 0) >= threshold
    );
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
    updateDishName, // NEW
    setDishes,
    searchDishes,
    checkForSimilarDishes,
    // Comment functions
    addComment,
    updateComment,
    deleteComment,
    // Photo functions
    addPhoto,
    deletePhoto
  };
};