// src/RestaurantScreen.tsx
import React, { useState, useCallback } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import RestaurantCard from './components/restaurant/RestaurantCard';
import AddRestaurantForm from './components/restaurant/AddRestaurantForm';
import RestaurantSearchAndSort from './components/restaurant/RestaurantSearchAndSort';
import RestaurantSearchForm from './components/restaurant/RestaurantSearchForm';
import RestaurantSearchResults from './components/restaurant/RestaurantSearchResults';
import LoadingScreen from './components/LoadingScreen';
import { useRestaurants } from './hooks/useRestaurants';
import { COLORS, FONTS, STYLES } from './constants';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';

interface RestaurantScreenProps {
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;
  onNavigateToMenu: (restaurantId: string) => void;
  currentAppScreen: GlobalAppScreenType;
}

const RestaurantScreen: React.FC<RestaurantScreenProps> = ({
  onNavigateToScreen,
  onNavigateToMenu,
  currentAppScreen
}) => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearchSort, setShowSearchSort] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false); // NEW: Controls showing add options
  const [searchMode, setSearchMode] = useState<'manual' | 'online'>('manual');

  // Custom Hooks
  const {
    restaurants,
    isLoading,
    error,
    addRestaurant,
    deleteRestaurant,
    // New search functionality
    searchResults,
    isSearching,
    searchError,
    isLoadingDetails,
    restaurantErrors,
    searchRestaurants,
    importRestaurant,
    clearSearchResults,
    resetSearch // New reset function
  } = useRestaurants(sortBy);

  // Handlers with useCallback to prevent infinite loops
  const handleAddRestaurant = useCallback(async (name: string) => {
    const success = await addRestaurant(name);
    if (success) {
      setShowAddForm(false);
      setShowAddOptions(false); // Close the add options after successful add
    }
  }, [addRestaurant]);

  const handleDeleteRestaurant = useCallback(async (restaurantId: string) => {
    await deleteRestaurant(restaurantId);
  }, [deleteRestaurant]);

  const handleImportRestaurant = useCallback(async (geoapifyPlace: any) => {
    const restaurantId = await importRestaurant(geoapifyPlace);
    if (restaurantId) {
      clearSearchResults();
      setSearchMode('manual');
      setShowAddOptions(false); // Close the add options after successful import
      // Optionally navigate to the imported restaurant's menu
      // onNavigateToMenu(restaurantId);
    }
  }, [importRestaurant, clearSearchResults]);

  // Stabilized search function to prevent infinite loops
  const handleSearchRestaurants = useCallback((query: string, location: string) => {
    searchRestaurants(query, location);
  }, [searchRestaurants]);

  // New reset handler
  const handleResetSearch = useCallback(() => {
    resetSearch();
  }, [resetSearch]);

  // Enhanced search mode toggle with reset
  const handleSearchModeToggle = useCallback(() => {
    if (searchMode === 'online') {
      // If switching away from online mode, reset search
      resetSearch();
    }
    setSearchMode('online');
  }, [searchMode, resetSearch]);

  // NEW: Handle opening add options
  const handleShowAddOptions = useCallback(() => {
    setShowAddOptions(true);
    setShowAddForm(false);
    clearSearchResults();
    resetSearch();
  }, [clearSearchResults, resetSearch]);

  // NEW: Handle closing add options
  const handleCloseAddOptions = useCallback(() => {
    setShowAddOptions(false);
    setShowAddForm(false);
    clearSearchResults();
    resetSearch();
    setSearchMode('manual');
  }, [clearSearchResults, resetSearch]);

  // Loading State
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="w-10" />
          
          <h1 className="text-xl text-center flex-1 tracking-wide mx-2" style={{...FONTS.elegant, color: COLORS.text}}>
            Restaurants
          </h1>
          
          <button 
            onClick={() => setShowSearchSort(!showSearchSort)}
            className={`p-2 rounded-full hover:bg-white/25 active:bg-white/30 transition-colors focus:outline-none flex items-center justify-center`}
            style={{ 
              color: showSearchSort ? COLORS.textWhite : COLORS.text,
              background: showSearchSort ? COLORS.danger : 'transparent',
              width: '40px', 
              height: '40px' 
            }}
            aria-label="Toggle search and sort"
          >
            {/* Simplified search icon for better mobile compatibility */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{error}</p>
            </div>
          )}

          {/* NEW FLOW: Add Restaurant Section */}
          {!showSearchSort && (
            <div className="space-y-4">
              {!showAddOptions ? (
                // Show big blue "Add New Restaurant" button
                <div className="flex justify-center">
                  <button
                    onClick={handleShowAddOptions}
                    className="transition-all duration-300 transform hover:scale-105 focus:outline-none w-full text-white"
                    style={{
                      ...STYLES.primaryButton,
                      background: COLORS.primary,
                      padding: '0.8rem 2rem',
                      fontSize: '1.1rem',
                      borderRadius: '16px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = COLORS.primaryHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
                  >
                    + Add New Restaurant
                  </button>
                </div>
              ) : (
                // Show add options flow
                <div className="space-y-4">
                  {/* Back Button */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleCloseAddOptions}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none"
                      style={{ color: COLORS.text }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                      </svg>
                    </button>
                    <h2 style={{...FONTS.elegant, color: COLORS.text, fontSize: '1.1rem', fontWeight: 500}}>
                      Add Restaurant
                    </h2>
                    <div className="w-10" />
                  </div>

                  {/* Mode Toggle Buttons - UPDATED: Explicit height instead of padding */}
                  <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1">
                    <button
                      onClick={() => {
                        setSearchMode('manual');
                        clearSearchResults();
                      }}
                      className={`flex-1 px-4 rounded-xl transition-colors focus:outline-none flex items-center justify-center ${
                        searchMode === 'manual' ? 'bg-white text-gray-800' : 'text-white hover:bg-white/10'
                      }`}
                      style={{
                        ...FONTS.elegant,
                        fontSize: '0.9rem',
                        height: '50px' // Explicit height - double the original ~30px
                      }}
                    >
                      Add Manually
                    </button>
                    <button
                      onClick={handleSearchModeToggle}
                      className={`flex-1 px-4 rounded-xl transition-colors focus:outline-none flex items-center justify-center ${
                        searchMode === 'online' ? 'bg-white text-gray-800' : 'text-white hover:bg-white/10'
                      }`}
                      style={{
                        ...FONTS.elegant,
                        fontSize: '0.9rem',
                        height: '50px' // Explicit height - double the original ~30px
                      }}
                    >
                      Search Online
                    </button>
                  </div>

                  {/* Conditional Form Display */}
                  {searchMode === 'manual' ? (
                    <AddRestaurantForm
                      show={showAddForm}
                      onToggleShow={() => setShowAddForm(!showAddForm)}
                      onSubmit={handleAddRestaurant}
                    />
                  ) : (
                    <div className="space-y-4">
                      <RestaurantSearchForm
                        onSearch={handleSearchRestaurants}
                        onReset={handleResetSearch}
                        isSearching={isSearching}
                        disabled={showAddForm}
                      />
                      
                      {searchError && (
                        <div className="bg-red-500/20 p-3 rounded-lg text-center">
                          <p style={{color: COLORS.danger, ...FONTS.elegant}}>{searchError}</p>
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <RestaurantSearchResults
                          results={searchResults}
                          onSelectRestaurant={handleImportRestaurant}
                          isImporting={isLoading}
                          isLoadingDetails={isLoadingDetails}
                          restaurantErrors={restaurantErrors}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Search and Sort */}
          {showSearchSort && (
            <RestaurantSearchAndSort
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              disabled={showAddForm}
            />
          )}

          {/* Restaurants List */}
          <div className="space-y-4" style={{ marginTop: '32px' }}>
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>
                  {searchTerm ? 'No restaurants found matching your search.' : 'No restaurants yet. Add your first one!'}
                </p>
              </div>
            ) : (
              <>
                {filteredRestaurants.map((restaurant, index) => (
                  <div key={restaurant.id}>
                    <RestaurantCard
                      restaurant={restaurant}
                      onDelete={handleDeleteRestaurant}
                      onNavigateToMenu={onNavigateToMenu}
                    />
                    {/* Add subtle separator line between restaurant cards, except for the last one */}
                    {index < filteredRestaurants.length - 1 && (
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
              </>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNav={onNavigateToScreen} 
        activeScreenValue={currentAppScreen} 
      />
    </div>
  );
};

export default RestaurantScreen;