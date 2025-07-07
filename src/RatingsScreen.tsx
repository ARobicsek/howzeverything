// src/RatingsScreen.tsx - MODIFIED in its entirety for React Router
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from './components/DishCard';
import LoadingScreen from './components/LoadingScreen';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import type { DishPhoto, DishRating, DishWithDetails } from './hooks/useDishes';
import { supabase } from './supabaseClient';


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


const RatingsScreen: React.FC = () => {
  const navigate = useNavigate();
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
  const [isFocused, setIsFocused] = useState(false);
  const [expandedRestaurantIds, setExpandedRestaurantIds] = useState<string[]>([]);


  const toggleRestaurantExpansion = (restaurantId: string) => {
    setExpandedRestaurantIds(prev =>
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };


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
        const { data, error: fetchError } = await supabase
          .from('dish_ratings')
          .select(`id, rating, notes, date_tried, created_at, updated_at, dish_id, user_id,
            restaurant_dishes!dish_ratings_dish_id_fkey (
              id, name, description, category, is_active, created_by, verified_by_restaurant,
              total_ratings, average_rating, created_at, updated_at, restaurant_id,
              restaurants!restaurant_dishes_restaurant_id_fkey (id, name, address, phone, website_url, category),
              dish_comments (id, dish_id, comment_text, created_at, updated_at, user_id, users (full_name, email)),
              dish_ratings (id, user_id, rating, notes, date_tried, created_at, updated_at, dish_id),
              dish_photos (id, dish_id, user_id, storage_path, caption, width, height, created_at, updated_at, users (full_name))
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });


        if (fetchError) throw fetchError;
       
        const ratingsWithDishes: UserRatingWithDish[] = (data || []).map((rating: any) => {
          const dish = rating.restaurant_dishes;
          if (!dish) return null;
         
          const commentsWithUserInfo = (dish.dish_comments || []).map((comment: any) => ({
            id: comment.id, dish_id: comment.dish_id || dish.id, comment_text: comment.comment_text, created_at: comment.created_at, updated_at: comment.updated_at, user_id: comment.user_id,
            commenter_name: comment.users?.full_name || 'Anonymous User', commenter_email: comment.users?.email
          }));
         
          const photosWithUrls: DishPhoto[] = (dish.dish_photos || []).map((photo: any) => {
              if (!photo.id || !photo.user_id || !photo.created_at) return null;
              const { data: urlData } = supabase.storage.from('dish-photos').getPublicUrl(photo.storage_path);
              return {
                id: photo.id, dish_id: photo.dish_id ?? dish.id, user_id: photo.user_id, url: urlData?.publicUrl, storage_path: photo.storage_path, caption: photo.caption, width: photo.width, height: photo.height,
                created_at: photo.created_at, updated_at: photo.updated_at ?? photo.created_at, photographer_name: photo.users?.full_name || 'Anonymous',
              } as DishPhoto;
            }).filter((p: DishPhoto | null): p is DishPhoto => p !== null);


          const dishWithDetails: DishWithDetails = { ...dish, dish_comments: commentsWithUserInfo, dish_ratings: dish.dish_ratings || [], dish_photos: photosWithUrls, dateAdded: dish.created_at ?? new Date().toISOString() };
         
          return { ...rating, dish: dishWithDetails, restaurant: { id: dish.restaurants?.id || '', name: dish.restaurants?.name || 'Unknown Restaurant' } };
        }).filter(Boolean) as UserRatingWithDish[];


        setUserRatings(ratingsWithDishes);
       
        const groupedByRestaurant = ratingsWithDishes.reduce((groups: { [key: string]: RestaurantGroup }, rating) => {
          const restaurantId = rating.restaurant.id;
          if (!groups[restaurantId]) { groups[restaurantId] = { restaurant: rating.restaurant, dishes: [] }; }
          if (!groups[restaurantId].dishes.find(d => d.id === rating.dish.id)) { groups[restaurantId].dishes.push(rating.dish); }
          return groups;
        }, {});
       
        const groupsArray = Object.values(groupedByRestaurant)
          .map(group => ({ ...group, dishes: group.dishes.sort((a, b) => a.name.localeCompare(b.name)) }))
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


  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setFilteredGroups(restaurantGroups);
      return;
    }
    const searchTermLower = term.toLowerCase().trim();
    const filtered = restaurantGroups.map(group => {
      const restaurantMatches = group.restaurant.name.toLowerCase().includes(searchTermLower);
      const matchingDishes = group.dishes.filter(dish => dish.name.toLowerCase().includes(searchTermLower));
      if (restaurantMatches || matchingDishes.length > 0) {
        return { ...group, dishes: group.dishes.filter(dish => dish.name.toLowerCase().includes(searchTermLower) || restaurantMatches) };
      }
      return null;
    }).filter(Boolean) as RestaurantGroup[];
    setFilteredGroups(filtered);
  }, [restaurantGroups]);


  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);


  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
    setFilteredGroups(restaurantGroups);
  }, [restaurantGroups]);


  const handleDeleteDish = async (dishId: string) => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase.from('dish_ratings').delete().eq('dish_id', dishId).eq('user_id', currentUserId);
      if (error) throw error;
      setUserRatings(prev => prev.filter(rating => rating.dish.id !== dishId));
      const updatedGroups = restaurantGroups.map(group => ({ ...group, dishes: group.dishes.filter(dish => dish.id !== dishId) })).filter(group => group.dishes.length > 0);
      setRestaurantGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
    } catch (err: any) {
      console.error('Error removing rating:', err);
      setError(`Failed to remove rating: ${err.message}`);
    }
  };


  const handleUpdateRating = async (dishId: string, newRating: number) => {
    if (!currentUserId) return;
    try {
      if (newRating === 0) { await handleDeleteDish(dishId); return; }
      const { error } = await supabase.from('dish_ratings').update({ rating: newRating, updated_at: new Date().toISOString() }).eq('dish_id', dishId).eq('user_id', currentUserId);
      if (error) throw error;
      setUserRatings(prev => prev.map(rating => rating.dish.id === dishId ? { ...rating, rating: newRating } : rating));
      const updateGroups = (groups: RestaurantGroup[]) => groups.map(group => ({
        ...group,
        dishes: group.dishes.map(dish => {
          if (dish.id === dishId) {
            const updatedRatings = dish.dish_ratings.map(r => r.user_id === currentUserId ? { ...r, rating: newRating, updated_at: new Date().toISOString() } : r);
            const totalRatings = updatedRatings.length;
            const averageRating = totalRatings > 0 ? updatedRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;
            return { ...dish, dish_ratings: updatedRatings, total_ratings: totalRatings, average_rating: Math.round(averageRating * 10) / 10 };
          }
          return dish;
        })
      }));
      setRestaurantGroups(updateGroups(restaurantGroups));
      setFilteredGroups(prev => updateGroups(prev));
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError(`Failed to update rating: ${err.message}`);
    }
  };


  const handleUpdateDishName = async (dishId: string, newName: string): Promise<boolean> => {
    if (!newName.trim()) return false;
    try {
      const { error } = await supabase.from('restaurant_dishes').update({ name: newName.trim(), updated_at: new Date().toISOString() }).eq('id', dishId);
      if (error) throw error;
      const updateGroups = (groups: RestaurantGroup[]) => groups.map(group => ({ ...group, dishes: group.dishes.map(dish => dish.id === dishId ? { ...dish, name: newName.trim(), updated_at: new Date().toISOString() } : dish) }));
      setRestaurantGroups(updateGroups(restaurantGroups));
      setFilteredGroups(prev => updateGroups(prev));
      return true;
    } catch (err: any) {
      console.error('Error updating dish name:', err);
      setError(`Failed to update dish name: ${err.message}`);
      return false;
    }
  };


  const handleAddComment = async (dishId: string, commentText: string) => {
    if (!commentText.trim() || !currentUserId) return;
    setIsSubmittingComment(true);
    try {
      const { data: newComment, error } = await supabase.from('dish_comments').insert([{ dish_id: dishId, user_id: currentUserId, comment_text: commentText.trim() }]).select(`*, users (full_name, email)`).single();
      if (error) throw error;
      if (newComment) {
        const commentWithUserInfo = { id: newComment.id, dish_id: newComment.dish_id, comment_text: newComment.comment_text, created_at: newComment.created_at, updated_at: newComment.updated_at, user_id: newComment.user_id, commenter_name: (newComment.users as any)?.full_name || 'Anonymous User', commenter_email: (newComment.users as any)?.email };
        const updateGroups = (groups: RestaurantGroup[]) => groups.map(group => ({ ...group, dishes: group.dishes.map(dish => dish.id === dishId ? { ...dish, dish_comments: [...dish.dish_comments, commentWithUserInfo] } : dish) }));
        setRestaurantGroups(updateGroups(restaurantGroups));
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
      const { error } = await supabase.from('dish_comments').update({ comment_text: newText.trim(), updated_at: new Date().toISOString() }).eq('id', commentId);
      if (error) throw error;
      const updateGroups = (groups: RestaurantGroup[]) => groups.map(group => ({ ...group, dishes: group.dishes.map(dish => dish.id === dishId ? { ...dish, dish_comments: dish.dish_comments.map(comment => comment.id === commentId ? { ...comment, comment_text: newText.trim(), updated_at: new Date().toISOString() } : comment) } : dish) }));
      setRestaurantGroups(updateGroups(restaurantGroups));
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
      const { error } = await supabase.from('dish_comments').delete().eq('id', commentId);
      if (error) throw error;
      const updateGroups = (groups: RestaurantGroup[]) => groups.map(group => ({ ...group, dishes: group.dishes.map(dish => dish.id === dishId ? { ...dish, dish_comments: dish.dish_comments.filter(comment => comment.id !== commentId) } : dish) }));
      setRestaurantGroups(updateGroups(restaurantGroups));
      setFilteredGroups(prev => updateGroups(prev));
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(`Failed to delete comment: ${err.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };


  const handleAddPhoto = async (dishId: string, file: File, caption?: string) => {
    if (!currentUserId) return;
    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${currentUserId}/${dishId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('dish-photos').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('dish-photos').getPublicUrl(filePath);
      const img = new Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = URL.createObjectURL(file); });
      const { data: newPhoto, error: dbError } = await supabase.from('dish_photos').insert([{ dish_id: dishId, user_id: currentUserId, storage_path: filePath, caption: caption, width: img.width, height: img.height }]).select(`*, users (full_name)`).single();
      if (dbError) throw dbError;
      if (newPhoto) {
        const photoWithUrl: DishPhoto = { id: newPhoto.id, dish_id: newPhoto.dish_id ?? dishId, user_id: newPhoto.user_id ?? currentUserId, storage_path: newPhoto.storage_path, caption: newPhoto.caption, width: newPhoto.width, height: newPhoto.height, created_at: newPhoto.created_at ?? new Date().toISOString(), updated_at: newPhoto.updated_at ?? new Date().toISOString(), photographer_name: (newPhoto.users as any)?.full_name || 'Anonymous', url: publicUrl, };
        const updateGroups = (groups: RestaurantGroup[]) => groups.map(group => ({ ...group, dishes: group.dishes.map(dish => dish.id === dishId ? { ...dish, dish_photos: [...(dish.dish_photos || []), photoWithUrl] } : dish) }));
        setRestaurantGroups(updateGroups(restaurantGroups));
        setFilteredGroups(prev => updateGroups(prev));
      }
    } catch (err: any) {
      console.error('Error adding photo:', err);
      setError(`Failed to add photo: ${err.message}`);
    }
  };


  const handleDeletePhoto = async (dishId: string, photoId: string) => {
    try {
      const { data: photo, error: fetchError } = await supabase.from('dish_photos').select('storage_path').eq('id', photoId).single();
      if (fetchError) throw fetchError;
      const { error: storageError } = await supabase.storage.from('dish-photos').remove([photo.storage_path]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase.from('dish_photos').delete().eq('id', photoId);
      if (dbError) throw dbError;
      const updateGroups = (groups: RestaurantGroup[]) => groups.map(group => ({ ...group, dishes: group.dishes.map(dish => dish.id === dishId ? { ...dish, dish_photos: (dish.dish_photos || []).filter(p => p.id !== photoId) } : dish) }));
      setRestaurantGroups(updateGroups(restaurantGroups));
      setFilteredGroups(prev => updateGroups(prev));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      setError(`Failed to delete photo: ${err.message}`);
    }
  };


  const handleShareDish = (dish: DishWithDetails, restaurantName: string) => {
    const shareUrl = `${window.location.origin}?shareType=dish&shareId=${dish.id}&restaurantId=${dish.restaurant_id}`;
    if (navigator.share) {
      navigator.share({ title: `${dish.name} at ${restaurantName}`, text: `Check out ${dish.name} at ${restaurantName} on How's Everything!`, url: shareUrl, }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => { alert('Share link copied to clipboard!'); }).catch(err => { console.error('Could not copy link to clipboard:', err); alert(`To share, copy this link: ${shareUrl}`); });
    }
  };


  if (isLoading) return <LoadingScreen />;


  const totalRatedDishes = userRatings?.length || 0;
  const hasSearchTerm = searchTerm.trim().length > 0;


  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: COLORS.background, paddingBottom: SPACING[8] }}>
      <main style={{ flex: 1, maxWidth: '768px', width: '100%', margin: '0 auto' }}>
        <div className="max-w-md mx-auto space-y-6" style={{ padding: `${SPACING[4]} ${SPACING.containerPadding}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ ...TYPOGRAPHY.h1, color: COLORS.text, margin: 0 }}>My Ratings</h1>
                <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`w-12 h-12 rounded-full hover:opacity-80 active:opacity-70 transition-all focus:outline-none flex items-center justify-center`}
                    style={{ ...STYLES.iconButton, backgroundColor: showSearch ? COLORS.accent : COLORS.iconBackground, color: showSearch ? COLORS.textWhite : COLORS.iconPrimary, boxShadow: showSearch ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'}}
                    aria-label="Toggle search"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </button>
            </div>


          {showSearch && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label style={{ ...FONTS.elegant, fontSize: '1.1rem', fontWeight: '600', color: COLORS.text }}>
                  Search for a restaurant or a dish
                </label>
                {hasSearchTerm && ( <button onClick={handleResetSearch} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.textSecondary, transition: 'color 0.2s ease, transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.danger; e.currentTarget.style.transform = 'scale(1.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }} aria-label="Clear search" title="Clear search"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg></button> )}
              </div>
              <input type="text" placeholder="e.g. Cafe Flora, Apple pie" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="w-full outline-none" style={{ ...STYLES.input, ...(isFocused && STYLES.inputFocusBlack) }} autoFocus />
              {hasSearchTerm && ( <div style={{ ...FONTS.elegant, fontSize: '14px', color: COLORS.text, opacity: 0.8, marginTop: '8px', marginBottom: 0 }}> {filteredGroups.length > 0 ? `Found ${filteredGroups.length} result${filteredGroups.length !== 1 ? 's' : ''}` : 'No matching ratings found'} </div> )}
            </div>
          )}


          {error && ( <div className="bg-red-500/20 p-3 rounded-lg text-center"><p style={{ color: COLORS.danger, ...FONTS.elegant }}>{error}</p></div> )}
          {totalRatedDishes > 0 ? (
            <>
              <div className="text-center mb-6"><p style={{ ...FONTS.elegant, color: COLORS.text, opacity: 0.8, fontSize: '0.9rem' }}>{searchTerm ? `Search results` : `You've rated ${totalRatedDishes} dish${totalRatedDishes !== 1 ? 'es' : ''}`}{hasSearchTerm && ` for "${searchTerm}"`}</p></div>
              <div className="space-y-6">
                {filteredGroups.map((group, groupIndex) => {
                  const isExpanded = hasSearchTerm || expandedRestaurantIds.includes(group.restaurant.id);
                  return (
                    <div key={group.restaurant.id}>
                      <div onClick={() => !hasSearchTerm && toggleRestaurantExpansion(group.restaurant.id)} className="mb-4" style={{ cursor: hasSearchTerm ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h2 style={{ ...FONTS.elegant, fontSize: '1.125rem', fontWeight: '600', color: COLORS.text, margin: 0 }}>{group.restaurant.name}</h2>
                          <p style={{ ...FONTS.elegant, fontSize: '0.8rem', color: COLORS.text, opacity: 0.6, margin: 0 }}>{group.dishes?.length || 0} dish{(group.dishes?.length || 0) !== 1 ? 'es' : ''} rated</p>
                        </div>
                        {!hasSearchTerm && ( <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: COLORS.text, opacity: 0.7, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease-out' }}><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg> )}
                      </div>
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2], marginBottom: '24px' }}>
                          {group.dishes.map((dish) => (
                            <div key={dish.id}>
                              <DishCard dish={dish} currentUserId={currentUserId} onDelete={handleDeleteDish} onUpdateRating={handleUpdateRating} onUpdateDishName={handleUpdateDishName} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onShare={(dishToShare) => handleShareDish(dishToShare, group.restaurant.name)} isSubmittingComment={isSubmittingComment} isExpanded={expandedDishId === dish.id} onToggleExpand={() => setExpandedDishId(expandedDishId === dish.id ? null : dish.id)} />
                            </div>
                          ))}
                        </div>
                      )}
                      {groupIndex < filteredGroups.length - 1 && ( <hr style={{ border: 'none', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.4)', margin: '0 0 24px 0' }} /> )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <p style={{ ...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>{hasSearchTerm ? 'No results found' : 'No ratings yet'}</p>
              <p style={{ ...FONTS.elegant, color: COLORS.text, opacity: 0.7, marginBottom: '16px' }}>{hasSearchTerm ? `No dishes or restaurants match "${searchTerm}"` : 'Start rating dishes to see them here!'}</p>
              {!hasSearchTerm && ( <button onClick={() => navigate('/restaurants')} style={{ ...STYLES.addButton }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryHover; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary; }}>Find Restaurants</button> )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};


export default RatingsScreen;