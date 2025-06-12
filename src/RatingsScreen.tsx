// src/screens/RatingsScreen.tsx
import React, { useEffect, useState } from 'react';
import DishCard from './components/DishCard';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType, NavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants';
import type { DishRating, DishWithDetails } from './hooks/useDishes';
import { supabase } from './supabaseClient';

interface RatingsScreenProps {
  onNavigateToScreen: (screen: NavigableScreenType) => void;
  currentAppScreen: AppScreenType;
}

interface UserRatingWithDish extends DishRating {
  dish: DishWithDetails;
  restaurant: {
    id: string;
    name: string;
  };
}

interface RestaurantGroup {
  restaurant: {
    id: string;
    name: string;
  };
  dishes: DishWithDetails[];
}

const RatingsScreen: React.FC<RatingsScreenProps> = ({ onNavigateToScreen, currentAppScreen }) => {
  const [userRatings, setUserRatings] = useState<UserRatingWithDish[]>([]);
  const [restaurantGroups, setRestaurantGroups] = useState<RestaurantGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<RestaurantGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserRatings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('You must be logged in to view your ratings');
          setIsLoading(false);
          return;
        }

        // Fetch all user ratings with complete dish and restaurant data
        const { data, error: fetchError } = await supabase
          .from('dish_ratings')
          .select(`
            id,
            rating,
            notes,
            date_tried,
            created_at,
            updated_at,
            dish_id,
            user_id,
            restaurant_dishes!dish_ratings_dish_id_fkey (
              id,
              name,
              description,
              category,
              is_active,
              created_by,
              verified_by_restaurant,
              total_ratings,
              average_rating,
              created_at,
              updated_at,
              restaurant_id,
              restaurants!restaurant_dishes_restaurant_id_fkey (
                id,
                name,
                address,
                phone,
                website_url,
                category
              ),
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
                  full_name
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Transform and group the data
        const ratingsWithDishes: UserRatingWithDish[] = (data || []).map((rating: any) => {
          const dish = rating.restaurant_dishes;
          if (!dish) return null;

          // Process comments to include user information
          const commentsWithUserInfo = (dish.dish_comments || []).map((comment: any) => ({
            id: comment.id,
            dish_id: comment.dish_id || dish.id,
            comment_text: comment.comment_text,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user_id: comment.user_id,
            commenter_name: comment.users?.full_name || 'Anonymous User',
            commenter_email: comment.users?.email
          }));

          // Process photos to include user information and generate URLs
          const photosWithUrls = (dish.dish_photos || []).map((photo: any) => {
            const { data } = supabase.storage
              .from('dish-photos')
              .getPublicUrl(photo.storage_path);
            
            return {
              id: photo.id,
              dish_id: photo.dish_id,
              user_id: photo.user_id,
              url: data?.publicUrl,
              storage_path: photo.storage_path,
              caption: photo.caption,
              width: photo.width,
              height: photo.height,
              created_at: photo.created_at,
              updated_at: photo.updated_at,
              photographer_name: photo.users?.full_name || 'Anonymous'
            };
          });

          const dishWithDetails: DishWithDetails = {
            ...dish,
            dish_comments: commentsWithUserInfo,
            dish_ratings: dish.dish_ratings || [],
            dish_photos: photosWithUrls,
            dateAdded: dish.created_at
          };

          return {
            ...rating,
            dish: dishWithDetails,
            restaurant: {
              id: dish.restaurants?.id || '',
              name: dish.restaurants?.name || 'Unknown Restaurant'
            }
          };
        }).filter(Boolean) as UserRatingWithDish[];

        setUserRatings(ratingsWithDishes);

        // Group by restaurant and alphabetize both restaurants and dishes
        // FIXED: Only include dishes that the user has actually rated
        const groupedByRestaurant = ratingsWithDishes.reduce((groups: { [key: string]: RestaurantGroup }, rating) => {
          const restaurantId = rating.restaurant.id;
          if (!groups[restaurantId]) {
            groups[restaurantId] = {
              restaurant: rating.restaurant,
              dishes: []
            };
          }
          
          // Only add the specific dish that this user has rated
          if (!groups[restaurantId].dishes.find(d => d.id === rating.dish.id)) {
            groups[restaurantId].dishes.push(rating.dish);
          }
          
          return groups;
        }, {});

        // Sort restaurants alphabetically and dishes within each restaurant alphabetically
        const groupsArray = Object.values(groupedByRestaurant)
          .map(group => ({
            ...group,
            dishes: group.dishes.sort((a, b) => a.name.localeCompare(b.name))
          }))
          .sort((a, b) => a.restaurant.name.localeCompare(b.restaurant.name));

        setRestaurantGroups(groupsArray);
        setFilteredGroups(groupsArray);
      } catch (err: any) {
        console.error('Error fetching user ratings:', err);
        setError(`Failed to load your ratings: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRatings();
  }, []);

  // Search functionality
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredGroups(restaurantGroups);
      return;
    }

    const searchTerm = term.toLowerCase().trim();
    
    const filteredGroups = restaurantGroups.map(group => {
      // Check if restaurant name matches
      const restaurantMatches = group.restaurant.name.toLowerCase().includes(searchTerm);
      
      // Filter dishes that match the search term
      const matchingDishes = group.dishes.filter(dish => {
        const dishNameMatches = dish.name.toLowerCase().includes(searchTerm);
        return dishNameMatches;
      });
      
      // Include the group if restaurant matches OR if it has matching dishes
      if (restaurantMatches || matchingDishes.length > 0) {
        return {
          ...group,
          dishes: restaurantMatches ? group.dishes : matchingDishes
        };
      }
      
      return null;
    }).filter(Boolean) as RestaurantGroup[];

    setFilteredGroups(filteredGroups);
  };

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, restaurantGroups]);

  // Dish management functions for DishCard integration
  const handleDeleteDish = async (dishId: string) => {
    // In ratings view, we don't actually delete the dish, just remove the user's rating
    try {
      const { error } = await supabase
        .from('dish_ratings')
        .delete()
        .eq('dish_id', dishId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      // Remove from local state
      setUserRatings(prev => prev.filter(rating => rating.dish.id !== dishId));
      
      // Update grouped data
      const updatedGroups = restaurantGroups.map(group => ({
        ...group,
        dishes: group.dishes.filter(dish => dish.id !== dishId)
      })).filter(group => group.dishes.length > 0);
      
      setRestaurantGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
    } catch (err: any) {
      console.error('Error removing rating:', err);
      setError(`Failed to remove rating: ${err.message}`);
    }
  };

  const handleUpdateRating = async (dishId: string, newRating: number) => {
    try {
      // Handle clearing rating (rating = 0)
      if (newRating === 0) {
        await handleDeleteDish(dishId);
        return;
      }

      const { error } = await supabase
        .from('dish_ratings')
        .update({
          rating: newRating,
          updated_at: new Date().toISOString()
        })
        .eq('dish_id', dishId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      // Update local state
      setUserRatings(prev => prev.map(rating =>
        rating.dish.id === dishId
          ? { ...rating, rating: newRating }
          : rating
      ));

      // Update the dish ratings in the groups
      const updateGroups = (groups: RestaurantGroup[]) =>
        groups.map(group => ({
          ...group,
          dishes: group.dishes.map(dish => {
            if (dish.id === dishId) {
              const updatedRatings = dish.dish_ratings.map(r =>
                r.user_id === currentUserId
                  ? { ...r, rating: newRating, updated_at: new Date().toISOString() }
                  : r
              );
              
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
          })
        }));

      setRestaurantGroups(updateGroups);
      setFilteredGroups(prev => updateGroups(prev));
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError(`Failed to update rating: ${err.message}`);
    }
  };

  const handleUpdateDishName = async (dishId: string, newName: string): Promise<boolean> => {
    if (!newName.trim()) return false;
    
    try {
      const { error } = await supabase
        .from('restaurant_dishes')
        .update({ 
          name: newName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', dishId);

      if (error) throw error;

      // Update local state
      const updateGroups = (groups: RestaurantGroup[]) =>
        groups.map(group => ({
          ...group,
          dishes: group.dishes.map(dish =>
            dish.id === dishId
              ? { ...dish, name: newName.trim(), updated_at: new Date().toISOString() }
              : dish
          )
        }));

      setRestaurantGroups(updateGroups);
      setFilteredGroups(prev => updateGroups(prev));
      
      return true;
    } catch (err: any) {
      console.error('Error updating dish name:', err);
      setError(`Failed to update dish name: ${err.message}`);
      return false;
    }
  };

  const handleAddComment = async (dishId: string, commentText: string) => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const { data: newComment, error } = await supabase
        .from('dish_comments')
        .insert([{
          dish_id: dishId,
          user_id: currentUserId,
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
        const commentWithUserInfo = {
          id: newComment.id,
          dish_id: newComment.dish_id,
          comment_text: newComment.comment_text,
          created_at: newComment.created_at,
          updated_at: newComment.updated_at,
          user_id: newComment.user_id,
          commenter_name: (newComment.users as any)?.full_name || 'Anonymous User',
          commenter_email: (newComment.users as any)?.email
        };

        const updateGroups = (groups: RestaurantGroup[]) =>
          groups.map(group => ({
            ...group,
            dishes: group.dishes.map(dish =>
              dish.id === dishId
                ? { ...dish, dish_comments: [...dish.dish_comments, commentWithUserInfo] }
                : dish
            )
          }));

        setRestaurantGroups(updateGroups);
        setFilteredGroups(prev => updateGroups(prev));
      }
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(`Failed to add comment: ${err.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string, dishId: string, newText: string) => {
    if (!newText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const { error } = await supabase
        .from('dish_comments')
        .update({
          comment_text: newText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      const updateGroups = (groups: RestaurantGroup[]) =>
        groups.map(group => ({
          ...group,
          dishes: group.dishes.map(dish =>
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
          )
        }));

      setRestaurantGroups(updateGroups);
      setFilteredGroups(prev => updateGroups(prev));
    } catch (err: any) {
      console.error('Error updating comment:', err);
      setError(`Failed to update comment: ${err.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (dishId: string, commentId: string) => {
    setIsSubmittingComment(true);

    try {
      const { error } = await supabase
        .from('dish_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      const updateGroups = (groups: RestaurantGroup[]) =>
        groups.map(group => ({
          ...group,
          dishes: group.dishes.map(dish =>
            dish.id === dishId
              ? {
                  ...dish,
                  dish_comments: dish.dish_comments.filter(comment => comment.id !== commentId)
                }
              : dish
          )
        }));

      setRestaurantGroups(updateGroups);
      setFilteredGroups(prev => updateGroups(prev));
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(`Failed to delete comment: ${err.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Photo management functions
  const handleAddPhoto = async (dishId: string, file: File, caption?: string) => {
    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${currentUserId}/${dishId}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('dish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dish-photos')
        .getPublicUrl(filePath);

      // Get image dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Save metadata to database
      const { data: newPhoto, error: dbError } = await supabase
        .from('dish_photos')
        .insert([{
          dish_id: dishId,
          user_id: currentUserId,
          storage_path: filePath,
          caption: caption,
          width: img.width,
          height: img.height
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
            full_name
          )
        `)
        .single();

      if (dbError) throw dbError;

      if (newPhoto) {
        const photoWithUrl = {
          ...newPhoto,
          url: publicUrl,
          photographer_name: (newPhoto.users as any)?.full_name || 'Anonymous'
        };

        const updateGroups = (groups: RestaurantGroup[]) =>
          groups.map(group => ({
            ...group,
            dishes: group.dishes.map(dish =>
              dish.id === dishId
                ? { ...dish, dish_photos: [...(dish.dish_photos || []), photoWithUrl] }
                : dish
            )
          }));

        setRestaurantGroups(updateGroups);
        setFilteredGroups(prev => updateGroups(prev));
      }
    } catch (err: any) {
      console.error('Error adding photo:', err);
      setError(`Failed to add photo: ${err.message}`);
    }
  };

  const handleDeletePhoto = async (dishId: string, photoId: string) => {
    try {
      // Get the photo details first
      const { data: photo, error: fetchError } = await supabase
        .from('dish_photos')
        .select('storage_path')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;

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
      const updateGroups = (groups: RestaurantGroup[]) =>
        groups.map(group => ({
          ...group,
          dishes: group.dishes.map(dish =>
            dish.id === dishId
              ? {
                  ...dish,
                  dish_photos: (dish.dish_photos || []).filter(p => p.id !== photoId)
                }
              : dish
          )
        }));

      setRestaurantGroups(updateGroups);
      setFilteredGroups(prev => updateGroups(prev));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      setError(`Failed to delete photo: ${err.message}`);
    }
  };

  if (isLoading) return <LoadingScreen />;

  const totalRatedDishes = userRatings?.length || 0;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: COLORS.background }}>
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl flex-1 tracking-wide" style={{
            ...FONTS.elegant,
            color: COLORS.text,
            fontWeight: '600'
          }}>
            My Ratings
          </h1>
          
          {/* Search Icon - Updated to match trash icon styling */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full transition-all focus:outline-none"
            style={{
              ...STYLES.iconButton,
              backgroundColor: showSearch ? COLORS.primary : COLORS.iconBackground,
              color: showSearch ? COLORS.textWhite : COLORS.iconPrimary,
              boxShadow: showSearch ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
        
        {/* Search Bar - Updated to match RestaurantScreen format */}
        {showSearch && (
          <div className="px-4 pb-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <input
                type="text"
                placeholder="Search restaurants and dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full outline-none focus:ring-2 focus:ring-white/50"
                style={{
                  ...FONTS.elegant,
                  padding: '12px 16px',
                  borderRadius: STYLES.borderRadiusMedium,
                  fontSize: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: COLORS.textDark,
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                  border: `1px solid ${COLORS.text}`,
                }}
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-4">
          {error && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{ color: COLORS.danger, ...FONTS.elegant }}>{error}</p>
            </div>
          )}

          {totalRatedDishes > 0 ? (
            <>
              <div className="text-center mb-6">
                <p style={{
                  ...FONTS.elegant,
                  color: COLORS.text,
                  opacity: 0.8,
                  fontSize: '0.9rem'
                }}>
                  {searchTerm ? `Search results` : `You've rated ${totalRatedDishes} dish${totalRatedDishes !== 1 ? 'es' : ''}`}
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
              
              <div className="space-y-6">
                {filteredGroups.map((group, groupIndex) => (
                  <div key={group.restaurant.id}>
                    {/* Restaurant Subheading - Made bigger */}
                    <div className="mb-4">
                      <h2 style={{
                        ...FONTS.elegant,
                        fontSize: '1.6rem', // Increased from 1.3rem
                        fontWeight: '600',
                        color: COLORS.text,
                        margin: '0 0 4px 0'
                      }}>
                        {group.restaurant.name}
                      </h2>
                      <p style={{
                        ...FONTS.elegant,
                        fontSize: '0.8rem',
                        color: COLORS.text,
                        opacity: 0.6,
                        margin: 0
                      }}>
                        {group.dishes?.length || 0} dish{(group.dishes?.length || 0) !== 1 ? 'es' : ''} rated
                      </p>
                    </div>

                    {/* Dishes with subtle grey separators */}
                    <div className="space-y-4 mb-6">
                      {group.dishes.map((dish, dishIndex) => (
                        <div key={dish.id}>
                          <DishCard
                            dish={dish}
                            currentUserId={currentUserId}
                            onDelete={handleDeleteDish}
                            onUpdateRating={handleUpdateRating}
                            onUpdateDishName={handleUpdateDishName}
                            onAddComment={handleAddComment}
                            onUpdateComment={handleUpdateComment}
                            onDeleteComment={handleDeleteComment}
                            onAddPhoto={handleAddPhoto}
                            onDeletePhoto={handleDeletePhoto}
                            isSubmittingComment={isSubmittingComment}
                            isExpanded={expandedDishId === dish.id}
                            onToggleExpand={() => setExpandedDishId(expandedDishId === dish.id ? null : dish.id)}
                          />
                          {/* Subtle grey line between dishes (except for last dish) */}
                          {dishIndex < group.dishes.length - 1 && (
                            <div
                              className="mx-4 mt-4"
                              style={{
                                height: '1px',
                                background: `linear-gradient(to right, transparent, ${COLORS.text}20, transparent)`
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Thicker white line separator between restaurants (except for last group) */}
                    {groupIndex < filteredGroups.length - 1 && (
                      <hr style={{
                        border: 'none',
                        height: '2px', // Thicker than dish separators
                        backgroundColor: 'rgba(255, 255, 255, 0.4)', // More opaque white
                        margin: '0 0 24px 0'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <p style={{
                ...FONTS.elegant,
                color: COLORS.text,
                fontSize: '18px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                {searchTerm ? 'No results found' : 'No ratings yet'}
              </p>
              <p style={{
                ...FONTS.elegant,
                color: COLORS.text,
                opacity: 0.7,
                marginBottom: '16px'
              }}>
                {searchTerm
                  ? `No dishes or restaurants match "${searchTerm}"`
                  : 'Start rating dishes to see them here!'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => onNavigateToScreen('restaurants')}
                  style={{
                    ...FONTS.elegant,
                    backgroundColor: COLORS.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Find Restaurants
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
    </div>
  );
};

export default RatingsScreen;