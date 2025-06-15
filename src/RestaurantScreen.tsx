// src/RestaurantScreen.tsx - Updated with search-first UX like MenuScreen        
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import RestaurantCard from './components/restaurant/RestaurantCard';
import { COLORS, FONTS, SIZES, STYLES } from './constants';
import { useRestaurants } from './hooks/useRestaurants';




interface RestaurantScreenProps {        
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;        
  onNavigateToMenu: (restaurantId: string) => void;        
  currentAppScreen: GlobalAppScreenType;        
}




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
            if (restaurantName.trim()) e.currentTarget.style.backgroundColor = COLORS.primaryHover; // Changed COLORS.addButtonHover          
          }}          
          onMouseLeave={(e) => {          
            if (restaurantName.trim()) e.currentTarget.style.backgroundColor = COLORS.primary; // Changed COLORS.addButtonBg          
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
  // MODIFIED: Updated sortBy state to include criterion and direction
  const [sortBy, setSortBy] = useState<{ criterion: 'name' | 'date'; direction: 'asc' | 'desc' }>({ criterion: 'name', direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);        
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);        
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);    
  const [addingRestaurantId, setAddingRestaurantId] = useState<string | null>(null);    
  const [pendingNavigation, setPendingNavigation] = useState(false);  
  const [hasInteractedWithEmptyState, setHasInteractedWithEmptyState] = useState(false);  
  const [ellipsis, setEllipsis] = useState('.'); // State for search ellipsis animation




  // User Geolocation State  
  const [userLat, setUserLat] = useState<number | null>(null);  
  const [userLon, setUserLon] = useState<number | null>(null);  
  const [fetchingLocation, setFetchingLocation] = useState(true);  
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);




  // Custom Hooks        
  const {        
    restaurants,        
    isLoading,        
    error,        
    addRestaurant,        
    deleteRestaurant,        
    // Online search functionality        
    searchResults,        
    isSearching,        
    searchError,        
    restaurantErrors,        
    searchRestaurants,        
    importRestaurant,        
    clearSearchResults,        
    resetSearch        
  } = useRestaurants(sortBy); // MODIFIED: Pass the sortBy object




  // Cleanup debounce timer on unmount        
  useEffect(() => {        
    return () => {        
      if (searchDebounceTimer) {        
        clearTimeout(searchDebounceTimer);        
      }        
    };        
  }, [searchDebounceTimer]);




  // Ellipsis animation effect  
  useEffect(() => {  
    let interval: NodeJS.Timeout;  
    if (isSearching) {  
      interval = setInterval(() => {  
        setEllipsis(prev => {  
          if (prev === '.') return '..';  
          if (prev === '..') return '...';  
          return '.';  
        });  
      }, 300); // Cycle every 300ms  
    } else {  
      setEllipsis('.'); // Reset when not searching  
    }  
    return () => clearInterval(interval);  
  }, [isSearching]);




  // Request user's geolocation on component mount  
  useEffect(() => {  
    if (navigator.geolocation) {  
      setFetchingLocation(true);  
      navigator.geolocation.getCurrentPosition(  
        (position) => {  
          setUserLat(position.coords.latitude);  
          setUserLon(position.coords.longitude);  
          setFetchingLocation(false);  
          console.log('📍 User location obtained:', position.coords.latitude, position.coords.longitude);  
        },  
        (error) => {  
          console.error('Error getting user location:', error);  
          setFetchingLocation(false);  
          if (error.code === error.PERMISSION_DENIED) {  
            setLocationPermissionDenied(true);  
            // Optionally, set a general error message visible to the user  
            // setError("Location access denied. Online search may be less accurate without your precise location.");  
          } else {  
            // setError("Failed to get your location for search. Using a general area bias.");  
          }  
        },  
        {  
          enableHighAccuracy: true, // Use GPS if available  
          timeout: 10000,           // 10 seconds timeout  
          maximumAge: 60000         // Cache for 1 minute  
        }  
      );  
    } else {  
      setFetchingLocation(false);  
      // setError("Geolocation is not supported by your browser. Online search may be less accurate.");  
    }  
  }, []); // Run once on mount




  // Handle navigation after adding restaurant    
  const [previousRestaurantCount, setPreviousRestaurantCount] = useState(0);    
     
  useEffect(() => {    
    // If we're pending navigation and a new restaurant was added, navigate to it    
    if (pendingNavigation && restaurants.length > previousRestaurantCount) {    
      const newestRestaurant = restaurants.reduce((newest, restaurant) => {    
        return new Date(restaurant.dateAdded) > new Date(newest.dateAdded) ? restaurant : newest;    
      });    
      onNavigateToMenu(newestRestaurant.id);    
      setPendingNavigation(false);    
    }    
    // If the user just added their first restaurant (went from 0 to >0 restaurants), reset the interacted state  
    if (previousRestaurantCount === 0 && restaurants.length > 0) {  
      setHasInteractedWithEmptyState(false);  
    }  
    setPreviousRestaurantCount(restaurants.length);    
  }, [restaurants, pendingNavigation, previousRestaurantCount, onNavigateToMenu]);




  // Enhanced restaurant filtering with fuzzy search (same as MenuScreen)        
  const filteredAndSortedRestaurants = useMemo(() => {        
    if (!searchTerm.trim()) {        
      return restaurants; // Return all restaurants when no search term        
    }




    // Calculate similarity scores and filter        
    const restaurantsWithScores = restaurants.map(restaurant => ({        
      ...restaurant,        
      similarityScore: calculateRestaurantSimilarity(restaurant.name, searchTerm)        
    }));




    // Filter restaurants with reasonable similarity (> 20 for very loose matching)        
    // When online results are present, apply a stricter filter for local results.  
    const hasOnlineResults = searchResults.length > 0;  
    const similarityThreshold = hasOnlineResults ? 70 : 20; // Stricter if online results exist




    const filteredRestaurants = restaurantsWithScores        
      .filter(restaurant => restaurant.similarityScore > similarityThreshold)        
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity first        
      .map(({ similarityScore, ...restaurant }) => restaurant); // Remove score from final result




    return filteredRestaurants;        
  }, [restaurants, searchTerm, searchResults.length]); // Added searchResults.length to dependency array




  // Handlers        
  const handleAddRestaurant = useCallback(async (name: string) => {        
    const success = await addRestaurant(name);        
    if (success) {        
      setShowAddForm(false);        
      setSearchTerm(''); // Clear search when new restaurant is added        
      setPendingNavigation(true); // This will trigger navigation once restaurants state updates    
      setHasInteractedWithEmptyState(false); // Reset this if manual add was successful  
    }        
  }, [addRestaurant]);




  const handleDeleteRestaurant = useCallback(async (restaurantId: string) => {        
    await deleteRestaurant(restaurantId);        
  }, [deleteRestaurant]);




  const handleImportRestaurant = useCallback(async (geoapifyPlace: any) => {        
    setAddingRestaurantId(geoapifyPlace.place_id);    
    const result = await importRestaurant(geoapifyPlace);        
    if (typeof result === 'string') { // result is restaurant ID    
      clearSearchResults();        
      setSearchTerm('');        
      onNavigateToMenu(result); // Navigate to the new restaurant's menu    
    }    
    setAddingRestaurantId(null);    
  }, [importRestaurant, clearSearchResults, onNavigateToMenu]);




  // Enhanced search handler that triggers both local and online search        
  const handleSearchChange = useCallback((newSearchTerm: string) => {        
    setSearchTerm(newSearchTerm);        
       
    // Close add form if open    
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
        searchRestaurants(newSearchTerm, userLat, userLon); // Pass user's live coordinates here  
      }        
    }, 800); // Increased from 500ms to 800ms for slower typing        
           
    setSearchDebounceTimer(timer);        
  }, [searchRestaurants, clearSearchResults, searchDebounceTimer, showAddForm, userLat, userLon]);




  const handleResetSearch = useCallback(() => {        
    resetSearch();        
    setSearchTerm('');        
    setShowAddForm(false);    
    setHasInteractedWithEmptyState(false); // Reset on full search reset  
    if (searchDebounceTimer) {    
      clearTimeout(searchDebounceTimer);    
      setSearchDebounceTimer(null);    
    }    
  }, [resetSearch, searchDebounceTimer]);




  // Handler for "Add your first restaurant" button to initiate search flow  
  const handleAddFirstRestaurantFlow = useCallback(() => {  
    setHasInteractedWithEmptyState(true); // User wants to add their first restaurant  
    setSearchTerm(''); // Clear any previous search  
    clearSearchResults(); // Clear any previous search results  
    setShowAddForm(false); // Ensure manual add form is not active  
  }, [clearSearchResults]);




  // Modified handleShowAddForm to reset interacted state for manual add  
  const handleShowAddForm = useCallback(() => {  
    setShowAddForm(true);  
    setHasInteractedWithEmptyState(false); // If user explicitly goes to manual form, it's not the initial search flow  
  }, []);




  if (isLoading) {        
    return <LoadingScreen />;        
  }




  const hasSearchTerm = searchTerm.trim().length > 0;        
  const hasLocalResults = hasSearchTerm && filteredAndSortedRestaurants.length > 0;    
  const hasOnlineResults = searchResults.length > 0;    
  const hasAnyResults = hasLocalResults || hasOnlineResults;  
  const hasRestaurants = restaurants.length > 0; // Track if user has any restaurants




  // Determine which main section to show  
  const showInitialEmptyState = !hasRestaurants && !hasInteractedWithEmptyState && !showAddForm;  
  const showManualAddForm = showAddForm;  
  const showSearchAndResults = !showManualAddForm && !showInitialEmptyState;




  return (        
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>        
      {/* Header - FIXED: Better centering */}        
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">        
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">        
          {/* FIXED: Left spacer that matches filter button width for better centering */}  
          <div className="w-12 h-12" /> {/* Matches the filter button dimensions */}        
                 
          <h1 className="text-xl text-center flex-1 tracking-wide mx-2" style={{...FONTS.elegant, color: COLORS.text}}>        
            My Restaurants  
          </h1>        
                 
          <button        
            onClick={() => setShowAdvancedSort(!showAdvancedSort)}        
            className={`w-12 h-12 rounded-full hover:opacity-80 active:opacity-70 transition-all focus:outline-none flex items-center justify-center`}        
            style={{        
              ...STYLES.iconButton, // Use iconButton style for base        
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




      {/* Main Content */}        
      <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>        
        <div className="max-w-md mx-auto space-y-6">        
          {error && (        
            <div className="bg-red-500/20 p-3 rounded-lg text-center">        
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{error}</p>        
            </div>        
          )}




          {/* Location Feedback */}  
          {fetchingLocation && (  
            <div className="bg-white/10 p-3 rounded-lg text-center">  
              <p style={{color: COLORS.text, ...FONTS.elegant}}>  
                Getting your current location for better search results...  
              </p>  
            </div>  
          )}  
          {locationPermissionDenied && (  
            <div className="bg-yellow-500/20 p-3 rounded-lg text-center">  
              <p style={{color: COLORS.star, ...FONTS.elegant}}>  
                Location access denied. Search results may be less accurate without your precise location.  
              </p>  
            </div>  
          )}




          {showAdvancedSort && (        
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">        
              {/* REMOVED: <h3 style={{...FONTS.elegant, color: COLORS.text, fontSize: '16px', fontWeight: '500', marginBottom: '12px'}}>        
                Sort restaurants by:        
              </h3> */}        
              <div className="flex gap-2">        
                {[        
                  { value: 'name', label: 'Name' },        
                  { value: 'date', label: 'Date Added' }        
                ].map((option) => {
                  const isActive = sortBy.criterion === option.value;
                  const buttonStyle = isActive ? STYLES.sortButtonActive : STYLES.sortButtonDefault;
                  const arrow = isActive ? (sortBy.direction === 'asc' ? '▲' : '▼') : ''; // Up arrow for ascending, down for descending
                  return (        
                    <button        
                      key={option.value}        
                      onClick={() => {
                        if (isActive) {
                          // Toggle direction if the same criterion is clicked
                          setSortBy(prev => ({
                            ...prev,
                            direction: prev.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        } else {
                          // Set new criterion, default to ascending for name, descending for date
                          setSortBy({
                            criterion: option.value as 'name' | 'date',
                            direction: option.value === 'name' ? 'asc' : 'desc'
                          });
                        }
                      }}        
                      className="transition-colors duration-200 hover:opacity-90" // Simple hover effect
                      style={buttonStyle}        
                    >        
                      {option.label} {arrow}        
                    </button>        
                  );        
                })}        
              </div>        
            </div>        
          )}




          {/* Initial Empty State */}  
          {showInitialEmptyState && (  
            <div className="text-center py-12">    
              <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>    
                No restaurants yet    
              </p>    
              <button    
                onClick={handleAddFirstRestaurantFlow}    
                style={STYLES.addButton}    
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover} // Changed COLORS.addButtonHover    
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary} // Changed COLORS.addButtonBg    
              >    
                Add your first restaurant  
              </button>    
            </div>    
          )}  
                 
          {/* Search Input & Results Section (conditional on not showing initial empty state or manual add form) */}  
          {showSearchAndResults && (        
            <div className="space-y-4">        
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4" style={{ marginBottom: SIZES.lg }}>        
                <div className="flex items-center justify-between mb-2">        
                  <label style={{        
                    ...FONTS.elegant,        
                    fontSize: '1.1rem',        
                    fontWeight: '600',        
                    color: COLORS.text        
                  }}>        
                    {/* Conditional Label Text */}  
                    {hasRestaurants ? "Search for a restaurant" : "Search for a restaurant to add"}        
                  </label>        
                  {hasSearchTerm && (        
                    <button        
                      onClick={handleResetSearch}        
                      style={{        
                        ...FONTS.elegant,        
                        backgroundColor: COLORS.primary,        
                        color: 'white',        
                        border: 'none',        
                        borderRadius: STYLES.borderRadiusSmall,        
                        padding: '4px 12px',        
                        fontSize: '0.85rem',        
                        fontWeight: '500',        
                        cursor: 'pointer',        
                        WebkitAppearance: 'none',        
                      }}        
                    >        
                      Reset        
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
                    color: COLORS.text, // Changed COLORS.textDark        
                    boxSizing: 'border-box',        
                    WebkitAppearance: 'none',        
                    border: `1px solid ${COLORS.text}`,  
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
                    {/* Conditional personal list status - only show if user has restaurants */}  
                    {hasRestaurants && (  
                      <div>        
                        {filteredAndSortedRestaurants.length > 0        
                          ? `Found ${filteredAndSortedRestaurants.length} in your restaurants`        
                          : 'No matching restaurants found in your personal list'        
                        }        
                      </div>  
                    )}  
                    {isSearching && (        
                      <div style={{
                        marginTop: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>        
                        🔍 Searching{ellipsis}        
                      </div>        
                    )}        
                    {!isSearching && searchResults.length > 0 && (        
                      <div style={{ marginTop: '4px' }}>        
                        ✨ Found {searchResults.length === 1 ? 'one result' : `${searchResults.length} results`}        
                      </div>        
                    )}        
                  </div>        
                )}        
              </div>




              {/* Conditional Display of Results or Info Message */}  
              {hasSearchTerm ? (    
                <div className="space-y-4">    
                  {/* Local Results */}    
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




                  {/* Online Results */}    
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
                               onMouseEnter={(e) => { if(addingRestaurantId !== result.place_id) e.currentTarget.style.backgroundColor = COLORS.primaryHover; }} // Changed COLORS.addButtonHover    
                               onMouseLeave={(e) => { if(addingRestaurantId !== result.place_id) e.currentTarget.style.backgroundColor = COLORS.primary; }} // Changed COLORS.addButtonBg    
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




                  {/* Add New Restaurant Button - Always show when searching */}    
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">    
                    <p style={{...FONTS.elegant, fontSize: '0.95rem', color: COLORS.text, marginBottom: '12px'}}>    
                      Can't find it?    
                    </p>    
                    <button    
                      onClick={handleShowAddForm}    
                      className="px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"    
                      style={STYLES.addButton}    
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover} // Changed COLORS.addButtonHover    
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary} // Changed COLORS.addButtonBg    
                    >    
                      Add New Restaurant    
                    </button>    
                  </div>




                  {/* No Results Message */}    
                  {!hasAnyResults && !isSearching && (    
                    <div className="text-center py-12">    
                      <div className="text-4xl mb-4">🔍</div>    
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
                // Content when no search term is active  
                <div className="space-y-4">  
                  {hasRestaurants ? (  
                    // Display list of all restaurants if user has some  
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
                    // Message for empty list in search-to-add flow (hasInteractedWithEmptyState is true)  
                    <div className="text-center py-12">  
                      {/* REMOVED: Search icon here as requested */}  
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>  
                        Start by searching for your first restaurant!  
                      </p>  
                      {/* REMOVED: "Enter a name or address in the search bar above." text */}  
                      {/* REMOVED: "Add New Restaurant Manually" button */}  
                    </div>  
                  )}  
                </div>  
              )}  
            </div>        
          )}




          {/* Add Restaurant Form */}    
          {showManualAddForm && (    
            <div className="space-y-4">    
              <div className="flex items-center justify-between">    
                <button    
                  onClick={() => {    
                    setShowAddForm(false);    
                  }}    
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
                <div className="w-10" /> {/* Spacer */}    
              </div>




              <EnhancedAddRestaurantForm    
                initialRestaurantName={searchTerm} // Pre-fill with search term    
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