// src/RestaurantScreen.tsx - Fixed location permission persistence        
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import RestaurantCard from './components/restaurant/RestaurantCard';
import { COLORS, FONTS, SPACING, STYLES } from './constants';
import { useRestaurants } from './hooks/useRestaurants';

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
 
  // Detect OS
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
 
  // Detect browser - special handling for iOS where all browsers use WebKit
  let browser = 'Browser';
 
  if (isIOS) {
    // On iOS, detect browser more carefully since all use WebKit
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
    // Non-iOS detection (original logic)
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
  // FIXED: Renamed prop for consistency with state variable
  isRequestingLocationPermission: boolean;    
  isPermissionBlocked: boolean;    
}> = ({ onRequestPermission, isRequestingLocationPermission, isPermissionBlocked }) => { // FIXED: Destructured renamed prop    
  const deviceInfo = getDeviceInfo();
 
  const handleClick = () => {    
    if (isPermissionBlocked) {    
      const { isIOS, isAndroid, browser } = deviceInfo;
     
      let instructions = '';
     
      if (isIOS) {
        // Universal iOS instructions that work for all browsers
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
        // Android instructions with common paths
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
        // Fallback for unknown devices
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
        {/* Location Icon */}    
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
           
        {/* Message Content */}    
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
              // FIXED: Used renamed prop
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
                if (!isRequestingLocationPermission || isPermissionBlocked) { // FIXED: Used renamed prop    
                  e.currentTarget.style.borderBottomColor = COLORS.primaryHover;    
                  e.currentTarget.style.color = COLORS.primaryHover;    
                }    
              }}    
              onMouseLeave={(e) => {    
                if (!isRequestingLocationPermission || isPermissionBlocked) { // FIXED: Used renamed prop    
                  e.currentTarget.style.borderBottomColor = COLORS.primary;    
                  e.currentTarget.style.color = COLORS.primary;    
                }    
              }}    
            >    
              {isRequestingLocationPermission && !isPermissionBlocked ? ( // FIXED: Used renamed prop    
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
         
          {/* Device info for debugging (remove in production) */}
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
        {/* REMOVED: "Restaurant Name" label as per request */}        
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
            color: COLORS.text, // Changed COLORS.textDark        
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
            backgroundColor: !restaurantName.trim() ? COLORS.gray300 : COLORS.primary, // Changed COLORS.disabled and COLORS.addButtonBg        
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
         
  if (!search) return 100; // Show all restaurants when no search term        
         
  // Exact match - highest score        
  if (restaurant === search) return 100;        
         
  // Contains match - very high score        
  if (restaurant.includes(search) || search.includes(restaurant)) return 95;        
         
  // Word-by-word comparison        
  const restaurantWords = restaurant.split(/\s+/);        
  const searchWords = search.split(/\s+/);        
  let wordMatches = 0;        
  let partialMatches = 0;        
         
  searchWords.forEach(searchWord => {        
    // Check for exact word matches        
    if (restaurantWords.some(restaurantWord => restaurantWord === searchWord)) {        
      wordMatches++;        
    }        
    // Check for partial word matches        
    else if (restaurantWords.some(restaurantWord =>        
      restaurantWord.includes(searchWord) ||        
      searchWord.includes(restaurantWord) ||        
      // Handle common variations        
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
         
  // Character similarity for very different strings        
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

  // User Geolocation State        
  const [userLat, setUserLat] = useState<number | null>(() => {    
    const saved = localStorage.getItem('howzeverything-user-location');    
    if (saved) {    
      try {    
        const { lat, lon, timestamp } = JSON.parse(saved);    
        if (Date.now() - timestamp < 60 * 60 * 1000) {    
          console.log('📍 Restored saved location:', lat, lon);    
          return lat;    
        }    
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
        const { lon, timestamp } = JSON.parse(saved);    
        if (Date.now() - timestamp < 60 * 60 * 1000) {    
          return lon;    
        }    
      } catch (e) {    
      }    
    }    
    return null;    
  });        
  const [fetchingLocation, setFetchingLocation] = useState(false);        
  const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);    
  const [shouldShowLocationBanner, setShouldShowLocationBanner] = useState(() => {  
    const saved = localStorage.getItem('howzeverything-user-location');  
    if (saved) {  
      try {  
        const { timestamp } = JSON.parse(saved);  
        return Date.now() - timestamp >= 60 * 60 * 1000;  
      } catch (e) {  
        return true;  
      }  
    }  
    return true;  
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
    resetSearch        
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
    const checkLocationPermissionStatus = async () => {    
      if (!navigator.geolocation) {    
        setFetchingLocation(false);    
        return;    
      }

      if (userLat !== null && userLon !== null) {  
        navigator.geolocation.getCurrentPosition(    
          (position) => {    
            const newLat = position.coords.latitude;  
            const newLon = position.coords.longitude;  
            setUserLat(newLat);    
            setUserLon(newLon);    
            saveLocationToStorage(newLat, newLon);
            console.log('📍 Background location refresh:', newLat, newLon);    
          },    
          (error) => {    
            console.log('📍 Background location refresh failed:', error);  
          },    
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }    
        );  
        return;  
      }

      if ('permissions' in navigator) {    
        try {    
          const permission = await navigator.permissions.query({ name: 'geolocation' });    
             
          if (permission.state === 'granted') {    
            requestLocationActually();    
          } else if (permission.state === 'denied') {    
            setFetchingLocation(false);    
            setShouldShowLocationBanner(true);    
            setIsLocationPermissionBlocked(true);    
          } else if (permission.state === 'prompt') {    
            setFetchingLocation(false);    
            setShouldShowLocationBanner(true);    
            setIsLocationPermissionBlocked(false);    
          }    
        } catch (error) {    
          if (userLat === null || userLon === null) {  
            setFetchingLocation(false);  
            setShouldShowLocationBanner(true);  
          }  
        }    
      } else {    
        if (userLat === null || userLon === null) {  
          setFetchingLocation(false);  
          setShouldShowLocationBanner(true);  
        }  
      }    
    };

    const requestLocationActually = () => {    
      setFetchingLocation(true);    
      navigator.geolocation.getCurrentPosition(    
        (position) => {    
          const lat = position.coords.latitude;  
          const lon = position.coords.longitude;  
          setUserLat(lat);    
          setUserLon(lon);    
          saveLocationToStorage(lat, lon);
          setShouldShowLocationBanner(false);    
          setFetchingLocation(false);    
          console.log('📍 User location obtained:', lat, lon);    
        },    
        (error) => {    
          console.error('Error getting user location:', error);    
          setFetchingLocation(false);    
          if (error.code === error.PERMISSION_DENIED) {    
            setShouldShowLocationBanner(true);    
            setIsLocationPermissionBlocked(true);  
          } else {    
            setShouldShowLocationBanner(true);    
          }    
        },    
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }    
      );    
    };

    checkLocationPermissionStatus();    
  }, []);

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
        console.log('🔍 Triggering online search for:', newSearchTerm);        
        searchRestaurants(newSearchTerm, userLat, userLon);        
      }        
    }, 800);        
           
    setSearchDebounceTimer(timer);        
  }, [searchRestaurants, clearSearchResults, searchDebounceTimer, showAddForm, userLat, userLon]);

  const handleResetSearch = useCallback(() => {        
    resetSearch();        
    setSearchTerm('');        
    setShowAddForm(false);        
    setHasInteractedWithEmptyState(false);        
    if (searchDebounceTimer) {        
      clearTimeout(searchDebounceTimer);        
      setSearchDebounceTimer(null);        
    }        
  }, [resetSearch, searchDebounceTimer]);

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
        <div className="max-w-md mx-auto space-y-6"        
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
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4" style={{ marginBottom: SPACING[4] }}>        
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
                  <input        
                    id="restaurant-search-input"        
                    type="text"        
                    value={searchTerm}        
                    onChange={(e) => handleSearchChange(e.target.value)}        
                    placeholder="e.g., Starbucks, Cafe Flora, 123 Main St, 98101..."        
                    className="w-full max-w-full outline-none focus:ring-2 focus:ring-white/50"        
                    style={{        
                      ...FONTS.elegant,        
                      padding: '12px 16px',        
                      borderRadius: STYLES.borderRadiusMedium,        
                      fontSize: '1rem',        
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',        
                      color: COLORS.text,        
                      boxSizing: 'border-box',        
                      WebkitAppearance: 'none',        
                      border: `2px solid ${COLORS.gray200}`,        
                      minWidth: 0        
                    }}        
                    autoFocus={!hasSearchTerm}        
                  />        
                         
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
                <div className="space-y-4">        
                  {hasLocalResults && (        
                    <div>        
                      <div className="text-center mb-4">        
                        <h3 style={{        
                          ...FONTS.elegant,        
                          color: COLORS.text,        
                          fontSize: '18px',        
                          fontWeight: '500',        
                          margin: 0        
                        }}>        
                          Your restaurants:        
                        </h3>        
                      </div>        
                             
                      {filteredAndSortedRestaurants.map((restaurant, index) => (        
                        <div key={restaurant.id}>        
                          <RestaurantCard        
                            restaurant={restaurant}        
                            onDelete={handleDeleteRestaurant}        
                            onNavigateToMenu={onNavigateToMenu}        
                          />        
                          {(index < filteredAndSortedRestaurants.length - 1 || hasOnlineResults) && (        
                            <div        
                              className="mx-4 mt-4"        
                              style={{        
                                height: '1px',        
                                background: `linear-gradient(to right, transparent, ${COLORS.text}20, transparent)`        
                              }}        
                            />        
                          )}        
                        </div>        
                      ))}        
                    </div>        
                  )}

                  {hasOnlineResults && (        
                    <div>        
                      <div className="text-center mb-4">        
                        <h3 style={{        
                          ...FONTS.elegant,        
                          color: COLORS.text,        
                          fontSize: '18px',        
                          fontWeight: '500',        
                          margin: 0        
                        }}>        
                          {hasLocalResults ? 'Found online:' : 'Online results:'}        
                        </h3>        
                      </div>

                      {searchError && (        
                        <div className="bg-red-500/20 p-3 rounded-lg text-center mb-4">        
                          <p style={{color: COLORS.danger, ...FONTS.elegant}}>{searchError}</p>        
                        </div>        
                      )}        
                             
                      {searchResults.map((result) => (        
                        <div key={result.place_id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">        
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

                  {/* No Results Message */}        
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
                <div className="space-y-4">        
                  {hasRestaurants ? (        
                    restaurants.map((restaurant, index) => (        
                      <div key={restaurant.id}>        
                        <RestaurantCard        
                          restaurant={restaurant}        
                          onDelete={handleDeleteRestaurant}        
                          onNavigateToMenu={onNavigateToMenu}        
                        />        
                          {(index < restaurants.length - 1) && (        
                            <div        
                              className="mx-4 mt-4"        
                              style={{        
                                height: '1px',        
                                background: `linear-gradient(to right, transparent, ${COLORS.text}20, transparent)`        
                              }}        
                            />        
                          )}        
                      </div>        
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

      <BottomNavigation        
        onNav={onNavigateToScreen}        
        activeScreenValue={currentAppScreen}        
      />        
    </div>        
  );        
};

export default RestaurantScreen;