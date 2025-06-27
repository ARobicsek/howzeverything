// src/MenuScreen.tsx - Original UI with Enhanced Search Logic Only
import React, { useEffect, useMemo, useState } from 'react';
import DishCard from './components/DishCard';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useDishes } from './hooks/useDishes';
import { useRestaurant } from './hooks/useRestaurant';








// Updated interface to match what App.tsx sends
interface MenuScreenProps {        
  restaurantId: string;        
  onNavigateBack: () => void;        
  onNavigateToScreen: (screen: GlobalNavigableScreenType) => void;        
  currentAppScreen: GlobalAppScreenType;        
}








// NEW: Consolidated component replacing DishSearchSection and AddDishPrompt
const ConsolidatedSearchAndAdd: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onReset: () => void;
  onShowAddForm: () => void;
}> = ({ searchTerm, onSearchChange, onReset, onShowAddForm }) => {
  const hasTyped = searchTerm.length > 0;


  return (
    <div style={{ marginBottom: SPACING[4] }}>
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge,
        padding: SPACING[4],
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
          {hasTyped && (
            <button
              onClick={onReset}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: COLORS.textSecondary,
                transition: 'color 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.danger; e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }}
              aria-label="Clear search"
              title="Clear search"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
            </button>
          )}
        </div>
       
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => e.target.value.length <= 100 && onSearchChange(e.target.value)}
          placeholder="Start typing to find a dish..."
          style={{
            ...STYLES.input,
            fontSize: TYPOGRAPHY.base.fontSize,
          }}
          autoFocus
        />
       
        {hasTyped && (
          <div style={{ marginTop: SPACING[2], textAlign: 'center', paddingTop: SPACING[2] }}>
            <p style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              color: COLORS.textSecondary,
              margin: `0 0 ${SPACING[2]} 0`
            }}>
              Don't see it below?
            </p>
            <button
              onClick={onShowAddForm}
              style={{
                ...STYLES.primaryButton,
                padding: `${SPACING[2]} ${SPACING[4]}`,
                fontSize: TYPOGRAPHY.sm.fontSize
              }}
            >
              Add New Dish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};








