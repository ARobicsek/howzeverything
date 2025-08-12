// src/RatingsScreen.tsx
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import { StarRating } from './components/shared/StarRating';
import { COLORS, SCREEN_STYLES, STYLES } from './constants';
import { useAuth } from './hooks/useAuth';
import { DishRating, DishSearchResultWithRestaurant, fetchMyRatedDishes } from './hooks/useDishes';
import { useLocationService } from './hooks/useLocationService';
import { calculateDistanceInMiles, formatDistanceMiles } from './utils/geolocation';


const LOCATION_INTERACTION_KEY = 'locationInteractionDone';


// A dish card that now includes distance.
const RatedDishCard: React.FC<{
  item: DishSearchResultWithRestaurant & { distanceFormatted: string | null };
  myRating: DishRating | undefined;
}> = ({ item, myRating }) => {
  const navigate = useNavigate();


  const handleNavigate = () => {
    navigate(`/restaurants/${item.restaurant.id}?dish=${item.id}`);
  };


  return (
    <div
      onClick={handleNavigate}
      style={SCREEN_STYLES.ratings.card}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.borderColor = COLORS.accent;
        target.style.boxShadow = STYLES.shadowMedium;
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.borderColor = COLORS.gray200;
        target.style.boxShadow = STYLES.shadowSmall;
      }}
    >
      <div style={SCREEN_STYLES.ratings.cardInner}>
        <div style={SCREEN_STYLES.ratings.cardContent}>
          <h3 style={SCREEN_STYLES.ratings.cardTitle}>
            {item.name}
          </h3>
          <p style={SCREEN_STYLES.ratings.cardSubtitle}>
            <span>at</span>
            <Link to={`/restaurants/${item.restaurant.id}`} onClick={(e) => e.stopPropagation()} style={SCREEN_STYLES.ratings.cardRestaurantLink}>{item.restaurant.name}</Link>
            {item.distanceFormatted && (
                <span style={SCREEN_STYLES.ratings.cardDistance}>
                    • {item.distanceFormatted}
                </span>
            )}
          </p>
          <div style={SCREEN_STYLES.ratings.cardRatingsContainer}>
            {myRating && (
              <div style={SCREEN_STYLES.ratings.cardRatingRow}>
                <span style={SCREEN_STYLES.ratings.cardRatingLabel}>Me:</span>
                <StarRating rating={myRating.rating} variant="personal" size="sm" />
              </div>
            )}
            <div style={SCREEN_STYLES.ratings.cardRatingRow}>
              <span style={SCREEN_STYLES.ratings.cardRatingLabel}>Average:</span>
              <StarRating rating={item.average_rating} variant="community" size="sm" />
              <span style={SCREEN_STYLES.ratings.cardRatingValue}>{item.average_rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        {item.photos && item.photos.length > 0 && (
          <div style={SCREEN_STYLES.ratings.cardPhotoContainer}>
            <img src={item.photos[0].url} alt={item.name} style={SCREEN_STYLES.ratings.cardPhoto} />
          </div>
        )}
      </div>
    </div>
  );
};


const RatingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [rawRatedDishes, setRawRatedDishes] = useState<DishSearchResultWithRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    coordinates: userLocation,
    status: locationStatus,
    requestLocation,
    openPermissionModal,
    initialCheckComplete,
  } = useLocationService();


  useEffect(() => {
    // This effect handles showing the permission modal automatically ONCE per session.
    // It waits until the initial check is complete to avoid a race condition.
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


  const loadRatedDishes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const dishes = await fetchMyRatedDishes(user.id);
      setRawRatedDishes(dishes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your ratings.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);


  useEffect(() => {
    loadRatedDishes();
  }, [loadRatedDishes]);


  const processedDishes = useMemo(() => {
    if (!rawRatedDishes.length) return [];


    const withDistance = rawRatedDishes.map(dish => {
        let distance: number | null = null;
        if (userLocation && dish.restaurant.latitude && dish.restaurant.longitude) {
            distance = calculateDistanceInMiles(userLocation.latitude, userLocation.longitude, dish.restaurant.latitude, dish.restaurant.longitude);
        }
        return {
            ...dish,
            distance: distance,
            distanceFormatted: distance !== null ? formatDistanceMiles(distance) : null
        };
    });


    withDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
    });


    return withDistance;
  }, [rawRatedDishes, userLocation]);


  const filteredDishes = useMemo(() => {
    if (!searchTerm.trim()) {
      return processedDishes;
    }
    const fuse = new Fuse(processedDishes, {
      keys: ['name', 'restaurant.name'],
      includeScore: true,
      threshold: 0.3, // Stricter threshold for better accuracy
      minMatchCharLength: 2,
    });
    return fuse.search(searchTerm.trim()).map((result) => result.item);
  }, [processedDishes, searchTerm]);


  return (
    <div>
      {/* HEADER SECTION */}
      <div style={SCREEN_STYLES.ratings.header}>
        <div style={SCREEN_STYLES.ratings.headerInner}>
          <img
            src="/my_ratings.png"
            alt="Person rating food"
            style={SCREEN_STYLES.ratings.headerImage}
          />
          <h1 style={SCREEN_STYLES.ratings.headerTitle}>
            My Ratings
          </h1>
          <div className="w-full" style={SCREEN_STYLES.ratings.searchBarContainer}>
             <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. pizza, Chez Frontenac"
              style={SCREEN_STYLES.ratings.searchInput}
            />
            {searchTerm.trim().length > 0 && (
              <button
                onClick={() => setSearchTerm('')}
                style={SCREEN_STYLES.ratings.resetButton}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'scale(1)'; }}
                aria-label="Reset search" title="Reset search"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>


      {/* BODY SECTION */}
      <div style={SCREEN_STYLES.ratings.body}>
        {isLoading ? (
          <LoadingScreen message="Loading your ratings..." />
        ) : error ? (
          <div style={SCREEN_STYLES.ratings.errorContainer}>
            <p>{error}</p>
            <button onClick={loadRatedDishes} style={STYLES.primaryButton}>Try Again</button>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div style={SCREEN_STYLES.ratings.dishesContainer}>
            {filteredDishes.map((item) => {
              const myRating = item.ratings.find((r) => r.user_id === user?.id);
              return <RatedDishCard key={item.id} item={item} myRating={myRating} />;
            })}
          </div>
        ) : (
          <div style={SCREEN_STYLES.ratings.emptyStateContainer}>
            <p>{searchTerm ? `No matches found for "${searchTerm}".` : "You haven't rated any dishes yet."}</p>
            {!searchTerm && (
              <Link to="/find-restaurant" style={SCREEN_STYLES.ratings.emptyStateLink}>
                Find a Restaurant to Rate
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default RatingsScreen;