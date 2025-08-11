// src/RatingsScreen.tsx
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import { StarRating } from './components/shared/StarRating';
import { COLORS, FONT_FAMILIES, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';
import { DishRating, DishSearchResultWithRestaurant, fetchMyRatedDishes } from './hooks/useDishes';
import { useLocationService } from './hooks/useLocationService';
import { calculateDistanceInMiles, formatDistanceMiles } from './utils/geolocation';


const SEARCH_BAR_WIDTH = '450px';
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
      style={{
        ...STYLES.card,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: SPACING[3] }}>
          <h3 style={{ fontFamily: FONT_FAMILIES.heading, fontWeight: '600', letterSpacing: '-0.025em', fontSize: TYPOGRAPHY.lg.fontSize, color: COLORS.gray900, margin: `0 0 ${SPACING[1]} 0` }}>
            {item.name}
          </h3>
          <p style={{ fontFamily: FONT_FAMILIES.body, lineHeight: '1.5', fontSize: TYPOGRAPHY.sm.fontSize, color: COLORS.textSecondary, margin: `0 0 ${SPACING[3]} 0`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: SPACING[1] }}>
            <span>at</span>
            <Link to={`/restaurants/${item.restaurant.id}`} onClick={(e) => e.stopPropagation()} style={{ color: COLORS.primary, fontWeight: '500' }}>{item.restaurant.name}</Link>
            {item.distanceFormatted && (
                <span style={{ fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.accent, fontWeight: TYPOGRAPHY.semibold, fontSize: TYPOGRAPHY.sm.fontSize, marginLeft: SPACING[1] }}>
                    • {item.distanceFormatted}
                </span>
            )}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[1] }}>
            {myRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
                <span style={{ fontFamily: FONT_FAMILIES.body, lineHeight: '1.5', fontSize: TYPOGRAPHY.sm.fontSize, fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, width: '70px' }}>Me:</span>
                <StarRating rating={myRating.rating} variant="personal" size="sm" />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
              <span style={{ fontFamily: FONT_FAMILIES.body, lineHeight: '1.5', fontSize: TYPOGRAPHY.sm.fontSize, fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, width: '70px' }}>Average:</span>
              <StarRating rating={item.average_rating} variant="community" size="sm" />
              <span style={{ ...TYPOGRAPHY.sm, color: COLORS.text, fontWeight: '500' }}>{item.average_rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        {item.photos && item.photos.length > 0 && (
          <div style={{ width: '80px', height: '80px', borderRadius: STYLES.borderRadiusMedium, overflow: 'hidden', flexShrink: 0 }}>
            <img src={item.photos[0].url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      <div style={{
        backgroundColor: COLORS.navBarDark,
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: `calc(60px + ${SPACING[4]}) ${SPACING[4]} ${SPACING[6]}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <img
            src="/my_ratings.png"
            alt="Person rating food"
            style={{
              width: '180px',
              height: 'auto',
              objectFit: 'contain',
              marginBottom: SPACING[4],
              border: `2px solid ${COLORS.white}`,
              borderRadius: STYLES.borderRadiusMedium,
            }}
          />
          <h1 style={{ ...TYPOGRAPHY.h1, color: COLORS.textWhite, marginBottom: SPACING[4] }}>
            My Ratings
          </h1>
          <div className="w-full" style={{ maxWidth: SEARCH_BAR_WIDTH, position: 'relative' }}>
             <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. pizza, Chez Frontenac"
              style={{ ...STYLES.input, textAlign: 'center' }}
            />
            {searchTerm.trim().length > 0 && (
              <button
                onClick={() => setSearchTerm('')}
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
                aria-label="Reset search" title="Reset search"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>


      {/* BODY SECTION */}
      <div style={{
        maxWidth: '768px',
        margin: `${SPACING[6]} auto 0`,
        padding: `0 ${SPACING[4]} ${SPACING[12]} `,
      }}>
        {isLoading ? (
          <LoadingScreen message="Loading your ratings..." />
        ) : error ? (
          <div style={{ textAlign: 'center', color: COLORS.danger }}>
            <p>{error}</p>
            <button onClick={loadRatedDishes} style={STYLES.primaryButton}>Try Again</button>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[4] }}>
            {filteredDishes.map((item) => {
              const myRating = item.ratings.find((r) => r.user_id === user?.id);
              return <RatedDishCard key={item.id} item={item} myRating={myRating} />;
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: COLORS.textSecondary, padding: SPACING[8] }}>
            <p>{searchTerm ? `No matches found for "${searchTerm}".` : "You haven't rated any dishes yet."}</p>
            {!searchTerm && (
              <Link to="/find-restaurant" style={{ ...STYLES.primaryButton, marginTop: SPACING[4] }}>
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