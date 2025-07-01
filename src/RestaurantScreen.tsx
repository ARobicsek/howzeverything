// src/RestaurantScreen.tsx - MODIFIED
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import AdvancedRestaurantSearchForm from './components/restaurant/AdvancedRestaurantSearchForm';
import EditRestaurantForm from './components/restaurant/EditRestaurantForm';
import RestaurantCard from './components/restaurant/RestaurantCard';
import { COLORS, FONTS, SPACING, STYLES } from './constants';
import { useAuth } from './hooks/useAuth';
import type { AdvancedSearchQuery } from './hooks/useRestaurants';
import { useRestaurants } from './hooks/useRestaurants';
import type { Restaurant } from './types/restaurant';


interface RestaurantScreenProps {        
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;        
  onNavigateToMenu: (restaurantId: string) => void;        
  currentAppScreen: GlobalAppScreenType;        
}


// NEW: Helper hook to get the previous value of a prop or state
const usePrevious = (value: boolean): boolean | undefined => {
    const ref = React.useRef<boolean | undefined>(undefined);
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};


// Device and browser detection utilities
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  let browser = 'Browser';
  if (isIOS) {
    if (ua.includes('CriOS') || ua.includes('Chrome')) {
      browser = 'Chrome';
    } else if (ua.includes('FxiOS') || ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('EdgiOS') || ua.includes('Edge')) {
      browser = 'Edge';
    } else if (ua.includes('Safari')) {
      browser = 'Safari';
    }
  } else {
    if (ua.includes('Edg')) {
      browser = 'Edge';
    } else if (ua.includes('Chrome')) {
      browser = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Safari')) {
      browser = 'Safari';
    }
  }
  return {
    isIOS,
    isAndroid,
    browser,
    os: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Unknown'
  };
};


// NEW: Enhanced Location Permission Banner Component with OS/Browser Detection    
const LocationPermissionBanner: React.FC<{    
  onRequestPermission: () => void;    
  isRequestingLocationPermission: boolean;    
  isPermissionBlocked: boolean;    
}> = ({ onRequestPermission, isRequestingLocationPermission, isPermissionBlocked }) => {
  const deviceInfo = getDeviceInfo();
  const handleClick = () => {    
    if (isPermissionBlocked) {    
      const { isIOS, isAndroid, browser } = deviceInfo;
      let instructions = '';
      if (isIOS) {
        instructions =
          `Location access is blocked in your device settings.\n\n` +
          `To enable location services on ${deviceInfo.os}:\n\n` +
          `⚙️ Open Settings\n` +
          `🔒 Tap Privacy & Security\n` +
          `📍 Tap Location Services\n` +
          `📱 Find and tap "${browser}"\n` +
          `✅ Select "Ask Next Time" or "While Using App"\n` +
          `🔄 Return to this page and refresh`;
      } else if (isAndroid) {
        instructions =
          `Location access is blocked in your device settings.\n\n` +
          `To enable location services on Android:\n\n` +
          `Method 1 (Recommended):\n` +
          `⚙️ Open Settings\n` +
          `📍 Tap Location (or Privacy > Location)\n` +
          `📱 Tap App permissions\n` +
          `🔍 Find and tap "${browser}"\n` +
          `✅ Select "Allow only while using the app"\n\n` +
          `Method 2 (Alternative):\n` +
          `⚙️ Open Settings\n` +
          `📱 Tap Apps (or Application Manager)\n` +
          `🔍 Find and tap "${browser}"\n` +
          `🔒 Tap Permissions\n` +
          `📍 Tap Location and select "Allow"\n\n` +
          `🔄 Return to this page and refresh`;
      } else {
        instructions =
          `Location access is blocked in your device settings.\n\n` +
          `To enable location services:\n\n` +
          `1. Open your device Settings\n` +
          `2. Look for Privacy, Location, or App Permissions\n` +
          `3. Find ${browser} in the app list\n` +
          `4. Enable location permission\n` +
          `5. Return to this page and refresh\n\n` +
          `Note: Steps may vary by device and operating system.`;
      }
      alert(instructions);
    } else {    
      onRequestPermission();    
    }    
  };
  return (    
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4" style={{ marginBottom: SPACING[4] }}>    
      <div className="flex items-start gap-3">    
        <div className="flex-shrink-0 mt-0.5">    
          <svg    
            width="20"    
            height="20"    
            viewBox="0 0 24 24"    
            fill="none"    
            stroke={COLORS.primary}    
            strokeWidth="2"    
            strokeLinecap="round"    
            strokeLinejoin="round"    
          >    
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>    
            <circle cx="12" cy="10" r="3"></circle>    
          </svg>    
        </div>    
        <div className="flex-1">    
          <p style={{    
            ...FONTS.primary,    
            fontSize: '15px',    
            lineHeight: '1.5',    
            color: COLORS.gray700,    
            margin: 0    
          }}>    
            Your experience will be better with location services{' '}    
            <button    
              onClick={handleClick}    
              disabled={isRequestingLocationPermission && !isPermissionBlocked}    
              className="inline-flex items-center gap-1 transition-all duration-200 focus:outline-none"    
              style={{    
                color: COLORS.primary,    
                fontWeight: '600',    
                textDecoration: 'none',    
                background: 'none',    
                border: 'none',    
                padding: '0',    
                cursor: (isRequestingLocationPermission && !isPermissionBlocked) ? 'default' : 'pointer',    
                borderBottom: `1px solid ${COLORS.primary}`,    
                opacity: (isRequestingLocationPermission && !isPermissionBlocked) ? 0.6 : 1    
              }}    
              onMouseEnter={(e) => {    
                if (!isRequestingLocationPermission || isPermissionBlocked) {
                  e.currentTarget.style.borderBottomColor = COLORS.primaryHover;    
                  e.currentTarget.style.color = COLORS.primaryHover;    
                }    
              }}    
              onMouseLeave={(e) => {    
                if (!isRequestingLocationPermission || isPermissionBlocked) {
                  e.currentTarget.style.borderBottomColor = COLORS.primary;    
                  e.currentTarget.style.color = COLORS.primary;    
                }    
              }}    
            >    
              {isRequestingLocationPermission && !isPermissionBlocked ? (
                <>    
                  <span>requesting...</span>    
                  <div className="animate-spin">    
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">    
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>    
                    </svg>    
                  </div>    
                </>    
              ) : (    
                <>    
                  <span>{isPermissionBlocked ? 'blocked - tap for help' : 'turned on'}</span>    
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">    
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>    
                  </svg>    
                </>    
              )}    
            </button>    
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              fontSize: '11px',
              color: COLORS.gray500,
              marginTop: '4px',
              fontFamily: 'monospace'
            }}>
              Detected: {deviceInfo.os} - {deviceInfo.browser}
            </div>
          )}
        </div>    
      </div>    
    </div>    
  );    
};


