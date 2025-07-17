// src/FindRestaurantScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import AddRestaurantForm from './components/restaurant/AddRestaurantForm';
import DuplicateRestaurantModal from './components/restaurant/DuplicateRestaurantModal';
import RestaurantCard from './components/restaurant/RestaurantCard';
import SearchResultsModal from './components/restaurant/SearchResultsModal';
import AccordionSection from './components/shared/AccordionSection';
import { COLORS, FONTS, RESTAURANT_CARD_MAX_WIDTH, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';
import { useLocationService } from './hooks/useLocationService';
import { useNearbyRestaurants } from './hooks/useNearbyRestaurants';
import { usePinnedRestaurants } from './hooks/usePinnedRestaurants';
import { useRestaurants } from './hooks/useRestaurants';
import { useRestaurantVisits } from './hooks/useRestaurantVisits';
import { verifyRestaurantExists } from './services/restaurantDataService';
import { Restaurant as RestaurantType, RestaurantWithPinStatus } from './types/restaurant';
import type { GeoapifyPlace } from './types/restaurantSearch';
import { calculateDistanceInMiles, formatDistanceMiles } from './utils/geolocation';

const SEARCH_BAR_WIDTH = '350px';
const LOCATION_INTERACTION_KEY = 'locationInteractionDone';

const FindRestaurantScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    coordinates: userLocation,
    isAvailable: hasLocationPermission,
    status: locationStatus,
    requestLocation,
    openPermissionModal,
  } = useLocationService();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualAddInitialName, setManualAddInitialName] = useState('');
  const { getPinnedRestaurants, pinnedRestaurantIds, togglePin, refreshPinned } = usePinnedRestaurants();
  const { getRecentVisits, trackVisit } = useRestaurantVisits();
  const { loading: nearbyLoading, error: nearbyError, restaurants: nearbyRestaurants, fetchNearbyRestaurants, setRestaurants: setNearbyRestaurants, clearCacheForLocation } = useNearbyRestaurants();
  const {
    searchResults,
    isSearching,
    clearSearchResults,
    getOrCreateRestaurant,
    resetSearch,
    addRestaurant,
    searchRestaurants,
    findSimilarRestaurants,
    addToFavorites,
  } = useRestaurants({
    sortBy: { criterion: 'name', direction: 'asc' },
    userLat: userLocation?.latitude,
    userLon: userLocation?.longitude,
    initialFetch: false,
  });
  const [recentRestaurants, setRecentRestaurants] = useState<RestaurantWithPinStatus[]>([]);
  const [pinnedRestaurants, setPinnedRestaurants] = useState<RestaurantWithPinStatus[]>([]);
  const [areInitialSectionsLoading, setAreInitialSectionsLoading] = useState(true);
  const [similarRestaurants, setSimilarRestaurants] = useState<RestaurantType[]>([]);
  const [newRestaurantData, setNewRestaurantData] = useState<Omit<RestaurantType, 'id' | 'created_at' | 'updated_at'> | null>(null);
  const isAdmin = !!(user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email));

  useEffect(() => {
    // This effect handles showing the permission modal automatically ONCE per session.
    // It waits until the status is no longer 'requesting'.
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
  }, [locationStatus, user, openPermissionModal, requestLocation]);

  const loadInitialData = useCallback(async () => {
    if (user) {
      setAreInitialSectionsLoading(true);
      const [recents, pinned] = await Promise.all([getRecentVisits(), getPinnedRestaurants()]);
      setRecentRestaurants(recents as RestaurantWithPinStatus[]);
      setPinnedRestaurants(pinned as RestaurantWithPinStatus[]);
      setAreInitialSectionsLoading(false);
    }
  }, [user, getRecentVisits, getPinnedRestaurants]);

  useEffect(() => {
    loadInitialData();
  }, [user, loadInitialData]);

  const addDistanceToRestaurants = useCallback((restaurants: RestaurantWithPinStatus[]) => {
    if (!userLocation) return restaurants;
    return restaurants.map(r => {
      let distance;
      if (r.latitude && r.longitude) {
        const distMiles = calculateDistanceInMiles(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude);
        distance = formatDistanceMiles(distMiles);
      }
      return { ...r, distance };
    });
  }, [userLocation]);

  const recentsWithDistance = useMemo(() => addDistanceToRestaurants(recentRestaurants), [recentRestaurants, addDistanceToRestaurants]);
  const pinnedWithDistance = useMemo(() => addDistanceToRestaurants(pinnedRestaurants), [pinnedRestaurants, addDistanceToRestaurants]);
  const nearbyWithDistance = useMemo(() => addDistanceToRestaurants(nearbyRestaurants), [nearbyRestaurants, addDistanceToRestaurants]);

  const handleSectionClick = useCallback(async (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      if (section === 'nearby' && userLocation) {
        await fetchNearbyRestaurants({ ...userLocation, radiusInMiles: nearbyRadius });
      }
    }
  }, [expandedSection, userLocation, nearbyRadius, fetchNearbyRestaurants]);

  const handleNearbyClick = useCallback(() => {
    if (hasLocationPermission) {
      handleSectionClick('nearby');
    } else {
      requestLocation();
    }
  }, [hasLocationPermission, requestLocation, handleSectionClick]);

  const ensureDbRestaurant = useCallback(async (placeOrRestaurant: GeoapifyPlace | RestaurantType): Promise<RestaurantType | null> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if ('id' in placeOrRestaurant && uuidRegex.test(placeOrRestaurant.id) && !('properties' in placeOrRestaurant)) {
        return placeOrRestaurant as RestaurantType;
    }

    let geoapifyPlace: GeoapifyPlace;

    if ('properties' in placeOrRestaurant && placeOrRestaurant.properties) {
        geoapifyPlace = placeOrRestaurant as GeoapifyPlace;
    } else {
        const r = placeOrRestaurant as RestaurantType;
        geoapifyPlace = {
            place_id: r.geoapify_place_id || r.id,
            properties: {
                name: r.name,
                formatted: r.full_address || '',
                address_line1: r.address || undefined,
                city: r.city || undefined,
                state: r.state || undefined,
                postcode: r.zip_code || undefined,
                country: r.country || undefined,
                lat: r.latitude!,
                lon: r.longitude!,
                categories: r.category ? r.category.split(',') : [],
                website: r.website_url || undefined,
                phone: r.phone || undefined,
                contact: {
                    website: r.website_url || undefined,
                    phone: r.phone || undefined,
                },
                datasource: {
                    sourcename: 'geoapify',
                    attribution: 'Geoapify, OpenStreetMap',
                },
            },
        };
    }
   
    return await getOrCreateRestaurant(geoapifyPlace);
  }, [getOrCreateRestaurant]);

  const handleSmartNavigation = useCallback(async (restaurant: RestaurantWithPinStatus) => {
      const exists = await verifyRestaurantExists(restaurant.id);

      if (exists) {
          trackVisit(restaurant.id);
          navigate(`/restaurants/${restaurant.id}`);
          return;
      }
     
      console.log(`Restaurant ${restaurant.name} (${restaurant.id}) not found in DB. Attempting to self-heal.`);
      const dbRestaurant = await ensureDbRestaurant(restaurant);

      if (dbRestaurant) {
          console.log(`Successfully re-created/found restaurant as ${dbRestaurant.id}. Navigating.`);
          const updatedNearby = nearbyRestaurants.map(r => r.id === restaurant.id ? dbRestaurant : r);
          setNearbyRestaurants(updatedNearby as RestaurantWithPinStatus[]);
         
          trackVisit(dbRestaurant.id);
          navigate(`/restaurants/${dbRestaurant.id}`);
      } else {
          alert("We couldn't find this restaurant. It may have been removed. Please refresh the list.");
          if (userLocation) {
              clearCacheForLocation({ ...userLocation, radiusInMiles: nearbyRadius });
              await fetchNearbyRestaurants({ ...userLocation, radiusInMiles: nearbyRadius });
          }
      }
  }, [navigate, trackVisit, ensureDbRestaurant, nearbyRestaurants, setNearbyRestaurants, userLocation, nearbyRadius, clearCacheForLocation, fetchNearbyRestaurants]);
 
  const handleRestaurantClick = async (place: GeoapifyPlace | RestaurantWithPinStatus) => {
    setSearchModalOpen(false);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if ('id' in place && uuidRegex.test(place.id) && !('properties' in place)) {
      await handleSmartNavigation(place as RestaurantWithPinStatus);
      return;
    }
    const dbRestaurant = await ensureDbRestaurant(place);
    if (dbRestaurant) {
      trackVisit(dbRestaurant.id);
      navigate(`/restaurants/${dbRestaurant.id}`);
    } else {
      alert("There was a problem loading this restaurant. Please try again.");
    }
  };

  const handleTogglePin = useCallback(async (restaurantToToggle: RestaurantWithPinStatus) => {
    const originalId = restaurantToToggle.id;
    const dbRestaurant = await ensureDbRestaurant(restaurantToToggle);

    if (!dbRestaurant) {
        alert("Could not save restaurant. Please try again.");
        return;
    }

    const dbId = dbRestaurant.id;
    const isCurrentlyPinned = pinnedRestaurantIds.has(dbId);
   
    const success = await togglePin(dbId);

    if (success) {
        if (isCurrentlyPinned) {
            setPinnedRestaurants(prev => prev.filter(p => p.id !== dbId));
        } else {
            const newPinnedItem = { ...dbRestaurant, distance: restaurantToToggle.distance };
            setPinnedRestaurants(prev => {
                if (prev.some(p => p.id === dbId)) return prev;
                return [...prev, newPinnedItem];
            });
        }
       
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(originalId)) {
            const updater = (prevList: RestaurantWithPinStatus[]) => prevList.map(r =>
                r.id === originalId
                  ? { ...dbRestaurant, distance: r.distance }
                  : r
            );
            setNearbyRestaurants(updater);
            setRecentRestaurants(updater);
           
            if (userLocation) {
                clearCacheForLocation({ ...userLocation, radiusInMiles: nearbyRadius });
            }
        }
    } else {
       await refreshPinned();
       await loadInitialData();
    }
  }, [pinnedRestaurantIds, ensureDbRestaurant, togglePin, refreshPinned, loadInitialData, setNearbyRestaurants, setRecentRestaurants, userLocation, nearbyRadius, clearCacheForLocation]);
 
  const handleModalClose = () => {
    setSearchModalOpen(false);
    resetSearch();
  };

  const handleManualAddClick = (searchTerm: string) => {
    setSearchModalOpen(false);
    setShowAddForm(true);
    setManualAddInitialName(searchTerm);
    resetSearch();
  };
 
  const createNewRestaurant = async (data: Omit<RestaurantType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await addRestaurant(data);
      if (result && typeof result !== 'boolean') {
        setShowAddForm(false);
        setSimilarRestaurants([]);
        setNewRestaurantData(null);
        trackVisit(result.id);
        navigate(`/restaurants/${result.id}`);
      } else {
        throw new Error('Restaurant could not be created. It may already exist.');
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  };

  const handleSaveNewRestaurant = async (data: Omit<RestaurantType, 'id' | 'created_at' | 'updated_at'>) => {
    const similar = await findSimilarRestaurants(data.name, data.address || undefined);
    if (similar.length > 0) {
      setNewRestaurantData(data);
      setSimilarRestaurants(similar);
    } else {
      await createNewRestaurant(data);
    }
  };

  const handleCloseDuplicateModal = () => {
    setSimilarRestaurants([]);
    setNewRestaurantData(null);
  };

  const handleUseExistingRestaurant = async (restaurant: RestaurantType) => {
    await addToFavorites(restaurant);
    handleCloseDuplicateModal();
    setShowAddForm(false);
    trackVisit(restaurant.id);
    navigate(`/restaurants/${restaurant.id}`);
  };
 
  useEffect(() => {
    if (expandedSection === 'nearby' && userLocation) {
      fetchNearbyRestaurants({ ...userLocation, radiusInMiles: nearbyRadius });
    }
  }, [nearbyRadius, expandedSection, userLocation, fetchNearbyRestaurants]);

  const getIsPinned = (restaurant: RestaurantWithPinStatus) => {
      return !!restaurant.id && pinnedRestaurantIds.has(restaurant.id);
  }

  const handleRefreshNearby = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userLocation || nearbyLoading || !hasLocationPermission) return;

    clearCacheForLocation({ ...userLocation, radiusInMiles: nearbyRadius });
    await fetchNearbyRestaurants({ ...userLocation, radiusInMiles: nearbyRadius });
  }, [userLocation, nearbyLoading, hasLocationPermission, clearCacheForLocation, nearbyRadius, fetchNearbyRestaurants]);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        backgroundColor: COLORS.navBarDark,
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: SPACING[6],
      }}>
        <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center" style={{paddingTop: `calc(60px + ${SPACING[4]})`, paddingBottom: SPACING[6]}}>
            <img
                src="/finding_restaurant.png"
                alt="Finding Restaurant"
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
                Find a restaurant
            </h1>
            <div className="w-full" style={{ maxWidth: SEARCH_BAR_WIDTH }}>
                <div
                    onClick={() => setSearchModalOpen(true)}
                    style={{...STYLES.input, cursor: 'pointer', color: COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: SPACING[2]}}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <span>Search online...</span>
                </div>
            </div>
        </div>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div className="w-full mx-auto p-4" style={{ maxWidth: RESTAURANT_CARD_MAX_WIDTH }}>
          {showAddForm ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 style={{ ...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500' }}>Add New Restaurant</h2>
                </div>
                <AddRestaurantForm
                  onSave={handleSaveNewRestaurant}
                  onCancel={() => {
                    setShowAddForm(false);
                    setManualAddInitialName('');
                  }}
                  initialName={manualAddInitialName}
                />
              </div>
          ) : (
            <div className="space-y-2">
              <AccordionSection
                title="Recents"
                isExpanded={expandedSection === 'recents'}
                onClick={() => handleSectionClick('recents')}
                isEmpty={areInitialSectionsLoading ? false : recentsWithDistance.length === 0}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="p-4 pt-2 space-y-0">
                  {areInitialSectionsLoading && expandedSection === 'recents' ? <LoadingScreen message="Loading..."/> :
                  recentsWithDistance.map(restaurant => (
                    <RestaurantCard
                      key={`recents-${restaurant.id}`}
                      restaurant={restaurant}
                      isPinned={getIsPinned(restaurant)}
                      onTogglePin={handleTogglePin}
                      onClick={() => handleSmartNavigation(restaurant)}
                      onNavigateToMenu={() => handleSmartNavigation(restaurant)}
                      currentUserId={user?.id || null}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </AccordionSection>
              
              <div onClick={handleNearbyClick}>
                <AccordionSection
                  title="Nearby"
                  isExpanded={expandedSection === 'nearby'}
                  onClick={hasLocationPermission ? () => handleSectionClick('nearby') : () => {}}
                  isDisabled={!hasLocationPermission}
                  className="bg-white rounded-lg shadow-sm"
                  headerAccessory={
                    expandedSection === 'nearby' ? (
                      <button
                        onClick={handleRefreshNearby}
                        disabled={nearbyLoading || !hasLocationPermission}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: (nearbyLoading || !hasLocationPermission) ? 0.5 : 1,
                        }}
                        aria-label="Refresh nearby restaurants"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={COLORS.textSecondary}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            animation: nearbyLoading ? 'spin 1s linear infinite' : 'none',
                          }}
                        >
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                      </button>
                    ) : null
                  }
                >
                  <div className="p-4">
                      {nearbyError && <p className="text-sm text-red-700">{nearbyError}</p>}
                    <div className="flex items-center" style={{ marginBottom: '1rem' }}>
                      <label style={{ ...FONTS.elegant, color: COLORS.accent, fontSize: '1rem', fontWeight: 500, marginLeft: '16px', marginRight: '12px' }}>
                          Distance:
                      </label>
                      <select
                        value={nearbyRadius}
                        onChange={(e) => setNearbyRadius(Number(e.target.value))}
                        style={{
                          border: `1px solid ${COLORS.gray300}`, borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.875rem',
                          backgroundColor: COLORS.white, cursor: 'pointer', appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2rem',
                        }}
                      >
                        <option value={0.5}>0.5 miles</option>
                        <option value={1}>1 mile</option>
                        <option value={2}>2 miles</option>
                        <option value={5}>5 miles</option>
                      </select>
                    </div>
                    <div className="space-y-0">
                      {nearbyLoading ? <LoadingScreen message="Finding restaurants..."/> :
                      nearbyWithDistance.map(restaurant => (
                        <RestaurantCard
                          key={`nearby-${restaurant.id}`}
                          restaurant={restaurant}
                          isPinned={getIsPinned(restaurant)}
                          onTogglePin={handleTogglePin}
                          onClick={() => handleRestaurantClick(restaurant)}
                          onNavigateToMenu={() => handleRestaurantClick(restaurant)}
                          currentUserId={user?.id || null}
                          isAdmin={isAdmin}
                        />
                      ))}
                    </div>
                  </div>
                </AccordionSection>
              </div>

              <AccordionSection
                title="Pinned"
                isExpanded={expandedSection === 'pinned'}
                onClick={() => handleSectionClick('pinned')}
                isEmpty={areInitialSectionsLoading ? false : pinnedWithDistance.length === 0}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="p-4 pt-2 space-y-0">
                    {areInitialSectionsLoading && expandedSection === 'pinned' ? <LoadingScreen message="Loading..."/> :
                    pinnedWithDistance.map(restaurant => (
                        <RestaurantCard
                            key={`pinned-${restaurant.id}`}
                            restaurant={restaurant}
                            isPinned={getIsPinned(restaurant)}
                            onTogglePin={handleTogglePin}
                            onClick={() => handleSmartNavigation(restaurant)}
                            onNavigateToMenu={() => handleSmartNavigation(restaurant)}
                            currentUserId={user?.id || null}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
              </AccordionSection>
            </div>
          )}
        </div>
      </div>
      <SearchResultsModal
        isOpen={searchModalOpen}
        onClose={handleModalClose}
        results={searchResults}
        onRestaurantClick={handleRestaurantClick}
        isSearching={isSearching}
        onManualAddClick={handleManualAddClick}
        pinnedRestaurantIds={pinnedRestaurantIds}
        onTogglePin={handleTogglePin}
        searchRestaurants={searchRestaurants}
        userLocation={userLocation}
        clearSearchResults={clearSearchResults}
        resetSearch={resetSearch}
      />
      <DuplicateRestaurantModal
        isOpen={similarRestaurants.length > 0}
        onCancel={handleCloseDuplicateModal}
        onCreateNew={() => newRestaurantData && createNewRestaurant(newRestaurantData)}
        onUseExisting={handleUseExistingRestaurant}
        newRestaurantName={newRestaurantData?.name || ''}
        similarRestaurants={similarRestaurants}
      />
    </div>
  );
};
export default FindRestaurantScreen;