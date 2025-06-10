// Enhanced MenuScreen with consistent button styling        
// This goes in src/MenuScreen.tsx

import React, { useMemo, useState } from 'react';
import DishCard from './components/DishCard';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import { COLORS, FONTS, SIZES, STYLES } from './constants'; // Added SIZES        
// REMOVED: import { useComments } from './hooks/useComments';      
import type { DishSearchResult } from './hooks/useDishes';
import { useDishes } from './hooks/useDishes';
import { useRestaurant } from './hooks/useRestaurant';

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
        className="w-full max-w-full border-none outline-none focus:ring-2 focus:ring-white/50"        
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
          minWidth: 0
        }}        
        autoFocus        
      />        
             
      <p style={{...FONTS.elegant, fontSize: '0.85rem', color: COLORS.text, opacity: 0.8, marginTop: '8px', marginBottom: 0}}>        
        Search first to see if we already have your dish        
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
        Can't find it?        
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
}> = ({ initialDishName = '', onSubmit, onCancel }) => {        
  const [dishName, setDishName] = useState(initialDishName);        
  const [rating, setRating] = useState(5);

  const handleSubmit = async () => {        
    if (dishName.trim()) {        
      await onSubmit(dishName, rating);        
      setDishName('');        
      setRating(5);        
    }        
  };

  return (        
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4 w-full max-w-full overflow-hidden">        
      {/* REMOVED: Duplicate "Add New Dish" title - the parent already shows this in the header */}

      <div>        
        <label style={{...FONTS.elegant, fontSize: '0.9rem', color: COLORS.text, display: 'block', marginBottom: '8px'}}>        
          Dish Name        
        </label>        
        <input        
          type="text"        
          value={dishName}        
          onChange={(e) => setDishName(e.target.value)}        
          placeholder="Enter the exact dish name..."        
          className="w-full max-w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50"        
          style={{        
            ...FONTS.elegant,        
            fontSize: '1rem',        
            backgroundColor: 'white',        
            color: COLORS.textDark,
            boxSizing: 'border-box',
            minWidth: 0
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

      <div className="flex gap-3 w-full max-w-full">        
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
    searchDishes,    
    // FIXED: Use comment functions from useDishes (they return Promise<void> and handle state internally)        
    addComment,        
    updateComment,        
    deleteComment        
  } = useDishes(restaurantId, sortBy);        
           
  // REMOVED: const { isSubmitting: isSubmittingComment, addComment, updateComment, deleteComment } = useComments();

  const searchResults = useMemo(() => {        
    return searchDishes(searchTerm);        
  }, [dishes, searchTerm, searchDishes]);

  const hasSearched = searchTerm.trim().length > 0;        
  const hasSearchResults = hasSearched && searchResults.length > 0;  
  const hasDishes = dishes.length > 0; // Track if any dishes exist

  const handleSearchChange = (term: string) => {        
    setSearchTerm(term);        
    if (showAddForm) {        
      setShowAddForm(false);        
    }        
  };

  const handleResetSearch = () => {        
    setSearchTerm('');        
    setShowAddForm(false);        
  };

  const handleShowAddForm = () => {        
    setShowAddForm(true);        
  };

  const handleAddDish = async (name: string, rating: number) => {        
    const success = await addDish(name, rating);        
    if (success) {        
      setShowAddForm(false);        
      setSearchTerm(''); // Clear search term from MenuScreen state        
    }        
  };

  // FIXED: Simplified comment handlers - useDishes functions handle everything internally    
  const handleAddComment = async (dishId: string, text: string) => {        
    try {        
      await addComment(dishId, text);    
      // No need for manual state updates - addComment handles it internally        
    } catch (err: any) {        
      setError(`Failed to add comment: ${err.message}`);        
    }        
  };

  const handleUpdateComment = async (commentId: string, dishId: string, newText: string) => {        
    try {        
      await updateComment(commentId, dishId, newText);    
      // No need for manual state updates - updateComment handles it internally        
    } catch (err: any) {        
      setError(`Failed to update comment: ${err.message}`);        
    }        
  };

  const handleDeleteComment = async (dishId: string, commentId: string) => {        
    try {        
      await deleteComment(dishId, commentId);    
      // No need for manual state updates - deleteComment handles it internally        
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

          {/* UPDATED: Only show search section if dishes exist AND not showing add form */}  
          {!showAddForm && hasDishes && (        
            <DishSearchSection        
              searchTerm={searchTerm}        
              onSearchChange={handleSearchChange}        
              onReset={handleResetSearch}        
              searchResults={searchResults}        
              hasSearched={hasSearched}        
              onShowAddForm={handleShowAddForm}        
            />        
          )}

          {!showAddForm && (        
            <div className="space-y-4">        
              {hasSearchResults && (        
                <>        
                  <div className="text-center">        
                    <h3 style={{...FONTS.elegant, color: COLORS.text, fontSize: '18px', fontWeight: '500', margin: '0 0 16px 0'}}>        
                      Search Results:        
                    </h3>        
                  </div>        
                  {searchResults.map((dish, index) => (        
                    <div key={dish.id}>        
                      <DishCard        
                        dish={dish}        
                        currentUserId={currentUserId}        
                        onDelete={deleteDish}        
                        onUpdateRating={updateDishRating}        
                        onAddComment={handleAddComment}        
                        onUpdateComment={handleUpdateComment}        
                        onDeleteComment={handleDeleteComment}        
                        isSubmittingComment={false}    
                      />        
                      {index < searchResults.length - 1 && (        
                        <div className="mx-4 mt-4" style={{height: '1px', background: `linear-gradient(to right, transparent, ${COLORS.text}20, transparent)`}}/>        
                      )}        
                    </div>        
                  ))}        
                       
                  {/* Add dish prompt AFTER search results */}        
                  <AddDishPrompt        
                    hasResults={hasSearchResults}        
                    onShowAddForm={handleShowAddForm}        
                  />        
                </>        
              )}

              {(hasSearched ? searchResults : dishes).length > 0 && !hasSearchResults ? (        
                <>        
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
                        isSubmittingComment={false}    
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

          {/* FIXED: Removed the duplicate back arrow and "Add New Dish" header section */}
          {showAddForm && (        
            <div className="space-y-4">
              {/* Just show the form directly without duplicate headers */}
              <EnhancedAddDishForm        
                initialDishName={searchTerm} // searchTerm from MenuScreen state is used here        
                onSubmit={handleAddDish}        
                onCancel={() => { setShowAddForm(false); }}        
              />      
            </div>        
          )}        
        </div>        
      </main>

      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen}/>        
    </div>        
  );        
};

export default MenuScreen;