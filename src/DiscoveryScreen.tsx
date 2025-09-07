// src/DiscoveryScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from './components/DishCard';
import LoadingScreen from './components/LoadingScreen';
import { SCREEN_STYLES } from './constants';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import type { DishRating, DishSearchResultWithRestaurant, DishWithDetails } from './hooks/useDishes';
import { searchAllDishes, updateRatingForDish } from './hooks/useDishes';
import { useLocationService } from './hooks/useLocationService';
import { useRestaurants } from './hooks/useRestaurants';
import { supabase } from './supabaseClient';
import { calculateDistanceInMiles, formatDistanceMiles } from './utils/geolocation';
const LOCATION_INTERACTION_KEY = 'locationInteractionDone';
function isDishWithRestaurant(dish: DishWithDetails): dish is DishSearchResultWithRestaurant {
    return 'restaurant' in dish && dish.restaurant !== null && typeof dish.restaurant === 'object';
}
interface RestaurantGroup {
  restaurant: {
    id: string;
    name: string;
    distance?: number;
  };
  dishes: DishSearchResultWithRestaurant[];
}
const DiscoveryScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurants: favoriteRestaurants } = useRestaurants({ sortBy: { criterion: 'name', direction: 'asc' }});
  const {
    coordinates: userLocation,
    isAvailable: hasLocationPermission,
    status: locationStatus,
    requestLocation,
    openPermissionModal,
    initialCheckComplete,
  } = useLocationService();
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(-1); // in miles, -1 for 'Any'
  // Data and loading states
  const [filteredAndGrouped, setFilteredAndGrouped] = useState<RestaurantGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<Set<string>>(new Set());
  // UI States
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const effectRunCount = useRef(0);
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setMinRating(0);
    setMaxDistance(-1);
  }, []);
  useEffect(() => {
    if (favoriteRestaurants.length > 0) {
      setFavoriteRestaurantIds(new Set(favoriteRestaurants.map(r => r.id)));
    }
  }, [favoriteRestaurants]);
  useEffect(() => {
    if (!initialCheckComplete) return;
    if (!user || locationStatus === 'granted' || locationStatus === 'requesting') return;
    const hasInteracted = sessionStorage.getItem(LOCATION_INTERACTION_KEY);
    if (hasInteracted) return;
    if (locationStatus === 'denied') {
      openPermissionModal();
      sessionStorage.setItem(LOCATION_INTERACTION_KEY, 'true');
    } else if (locationStatus === 'idle') {
      requestLocation();
      sessionStorage.setItem(LOCATION_INTERACTION_KEY, 'true');
    }
  }, [locationStatus, user, openPermissionModal, requestLocation, initialCheckComplete]);
  useEffect(() => {
    effectRunCount.current++;
    console.log(`[DISCOVERY] Search Effect Run #${effectRunCount.current}`, {
      searchTerm,
      minRating,
      maxDistance,
      hasUserLocation: !!userLocation,
      timestamp: new Date().toISOString()
    });
    let isActive = true;
    const runSearch = async () => {
      const searchId = `${searchTerm.trim()}-${Date.now()}`;
      const hasSearchTerm = searchTerm.trim().length >= 2;
      const hasActiveFilters = minRating > 0 || maxDistance > -1;
      if (!hasSearchTerm && !hasActiveFilters) {
          if (isActive) {
            setFilteredAndGrouped([]);
            setIsLoading(false);
            setError(null);
          }
          return;
      }
      setIsLoading(true);
      setError(null);
      console.time(`DiscoveryScreen-search-${searchId}`);
      console.log(`[PERF] Starting search (${searchId}) at:`, new Date().toISOString());
      try {
          let results = await searchAllDishes(
            searchTerm.trim(), 
            minRating, 
            userLocation || undefined,
            maxDistance > -1 ? maxDistance : undefined
          );
          if (!isActive) {
            console.log(`[DISCOVERY] Search aborted (${searchId}), effect is no longer active.`);
            return;
          }
          // Distance filtering is now handled by the edge function
          const grouped = results.reduce((acc: { [key: string]: RestaurantGroup }, dish) => {
              const restaurantId = dish.restaurant.id;
              if (!acc[restaurantId]) {
                  let distance: number | undefined;
                  if (userLocation && dish.restaurant.latitude && dish.restaurant.longitude) {
                      distance = calculateDistanceInMiles(userLocation.latitude, userLocation.longitude, dish.restaurant.latitude, dish.restaurant.longitude);
                  }
                  acc[restaurantId] = {
                      restaurant: { ...dish.restaurant, distance },
                      dishes: [],
                  };
              }
              acc[restaurantId].dishes.push(dish);
              return acc;
          }, {});
          const sortedGroups = Object.values(grouped).sort((a, b) => {
              if (userLocation && a.restaurant.distance !== undefined && b.restaurant.distance !== undefined) {
                  return a.restaurant.distance - b.restaurant.distance;
              }
              return a.restaurant.name.localeCompare(b.restaurant.name);
          });
          if (isActive) {
            setFilteredAndGrouped(sortedGroups);
          }
      } catch (e) {
          if (isActive) {
            setError('Could not load dishes. Please try again later.');
          }
          console.error(e);
      } finally {
          if (isActive) {
            setIsLoading(false);
          }
          console.timeEnd(`DiscoveryScreen-search-${searchId}`);
      }
    };
    if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
    }
    searchDebounceTimer.current = setTimeout(() => {
        runSearch();
    }, 300);

    return () => {
        isActive = false;
        if (searchDebounceTimer.current) {
            console.log(`[CLEANUP] Clearing timer ${searchDebounceTimer.current} and disarming effect in DiscoveryScreen.`);
            clearTimeout(searchDebounceTimer.current);
        }
    }
  }, [searchTerm, minRating, maxDistance, userLocation]);
  const addRestaurantToFavorites = async (restaurantId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_favorite_restaurants')
      .insert({ user_id: user.id, restaurant_id: restaurantId });
    if (error && error.code !== '23505') {
      console.error('Error adding restaurant to favorites:', error);
      throw error;
    }
  };
  const handleUpdateRating = async (dishId: string, newRating: number) => {
    if (!user) {
      alert("Please log in to rate dishes.");
      return;
    }
    const dishToUpdate = [...filteredAndGrouped].flatMap(g => g.dishes).find(d => d.id === dishId);
    if (!dishToUpdate) return;
    
    // Store original state for potential rollback
    const originalGroups = [...filteredAndGrouped];
    
    // Optimistic update - update UI immediately
    setFilteredAndGrouped(prevGroups => prevGroups.map(group => ({
        ...group,
        dishes: group.dishes.map(dish => {
            if (dish.id === dishId) {
                const existingRatingIndex = dish.ratings.findIndex((r: DishRating) => r.user_id === user.id);
                const newRatings: DishRating[] = [...dish.ratings];
                if (existingRatingIndex > -1) {
                    if (newRating === 0) {
                        newRatings.splice(existingRatingIndex, 1);
                    } else {
                        newRatings[existingRatingIndex] = { ...newRatings[existingRatingIndex], rating: newRating };
                    }
                } else if (newRating > 0) {
                    newRatings.push({
                        id: `temp-${Date.now()}`, user_id: user.id, rating: newRating, dish_id: dishId,
                        created_at: new Date().toISOString(), updated_at: new Date().toISOString(), date_tried: new Date().toISOString(),
                        notes: null
                    });
                }
                const total = newRatings.length;
                const avg = total > 0 ? newRatings.reduce((sum, r) => sum + r.rating, 0) / total : 0;
                return { ...dish, ratings: newRatings, total_ratings: total, average_rating: Math.round(avg * 10) / 10 };
            }
            return dish;
        })
    })));
    
    try {
      // Handle favorite restaurant logic
      const isFavorite = favoriteRestaurantIds.has(dishToUpdate.restaurant.id);
      if (!isFavorite) {
        await addRestaurantToFavorites(dishToUpdate.restaurant.id);
        setFavoriteRestaurantIds(prev => new Set(prev).add(dishToUpdate.restaurant.id));
      }
      
      // Make server call
      const success = await updateRatingForDish(dishId, user.id, newRating);
      if (!success) {
        throw new Error("Failed to save rating to the database.");
      }
    } catch (error) {
      console.error("Error during rating update process:", error);
      // Rollback optimistic update on error
      setFilteredAndGrouped(originalGroups);
      alert("There was a problem saving your rating. Please try again.");
    }
  };
  const handleShareDish = (dish: DishWithDetails) => {
    if (!isDishWithRestaurant(dish) || !dish.restaurant.name) {
      console.error("Cannot share dish, missing restaurant context:", dish);
      alert("Could not share this dish, information is missing.");
      return;
    }
    const dishWithRestaurant = dish;
    const restaurantId = dishWithRestaurant.restaurant?.id ||
                        dishWithRestaurant.restaurant_id;
    console.log('Sharing dish - Debug info:', {
      dishId: dishWithRestaurant.id,
      dishName: dishWithRestaurant.name,
      restaurantId: restaurantId,
      restaurantName: dishWithRestaurant.restaurant?.name,
      fullDishObject: dishWithRestaurant
    });
    if (!restaurantId) {
      console.error("Cannot share dish: restaurantId is missing from dish object", dishWithRestaurant);
      alert("Could not share this dish, restaurant information is missing.");
      return;
    }
    const shareUrl = `${window.location.origin}/restaurants/${restaurantId}?dish=${dishWithRestaurant.id}`;
    const restaurantName = dishWithRestaurant.restaurant?.name || 'this restaurant';
    console.log('Generated share URL:', shareUrl);
    if (navigator.share) {
      navigator.share({
        title: `${dishWithRestaurant.name} at ${restaurantName}`,
        text: `Check out ${dishWithRestaurant.name} at ${restaurantName} on HowzEverything!`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(err => {
        console.error('Could not copy link to clipboard:', err);
        alert(`To share, copy this link: ${shareUrl}`);
      });
    }
  };
  const renderContent = () => {
    const hasSearchTerm = searchTerm.trim().length >= 2;
    const hasActiveFilters = minRating > 0 || maxDistance > -1;
    if (isLoading) {
      return <LoadingScreen message="Fetching dishes for you..." />;
    }
    if (error) {
      return (
          <div className="text-center py-12">
              <p style={{
                ...theme.fonts.heading,
                fontSize: '1.5rem',
                color: theme.colors.text,
                fontWeight: '700',
                marginBottom: '16px'
              }}>{error}</p>
              <p style={{
                ...theme.fonts.body,
                fontSize: '1.125rem',
                color: theme.colors.text,
                lineHeight: '1.6',
                margin: 0
              }}>You can also try refreshing the page.</p>
          </div>
      );
    }
    if (!hasSearchTerm && !hasActiveFilters) {
      return (
        <div className="text-center py-12">
          <p style={{
            ...theme.fonts.heading,
            fontSize: '1.5rem',
            color: theme.colors.text,
            fontWeight: '700',
            marginBottom: '16px'
          }}>Start Discovering</p>
          <p style={{
            ...theme.fonts.body,
            fontSize: '1.125rem',
            color: theme.colors.text,
            lineHeight: '1.6',
            margin: 0
          }}>Use the search bar or filters above to find dishes the community has rated.</p>
        </div>
      );
    }
    if (filteredAndGrouped.length > 0) {
      
      return filteredAndGrouped.map((group) => (
        <div key={group.restaurant.id}>
          <div className="mb-4" style={SCREEN_STYLES.discovery.restaurantHeader}>
            <h2 
              style={{
                ...SCREEN_STYLES.discovery.restaurantName,
                color: theme.colors.discoveryRestaurantNameColor
              }} 
              onClick={() => navigate(`/restaurants/${group.restaurant.id}`)}
            >
              {group.restaurant.name}
            </h2>
            {group.restaurant.distance !== undefined && (
              <span style={{
                ...SCREEN_STYLES.discovery.restaurantDistance,
                color: theme.colors.discoveryRestaurantDistanceColor
              }}>
                {formatDistanceMiles(group.restaurant.distance)}
              </span>
            )}
          </div>
          <div style={SCREEN_STYLES.discovery.dishesContainer}>
            {group.dishes.map((dish) => (
              <DishCard
                key={dish.id} dish={dish} currentUserId={user?.id || null}
                onDelete={() => { alert('Deletion is not supported from the discovery page.'); }}
                onUpdateRating={handleUpdateRating}
                onAddComment={() => Promise.resolve()} onUpdateComment={() => Promise.resolve()}
                onDeleteComment={() => Promise.resolve()} onAddPhoto={() => Promise.resolve()} onDeletePhoto={() => Promise.resolve()}
                onUpdatePhotoCaption={() => Promise.resolve()}
                onShare={() => handleShareDish(dish)} isSubmittingComment={false} isExpanded={expandedDishId === dish.id}
                onToggleExpand={() => setExpandedDishId(prev => (prev === dish.id ? null : dish.id))}
                allowInlineRating={true}
              />
            ))}
          </div>
        </div>
      ));
    }
    return (
      <div className="text-center py-12">
        <p style={{
          ...theme.fonts.heading,
          fontSize: '1.5rem',
          color: theme.colors.text,
          fontWeight: '700',
          marginBottom: '16px'
        }}>No Dishes Found</p>
        <p style={{
          ...theme.fonts.body,
          fontSize: '1.125rem',
          color: theme.colors.text,
          lineHeight: '1.6',
          margin: 0
        }}>Try adjusting your search or filters to find more results.</p>
      </div>
    );
  };
  return (
    <div style={{ 
      width: '100vw',
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: theme.colors.background, 
      minHeight: '100vh'
    }}>
      {/* HEADER SECTION */}
      <div style={{
        background: theme.colors.discoveryHeaderBackground,
        paddingTop: '84px',
        paddingBottom: '32px',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '512px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img
              src={theme.images.discoveryHero}
              alt="Discovering a new dish"
              style={theme.colors.discoveryHeroImageStyle}
          />
          <h1 style={{
            ...theme.fonts.heading,
            fontSize: '2.5rem',
            fontWeight: '700',
            color: theme.colors.white,
            margin: 0,
            marginBottom: '24px',
            textAlign: 'center',
            textShadow: theme.colors.discoveryHeadingTextShadow
          }}>
              Discover dishes
          </h1>
          <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <input 
              id="discover-search" 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="e.g. pasta, dessert, Mexican" 
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                borderRadius: '12px',
                border: theme.colors.discoverySearchInputBorder,
                outline: 'none',
                fontSize: '1rem',
                ...theme.fonts.body,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.black,
                boxShadow: theme.colors.discoverySearchInputBoxShadow,
                boxSizing: 'border-box'
              }}
            />
            {searchTerm.trim().length > 0 && (
              <button
                onClick={handleResetFilters}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  opacity: 0.7,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                aria-label="Reset search and filters" title="Reset search and filters"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
              </button>
            )}
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <select 
                value={minRating} 
                onChange={e => setMinRating(parseFloat(e.target.value))} 
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: theme.colors.discoverySelectBorder,
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.discoverySelectTextColor || theme.colors.black,
                  ...theme.fonts.body,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={0}>Any Rating</option>
                {[...Array(8)].map((_, i) => <option key={i} value={i * 0.5 + 1}>{(i * 0.5 + 1).toFixed(1)}+ ★</option>)}
                <option value={5}>5.0 ★</option>
              </select>
            </div>
            <div
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '4px',
                  opacity: !hasLocationPermission ? 0.6 : 1, 
                  cursor: !hasLocationPermission ? 'pointer' : 'default' 
                }}
                onClick={!hasLocationPermission ? requestLocation : undefined}
                title={!hasLocationPermission ? 'Enable location services to filter by distance' : ''}
            >
              <select
                value={maxDistance}
                onChange={e => setMaxDistance(parseInt(e.target.value, 10))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: theme.colors.discoverySelectBorder,
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.discoverySelectTextColor || theme.colors.black,
                  ...theme.fonts.body,
                  fontSize: '1rem',
                  cursor: !hasLocationPermission ? 'pointer' : 'default',
                  pointerEvents: !hasLocationPermission ? 'none' : 'auto',
                  outline: 'none'
                }}
              >
                  <option value={-1}>Any Distance</option>
                  <option value={1}>Within 1 mi</option>
                  <option value={2}>Within 2 mi</option>
                  <option value={5}>Within 5 mi</option>
                  <option value={10}>Within 10 mi</option>
                  <option value={25}>Within 25 mi</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* BODY SECTION */}
      <main style={{
        backgroundColor: theme.colors.background,
        minHeight: '100vh',
        paddingTop: '24px',
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '448px',
          margin: '0 auto',
          padding: '0 16px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            overflowX: 'hidden'
          }}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};
export default DiscoveryScreen;