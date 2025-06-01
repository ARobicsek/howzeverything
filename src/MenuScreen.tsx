// src/MenuScreen.tsx
import React, { useState, useMemo } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import DishCard from './components/DishCard';
import AddDishForm from './components/AddDishForm';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import { useDishes } from './hooks/useDishes';
import { useComments } from './hooks/useComments';
import { useRestaurant } from './hooks/useRestaurant';
import { COLORS, FONTS, STYLES } from './constants';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';

interface MenuScreenProps {
  restaurantId: string;
  onNavigateBack: () => void;
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;
  currentAppScreen: GlobalAppScreenType;
}

// Fuzzy search algorithm for dish names
const calculateDishSimilarity = (dishName: string, searchTerm: string): number => {
  const dish = dishName.toLowerCase().trim();
  const search = searchTerm.toLowerCase().trim();
  
  if (!search) return 100; // Show all dishes when no search term
  
  // Exact match - highest score
  if (dish === search) return 100;
  
  // Contains match - very high score
  if (dish.includes(search) || search.includes(dish)) return 95;
  
  // Word-by-word comparison
  const dishWords = dish.split(/\s+/);
  const searchWords = search.split(/\s+/);
  let wordMatches = 0;
  let partialMatches = 0;
  
  searchWords.forEach(searchWord => {
    // Check for exact word matches
    if (dishWords.some(dishWord => dishWord === searchWord)) {
      wordMatches++;
    }
    // Check for partial word matches
    else if (dishWords.some(dishWord => 
      dishWord.includes(searchWord) || 
      searchWord.includes(dishWord) ||
      // Handle common variations (accents, etc.)
      dishWord.replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e') === searchWord
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
  const longer = dish.length > search.length ? dish : search;
  const shorter = dish.length > search.length ? search : dish;
  
  if (longer.length === 0) return 100;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  const charSimilarity = (matches / longer.length) * 30;
  return Math.max(0, charSimilarity);
};

const MenuScreen: React.FC<MenuScreenProps> = ({
  restaurantId,
  onNavigateBack,
  onNavigateToScreen,
  currentAppScreen
}) => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('rating'); // Default to rating sort
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);

  // Custom Hooks
  const { restaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useRestaurant(restaurantId);
  const {
    dishes,
    isLoading: isLoadingDishes,
    error: dishesError,
    setError,
    addDish,
    deleteDish,
    updateDishRating,
    setDishes
  } = useDishes(restaurantId, sortBy);
  
  const {
    isSubmitting: isSubmittingComment,
    addComment,
    updateComment,
    deleteComment
  } = useComments();

  // Enhanced dish filtering with fuzzy search
  const filteredAndSortedDishes = useMemo(() => {
    if (!searchTerm.trim()) {
      return dishes; // Return all dishes when no search term
    }

    // Calculate similarity scores and filter
    const dishesWithScores = dishes.map(dish => ({
      ...dish,
      similarityScore: calculateDishSimilarity(dish.name, searchTerm)
    }));

    // Filter dishes with reasonable similarity (> 20 for very loose matching)
    const filteredDishes = dishesWithScores
      .filter(dish => dish.similarityScore > 20)
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity first
      .map(({ similarityScore, ...dish }) => dish); // Remove score from final result

    return filteredDishes;
  }, [dishes, searchTerm]);

  // Handlers
  const handleAddDish = async (name: string, rating: number) => {
    const success = await addDish(name, rating);
    if (success) {
      setShowAddForm(false);
      setSearchTerm(''); // Clear search when new dish is added
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
  };

  const handleAddComment = async (dishId: string, text: string) => {
    try {
      const newComment = await addComment(dishId, text);
      if (newComment) {
        setDishes(prevDishes => 
          prevDishes.map(d => 
            d.id === dishId 
              ? { ...d, dish_comments: [...d.dish_comments, newComment] }
              : d
          )
        );
      }
    } catch (err: any) {
      setError(`Failed to add comment: ${err.message}`);
    }
  };

  const handleUpdateComment = async (commentId: string, dishId: string, newText: string) => {
    try {
      const updatedComment = await updateComment(commentId, newText);
      setDishes(prevDishes =>
        prevDishes.map(d => {
          if (d.id === dishId) {
            return {
              ...d,
              dish_comments: d.dish_comments.map(c =>
                c.id === commentId ? updatedComment : c
              )
            };
          }
          return d;
        })
      );
    } catch (err: any) {
      setError(`Failed to update comment: ${err.message}`);
    }
  };

  const handleDeleteComment = async (dishId: string, commentId: string) => {
    try {
      await deleteComment(commentId);
      setDishes(prevDishes =>
        prevDishes.map(d => {
          if (d.id === dishId) {
            return {
              ...d,
              dish_comments: d.dish_comments.filter(c => c.id !== commentId)
            };
          }
          return d;
        })
      );
    } catch (err: any) {
      setError(`Failed to delete comment: ${err.message}`);
    }
  };

  // Loading and Error States
  if (isLoadingRestaurant || isLoadingDishes) {
    return <LoadingScreen />;
  }

  if (restaurantError) {
    return <ErrorScreen error={restaurantError} onBack={onNavigateBack} />;
  }

  if (!restaurant) {
    return <ErrorScreen error="Restaurant not found" onBack={onNavigateBack} />;
  }

  const hasSearchResults = searchTerm.trim() && filteredAndSortedDishes.length > 0;
  const hasSearchTerm = searchTerm.trim().length > 0;
  const showNoResults = hasSearchTerm && filteredAndSortedDishes.length === 0;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={onNavigateBack}
            className="p-2 rounded-full hover:bg-white/25 active:bg-white/30 transition-colors focus:outline-none flex items-center justify-center"
            style={{ color: COLORS.text, width: '40px', height: '40px' }}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          
          <h1 
            className="text-xl text-center flex-1 tracking-wide mx-2 truncate" 
            style={{...FONTS.elegant, color: COLORS.text}}
            title={restaurant.name}
          >
            {restaurant.name}
          </h1>
          
          <button 
            onClick={() => setShowAdvancedSort(!showAdvancedSort)}
            className={`p-2 rounded-full hover:bg-white/25 active:bg-white/30 transition-colors focus:outline-none flex items-center justify-center`}
            style={{ 
              color: showAdvancedSort ? COLORS.textWhite : COLORS.text,
              background: showAdvancedSort ? COLORS.primary : 'white',
              width: '40px', 
              height: '40px',
              boxShadow: showAdvancedSort ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            aria-label="Toggle sort options"
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
          {/* Error Display */}
          {dishesError && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{dishesError}</p>
            </div>
          )}

          {/* Advanced Sort Options */}
          {showAdvancedSort && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 style={{...FONTS.elegant, color: COLORS.text, fontSize: '16px', fontWeight: '500', marginBottom: '12px'}}>
                Sort dishes by:
              </h3>
              <div className="flex gap-2">
                {[
                  { value: 'rating', label: 'Rating' },
                  { value: 'name', label: 'Name' },
                  { value: 'date', label: 'Date Added' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as 'rating' | 'name' | 'date')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === option.value 
                        ? 'bg-white text-gray-800' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    style={FONTS.elegant}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Dish Search */}
          {!showAddForm && (
            <div className="space-y-4">
              {/* Search Box */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label style={{
                    ...FONTS.elegant,
                    fontSize: '20.8px', // 30% larger than 16px
                    fontWeight: '500',
                    color: COLORS.text
                  }}>
                    Search for a dish
                  </label>
                  {/* Reset Button - 30% larger */}
                  {hasSearchTerm && (
                    <button
                      onClick={handleResetSearch}
                      style={{
                        ...FONTS.elegant,
                        backgroundColor: COLORS.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px', // Slightly larger border radius
                        padding: '6px 16px', // Increased padding
                        fontSize: '15.6px', // 30% larger than 12px
                        fontWeight: '500',
                        cursor: 'pointer',
                        WebkitAppearance: 'none',
                        height: '27px' // Increased height
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., Margherita Pizza, Chicken Alfredo..."
                  style={{
                    ...FONTS.elegant,
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: COLORS.text,
                    boxSizing: 'border-box',
                    WebkitAppearance: 'none'
                  }}
                />
                
                {/* Search Stats */}
                {hasSearchTerm && (
                  <p style={{
                    ...FONTS.elegant,
                    fontSize: '14px',
                    color: COLORS.text,
                    opacity: 0.8,
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    {filteredAndSortedDishes.length > 0 
                      ? `Found ${filteredAndSortedDishes.length} matching dish${filteredAndSortedDishes.length !== 1 ? 'es' : ''}`
                      : 'No matching dishes found'
                    }
                  </p>
                )}
              </div>

              {/* "Don't see your dish?" Button */}
              {(showNoResults || hasSearchTerm) && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      ...FONTS.elegant,
                      backgroundColor: COLORS.success,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 24px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.successHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.success}
                  >
                    Don't see your dish? Add it here
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add Dish Form */}
          {showAddForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSearchTerm(''); // Optionally clear search when canceling
                  }}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none"
                  style={{ color: COLORS.text }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                  </svg>
                </button>
                <h2 style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500'}}>
                  Add New Dish
                </h2>
                <div className="w-10" />
              </div>
              
              <AddDishForm
                show={true}
                onToggleShow={() => setShowAddForm(false)}
                onSubmit={handleAddDish}
              />
            </div>
          )}
          
          {/* Dishes List */}
          {!showAddForm && (
            <div className="space-y-4">
              {/* Show existing dishes */}
              {filteredAndSortedDishes.length > 0 ? (
                <>
                  {/* Results header for search */}
                  {hasSearchResults && (
                    <div className="text-center">
                      <h3 style={{
                        ...FONTS.elegant,
                        color: COLORS.text,
                        fontSize: '18px',
                        fontWeight: '500',
                        margin: '0 0 16px 0'
                      }}>
                        Matching dishes:
                      </h3>
                    </div>
                  )}
                  
                  {filteredAndSortedDishes.map((dish, index) => (
                    <div key={dish.id}>
                      <DishCard
                        dish={dish}
                        onDelete={deleteDish}
                        onUpdateRating={updateDishRating}
                        onAddComment={handleAddComment}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
                        isSubmittingComment={isSubmittingComment}
                      />
                      {/* Separator line between cards */}
                      {index < filteredAndSortedDishes.length - 1 && (
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
              ) : (
                /* Empty state */
                <div className="text-center py-12">
                  {showNoResults ? (
                    <div>
                      <div className="text-4xl mb-4">🔍</div>
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>
                        No dishes found for "{searchTerm}"
                      </p>
                      <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7, marginBottom: '16px'}}>
                        Try a different search term or add this dish.
                      </p>
                    </div>
                  ) : dishes.length === 0 ? (
                    <div>
                      <div className="text-6xl mb-4">🍽️</div>
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>
                        No dishes yet
                      </p>
                      <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7, marginBottom: '16px'}}>
                        Be the first to add a dish from {restaurant.name}!
                      </p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        style={{
                          ...FONTS.elegant,
                          backgroundColor: COLORS.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          WebkitAppearance: 'none'
                        }}
                      >
                        Add First Dish
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
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

export default MenuScreen;