// Enhanced Add Restaurant Form with pre-filled search term (like MenuScreen)        
const EnhancedAddRestaurantForm: React.FC<{        
  initialRestaurantName?: string;        
  onSubmit: (name: string) => Promise<void>;        
  onCancel: () => void;        
}> = ({ initialRestaurantName = '', onSubmit, onCancel }) => {        
  const [restaurantName, setRestaurantName] = useState(initialRestaurantName);
  const handleSubmit = async () => {        
    if (restaurantName.trim()) {        
      await onSubmit(restaurantName);        
      setRestaurantName('');        
    }        
  };
  return (        
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4 w-full max-w-full overflow-hidden">        
      <div>        
        <input        
          type="text"        
          value={restaurantName}        
          onChange={(e) => setRestaurantName(e.target.value)}        
          placeholder="Enter the restaurant name..."        
          className="w-full max-w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50"        
          style={{        
            ...FONTS.elegant,        
            fontSize: '1rem',        
            backgroundColor: 'white',        
            color: COLORS.text,
            boxSizing: 'border-box',        
            minWidth: 0        
          }}        
          autoFocus        
          onKeyPress={(e) => {        
            if (e.key === 'Enter' && restaurantName.trim()) handleSubmit();        
          }}        
        />        
      </div>
      <div className="flex gap-3 w-full max-w-full">        
        <button        
          onClick={handleSubmit}        
          disabled={!restaurantName.trim()}        
          className="flex-1 py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"        
          style={{        
            ...STYLES.addButton,        
            backgroundColor: !restaurantName.trim() ? COLORS.gray300 : COLORS.primary,
            fontSize: '0.9rem'        
          }}        
          onMouseEnter={(e) => {        
            if (restaurantName.trim()) (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryHover;        
          }}        
          onMouseLeave={(e) => {        
            if (restaurantName.trim()) (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary;        
          }}        
        >        
          Add Restaurant        
        </button>        
        <button        
          onClick={onCancel}        
          className="flex-1 py-3 px-4 rounded-xl transition-colors"        
          style={STYLES.secondaryButton}        
        >        
          Cancel        
        </button>        
      </div>        
    </div>        
  );        
};


// NEW: Enhanced Search Animation Component      
const SearchingIndicator: React.FC = () => {      
  const [dotCount, setDotCount] = useState(1);      
  const [pulsePhase, setPulsePhase] = useState(0);
  useEffect(() => {      
    const dotInterval = setInterval(() => {      
      setDotCount(prev => prev >= 3 ? 1 : prev + 1);      
    }, 600);
    const pulseInterval = setInterval(() => {      
      setPulsePhase(prev => (prev + 1) % 4);      
    }, 200);
    return () => {      
      clearInterval(dotInterval);      
      clearInterval(pulseInterval);      
    };      
  }, []);
  const dots = '•'.repeat(dotCount).padEnd(3, ' ');      
  const pulseOpacity = 0.3 + (Math.sin(pulsePhase * Math.PI / 2) * 0.4);
  return (      
    <div style={{      
      marginTop: '8px',      
      display: 'flex',      
      alignItems: 'center',      
      gap: '8px',      
      padding: '8px 12px',      
      borderRadius: '8px',      
      backgroundColor: 'rgba(255, 255, 255, 0.1)',      
      border: `1px solid rgba(255, 255, 255, 0.2)`,      
      animation: 'pulse 2s ease-in-out infinite'      
    }}>      
      <div style={{      
        width: '16px',      
        height: '16px',      
        borderRadius: '50%',      
        backgroundColor: COLORS.primary,      
        opacity: pulseOpacity,      
        transform: `scale(${0.8 + pulseOpacity * 0.4})`,      
        transition: 'all 0.2s ease',      
        display: 'flex',      
        alignItems: 'center',      
        justifyContent: 'center'      
      }}>      
        <svg      
          width="10"      
          height="10"      
          viewBox="0 0 24 24"      
          fill="white"      
          style={{      
            opacity: 0.9,      
            transform: `rotate(${pulsePhase * 90}deg)`,      
            transition: 'transform 0.2s ease'      
          }}      
        >      
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>      
        </svg>      
      </div>      
      <span style={{      
        ...FONTS.elegant,      
        fontSize: '14px',      
        color: COLORS.text,      
        fontWeight: '500',      
        letterSpacing: '0.5px'      
      }}>      
        Searching the web{dots}      
      </span>      
    </div>      
  );      
};


// Fuzzy search algorithm for restaurant names (same as MenuScreen)        
const calculateRestaurantSimilarity = (restaurantName: string, searchTerm: string): number => {        
  const restaurant = restaurantName.toLowerCase().trim();        
  const search = searchTerm.toLowerCase().trim();        
  if (!search) return 100;
  if (restaurant === search) return 100;        
  if (restaurant.includes(search) || search.includes(restaurant)) return 95;        
  const restaurantWords = restaurant.split(/\s+/);        
  const searchWords = search.split(/\s+/);        
  let wordMatches = 0;        
  let partialMatches = 0;        
  searchWords.forEach(searchWord => {        
    if (restaurantWords.some(restaurantWord => restaurantWord === searchWord)) {        
      wordMatches++;        
    }        
    else if (restaurantWords.some(restaurantWord =>        
      restaurantWord.includes(searchWord) ||        
      searchWord.includes(restaurantWord) ||        
      restaurantWord.replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e') === searchWord        
    )) {        
      partialMatches++;        
    }        
  });        
  if (wordMatches > 0 || partialMatches > 0) {        
    const exactScore = (wordMatches / searchWords.length) * 80;        
    const partialScore = (partialMatches / searchWords.length) * 60;        
    return Math.min(95, 40 + exactScore + partialScore);        
  }        
  const longer = restaurant.length > search.length ? restaurant : search;        
  const shorter = restaurant.length > search.length ? search : restaurant;        
  if (longer.length === 0) return 100;        
  let matches = 0;        
  for (let i = 0; i < shorter.length; i++) {        
    if (longer.includes(shorter[i])) matches++;        
  }        
  const charSimilarity = (matches / longer.length) * 30;        
  return Math.max(0, charSimilarity);        
};


const RestaurantScreen: React.FC<RestaurantScreenProps> = ({        
  onNavigateToScreen,        
  onNavigateToMenu,        
  currentAppScreen        
}) => {
  const { user } = useAuth();
  // UI State        
  const [searchTerm, setSearchTerm] = useState('');        
  const [sortBy, setSortBy] = useState<{ criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' }>({ criterion: 'name', direction: 'asc' });        
  const [showAddForm, setShowAddForm] = useState(false);        
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);        
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);        
  const [addingRestaurantId, setAddingRestaurantId] = useState<string | null>(null);        
  const [pendingNavigation, setPendingNavigation] = useState(false);        
  const [hasInteractedWithEmptyState, setHasInteractedWithEmptyState] = useState(false);  
  const [lastSearchedTerm, setLastSearchedTerm] = useState('');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState<AdvancedSearchQuery>({ name: '', street: '', city: '' });
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isFocused, setIsFocused] = useState(false); // For input focus styling
  // User Geolocation State        
  const [userLat, setUserLat] = useState<number | null>(() => {    
    const saved = localStorage.getItem('howzeverything-user-location');    
    if (saved) {    
      try {    
        const { lat, lon } = JSON.parse(saved); // No longer checking timestamp
        console.log('📍 Restored saved location:', lat, lon);    
        return lat;    
      } catch (e) {    
        console.log('📍 Failed to parse saved location, will request fresh');    
      }    
    }    
    return null;    
  });        
  const [userLon, setUserLon] = useState<number | null>(() => {    
    const saved = localStorage.getItem('howzeverything-user-location');    
    if (saved) {    
      try {    
        const { lon } = JSON.parse(saved); // No longer checking timestamp
        return lon;    
      } catch (e) {
        // silent fail is fine, lat will also fail and handle logging
      }    
    }    
    return null;    
  });        
  const [fetchingLocation, setFetchingLocation] = useState(false);        
  const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);    
  const [shouldShowLocationBanner, setShouldShowLocationBanner] = useState(() => {  
    const saved = localStorage.getItem('howzeverything-user-location');  
    // Show banner only if location has *never* been saved.
    // The useEffect below will handle showing it if permissions are revoked.
    return !saved;  
  });    
  const [isLocationPermissionBlocked, setIsLocationPermissionBlocked] = useState(false);
  // Helper function to save location to localStorage    
  const saveLocationToStorage = useCallback((lat: number, lon: number) => {    
    try {    
      const locationData = { lat, lon, timestamp: Date.now() };    
      localStorage.setItem('howzeverything-user-location', JSON.stringify(locationData));    
      console.log('📍 Saved location to localStorage:', lat, lon);    
    } catch (e) {    
      console.warn('📍 Failed to save location to localStorage:', e);    
    }    
  }, []);
  // Custom Hooks        
  const {        
    restaurants,        
    isLoading,        
    error,        
    addRestaurant,        
    deleteRestaurant,        
    searchResults,        
    isSearching,        
    searchError,        
    restaurantErrors,        
    searchRestaurants,        
    importRestaurant,        
    clearSearchResults,        
    resetSearch,
    updateRestaurant,
  } = useRestaurants(sortBy, userLat, userLon);
  const wasSearching = usePrevious(isSearching);
  useEffect(() => {        
    return () => {        
      if (searchDebounceTimer) {        
        clearTimeout(searchDebounceTimer);        
      }        
    };        
  }, [searchDebounceTimer]);
  useEffect(() => {
    if (wasSearching && !isSearching) {
        setLastSearchedTerm(searchTerm);
    }
  }, [isSearching, wasSearching, searchTerm]);
  useEffect(() => {
    // This effect now directly attempts to get the location, which is the most
    // reliable way to check for permission across all browsers (especially Safari).
    if (!navigator.geolocation) {
      setFetchingLocation(false);
      // If geolocation is not supported at all, we might want to show a persistent message,
      // but for now, we just won't show the permission banner.
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // SUCCESS: Permission is granted.
        console.log('📍 getCurrentPosition success. Permission is granted.');
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLon(longitude);
        saveLocationToStorage(latitude, longitude);
        setShouldShowLocationBanner(false); // Hide banner
        setIsLocationPermissionBlocked(false);
        setFetchingLocation(false);
      },
      (error) => {
        // ERROR: Permission denied or another error occurred.
        console.error('📍 getCurrentPosition error:', error.message);
        setFetchingLocation(false);
        setShouldShowLocationBanner(true); // Show banner because we failed.
        if (error.code === error.PERMISSION_DENIED) {
          setIsLocationPermissionBlocked(true); // Mark as blocked for specific messaging.
        } else {
          setIsLocationPermissionBlocked(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Force a fresh check, do not use a cached position.
      }
    );
  }, [saveLocationToStorage]); // Only re-run if the save function changes (it won't).
  const [previousRestaurantCount, setPreviousRestaurantCount] = useState(0);        
  useEffect(() => {        
    if (pendingNavigation && restaurants.length > previousRestaurantCount) {        
      const newestRestaurant = restaurants.reduce((newest, restaurant) => {        
        return new Date(restaurant.dateAdded!) > new Date(newest.dateAdded!) ? restaurant : newest;
      });        
      onNavigateToMenu(newestRestaurant.id);        
      setPendingNavigation(false);        
    }        
    if (previousRestaurantCount === 0 && restaurants.length > 0) {        
      setHasInteractedWithEmptyState(false);        
    }        
    setPreviousRestaurantCount(restaurants.length);        
  }, [restaurants, pendingNavigation, previousRestaurantCount, onNavigateToMenu]);
  const filteredAndSortedRestaurants = useMemo(() => {        
    if (!searchTerm.trim()) {        
      return restaurants;        
    }
    const restaurantsWithScores = restaurants.map(restaurant => ({        
      ...restaurant,        
      similarityScore: calculateRestaurantSimilarity(restaurant.name, searchTerm)        
    }));
    const hasOnlineResults = searchResults.length > 0;        
    const similarityThreshold = hasOnlineResults ? 70 : 20;
    return restaurantsWithScores        
      .filter(restaurant => restaurant.similarityScore > similarityThreshold)        
      .sort((a, b) => b.similarityScore - a.similarityScore)        
      .map(({ similarityScore, ...restaurant }) => restaurant);
  }, [restaurants, searchTerm, searchResults.length]);
  const requestLocationPermission = useCallback(async () => {    
    if (!navigator.geolocation || isRequestingLocationPermission) return;    
    setIsRequestingLocationPermission(true);    
    try {    
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {    
        navigator.geolocation.getCurrentPosition(    
          resolve,    
          reject,    
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }    
        );    
      });    
      const lat = position.coords.latitude;  
      const lon = position.coords.longitude;  
      setUserLat(lat);    
      setUserLon(lon);    
      saveLocationToStorage(lat, lon);
      setShouldShowLocationBanner(false);    
      setIsLocationPermissionBlocked(false);  
      console.log('📍 User location permission granted:', lat, lon);    
    } catch (error: any) {    
      console.error('Error getting user location after request:', error);    
      if (error.code === error.PERMISSION_DENIED) {    
        setIsLocationPermissionBlocked(true);  
      }    
    } finally {    
      setIsRequestingLocationPermission(false);    
    }    
  }, [isRequestingLocationPermission, saveLocationToStorage]);
  const handleDistanceSort = useCallback(() => {        
    if (userLat === null || userLon === null) {        
      requestLocationPermission();        
      return;        
    }        
    setSortBy(prev => ({        
      criterion: 'distance',        
      direction: prev.criterion === 'distance' && prev.direction === 'asc' ? 'desc' : 'asc'        
    }));        
  }, [userLat, userLon, requestLocationPermission]);
  // Handlers        
  const handleAddRestaurant = useCallback(async (name: string) => {        
    const success = await addRestaurant(name);        
    if (success) {        
      setShowAddForm(false);        
      setSearchTerm('');        
      setPendingNavigation(true);        
      setHasInteractedWithEmptyState(false);        
    }        
  }, [addRestaurant]);
  const handleDeleteRestaurant = useCallback(async (restaurantId: string) => {        
    await deleteRestaurant(restaurantId);        
  }, [deleteRestaurant]);
  const handleImportRestaurant = useCallback(async (geoapifyPlace: any) => {        
    setAddingRestaurantId(geoapifyPlace.place_id);        
    const result = await importRestaurant(geoapifyPlace);        
    if (typeof result === 'string') {        
      clearSearchResults();        
      setSearchTerm('');        
      onNavigateToMenu(result);        
    }        
    setAddingRestaurantId(null);        
  }, [importRestaurant, clearSearchResults, onNavigateToMenu]);
  const handleSearchChange = useCallback((newSearchTerm: string) => {        
    setSearchTerm(newSearchTerm);        
    if (showAddForm) {        
      setShowAddForm(false);        
    }        
    if (searchDebounceTimer) {        
      clearTimeout(searchDebounceTimer);        
    }        
    if (!newSearchTerm.trim()) {        
      clearSearchResults();        
      return;        
    }        
    const timer = setTimeout(() => {        
      if (newSearchTerm.trim().length >= 2) {        
        console.log('🔍 Triggering basic online search for:', newSearchTerm);        
        searchRestaurants(newSearchTerm, userLat, userLon);        
      }        
    }, 800);        
    setSearchDebounceTimer(timer);        
  }, [searchRestaurants, clearSearchResults, searchDebounceTimer, showAddForm, userLat, userLon]);
  const handleAdvancedSearchChange = useCallback((newQuery: AdvancedSearchQuery) => {
    setAdvancedQuery(newQuery);
    setSearchTerm(newQuery.name);
    if (showAddForm) { setShowAddForm(false); }
    if (searchDebounceTimer) { clearTimeout(searchDebounceTimer); }
    if (!newQuery.name.trim()) {
        clearSearchResults();
        return;
    }
    const timer = setTimeout(() => {
        if (newQuery.name.trim().length >= 2) {
            console.log('🚀 Triggering advanced online search for:', newQuery);
            searchRestaurants(newQuery, userLat, userLon);
        }
    }, 800);
    setSearchDebounceTimer(timer);
  }, [searchRestaurants, clearSearchResults, searchDebounceTimer, showAddForm, userLat, userLon]);
  const handleResetSearch = useCallback(() => {        
    resetSearch();        
    setSearchTerm('');        
    setAdvancedQuery({ name: '', street: '', city: '' });
    setShowAddForm(false);        
    setHasInteractedWithEmptyState(false);        
    if (searchDebounceTimer) {        
      clearTimeout(searchDebounceTimer);        
      setSearchDebounceTimer(null);        
    }        
  }, [resetSearch, searchDebounceTimer]);
  const handleToggleAdvancedSearch = () => {
    const nextState = !isAdvancedSearch;
    setIsAdvancedSearch(nextState);
    if (nextState) {
      const currentAdvanced = { name: searchTerm, street: '', city: '' };
      setAdvancedQuery(currentAdvanced);
      if (searchTerm.trim().length >= 2) {
        searchRestaurants(currentAdvanced, userLat, userLon);
      }
    } else {
      setSearchTerm(advancedQuery.name);
      if (advancedQuery.name.trim().length >= 2) {
        searchRestaurants(advancedQuery.name, userLat, userLon);
      }
    }
  };
  const handleAddFirstRestaurantFlow = useCallback(() => {        
    setHasInteractedWithEmptyState(true);        
    setSearchTerm('');        
    clearSearchResults();        
    setShowAddForm(false);        
  }, [clearSearchResults]);
  const handleShowAddForm = useCallback(() => {        
    setShowAddForm(true);        
    setHasInteractedWithEmptyState(false);        
  }, []);
  const handleShareRestaurant = (restaurant: Restaurant) => {
    const shareUrl = `${window.location.origin}?shareType=restaurant&shareId=${restaurant.id}`;
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: `Check out ${restaurant.name} on How's Everything!`,
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
  const handleEditRestaurant = (restaurantId: string) => {
    const restaurantToEdit = restaurants.find(r => r.id === restaurantId);
    if (restaurantToEdit) {
      setEditingRestaurant(restaurantToEdit);
    } else {
      console.error("Could not find restaurant to edit with ID:", restaurantId);
      alert("Sorry, there was an error opening the edit form for this restaurant.");
    }
  };
  const handleSaveRestaurantUpdate = async (restaurantId: string, updatedData: Partial<Pick<Restaurant, 'name' | 'address'>>) => {
    const success = await updateRestaurant(restaurantId, updatedData);
    if (success) {
      setEditingRestaurant(null); // Close modal on success
    } else {
      alert("Failed to save changes. Please try again.");
    }
  };
  if (isLoading) {        
    return <LoadingScreen />;        
  }
  const hasSearchTerm = searchTerm.trim().length > 0;        
  const hasLocalResults = hasSearchTerm && filteredAndSortedRestaurants.length > 0;        
  const hasOnlineResults = searchResults.length > 0;        
  const hasAnyResults = hasLocalResults || hasOnlineResults;        
  const hasRestaurants = restaurants.length > 0;
  const showInitialEmptyState = !hasRestaurants && !hasInteractedWithEmptyState && !showAddForm;        
  const showManualAddForm = showAddForm;        
  const showSearchAndResults = !showManualAddForm && !showInitialEmptyState;
  return (        
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>        
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">        
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">        
          <div className="w-12 h-12" />        
          <h1 className="text-xl text-center flex-1 tracking-wide mx-2" style={{...FONTS.elegant, color: COLORS.text}}>        
            My Restaurants        
          </h1>        
          <button        
            onClick={() => setShowAdvancedSort(!showAdvancedSort)}        
            className={`w-12 h-12 rounded-full hover:opacity-80 active:opacity-70 transition-all focus:outline-none flex items-center justify-center`}        
            style={{        
              ...STYLES.iconButton,        
              backgroundColor: showAdvancedSort ? COLORS.primary : COLORS.iconBackground,        
              color: showAdvancedSort ? COLORS.textWhite : COLORS.iconPrimary,        
              boxShadow: showAdvancedSort ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'        
            }}        
            aria-label="Filter restaurants"        
          >        
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">        
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>        
            </svg>        
          </button>        
        </div>        
      </header>
      <main style={{        
        flex: 1,        
        paddingBottom: STYLES.mainContentPadding,        
        maxWidth: '768px',        
        width: '100%',        
        margin: '0 auto'        
      }}>        
        <div className="max-w-md mx-auto space-y-4"        
          style={{        
            paddingLeft: SPACING.containerPadding,        
            paddingRight: SPACING.containerPadding,        
            paddingTop: SPACING[4]        
          }}>        
          {error && (        
            <div className="bg-red-500/20 p-3 rounded-lg text-center">        
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{error}</p>        
            </div>        
          )}
          {shouldShowLocationBanner && !fetchingLocation && (    
            <LocationPermissionBanner    
              onRequestPermission={requestLocationPermission}    
              isRequestingLocationPermission={isRequestingLocationPermission}    
              isPermissionBlocked={isLocationPermissionBlocked}    
            />    
          )}
          {fetchingLocation && (        
            <div className="bg-white/10 p-3 rounded-lg text-center">        
              <p style={{color: COLORS.text, ...FONTS.elegant}}>        
                Getting your current location for better search results...        
              </p>        
            </div>        
          )}
          {showAdvancedSort && (        
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">        
              <div className="flex gap-2 flex-wrap">        
                {[        
                  { value: 'name', label: 'Name' },        
                  { value: 'date', label: 'Date Added' },        
                  { value: 'distance', label: 'Distance' }        
                ].map((option) => {        
                  const isActive = sortBy.criterion === option.value;        
                  const buttonStyle = isActive ? STYLES.sortButtonActive : STYLES.sortButtonDefault;        
                  const arrow = isActive ? (sortBy.direction === 'asc' ? '▲' : '▼') : '';
                  const buttonClick = option.value === 'distance' ? handleDistanceSort : () => {
                    if (isActive) {
                      setSortBy(prev => ({
                        ...prev,
                        direction: prev.direction === 'asc' ? 'desc' : 'asc'
                      }));
                    } else {
                      setSortBy({
                        criterion: option.value as 'name' | 'date' | 'distance',
                        direction: option.value === 'name' ? 'asc' : 'desc'
                      });
                    }
                  };
                  if (option.value === 'distance') {        
                    const hasLocation = userLat !== null && userLon !== null;        
                    const buttonColor = !hasLocation ? COLORS.gray400 : (isActive ? COLORS.white : COLORS.gray700);        
                    const distanceButtonStyle = {        
                      ...buttonStyle,        
                      color: buttonColor,        
                      opacity: !hasLocation && !isActive ? 0.6 : 1        
                    };        
                    return (        
                      <button        
                        key={option.value}        
                        onClick={buttonClick}        
                        className="transition-colors duration-200 hover:opacity-90"        
                        style={distanceButtonStyle}        
                        title={!hasLocation ? "Enable location to sort by distance" : "Sort by distance"}        
                      >        
                        {option.label} {arrow}        
                        {!hasLocation && !isActive && (        
                          <span style={{ marginLeft: '4px', fontSize: '12px' }}>📍</span>        
                        )}        
                      </button>        
                    );        
                  }        
                  return (        
                    <button        
                      key={option.value}        
                      onClick={buttonClick}        
                      className="transition-colors duration-200 hover:opacity-90"        
                      style={buttonStyle}        
                    >        
                      {option.label} {arrow}        
                    </button>        
                  );        
                })}        
              </div>        
            </div>        
          )}
          {showInitialEmptyState && (        
            <div className="text-center py-12">        
              <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>        
                No restaurants yet        
              </p>        
              <button        
                onClick={handleAddFirstRestaurantFlow}        
                style={STYLES.addButton}        
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryHover}        
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary}        
              >        
                Add your first restaurant        
              </button>        
            </div>        
          )}        
          {showSearchAndResults && (        
            <div className="space-y-4">        
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4" style={{ marginLeft: SPACING[4], marginRight: SPACING[4], marginBottom: SPACING[6] }}>        
                <>        
                  <div className="flex items-center justify-between mb-2">        
                    <label style={{        
                      ...FONTS.elegant,        
                      fontSize: '1.1rem',        
                      fontWeight: '600',        
                      color: COLORS.text        
                    }}>        
                      {hasRestaurants ? "Search for a restaurant" : "Search for a restaurant to add"}        
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleToggleAdvancedSearch}
                        style={{
                          ...FONTS.elegant,
                          background: 'none',
                          border: 'none',
                          color: COLORS.primary,
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          padding: '4px 8px',
                          borderRadius: STYLES.borderRadiusSmall,
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryLight}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title={isAdvancedSearch ? "Switch to a simpler search" : "Use separate fields for name and address"}
                      >
                        {isAdvancedSearch ? 'Basic' : 'Advanced'}
                      </button>      
                      {hasSearchTerm && (      
                        <button      
                          onClick={handleResetSearch}      
                          style={{      
                            background: 'transparent',      
                            border: 'none',      
                            padding: 0,      
                            cursor: 'pointer',      
                            color: COLORS.textSecondary,      
                            transition: 'color 0.2s ease, transform 0.2s ease',      
                          }}      
                          onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.danger; e.currentTarget.style.transform = 'scale(1.15)'; }}      
                          onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }}      
                          aria-label="Clear search"      
                          title="Clear search"      
                        >      
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">      
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />      
                          </svg>      
                        </button>      
                      )}
                    </div>
                  </div>
                  {isAdvancedSearch ? (
                    <AdvancedRestaurantSearchForm
                      onSearchChange={handleAdvancedSearchChange}
                      initialQuery={advancedQuery}
                    />
                  ) : (      
                    <input
                      id="restaurant-search-input"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Restaurant name +/- city"
                      className="w-full max-w-full outline-none"
                      style={{
                        ...STYLES.input,
                        ...(isFocused && STYLES.inputFocusBlack),
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      autoFocus={!hasSearchTerm}
                    />
                  )}
                  {hasSearchTerm && (        
                    <div style={{        
                      ...FONTS.elegant,        
                      fontSize: '14px',        
                      color: COLORS.text,        
                      opacity: 0.8,        
                      marginTop: '8px',        
                      marginBottom: 0        
                    }}>        
                      {hasRestaurants && (        
                        <div>        
                          {filteredAndSortedRestaurants.length > 0        
                            ? `Found ${filteredAndSortedRestaurants.length} in your restaurants`        
                            : 'No matching restaurants found in your personal list'        
                          }        
                        </div>        
                      )}        
                      {isSearching && <SearchingIndicator />}      
                      {!isSearching && searchResults.length > 0 && (        
                        <div style={{ marginTop: '4px' }}>        
                          ✨ Found {searchResults.length === 1 ? 'one result' : `${searchResults.length} results`}        
                        </div>        
                      )}        
                    </div>        
                  )}        
                </>        
              </div>
              {hasSearchTerm ? (        
                <div className="space-y-2">
                  {hasLocalResults && (        
                    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2] }}>        
                      <div className="text-center">        
                        <h3 style={{        
                          ...FONTS.elegant,        
                          color: COLORS.text,        
                          fontSize: '18px',        
                          fontWeight: '500',        
                          margin: 0,
                          paddingBottom: SPACING[2]
                        }}>        
                          Your restaurants:        
                        </h3>        
                      </div>        
                      {filteredAndSortedRestaurants.map((restaurant) => (        
                        <RestaurantCard        
                          key={restaurant.id}
                          restaurant={restaurant}        
                          onDelete={handleDeleteRestaurant}        
                          onNavigateToMenu={onNavigateToMenu}
                          onShare={() => handleShareRestaurant(restaurant)}
                          onEdit={() => handleEditRestaurant(restaurant.id)}
                          currentUserId={user?.id || null}
                        />        
                      ))}        
                    </div>        
                  )}
                  {hasOnlineResults && (        
                    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2] }}>        
                      <div className="text-center">        
                        <h3 style={{        
                          ...FONTS.elegant,        
                          color: COLORS.text,        
                          fontSize: '18px',        
                          fontWeight: '500',        
                          margin: 0,
                          paddingBottom: SPACING[2]
                        }}>        
                          {hasLocalResults ? 'Found online:' : 'Online results:'}        
                        </h3>        
                      </div>
                      {searchError && (        
                        <div className="bg-red-500/20 p-3 rounded-lg text-center">        
                          <p style={{color: COLORS.danger, ...FONTS.elegant}}>{searchError}</p>        
                        </div>        
                      )}        
                      {searchResults.map((result) => (        
                        <div key={result.place_id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">        
                          <div className="flex justify-between items-start">        
                            <div className="flex-1 mr-4">        
                              <h4 style={{        
                                ...FONTS.elegant,        
                                fontSize: '16px',        
                                fontWeight: '500',        
                                color: COLORS.text,        
                                margin: '0 0 4px 0'        
                              }}>        
                                {result.properties.name}        
                              </h4>        
                              <p style={{        
                                ...FONTS.elegant,        
                                fontSize: '14px',        
                                color: COLORS.text,        
                                opacity: 0.8,        
                                margin: 0,        
                                lineHeight: '1.4'        
                              }}>        
                                {result.properties.formatted}        
                              </p>        
                            </div>        
                            <button        
                              onClick={() => handleImportRestaurant(result)}        
                              disabled={addingRestaurantId === result.place_id}        
                              style={{        
                                ...STYLES.addButton,        
                                padding: '8px 16px',        
                                fontSize: '14px',        
                                opacity: addingRestaurantId === result.place_id ? 0.6 : 1        
                              }}        
                              onMouseEnter={(e) => { if(addingRestaurantId !== result.place_id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryHover; }}        
                              onMouseLeave={(e) => { if(addingRestaurantId !== result.place_id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary; }}        
                            >        
                              {addingRestaurantId === result.place_id ? 'Adding...' : 'Add'}        
                            </button>        
                          </div>        
                          {restaurantErrors.has(result.place_id) && (        
                            <div className="mt-2 p-2 bg-red-500/20 rounded">        
                              <p style={{        
                                ...FONTS.elegant,        
                                fontSize: '12px',        
                                color: COLORS.danger,        
                                margin: 0        
                              }}>        
                                {restaurantErrors.get(result.place_id)}        
                              </p>        
                            </div>        
                          )}        
                        </div>        
                      ))}        
                    </div>        
                  )}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">        
                    <p style={{...FONTS.elegant, fontSize: '0.95rem', color: COLORS.text, marginBottom: '12px'}}>        
                      Can't find it?        
                    </p>        
                    <button        
                      onClick={handleShowAddForm}        
                      className="px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"        
                      style={STYLES.addButton}        
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryHover; }}        
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary; }}        
                    >        
                      Add New Restaurant        
                    </button>        
                  </div>
                  {!hasAnyResults && !isSearching && lastSearchedTerm === searchTerm && hasSearchTerm && (        
                    <div className="text-center py-12">        
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>        
                        No restaurants found for "{searchTerm}"        
                      </p>        
                      <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7, marginBottom: '16px'}}>        
                        Try a different search term or add this restaurant.        
                      </p>        
                    </div>        
                  )}        
                </div>        
              ) : (        
                <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2] }}>        
                  {hasRestaurants ? (        
                    restaurants.map((restaurant) => (        
                      <RestaurantCard        
                        key={restaurant.id}
                        restaurant={restaurant}        
                        onDelete={handleDeleteRestaurant}        
                        onNavigateToMenu={onNavigateToMenu}
                        onShare={() => handleShareRestaurant(restaurant)}
                        onEdit={() => handleEditRestaurant(restaurant.id)}
                        currentUserId={user?.id || null}
                      />        
                    ))        
                  ) : (        
                    <div className="text-center py-12">        
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>        
                        Start by searching for your first restaurant!        
                      </p>        
                    </div>        
                  )}        
                </div>        
              )}        
            </div>        
          )}
          {showManualAddForm && (        
            <div className="space-y-4">        
              <div className="flex items-center justify-between">        
                <button        
                  onClick={() => { setShowAddForm(false); }}        
                  className="p-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none"        
                  style={STYLES.iconButton}        
                >        
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">        
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>        
                  </svg>        
                </button>        
                <h2 style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500'}}>        
                  Add New Restaurant        
                </h2>        
                <div className="w-10" />        
              </div>
              <EnhancedAddRestaurantForm        
                initialRestaurantName={searchTerm}        
                onSubmit={handleAddRestaurant}        
                onCancel={() => setShowAddForm(false)}        
              />        
            </div>        
          )}
        </div>        
      </main>
      {editingRestaurant && (
        <EditRestaurantForm
          restaurant={editingRestaurant}
          onSave={handleSaveRestaurantUpdate}
          onCancel={() => setEditingRestaurant(null)}
        />
      )}
      <BottomNavigation        
        onNav={onNavigateToScreen}        
        activeScreenValue={currentAppScreen}        
      />        
    </div>        
  );        
};


export default RestaurantScreen;