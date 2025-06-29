// src/utils/urlShareHandler.ts
import { supabase } from '../supabaseClient';

export interface SharedContent {
  type: 'restaurant' | 'dish';
  id: string;
  restaurantId?: string; // For dishes, we need the restaurant ID too
}

export const parseSharedUrl = (): SharedContent | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname;
  
  // Check for URL parameters (legacy support)
  const sharedType = urlParams.get('shared');
  const sharedId = urlParams.get('id');
  const restaurantId = urlParams.get('restaurantId');
  
  if (sharedType && sharedId) {
    return {
      type: sharedType as 'restaurant' | 'dish',
      id: sharedId,
      restaurantId: restaurantId || undefined
    };
  }

  // Check for path-based sharing (new format)
  const pathMatch = pathname.match(/\/shared\/(restaurant|dish)\/([a-zA-Z0-9-]+)/);
  if (pathMatch) {
    const [, type, id] = pathMatch;
    return {
      type: type as 'restaurant' | 'dish',
      id: id
    };
  }

  return null;
};

export const handleSharedContent = async (
  sharedContent: SharedContent,
  addToFavorites: (restaurant: any) => Promise<void>,
  navigateToMenu: (restaurantId: string) => void,
  navigateToScreen: (screen: string) => void
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // User not logged in - we could handle this differently if needed
      console.log('User not logged in for shared content');
      return false;
    }

    if (sharedContent.type === 'restaurant') {
      // Get restaurant details
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', sharedContent.id)
        .single();

      if (restaurantError || !restaurant) {
        console.error('Restaurant not found:', restaurantError);
        return false;
      }

      // Check if already in favorites
      const { data: existingFavorite } = await supabase
        .from('user_favorite_restaurants')
        .select('*')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurant.id)
        .single();

      // Add to favorites if not already there
      if (!existingFavorite) {
        await addToFavorites(restaurant);
        console.log('Restaurant added to favorites from shared link');
      }

      // Navigate to restaurant screen and then to the specific restaurant's menu
      navigateToScreen('restaurants');
      // Small delay to ensure the restaurant screen loads, then navigate to menu
      setTimeout(() => {
        navigateToMenu(restaurant.id);
      }, 100);

      return true;

    } else if (sharedContent.type === 'dish') {
      // For now, dish sharing is not implemented - just log and return false
      console.log('Dish sharing not yet implemented');
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error handling shared content:', error);
    return false;
  }
};

export const clearSharedUrlParams = () => {
  const url = new URL(window.location.href);
  const hasSharedParams = url.searchParams.has('shared') || url.pathname.includes('/shared/');
  
  if (hasSharedParams) {
    // For path-based sharing, redirect to clean URL
    if (url.pathname.includes('/shared/')) {
      window.history.replaceState({}, '', url.origin);
    } else {
      // For parameter-based sharing, just remove the parameters
      url.searchParams.delete('shared');
      url.searchParams.delete('id');
      url.searchParams.delete('restaurantId');
      window.history.replaceState({}, '', url.toString());
    }
  }
};