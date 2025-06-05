// Enhanced MenuScreen with consistent button styling
// This goes in src/MenuScreen.tsx

import React, { useState, useMemo } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import DishCard from './components/DishCard';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import { useDishes } from './hooks/useDishes';
import { useComments } from './hooks/useComments';
import { useRestaurant } from './hooks/useRestaurant';
import { COLORS, FONTS, STYLES, SIZES } from './constants'; // Added SIZES
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
// DishWithDetails removed from this import line as it caused TS6196. It's used implicitly.
import type { DishComment, DishSearchResult } from './hooks/useDishes'; 


interface MenuScreenProps {
  restaurantId: string;
  onNavigateBack: () => void;
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;
  currentAppScreen: GlobalAppScreenType;
}

// Enhanced search component with better visual hierarchy
const DishSearchSection: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onReset: () => void;
  searchResults: DishSearchResult[];
  hasSearched: boolean;
  onShowAddForm: () => void;
}> = ({ searchTerm, onSearchChange, onReset, searchResults, hasSearched, onShowAddForm }) => (
  // UPDATED: Added marginBottom to the entire section for spacing before next elements
  <div className="space-y-4" style={{ marginBottom: SIZES.lg }}>
    {/* Search Input */}
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{...FONTS.elegant, fontSize: '1.2rem', fontWeight: '600', color: COLORS.text}}>
          Find Your Dish
        </h2>
        {hasSearched && (
          <button
            onClick={onReset}
            className="px-3 py-1 rounded-lg transition-colors"
            style={{
              ...FONTS.elegant,
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            Clear
          </button>
        )}
      </div>
     
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search for your dish (e.g., Margherita Pizza, Chicken Alfredo...)"
        className="w-full border-none outline-none focus:ring-2 focus:ring-white/50"
        style={{
          ...FONTS.elegant,
          padding: '12px 16px',
          borderRadius: STYLES.borderRadiusMedium,
          fontSize: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: COLORS.textDark,
          boxSizing: 'border-box',
          WebkitAppearance: 'none',
        }}
        autoFocus
      />
     
      <p style={{...FONTS.elegant, fontSize: '0.85rem', color: COLORS.text, opacity: 0.8, marginTop: '8px', marginBottom: 0}}>
        💡 Search first to see if someone already added your dish
      </p>
    </div>

    {/* Search Results */}
    {hasSearched && (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
        {searchResults.length > 0 ? (
          <div>
            <h3 style={{...FONTS.elegant, fontSize: '1.1rem', fontWeight: '500', color: COLORS.text, marginBottom: '12px'}}>
              Found {searchResults.length} matching dish{searchResults.length !== 1 ? 'es' : ''}:
            </h3>
            <div className="text-sm mb-3" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>
              {searchResults.some(d => d.isExactMatch) && "🎯 Exact matches shown first"}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🔍</div>
            <h3 style={{...FONTS.elegant, fontSize: '1.1rem', fontWeight: '500', color: COLORS.text, marginBottom: '8px'}}>
              No dishes found for "{searchTerm}"
            </h3>
            <p style={{...FONTS.elegant, fontSize: '0.9rem', color: COLORS.text, opacity: 0.7, marginBottom: '16px'}}>
              Looks like you'll be the first to add this dish!
            </p>
            <button
              onClick={onShowAddForm}
              className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              style={{
                ...STYLES.addButton,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}
            >
              Add "{searchTerm}" to Menu
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

// Component to show add dish option when search yields results
// FIXED: Removed unused 'searchTerm' prop
const AddDishPrompt: React.FC<{
  hasResults: boolean;
  onShowAddForm: () => void;
}> = ({ hasResults, onShowAddForm }) => {
  if (!hasResults) return null;
 
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
      <p style={{...FONTS.elegant, fontSize: '0.95rem', color: COLORS.text, marginBottom: '12px'}}>
        Don't see exactly what you're looking for?
      </p>
      <button
        onClick={onShowAddForm}
        className="px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
        style={STYLES.addButton}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}
      >
        Add New Dish
      </button>
    </div>
  );
};

// Enhanced Add Dish Form with pre-filled search term
const EnhancedAddDishForm: React.FC<{
  initialDishName?: string;
  onSubmit: (name: string, rating: number) => Promise<void>;
  onCancel: () => void;
  onCheckSimilar: (name: string) => void;
}> = ({ initialDishName = '', onSubmit, onCancel, onCheckSimilar }) => {
  const [dishName, setDishName] = useState(initialDishName);
  const [rating, setRating] = useState(5);
  const [showingSimilar, setShowingSimilar] = useState(false);

  const handleSubmit = async () => {
    if (dishName.trim()) {
      await onSubmit(dishName, rating);
      setDishName('');
      setRating(5);
    }
  };

  const handleCheckSimilar = () => {
    if (dishName.trim()) {
      setShowingSimilar(true);
      onCheckSimilar(dishName);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
      <div className="text-center">
        <h3 style={{...FONTS.elegant, fontSize: '1.1rem', fontWeight: '600', color: COLORS.text}}>
          Add New Dish
        </h3>
      </div>

      <div>
        <label style={{...FONTS.elegant, fontSize: '0.9rem', color: COLORS.text, display: 'block', marginBottom: '8px'}}>
          Dish Name
        </label>
        <input
          type="text"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          placeholder="Enter the exact dish name..."
          className="w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50"
          style={{
            ...FONTS.elegant,
            fontSize: '1rem',
            backgroundColor: 'white',
            color: COLORS.textDark
          }}
        />
      </div>

      <div>
        <label style={{...FONTS.elegant, fontSize: '0.9rem', color: COLORS.text, display: 'block', marginBottom: '8px'}}>
          Your Rating
        </label>
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-all duration-200 cursor-pointer hover:scale-110 focus:outline-none"
                style={{
                  color: star <= rating ? COLORS.star : COLORS.starEmpty,
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  fontSize: '1.5rem',
                }}
              >
                ★
              </button>
            ))}
          </div>
          <span style={{...FONTS.elegant, fontSize: '0.9rem', color: COLORS.text, marginLeft: '8px'}}>
            {rating}/5
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {dishName.trim() && !showingSimilar && (
          <button
            onClick={handleCheckSimilar}
            className="flex-1 py-3 px-4 rounded-xl transition-colors"
            style={{
              ...FONTS.elegant,
              backgroundColor: COLORS.warning,
              color: 'white',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            🔍 Check for Similar
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!dishName.trim()}
          className="flex-1 py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            ...STYLES.addButton,
            backgroundColor: !dishName.trim() ? COLORS.disabled : COLORS.addButtonBg,
            fontSize: '0.9rem'
          }}
          onMouseEnter={(e) => {
            if (dishName.trim()) e.currentTarget.style.backgroundColor = COLORS.addButtonHover;
          }}
          onMouseLeave={(e) => {
            if (dishName.trim()) e.currentTarget.style.backgroundColor = COLORS.addButtonBg;
          }}
        >
          Add Dish
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

const MenuScreen: React.FC<MenuScreenProps> = ({
  restaurantId,
  onNavigateBack,
  onNavigateToScreen,
  currentAppScreen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('rating');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);
  const [similarDishes, setSimilarDishes] = useState<DishSearchResult[]>([]);

  const { restaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useRestaurant(restaurantId);
  const {
    dishes,
    isLoading: isLoadingDishes,
    error: dishesError,
    currentUserId,
    setError,
    addDish,
    deleteDish,
    updateDishRating,
    setDishes,
    searchDishes,
    checkForSimilarDishes
  } = useDishes(restaurantId, sortBy);
   
  const {
    isSubmitting: isSubmittingComment,
    addComment,
    updateComment,
    deleteComment
  } = useComments();

  const searchResults = useMemo(() => {
    return searchDishes(searchTerm);
  }, [dishes, searchTerm, searchDishes]);

  const hasSearched = searchTerm.trim().length > 0;
  const hasSearchResults = hasSearched && searchResults.length > 0;

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (showAddForm) {
      setShowAddForm(false);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setShowAddForm(false);
    setSimilarDishes([]);
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  const handleCheckSimilar = (dishName: string) => {
    const similar = checkForSimilarDishes(dishName, 70);
    setSimilarDishes(similar);
  };

  const handleAddDish = async (name: string, rating: number) => {
    const success = await addDish(name, rating);
    if (success) {
      setShowAddForm(false);
      setSearchTerm(''); // Clear search term from MenuScreen state
      setSimilarDishes([]);
    }
  };

  const handleAddComment = async (dishId: string, text: string) => {
    try {
      const commentResult = await addComment(dishId, text);
      if (commentResult) {
        const newComment: DishComment = commentResult;
        setDishes(prevDishes =>
          prevDishes.map(d => {
            if (d.id === dishId) {
              return {
                ...d,
                dish_comments: [...d.dish_comments, newComment]
              };
            }
            return d;
          })
        );
      }
    } catch (err: any) {
      setError(`Failed to add comment: ${err.message}`);
    }
  };

  const handleUpdateComment = async (commentId: string, dishId: string, newText: string) => {
    try {
      const commentResult = await updateComment(commentId, newText);
      if (commentResult) {
        const updatedComment: DishComment = commentResult;
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
      }
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

  if (isLoadingRestaurant || isLoadingDishes) return <LoadingScreen />;
  if (restaurantError) return <ErrorScreen error={restaurantError} onBack={onNavigateBack} />;
  if (!restaurant) return <ErrorScreen error="Restaurant not found" onBack={onNavigateBack} />;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onNavigateBack}
            className="rounded-full hover:opacity-80 transition-opacity focus:outline-none"
            style={STYLES.iconButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
            className="rounded-full hover:opacity-80 transition-opacity focus:outline-none"
            style={{
              ...STYLES.iconButton,
              backgroundColor: showAdvancedSort ? COLORS.primary : COLORS.iconBackground,
              color: showAdvancedSort ? COLORS.textWhite : COLORS.iconPrimary
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-6">
          {dishesError && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{dishesError}</p>
            </div>
          )}

          {showAdvancedSort && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 style={{...FONTS.elegant, color: COLORS.text, fontSize: '16px', fontWeight: '500', marginBottom: '12px'}}>Sort dishes by:</h3>
              <div className="flex gap-2">
                {[{ value: 'rating', label: 'Rating' }, { value: 'name', label: 'Name' }, { value: 'date', label: 'Date Added' }].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as 'rating' | 'name' | 'date')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === option.value ? 'bg-white text-gray-800' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    style={{...FONTS.elegant, color: sortBy === option.value ? COLORS.textDark : COLORS.textWhite }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showAddForm && (
            <DishSearchSection
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onReset={handleResetSearch}
              searchResults={searchResults}
              hasSearched={hasSearched}
              onShowAddForm={handleShowAddForm}
            />
          )}

          {!showAddForm && hasSearchResults && (
            // FIXED: Removed searchTerm prop as it's not used by AddDishPrompt
            <AddDishPrompt
              hasResults={hasSearchResults}
              onShowAddForm={handleShowAddForm}
            />
          )}

          {showAddForm && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowAddForm(false); setSimilarDishes([]); }}
                  className="rounded-full hover:opacity-80 transition-opacity focus:outline-none"
                  style={STYLES.iconButton}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                  </svg>
                </button>
                <h2 style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500'}}>Add New Dish</h2>
              </div>
             
              <EnhancedAddDishForm
                initialDishName={searchTerm} // searchTerm from MenuScreen state is used here
                onSubmit={handleAddDish}
                onCancel={() => { setShowAddForm(false); setSimilarDishes([]); }}
                onCheckSimilar={handleCheckSimilar}
              />

              {similarDishes.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <h4 style={{...FONTS.elegant, color: COLORS.warning, fontSize: '1rem', fontWeight: '500', marginBottom: '8px'}}>
                    ⚠️ Similar dishes found:
                  </h4>
                  <div className="space-y-2">
                    {similarDishes.slice(0, 3).map(dish => (
                      <div key={dish.id} className="bg-white/5 p-2 rounded">
                        <span style={{...FONTS.elegant, color: COLORS.text, fontSize: '0.9rem'}}>{dish.name}</span>
                        <span style={{...FONTS.elegant, color: COLORS.text, opacity: 0.6, fontSize: '0.8rem', marginLeft: '8px'}}>
                          ({dish.total_ratings} rating{dish.total_ratings !== 1 ? 's' : ''})
                        </span>
                      </div>
                    ))}
                  </div>
                  <p style={{...FONTS.elegant, color: COLORS.warning, fontSize: '0.85rem', marginTop: '8px'}}>
                    Consider rating one of these instead to keep ratings together!
                  </p>
                </div>
              )}
            </div>
          )}

          {!showAddForm && (
            <div className="space-y-4">
              {(hasSearched ? searchResults : dishes).length > 0 ? (
                <>
                  {hasSearchResults && (
                    <div className="text-center">
                      <h3 style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', margin: '0 0 16px 0'}}>
                        Search Results:
                      </h3>
                    </div>
                  )}
                  {(hasSearched ? searchResults : dishes).map((dish, index) => (
                    <div key={dish.id}>
                      <DishCard
                        dish={dish}
                        currentUserId={currentUserId}
                        onDelete={deleteDish}
                        onUpdateRating={updateDishRating}
                        onAddComment={handleAddComment}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
                        isSubmittingComment={isSubmittingComment}
                      />
                      {index < (hasSearched ? searchResults : dishes).length - 1 && (
                        <div className="mx-4 mt-4" style={{height: '1px', background: `linear-gradient(to right, transparent, ${COLORS.text}20, transparent)`}}/>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                !hasSearched && dishes.length === 0 && (
                  <div className="text-center py-12">
                    <div>
                      <div className="text-6xl mb-4">🍽️</div>
                      <p style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>No dishes yet</p>
                      <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7, marginBottom: '16px'}}>Be the first to add a dish from {restaurant.name}!</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        style={STYLES.addButton}
                        className="transition-all duration-300 transform hover:scale-105"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}
                      >
                        Add First Dish
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen}/>
    </div>
  );
};

export default MenuScreen;