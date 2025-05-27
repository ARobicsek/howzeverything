import React, { useState, useEffect } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants';

interface Dish {
  id: string;
  name: string;
  rating: number;
  dateAdded: string;
  restaurantId: string;
  comments?: string;
}

interface Restaurant {
  id: string;
  name: string;
  dateAdded: string;
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
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [newDishName, setNewDishName] = useState('');
  const [newDishRating, setNewDishRating] = useState<number>(5);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('name');

  useEffect(() => {
    const savedRestaurants = localStorage.getItem('howzeverything-restaurants');
    if (savedRestaurants) {
      const restaurantsData: Restaurant[] = JSON.parse(savedRestaurants);
      const foundRestaurant = restaurantsData.find(r => r.id === restaurantId);
      setRestaurant(foundRestaurant || null);
    }
    
    const savedDishes = localStorage.getItem('howzeverything-dishes');
    if (savedDishes) {
      const allDishes: Dish[] = JSON.parse(savedDishes);
      const restaurantDishes = allDishes.filter(dish => dish.restaurantId === restaurantId);
      setDishes(restaurantDishes);
    }
  }, [restaurantId]);

  const saveDishes = (updatedDishes: Dish[]) => {
    setDishes(updatedDishes);
    const savedDishes = localStorage.getItem('howzeverything-dishes');
    const allDishes: Dish[] = savedDishes ? JSON.parse(savedDishes) : [];
    const otherRestaurantDishes = allDishes.filter(dish => dish.restaurantId !== restaurantId);
    const newAllDishes = [...otherRestaurantDishes, ...updatedDishes];
    localStorage.setItem('howzeverything-dishes', JSON.stringify(newAllDishes));
  };

  const addDish = () => {
    if (newDishName.trim()) {
      const newDish: Dish = {
        id: Date.now().toString(),
        name: newDishName.trim(),
        rating: newDishRating,
        dateAdded: new Date().toLocaleDateString(),
        restaurantId: restaurantId
      };
      saveDishes([newDish, ...dishes]);
      setNewDishName('');
      setNewDishRating(5);
      setShowAddForm(false);
    }
  };

  const deleteDish = (dishId: string) => {
    saveDishes(dishes.filter(dish => dish.id !== dishId));
  };

  const updateDishRating = (dishId: string, newRating: number) => {
    saveDishes(dishes.map(dish => dish.id === dishId ? { ...dish, rating: newRating } : dish));
  };

  const filteredAndSortedDishes = dishes
    .filter(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'date':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return 0;
      }
    });

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
        <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
          <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-between">
            <button
              onClick={onNavigateBack}
              className="transition-colors focus:outline-none"
              style={{ background: 'none', border: 'none', padding: '0', margin: '0', color: COLORS.text, cursor: 'pointer' }}
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke={COLORS.text} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
              Menu
            </h1>
            <div className="w-6" />
          </div>
        </header>
        <main className="flex-1 px-6 py-6" style={{ paddingBottom: STYLES.mainContentPadding }}>
          <div className="max-w-md mx-auto text-center py-16">
            <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>Restaurant not found</p>
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
          <button
            onClick={onNavigateBack}
            className="transition-colors focus:outline-none"
            style={{ background: 'none', border: 'none', padding: '0', margin: '0', color: COLORS.text, cursor: 'pointer' }}
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke={COLORS.text} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
            Menu
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 px-6 py-6" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl" style={{...FONTS.elegant, color: COLORS.text, fontWeight: '400'}}>
              {restaurant.name}
            </h1>
          </div>

          {/* Add Dish Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            {!showAddForm ? (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="transition-all duration-300 transform hover:scale-105 focus:outline-none"
                  style={STYLES.primaryButton}
                  onMouseEnter={(e) => e.currentTarget.style.background = COLORS.primaryHover}
                  onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
                >
                  + Add New Dish
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <input
                    type="text"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="Enter dish name..."
                    className="px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 text-gray-800 w-full"
                    style={{ background: 'white', fontSize: '1rem', ...FONTS.elegant, color: COLORS.textDark }}
                    autoFocus
                    onKeyPress={(e) => { if (e.key === 'Enter' && newDishName.trim()) addDish(); }}
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm" style={{...FONTS.elegant, color: COLORS.text}}>Rate this dish:</p>
                  <StarRating rating={newDishRating} onRatingChange={setNewDishRating} />
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={addDish}
                    disabled={!newDishName.trim()}
                    className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
                    style={{
                      ...STYLES.formButton,
                      background: !newDishName.trim() ? COLORS.disabled : COLORS.success
                    }}
                    onMouseEnter={(e) => { if (newDishName.trim()) e.currentTarget.style.background = COLORS.successHover; }}
                    onMouseLeave={(e) => { if (newDishName.trim()) e.currentTarget.style.background = COLORS.success; }}
                  >
                    Add Dish
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewDishName(''); setNewDishRating(5); }}
                    className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
                    style={STYLES.secondaryButton}
                    onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.secondaryHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.secondary; }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search and Sort Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dishes..."
                className="px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 text-gray-800 w-full"
                style={{ background: 'white', fontSize: '1rem', ...FONTS.elegant, color: COLORS.textDark }}
              />
              <div className="flex gap-2 justify-center">
                {(['name', 'rating', 'date'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className="px-3 py-1 rounded-lg text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-white"
                    style={{
                      background: sortBy === option ? 'white' : 'transparent',
                      color: sortBy === option ? COLORS.textDark : COLORS.text,
                      border: sortBy === option ? 'none' : `1px solid ${COLORS.text}a`,
                      ...FONTS.elegant
                    }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dishes List */}
          <div className="space-y-1">
            {filteredAndSortedDishes.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl mb-2" style={{...FONTS.elegant, color: COLORS.text}}>
                  {searchTerm ? 'No dishes found' : 'No dishes yet'}
                </h3>
                <p className="text-sm" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>
                  {searchTerm ? 'Try a different search term' : 'Add your first dish to start rating!'}
                </p>
              </div>
            ) : (
              filteredAndSortedDishes.map((dish, index) => (
                <div key={dish.id}>
                  <div className="bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg" style={{ ...FONTS.elegant, fontWeight: '500', color: COLORS.text }}>
                            {dish.name}
                          </h3>
                          <button
                            onClick={() => deleteDish(dish.id)}
                            className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none ml-1"
                            style={{color: COLORS.text}}
                            onMouseEnter={(e) => e.currentTarget.style.color = COLORS.danger}
                            onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}
                            aria-label={`Delete ${dish.name}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                            </svg>
                          </button>
                        </div>
                        <div className="mb-2">
                          <StarRating
                            rating={dish.rating}
                            onRatingChange={(newRating) => updateDishRating(dish.id, newRating)}
                          />
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