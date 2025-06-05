// src/RestaurantScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import RestaurantCard from './components/restaurant/RestaurantCard';
import AddRestaurantForm from './components/restaurant/AddRestaurantForm';
import LoadingScreen from './components/LoadingScreen';
import { useRestaurants } from './hooks/useRestaurants';
import { COLORS, FONTS, STYLES, SIZES } from './constants'; // <<< SIZES ADDED HERE
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';


interface RestaurantScreenProps {
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;
  onNavigateToMenu: (restaurantId: string) => void;
  currentAppScreen: GlobalAppScreenType;
}


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
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);


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
    isLoadingDetails,
    restaurantErrors,
    searchRestaurants,
    importRestaurant,
    clearSearchResults,
    resetSearch
  } = useRestaurants(sortBy);


  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);


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
    const filteredRestaurants = restaurantsWithScores
      .filter(restaurant => restaurant.similarityScore > 20)
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity first
      .map(({ similarityScore, ...restaurant }) => restaurant); // Remove score from final result


    return filteredRestaurants;
  }, [restaurants, searchTerm]);


  // Handlers
  const handleAddRestaurant = useCallback(async (name: string) => {
    const success = await addRestaurant(name);
    if (success) {
      setShowAddForm(false);
      setSearchTerm(''); // Clear search when new restaurant is added
    }
  }, [addRestaurant]);


  const handleDeleteRestaurant = useCallback(async (restaurantId: string) => {
    await deleteRestaurant(restaurantId);
  }, [deleteRestaurant]);


  const handleImportRestaurant = useCallback(async (geoapifyPlace: any) => {
    const restaurantId = await importRestaurant(geoapifyPlace);
    if (restaurantId) {
      clearSearchResults();
      setSearchTerm('');
    }
  }, [importRestaurant, clearSearchResults]);


  // Enhanced search handler that triggers both local and online search
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    
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
        searchRestaurants(newSearchTerm, 'Seattle, WA');
      }
    }, 500);
    
    setSearchDebounceTimer(timer);
  }, [searchRestaurants, clearSearchResults, searchDebounceTimer]);


  const handleResetSearch = useCallback(() => {
    resetSearch();
    setSearchTerm('');
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      setSearchDebounceTimer(null);
    }
  }, [resetSearch, searchDebounceTimer]);


  if (isLoading) {
    return <LoadingScreen />;
  }


  const hasSearchResults = searchTerm.trim() && filteredAndSortedRestaurants.length > 0;
  const hasSearchTerm = searchTerm.trim().length > 0;
  const showNoResults = hasSearchTerm && filteredAndSortedRestaurants.length === 0;


  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="w-10" /> {/* Spacer */}
          
          <h1 className="text-xl text-center flex-1 tracking-wide mx-2" style={{...FONTS.elegant, color: COLORS.text}}>
            Restaurants
          </h1>
          
          <button 
            onClick={() => setShowAdvancedSort(!showAdvancedSort)}
            className={`p-2 rounded-full hover:opacity-80 active:opacity-70 transition-all focus:outline-none flex items-center justify-center`}
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


          {showAdvancedSort && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 style={{...FONTS.elegant, color: COLORS.text, fontSize: '16px', fontWeight: '500', marginBottom: '12px'}}>
                Sort restaurants by:
              </h3>
              <div className="flex gap-2">
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'date', label: 'Date Added' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as 'name' | 'date')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === option.value 
                        ? 'bg-white text-gray-800' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    style={{...FONTS.elegant, color: sortBy === option.value ? COLORS.textDark : COLORS.textWhite }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!showAddForm && (
            <div className="space-y-4">
              {/* UPDATED: Search Box container with marginBottom */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4" style={{ marginBottom: SIZES.lg /* Added space */ }}>
                <div className="flex items-center justify-between mb-2">
                  <label style={{
                    ...FONTS.elegant,
                    fontSize: '1.1rem', 
                    fontWeight: '600', 
                    color: COLORS.text
                  }}>
                    Search for a restaurant
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
                  placeholder="e.g., Starbucks, Cafe Flora, Dick's Drive-In..."
                  className="w-full outline-none focus:ring-2 focus:ring-white/50"
                  style={{
                    ...FONTS.elegant,
                    padding: '12px 16px', 
                    borderRadius: STYLES.borderRadiusMedium, 
                    fontSize: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    color: COLORS.textDark, 
                    boxSizing: 'border-box',
                    WebkitAppearance: 'none',
                    border: `1px solid ${COLORS.text}`, 
                  }}
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
                    <div>
                      {filteredAndSortedRestaurants.length > 0 
                        ? `Found ${filteredAndSortedRestaurants.length} in your restaurants`
                        : 'No matching restaurants in your list'
                      }
                    </div>
                    {isSearching && (
                      <div style={{ marginTop: '4px' }}>
                        🔍 Searching online...
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        ✨ Found {searchResults.length} online results
                      </div>
                    )}
                  </div>
                )}
              </div>


              {(showNoResults && searchResults.length === 0 && hasSearchTerm) && ( 
                <div className="text-center">
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      ...STYLES.addButton, 
                      padding: '14px 24px', 
                      fontSize: '16px',     
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}
                  >
                    Don't see your restaurant? Add it here
                  </button>
                </div>
              )}
            </div>
          )}


          {showAddForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSearchTerm(''); 
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


              <AddRestaurantForm
                show={true}
                onToggleShow={() => setShowAddForm(false)}
                onSubmit={handleAddRestaurant}
              />
            </div>
          )}


          {!showAddForm && (
            <div className="space-y-4">
              {filteredAndSortedRestaurants.length > 0 && (
                <div>
                  {hasSearchResults && (
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
                  )}
                  
                  {filteredAndSortedRestaurants.map((restaurant, index) => (
                    <div key={restaurant.id}>
                      <RestaurantCard
                        restaurant={restaurant}
                        onDelete={handleDeleteRestaurant}
                        onNavigateToMenu={onNavigateToMenu}
                      />
                      {(index < filteredAndSortedRestaurants.length - 1 || searchResults.length > 0) && (
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


              {searchResults.length > 0 && (
                <div>
                  <div className="text-center mb-4">
                    <h3 style={{
                      ...FONTS.elegant,
                      color: COLORS.text,
                      fontSize: '18px',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {filteredAndSortedRestaurants.length > 0 ? 'Found online:' : 'Online results:'}
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
                          disabled={isLoadingDetails}
                          style={{
                            ...STYLES.addButton, 
                            padding: '8px 16px', 
                            fontSize: '14px',    
                            opacity: isLoadingDetails ? 0.6 : 1
                          }}
                           onMouseEnter={(e) => { if(!isLoadingDetails) e.currentTarget.style.backgroundColor = COLORS.addButtonHover; }}
                           onMouseLeave={(e) => { if(!isLoadingDetails) e.currentTarget.style.backgroundColor = COLORS.addButtonBg; }}
                        >
                          {isLoadingDetails ? 'Adding...' : 'Add'}
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


              {filteredAndSortedRestaurants.length === 0 && searchResults.length === 0 && !hasSearchTerm && restaurants.length === 0 && (
                 <div className="text-center py-12">
                    <div>
                      <div className="text-6xl mb-4">🍽️</div>
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>
                        No restaurants yet
                      </p>
                      <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7, marginBottom: '16px'}}>
                        Add your first restaurant to get started!
                      </p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        style={STYLES.addButton} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}
                      >
                        Add First Restaurant
                      </button>
                    </div>
                  </div>
              )}
               {filteredAndSortedRestaurants.length === 0 && searchResults.length === 0 && hasSearchTerm && (
                 <div className="text-center py-12">
                    <div>
                      <div className="text-4xl mb-4">🔍</div>
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>
                        No restaurants found for "{searchTerm}"
                      </p>
                      <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7, marginBottom: '16px'}}>
                        {isSearching ? 'Still searching online...' : 'Try a different search term or add this restaurant.'}
                      </p>
                    </div>
                </div>
              )}

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