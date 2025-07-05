// src/utils/urlShareHandler.ts
import { supabase } from '../supabaseClient';




export interface SharedContent {
  type: 'restaurant' | 'dish';
  id: string;
  restaurantId?: string; // For dishes, we need the restaurant ID too
}




export const parseSharedUrl = (): SharedContent | null => {
  const urlParams = new URLSearchParams(window.location.search);
 
  // Primary method: Check for shareType and shareId parameters
  const shareType = urlParams.get('shareType');
  const shareId = urlParams.get('shareId');
  const restaurantId = urlParams.get('restaurantId');




  if (shareType && shareId) {
    console.log(`[Share] Parsed share content from URL params: type=${shareType}, id=${shareId}`);
    return {
      type: shareType as 'restaurant' | 'dish',
      id: shareId,
      restaurantId: restaurantId || undefined
    };
  }




  // Fallback: Check for path-based sharing (e.g., /shared/restaurant/...)
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/\/shared\/(restaurant|dish)\/([a-zA-Z0-9-]+)/);
  if (pathMatch) {
    const [, type, id] = pathMatch;
    console.log(`[Share] Parsed share content from URL path: type=${type}, id=${id}`);
    return {
      type: type as 'restaurant' | 'dish',
      id: id
    };
  }




  // Fallback for very old format ('?shared=...' and '?id=...')
  const legacySharedType = urlParams.get('shared');
  const legacySharedId = urlParams.get('id');
  if (legacySharedType && legacySharedId) {
    console.log(`[Share] Parsed legacy share content: type=${legacySharedType}, id=${legacySharedId}`);
    return {
      type: legacySharedType as 'restaurant' | 'dish',
      id: legacySharedId,
      restaurantId: urlParams.get('restaurantId') || undefined
    };
  }




  return null;
};




export const handleSharedContent = async (
  sharedContent: SharedContent,
  addToFavorites: (restaurant: any) => Promise<void>,
  navigateToMenu: (restaurantId: string, dishId?: string) => void,
  navigateToScreen: (screen: string) => void
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[Share] User not logged in, cannot process shared content yet.');
      return false;
    }




    if (sharedContent.type === 'restaurant') {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', sharedContent.id)
        .single();




      if (restaurantError || !restaurant) {
        console.error('[Share] Restaurant not found:', restaurantError);
        alert("Sorry, we couldn't find the shared restaurant.");
        return false;
      }




      const { data: existingFavorite } = await supabase
        .from('user_favorite_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurant.id)
        .single();




      if (!existingFavorite) {
        await addToFavorites(restaurant);
        console.log('[Share] Restaurant added to favorites from shared link.');
      }




      navigateToScreen('restaurants');
      setTimeout(() => {
        navigateToMenu(restaurant.id);
      }, 100);




      return true;




    } else if (sharedContent.type === 'dish') {
      console.log('[Share] Processing shared dish:', sharedContent.id);
      let restaurantId = sharedContent.restaurantId;




      // If restaurantId isn't in the URL, we must fetch the dish to find it.
      if (!restaurantId) {
        console.log('[Share] Restaurant ID not in URL, fetching dish from DB...');
        const { data: dishData, error: dishError } = await supabase
          .from('restaurant_dishes')
          .select('restaurant_id')
          .eq('id', sharedContent.id)
          .single();




        if (dishError || !dishData) {
          console.error('[Share] Could not find shared dish to determine restaurant:', dishError);
          alert("Sorry, we couldn't find the shared dish.");
          return false;
        }
        restaurantId = dishData.restaurant_id || undefined;
        console.log('[Share] Found restaurant ID from dish:', restaurantId);
      }
     
      if (!restaurantId) {
        alert("Sorry, the shared link is missing restaurant information.");
        return false;
      }




      // Now we have the restaurantId, fetch the restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();




      if (restaurantError || !restaurant) {
        console.error('[Share] Could not find the restaurant for the shared dish:', restaurantError);
        alert("Sorry, we couldn't find the restaurant for the shared dish.");
        return false;
      }




      // Check if the restaurant is already a favorite
      const { data: existingFavorite } = await supabase
        .from('user_favorite_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurant.id)
        .single();




      if (!existingFavorite) {
        await addToFavorites(restaurant);
        console.log('[Share] Added restaurant to favorites from shared dish link.');
      }
     
      // Navigate to the restaurant's menu, and pass the dishId to be expanded
      navigateToMenu(restaurant.id, sharedContent.id);




      return true;
    }




    return false;
  } catch (error) {
    console.error('[Share] Error handling shared content:', error);
    return false;
  }
};




export const clearSharedUrlParams = () => {
  const url = new URL(window.location.href);
  const paramsToDelete = ['shareType', 'shareId', 'restaurantId', 'shared', 'id'];
  let hasChanged = false;




  paramsToDelete.forEach(param => {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      hasChanged = true;
    }
  });




  if (url.pathname.includes('/shared/')) {
    const newPath = url.pathname.split('/shared/')[0] || '/';
    url.pathname = newPath;
    hasChanged = true;
  }




  if (hasChanged) {
    console.log('[Share] Clearing processed share params from URL.');
    window.history.replaceState({}, '', url.toString());
  }
};
