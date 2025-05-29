// src/RestaurantScreen.tsx
import React, { useState, useEffect } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants.ts';
import { supabase } from './supabaseClient';

interface Restaurant {
  id: string;
  name: string;
  dateAdded: string;
  created_at: string;
}

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
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')
        .order(sortBy === 'name' ? 'name' : 'created_at', { ascending: sortBy === 'name' ? true : false });

      if (fetchError) {
        console.error('Error fetching restaurants:', fetchError);
        setError('Failed to load restaurants. Please try again.');
      } else if (data) {
        setRestaurants(data);
      }
      setIsLoading(false);
    };

    fetchRestaurants();
  }, [sortBy]);

  const addRestaurant = async () => {
    if (newRestaurantName.trim()) {
      setError(null);
      try {
        const { data: newRestaurantData, error: insertError } = await supabase
          .from('restaurants')
          .insert([
            {
              name: newRestaurantName.trim(),
              dateAdded: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error adding restaurant:', insertError);
          setError('Failed to add restaurant. Please try again.');
          throw insertError;
        }

        if (newRestaurantData) {
          setRestaurants(prevRestaurants => [newRestaurantData, ...prevRestaurants].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return 0;
          }));
          setNewRestaurantName('');
          setShowAddForm(false);
        }
      } catch (catchedError) {
        console.error('Caught error in addRestaurant:', catchedError);
      }
    }
  };

  const deleteRestaurant = async (restaurantId: string) => {
    if (window.confirm('Are you sure you want to delete this restaurant and all its dishes?')) {
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('restaurants')
          .delete()
          .eq('id', restaurantId);

        if (deleteError) {
          console.error('Error deleting restaurant:', deleteError);
          setError('Failed to delete restaurant. Please try again.');
          throw deleteError;
        }

        setRestaurants(prevRestaurants => prevRestaurants.filter(r => r.id !== restaurantId));
      } catch (catchedError) {
        console.error('Caught error in deleteRestaurant:', catchedError);
      }
    }
  };

  const filteredAndSortedRestaurants = restaurants
    .filter(restaurant => restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-between">
          <div className="w-6" />
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
            My Restaurants
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 px-6 py-6" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-6">
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="transition-all duration-300 transform hover:scale-105 focus:outline-none"
                style={STYLES.primaryButton}
                onMouseEnter={(e) => e.currentTarget.style.background = COLORS.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
              >
                + Add New Restaurant
              </button>
            ) : (
              <div className="bg-white/5 p-4 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Enter restaurant name"
                  value={newRestaurantName}
                  onChange={(e) => setNewRestaurantName(e.target.value)}
                  className="px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 text-gray-800 w-full"
                  style={{ background: 'white', fontSize: '1rem', ...FONTS.elegant, color: COLORS.textDark }}
                  autoFocus
                  onKeyPress={(e) => { if (e.key === 'Enter' && newRestaurantName.trim()) addRestaurant(); }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={addRestaurant}
                    disabled={!newRestaurantName.trim()}
                    className="flex-1 py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                    style={{
                      ...STYLES.formButton,
                      background: !newRestaurantName.trim() ? COLORS.disabled : COLORS.success,
                    }}
                    onMouseEnter={(e) => {if(newRestaurantName.trim()) e.currentTarget.style.background = COLORS.successHover;}}
                    onMouseLeave={(e) => {if(newRestaurantName.trim()) e.currentTarget.style.background = COLORS.success;}}
                  >
                    Save Restaurant
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewRestaurantName(''); setError(null); }}
                    className="flex-1 py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
                    style={STYLES.secondaryButton}
                    onMouseEnter={(e) => e.currentTarget.style.background = COLORS.secondaryHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = COLORS.secondary}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{error}</p>
            </div>
          )}

          {/* Search and Sort Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mt-6">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 w-full ${showAddForm ? 'opacity-60' : 'text-gray-800'}`}
                style={{ 
                  background: showAddForm ? COLORS.disabled : 'white', 
                  fontSize: '1rem', 
                  ...FONTS.elegant, 
                  color: showAddForm ? COLORS.text : COLORS.textDark,
                  cursor: showAddForm ? 'not-allowed' : 'auto'
                }}
                disabled={showAddForm}
              />
              <div className="flex gap-2 justify-center">
                {(['name', 'date'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-white ${showAddForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      background: sortBy === option ? 'white' : 'transparent',
                      color: sortBy === option ? COLORS.textDark : COLORS.text,
                      border: sortBy === option ? 'none' : `1px solid ${COLORS.text}a`,
                      ...FONTS.elegant,
                    }}
                    disabled={showAddForm}
                  >
                    {option === 'name' ? 'Name' : 'Date Added'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {isLoading && (
            <div className="text-center py-12">
              <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>Loading restaurants...</p>
            </div>
          )}

          {!isLoading && filteredAndSortedRestaurants.length === 0 && (
            <div className="text-center py-12">
              <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>
                {searchTerm ? 'No restaurants found matching your search.' : 'No restaurants yet. Add your first one!'}
              </p>
            </div>
          )}

          {!isLoading && filteredAndSortedRestaurants.length > 0 && (
            <div className="space-y-4">
              {filteredAndSortedRestaurants.map(restaurant => (
                <div key={restaurant.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start"> 
                    <div className="flex-1"> 
                  <div style={{display: 'flex', alignItems: 'center'}}> {/* Using inline styles */}
                    <button
                      onClick={() => onNavigateToMenu(restaurant.id)}
                      className="text-left"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <h2 className="text-xl mb-1 hover:underline" style={{...FONTS.elegant, fontWeight: '500', color: COLORS.text, margin: 0}}>
                        {restaurant.name}
                      </h2>
                    </button>
                    <button
                      onClick={() => deleteRestaurant(restaurant.id)}
                      className="p-2 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none"
                      aria-label={`Delete ${restaurant.name}`}
                      style={{
                        color: COLORS.text, 
                        marginLeft: '24px', // Explicit pixel spacing
                        marginTop: '2px',   // Fine-tune vertical alignment
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = COLORS.danger}
                      onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.6}}>
                    Added: {new Date(restaurant.dateAdded).toLocaleDateString()}
                  </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
    </div>
  );
};

export default RestaurantScreen;