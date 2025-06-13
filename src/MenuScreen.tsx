// src/MenuScreen.tsx
import React, { useMemo, useState } from 'react';
import DishCard from './components/DishCard';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import type { DishSearchResult } from './hooks/useDishes';
import { useDishes } from './hooks/useDishes';
import { useRestaurant } from './hooks/useRestaurant';


interface MenuScreenProps {
  restaurantId: string;
  onNavigateBack: () => void;
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;
  currentAppScreen: GlobalAppScreenType;
}


// Enhanced search component with modern design
const DishSearchSection: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onReset: () => void;
  searchResults: DishSearchResult[];
  hasSearched: boolean;
  onShowAddForm: () => void;
}> = ({ searchTerm, onSearchChange, onReset, searchResults, hasSearched, onShowAddForm }) => (
  <div style={{ marginBottom: SPACING[6] }}>
    {/* Search Input */}
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: STYLES.borderRadiusLarge,
      padding: SPACING[5],
      boxShadow: STYLES.shadowMedium,
      border: `1px solid ${COLORS.gray200}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[3] }}>
        <h2 style={{
          ...FONTS.heading,
          fontSize: TYPOGRAPHY.lg.fontSize,
          color: COLORS.gray900,
          margin: 0
        }}>
          Find Your Dish
        </h2>
        {hasSearched && (
          <button
            onClick={onReset}
            style={{
              ...STYLES.secondaryButton,
              padding: `${SPACING[2]} ${SPACING[4]}`,
              minHeight: '36px',
              fontSize: TYPOGRAPHY.sm.fontSize
            }}
          >
            Clear
          </button>
        )}
      </div>
     
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => e.target.value.length <= 100 && onSearchChange(e.target.value)}
        placeholder="Search for your dish (e.g., Margherita Pizza, Chicken Alfredo...)"
        style={{
          ...STYLES.input,
          fontSize: TYPOGRAPHY.base.fontSize,
          marginBottom: SPACING[2]
        }}
        autoFocus
      />
     
      <p style={{
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        color: COLORS.textSecondary,
        margin: 0
      }}>
        Search first to see if we already have your dish
      </p>
    </div>


    {/* Search Results */}
    {hasSearched && (
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge,
        padding: SPACING[5],
        marginTop: SPACING[4],
        boxShadow: STYLES.shadowMedium,
        border: `1px solid ${COLORS.gray200}`
      }}>
        {searchResults.length > 0 ? (
          <div>
            <h3 style={{
              ...FONTS.heading,
              fontSize: TYPOGRAPHY.base.fontSize,
              color: COLORS.gray900,
              marginBottom: SPACING[3]
            }}>
              Found {searchResults.length} matching dish{searchResults.length !== 1 ? 'es' : ''}:
            </h3>
            {searchResults.some(d => d.isExactMatch) && (
              <div style={{
                ...FONTS.body,
                fontSize: TYPOGRAPHY.sm.fontSize,
                color: COLORS.textSecondary,
                marginBottom: SPACING[3]
              }}>
                🎯 Exact matches shown first
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: SPACING[6] }}>
            <div style={{ fontSize: '3rem', marginBottom: SPACING[3] }}>🔍</div>
            <h3 style={{
              ...FONTS.heading,
              fontSize: TYPOGRAPHY.lg.fontSize,
              color: COLORS.gray900,
              marginBottom: SPACING[2]
            }}>
              No dishes found for "{searchTerm}"
            </h3>
            <p style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.base.fontSize,
              color: COLORS.textSecondary,
              marginBottom: SPACING[4]
            }}>
              Looks like you'll be the first to add this dish!
            </p>
            <button
              onClick={onShowAddForm}
              style={STYLES.primaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }}
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
const AddDishPrompt: React.FC<{
  hasResults: boolean;
  onShowAddForm: () => void;
}> = ({ hasResults, onShowAddForm }) => {
  if (!hasResults) return null;
 
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: STYLES.borderRadiusLarge,
      padding: SPACING[5],
      textAlign: 'center',
      boxShadow: STYLES.shadowMedium,
      border: `1px solid ${COLORS.gray200}`
    }}>
      <p style={{
        ...FONTS.body,
        fontSize: TYPOGRAPHY.base.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SPACING[3]
      }}>
        Can't find it?
      </p>
      <button
        onClick={onShowAddForm}
        style={STYLES.primaryButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.primaryHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.primary;
        }}
      >
        Add New Dish
      </button>
    </div>
  );
};


// Enhanced Add Dish Form with modern design
const EnhancedAddDishForm: React.FC<{
  initialDishName?: string;
  onSubmit: (name: string, rating: number) => Promise<void>;
  onCancel: () => void;
}> = ({ initialDishName = '', onSubmit, onCancel }) => {
  const [dishName, setDishName] = useState(initialDishName);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async () => {
    if (dishName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await onSubmit(dishName, rating);
      setDishName('');
      setRating(5);
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: STYLES.borderRadiusLarge,
      padding: SPACING[6],
      boxShadow: STYLES.shadowLarge,
      border: `1px solid ${COLORS.gray200}`
    }}>
      <h3 style={{
        ...FONTS.heading,
        fontSize: TYPOGRAPHY.xl.fontSize,
        color: COLORS.gray900,
        marginBottom: SPACING[5]
      }}>
        Add New Dish
      </h3>


      <div style={{ marginBottom: SPACING[5] }}>
        <label style={{
          ...FONTS.body,
          fontSize: TYPOGRAPHY.sm.fontSize,
          fontWeight: TYPOGRAPHY.medium,
          color: COLORS.textSecondary,
          display: 'block',
          marginBottom: SPACING[2]
        }}>
          Dish Name
        </label>
        <input
          type="text"
          value={dishName}
          onChange={(e) => e.target.value.length <= 100 && setDishName(e.target.value)}
          placeholder="Enter the exact dish name..."
          style={STYLES.input}
          disabled={isSubmitting}
        />
      </div>


      <div style={{ marginBottom: SPACING[6] }}>
        <label style={{
          ...FONTS.body,
          fontSize: TYPOGRAPHY.sm.fontSize,
          fontWeight: TYPOGRAPHY.medium,
          color: COLORS.textSecondary,
          display: 'block',
          marginBottom: SPACING[2]
        }}>
          Your Rating
        </label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SPACING[2] }}>
          <div style={{ display: 'flex', gap: SPACING[1] }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                disabled={isSubmitting}
                style={{
                  color: star <= rating ? COLORS.primary : COLORS.gray300,
                  background: 'none',
                  border: 'none',
                  padding: SPACING[1],
                  fontSize: '1.5rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isSubmitting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ★
              </button>
            ))}
          </div>
          <span style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.base.fontSize,
            color: COLORS.text,
            marginLeft: SPACING[2]
          }}>
            {rating}/5
          </span>
        </div>
      </div>


      <div style={{ display: 'flex', gap: SPACING[3] }}>
        <button
          onClick={handleSubmit}
          disabled={!dishName.trim() || isSubmitting}
          style={{
            ...STYLES.primaryButton,
            flex: 1,
            opacity: (!dishName.trim() || isSubmitting) ? 0.5 : 1,
            cursor: (!dishName.trim() || isSubmitting) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (dishName.trim() && !isSubmitting) {
              e.currentTarget.style.backgroundColor = COLORS.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (dishName.trim() && !isSubmitting) {
              e.currentTarget.style.backgroundColor = COLORS.primary;
            }
          }}
        >
          {isSubmitting ? 'Adding...' : 'Add Dish'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            ...STYLES.secondaryButton,
            flex: 1,
            opacity: isSubmitting ? 0.5 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
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
  const [sortBy, setSortBy] = useState<{ criterion: 'name' | 'your_rating' | 'community_rating' | 'date'; direction: 'asc' | 'desc' }>({ criterion: 'community_rating', direction: 'desc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);


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
    updateDishName,
    searchDishes,
    addComment,
    updateComment,
    deleteComment,
    addPhoto,
    deletePhoto
  } = useDishes(restaurantId, sortBy);


  const searchResults = useMemo(() => {
    return searchDishes(searchTerm);
  }, [dishes, searchTerm, searchDishes]);


  const hasSearched = searchTerm.trim().length > 0;
  const hasSearchResults = hasSearched && searchResults.length > 0;
  const hasDishes = dishes.length > 0;


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
      setSearchTerm('');
    }
  };


  const handleAddComment = async (dishId: string, text: string) => {
    try {
      await addComment(dishId, text);
    } catch (err: unknown) { // --- MODIFIED: Changed err: any to err: unknown ---
      if (err instanceof Error) { // --- MODIFIED: Added type guard ---
        setError(`Failed to add comment: ${err.message}`);
      } else {
        setError(`Failed to add comment: An unknown error occurred.`);
      }
    }
  };


  const handleUpdateComment = async (commentId: string, dishId: string, newText: string) => {
    try {
      await updateComment(commentId, dishId, newText);
    } catch (err: unknown) { // --- MODIFIED: Changed err: any to err: unknown ---
      if (err instanceof Error) { // --- MODIFIED: Added type guard ---
        setError(`Failed to update comment: ${err.message}`);
      } else {
        setError(`Failed to update comment: An unknown error occurred.`);
      }
    }
  };


  const handleDeleteComment = async (dishId: string, commentId: string) => {
    try {
      await deleteComment(dishId, commentId);
    } catch (err: unknown) { // --- MODIFIED: Changed err: any to err: unknown ---
      if (err instanceof Error) { // --- MODIFIED: Added type guard ---
        setError(`Failed to delete comment: ${err.message}`);
      } else {
        setError(`Failed to delete comment: An unknown error occurred.`);
      }
    }
  };


  const handleAddPhoto = async (dishId: string, file: File, caption?: string) => {
    try {
      await addPhoto(dishId, file, caption);
    } catch (err: unknown) { // --- MODIFIED: Changed err: any to err: unknown ---
      if (err instanceof Error) { // --- MODIFIED: Added type guard ---
        setError(`Failed to add photo: ${err.message}`);
      } else {
        setError(`Failed to add photo: An unknown error occurred.`);
      }
    }
  };


  const handleDeletePhoto = async (dishId: string, photoId: string) => {
    try {
      await deletePhoto(dishId, photoId);
    } catch (err: unknown) { // --- MODIFIED: Changed err: any to err: unknown ---
      if (err instanceof Error) { // --- MODIFIED: Added type guard ---
        setError(`Failed to delete photo: ${err.message}`);
      } else {
        setError(`Failed to delete photo: An unknown error occurred.`);
      }
    }
  };


  const handleToggleAllExpanded = () => {
    if (allExpanded) {
      setAllExpanded(false);
      setExpandedDishId(null);
    } else {
      setAllExpanded(true);
    }
  };


  const handleToggleDishExpanded = (dishId: string) => {
    if (allExpanded) {
      setAllExpanded(false);
      setExpandedDishId(dishId === expandedDishId ? null : dishId);
    } else {
      setExpandedDishId(dishId === expandedDishId ? null : dishId);
    }
  };


  if (isLoadingRestaurant || isLoadingDishes) return <LoadingScreen />;
  if (restaurantError) return <ErrorScreen error={restaurantError} onBack={onNavigateBack} />;
  if (!restaurant) return <ErrorScreen error="Restaurant not found" onBack={onNavigateBack} />;


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
      {/* Header */}
      <header style={{
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.gray200}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: STYLES.shadowSmall
      }}>
        <div style={{
          maxWidth: '768px',
          margin: '0 auto',
          padding: `${SPACING[3]} ${SPACING[4]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onNavigateBack}
            style={STYLES.iconButton}
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1
            style={{
              ...FONTS.heading,
              fontSize: TYPOGRAPHY.xl.fontSize,
              color: COLORS.gray900,
              flex: 1,
              textAlign: 'center',
              margin: `0 ${SPACING[4]}`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={restaurant.name}
          >
            {restaurant.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
            {/* Expand/Collapse All button */}
            <button
              onClick={handleToggleAllExpanded}
              style={{
                ...STYLES.iconButton,
                backgroundColor: allExpanded ? COLORS.primary : COLORS.white,
                color: allExpanded ? COLORS.white : COLORS.gray700,
                border: allExpanded ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.gray200}`
              }}
              aria-label={allExpanded ? "Collapse all dishes" : "Expand all dishes"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                {allExpanded ? (
                  <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
                ) : (
                  <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                )}
              </svg>
            </button>
            {/* Sort button */}
            <button
              onClick={() => setShowAdvancedSort(!showAdvancedSort)}
              style={{
                ...STYLES.iconButton,
                backgroundColor: showAdvancedSort ? COLORS.primary : COLORS.white,
                color: showAdvancedSort ? COLORS.white : COLORS.gray700,
                border: showAdvancedSort ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.gray200}`
              }}
              aria-label="Sort options"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: SPACING[4],
        paddingBottom: STYLES.mainContentPadding,
        maxWidth: '768px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[4] }}>
          {dishesError && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: `1px solid #FECACA`,
              borderRadius: STYLES.borderRadiusMedium,
              padding: SPACING[4],
              textAlign: 'center'
            }}>
              <p style={{ ...FONTS.body, color: COLORS.danger, margin: 0 }}>{dishesError}</p>
            </div>
          )}


          {showAdvancedSort && (
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: STYLES.borderRadiusLarge,
              padding: SPACING[4],
              boxShadow: STYLES.shadowMedium,
              border: `1px solid ${COLORS.gray200}`
            }}>
              <div style={{ display: 'flex', gap: SPACING[2], flexWrap: 'wrap' }}>
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'your_rating', label: 'Your rating' },
                  { value: 'community_rating', label: 'Community rating' },
                  { value: 'date', label: 'Date Added' }
                ].map((option) => {
                  const isActive = sortBy.criterion === option.value;
                  const buttonStyle = isActive ? STYLES.sortButtonActive : STYLES.sortButtonDefault;
                  const arrow = isActive ? (sortBy.direction === 'asc' ? '▲' : '▼') : '';
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (isActive) {
                          setSortBy(prev => ({
                            ...prev,
                            direction: prev.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        } else {
                          setSortBy({
                            criterion: option.value as typeof sortBy.criterion,
                            direction: (option.value === 'your_rating' || option.value === 'community_rating') ? 'desc' : 'asc'
                          });
                        }
                      }}
                      style={buttonStyle}
                    >
                      {option.value === 'your_rating' ? (
                        <>
                          <span>Your</span>
                          <span style={{ color: isActive ? COLORS.white : COLORS.primary }}>★</span>
                        </>
                      ) : option.value === 'community_rating' ? (
                        <>
                          <span>Community</span>
                          <span style={{ color: isActive ? COLORS.white : COLORS.ratingGold }}>★</span>
                        </>
                      ) : (
                        <span>{option.label}</span>
                      )}
                      {arrow && <span style={{ marginLeft: SPACING[1] }}>{arrow}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}


          {/* Only show search section if dishes exist AND not showing add form */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[4] }}>
              {hasSearchResults && (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      ...FONTS.heading,
                      fontSize: TYPOGRAPHY.lg.fontSize,
                      color: COLORS.gray900,
                      margin: `0 0 ${SPACING[4]} 0`
                    }}>
                      Search Results:
                    </h3>
                  </div>
                  {searchResults.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      currentUserId={currentUserId}
                      onDelete={deleteDish}
                      onUpdateRating={updateDishRating}
                      onUpdateDishName={updateDishName}
                      onAddComment={handleAddComment}
                      onUpdateComment={handleUpdateComment}
                      onDeleteComment={handleDeleteComment}
                      onAddPhoto={handleAddPhoto}
                      onDeletePhoto={handleDeletePhoto}
                      // --- MODIFIED: isSubmittingComment is boolean now ---
                      isSubmittingComment={false} 
                      isExpanded={allExpanded || expandedDishId === dish.id}
                      onToggleExpand={() => handleToggleDishExpanded(dish.id)}
                    />
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
                  {(hasSearched ? searchResults : dishes).map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      currentUserId={currentUserId}
                      onDelete={deleteDish}
                      onUpdateRating={updateDishRating}
                      onUpdateDishName={updateDishName}
                      onAddComment={handleAddComment}
                      onUpdateComment={handleUpdateComment}
                      onDeleteComment={handleDeleteComment}
                      onAddPhoto={handleAddPhoto}
                      onDeletePhoto={handleDeletePhoto}
                      // --- MODIFIED: isSubmittingComment is boolean now ---
                      isSubmittingComment={false} 
                      isExpanded={allExpanded || expandedDishId === dish.id}
                      onToggleExpand={() => handleToggleDishExpanded(dish.id)}
                    />
                  ))}
                </>
              ) : (
                !hasSearched && dishes.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: `${SPACING[12]} 0`,
                    backgroundColor: COLORS.white,
                    borderRadius: STYLES.borderRadiusLarge,
                    boxShadow: STYLES.shadowMedium,
                    border: `1px solid ${COLORS.gray200}`
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: SPACING[3] }}>🍽️</div>
                    <p style={{
                      ...FONTS.heading,
                      fontSize: TYPOGRAPHY.lg.fontSize,
                      color: COLORS.gray900,
                      marginBottom: SPACING[2]
                    }}>
                      No dishes yet
                    </p>
                    <p style={{
                      ...FONTS.body,
                      fontSize: TYPOGRAPHY.base.fontSize,
                      color: COLORS.textSecondary,
                      marginBottom: SPACING[4]
                    }}>
                      Be the first to add a dish from {restaurant.name}!
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      style={STYLES.primaryButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.primary;
                      }}
                    >
                      Add First Dish
                    </button>
                  </div>
                )
              )}
            </div>
          )}


          {showAddForm && (
            <div>
              <EnhancedAddDishForm
                initialDishName={searchTerm}
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