// ORIGINAL Add Dish Form with enhanced design        
const EnhancedAddDishForm: React.FC<{        
  initialDishName?: string;        
  onSubmit: (name: string, rating: number) => Promise<void>;        
  onCancel: () => void;        
}> = ({ initialDishName = '', onSubmit, onCancel }) => {        
  const [dishName, setDishName] = useState(initialDishName);        
  const [rating, setRating] = useState(0);        
  const [isSubmitting, setIsSubmitting] = useState(false);








  const handleSubmit = async () => {        
    if (dishName.trim() && !isSubmitting) {        
      setIsSubmitting(true);        
      await onSubmit(dishName, rating);        
      setDishName('');        
      setRating(0);        
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
          placeholder="Enter the dish name as exactly as you can..."        
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
          Your Rating (Optional)
        </label>        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SPACING[2] }}>        
          <div style={{ display: 'flex', gap: SPACING[1] }}>        
            {[1, 2, 3, 4, 5].map((star) => (        
              <button        
                key={star}        
                onClick={() => setRating(star === rating ? 0 : star)}
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
            marginLeft: SPACING[2],
            minWidth: '30px' // Ensure space is reserved
          }}>        
            {rating > 0 ? `${rating}/5` : ''}
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
  const [justAddedDishId, setJustAddedDishId] = useState<string | null>(null);








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
    searchDishes, // This now uses enhanced search        
    addComment,        
    updateComment,        
    deleteComment,        
    addPhoto,        
    deletePhoto        
  } = useDishes(restaurantId, sortBy);




  // This effect handles scrolling to a newly added dish.
  // It runs when `justAddedDishId` is set, which happens only after a successful add.
  useEffect(() => {
    if (justAddedDishId) {
      // The DOM update might not be immediate, so we use a short timeout
      // to give React time to render the new dish card.
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(`dish-card-${justAddedDishId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Reset the trigger so this doesn't run again on subsequent renders.
        setJustAddedDishId(null);
      }, 150); // A small delay like 150ms should be sufficient.


      return () => clearTimeout(scrollTimer);
    }
  }, [justAddedDishId]);








  // ENHANCED: Use the new searchDishes function with fuzzy matching and synonyms
  const searchResults = useMemo(() => {        
    return searchDishes(searchTerm);        
  }, [dishes, searchTerm, searchDishes]);








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
    const newDish = await addDish(name, rating);        
    if (newDish) {        
      setShowAddForm(false);        
      setSearchTerm('');        
      // Expand the new card and trigger the scroll effect.
      setExpandedDishId(newDish.id);
      setJustAddedDishId(newDish.id);
    }        
  };








  const handleAddComment = async (dishId: string, text: string) => {        
    try {        
      await addComment(dishId, text);        
    } catch (err: unknown) {        
      if (err instanceof Error) {        
        setError(`Failed to add comment: ${err.message}`);        
      } else {        
        setError(`Failed to add comment: An unknown error occurred.`);        
      }        
    }        
  };








  const handleUpdateComment = async (commentId: string, _dishId: string, newText: string) => {        
    try {        
      await updateComment(commentId, newText);        
    } catch (err: unknown) {        
      if (err instanceof Error) {        
        setError(`Failed to update comment: ${err.message}`);        
      } else {        
        setError(`Failed to update comment: An unknown error occurred.`);        
      }        
    }        
  };








  const handleDeleteComment = async (_dishId: string, commentId: string) => {        
    try {        
      await deleteComment(commentId);        
    } catch (err: unknown) {        
      if (err instanceof Error) {        
        setError(`Failed to delete comment: ${err.message}`);        
      } else {        
        setError(`Failed to delete comment: An unknown error occurred.`);        
      }        
    }        
  };








  const handleAddPhoto = async (dishId: string, file: File, caption?: string) => {        
    try {        
      await addPhoto(dishId, file, caption);        
    } catch (err: unknown) {        
      if (err instanceof Error) {        
        setError(`Failed to add photo: ${err.message}`);        
      } else {        
        setError(`Failed to add photo: An unknown error occurred.`);        
      }        
    }        
  };








  const handleDeletePhoto = async (_dishId: string, photoId: string) => {        
    try {        
      await deletePhoto(photoId);        
    } catch (err: unknown) {        
      if (err instanceof Error) {        
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
                  <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>        
                )}        
              </svg>        
            </button>        
            {/* Sort button */}        
            <button        
              onClick={() => {
                setShowAdvancedSort(!showAdvancedSort);
                // MODIFIED: Scroll to top to ensure sort options are visible.
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}        
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
        paddingBottom: STYLES.mainContentPadding,        
        maxWidth: '768px',        
        width: '100%',        
        margin: '0 auto'        
      }}>        
        <div style={{        
          display: 'flex',        
          flexDirection: 'column',        
          gap: SPACING[4],        
          paddingLeft: SPACING.containerPadding,        
          paddingRight: SPACING.containerPadding,        
          paddingTop: SPACING[4],        
        }}>        
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








          {/* MODIFIED: Use the new consolidated search component */}
          {!showAddForm && hasDishes && (
            <ConsolidatedSearchAndAdd
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onReset={handleResetSearch}
              onShowAddForm={handleShowAddForm}
            />
          )}








          {/* MODIFIED: Display logic for search results and lists */}
          {!showAddForm ? (
            <>
              {/* SEARCH ACTIVE (2+ characters) */}
              {searchTerm.length >= 2 && (
                searchResults.length > 0 ? (
                  <>
                    {/* Header for search results */}
                    <p style={{
                      ...FONTS.body,
                      fontSize: TYPOGRAPHY.base.fontSize,
                      color: COLORS.textSecondary,
                      margin: `-${SPACING[3]} 0 -${SPACING[2]} 0`,
                      paddingLeft: SPACING[4]
                    }}>
                      Looking for this?
                    </p>
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
                        isSubmittingComment={false}
                        isExpanded={allExpanded || expandedDishId === dish.id}
                        onToggleExpand={() => handleToggleDishExpanded(dish.id)}
                      />
                    ))}
                  </>
                ) : (
                  /* "No dishes found" message */
                  <div style={{
                    textAlign: 'center',
                    padding: SPACING[6],
                    backgroundColor: COLORS.white,
                    borderRadius: STYLES.borderRadiusLarge,
                    boxShadow: STYLES.shadowMedium,
                    border: `1px solid ${COLORS.gray200}`
                  }}>
                    <p style={{
                      ...FONTS.body,
                      fontSize: TYPOGRAPHY.base.fontSize,
                      color: COLORS.textSecondary,
                      margin: 0
                    }}>
                      No dishes found matching "{searchTerm}"
                    </p>
                  </div>
                )
              )}


              {/* FULL LIST (No search) */}
              {searchTerm.length === 0 && (
                hasDishes ? (
                  <>
                    {dishes.map((dish) => (
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
                        isSubmittingComment={false}
                        isExpanded={allExpanded || expandedDishId === dish.id}
                        onToggleExpand={() => handleToggleDishExpanded(dish.id)}
                      />
                    ))}
                  </>
                ) : (
                  /* EMPTY STATE (No dishes at all) */
                  <div style={{
                    backgroundColor: COLORS.white,
                    borderRadius: STYLES.borderRadiusLarge,
                    padding: SPACING[8],
                    textAlign: 'center',
                    boxShadow: STYLES.shadowMedium,
                    border: `1px solid ${COLORS.gray200}`
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: SPACING[4] }}>
                      🍽️
                    </div>
                    <h2 style={{
                      ...FONTS.heading,
                      fontSize: TYPOGRAPHY.xl.fontSize,
                      color: COLORS.gray900,
                      marginBottom: SPACING[3]
                    }}>
                      No dishes yet
                    </h2>
                    <p style={{
                      ...FONTS.body,
                      fontSize: TYPOGRAPHY.base.fontSize,
                      color: COLORS.textSecondary,
                      marginBottom: SPACING[5]
                    }}>
                      Be the first to add a dish to {restaurant.name}!
                    </p>
                    <button
                      onClick={handleShowAddForm}
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
            </>
          ) : (
            /* SHOW ADD DISH FORM */
            <EnhancedAddDishForm
              initialDishName={searchTerm}
              onSubmit={handleAddDish}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>        
      </main>








      {/* Bottom Navigation */}        
      <BottomNavigation        
        activeScreenValue={currentAppScreen}        
        onNav={onNavigateToScreen}        
      />        
    </div>        
  );        
};








export default MenuScreen;