// src/FindRestaurantScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import AddRestaurantForm from './components/restaurant/AddRestaurantForm';
import RestaurantCard from './components/restaurant/RestaurantCard';
import SearchResultsModal from './components/restaurant/SearchResultsModal';
import AccordionSection from './components/shared/AccordionSection';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';
import { useNearbyRestaurants } from './hooks/useNearbyRestaurants';
import { usePinnedRestaurants } from './hooks/usePinnedRestaurants';
import { GeoapifyPlace, useRestaurants } from './hooks/useRestaurants';
import { useRestaurantVisits } from './hooks/useRestaurantVisits';
import { Restaurant as RestaurantType, RestaurantWithPinStatus } from './types/restaurant';

const SEARCH_BAR_WIDTH = '390px'; // Adjustable: controls the max width of the search bar

const FindRestaurantScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(1);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { pinnedRestaurantIds, togglePin, getPinnedRestaurants } = usePinnedRestaurants();
  const { getRecentVisits } = useRestaurantVisits();
  const { loading: nearbyLoading, error: nearbyError, restaurants: nearbyRestaurants, fetchNearbyRestaurants } = useNearbyRestaurants();
  const {
    searchResults,
    isSearching,
    clearSearchResults,
    getOrCreateRestaurant,
    resetSearch,
    addRestaurant,
    searchRestaurants
  } = useRestaurants({
    sortBy: { criterion: 'name', direction: 'asc' },
    userLat: userLocation?.latitude,
    userLon: userLocation?.longitude,
    initialFetch: false,
  });
  const [recentRestaurants, setRecentRestaurants] = useState<RestaurantType[]>([]);
  const [pinnedRestaurants, setPinnedRestaurants] = useState<RestaurantType[]>([]);
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setHasLocationPermission(true);
      },
      () => {
        setHasLocationPermission(false);
      }
    );
  }, []);
  const handleSectionClick = useCallback(async (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      setIsLoadingSection(true);
      if (section === 'recents') {
        const visits = await getRecentVisits();
        setRecentRestaurants(visits as RestaurantType[]);
      } else if (section === 'pinned') {
        const pins = await getPinnedRestaurants();
        setPinnedRestaurants(pins);
      } else if (section === 'nearby' && userLocation) {
        await fetchNearbyRestaurants({ ...userLocation, radiusInMiles: nearbyRadius });
      }
      setIsLoadingSection(false);
    }
  }, [expandedSection, getRecentVisits, getPinnedRestaurants, fetchNearbyRestaurants, userLocation, nearbyRadius]);
  const handleRestaurantClick = async (place: GeoapifyPlace) => {
    setSearchModalOpen(false);
    const dbRestaurant = await getOrCreateRestaurant(place);
    if(dbRestaurant) {
      navigate(`/restaurants/${dbRestaurant.id}`);
    } else {
      alert("There was a problem loading this restaurant. Please try again.");
    }
  };
  const handleModalClose = () => {
    setSearchModalOpen(false);
    resetSearch();
  };
  const handleManualAddClick = () => {
    setSearchModalOpen(false);
    setShowAddForm(true);
    resetSearch();
  };
  const handleSaveNewRestaurant = async (data: Omit<RestaurantType, 'id' | 'created_at'>) => {
    const result = await addRestaurant(data);
    if (result) {
        setShowAddForm(false);
        alert('Restaurant added successfully! You can find it in the "Recents" section after visiting its page.');
    } else {
        alert('Failed to add restaurant. It might already exist.');
    }
  };
  useEffect(() => {
    if (expandedSection === 'nearby' && userLocation) {
      fetchNearbyRestaurants({ ...userLocation, radiusInMiles: nearbyRadius });
    }
  }, [nearbyRadius, expandedSection, userLocation, fetchNearbyRestaurants]);
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* HEADER SECTION - This div will be full-width */}
      <div style={{
        backgroundColor: COLORS.navBarDark,
        flexShrink: 0,
        // The "Full Bleed" Trick
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}>
        {/* INNER HEADER - This div centers the content and adds padding for the nav bar */}
        <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center" style={{paddingTop: `calc(60px + ${SPACING[4]})`, paddingBottom: SPACING[6]}}>
            <img
                src="/finding_restaurant.png"
                alt="Finding Restaurant"
                style={{
                  width: '160px',
                  marginTop: SPACING[4],
                  marginBottom: SPACING[4],
                  height: 'auto',
                  objectFit: 'contain',
                }}
            />
            <h1 style={{...TYPOGRAPHY.h1, color: COLORS.textWhite, marginBottom: SPACING[6]}}>
                Find a restaurant
            </h1>
            {/* SEARCH BAR WIDTH CONTROL */}
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
      {/* BODY SECTION - This div will contain the scrollable content and be centered */}
      <div className="w-full max-w-lg mx-auto p-4">
        {hasLocationPermission === false && expandedSection === 'nearby' && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Location services are disabled. Enable them in your browser or system settings to see nearby restaurants.
            </p>
          </div>
        )}
        {showAddForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 style={{ ...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500' }}>Add New Restaurant</h2>
              </div>
              <AddRestaurantForm onSave={handleSaveNewRestaurant} onCancel={() => setShowAddForm(false)} />
            </div>
        ) : (
          <div className="space-y-2">
            <AccordionSection
              title="Recents"
              isExpanded={expandedSection === 'recents'}
              onClick={() => handleSectionClick('recents')}
              isEmpty={!isLoadingSection && recentRestaurants.length === 0}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="space-y-2 p-4">
                {isLoadingSection && expandedSection === 'recents' ? <LoadingScreen message="Loading..."/> :
                recentRestaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant as RestaurantWithPinStatus}
                    isPinned={pinnedRestaurantIds.has(restaurant.id)}
                    onTogglePin={togglePin}
                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    onNavigateToMenu={() => navigate(`/restaurants/${restaurant.id}`)}
                    currentUserId={user?.id || null}
                  />
                ))}
              </div>
            </AccordionSection>
            <AccordionSection
              title="Nearby"
              isExpanded={expandedSection === 'nearby'}
              onClick={() => handleSectionClick('nearby')}
              isDisabled={!hasLocationPermission}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="p-4">
                  {nearbyError && <p className="text-sm text-red-700">{nearbyError}</p>}
                <div className="mb-4 flex items-center gap-2">
                  <label className="text-sm text-gray-600">Radius:</label>
                  <select
                    value={nearbyRadius}
                    onChange={(e) => setNearbyRadius(Number(e.target.value))}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value={0.5}>0.5 miles</option>
                    <option value={1}>1 mile</option>
                    <option value={2}>2 miles</option>
                    <option value={5}>5 miles</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {nearbyLoading ? <LoadingScreen message="Finding restaurants..."/> :
                  nearbyRestaurants.map(restaurant => (
                    <RestaurantCard
                      key={restaurant.geoapify_place_id}
                      restaurant={restaurant as RestaurantWithPinStatus}
                      isPinned={restaurant.id ? pinnedRestaurantIds.has(restaurant.id) : false}
                      onTogglePin={restaurant.id ? togglePin : undefined}
                      onClick={() => handleRestaurantClick(restaurant as unknown as GeoapifyPlace)}
                      onNavigateToMenu={() => handleRestaurantClick(restaurant as unknown as GeoapifyPlace)}
                      currentUserId={user?.id || null}
                    />
                  ))}
                </div>
              </div>
            </AccordionSection>
            <AccordionSection
              title="Pinned"
              isExpanded={expandedSection === 'pinned'}
              onClick={() => handleSectionClick('pinned')}
              isEmpty={!isLoadingSection && pinnedRestaurants.length === 0}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="space-y-2 p-4">
                  {isLoadingSection && expandedSection === 'pinned' ? <LoadingScreen message="Loading..."/> :
                  pinnedRestaurants.map(restaurant => (
                      <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant as RestaurantWithPinStatus}
                          isPinned={true}
                          onTogglePin={togglePin}
                          onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                          onNavigateToMenu={() => navigate(`/restaurants/${restaurant.id}`)}
                          currentUserId={user?.id || null}
                      />
                  ))}
              </div>
            </AccordionSection>
          </div>
        )}
      </div>
      <SearchResultsModal
        isOpen={searchModalOpen}
        onClose={handleModalClose}
        results={searchResults}
        onRestaurantClick={handleRestaurantClick}
        isSearching={isSearching}
        onManualAddClick={handleManualAddClick}
        pinnedRestaurantIds={pinnedRestaurantIds}
        onTogglePin={togglePin}
        searchRestaurants={searchRestaurants}
        userLocation={userLocation}
        clearSearchResults={clearSearchResults}
        resetSearch={resetSearch}
      />
    </div>
  );
};
export default FindRestaurantScreen;