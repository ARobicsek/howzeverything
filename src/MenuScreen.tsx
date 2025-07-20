// src/MenuScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DishCard from './components/DishCard';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import EditRestaurantForm from './components/restaurant/EditRestaurantForm';
import { BORDERS, COLORS, FONTS, LAYOUT_CONFIG, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';
import { useDishes, type DishSearchResult, type DishWithDetails } from './hooks/useDishes';
import { usePinnedRestaurants } from './hooks/usePinnedRestaurants';
import { useRestaurant } from './hooks/useRestaurant';
import { useRestaurantVisits } from './hooks/useRestaurantVisits';
import { supabase } from './supabaseClient';

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
  const { user, profile } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{ criterion: 'name' | 'your_rating' | 'community_rating' | 'date'; direction: 'asc' | 'desc' }>({ criterion: 'community_rating', direction: 'desc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);
  const [justAddedDishId, setJustAddedDishId] = useState<string | null>(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState<DishSearchResult[]>([]);
  const [dishInfoForConfirmation, setDishInfoForConfirmation] = useState<{ name: string; rating: number } | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const { restaurant, isLoading: isLoadingRestaurant, error: restaurantError, refreshRestaurant } = useRestaurant(restaurantId || '');
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
 
  // Enhanced dish parameter handling - REPLACE the existing dish parameter useEffect with this
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dishToExpand = params.get('dish');
    
    console.log('[MenuScreen] Processing URL parameters:', {
      search: location.search,
      dishToExpand: dishToExpand,
      currentDishes: dishes.length,
      isLoadingDishes: isLoadingDishes
    });
    
    if (dishToExpand) {
      // If dishes haven't loaded yet, wait for them
      if (isLoadingDishes) {
        console.log('[MenuScreen] Dishes still loading, will wait...');
        return;
      }
      
      // Check if the dish exists in the loaded dishes
      const foundDish = dishes.find(dish => dish.id === dishToExpand);
      if (foundDish) {
        console.log('[MenuScreen] Found dish to expand:', foundDish.name);
        setExpandedDishId(dishToExpand);
      } else if (dishes.length > 0) {
        // Dishes have loaded but we didn't find the dish
        console.warn('[MenuScreen] Dish not found in restaurant:', {
          searchingFor: dishToExpand,
          availableDishes: dishes.map(d => ({ id: d.id, name: d.name }))
        });
        // Clear the invalid dish parameter
        const newParams = new URLSearchParams(location.search);
        newParams.delete('dish');
        const newSearch = newParams.toString();
        const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
        navigate(newUrl, { replace: true });
      }
      // If dishes.length === 0, we'll wait for them to load in the next render
    }
  }, [location.search, dishes, isLoadingDishes, navigate]);

  // Additional debugging useEffect - ADD this as a new useEffect after the dish parameter one
  useEffect(() => {
    console.log('[MenuScreen] State update:', {
      restaurantId: restaurantId,
      restaurant: restaurant?.name || 'not loaded',
      dishesCount: dishes.length,
      isLoadingRestaurant: isLoadingRestaurant,
      isLoadingDishes: isLoadingDishes,
      restaurantError: restaurantError,
      dishesError: dishesError,
      expandedDishId: expandedDishId
    });
  }, [restaurantId, restaurant, dishes.length, isLoadingRestaurant, isLoadingDishes, restaurantError, dishesError, expandedDishId]);

  useEffect(() => {
    // Reset scroll to top on mount to ensure search bar is visible below the sticky header
    window.scrollTo(0, 0);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    if (isActionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionMenuOpen]);

  const searchResults = useMemo(() => {
    return searchDishes(searchTerm);
  }, [dishes, searchTerm, searchDishes]);

  const hasOtherUserContributions = useMemo(() => {
    if (!dishes || !user) return true;
    for (const dish of dishes) {
        if (dish.created_by && dish.created_by !== user.id) return true;
        for (const comment of dish.comments || []) {
            if (comment.user_id !== user.id) return true;
        }
        for (const rating of dish.ratings || []) {
            if (rating.user_id !== user.id) return true;
        }
        for (const photo of dish.photos || []) {
            if (photo.user_id !== user.id) return true;
        }
    }
    return false;
  }, [dishes, user]);

  const isOwner = restaurant?.created_by === user?.id;
  const isAdmin = profile?.is_admin === true;
  const canEditOrDelete = isAdmin || (isOwner && !hasOtherUserContributions);

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
    const shareUrl = `${window.location.origin}/restaurants/${dish.restaurant_id}?dish=${dish.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${dish.name} at ${restaurant.name}`,
        text: `Check out ${dish.name} at ${restaurant.name} on HowzEverything!`,
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
    try { 
      await addComment(dishId, text); 
    } catch (err: unknown) { 
      const message = err instanceof Error ? `Failed to add comment: ${err.message}` : 'Failed to add comment: An unknown error occurred.';
      setError(message);
      throw new Error(message);
    }
  };

  const handleUpdateComment = async (commentId: string, _dishId: string, newText: string) => {
    try { 
      await updateComment(commentId, newText); 
    } catch (err: unknown) { 
      const message = err instanceof Error ? `Failed to update comment: ${err.message}` : 'Failed to update comment: An unknown error occurred.';
      setError(message);
      throw new Error(message);
    }
  };

  const handleDeleteComment = async (_dishId: string, commentId: string) => {
    try { 
      await deleteComment(commentId); 
    } catch (err: unknown) { 
      const message = err instanceof Error ? `Failed to delete comment: ${err.message}` : 'Failed to delete comment: An unknown error occurred.';
      setError(message);
      throw new Error(message);
    }
  };

  const handleAddPhoto = async (dishId: string, file: File, caption?: string) => {
    try { 
      await addPhoto(dishId, file, caption); 
    } catch (err: unknown) { 
      const message = err instanceof Error ? `Failed to add photo: ${err.message}` : 'Failed to add photo: An unknown error occurred.';
      setError(message);
      throw new Error(message);
    }
  };

  const handleDeletePhoto = async (_dishId: string, photoId: string) => {
    try { 
      await deletePhoto(photoId); 
    } catch (err: unknown) { 
      const message = err instanceof Error ? `Failed to delete photo: ${err.message}` : 'Failed to delete photo: An unknown error occurred.';
      setError(message);
      throw new Error(message);
    }
  };

  const toggleActionMenu = () => setIsActionMenuOpen(prev => !prev);

  const handleShareRestaurant = () => {
    if (!restaurant) return;
    const shareUrl = `${window.location.origin}/restaurants/${restaurant.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Check out ${restaurant.name} on HowzEverything!`,
        text: `I'm using HowzEverything to rate dishes at ${restaurant.name}.`,
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
    setIsActionMenuOpen(false);
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant || !canEditOrDelete) return;
    if (window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
        try {
            const { error: rpcError } = await supabase.rpc('delete_restaurant_and_children', {
                p_restaurant_id: restaurant.id,
            });

            if (rpcError) {
                throw rpcError;
            }
           
            alert('Restaurant deleted successfully.');
            navigate('/find-restaurant', { replace: true });
        } catch (err) {
            console.error('Error deleting restaurant:', err);
            alert(`Failed to delete restaurant: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
        }
    }
    setIsActionMenuOpen(false);
  };

  if (isLoadingRestaurant || isLoadingDishes) return <LoadingScreen message="Loading menu..."/>;
  if (restaurantError) return <ErrorScreen error={restaurantError} onBack={() => navigate('/restaurants')} />;
  if (!restaurant) return <ErrorScreen error="Restaurant not found" onBack={() => navigate('/restaurants')} />;
  const displayAddress = [restaurant.address, (restaurant as any).city].filter(Boolean).join(', ');

  const menuButtonStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: SPACING[2], width: '100%', padding: `${SPACING[2]} ${SPACING[3]}`,
    border: 'none', background: 'none', cursor: 'pointer', ...FONTS.body, fontSize: TYPOGRAPHY.sm.fontSize,
    textAlign: 'left', transition: 'background-color 0.2s ease',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
      <header style={{
          backgroundColor: COLORS.white,
          borderBottom: `1px solid ${COLORS.gray200}`,
          position: 'sticky',
          top: '59px',
          zIndex: 10,
          boxShadow: STYLES.shadowSmall,
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', padding: `${SPACING[3]} ${LAYOUT_CONFIG.APP_CONTAINER.padding}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <button onClick={() => { setShowAdvancedSort(!showAdvancedSort); if (!showAdvancedSort) window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ ...STYLES.iconButton, backgroundColor: showAdvancedSort ? COLORS.primary : COLORS.white, color: showAdvancedSort ? COLORS.white : COLORS.gray700, border: showAdvancedSort ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.gray200}` }} aria-label="Sort options">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
            </button>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={toggleActionMenu} style={{ ...STYLES.iconButton, backgroundColor: isActionMenuOpen ? COLORS.gray100 : 'transparent' }} aria-label="More options">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isActionMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusMedium, boxShadow: STYLES.shadowLarge, border: `1px solid ${COLORS.gray200}`, overflow: 'hidden', zIndex: STYLES.zDropdown, minWidth: '160px', }}>
                  <button onClick={handleShareRestaurant} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    <span>Share</span>
                  </button>
                  {restaurant.website_url && (
                    <button onClick={() => { if(restaurant.website_url) window.open(restaurant.website_url, '_blank', 'noopener,noreferrer'); setIsActionMenuOpen(false); }} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                      <span>Website</span>
                    </button>
                  )}
                  {canEditOrDelete && (
                    <>
                      <button onClick={() => { setShowEditForm(true); setIsActionMenuOpen(false); }} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <span>Edit</span>
                      </button>
                      <button onClick={handleDeleteRestaurant} style={{...menuButtonStyle, color: COLORS.danger}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.red50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: '768px', width: '100%', margin: '0 auto', paddingTop: SPACING[4] }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: `0 ${SPACING[1]}` }}>
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
              {searchTerm.length > 0 && (searchResults.length > 0 ? (<>{searchResults.map((dish) => (<DishCard key={dish.id} dish={dish} currentUserId={currentUserId} onDelete={deleteDish} onUpdateRating={updateDishRating} onUpdateDishName={updateDishName} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onShare={handleShareDish} isSubmittingComment={false} isExpanded={expandedDishId === dish.id} onToggleExpand={() => setExpandedDishId(prev => prev === dish.id ? null : dish.id)} />))}</>) : (<div style={{ textAlign: 'center', padding: SPACING[6], backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusLarge, boxShadow: STYLES.shadowMedium, border: `1px solid ${COLORS.gray200}` }}><p style={{ ...FONTS.body, fontSize: TYPOGRAPHY.base.fontSize, color: COLORS.textSecondary, margin: 0 }}>No dishes found matching "{searchTerm}"</p></div>))}
              {searchTerm.length === 0 && (
                hasDishes ? (
                  <>
                    {dishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} currentUserId={currentUserId} onDelete={deleteDish} onUpdateRating={updateDishRating} onUpdateDishName={updateDishName} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onShare={handleShareDish} isSubmittingComment={false} isExpanded={expandedDishId === dish.id} onToggleExpand={() => setExpandedDishId(prev => prev === dish.id ? null : dish.id)} />
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
       {showEditForm && restaurant && (
          <EditRestaurantForm
              restaurant={restaurant}
              onCancel={() => setShowEditForm(false)}
              onSuccess={() => {
                  setShowEditForm(false);
                  refreshRestaurant();
              }}
          />
       )}
    </div>
  );
};

export default MenuScreen;