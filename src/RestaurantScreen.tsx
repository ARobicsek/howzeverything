// src/RestaurantScreen.tsx
import React, { useState } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import RestaurantCard from './components/restaurant/RestaurantCard';
import AddRestaurantForm from './components/restaurant/AddRestaurantForm';
import RestaurantSearchAndSort from './components/restaurant/RestaurantSearchAndSort';
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

  // Custom Hooks
  const {
    restaurants,
    isLoading,
    error,
    addRestaurant,
    deleteRestaurant
  } = useRestaurants(sortBy);

  // Handlers
  const handleAddRestaurant = async (name: string) => {
    const success = await addRestaurant(name);
    if (success) {
      setShowAddForm(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    await deleteRestaurant(restaurantId);
  };

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

          {/* Add Restaurant Form */}
          <AddRestaurantForm
            show={showAddForm}
            onToggleShow={() => setShowAddForm(!showAddForm)}
            onSubmit={handleAddRestaurant}
          />

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