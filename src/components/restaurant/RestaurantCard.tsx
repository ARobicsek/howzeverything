// src/components/restaurant/RestaurantCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { RestaurantWithPinStatus } from '../../types/restaurant';
import { COLORS } from '../../constants';

interface RestaurantCardProps {
  restaurant: RestaurantWithPinStatus & {
    date_favorited?: string | null;
    created_by?: string | null;
    manually_added?: boolean | null;
  };
  onDelete?: (restaurantId: string) => void;
  onNavigateToMenu: (restaurantId: string) => void;
  onShare?: (restaurant: RestaurantWithPinStatus) => void;
  onEdit?: (restaurantId: string) => void;
  currentUserId: string | null;
  isPinned?: boolean;
  onTogglePin?: (restaurant: RestaurantWithPinStatus) => void;
  isAdmin?: boolean;
  onClick?: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onDelete,
  onNavigateToMenu,
  onShare,
  onEdit,
  currentUserId,
  isPinned,
  onTogglePin,
  isAdmin = false,
  onClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getDbId = (): string | null => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(restaurant.id)) {
      return restaurant.id;
    }
    return null;
  };
 
  const dbId = getDbId();
  const isFromApi = !dbId;
  const canShowMenu = (onDelete || onShare || onEdit) && dbId;
  const canEdit = !!(dbId && restaurant.manually_added && restaurant.created_by && restaurant.created_by === currentUserId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };
 
  const handleDelete = (e: React.MouseEvent) => {
    if (!onDelete || !dbId) return;
    handleAction(e, () => {
      if (window.confirm('Are you sure you want to delete this restaurant and all its dishes?')) {
        onDelete(dbId);
      }
    });
  };

  const handleViewWebsite = (e: React.MouseEvent) => {
    handleAction(e, () => {
      if (restaurant.website_url) {
        window.open(restaurant.website_url, '_blank', 'noopener,noreferrer');
      }
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    if (onShare) handleAction(e, () => onShare(restaurant));
  };
 
  const handleEdit = (e: React.MouseEvent) => {
    if (onEdit && dbId) handleAction(e, () => onEdit(dbId));
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };
 
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    if (onClick) {
        onClick();
    } else if (dbId) {
        onNavigateToMenu(dbId);
    }
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin(restaurant);
    }
  };
 
  const hasWebsite = !!restaurant.website_url;
  const displayAddress = [restaurant.address, restaurant.city].filter(Boolean).join(', ');

  const menuButtonClasses = "flex items-center gap-2 w-full px-3 py-2 border-none bg-none cursor-pointer font-body text-sm text-left transition-colors duration-200 ease-in-out hover:bg-gray-100";

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer border-b border-gray-200 py-3 transition-colors duration-200 ease-in-out hover:bg-gray-50"
    >
      {/* TOP ROW: Name and Controls */}
      <div className="flex justify-between items-baseline gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-elegant font-medium text-text text-lg leading-tight m-0 break-words hover:underline">
            {restaurant.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {restaurant.distance && (
            <span className="font-elegant text-accent font-semibold text-sm">
              {restaurant.distance}
            </span>
          )}
          {isAdmin && (
            <div className={`font-body text-xs font-semibold px-1 py-0.5 rounded-md border ${
              isFromApi
                ? 'text-gray-500 bg-gray-100 border-gray-200'
                : 'text-primary bg-blue-50 border-blue-200'
            }`}>
              {isFromApi ? 'API' : 'DB'}
            </div>
          )}
          {onTogglePin && (
            <button
              onClick={handlePinClick}
              className="p-1.5 -m-1.5 rounded-full hover:bg-gray-100"
              title={isPinned ? "Unpin restaurant" : "Pin restaurant"}
              aria-label={isPinned ? "Unpin restaurant" : "Pin restaurant"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isPinned ? COLORS.accent : 'none'} stroke={isPinned ? COLORS.accent : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
          )}
          {canShowMenu && (
            <div className="relative">
              <button onClick={toggleMenu} className="p-1.5 -m-1.5 rounded-full hover:bg-gray-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isMenuOpen && (
                <div ref={menuRef} className="absolute top-full right-0 mt-1 z-dropdown w-48 p-2 shadow-large bg-white rounded-lg border border-gray-200">
                    {canEdit && onEdit && <button className={menuButtonClasses} onClick={handleEdit}>Edit</button>}
                    {hasWebsite && <button className={menuButtonClasses} onClick={handleViewWebsite}>View Website</button>}
                    {onShare && <button className={menuButtonClasses} onClick={handleShare}>Share</button>}
                    {onDelete && <button className={`${menuButtonClasses} text-danger`} onClick={handleDelete}>Delete</button>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* BOTTOM ROW: Address and Stats */}
      <div className={`flex justify-between items-baseline gap-2 mt-1 ${canShowMenu ? 'pr-10' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className="font-body text-textSecondary text-sm m-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {displayAddress}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {(restaurant.dishCount ?? 0) > 0 && (
            <div title={`${restaurant.dishCount} rated dishes`} className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></svg>
              <span className="font-elegant text-textSecondary font-semibold text-sm">{restaurant.dishCount}</span>
            </div>
          )}
          {(restaurant.raterCount ?? 0) > 0 && (
            <div title={`${restaurant.raterCount} raters`} className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span className="font-elegant text-textSecondary font-semibold text-sm">{restaurant.raterCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;