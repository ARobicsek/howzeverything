// src/MenuScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DishCard from './components/DishCard';
import ErrorScreen from './components/ErrorScreen';
import LoadingScreen from './components/LoadingScreen';
import EditRestaurantForm from './components/restaurant/EditRestaurantForm';
import { SCREEN_STYLES, SPACING, STYLES } from './constants';
import { useTheme } from './hooks/useTheme';
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
  const { theme } = useTheme();
  if (!isOpen) return null;
  return (
    <div style={STYLES.modalOverlay}>
      <div style={SCREEN_STYLES.menu.duplicateWarningModal.content}>
        <h3 style={SCREEN_STYLES.menu.duplicateWarningModal.title}>
          Dish May Already Exist
        </h3>
        <p style={SCREEN_STYLES.menu.duplicateWarningModal.text}>
          Are you sure you want to add "<strong>{newDishName}</strong>"? We found these similar dishes:
        </p>
        <ul style={SCREEN_STYLES.menu.duplicateWarningModal.list}>
          {duplicates.map((dish, index) => (
            <li
              key={dish.id}
              style={{ ...SCREEN_STYLES.menu.duplicateWarningModal.listItem, borderBottom: index < duplicates.length - 1 ? `1px solid ${theme.colors.border}` : 'none' }}
              onClick={() => onSelectDuplicate(dish.id)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primaryLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {dish.name}
            </li>
          ))}
        </ul>
        <div style={SCREEN_STYLES.menu.duplicateWarningModal.buttonContainer}>
          <button onClick={onClose} style={SCREEN_STYLES.menu.duplicateWarningModal.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} style={SCREEN_STYLES.menu.duplicateWarningModal.confirmButton}>
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
  const { theme } = useTheme();
  const hasTyped = searchTerm.length > 0;
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{
      ...SCREEN_STYLES.menu.search.container,
      backgroundColor: theme.colors.menuSearchContainerBackground,
      backdropFilter: theme.colors.menuSearchContainerBackdropFilter
    }}>
      <div style={SCREEN_STYLES.menu.search.header}>
        <h2 style={{
          ...SCREEN_STYLES.menu.search.title,
          color: theme.colors.menuSearchTitleColor
        }}>
          Find Your Dish
        </h2>
        {hasTyped && (
          <button onClick={onReset} style={SCREEN_STYLES.menu.search.resetButton} onMouseEnter={(e) => { e.currentTarget.style.color = theme.colors.danger; e.currentTarget.style.transform = 'scale(1.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = theme.colors.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }} aria-label="Clear search" title="Clear search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
          </button>
        )}
      </div>
      <input 
        type="text" 
        value={searchTerm} 
        onChange={(e) => e.target.value.length <= 100 && onSearchChange(e.target.value)} 
        placeholder="Start typing to find a dish..." 
        onFocus={() => setIsFocused(true)} 
        onBlur={() => setIsFocused(false)} 
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: theme.colors.menuInputBorder === 'none' 
            ? 'none'
            : `2px solid ${isFocused ? theme.colors.primary : theme.colors.gray200}`,
          outline: 'none',
          fontSize: '1rem',
          ...theme.fonts.body,
          backgroundColor: theme.colors.inputBg,
          color: theme.colors.black,
          boxShadow: isFocused && theme.colors.menuInputBoxShadow !== 'none'
            ? theme.colors.menuInputBoxShadow
            : 'none',
          boxSizing: 'border-box',
          transition: 'all 0.3s ease'
        }}
        autoFocus 
      />
      {hasTyped && (
        <div style={SCREEN_STYLES.menu.search.addDishContainer}>
          <p style={SCREEN_STYLES.menu.search.addDishText}>
            Don't see it below?
          </p>
          <button onClick={onShowAddForm} style={SCREEN_STYLES.menu.search.addDishButton}>
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
  const { theme } = useTheme();
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
    <div style={SCREEN_STYLES.menu.addDishForm.container}>
      <h3 style={SCREEN_STYLES.menu.addDishForm.title}>
        Add New Dish
      </h3>
      <div style={SCREEN_STYLES.menu.addDishForm.inputContainer}>
        <label style={SCREEN_STYLES.menu.addDishForm.label}>
          Dish Name
        </label>
        <input type="text" value={dishName} onChange={(e) => e.target.value.length <= 100 && setDishName(e.target.value)} placeholder="Enter the dish name as exactly as you can..." style={SCREEN_STYLES.menu.addDishForm.input} disabled={isSubmitting} />
      </div>
      <div style={SCREEN_STYLES.menu.addDishForm.ratingContainer}>
        <label style={SCREEN_STYLES.menu.addDishForm.label}>
          Your Rating (Optional)
        </label>
        <div style={SCREEN_STYLES.menu.addDishForm.starButtonContainer}>
          <div style={SCREEN_STYLES.menu.addDishForm.starButtonsInnerContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star === rating ? 0 : star)} disabled={isSubmitting} style={{ ...SCREEN_STYLES.menu.addDishForm.starButton, color: star <= rating ? theme.colors.primary : theme.colors.gray300, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1 }} onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'scale(1.1)'; } }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                ★
              </button>
            ))}
          </div>
          <span style={SCREEN_STYLES.menu.addDishForm.ratingText}>
            {rating > 0 ? `${rating}/5` : ''}
          </span>
        </div>
      </div>
      <div style={SCREEN_STYLES.menu.addDishForm.buttonContainer}>
        <button onClick={handleSubmit} disabled={!dishName.trim() || isSubmitting} style={{ ...SCREEN_STYLES.menu.addDishForm.submitButton, opacity: (!dishName.trim() || isSubmitting) ? 0.5 : 1, cursor: (!dishName.trim() || isSubmitting) ? 'not-allowed' : 'pointer' }} onMouseEnter={(e) => { if (dishName.trim() && !isSubmitting) { e.currentTarget.style.backgroundColor = theme.colors.primaryHover; } }} onMouseLeave={(e) => { if (dishName.trim() && !isSubmitting) { e.currentTarget.style.backgroundColor = theme.colors.primary; } }}>
          {isSubmitting ? 'Adding...' : 'Add Dish'}
        </button>
        <button onClick={onCancel} disabled={isSubmitting} style={{ ...SCREEN_STYLES.menu.addDishForm.cancelButton, opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};


const MenuScreen: React.FC = () => {
  const { theme } = useTheme();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


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
  const [showFullRestaurantName, setShowFullRestaurantName] = useState(false);


  const { restaurant, isLoading: isLoadingRestaurant, error: restaurantError, refreshRestaurant } = useRestaurant(restaurantId || '');
  const {
    dishes, isLoading: isLoadingDishes, error: dishesError, currentUserId, setError,
    addDish, deleteDish, updateDishRating, updateDishName, searchDishes,
    addComment, updateComment, deleteComment, addPhoto, deletePhoto, updatePhotoCaption, findSimilarDishesForDuplicate,
    isSubmittingComment
  } = useDishes(restaurantId || '', sortBy);
  const { trackVisit } = useRestaurantVisits();
  const { pinnedRestaurantIds, togglePin } = usePinnedRestaurants();


  // Get theme-specific styles for sort options
  const getSortOptionsContainerStyle = () => ({
    ...SCREEN_STYLES.menu.advancedSort.container,
    backgroundColor: theme.colors.menuSortOptionsContainer || SCREEN_STYLES.menu.advancedSort.container.backgroundColor,
  });

  const getSortButtonStyle = (isActive: boolean) => {
    const baseStyle = isActive ? STYLES.sortButtonActive : STYLES.sortButtonDefault;
    const themeBackgroundColor = isActive 
      ? theme.colors.menuSortButtonActive
      : theme.colors.menuSortButtonDefault;
    
    return {
      ...baseStyle,
      ...(themeBackgroundColor && { backgroundColor: themeBackgroundColor }),
    };
  };

  // Get theme-specific styles for restaurant modal
  const getRestaurantModalContainerStyle = () => ({
    ...SCREEN_STYLES.menu.fullNameModal.content,
    backgroundColor: theme.colors.restaurantModalContainer || SCREEN_STYLES.menu.fullNameModal.content.backgroundColor,
  });

  const getRestaurantModalNameStyle = () => ({
    ...SCREEN_STYLES.menu.fullNameModal.name,
    ...(theme.colors.restaurantModalNameColor && {
      color: theme.colors.restaurantModalNameColor,
    }),
    ...(theme.colors.restaurantModalNameTextShadow && {
      textShadow: theme.colors.restaurantModalNameTextShadow,
    }),
  });

  const getRestaurantModalAddressStyle = () => ({
    ...SCREEN_STYLES.menu.fullNameModal.address,
    ...(theme.colors.restaurantModalAddressColor && {
      color: theme.colors.restaurantModalAddressColor,
    }),
  });

  const getRestaurantModalCloseButtonStyle = () => ({
    ...SCREEN_STYLES.menu.fullNameModal.closeButton,
    ...(theme.colors.restaurantModalCloseButtonBackground && {
      backgroundColor: theme.colors.restaurantModalCloseButtonBackground,
    }),
    ...(theme.colors.restaurantModalCloseButtonTextColor && {
      color: theme.colors.restaurantModalCloseButtonTextColor,
    }),
    ...(theme.colors.restaurantModalCloseButtonBoxShadow && {
      boxShadow: theme.colors.restaurantModalCloseButtonBoxShadow,
    }),
    ...(theme.colors.restaurantModalCloseButtonBorder && {
      border: theme.colors.restaurantModalCloseButtonBorder,
    }),
  });

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
   
   
    if (dishToExpand) {
      // If dishes haven't loaded yet, wait for them
      if (isLoadingDishes) {
        return;
      }
     
      // Check if the dish exists in the loaded dishes
      const foundDish = dishes.find(dish => dish.id === dishToExpand);
      if (foundDish) {
        setExpandedDishId(dishToExpand);
      } else if (dishes.length > 0) {
        // Dishes have loaded but we didn't find the dish
        // Clear the invalid dish parameter and reset expanded state
        const newParams = new URLSearchParams(location.search);
        newParams.delete('dish');
        const newSearch = newParams.toString();
        const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
        navigate(newUrl, { replace: true });
        setExpandedDishId(null); // Ensure no dish is expanded if URL param was invalid
      }
      // If dishes.length === 0, we'll wait for them to load in the next render
    } else {
      // No dish parameter in URL, ensure no dish is expanded unless explicitly set
      if (!justAddedDishId) {
        setExpandedDishId(null);
      }
    }
  }, [location.search, location.pathname, dishes, isLoadingDishes, navigate, justAddedDishId]);




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
      }, 300); // Increased delay to ensure dish is fully rendered
      return () => clearTimeout(scrollTimer);
    }
  }, [justAddedDishId, expandedDishId]);

  // Clear justAddedDishId after highlight animation
  useEffect(() => {
    if (justAddedDishId) {
      const clearTimer = setTimeout(() => {
        setJustAddedDishId(null);
      }, 4000); // Clear after 4 seconds
      return () => clearTimeout(clearTimer);
    }
  }, [justAddedDishId]);


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
  }, [searchTerm, searchDishes]);


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

  const handleUpdatePhotoCaption = async (photoId: string, caption: string) => {
    try {
      await updatePhotoCaption(photoId, caption);
    } catch (err: unknown) {
      const message = err instanceof Error ? `Failed to update photo caption: ${err.message}` : 'Failed to update photo caption: An unknown error occurred.';
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


  if (isLoadingRestaurant || isLoadingDishes) {
    return <LoadingScreen message="Loading menu..."/>;
  }
  if (restaurantError) return <ErrorScreen error={restaurantError} onBack={() => navigate('/restaurants')} />;
  if (!restaurant) return <ErrorScreen error="Restaurant not found" onBack={() => navigate('/restaurants')} />;
  
  
  const displayAddress = [restaurant.address, restaurant.city].filter(Boolean).join(', ');


  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme.colors.background,
        minHeight: '100vh'
      }}>
      <header style={{
        position: 'sticky',
        top: '60px',
        backgroundColor: theme.colors.menuHeaderBackground,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.colors.gray200}`,
        zIndex: 10,
        boxShadow: theme.colors.menuHeaderBoxShadow,
        width: '100%',
        left: 0,
        right: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0
        }}>
            <button onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/home');
              }
            }} style={{
              ...STYLES.iconButton,
              color: theme.colors.text
            }} aria-label="Go back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            </button>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowFullRestaurantName(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFullRestaurantName(true);
            }}
            style={{
              flex: 1,
              minWidth: 0,
              cursor: 'pointer',
              overflow: 'hidden',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setShowFullRestaurantName(true);
              }
            }}
          >
            <h1 style={{
              ...theme.fonts.heading,
              fontSize: '1.25rem',
              fontWeight: '600',
              color: theme.colors.text,
              margin: 0,
              marginBottom: displayAddress ? '2px' : 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: theme.colors.menuRestaurantNameTextShadow
            }} title={restaurant.name}>
              {restaurant.name}
            </h1>
            {displayAddress && (
              <p style={{
                ...theme.fonts.body,
                fontSize: '0.75rem',
                color: theme.colors.textSecondary,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} title={displayAddress}>
                {displayAddress}
              </p>
            )}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            minWidth: 0
          }}>
            <button
              onClick={() => restaurantId && togglePin(restaurantId)}
              style={{
                ...STYLES.iconButton,
                color: isPinned ? theme.colors.accent : theme.colors.text,
                ...(isPinned && theme.colors.menuPinButtonFilter !== 'none' && {
                  filter: theme.colors.menuPinButtonFilter
                })
              }}
              aria-label={isPinned ? "Unpin restaurant" : "Pin restaurant"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isPinned ? theme.colors.accent : "none"} stroke={isPinned ? theme.colors.accent : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
            <button onClick={() => { setShowAdvancedSort(!showAdvancedSort); if (!showAdvancedSort) window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ ...STYLES.iconButton, backgroundColor: showAdvancedSort ? theme.colors.primary : theme.colors.white, color: showAdvancedSort ? theme.colors.white : theme.colors.gray700, border: showAdvancedSort ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.gray200}` }} aria-label="Sort options">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
            </button>
            <div style={SCREEN_STYLES.menu.actionMenu.container} ref={menuRef}>
              <button onClick={toggleActionMenu} style={{ ...STYLES.iconButton, backgroundColor: isActionMenuOpen ? theme.colors.gray100 : 'transparent' }} aria-label="More options">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isActionMenuOpen && (
                <div style={SCREEN_STYLES.menu.actionMenu.dropdown}>
                  <button onClick={handleShareRestaurant} style={SCREEN_STYLES.menu.actionMenu.menuItem} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=theme.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    <span>Share</span>
                  </button>
                  {restaurant.website_url && (
                    <button onClick={() => { if(restaurant.website_url) window.open(restaurant.website_url, '_blank', 'noopener,noreferrer'); setIsActionMenuOpen(false); }} style={SCREEN_STYLES.menu.actionMenu.menuItem} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=theme.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                      <span>Website</span>
                    </button>
                  )}
                  {canEditOrDelete && (
                    <>
                      <button onClick={() => { setShowEditForm(true); setIsActionMenuOpen(false); }} style={SCREEN_STYLES.menu.actionMenu.menuItem} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=theme.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <span>Edit</span>
                      </button>
                      <button onClick={handleDeleteRestaurant} style={{...SCREEN_STYLES.menu.actionMenu.menuItem, ...SCREEN_STYLES.menu.actionMenu.menuItemDanger}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=theme.colors.red50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
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
      <div style={{
        minHeight: '100vh'
      }}>
        <main style={{
            backgroundColor: 'transparent',
            minHeight: 'calc(100vh - 60px)',
            paddingTop: '80px'
          }}>
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 16px 24px 16px',
            backgroundColor: 'transparent'
          }}>
          {dishesError && (<div style={SCREEN_STYLES.menu.error.container}><p style={SCREEN_STYLES.menu.error.text}>{dishesError}</p></div>)}
          {showAdvancedSort && (
            <div style={getSortOptionsContainerStyle()}>
              <div style={SCREEN_STYLES.menu.advancedSort.innerContainer}>
                {[{ value: 'name', label: 'Name' }, { value: 'your_rating', label: 'Your rating' }, { value: 'community_rating', label: 'Community rating' }, { value: 'date', label: 'Date Added' }].map((option) => {
                  const isActive = sortBy.criterion === option.value;
                  const buttonStyle = getSortButtonStyle(isActive);
                  const arrow = isActive ? (sortBy.direction === 'asc' ? '▲' : '▼') : '';
                  return (
                    <button key={option.value} onClick={() => { if (isActive) { setSortBy(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' })); } else { setSortBy({ criterion: option.value as typeof sortBy.criterion, direction: (option.value === 'your_rating' || option.value === 'community_rating') ? 'desc' : 'asc' }); } }} style={buttonStyle}>
                      {option.value === 'your_rating' ? (<><span>My</span><span style={{ color: isActive ? theme.colors.white : theme.colors.primary }}>★</span></>) : option.value === 'community_rating' ? (<><span>Community</span><span style={{ color: isActive ? theme.colors.white : theme.colors.ratingGold }}>★</span></>) : (<span>{option.label}</span>)}
                      {arrow && <span style={SCREEN_STYLES.menu.advancedSort.arrow}>{arrow}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {!showAddForm && hasDishes && (
            <div style={{
              marginBottom: '24px'
            }}>
              <ConsolidatedSearchAndAdd 
                searchTerm={searchTerm} 
                onSearchChange={handleSearchChange} 
                onReset={handleResetSearch} 
                onShowAddForm={handleShowAddForm} 
              />
            </div>
          )}
          {!showAddForm ? (
            <div style={SCREEN_STYLES.menu.dishList.container}>
              {searchTerm.length > 0 && (searchResults.length > 0 ? (<>{searchResults.map((dish) => (<DishCard key={dish.id} dish={dish} currentUserId={currentUserId} onDelete={deleteDish} onUpdateRating={updateDishRating} onUpdateDishName={updateDishName} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onUpdatePhotoCaption={handleUpdatePhotoCaption} onShare={handleShareDish} isSubmittingComment={isSubmittingComment} isExpanded={expandedDishId === dish.id} onToggleExpand={() => setExpandedDishId(prev => prev === dish.id ? null : dish.id)} allowInlineRating={true} isNewlyAdded={justAddedDishId === dish.id} />))}</>) : (<div style={SCREEN_STYLES.menu.dishList.noResultsContainer}><p style={SCREEN_STYLES.menu.dishList.noResultsText}>No dishes found matching "{searchTerm}"</p></div>))}
              {searchTerm.length === 0 && (
                hasDishes ? (
                  <>
                    {dishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} currentUserId={currentUserId} onDelete={deleteDish} onUpdateRating={updateDishRating} onUpdateDishName={updateDishName} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto} onUpdatePhotoCaption={handleUpdatePhotoCaption} onShare={handleShareDish} isSubmittingComment={isSubmittingComment} isExpanded={expandedDishId === dish.id} onToggleExpand={() => setExpandedDishId(prev => prev === dish.id ? null : dish.id)} allowInlineRating={true} isNewlyAdded={justAddedDishId === dish.id} />
                    ))}
                  </>
                ) : (
                  <div style={{
                    ...SCREEN_STYLES.menu.emptyState.container,
                    textAlign: 'center',
                    padding: '3rem 1rem'
                  }}>
                    <div style={{
                      ...SCREEN_STYLES.menu.emptyState.icon,
                      color: theme.colors.menuEmptyStateIconColor
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></svg>
                    </div>
                    <h2 style={{
                      ...theme.fonts.heading,
                      fontSize: '1.5rem',
                      color: theme.colors.text,
                      marginBottom: '0.5rem'
                    }}>
                      No dishes yet
                    </h2>
                    <p style={{
                      ...theme.fonts.body,
                      fontSize: '1rem',
                      color: theme.colors.text,
                      opacity: 0.7,
                      marginBottom: '1.5rem'
                    }}>
                      Be the first to add a dish to {restaurant.name}!
                    </p>
                    <button onClick={handleShowAddForm} style={STYLES.primaryButton} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary; }}>Add First Dish</button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={SCREEN_STYLES.menu.addFormContainer}><EnhancedAddDishForm initialDishName={searchTerm} onSubmit={handleAttemptAddDish} onCancel={() => setShowAddForm(false)} /></div>
          )}
        </div>
        </main>
      </div>
      
      {/* Modals */}
      {showFullRestaurantName && (
          <div style={{
            ...STYLES.modalOverlay,
            alignItems: 'flex-start', // Position modal at top instead of center
            paddingTop: '100px' // Add some space from the very top
          }} onClick={() => {
            setShowFullRestaurantName(false);
          }}>
              <div style={getRestaurantModalContainerStyle()} onClick={(e) => {
                e.stopPropagation();
              }}>
                  <p style={{
                      ...getRestaurantModalNameStyle(),
                      marginBottom: displayAddress ? SPACING[2] : SPACING[6],
                  }}>
                      {restaurant.name}
                  </p>
                  {displayAddress && (
                      <p style={getRestaurantModalAddressStyle()}>
                          {displayAddress}
                      </p>
                  )}
                  <button 
                    onClick={() => {
                      setShowFullRestaurantName(false);
                    }} 
                    style={getRestaurantModalCloseButtonStyle()}
                    onMouseEnter={(e) => {
                      if (theme.colors.restaurantModalCloseButtonHoverBackground) {
                        e.currentTarget.style.backgroundColor = theme.colors.restaurantModalCloseButtonHoverBackground;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme.colors.restaurantModalCloseButtonBackground) {
                        e.currentTarget.style.backgroundColor = theme.colors.restaurantModalCloseButtonBackground;
                      }
                    }}
                  >
                      Close
                  </button>
              </div>
          </div>
      )}
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