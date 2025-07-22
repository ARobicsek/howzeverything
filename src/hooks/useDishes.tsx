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
  is_hidden?: boolean | null; // <-- THE FIX: Changed from boolean | undefined
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
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_by: string | null;
  verified_by_restaurant: boolean;
  total_ratings: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}
export interface DishWithDetails extends RestaurantDish {
  comments: DishComment[];
  ratings: DishRating[];
  photos: DishPhoto[];
  dateAdded: string;
}
// New interface for search/discovery results
export interface DishSearchResult extends DishWithDetails {
  similarityScore?: number;
  isExactMatch?: boolean;
  matchType?: 'exact' | 'fuzzy' | 'partial';
}
// NEW: Interface for global dish search results that includes restaurant data
export interface DishSearchResultWithRestaurant extends DishWithDetails {
  restaurant: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}
// NEW: Standalone processor for useDishes hook to avoid dependency on restaurant data
const processDishesForMenu = (rawData: any[]): DishWithDetails[] => {
  return (rawData || [])
    .map((d): DishWithDetails | null => {
      if (!d || !d.id || !d.restaurant_id) return null; // Basic validation
      const ratings = (d.dish_ratings as DishRating[]) || [];
      const actualTotalRatings = ratings.length;
      const actualAverageRating = actualTotalRatings > 0
        ? ratings.reduce((sum: number, r: DishRating) => sum + r.rating, 0) / actualTotalRatings
        : 0;
      const commentsWithUserInfo: DishComment[] = ((d.dish_comments as any[]) || [])
        .filter((comment: any) => comment.is_hidden !== true)
        .map((comment: any): DishComment => ({
          id: comment.id,
          dish_id: comment.dish_id || d.id,
          comment_text: comment.comment_text,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user_id: comment.user_id,
          is_hidden: comment.is_hidden,
          commenter_name: comment.users?.full_name || 'Anonymous User',
          commenter_email: comment.users?.email,
        }));
      const photosWithInfo: DishPhoto[] = ((d.dish_photos as any[]) || [])
        .map((photo: any): DishPhoto | null => {
          const { data: urlData } = supabase.storage.from('dish-photos').getPublicUrl(photo.storage_path);
          if (!photo.user_id || !photo.created_at || !photo.id) return null;
          return {
            id: photo.id,
            dish_id: photo.dish_id ?? d.id,
            user_id: photo.user_id,
            storage_path: photo.storage_path,
            caption: photo.caption,
            width: photo.width,
            height: photo.height,
            created_at: photo.created_at,
            updated_at: photo.updated_at ?? photo.created_at,
            photographer_name: photo.users?.full_name || 'Anonymous User',
            photographer_email: photo.users?.email,
            url: urlData?.publicUrl,
          };
        }).filter((p): p is DishPhoto => p !== null);
      const result: DishWithDetails = {
        id: d.id,
        restaurant_id: d.restaurant_id,
        name: d.name || '',
        description: d.description,
        category: d.category,
        is_active: d.is_active ?? true,
        created_by: d.created_by,
        verified_by_restaurant: d.verified_by_restaurant ?? false,
        created_at: d.created_at ?? new Date().toISOString(),
        updated_at: d.updated_at ?? new Date().toISOString(),
        comments: commentsWithUserInfo,
        ratings: ratings,
        photos: photosWithInfo,
        total_ratings: actualTotalRatings,
        average_rating: Math.round(actualAverageRating * 10) / 10,
        dateAdded: d.created_at ?? new Date().toISOString(),
      };
      return result;
    })
    .filter((d): d is DishWithDetails => d !== null);
};
// NEW: Helper to process raw dish data from Supabase into our detailed types
const processRawDishes = (rawData: any[]): DishSearchResultWithRestaurant[] => {
  return (rawData || [])
    .map((d): DishSearchResultWithRestaurant | null => {
      if (!d || !d.restaurants || !d.id || !d.restaurant_id) return null;
      const ratings = (d.dish_ratings as DishRating[]) || [];
      const actualTotalRatings = ratings.length;
      const actualAverageRating = actualTotalRatings > 0
        ? ratings.reduce((sum: number, r: DishRating) => sum + r.rating, 0) / actualTotalRatings
        : 0;
      const commentsWithUserInfo: DishComment[] = ((d.dish_comments as any[]) || [])
        .filter((comment: any) => comment.is_hidden !== true)
        .map((comment: any): DishComment => ({
            id: comment.id,
            dish_id: comment.dish_id || d.id,
            comment_text: comment.comment_text,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user_id: comment.user_id,
            is_hidden: comment.is_hidden,
            commenter_name: comment.users?.full_name || 'Anonymous User',
            commenter_email: comment.users?.email,
        }));
      const photosWithInfo: DishPhoto[] = ((d.dish_photos as any[]) || [])
        .map((photo: any): DishPhoto | null => {
          const { data: urlData } = supabase.storage.from('dish-photos').getPublicUrl(photo.storage_path);
          if (!photo.user_id || !photo.created_at || !photo.id) return null;
          return {
            id: photo.id,
            dish_id: photo.dish_id ?? d.id,
            user_id: photo.user_id,
            storage_path: photo.storage_path,
            caption: photo.caption,
            width: photo.width,
            height: photo.height,
            created_at: photo.created_at,
            updated_at: photo.updated_at ?? photo.created_at,
            photographer_name: photo.users?.full_name || 'Anonymous User',
            photographer_email: photo.users?.email,
            url: urlData?.publicUrl,
          };
        }).filter((p): p is DishPhoto => p !== null);
      const result: DishSearchResultWithRestaurant = {
        id: d.id,
        restaurant_id: d.restaurant_id,
        name: d.name || '',
        description: d.description,
        category: d.category,
        is_active: d.is_active ?? true,
        created_by: d.created_by,
        verified_by_restaurant: d.verified_by_restaurant ?? false,
        created_at: d.created_at ?? new Date().toISOString(),
        updated_at: d.updated_at ?? new Date().toISOString(),
        comments: commentsWithUserInfo,
        ratings: ratings,
        photos: photosWithInfo,
        total_ratings: actualTotalRatings,
        average_rating: Math.round(actualAverageRating * 10) / 10,
        dateAdded: d.created_at ?? new Date().toISOString(),
        restaurant: d.restaurants, // The joined restaurant data
      };
      return result;
    })
    .filter((d): d is DishSearchResultWithRestaurant => d !== null);
};
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
      const userRatingA = currentUserId
        ? a.ratings.find((r: DishRating) => r.user_id === currentUserId)?.rating || 0
        : 0;
      const userRatingB = currentUserId
        ? b.ratings.find((r: DishRating) => r.user_id === currentUserId)?.rating || 0
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
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const response = await fetch(`${supabaseUrl}/functions/v1/get-menu-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ restaurantId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        // Sanitize data from the edge function to ensure it matches client-side types
        const dishesWithDetails = (data || []).map((dish: any) => ({
            ...dish,
            ratings: dish.ratings || [],
            comments: dish.comments || [],
            photos: dish.photos || [],
        }));
        setDishes(sortDishesArray(dishesWithDetails, sortBy, currentUserId));
      } catch (err: any) {
        console.error('Error fetching menu data:', err);
        setError(`Failed to load menu: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDishes();
  }, [restaurantId, sortBy.criterion, sortBy.direction, currentUserId]);
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
  const findSimilarDishesForDuplicate = (newDishName: string): DishSearchResult[] => {
    return findSimilarDishes(dishes, newDishName, 75); // 75% similarity threshold
  };
  const addDish = async (name: string, rating: number): Promise<DishWithDetails | null> => {
    if (!name.trim()) return null;
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to add a dish');
        return null;
      }
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
        if (rating > 0) {
          const { error: ratingError } = await supabase
            .from('dish_ratings')
            .insert([{
              dish_id: dishData.id,
              user_id: user.id,
              rating: rating
            }]);
          if (ratingError) {
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
          ...(processDishesForMenu([dishData])[0]),
          ratings: tempRating ? [tempRating] : [],
          total_ratings: tempRating ? 1 : 0,
          average_rating: tempRating ? rating : 0,
        };
        setDishes(prev => sortDishesArray([...prev, newDish], sortBy, currentUserId));
        return newDish;
      }
    } catch (err: any) {
      console.error('Error adding dish:', err);
      setError(`Failed to add dish: ${err.message}`);
      return null;
    }
    return null;
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
      const { data: deletedData, error } = await supabase
        .from('restaurant_dishes')
        .delete()
        .eq('id', dishId)
        .select();
      if (error) {
        throw error;
      }
      if (!deletedData || deletedData.length === 0) {
        throw new Error("Deletion failed. You may not have permission, or the dish does not exist.");
      }
      setDishes(prev => prev.filter(d => d.id !== dishId));
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
            return sortDishesArray(updatedDishes, sortBy, currentUserId);
        });
        return true;
    } catch (err: any) {
        console.error('Error updating dish name:', err);
        setError(`Failed to update dish name: ${err.message}`);
        return false;
    }
  };
  const updateDishRating = async (dishId: string, rating: number, notes?: string, dateTried?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('User not authenticated');
      return;
    }
    const originalDishes = [...dishes];
    setDishes(prevDishes => prevDishes.map(dish => {
      if (dish.id === dishId) {
        let updatedRatings: DishRating[];
        if (rating === 0) {
          updatedRatings = dish.ratings.filter(r => r.user_id !== user.id);
        } else {
          const otherUserRatings = dish.ratings.filter(r => r.user_id !== user.id);
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
          ratings: updatedRatings,
          total_ratings,
          average_rating: Math.round(average_rating * 10) / 10,
        };
      }
      return dish;
    }));
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
          users!dish_comments_user_id_fkey (
            full_name,
            email
          )
        `)
        .single();
      if (error) throw error;
      const newComment: DishComment = {
        ...data,
        commenter_name: data.users?.full_name || 'Unknown User',
        commenter_email: data.users?.email || ''
      };
      setDishes(prevDishes => {
        return prevDishes.map(dish => {
          if (dish.id === dishId) {
            return {
              ...dish,
              comments: [...dish.comments, newComment]
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
      const allComments = dishes.flatMap(dish => dish.comments);
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
      setDishes(prevDishes => {
        return prevDishes.map(dish => ({
          ...dish,
          comments: dish.comments.filter(c => c.id !== commentId)
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
      const allComments = dishes.flatMap(dish => dish.comments);
      const comment = allComments.find(c => c.id === commentId);
      if (!comment) throw new Error('Comment not found');
      if (comment.user_id !== user.id) {
        throw new Error('You can only edit your own comments');
      }
      const { error } = await supabase
        .from('dish_comments')
        .update({ comment_text: commentText, updated_at: new Date().toISOString() })
        .eq('id', commentId);
      if (error) throw error;
      setDishes(prevDishes => {
        return prevDishes.map(dish => ({
          ...dish,
          comments: dish.comments.map(c =>
            c.id === commentId ? { ...c, comment_text: commentText, updated_at: new Date().toISOString() } : c
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
      const resizedFile = await resizeImage(file, 800, 800);
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const filename = `${dishId}/${timestamp}_${randomId}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage
        .from('dish-photos')
        .upload(filename, resizedFile);
      if (uploadError) throw uploadError;
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
          users!dish_photos_user_id_fkey (
            full_name,
            email
          )
        `)
        .single();
      if (dbError) throw dbError;
      if (!data) {
        throw new Error('Could not retrieve photo data after upload.');
      }
      const baseUrl = supabase.storage.from('dish-photos').getPublicUrl('').data.publicUrl;
      const newPhoto: DishPhoto = {
        id: data.id,
        dish_id: data.dish_id ?? dishId,
        user_id: data.user_id ?? user.id,
        storage_path: data.storage_path,
        caption: data.caption,
        width: data.width,
        height: data.height,
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? new Date().toISOString(),
        photographer_name: data.users?.full_name || 'Unknown User',
        photographer_email: data.users?.email || '',
        url: `${baseUrl}${filename}`
      };
      setDishes(prevDishes => {
        return prevDishes.map(dish => {
          if (dish.id === dishId) {
            return {
              ...dish,
              photos: [newPhoto, ...dish.photos]
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
      const allPhotos = dishes.flatMap(dish => dish.photos);
      const photo = allPhotos.find(p => p.id === photoId);
      if (!photo) throw new Error('Photo not found');
      if (photo.user_id !== user.id) {
        throw new Error('You can only delete your own photos');
      }
      const { error: storageError } = await supabase.storage
        .from('dish-photos')
        .remove([photo.storage_path]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase
        .from('dish_photos')
        .delete()
        .eq('id', photoId);
      if (dbError) throw dbError;
      setDishes(prevDishes => {
        return prevDishes.map(dish => ({
          ...dish,
          photos: dish.photos.filter(p => p.id !== photoId)
        }));
      });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete photo');
    }
  };
  const refetch = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
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
    searchDishes,
    findSimilarDishesForDuplicate,
    currentUserId
  };
};
export const updateRatingForDish = async (
  dishId: string,
  userId: string,
  rating: number
): Promise<boolean> => {
  try {
    if (!userId) {
      throw new Error("User must be authenticated to rate a dish.");
    }
    if (rating === 0) {
      const { error } = await supabase
        .from('dish_ratings')
        .delete()
        .match({ dish_id: dishId, user_id: userId });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('dish_ratings')
        .upsert(
          { dish_id: dishId, user_id: userId, rating: rating },
          { onConflict: 'dish_id,user_id' }
        );
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error("Error in updateRatingForDish:", err);
    return false;
  }
};
export const fetchMyRatedDishes = async (userId: string): Promise<DishSearchResultWithRestaurant[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('dish_ratings')
    .select(`
      restaurant_dishes!inner(
        *,
        restaurants!inner(id, name, latitude, longitude),
        dish_ratings ( id, user_id, rating ),
        dish_photos ( id, user_id, storage_path, created_at, updated_at ),
        dish_comments ( id, user_id, comment_text, created_at, updated_at, is_hidden )
      )
    `)
    .eq('user_id', userId)
    .not('restaurant_dishes', 'is', null);
  if (error) {
    console.error("Error fetching rated dishes:", error);
    throw error;
  }
  if (!data) return [];
  const rawDishes = data.map(item => item.restaurant_dishes);
  const validRawDishes = rawDishes.filter(d => d !== null);
  return processRawDishes(validRawDishes);
};
export const searchAllDishes = async (
  searchTerm?: string,
  minRating?: number
): Promise<DishSearchResultWithRestaurant[]> => {
  try {
    console.time('edge-function-dish-search');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;




    const response = await fetch(`${supabaseUrl}/functions/v1/dish-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        searchTerm: searchTerm?.trim(),
        minRating: minRating,
      }),
    });




    console.timeEnd('edge-function-dish-search');




    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }




    const results: any[] = await response.json();


    // --- THE FIX: Client-side data sanitization ---
    // This is a safety net to ensure that the data shape from the edge function
    // is always what the client components expect, preventing crashes.
    return (results || []).map((dish: any) => ({
      ...dish,
      ratings: dish.ratings || [],
      comments: dish.comments || [],
      photos: dish.photos || [],
    }));


  } catch (err) {
    console.error('Client-side error calling dish-search edge function:', err);
    if (err instanceof Error) {
        throw new Error(`There was a problem searching for dishes. Please try again. (${err.message})`);
    }
    throw new Error('An unknown error occurred while searching for dishes.');
  }
};
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