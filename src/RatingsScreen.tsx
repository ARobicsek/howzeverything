// src/RatingsScreen.tsx
import Fuse from 'fuse.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import { StarRating } from './components/shared/StarRating';
import { STYLES, SHADOWS, SCREEN_STYLES } from './constants';
import { useTheme } from './hooks/useTheme';
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
  const { theme } = useTheme();
  const navigate = useNavigate();


  const handleNavigate = () => {
    navigate(`/restaurants/${item.restaurant.id}?dish=${item.id}`);
  };


  return (
    <div
      onClick={handleNavigate}
      style={{
        backgroundColor: theme.colors.cardBg,
        border: `1px solid ${theme.colors.gray200}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: SHADOWS.small,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ...theme.fonts.body
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.borderColor = theme.colors.accent;
        target.style.boxShadow = SHADOWS.medium;
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.borderColor = theme.colors.gray200;
        target.style.boxShadow = SHADOWS.small;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            ...theme.fonts.heading,
            fontSize: '1.125rem',
            color: theme.colors.gray900,
            margin: 0,
            marginBottom: '4px',
            wordBreak: 'break-word'
          }}>
            {item.name}
          </h3>
          <p style={{
            ...theme.fonts.body,
            fontSize: '0.875rem',
            color: theme.colors.textSecondary,
            margin: 0,
            marginBottom: '8px'
          }}>
            <span>at </span>
            <Link 
              to={`/restaurants/${item.restaurant.id}`} 
              onClick={(e) => e.stopPropagation()} 
              style={{
                color: theme.colors.accent,
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              {item.restaurant.name}
            </Link>
            {item.distanceFormatted && (
                <span style={{
                  color: theme.colors.textSecondary,
                  fontSize: '0.75rem'
                }}>
                    • {item.distanceFormatted}
                </span>
            )}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {myRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  ...theme.fonts.body,
                  fontSize: '0.75rem',
                  color: theme.colors.textSecondary,
                  fontWeight: '500',
                  minWidth: '24px'
                }}>Me:</span>
                <StarRating rating={myRating.rating} variant="personal" size="sm" />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                ...theme.fonts.body,
                fontSize: '0.75rem',
                color: theme.colors.textSecondary,
                fontWeight: '500',
                minWidth: '40px'
              }}>Average:</span>
              <StarRating rating={item.average_rating} variant="community" size="sm" />
              <span style={{
                ...theme.fonts.body,
                fontSize: '0.75rem',
                color: theme.colors.text,
                fontWeight: '600'
              }}>{item.average_rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        {item.photos && item.photos.length > 0 && (
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <img 
              src={item.photos[0].url} 
              alt={item.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};


const RatingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{ criterion: 'name' | 'my_rating' | 'community_rating' | 'date' | 'distance'; direction: 'asc' | 'desc' }>({ criterion: 'distance', direction: 'asc' });
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);
  const [rawRatedDishes, setRawRatedDishes] = useState<DishSearchResultWithRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get theme-specific styles for sort options - similar to MenuScreen
  const getSortOptionsContainerStyle = () => ({
    ...SCREEN_STYLES.menu.advancedSort.container,
    backgroundColor: theme.colors.menuSortOptionsContainer || SCREEN_STYLES.menu.advancedSort.container.backgroundColor,
  });

  const getSortButtonStyle = (isActive: boolean) => {
    const baseStyle = isActive ? STYLES.sortButtonActive : STYLES.sortButtonDefault;
    const themeBackgroundColor = isActive 
      ? theme.colors.menuSortButtonActive
      : theme.colors.menuSortButtonDefault;
    
    return {
      ...baseStyle,
      ...(themeBackgroundColor && { backgroundColor: themeBackgroundColor }),
    };
  };
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


    // Apply sorting based on sortBy criterion
    withDistance.sort((a, b) => {
      switch (sortBy.criterion) {
        case 'name': {
          const nameResult = a.name.localeCompare(b.name);
          return sortBy.direction === 'asc' ? nameResult : -nameResult;
        }
        
        case 'my_rating': {
          const aMyRating = a.ratings.find(r => r.user_id === user?.id)?.rating || 0;
          const bMyRating = b.ratings.find(r => r.user_id === user?.id)?.rating || 0;
          const ratingResult = aMyRating - bMyRating;
          return sortBy.direction === 'asc' ? ratingResult : -ratingResult;
        }
        
        case 'community_rating': {
          const communityResult = a.average_rating - b.average_rating;
          return sortBy.direction === 'asc' ? communityResult : -communityResult;
        }
        
        case 'date': {
          const dateResult = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          return sortBy.direction === 'asc' ? dateResult : -dateResult;
        }
        
        case 'distance':
        default: {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          const distanceResult = a.distance - b.distance;
          return sortBy.direction === 'asc' ? distanceResult : -distanceResult;
        }
      }
    });


    return withDistance;
  }, [rawRatedDishes, userLocation, sortBy, user]);


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
        background: theme.colors.ratingsHeaderBackground,
        paddingTop: '84px',
        paddingBottom: '32px',
        minHeight: '300px',
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
            src={theme.images.ratingsHero}
            alt="Person rating food"
            style={{
              width: theme.colors.ratingsHeroImageWidth,
              height: theme.colors.ratingsHeroImageWidth === '200px' ? '200px' : 'auto',
              objectFit: 'contain',
              marginBottom: '24px',
              border: theme.colors.ratingsHeroImageBorder,
              borderRadius: theme.colors.ratingsHeroImageBorderRadius
            }}
          />
          <h1 style={{
            ...theme.fonts.heading,
            fontSize: '2.5rem',
            fontWeight: '700',
            color: theme.colors.white,
            margin: 0,
            marginBottom: '24px',
            textAlign: 'center',
            textShadow: theme.colors.ratingsTitleTextShadow
          }}>
            My Ratings
          </h1>
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. pizza, Chez Frontenac"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 16px',
                  borderRadius: '12px',
                  border: theme.colors.ratingsSearchBorder,
                  outline: 'none',
                  fontSize: '1rem',
                  ...theme.fonts.body,
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.black,
                  boxShadow: theme.colors.ratingsSearchShadow,
                  boxSizing: 'border-box'
                }}
              />
              {searchTerm.trim().length > 0 && (
                <button
                  onClick={() => setSearchTerm('')}
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
                  aria-label="Reset search" title="Reset search"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
                </button>
              )}
            </div>
            <button 
              onClick={() => { 
                setShowAdvancedSort(!showAdvancedSort); 
                if (!showAdvancedSort) window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }} 
              style={{ 
                ...STYLES.iconButton, 
                backgroundColor: showAdvancedSort ? theme.colors.primary : theme.colors.white, 
                color: showAdvancedSort ? theme.colors.white : theme.colors.gray700, 
                border: showAdvancedSort 
                  ? `1px solid ${theme.colors.iconButtonBorderActive || theme.colors.primary}` 
                  : `1px solid ${theme.colors.iconButtonBorderInactive || theme.colors.gray200}`,
                flexShrink: 0
              }} 
              aria-label="Sort options"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* SORT OPTIONS */}
      {showAdvancedSort && (
        <div style={{
          backgroundColor: theme.colors.background,
          padding: '0 16px 12px 16px',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div style={{
            maxWidth: '448px',
            margin: '0 auto',
            width: '100%'
          }}>
            <div style={{
              ...getSortOptionsContainerStyle(),
              overflow: 'hidden'
            }}>
              <div style={{
                ...SCREEN_STYLES.menu.advancedSort.innerContainer,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {[
                  { value: 'name', label: 'Name' }, 
                  { value: 'my_rating', label: 'My rating' }, 
                  { value: 'community_rating', label: 'Community rating' }, 
                  { value: 'date', label: 'Date Added' },
                  { value: 'distance', label: 'Distance' }
                ].map((option) => {
                  const isActive = sortBy.criterion === option.value;
                  const buttonStyle = getSortButtonStyle(isActive);
                  const arrow = isActive ? (sortBy.direction === 'asc' ? '▲' : '▼') : '';
                  return (
                    <button 
                      key={option.value} 
                      onClick={() => { 
                        if (isActive) { 
                          setSortBy(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' })); 
                        } else { 
                          setSortBy({ 
                            criterion: option.value as typeof sortBy.criterion, 
                            direction: (option.value === 'my_rating' || option.value === 'community_rating') ? 'desc' : 'asc' 
                          }); 
                        } 
                      }} 
                      style={{
                        ...buttonStyle,
                        minWidth: 'fit-content',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {option.value === 'my_rating' ? (
                        <>
                          <span>My</span>
                          <span style={{ color: isActive ? theme.colors.white : theme.colors.primary }}>★</span>
                        </>
                      ) : option.value === 'community_rating' ? (
                        <>
                          <span>Community</span>
                          <span style={{ color: isActive ? theme.colors.white : theme.colors.ratingGold }}>★</span>
                        </>
                      ) : (
                        <span>{option.label}</span>
                      )}
                      {arrow && <span style={SCREEN_STYLES.menu.advancedSort.arrow}>{arrow}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BODY SECTION */}
      <div style={{
        backgroundColor: theme.colors.background,
        minHeight: '100vh',
        padding: showAdvancedSort ? '12px 0 24px 0' : '24px 0',
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        overflowX: 'hidden'
      }}>
        {isLoading ? (
          <LoadingScreen message="Loading your ratings..." />
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 8px',
            color: theme.colors.text,
            ...theme.fonts.body,
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            <p style={{ marginBottom: '16px', fontSize: '1.125rem' }}>{error}</p>
            <button onClick={loadRatedDishes} style={STYLES.primaryButton}>Try Again</button>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div style={{
            maxWidth: '448px',
            margin: '0 auto',
            padding: '0 16px'
          }}>
            {filteredDishes.map((item) => {
              const myRating = item.ratings.find((r) => r.user_id === user?.id);
              return <RatedDishCard key={item.id} item={item} myRating={myRating} />;
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '48px 8px',
            color: theme.colors.text,
            ...theme.fonts.body,
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            <p style={{ 
              marginBottom: '24px', 
              fontSize: '1.125rem',
              color: theme.colors.textSecondary 
            }}>
              {searchTerm ? `No matches found for "${searchTerm}".` : "You haven't rated any dishes yet."}
            </p>
            {!searchTerm && (
              <Link 
                to="/find-restaurant" 
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white,
                  textDecoration: 'none',
                  borderRadius: '8px',
                  ...theme.fonts.body,
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
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