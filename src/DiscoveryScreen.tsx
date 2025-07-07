// src/DiscoveryScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from './components/DishCard';
import LoadingScreen from './components/LoadingScreen';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';
import type { DishRating, DishSearchResultWithRestaurant } from './hooks/useDishes';
import { searchAllDishes, updateRatingForDish } from './hooks/useDishes';
import { useRestaurants } from './hooks/useRestaurants';
import { supabase } from './supabaseClient';
import { enhancedDishSearch } from './utils/dishSearch';
import { formatDistanceMiles, getDistanceFromLatLonInMiles } from './utils/geolocation';

// Re-using the location permission banner from RestaurantScreen
const LocationPermissionBanner: React.FC<{
  onRequestPermission: () => void;
  isRequestingLocationPermission: boolean;
  isPermissionBlocked: boolean;
}> = ({ onRequestPermission, isRequestingLocationPermission, isPermissionBlocked }) => {
  return (
    <div style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.blue200}`, borderRadius: STYLES.borderRadiusMedium, padding: SPACING[4], marginBottom: SPACING[4] }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACING[3] }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ ...FONTS.body, fontSize: '15px', lineHeight: '1.5', color: COLORS.gray700, margin: 0 }}>
            To find dishes near you, please{' '}
            <button onClick={onRequestPermission} disabled={isRequestingLocationPermission} style={{ color: COLORS.primary, fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderBottom: `1px solid ${COLORS.primary}` }}>
              {isRequestingLocationPermission ? 'requesting...' : (isPermissionBlocked ? 'enable location services' : 'turn on location')}
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px', opacity: disabled ? 0.5 : 1 }}>
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
            position: 'absolute', cursor: disabled ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: checked ? COLORS.accent : COLORS.gray300,
            transition: 'background-color 0.2s', borderRadius: '34px'
        }}></span>
        <span style={{
            position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
            backgroundColor: 'white', transition: 'transform 0.2s', borderRadius: '50%',
            transform: checked ? 'translateX(16px)' : 'translateX(0)'
        }}></span>
    </label>
);

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
  const { restaurants: favoriteRestaurants } = useRestaurants({ criterion: 'name', direction: 'asc' }, null, null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(25); // in miles
  const [isDistanceFilterEnabled, setIsDistanceFilterEnabled] = useState(false);

  // Data and loading states
  const [allDishes, setAllDishes] = useState<DishSearchResultWithRestaurant[]>([]);
  const [filteredAndGrouped, setFilteredAndGrouped] = useState<RestaurantGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<Set<string>>(new Set());

  // Location states
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isLocationPermissionBlocked, setIsLocationPermissionBlocked] = useState(false);
  const [showLocationBanner, setShowLocationBanner] = useState(true);

  // UI States
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (favoriteRestaurants.length > 0) {
      setFavoriteRestaurantIds(new Set(favoriteRestaurants.map(r => r.id)));
    }
  }, [favoriteRestaurants]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setMinRating(0);
    setMaxDistance(25);
    setIsDistanceFilterEnabled(true);
  }, []);

  const fetchAllDishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dishes = await searchAllDishes(undefined, 3.5); // Pre-fetch dishes with a decent rating
      setAllDishes(dishes);
    } catch (e: any) {
      setError('Could not load dishes. Please try again later.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDishes();
  }, [fetchAllDishes]);

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation || isRequestingLocation) return;
    setIsRequestingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLon(longitude);
        setShowLocationBanner(false);
        setIsLocationPermissionBlocked(false);
        setIsRequestingLocation(false);
      },
      (error) => {
        setIsRequestingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setIsLocationPermissionBlocked(true);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [isRequestingLocation]);

  useEffect(() => {
    // Only request location if we don't have it.
    if (!userLat && !userLon) {
        requestLocationPermission();
    }
  }, [requestLocationPermission, userLat, userLon]);

  const processAndFilterDishes = useCallback(() => {
    let results: DishSearchResultWithRestaurant[] = [];

    if (searchTerm.trim().length > 1) {
        results = enhancedDishSearch(allDishes, searchTerm) as DishSearchResultWithRestaurant[];
    } else {
        results = allDishes;
    }

    results = results.filter(d => d.average_rating >= minRating);

    if (isDistanceFilterEnabled && userLat && userLon) {
      results = results.filter(dish => {
        if (dish.restaurant?.latitude && dish.restaurant?.longitude) {
          const distance = getDistanceFromLatLonInMiles(userLat, userLon, dish.restaurant.latitude, dish.restaurant.longitude);
          return distance <= maxDistance;
        }
        return false;
      });
    }

    const grouped = results.reduce((acc: { [key: string]: RestaurantGroup }, dish) => {
      const restaurantId = dish.restaurant.id;
      if (!acc[restaurantId]) {
        let distance: number | undefined;
        if (userLat && userLon && dish.restaurant.latitude && dish.restaurant.longitude) {
            distance = getDistanceFromLatLonInMiles(userLat, userLon, dish.restaurant.latitude, dish.restaurant.longitude);
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
        if (isDistanceFilterEnabled && userLat && userLon) {
            return (a.restaurant.distance ?? Infinity) - (b.restaurant.distance ?? Infinity);
        }
        return a.restaurant.name.localeCompare(b.restaurant.name);
    });

    setFilteredAndGrouped(sortedGroups);
  }, [allDishes, searchTerm, minRating, maxDistance, userLat, userLon, isDistanceFilterEnabled]);

  useEffect(() => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    const timer = setTimeout(() => {
        processAndFilterDishes();
    }, 300);
    setSearchDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [processAndFilterDishes]);

  const addRestaurantToFavorites = async (restaurantId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_favorite_restaurants')
      .insert({ user_id: user.id, restaurant_id: restaurantId });
    if (error && error.code !== '23505') { // 23505 is unique_violation, ok to ignore
      console.error('Error adding restaurant to favorites:', error);
      throw error;
    }
  };

  const handleUpdateRating = async (dishId: string, newRating: number) => {
    if (!user) {
      alert("Please log in to rate dishes.");
      return;
    }
    const dishToUpdate = allDishes.find(d => d.id === dishId);
    if (!dishToUpdate) return;

    try {
      // Step 1: Add restaurant to favorites if not already present (using local state)
      const isFavorite = favoriteRestaurantIds.has(dishToUpdate.restaurant.id);
      if (!isFavorite) {
        await addRestaurantToFavorites(dishToUpdate.restaurant.id);
        // Optimistically update the local set of favorite IDs
        setFavoriteRestaurantIds(prev => new Set(prev).add(dishToUpdate.restaurant.id));
      }

      // Step 2: Update the dish rating in the database
      const success = await updateRatingForDish(dishId, user.id, newRating);
      if (!success) {
        throw new Error("Failed to save rating to the database.");
      }

      // Step 3: Optimistically update local state for immediate UI feedback
      setAllDishes(prevDishes => prevDishes.map(dish => {
        if (dish.id === dishId) {
          const existingRatingIndex = dish.dish_ratings.findIndex(r => r.user_id === user.id);
          let newRatings: DishRating[] = [...dish.dish_ratings];

          if (existingRatingIndex > -1) {
            if (newRating === 0) { // Remove rating
              newRatings.splice(existingRatingIndex, 1);
            } else { // Update rating
              newRatings[existingRatingIndex] = { ...newRatings[existingRatingIndex], rating: newRating };
            }
          } else if (newRating > 0) { // Add new rating
            newRatings.push({
              id: `temp-${Date.now()}`, user_id: user.id, rating: newRating, dish_id: dishId,
              created_at: new Date().toISOString(), updated_at: new Date().toISOString(), date_tried: new Date().toISOString(),
            });
          }

          const total = newRatings.length;
          const avg = total > 0 ? newRatings.reduce((sum, r) => sum + r.rating, 0) / total : 0;
          return { ...dish, dish_ratings: newRatings, total_ratings: total, average_rating: Math.round(avg * 10) / 10 };
        }
        return dish;
      }));
    } catch (error) {
      console.error("Error during rating update process:", error);
      alert("There was a problem saving your rating. Please try again.");
    }
  };

  const handleShareDish = (dish: DishSearchResultWithRestaurant) => {
    const shareUrl = `${window.location.origin}?shareType=dish&shareId=${dish.id}&restaurantId=${dish.restaurant_id}`;
    if (navigator.share) {
      navigator.share({ title: `${dish.name} at ${dish.restaurant.name}`, text: `Check out ${dish.name} at ${dish.restaurant.name} on How's Everything!`, url: shareUrl, }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => alert('Share link copied to clipboard!'));
    }
  };

  if (isLoading && allDishes.length === 0) return <LoadingScreen message="Discovering amazing dishes..." />;

  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background, paddingBottom: SPACING[8] }}>
      <main style={{ flex: 1, maxWidth: '768px', width: '100%', margin: '0 auto' }}>
        <div style={{ padding: `${SPACING[4]} ${SPACING.containerPadding}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[4] }}>
            <h1 style={{ ...TYPOGRAPHY.h1, color: COLORS.text, margin: 0 }}>Discover Dishes</h1>
            <img src="/stolen_dish.png" alt="A treasure map icon" style={{ height: '100px' }} />
          </div>
          {showLocationBanner && <LocationPermissionBanner onRequestPermission={requestLocationPermission} isRequestingLocationPermission={isRequestingLocation} isPermissionBlocked={isLocationPermissionBlocked} />}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: SPACING[3], marginBottom: SPACING[6] }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[2] }}>
                  <label htmlFor="discover-search" style={{ ...FONTS.body, fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary }}>Dish Name</label>
                  {hasSearchTerm && (<button onClick={handleResetFilters} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.textSecondary, transition: 'color 0.2s ease, transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.danger; e.currentTarget.style.transform = 'scale(1.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }} aria-label="Clear search" title="Clear search"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg></button>)}
              </div>
              <input id="discover-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., 'Ramen', 'Tacos', 'Apple Pie'" style={STYLES.input} />
            </div>

            <div>
              <label htmlFor="discover-rating" style={{ ...FONTS.body, fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, display: 'block', marginBottom: SPACING[2] }}>Minimum Rating: <span style={{color: COLORS.accent, fontWeight: 'bold'}}>{minRating.toFixed(1)} ★</span></label>
              <input id="discover-rating" type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} style={{ width: '100%', accentColor: COLORS.accent }} />
            </div>

            {userLat && userLon && (
              <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[2] }}>
                      <label htmlFor="discover-distance" style={{ ...FONTS.body, fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary }}>
                          Distance: <span style={{color: COLORS.accent, fontWeight: 'bold'}}>{isDistanceFilterEnabled ? `within ${maxDistance} mi` : 'Any'}</span>
                      </label>
                      <ToggleSwitch checked={isDistanceFilterEnabled} onChange={(e) => setIsDistanceFilterEnabled(e.target.checked)} />
                  </div>
                <input id="discover-distance" type="range" min="1" max="50" step="1" value={maxDistance} onChange={e => setMaxDistance(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: COLORS.accent }} disabled={!isDistanceFilterEnabled} />
              </div>
            )}
          </div>

          {error && <p style={{ color: COLORS.danger }}>{error}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[8] }}>
            {filteredAndGrouped.length > 0 ? (
              filteredAndGrouped.map((group) => (
                <div key={group.restaurant.id}>
                  <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.gray200}`, paddingBottom: SPACING[2] }}>
                    <h2 style={{ ...FONTS.elegant, fontSize: '1.125rem', fontWeight: '600', color: COLORS.text, margin: 0, cursor: 'pointer' }} onClick={() => navigate(`/restaurants/${group.restaurant.id}`)}>{group.restaurant.name}</h2>
                    {group.restaurant.distance !== undefined && isDistanceFilterEnabled && (
                      <span style={{...FONTS.body, color: COLORS.accent, fontWeight: TYPOGRAPHY.semibold, fontSize: TYPOGRAPHY.sm.fontSize, flexShrink: 0, marginLeft: SPACING[3]}}>
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
              ))
            ) : (
              !isLoading && <div className="text-center py-12">
                <p style={{ ...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No Dishes Found</p>
                <p style={{ ...FONTS.elegant, color: COLORS.text, opacity: 0.7 }}>Try adjusting your search filters to find more results.</p>
              </div>
            )}
             {isLoading && filteredAndGrouped.length === 0 && <LoadingScreen message="Applying filters..." />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryScreen;