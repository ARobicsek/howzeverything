// src/hooks/useDishes.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { enhancedDishSearch, findSimilarDishes } from '../utils/dishSearch';
import DOMPurify from 'dompurify';
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
interface RawDishData {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price?: number;
  dish_ratings: DishRating[];
  dish_comments: unknown[];
  dish_photos: unknown[];
  [key: string]: unknown;
}

const processDishesForMenu = (rawData: RawDishData[]): DishWithDetails[] => {
  return (rawData || [])
    .map((d): DishWithDetails | null => {
      if (!d || !d.id || !d.restaurant_id) return null; // Basic validation
      const ratings = (d.dish_ratings as DishRating[]) || [];
      const actualTotalRatings = ratings.length;
      const actualAverageRating = actualTotalRatings > 0
        ? ratings.reduce((sum: number, r: DishRating) => sum + r.rating, 0) / actualTotalRatings
        : 0;
      const commentsWithUserInfo: DishComment[] = ((d.dish_comments as unknown[]) || [])
        .filter((comment: unknown) => {
          const c = comment as { is_hidden?: boolean };
          return c.is_hidden !== true;
        })
        .map((comment: unknown): DishComment => {
          const c = comment as Record<string, unknown>;
          const users = c.users as { full_name?: string } | undefined;
          return {
            id: String(c.id || ''),
            dish_id: String(c.dish_id || d.id || ''),
            comment_text: String(c.comment_text || ''),
            created_at: String(c.created_at || ''),
            updated_at: String(c.updated_at || ''),
            user_id: String(c.user_id || ''),
            is_hidden: Boolean(c.is_hidden),
            commenter_name: users?.full_name || 'Anonymous User',
            commenter_email: (users as { email?: string })?.email,
          };
        });
      const photosWithInfo: DishPhoto[] = ((d.dish_photos as unknown[]) || [])
        .map((photo: unknown): DishPhoto | null => {
          const p = photo as Record<string, unknown>;
          const { data: urlData } = supabase.storage.from('dish-photos').getPublicUrl(p.storage_path as string);
          if (!p.user_id || !p.created_at || !p.id) return null;
          const users = p.users as { full_name?: string; email?: string } | undefined;
          return {
            id: p.id as string,
            dish_id: (p.dish_id as string) ?? d.id,
            user_id: p.user_id as string,
            storage_path: p.storage_path as string,
            caption: p.caption as string | null,
            width: p.width as number | null,
            height: p.height as number | null,
            created_at: p.created_at as string,
            updated_at: (p.updated_at as string) ?? (p.created_at as string),
            photographer_name: users?.full_name || 'Anonymous User',
            photographer_email: users?.email,
            url: urlData?.publicUrl,
          };
        }).filter((p): p is DishPhoto => p !== null);
      const result: DishWithDetails = {
        id: d.id,
        restaurant_id: d.restaurant_id || '',
        name: d.name || '',
        description: d.description ? String(d.description) : null,
        category: d.category ? String(d.category) : null,
        is_active: Boolean(d.is_active ?? true),
        created_by: d.created_by ? String(d.created_by) : null,
        verified_by_restaurant: Boolean(d.verified_by_restaurant ?? false),
        created_at: String(d.created_at ?? new Date().toISOString()),
        updated_at: String(d.updated_at ?? new Date().toISOString()),
        comments: commentsWithUserInfo,
        ratings: ratings,
        photos: photosWithInfo,
        total_ratings: actualTotalRatings,
        average_rating: Math.round(actualAverageRating * 10) / 10,
        dateAdded: String(d.created_at ?? new Date().toISOString()),
      };
      return result;
    })
    .filter((d): d is DishWithDetails => d !== null);
};
// NEW: Helper to process raw dish data from Supabase into our detailed types
const processRawDishes = (rawData: unknown[]): DishSearchResultWithRestaurant[] => {
  return (rawData || [])
    .map((item: unknown): DishSearchResultWithRestaurant | null => {
      const d = item as Record<string, unknown>;
      if (!d || !d.restaurants || !d.id || !d.restaurant_id) return null;
      const ratings = (d.dish_ratings as DishRating[]) || [];
      const actualTotalRatings = ratings.length;
      const actualAverageRating = actualTotalRatings > 0
        ? ratings.reduce((sum: number, r: DishRating) => sum + r.rating, 0) / actualTotalRatings
        : 0;
      const commentsWithUserInfo: DishComment[] = ((d.dish_comments as unknown[]) || [])
        .filter((comment: unknown) => (comment as Record<string, unknown>).is_hidden !== true)
        .map((comment: unknown): DishComment => {
          const c = comment as Record<string, unknown>;
          const users = c.users as { full_name?: string; email?: string } | undefined;
          return {
            id: String(c.id || ''),
            dish_id: String(c.dish_id || d.id || ''),
            comment_text: String(c.comment_text || ''),
            created_at: String(c.created_at || ''),
            updated_at: String(c.updated_at || ''),
            user_id: String(c.user_id || ''),
            is_hidden: Boolean(c.is_hidden),
            commenter_name: users?.full_name || 'Anonymous User',
            commenter_email: users?.email,
          };
        });
      const photosWithInfo: DishPhoto[] = ((d.dish_photos as unknown[]) || [])
        .map((photo: unknown): DishPhoto | null => {
          const p = photo as Record<string, unknown>;
          const { data: urlData } = supabase.storage.from('dish-photos').getPublicUrl(String(p.storage_path || ''));
          if (!p.user_id || !p.created_at || !p.id) return null;
          const users = p.users as { full_name?: string; email?: string } | undefined;
          return {
            id: String(p.id),
            dish_id: String(p.dish_id ?? d.id),
            user_id: String(p.user_id),
            storage_path: String(p.storage_path || ''),
            caption: p.caption ? String(p.caption) : null,
            width: p.width ? Number(p.width) : null,
            height: p.height ? Number(p.height) : null,
            created_at: String(p.created_at),
            updated_at: String(p.updated_at ?? p.created_at),
            photographer_name: users?.full_name || 'Anonymous User',
            photographer_email: users?.email,
            url: urlData?.publicUrl,
          };
        }).filter((p): p is DishPhoto => p !== null);
      const result: DishSearchResultWithRestaurant = {
        id: String(d.id || ''),
        restaurant_id: String(d.restaurant_id || ''),
        name: String(d.name || ''),
        description: d.description ? String(d.description) : null,
        category: d.category ? String(d.category) : null,
        is_active: Boolean(d.is_active ?? true),
        created_by: d.created_by ? String(d.created_by) : null,
        verified_by_restaurant: Boolean(d.verified_by_restaurant ?? false),
        created_at: String(d.created_at ?? new Date().toISOString()),
        updated_at: String(d.updated_at ?? new Date().toISOString()),
        comments: commentsWithUserInfo,
        ratings: ratings,
        photos: photosWithInfo,
        total_ratings: actualTotalRatings,
        average_rating: Math.round(actualAverageRating * 10) / 10,
        dateAdded: String(d.created_at ?? new Date().toISOString()),
        restaurant: (d.restaurants as { id: string; name: string; latitude?: number | null; longitude?: number | null }) || { id: '', name: '' }, // The joined restaurant data
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
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
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
        // Get the current session for authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('Authentication required to load restaurant menu.');
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/get-menu-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ restaurantId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        // Sanitize data from the edge function to ensure it matches client-side types
        const dishesWithDetails = (data || []).map((dish: RawDishData) => ({
            ...dish,
            ratings: dish.ratings || [],
            comments: dish.comments || [],
            photos: dish.photos || [],
        }));
        setDishes(sortDishesArray(dishesWithDetails, sortBy, currentUserId));
      } catch (err: unknown) {
        console.error('Error fetching menu data:', err);
        setError(`Failed to load menu: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDishes();
  }, [restaurantId, sortBy, currentUserId]);
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
        const dishWithRelations = {
          ...dishData,
          description: dishData.description ?? undefined,
          dish_ratings: tempRating ? [tempRating] : [],
          dish_comments: [],
          dish_photos: []
        };
        const newDish: DishWithDetails = {
          ...(processDishesForMenu([dishWithRelations])[0]),
          ratings: tempRating ? [tempRating] : [],
          total_ratings: tempRating ? 1 : 0,
          average_rating: tempRating ? rating : 0,
        };
        setDishes(prev => sortDishesArray([...prev, newDish], sortBy, currentUserId));
        return newDish;
      }
    } catch (err: unknown) {
      console.error('Error adding dish:', err);
      setError(`Failed to add dish: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
    return null;
  };
  const deleteDish = async (dishId: string) => {
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to delete dishes');
        return false;
      }

      // Use secure server-side admin operation
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          operation: 'deleteDish',
          dishId: dishId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete dish');
      }

      setDishes(prev => prev.filter(d => d.id !== dishId));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting dish:', err);
      setError(`Failed to delete dish: ${err instanceof Error ? err.message : String(err)}`);
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
    } catch (err: unknown) {
        console.error('Error updating dish name:', err);
        setError(`Failed to update dish name: ${err instanceof Error ? err.message : String(err)}`);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    setIsSubmittingComment(true);

    // Sanitize comment text to prevent XSS attacks
    const sanitizedCommentText = DOMPurify.sanitize(commentText.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const timestamp = new Date().toISOString();

    // Create optimistic comment
    const optimisticComment: DishComment = {
      id: tempId,
      dish_id: dishId,
      user_id: user.id,
      comment_text: sanitizedCommentText,
      created_at: timestamp,
      updated_at: timestamp,
      is_hidden: false,
      commenter_name: user.user_metadata?.full_name || 'You',
      commenter_email: user.email || ''
    };

    // Optimistically add comment to UI
    setDishes(prevDishes => {
      return prevDishes.map(dish => {
        if (dish.id === dishId) {
          return {
            ...dish,
            comments: [...dish.comments, optimisticComment]
          };
        }
        return dish;
      });
    });

    try {
      // Make API call
      const { data, error } = await supabase
        .from('dish_comments')
        .insert({
          dish_id: dishId,
          user_id: user.id,
          comment_text: sanitizedCommentText
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

      const actualComment: DishComment = {
        ...data,
        commenter_name: data.users?.full_name || 'Unknown User',
        commenter_email: data.users?.email || ''
      };

      // Replace optimistic comment with actual comment
      setDishes(prevDishes => {
        return prevDishes.map(dish => {
          if (dish.id === dishId) {
            return {
              ...dish,
              comments: dish.comments.map(comment => 
                comment.id === tempId ? actualComment : comment
              )
            };
          }
          return dish;
        });
      });
    } catch (err) {
      // Rollback optimistic update on failure
      setDishes(prevDishes => {
        return prevDishes.map(dish => {
          if (dish.id === dishId) {
            return {
              ...dish,
              comments: dish.comments.filter(comment => comment.id !== tempId)
            };
          }
          return dish;
        });
      });
      throw err instanceof Error ? err : new Error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  const deleteComment = async (commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const allComments = dishes.flatMap(dish => dish.comments);
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.user_id !== user.id) {
      throw new Error('You can only delete your own comments');
    }

    setIsSubmittingComment(true);

    // Store original comment for rollback
    const originalComment = { ...comment };
    let dishIdForComment = '';

    // Optimistically remove the comment
    setDishes(prevDishes => {
      return prevDishes.map(dish => {
        const hasComment = dish.comments.some(c => c.id === commentId);
        if (hasComment) {
          dishIdForComment = dish.id;
          return {
            ...dish,
            comments: dish.comments.filter(c => c.id !== commentId)
          };
        }
        return dish;
      });
    });

    try {
      // Make API call
      const { error } = await supabase
        .from('dish_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (err) {
      // Rollback optimistic update on failure
      setDishes(prevDishes => {
        return prevDishes.map(dish => {
          if (dish.id === dishIdForComment) {
            return {
              ...dish,
              comments: [...dish.comments, originalComment].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            };
          }
          return dish;
        });
      });
      throw err instanceof Error ? err : new Error('Failed to delete comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  const updateComment = async (commentId: string, commentText: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const allComments = dishes.flatMap(dish => dish.comments);
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.user_id !== user.id) {
      throw new Error('You can only edit your own comments');
    }

    // Sanitize comment text to prevent XSS attacks
    const sanitizedCommentText = DOMPurify.sanitize(commentText.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

    setIsSubmittingComment(true);

    // Store original comment text for rollback
    const originalText = comment.comment_text;
    const timestamp = new Date().toISOString();

    // Optimistically update the comment
    setDishes(prevDishes => {
      return prevDishes.map(dish => ({
        ...dish,
        comments: dish.comments.map(c =>
          c.id === commentId ? { ...c, comment_text: sanitizedCommentText, updated_at: timestamp } : c
        )
      }));
    });

    try {
      // Make API call
      const { error } = await supabase
        .from('dish_comments')
        .update({ comment_text: sanitizedCommentText, updated_at: timestamp })
        .eq('id', commentId);

      if (error) throw error;
    } catch (err) {
      // Rollback optimistic update on failure
      setDishes(prevDishes => {
        return prevDishes.map(dish => ({
          ...dish,
          comments: dish.comments.map(c =>
            c.id === commentId ? { ...c, comment_text: originalText, updated_at: comment.updated_at } : c
          )
        }));
      });
      throw err instanceof Error ? err : new Error('Failed to update comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  const addPhoto = async (dishId: string, file: File, caption?: string) => {
    // Sanitize caption to prevent XSS attacks
    const sanitizedCaption = caption ? DOMPurify.sanitize(caption.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : undefined;
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
          caption: sanitizedCaption || null,
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

  const updatePhotoCaption = async (photoId: string, caption: string) => {
    // Sanitize caption to prevent XSS attacks
    const sanitizedCaption = DOMPurify.sanitize(caption.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const allPhotos = dishes.flatMap(dish => dish.photos);
      const photo = allPhotos.find(p => p.id === photoId);
      if (!photo) throw new Error('Photo not found');

      if (photo.user_id !== user.id) {
        throw new Error('You can only edit your own photo captions');
      }

      const { data: updatedData, error } = await supabase
        .from('dish_photos')
        .update({ caption: sanitizedCaption, updated_at: new Date().toISOString() })
        .eq('id', photoId)
        .select();

      if (error) {
        console.error("Error updating photo caption:", error);
        throw new Error(`Failed to update caption: ${error.message}`);
      }

      if (!updatedData || updatedData.length === 0) {
        console.error("No data returned after update, likely a RLS policy issue.");
        throw new Error("You may not have permission to edit this photo, or the photo does not exist.");
      }

      setDishes(prevDishes => {
        return prevDishes.map(dish => ({
          ...dish,
          photos: dish.photos.map(p =>
            p.id === photoId ? { ...p, caption: sanitizedCaption, updated_at: new Date().toISOString() } : p
          )
        }));
      });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update photo caption');
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
    updatePhotoCaption,
    refetch,
    searchDishes,
    findSimilarDishesForDuplicate,
    currentUserId,
    isSubmittingComment
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
  minRating?: number,
  userLocation?: { latitude: number; longitude: number },
  maxDistance?: number
): Promise<DishSearchResultWithRestaurant[]> => {
  try {
    console.time('edge-function-dish-search');
    
    // Get the current session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Authentication required to search dishes.');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/dish-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        searchTerm: searchTerm?.trim(),
        minRating: minRating,
        userLocation: userLocation,
        maxDistance: maxDistance
      }),
    });




    console.timeEnd('edge-function-dish-search');




    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }




    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = await response.json();


    // --- THE FIX: Client-side data sanitization ---
    // This is a safety net to ensure that the data shape from the edge function
    // is always what the client components expect, preventing crashes.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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