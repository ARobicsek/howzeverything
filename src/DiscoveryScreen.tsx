// src/DiscoveryScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from './components/DishCard';
import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './hooks/useAuth';
import type { DishRating, DishSearchResultWithRestaurant, DishWithDetails } from './hooks/useDishes';
import { searchAllDishes, updateRatingForDish } from './hooks/useDishes';
import { useLocationService } from './hooks/useLocationService';
import { useRestaurants } from './hooks/useRestaurants';
import { supabase } from './supabaseClient';
import { calculateDistanceInMiles, formatDistanceMiles } from './utils/geolocation';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(-1);
  const [filteredAndGrouped, setFilteredAndGrouped] = useState<RestaurantGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<Set<string>>(new Set());
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
    if (!initialCheckComplete || !user || locationStatus === 'granted' || locationStatus === 'requesting' || sessionStorage.getItem(LOCATION_INTERACTION_KEY)) return;
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
    let isActive = true;
    const runSearch = async () => {
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
      try {
        let results = await searchAllDishes(searchTerm.trim(), minRating);
        if (!isActive) return;
        if (maxDistance > -1 && userLocation) {
          results = results.filter(dish => {
            if (dish.restaurant?.latitude && dish.restaurant?.longitude) {
              const distance = calculateDistanceInMiles(userLocation.latitude, userLocation.longitude, dish.restaurant.latitude, dish.restaurant.longitude);
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
            acc[restaurantId] = { restaurant: { ...dish.restaurant, distance }, dishes: [] };
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
        if (isActive) setFilteredAndGrouped(sortedGroups);
      } catch (e: any) {
        if (isActive) setError('Could not load dishes. Please try again later.');
        console.error(e);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    const timer = setTimeout(() => runSearch(), 300);
    setSearchDebounceTimer(timer);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [searchTerm, minRating, maxDistance, userLocation]);

  const addRestaurantToFavorites = async (restaurantId: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_favorite_restaurants').insert({ user_id: user.id, restaurant_id: restaurantId });
    if (error && error.code !== '23505') throw error;
  };

  const handleUpdateRating = async (dishId: string, newRating: number) => {
    if (!user) { alert("Please log in to rate dishes."); return; }
    const dishToUpdate = [...filteredAndGrouped].flatMap(g => g.dishes).find(d => d.id === dishId);
    if (!dishToUpdate) return;
    try {
      if (!favoriteRestaurantIds.has(dishToUpdate.restaurant.id)) {
        await addRestaurantToFavorites(dishToUpdate.restaurant.id);
        setFavoriteRestaurantIds(prev => new Set(prev).add(dishToUpdate.restaurant.id));
      }
      if (!(await updateRatingForDish(dishId, user.id, newRating))) throw new Error("Failed to save rating to the database.");
      setFilteredAndGrouped(prevGroups => prevGroups.map(group => ({
        ...group,
        dishes: group.dishes.map(dish => {
          if (dish.id === dishId) {
            const existingRatingIndex = dish.ratings.findIndex((r: DishRating) => r.user_id === user.id);
            let newRatings: DishRating[] = [...dish.ratings];
            if (existingRatingIndex > -1) {
              if (newRating === 0) newRatings.splice(existingRatingIndex, 1);
              else newRatings[existingRatingIndex] = { ...newRatings[existingRatingIndex], rating: newRating };
            } else if (newRating > 0) {
              newRatings.push({ id: `temp-${Date.now()}`, user_id: user.id, rating: newRating, dish_id: dishId, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), date_tried: new Date().toISOString() });
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
    const dishWithRestaurant = dish as DishSearchResultWithRestaurant;
    const restaurantId = dishWithRestaurant.restaurant?.id || dishWithRestaurant.restaurant_id || (dishWithRestaurant as any).restaurantId;
    if (!restaurantId) { alert("Could not share this dish, restaurant information is missing."); return; }
    const shareUrl = `${window.location.origin}/restaurants/${restaurantId}?dish=${dishWithRestaurant.id}`;
    const restaurantName = dishWithRestaurant.restaurant?.name || 'this restaurant';
    if (navigator.share) {
      navigator.share({ title: `${dishWithRestaurant.name} at ${restaurantName}`, text: `Check out ${dishWithRestaurant.name} at ${restaurantName} on HowzEverything!`, url: shareUrl }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => alert('Share link copied to clipboard!')).catch(err => alert(`To share, copy this link: ${shareUrl}`));
    }
  };

  const selectClasses = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-text cursor-pointer appearance-none bg-no-repeat bg-right-2";
  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` };

  const renderContent = () => {
    const hasSearchTerm = searchTerm.trim().length >= 2;
    const hasActiveFilters = minRating > 0 || maxDistance > -1;
    if (isLoading) return <LoadingScreen message="Fetching dishes for you..." />;
    if (error) return <div className="text-center py-12"><p className="font-elegant text-danger text-lg font-medium mb-2">{error}</p><p className="font-elegant text-text opacity-70">You can also try refreshing the page.</p></div>;
    if (!hasSearchTerm && !hasActiveFilters) return <div className="text-center py-12"><p className="font-elegant text-text text-lg font-medium mb-2">Start Discovering</p><p className="font-elegant text-text opacity-70">Use the search bar or filters above to find dishes the community has rated.</p></div>;
    if (filteredAndGrouped.length > 0) {
      return filteredAndGrouped.map((group) => (
        <div key={group.restaurant.id}>
          <div className="mb-4 flex justify-between items-center border-b border-gray-200 pb-2">
            <h2 className="font-elegant text-lg font-semibold text-primary m-0 cursor-pointer" onClick={() => navigate(`/restaurants/${group.restaurant.id}`)}>{group.restaurant.name}</h2>
            {group.restaurant.distance !== undefined && <span className="font-elegant text-accent font-semibold text-sm flex-shrink-0 ml-3">{formatDistanceMiles(group.restaurant.distance)}</span>}
          </div>
          <div className="flex flex-col gap-2">
            {group.dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} currentUserId={user?.id || null} onDelete={() => alert('Deletion is not supported from the discovery page.')} onUpdateRating={handleUpdateRating} onAddComment={() => Promise.resolve()} onUpdateComment={() => Promise.resolve()} onDeleteComment={() => Promise.resolve()} onAddPhoto={() => Promise.resolve()} onDeletePhoto={() => Promise.resolve()} onShare={() => handleShareDish(dish)} isSubmittingComment={false} isExpanded={expandedDishId === dish.id} onToggleExpand={() => setExpandedDishId(prev => (prev === dish.id ? null : dish.id))} />
            ))}
          </div>
        </div>
      ));
    }
    return <div className="text-center py-12"><p className="font-elegant text-text text-lg font-medium mb-2">No Dishes Found</p><p className="font-elegant text-text opacity-70">Try adjusting your search or filters to find more results.</p></div>;
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-navBarDark -ml-[calc(50vw-50%)] -mr-[calc(50vw-50%)] mb-6">
        <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center pt-20 pb-6">
          <img src="/stolen_dish.png" alt="Discovering a new dish" className="w-48 mt-4 mb-4 border-2 border-white rounded-md h-auto object-contain" />
          <h1 className="text-3xl text-textWhite mb-6 font-heading">Discover dishes</h1>
          <div className="w-full max-w-sm relative">
            <input id="discover-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g. pasta, dessert, Mexican" className="w-full p-3 border-2 border-gray-200 rounded-md bg-white text-text" />
            {searchTerm.trim().length > 0 && (
              <button onClick={handleResetFilters} className="absolute top-[-30px] right-[-5px] bg-transparent border-none p-0 cursor-pointer text-white opacity-70 transition-all duration-200 ease-in-out hover:opacity-100 hover:scale-115" aria-label="Reset search and filters" title="Reset search and filters">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
              </button>
            )}
          </div>
          <div className="flex gap-3 mt-4 w-full max-w-sm">
            <div className="flex-1">
              <select value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} className={selectClasses} style={selectStyle}>
                <option value={0}>Any Rating</option>
                {[...Array(8)].map((_, i) => <option key={i} value={i * 0.5 + 1}>{(i * 0.5 + 1).toFixed(1)}+ ★</option>)}
                <option value={5}>5.0 ★</option>
              </select>
            </div>
            <div className={`flex-1 relative ${!hasLocationPermission ? 'opacity-60 cursor-pointer' : ''}`} onClick={!hasLocationPermission ? requestLocation : undefined} title={!hasLocationPermission ? 'Enable location services to filter by distance' : ''}>
              <select value={maxDistance} onChange={e => setMaxDistance(parseInt(e.target.value, 10))} className={selectClasses} style={{...selectStyle, pointerEvents: !hasLocationPermission ? 'none' : 'auto'}}>
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
      <main className="w-full mx-auto p-4 max-w-2xl">
        <div className="flex flex-col gap-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DiscoveryScreen;