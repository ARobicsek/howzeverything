// src/MenuScreen.tsx
import React, { useState } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import DishCard from './components/DishCard';
import AddDishForm from './components/AddDishForm';
import SearchAndSort from './components/SearchAndSort';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import EmptyState from './components/EmptyState';
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

const MenuScreen: React.FC<MenuScreenProps> = ({
  restaurantId,
  onNavigateBack,
  onNavigateToScreen,
  currentAppScreen
}) => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('name');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearchSort, setShowSearchSort] = useState(false);

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

  // Handlers
  const handleAddDish = async (name: string, rating: number) => {
    const success = await addDish(name, rating);
    if (success) {
      setShowAddForm(false);
    }
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

  // Filter dishes
  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {/* Simplified back arrow icon for better mobile compatibility */}
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
        <div className="max-w-md mx-auto space-y-8"> {/* Increased spacing to space-y-8 for more separation */}
          {/* Error Display */}
          {dishesError && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{color: COLORS.danger, ...FONTS.elegant}}>{dishesError}</p>
            </div>
          )}
          
          {/* Add Dish Form */}
          <AddDishForm
            show={showAddForm}
            onToggleShow={() => setShowAddForm(!showAddForm)}
            onSubmit={handleAddDish}
          />

          {/* Search and Sort */}
          {showSearchSort && (
            <SearchAndSort
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              disabled={showAddForm}
            />
          )}
          
          {/* Dishes List */}
          <div className="space-y-4" style={{ marginTop: '32px' }}> {/* Explicit 32px margin top for clear separation */}
            {filteredDishes.length === 0 ? (
              <EmptyState 
                hasSearchTerm={!!searchTerm}
                restaurantName={restaurant.name}
              />
            ) : (
              <>
                {filteredDishes.map((dish, index) => (
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
                    {/* Add subtle separator line between dish cards, except for the last one */}
                    {index < filteredDishes.length - 1 && (
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

export default MenuScreen;