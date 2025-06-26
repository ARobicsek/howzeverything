// src/hooks/useDishes.tsx    
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { enhancedDishSearch, findSimilarDishes } from '../utils/dishSearch';


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
            ? ratings.reduce((sum: number, r: DishRating) => sum + r.rating, 0) / actualTotalRatings    
            : 0;


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
            const { data: urlData } = supabase.storage    
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
              url: urlData?.publicUrl    
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


  // Enhanced search function using the new dishSearch utility
  const searchDishes = (searchTerm: string): DishSearchResult[] => {
    if (!searchTerm.trim()) {
      return dishes.map(dish => ({
        ...dish,
        similarityScore: 100,
        isExactMatch: false,
        matchType: 'exact' as const
      }));
    }


    return enhancedDishSearch(dishes, searchTerm);
  };


  // Function to find similar dishes for duplicate detection
  const findSimilarDishesForDuplicate = (newDishName: string): DishSearchResult[] => {
    return findSimilarDishes(dishes, newDishName, 75); // 75% similarity threshold
  };


  // MODIFIED: Rating is now optional
  const addDish = async (name: string, rating: number) => {    
    if (!name.trim()) return false;    
       
    setError(null);    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) {    
        setError('You must be logged in to add a dish');    
        return false;    
      }


      // First, add the dish    
      const { data: dishData, error: dishError } = await supabase    
        .from('restaurant_dishes')    
        .insert([{    
          name: name.trim(),    
          restaurant_id: restaurantId,    
          created_by: user.id,    
          is_active: true,    
          verified_by_restaurant: false    
        }])    
        .select()    
        .single();


      if (dishError) throw dishError;


      if (dishData) {    
        let tempRating: DishRating | null = null;
        // MODIFIED: Only add a rating if one was provided (rating > 0)
        if (rating > 0) {
          const { error: ratingError } = await supabase    
            .from('dish_ratings')    
            .insert([{    
              dish_id: dishData.id,    
              user_id: user.id,    
              rating: rating    
            }]);

          if (ratingError) {    
            // This is not a fatal error, the dish was still created.
            console.warn('Failed to create initial rating:', ratingError);    
          }

          tempRating = {    
            id: 'temp-' + Date.now(),    
            user_id: user.id,    
            rating: rating,    
            notes: null,    
            date_tried: new Date().toISOString(),    
            created_at: new Date().toISOString(),    
            updated_at: new Date().toISOString(),    
            dish_id: dishData.id    
          };
        }

        const newDish: DishWithDetails = {    
          ...(dishData as RestaurantDish),    
          dish_comments: [],    
          dish_ratings: tempRating ? [tempRating] : [], // Add rating only if it exists
          dish_photos: [],    
          total_ratings: tempRating ? 1 : 0,    
          average_rating: tempRating ? rating : 0,    
          dateAdded: dishData.created_at    
        };    
           
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


  const updateDishName = async (dishId: string, newName: string) => {
    setError(null);
    try {
        const { error: updateError } = await supabase
            .from('restaurant_dishes')
            .update({ name: newName.trim(), updated_at: new Date().toISOString() })
            .eq('id', dishId);

        if (updateError) throw updateError;

        setDishes(prev => {
            const updatedDishes = prev.map(dish => {
                if (dish.id === dishId) {
                    return { ...dish, name: newName.trim() };
                }
                return dish;
            });
            // Re-sort the array to maintain order
            return sortDishesArray(updatedDishes, sortBy, currentUserId);
        });
        return true;
    } catch (err: any) {
        console.error('Error updating dish name:', err);
        setError(`Failed to update dish name: ${err.message}`);
        return false;
    }
  };


  // MODIFIED: Implemented optimistic updates for instant UI feedback.
  const updateDishRating = async (dishId: string, rating: number, notes?: string, dateTried?: string) => {    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const originalDishes = [...dishes];

    // Optimistically update the UI
    setDishes(prevDishes => prevDishes.map(dish => {
      if (dish.id === dishId) {
        let updatedRatings: DishRating[];

        if (rating === 0) { // Deleting the rating
          updatedRatings = dish.dish_ratings.filter(r => r.user_id !== user.id);
        } else { // Adding or updating the rating
          const otherUserRatings = dish.dish_ratings.filter(r => r.user_id !== user.id);
          const newOrUpdatedRating: DishRating = {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            rating,
            notes: notes || null,
            date_tried: dateTried || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            dish_id: dishId,
          };
          updatedRatings = [...otherUserRatings, newOrUpdatedRating];
        }
        
        const total_ratings = updatedRatings.length;
        const average_rating = total_ratings > 0 ? updatedRatings.reduce((sum, r) => sum + r.rating, 0) / total_ratings : 0;
        
        return {
          ...dish,
          dish_ratings: updatedRatings,
          total_ratings,
          average_rating: Math.round(average_rating * 10) / 10,
        };
      }
      return dish;
    }));

    // Perform the database operation
    try {    
      if (rating === 0) {
        const { error: deleteError } = await supabase
          .from('dish_ratings')
          .delete()
          .eq('dish_id', dishId)
          .eq('user_id', user.id);
        if (deleteError) throw deleteError;
      } else {
        const { error: upsertError } = await supabase
          .from('dish_ratings')
          .upsert({
              dish_id: dishId,
              user_id: user.id,
              rating,
              notes: notes || null,
              date_tried: dateTried || new Date().toISOString().split('T')[0],
            }, {
              onConflict: 'dish_id,user_id',
            });
        if (upsertError) throw upsertError;
      }
    } catch (err) {    
      console.error("Error updating dish rating:", err);
      setError(err instanceof Error ? err.message : 'Failed to update dish rating');
      // Revert to original state on failure
      setDishes(originalDishes);
    }    
  };


  const addComment = async (dishId: string, commentText: string) => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) throw new Error('User not authenticated');    
      const { data, error } = await supabase    
        .from('dish_comments')    
        .insert({    
          dish_id: dishId,    
          user_id: user.id,    
          comment_text: commentText    
        })    
        .select(`    
          *,    
          users (    
            full_name,    
            email    
          )    
        `)    
        .single();    
      if (error) throw error;    
      // Update local state    
      const newComment = {    
        ...data,    
        commenter_name: data.users?.full_name || 'Unknown User',    
        commenter_email: data.users?.email || ''    
      };    
      setDishes(prevDishes => {    
        return prevDishes.map(dish => {    
          if (dish.id === dishId) {    
            return {    
              ...dish,    
              dish_comments: [...dish.dish_comments, newComment]    
            };    
          }    
          return dish;    
        });    
      });    
    } catch (err) {    
      throw err instanceof Error ? err : new Error('Failed to add comment');    
    }    
  };


  const deleteComment = async (commentId: string) => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) throw new Error('User not authenticated');    
      // First, check if the user is the creator of the comment    
      const allComments = dishes.flatMap(dish => dish.dish_comments);    
      const comment = allComments.find(c => c.id === commentId);    
      if (!comment) throw new Error('Comment not found');    
      if (comment.user_id !== user.id) {    
        throw new Error('You can only delete your own comments');    
      }    
      const { error } = await supabase    
        .from('dish_comments')    
        .delete()    
        .eq('id', commentId);    
      if (error) throw error;    
      // Update local state    
      setDishes(prevDishes => {    
        return prevDishes.map(dish => ({    
          ...dish,    
          dish_comments: dish.dish_comments.filter(c => c.id !== commentId)    
        }));    
      });    
    } catch (err) {    
      throw err instanceof Error ? err : new Error('Failed to delete comment');    
    }    
  };


  const updateComment = async (commentId: string, commentText: string) => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) throw new Error('User not authenticated');    
      // First, check if the user is the creator of the comment    
      const allComments = dishes.flatMap(dish => dish.dish_comments);    
      const comment = allComments.find(c => c.id === commentId);    
      if (!comment) throw new Error('Comment not found');    
      if (comment.user_id !== user.id) {    
        throw new Error('You can only edit your own comments');    
      }    
      const { error } = await supabase    
        .from('dish_comments')    
        .update({ comment_text: commentText })    
        .eq('id', commentId);    
      if (error) throw error;    
      // Update local state    
      setDishes(prevDishes => {    
        return prevDishes.map(dish => ({    
          ...dish,    
          dish_comments: dish.dish_comments.map(c =>    
            c.id === commentId ? { ...c, comment_text: commentText } : c    
          )    
        }));    
      });    
    } catch (err) {    
      throw err instanceof Error ? err : new Error('Failed to update comment');    
    }    
  };


  const addPhoto = async (dishId: string, file: File, caption?: string) => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) throw new Error('User not authenticated');    
      // Resize image before upload    
      const resizedFile = await resizeImage(file, 800, 800);    
      // Generate unique filename    
      const timestamp = Date.now();    
      const randomId = Math.random().toString(36).substring(2, 15);    
      const fileExtension = file.name.split('.').pop();    
      const filename = `${dishId}/${timestamp}_${randomId}.${fileExtension}`;    
      // Upload to Supabase storage    
      const { error: uploadError } = await supabase.storage    
        .from('dish-photos')    
        .upload(filename, resizedFile);    
      if (uploadError) throw uploadError;    
      // Save photo record to database    
      const { data, error: dbError } = await supabase    
        .from('dish_photos')    
        .insert({    
          dish_id: dishId,    
          user_id: user.id,    
          storage_path: filename,    
          caption: caption || null,    
          width: 800,    
          height: 800    
        })    
        .select(`    
          *,    
          users (    
            full_name,    
            email    
          )    
        `)    
        .single();    
      if (dbError) throw dbError;    
      // Update local state    
      const baseUrl = supabase.storage.from('dish-photos').getPublicUrl('').data.publicUrl;    
      const newPhoto = {    
        ...data,    
        photographer_name: data.users?.full_name || 'Unknown User',    
        photographer_email: data.users?.email || '',    
        url: `${baseUrl}${filename}`    
      };    
      setDishes(prevDishes => {    
        return prevDishes.map(dish => {    
          if (dish.id === dishId) {    
            return {    
              ...dish,    
              dish_photos: [newPhoto, ...dish.dish_photos]    
            };    
          }    
          return dish;    
        });    
      });    
    } catch (err) {    
      throw err instanceof Error ? err : new Error('Failed to upload photo');    
    }    
  };


  const deletePhoto = async (photoId: string) => {    
    try {    
      const { data: { user } } = await supabase.auth.getUser();    
      if (!user) throw new Error('User not authenticated');    
      // Find the photo to get its storage path and check ownership    
      const allPhotos = dishes.flatMap(dish => dish.dish_photos);    
      const photo = allPhotos.find(p => p.id === photoId);    
      if (!photo) throw new Error('Photo not found');    
      if (photo.user_id !== user.id) {    
        throw new Error('You can only delete your own photos');    
      }    
      // Delete from storage    
      const { error: storageError } = await supabase.storage    
        .from('dish-photos')    
        .remove([photo.storage_path]);    
      if (storageError) throw storageError;    
      // Delete from database    
      const { error: dbError } = await supabase    
        .from('dish_photos')    
        .delete()    
        .eq('id', photoId);    
      if (dbError) throw dbError;    
      // Update local state    
      setDishes(prevDishes => {    
        return prevDishes.map(dish => ({    
          ...dish,    
          dish_photos: dish.dish_photos.filter(p => p.id !== photoId)    
        }));    
      });    
    } catch (err) {    
      throw err instanceof Error ? err : new Error('Failed to delete photo');    
    }    
  };


  const refetch = async () => {    
    if (!restaurantId) return;    
    setIsLoading(true);    
    // This will trigger the useEffect to refetch    
    const { data: { user } } = await supabase.auth.getUser();    
    setCurrentUserId(user?.id || null);    
  };


  return {    
    dishes,    
    isLoading,    
    error,    
    setError,
    addDish,    
    deleteDish,    
    updateDishRating,
    updateDishName,
    addComment,    
    deleteComment,    
    updateComment,    
    addPhoto,
    deletePhoto,    
    refetch,    
    searchDishes, // Enhanced search function
    findSimilarDishesForDuplicate, // New duplicate detection function
    currentUserId    
  };    
};


// Helper function to resize images    
const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {    
  return new Promise((resolve) => {    
    const canvas = document.createElement('canvas');    
    const ctx = canvas.getContext('2d')!;    
    const img = new Image();    
    img.onload = () => {    
      const { width, height } = img;    
      const scale = Math.min(maxWidth / width, maxHeight / height);    
      canvas.width = width * scale;    
      canvas.height = height * scale;    
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);    
      canvas.toBlob((blob) => {    
        const resizedFile = new File([blob!], file.name, {    
          type: file.type,    
          lastModified: Date.now()    
        });    
        resolve(resizedFile);    
      }, file.type, 0.8);    
    };    
    img.src = URL.createObjectURL(file);    
  });    
};