// src/DiscoveryScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from './components/DishCard';
import LoadingScreen from './components/LoadingScreen';
import { COLORS, FONT_FAMILIES, RESTAURANT_CARD_MAX_WIDTH, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';
import type { DishRating, DishSearchResultWithRestaurant, DishWithDetails } from './hooks/useDishes';
import { searchAllDishes, updateRatingForDish } from './hooks/useDishes';
import { useLocationService } from './hooks/useLocationService';
import { useRestaurants } from './hooks/useRestaurants';
import { supabase } from './supabaseClient';
import { calculateDistanceInMiles, formatDistanceMiles } from './utils/geolocation';
const SEARCH_BAR_WIDTH = '350px';
const LOCATION_INTERACTION_KEY = 'locationInteractionDone';
interface RestaurantGroup {
  restaurant: {
    id: string;
    name: string;
    distance?: number;
  };
  dishes: DishSearchResultWithRestaurant[];
}
const DiscoveryScreen: React.FC = () => {
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
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
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
          // --- THE FIX: Removed the third argument 'searchId' to match the function definition ---
          let results = await searchAllDishes(searchTerm.trim(), minRating);
          if (!isActive) {
            console.log(`[DISCOVERY] Search aborted (${searchId}), effect is no longer active.`);
            return;
          }
          if (maxDistance > -1 && userLocation) {
              results = results.filter(dish => {
                  if (dish.restaurant?.latitude && dish.restaurant?.longitude) {
                      const distance = calculateDistanceInMiles(
                          userLocation.latitude,
                          userLocation.longitude,
                          dish.restaurant.latitude,
                          dish.restaurant.longitude
                      );
                      return distance <= maxDistance;
                  }
                  return false;
              });
          }
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
      } catch (e: any) {
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
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    const timer = setTimeout(() => {
        runSearch();
    }, 300);
    setSearchDebounceTimer(timer);
    return () => {
        isActive = false;
        console.log(`[CLEANUP] Clearing timer ${timer} and disarming effect in DiscoveryScreen.`);
        clearTimeout(timer);
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
    try {
      const isFavorite = favoriteRestaurantIds.has(dishToUpdate.restaurant.id);
      if (!isFavorite) {
        await addRestaurantToFavorites(dishToUpdate.restaurant.id);
        setFavoriteRestaurantIds(prev => new Set(prev).add(dishToUpdate.restaurant.id));
      }
      const success = await updateRatingForDish(dishId, user.id, newRating);
      if (!success) {
        throw new Error("Failed to save rating to the database.");
      }
      setFilteredAndGrouped(prevGroups => prevGroups.map(group => ({
          ...group,
          dishes: group.dishes.map(dish => {
              if (dish.id === dishId) {
                  const existingRatingIndex = dish.ratings.findIndex((r: DishRating) => r.user_id === user.id);
                  let newRatings: DishRating[] = [...dish.ratings];
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
                      });
                  }
                  const total = newRatings.length;
                  const avg = total > 0 ? newRatings.reduce((sum, r) => sum + r.rating, 0) / total : 0;
                  return { ...dish, ratings: newRatings, total_ratings: total, average_rating: Math.round(avg * 10) / 10 };
              }
              return dish;
          })
      })));
    } catch (error) {
      console.error("Error during rating update process:", error);
      alert("There was a problem saving your rating. Please try again.");
    }
  };
  const handleShareDish = (dish: DishWithDetails) => {
    if (!('restaurant' in dish) || !(dish as any).restaurant.name) {
      console.error("Cannot share dish, missing restaurant context:", dish);
      alert("Could not share this dish, information is missing.");
      return;
    }
    const dishWithRestaurant = dish as DishSearchResultWithRestaurant;
    const restaurantId = dishWithRestaurant.restaurant?.id ||
                        dishWithRestaurant.restaurant_id ||
                        (dishWithRestaurant as any).restaurantId;
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
  const selectStyle: React.CSSProperties = {
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    backgroundColor: COLORS.white,
    color: COLORS.text,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.25em 1.25em',
    paddingRight: '2.5rem',
    width: '100%'
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
              <p style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.danger, fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>{error}</p>
              <p style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, opacity: 0.7 }}>You can also try refreshing the page.</p>
          </div>
      );
    }
    if (!hasSearchTerm && !hasActiveFilters) {
      return (
        <div className="text-center py-12">
          <p style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Start Discovering</p>
          <p style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, opacity: 0.7 }}>Use the search bar or filters above to find dishes the community has rated.</p>
        </div>
      );
    }
    if (filteredAndGrouped.length > 0) {
      return filteredAndGrouped.map((group) => (
        <div key={group.restaurant.id}>
          <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.gray200}`, paddingBottom: SPACING[2] }}>
            <h2 style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', fontSize: '1.125rem', fontWeight: '600', color: COLORS.primary, margin: 0, cursor: 'pointer' }} onClick={() => navigate(`/restaurants/${group.restaurant.id}`)}>{group.restaurant.name}</h2>
            {group.restaurant.distance !== undefined && (
              <span style={{fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.accent, fontWeight: TYPOGRAPHY.semibold, fontSize: TYPOGRAPHY.sm.fontSize, flexShrink: 0, marginLeft: SPACING[3]}}>
                {formatDistanceMiles(group.restaurant.distance)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2] }}>
            {group.dishes.map((dish) => (
              <DishCard
                key={dish.id} dish={dish} currentUserId={user?.id || null}
                onDelete={() => { alert('Deletion is not supported from the discovery page.'); }}
                onUpdateRating={handleUpdateRating}
                onAddComment={() => Promise.resolve()} onUpdateComment={() => Promise.resolve()}
                onDeleteComment={() => Promise.resolve()} onAddPhoto={() => Promise.resolve()} onDeletePhoto={() => Promise.resolve()}
                onShare={() => handleShareDish(dish)} isSubmittingComment={false} isExpanded={expandedDishId === dish.id}
                onToggleExpand={() => setExpandedDishId(prev => (prev === dish.id ? null : dish.id))}
              />
            ))}
          </div>
        </div>
      ));
    }
    return (
      <div className="text-center py-12">
        <p style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No Dishes Found</p>
        <p style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, opacity: 0.7 }}>Try adjusting your search or filters to find more results.</p>
      </div>
    );
  };
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* HEADER SECTION */}
      <div style={{
        backgroundColor: COLORS.navBarDark,
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: SPACING[6],
      }}>
        <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center" style={{paddingTop: `calc(60px + ${SPACING[4]})`, paddingBottom: SPACING[6]}}>
          <img
              src="/stolen_dish.png"
              alt="Discovering a new dish"
              style={{
                width: '180px',
                marginTop: SPACING[4],
                marginBottom: SPACING[4],
                border: `2px solid ${COLORS.white}`,
                borderRadius: STYLES.borderRadiusMedium,
                height: 'auto',
                objectFit: 'contain',
              }}
          />
          <h1 style={{...TYPOGRAPHY.h1, color: COLORS.textWhite, marginBottom: SPACING[6]}}>
              Discover dishes
          </h1>
          <div className="w-full" style={{ maxWidth: SEARCH_BAR_WIDTH, position: 'relative' }}>
            <input id="discover-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g. pasta, dessert, Mexican" style={STYLES.input} />
            {searchTerm.trim().length > 0 && (
              <button
                onClick={handleResetFilters}
                style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-5px',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: COLORS.white,
                    opacity: 0.7,
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'scale(1)'; }}
                aria-label="Reset search and filters" title="Reset search and filters"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
              </button>
            )}
          </div>
          <div style={{display: 'flex', gap: SPACING[3], marginTop: SPACING[4], width: '100%', maxWidth: SEARCH_BAR_WIDTH}}>
            <div style={{ flex: 1 }}>
              <select value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} style={selectStyle}>
                <option value={0}>Any Rating</option>
                {[...Array(8)].map((_, i) => <option key={i} value={i * 0.5 + 1}>{(i * 0.5 + 1).toFixed(1)}+ ★</option>)}
                <option value={5}>5.0 ★</option>
              </select>
            </div>
            <div
                style={{ flex: 1, opacity: !hasLocationPermission ? 0.6 : 1, cursor: !hasLocationPermission ? 'pointer' : 'default', position: 'relative' }}
                onClick={!hasLocationPermission ? requestLocation : undefined}
                title={!hasLocationPermission ? 'Enable location services to filter by distance' : ''}
            >
              <select
                value={maxDistance}
                onChange={e => setMaxDistance(parseInt(e.target.value, 10))}
                style={{
                  ...selectStyle,
                  cursor: !hasLocationPermission ? 'pointer' : 'default',
                  pointerEvents: !hasLocationPermission ? 'none' : 'auto',
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
      <main className="w-full mx-auto p-4" style={{ maxWidth: RESTAURANT_CARD_MAX_WIDTH }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[4] }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
export default DiscoveryScreen;