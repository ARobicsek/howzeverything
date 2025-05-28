// src/MenuScreen.tsx
import React, { useState, useEffect } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants';
import { supabase } from './supabaseClient';

interface Dish {
  id: string;
  name: string;
  rating: number;
  dateAdded: string;
  restaurant_id: string;
  comments?: string | null;
  photo_urls?: string[] | null;
  created_at: string;
}

interface RestaurantInfo {
  id: string;
  name: string;
}

interface MenuScreenProps {
  restaurantId: string;
  onNavigateBack: () => void;
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;
  currentAppScreen: GlobalAppScreenType;
}

const StarRating: React.FC<{ 
  rating: number; 
  onRatingChange?: (rating: number) => void; 
  readonly?: boolean 
}> = ({ rating, onRatingChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => !readonly && onRatingChange?.(star)}
        disabled={readonly}
        className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 focus:outline-none'}`}
        style={{
          color: star <= rating ? COLORS.star : COLORS.starEmpty,
          background: 'none',
          border: 'none',
          padding: '4px',
          fontSize: '1.375rem',
          lineHeight: '1'
        }}
        aria-label={readonly ? `${rating} of 5 stars` : `Rate ${star} of 5 stars`}
      >
        ★
      </button>
    ))}
  </div>
);


const MenuScreen: React.FC<MenuScreenProps> = ({
  restaurantId,
  onNavigateBack,
  onNavigateToScreen,
  currentAppScreen
}) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [newDishName, setNewDishName] = useState('');
  const [newDishRating, setNewDishRating] = useState<number>(5);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) {
        console.error('Error fetching restaurant details:', restaurantError);
        setError('Failed to load restaurant details.');
        setRestaurant(null);
      } else if (restaurantData) {
        setRestaurant(restaurantData);
      } else {
        setError('Restaurant not found.');
        setRestaurant(null);
      }

      const { data: dishesData, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order(sortBy === 'name' ? 'name' : sortBy === 'rating' ? 'rating' : 'created_at', { 
            ascending: sortBy === 'name' ? true : (sortBy === 'rating' ? false : false)
        });


      if (dishesError) {
        console.error('Error fetching dishes:', dishesError);
        setError(prevError => prevError ? `${prevError} Failed to load dishes.` : 'Failed to load dishes.');
      } else if (dishesData) {
        setDishes(dishesData);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [restaurantId, sortBy]);

  const addDish = async () => {
    if (newDishName.trim() && restaurantId) {
      setError(null);
      try {
        const { data: newDishData, error: insertError } = await supabase
          .from('dishes')
          .insert([
            {
              name: newDishName.trim(),
              rating: newDishRating,
              dateAdded: new Date().toISOString(),
              restaurant_id: restaurantId,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error adding dish:', insertError);
          setError('Failed to add dish. Please try again.');
          throw insertError;
        }

        if (newDishData) {
          setDishes(prevDishes => [newDishData, ...prevDishes].sort((a,b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return 0;
          }));
          setNewDishName('');
          setNewDishRating(5);
          setShowAddForm(false);
        }
      } catch (catchedError) {
        console.error('Caught error in addDish:', catchedError);
      }
    }
  };

  const deleteDish = async (dishId: string) => {
    setError(null);
    if (window.confirm('Are you sure you want to delete this dish?')) {
        try {
            const { error: deleteError } = await supabase
            .from('dishes')
            .delete()
            .eq('id', dishId);

            if (deleteError) {
            console.error('Error deleting dish:', deleteError);
            setError('Failed to delete dish. Please try again.');
            throw deleteError;
            }

            setDishes(prevDishes => prevDishes.filter(dish => dish.id !== dishId));
        } catch (catchedError) {
            console.error('Caught error in deleteDish:', catchedError);
        }
    }
  };

  const updateDishRating = async (dishId: string, newRating: number) => {
    setError(null);
    try {
      const { data: updatedDish, error: updateError } = await supabase
        .from('dishes')
        .update({ rating: newRating })
        .eq('id', dishId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating dish rating:', updateError);
        setError('Failed to update rating. Please try again.');
        throw updateError;
      }
      
      if (updatedDish) {
        setDishes(prevDishes => 
          prevDishes.map(dish => (dish.id === dishId ? updatedDish : dish))
        );
      }
    } catch (catchedError) {
      console.error('Caught error in updateDishRating:', catchedError);
    }
  };

  const filteredAndSortedDishes = dishes
    .filter(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
        <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
          <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-between">
            <button onClick={onNavigateBack} className="transition-colors focus:outline-none" style={{ background: 'none', border: 'none', padding: '0', margin: '0', color: COLORS.text, cursor: 'pointer' }} aria-label="Go back">
              <svg className="w-6 h-6" fill="none" stroke={COLORS.text} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>Menu</h1>
            <div className="w-6" />
          </div>
        </header>
        <main className="flex-1 px-6 py-6 text-center" style={{ paddingBottom: STYLES.mainContentPadding }}>
          <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>Loading menu...</p>
        </main>
        <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
      </div>
    );
  }
  
  if (!restaurant && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
        <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
           <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-between">
            <button onClick={onNavigateBack} className="transition-colors focus:outline-none" style={{ background: 'none', border: 'none', padding: '0', margin: '0', color: COLORS.text, cursor: 'pointer' }} aria-label="Go back">
              <svg className="w-6 h-6" fill="none" stroke={COLORS.text} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>Menu</h1>
            <div className="w-6" />
          </div>
        </header>
        <main className="flex-1 px-6 py-6" style={{ paddingBottom: STYLES.mainContentPadding }}>
          <div className="max-w-md mx-auto text-center py-16">
            <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>{error || 'Restaurant not found'}</p>
          </div>
        </main>
        <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-between">
          <button onClick={onNavigateBack} className="transition-colors focus:outline-none" style={{ background: 'none', border: 'none', padding: '0', margin: '0', color: COLORS.text, cursor: 'pointer' }} aria-label="Go back">
            <svg className="w-6 h-6" fill="none" stroke={COLORS.text} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>Menu</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 px-6 py-6" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-6">
          {restaurant && (
            <div className="text-center">
              <h1 className="text-2xl" style={{...FONTS.elegant, color: COLORS.text, fontWeight: '400'}}>
                {restaurant.name}
              </h1>
            </div>
          )}

          {error && !error.includes("Restaurant not found") && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{error}</p>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            {!showAddForm ? (
              <div className="flex justify-center">
                <button onClick={() => setShowAddForm(true)} className="transition-all duration-300 transform hover:scale-105 focus:outline-none" style={STYLES.primaryButton} onMouseEnter={(e) => e.currentTarget.style.background = COLORS.primaryHover} onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}>
                  + Add New Dish
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <input type="text" value={newDishName} onChange={(e) => setNewDishName(e.target.value)} placeholder="Enter dish name..." className="px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 text-gray-800 w-full" style={{ background: 'white', fontSize: '1rem', ...FONTS.elegant, color: COLORS.textDark }} autoFocus onKeyPress={(e) => { if (e.key === 'Enter' && newDishName.trim()) addDish(); }} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm" style={{...FONTS.elegant, color: COLORS.text}}>Rate this dish:</p>
                  <StarRating rating={newDishRating} onRatingChange={setNewDishRating} />
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={addDish} disabled={!newDishName.trim()} className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1" style={{ ...STYLES.formButton, background: !newDishName.trim() ? COLORS.disabled : COLORS.success }} onMouseEnter={(e) => { if (newDishName.trim()) e.currentTarget.style.background = COLORS.successHover; }} onMouseLeave={(e) => { if (newDishName.trim()) e.currentTarget.style.background = COLORS.success; }}>
                    Add Dish
                  </button>
                  <button onClick={() => { setShowAddForm(false); setNewDishName(''); setNewDishRating(5); setError(null);}} className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1" style={STYLES.secondaryButton} onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.secondaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.secondary; }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search and Sort Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mt-6">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dishes..."
                className={`px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 w-full ${showAddForm ? 'opacity-60' : 'text-gray-800'}`}
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
                {(['name', 'rating', 'date'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-white ${showAddForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      background: sortBy === option ? 'white' : 'transparent',
                      color: sortBy === option ? COLORS.textDark : COLORS.text,
                      border: sortBy === option ? 'none' : `1px solid ${COLORS.text}a`,
                      ...FONTS.elegant
                    }}
                    disabled={showAddForm}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {!isLoading && filteredAndSortedDishes.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl mb-2" style={{...FONTS.elegant, color: COLORS.text}}>
                  {searchTerm ? 'No dishes found' : (restaurant ? 'No dishes yet for this restaurant' : 'Loading dishes...')}
                </h3>
                <p className="text-sm" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>
                  {searchTerm ? 'Try a different search term' : (restaurant ? 'Add your first dish to start rating!' : '')}
                </p>
              </div>
            ) : (
              filteredAndSortedDishes.map((dish, index) => (
                <div key={dish.id}>
                  <div className="bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}> {/* Using inline styles to ensure no conflicts */}
                          <h3 style={{ ...FONTS.elegant, fontWeight: '500', color: COLORS.text, margin: 0, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                            {dish.name}
                          </h3>
                          <button 
                            onClick={() => deleteDish(dish.id)} 
                            className="p-2 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none"
                            aria-label={`Delete ${dish.name}`}
                            style={{
                              color: COLORS.text, 
                              marginLeft: '24px', 
                              marginTop: '2px',
                              flexShrink: 0
                            }} 
                            onMouseEnter={(e) => e.currentTarget.style.color = COLORS.danger}
                            onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs mb-2" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.6}}>
                            Rated on: {new Date(dish.dateAdded).toLocaleDateString()}
                        </p>
                        <div className="mb-2">
                          <StarRating rating={dish.rating} onRatingChange={(newRating) => updateDishRating(dish.id, newRating)} />
                        </div>
                        {dish.comments && (
                          <p className="text-sm" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.6}}>
                            {dish.comments}
                          </p>
                        )}
                      </div>
                      <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0">
                        <div style={{color: COLORS.text, opacity: 0.4}} className="text-2xl">📷</div>
                      </div>
                    </div>
                  </div>
                  {index < filteredAndSortedDishes.length - 1 && (
                    <div className="h-px bg-white/10"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
    </div>
  );
};

export default MenuScreen;