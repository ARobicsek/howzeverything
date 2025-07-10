// src/MenuScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DishCard from './components/DishCard';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import { BORDERS, COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useDishes, type DishSearchResult, type DishWithDetails } from './hooks/useDishes';
import { usePinnedRestaurants } from './hooks/usePinnedRestaurants';
import { useRestaurant } from './hooks/useRestaurant';
import { useRestaurantVisits } from './hooks/useRestaurantVisits';

// Modal for warning about duplicate dishes
interface DuplicateDishWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  duplicates: DishSearchResult[];
  newDishName: string;
  onSelectDuplicate: (dishId: string) => void;
}

const DuplicateDishWarningModal: React.FC<DuplicateDishWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  duplicates,
  newDishName,
  onSelectDuplicate,
}) => {
  if (!isOpen) return null;
  return (
    <div style={STYLES.modalOverlay}>
      <div style={{ ...STYLES.modal, maxWidth: '500px', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ ...TYPOGRAPHY.h3, color: COLORS.textPrimary, marginTop: 0, marginBottom: SPACING[2] }}>
          Dish May Already Exist
        </h3>
        <p style={{ ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING[4] }}>
          Are you sure you want to add "<strong>{newDishName}</strong>"? We found these similar dishes:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: `0 0 ${SPACING[6]} 0`, maxHeight: '200px', overflowY: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: BORDERS.radius.medium }}>
          {duplicates.map((dish, index) => (
            <li
              key={dish.id}
              style={{ padding: `${SPACING[2]} ${SPACING[3]}`, borderBottom: index < duplicates.length - 1 ? `1px solid ${COLORS.border}` : 'none', cursor: 'pointer', color: COLORS.primary, fontWeight: TYPOGRAPHY.semibold, transition: 'background-color 0.2s ease' }}
              onClick={() => onSelectDuplicate(dish.id)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primaryLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {dish.name}
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: SPACING[3] }}>
          <button onClick={onClose} style={{ ...STYLES.secondaryButton, flex: 1, border: `1px solid ${COLORS.gray300}`, color: COLORS.text }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ ...STYLES.primaryButton, flex: 1 }}>
            Add Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

const ConsolidatedSearchAndAdd: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onReset: () => void;
  onShowAddForm: () => void;
}> = ({ searchTerm, onSearchChange, onReset, onShowAddForm }) => {
  const hasTyped = searchTerm.length > 0;
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: STYLES.borderRadiusLarge, padding: SPACING[4] }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[1] }}>
        <h2 style={{ ...FONTS.heading, fontSize: TYPOGRAPHY.lg.fontSize, color: COLORS.text, margin: 0 }}>
          Find Your Dish
        </h2>
        {hasTyped && (
          <button onClick={onReset} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.textSecondary, transition: 'color 0.2s ease, transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.danger; e.currentTarget.style.transform = 'scale(1.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }} aria-label="Clear search" title="Clear search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
          </button>
        )}
      </div>
      <input type="text" value={searchTerm} onChange={(e) => e.target.value.length <= 100 && onSearchChange(e.target.value)} placeholder="Start typing to find a dish..." onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} style={{ ...STYLES.input, ...(isFocused && STYLES.inputFocusBlack) }} autoFocus />
      {hasTyped && (
        <div style={{ marginTop: SPACING[4], textAlign: 'center' }}>
          <p style={{ ...FONTS.body, fontSize: TYPOGRAPHY.sm.fontSize, color: COLORS.textSecondary, margin: `0 0 ${SPACING[2]} 0` }}>
            Don't see it below?
          </p>
          <button onClick={onShowAddForm} style={{ ...STYLES.primaryButton, padding: `${SPACING[2]} ${SPACING[4]}`, fontSize: TYPOGRAPHY.sm.fontSize }}>
            Add New Dish
          </button>
        </div>
      )}
    </div>
  );
};

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
    }
  };
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusLarge, padding: SPACING[6], boxShadow: STYLES.shadowLarge, border: `1px solid ${COLORS.gray200}` }}>
      <h3 style={{ ...FONTS.heading, fontSize: TYPOGRAPHY.xl.fontSize, color: COLORS.gray900, marginBottom: SPACING[5] }}>
        Add New Dish
      </h3>
      <div style={{ marginBottom: SPACING[5] }}>
        <label style={{ ...FONTS.body, fontSize: TYPOGRAPHY.sm.fontSize, fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, display: 'block', marginBottom: SPACING[2] }}>
          Dish Name
        </label>
        <input type="text" value={dishName} onChange={(e) => e.target.value.length <= 100 && setDishName(e.target.value)} placeholder="Enter the dish name as exactly as you can..." style={{ ...STYLES.input, borderWidth: '1px' }} disabled={isSubmitting} />
      </div>
      <div style={{ marginBottom: SPACING[6] }}>
        <label style={{ ...FONTS.body, fontSize: TYPOGRAPHY.sm.fontSize, fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, display: 'block', marginBottom: SPACING[2] }}>
          Your Rating (Optional)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SPACING[2] }}>
          <div style={{ display: 'flex', gap: SPACING[1] }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star === rating ? 0 : star)} disabled={isSubmitting} style={{ color: star <= rating ? COLORS.primary : COLORS.gray300, background: 'none', border: 'none', padding: SPACING[1], fontSize: '1.5rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', opacity: isSubmitting ? 0.5 : 1 }} onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'scale(1.1)'; } }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                ★
              </button>
            ))}
          </div>
          <span style={{ ...FONTS.body, fontSize: TYPOGRAPHY.base.fontSize, color: COLORS.text, marginLeft: SPACING[2], minWidth: '30px' }}>
            {rating > 0 ? `${rating}/5` : ''}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: SPACING[3] }}>
        <button onClick={handleSubmit} disabled={!dishName.trim() || isSubmitting} style={{ ...STYLES.primaryButton, flex: 1, opacity: (!dishName.trim() || isSubmitting) ? 0.5 : 1, cursor: (!dishName.trim() || isSubmitting) ? 'not-allowed' : 'pointer' }} onMouseEnter={(e) => { if (dishName.trim() && !isSubmitting) { e.currentTarget.style.backgroundColor = COLORS.primaryHover; } }} onMouseLeave={(e) => { if (dishName.trim() && !isSubmitting) { e.currentTarget.style.backgroundColor = COLORS.primary; } }}>
          {isSubmitting ? 'Adding...' : 'Add Dish'}
        </button>
        <button onClick={onCancel} disabled={isSubmitting} style={{ ...STYLES.secondaryButton, flex: 1, opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const MenuScreen: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{ criterion: 'name' | 'your_rating' | 'community_rating' | 'date'; direction: 'asc' | 'desc' }>({ criterion: 'community_rating', direction: 'desc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);
  const [justAddedDishId, setJustAddedDishId] = useState<string | null>(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState<DishSearchResult[]>([]);
  const [dishInfoForConfirmation, setDishInfoForConfirmation] = useState<{ name: string; rating: number } | null>(null);

  const { restaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useRestaurant(restaurantId || '');
  const {
    dishes, isLoading: isLoadingDishes, error: dishesError, currentUserId, setError,
    addDish, deleteDish, updateDishRating, updateDishName, searchDishes,
    addComment, updateComment, deleteComment, addPhoto, deletePhoto, findSimilarDishesForDuplicate
  } = useDishes(restaurantId || '', sortBy);
  
  const { trackVisit } = useRestaurantVisits();
  const { pinnedRestaurantIds, togglePin } = usePinnedRestaurants();

  // Track visit when the screen for a specific restaurant is loaded
  useEffect(() => {
    if (restaurant?.id) {
      trackVisit(restaurant.id);
    }
  }, [restaurant?.id, trackVisit]);
 
  // Set initial expanded dish from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dishToExpand = params.get('dish');
    if (dishToExpand) {
      setExpandedDishId(dishToExpand);
    }
  }, [location.search]);

  useEffect(() => {
    const dishIdToScrollTo = justAddedDishId || expandedDishId;
    if (dishIdToScrollTo) {
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(`dish-card-${dishIdToScrollTo}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (justAddedDishId) {
          setJustAddedDishId(null);
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [justAddedDishId, expandedDishId]);

  const searchResults = useMemo(() => {
    return searchDishes(searchTerm);
  }, [dishes, searchTerm, searchDishes]);

  const hasDishes = dishes.length > 0;
  const isPinned = restaurantId ? pinnedRestaurantIds.has(restaurantId) : false;

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

  const executeAddDish = async (name: string, rating: number) => {
    const newDish = await addDish(name, rating);
    if (newDish) {
      setShowAddForm(false);
      setDishInfoForConfirmation(null);
      setPotentialDuplicates([]);
      setSearchTerm('');
      setExpandedDishId(newDish.id);
      setJustAddedDishId(newDish.id);
    }
  };

  const handleAttemptAddDish = async (name: string, rating: number) => {
    setShowAddForm(false);
    const duplicates = findSimilarDishesForDuplicate(name);
    if (duplicates.length > 0) {
      setPotentialDuplicates(duplicates);
      setDishInfoForConfirmation({ name, rating });
    } else {
      await executeAddDish(name, rating);
    }
  };
 
  const handleSelectDuplicate = (dishId: string) => {
    setDishInfoForConfirmation(null);
    setPotentialDuplicates([]);
    const element = document.getElementById(`dish-card-${dishId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setExpandedDishId(dishId);
    }
  };

  const handleShareDish = (dish: DishWithDetails) => {
    if (!restaurant) return;
    const shareUrl = `${window.location.origin}?shareType=dish&shareId=${dish.id}&restaurantId=${dish.restaurant_id}`;
    if (navigator.share) {
      navigator.share({
        title: `${dish.name} at ${restaurant.name}`,
        text: `Check out ${dish.name} at ${restaurant.name} on How's Everything!`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Share link copied to clipboard!');
      }).catch(err => {
          console.error('Could not copy link to clipboard:', err);
          alert(`To share, copy this link: ${shareUrl}`);
      });
    }
  };

  const handleAddComment = async (dishId: string, text: string) => {
    try { await addComment(dishId, text); }
    catch (err: unknown) { setError(err instanceof Error ? `Failed to add comment: ${err.message}` : 'Failed to add comment: An unknown error occurred.'); }
  };

  const handleUpdateComment = async (commentId: string, _dishId: string, newText: string) => {
    try { await updateComment(commentId, newText); }
    catch (err: unknown) { setError(err instanceof Error ? `Failed to update comment: ${err.message}` : 'Failed to update comment: An unknown error occurred.'); }
  };

  const handleDeleteComment = async (_dishId: string, commentId: string) => {
    try { await deleteComment(commentId); }
    catch (err: unknown) { setError(err instanceof Error ? `Failed to delete comment: ${err.message}` : 'Failed to delete comment: An unknown error occurred.'); }
  };

  const handleAddPhoto = async (dishId: string, file: File, caption?: string) => {
    try { await addPhoto(dishId, file, caption); }
    catch (err: unknown) { setError(err instanceof Error ? `Failed to add photo: ${err.message}` : 'Failed to add photo: An unknown error occurred.'); }
  };

  const handleDeletePhoto = async (_dishId: string, photoId: string) => {
    try { await deletePhoto(photoId); }
    catch (err: unknown) { setError(err instanceof Error ? `Failed to delete photo: ${err.message}` : 'Failed to delete photo: An unknown error occurred.'); }
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

  if (isLoadingRestaurant || isLoadingDishes) return <LoadingScreen message="Loading menu..."/>;
  if (restaurantError) return <ErrorScreen error={restaurantError} onBack={() => navigate('/restaurants')} />;
  if (!restaurant) return <ErrorScreen error="Restaurant not found" onBack={() => navigate('/restaurants')} />;
 
  const displayAddress = [restaurant.address, (restaurant as any).city].filter(Boolean).join(', ');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background, paddingBottom: SPACING[8] }}>
      <header style={{ backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.gray200}`, position: 'sticky', top: '60px', /* Account for fixed TopNav */ zIndex: 10, boxShadow: STYLES.shadowSmall }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', padding: `${SPACING[3]} ${SPACING[4]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => navigate(-1)} style={STYLES.iconButton} aria-label="Go back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            </button>
          <div style={{ flex: 1, textAlign: 'center', margin: `0 ${SPACING[2]}`, overflow: 'hidden' }}>
            <h1 style={{ ...FONTS.heading, fontSize: TYPOGRAPHY.xl.fontSize, color: COLORS.gray900, margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }} title={restaurant.name}>
              {restaurant.name}
            </h1>
            {displayAddress && (
              <p style={{ ...FONTS.elegant, color: COLORS.text, opacity: 0.7, fontSize: '0.8rem', lineHeight: '1.3', margin: '2px 0 0 0', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {displayAddress}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
            <button
              onClick={() => restaurantId && togglePin(restaurantId)}
              style={{...STYLES.iconButton, border: 'none' }}
              aria-label={isPinned ? "Unpin restaurant" : "Pin restaurant"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isPinned ? COLORS.accent : "none"} stroke={isPinned ? COLORS.accent : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
            <button onClick={handleToggleAllExpanded} style={{ ...STYLES.iconButton, backgroundColor: allExpanded ? COLORS.primary : COLORS.white, color: allExpanded ? COLORS.white : COLORS.gray700, border: allExpanded ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.gray200}` }} aria-label={allExpanded ? "Collapse all dishes" : "Expand all dishes"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">{allExpanded ? (<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z" />) : (<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />)}</svg>
            </button>
            <button onClick={() => { setShowAdvancedSort(!showAdvancedSort); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ ...STYLES.iconButton, backgroundColor: showAdvancedSort ? COLORS.primary : COLORS.white, color: showAdvancedSort ? COLORS.white : COLORS.gray700, border: showAdvancedSort ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.gray200}` }} aria-label="Sort options">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
            </button>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: '768px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: `${SPACING[4]} ${SPACING.containerPadding}` }}>
          {dishesError && (<div style={{ backgroundColor: '#FEE2E2', border: `1px solid #FECACA`, borderRadius: STYLES.borderRadiusMedium, padding: SPACING[4], textAlign: 'center', marginBottom: SPACING[4] }}><p style={{ ...FONTS.body, color: COLORS.danger, margin: 0 }}>{dishesError}</p></div>)}
          {showAdvancedSort && (
            <div style={{ backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusLarge, padding: SPACING[4], boxShadow: STYLES.shadowMedium, border: `1px solid ${COLORS.gray200}`, marginBottom: SPACING[4] }}>
              <div style={{ display: 'flex', gap: SPACING[2], flexWrap: 'wrap' }}>
                {[{ value: 'name', label: 'Name' }, { value: 'your_rating', label: 'Your rating' }, { value: 'community_rating', label: 'Community rating' }, { value: 'date', label: 'Date Added' }].map((option) => {
                  const isActive = sortBy.criterion === option.value;
                  const buttonStyle = isActive ? STYLES.sortButtonActive : STYLES.sortButtonDefault;
                  const arrow = isActive ? (sortBy.direction === 'asc' ? '▲' : '▼') : '';
                  return (
                    <button key={option.value} onClick={() => { if (isActive) { setSortBy(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' })); } else { setSortBy({ criterion: option.value as typeof sortBy.criterion, direction: (option.value === 'your_rating' || option.value === 'community_rating') ? 'desc' : 'asc' }); } }} style={buttonStyle}>
                      {option.value === 'your_rating' ? (<><span>Your</span><span style={{ color: isActive ? COLORS.white : COLORS.primary }}>★</span></>) : option.value === 'community_rating' ? (<><span>Community</span><span style={{ color: isActive ? COLORS.white : COLORS.ratingGold }}>★</span></>) : (<span>{option.label}</span>)}
                      {arrow && <span style={{ marginLeft: SPACING[1] }}>{arrow}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {!showAddForm && hasDishes && (<div style={{ marginLeft: SPACING[1], marginRight: SPACING[1], marginBottom: SPACING[5] }}><ConsolidatedSearchAndAdd searchTerm={searchTerm} onSearchChange={handleSearchChange} onReset={handleResetSearch} onShowAddForm={handleShowAddForm} /></div>)}
          {!showAddForm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2] }}>
              {searchTerm.length > 0 && (searchResults.length > 0 ? (<>{searchResults.map((dish) => (<DishCard key={dish.id} dish={dish} currentUserId={currentUserId} onDelete={deleteDish} onUpdateRating={updateDishRating} onUpdateDishName={updateDishName} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onShare={handleShareDish} isSubmittingComment={false} isExpanded={allExpanded || expandedDishId === dish.id} onToggleExpand={() => handleToggleDishExpanded(dish.id)} />))}</>) : (<div style={{ textAlign: 'center', padding: SPACING[6], backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusLarge, boxShadow: STYLES.shadowMedium, border: `1px solid ${COLORS.gray200}` }}><p style={{ ...FONTS.body, fontSize: TYPOGRAPHY.base.fontSize, color: COLORS.textSecondary, margin: 0 }}>No dishes found matching "{searchTerm}"</p></div>))}
              {searchTerm.length === 0 && (
                hasDishes ? (
                  <>
                    {dishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} currentUserId={currentUserId} onDelete={deleteDish} onUpdateRating={updateDishRating} onUpdateDishName={updateDishName} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onShare={handleShareDish} isSubmittingComment={false} isExpanded={allExpanded || expandedDishId === dish.id} onToggleExpand={() => handleToggleDishExpanded(dish.id)} />
                    ))}
                  </>
                ) : (
                  <div style={{ backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusLarge, padding: SPACING[8], textAlign: 'center', boxShadow: STYLES.shadowMedium, border: `1px solid ${COLORS.gray200}` }}>
                    <div style={{ color: COLORS.gray400, marginBottom: SPACING[4] }}><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></svg></div>
                    <h2 style={{ ...FONTS.heading, fontSize: TYPOGRAPHY.xl.fontSize, color: COLORS.gray900, marginBottom: SPACING[3] }}>No dishes yet</h2>
                    <p style={{ ...FONTS.body, fontSize: TYPOGRAPHY.base.fontSize, color: COLORS.textSecondary, marginBottom: SPACING[5] }}>Be the first to add a dish to {restaurant.name}!</p>
                    <button onClick={handleShowAddForm} style={STYLES.primaryButton} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary; }}>Add First Dish</button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={{ marginTop: SPACING[4] }}><EnhancedAddDishForm initialDishName={searchTerm} onSubmit={handleAttemptAddDish} onCancel={() => setShowAddForm(false)} /></div>
          )}
        </div>
      </main>
      {dishInfoForConfirmation && (
        <DuplicateDishWarningModal isOpen={!!dishInfoForConfirmation} onClose={() => { setDishInfoForConfirmation(null); setPotentialDuplicates([]); }} onConfirm={() => { if (dishInfoForConfirmation) { executeAddDish(dishInfoForConfirmation.name, dishInfoForConfirmation.rating); } }} duplicates={potentialDuplicates} newDishName={dishInfoForConfirmation.name} onSelectDuplicate={handleSelectDuplicate} />
      )}
    </div>
  );
};

export default MenuScreen;