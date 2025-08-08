// src/components/restaurant/RestaurantCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { RestaurantWithPinStatus } from '../../types/restaurant';

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

  const menuButtonClassName = "flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-sans bg-transparent border-none cursor-pointer transition-colors duration-200 ease-in-out hover:bg-gray-100";

  return (
    <div
      onClick={handleCardClick}
      className="font-sans relative cursor-pointer border-b border-gray-200 py-3 transition-colors duration-200 ease-in-out hover:bg-gray-50"
    >
      <div className="flex justify-between items-start gap-4">
        {/* Left side: Name and Address */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-[1.1rem] text-text hover:underline leading-tight break-words m-0 tracking-tight">
            {restaurant.name}
          </h2>
          <p className="text-sm text-textSecondary m-0 truncate mt-1">
            {displayAddress}
          </p>
        </div>

        {/* Right side: Distance, Stats, and Controls */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {/* Top part of right side: Distance and Pin/Menu */}
          <div className="flex items-center gap-2">
            {restaurant.distance && (
              <span className="text-accent font-semibold text-sm tracking-tight">
                {restaurant.distance}
              </span>
            )}
            {onTogglePin && (
              <button
                onClick={handlePinClick}
                className="p-0 -m-1.5 w-8 h-8 border-none bg-transparent"
                title={isPinned ? "Unpin restaurant" : "Pin restaurant"} aria-label={isPinned ? "Unpin restaurant" : "Pin restaurant"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block text-textSecondary ${isPinned ? 'fill-accent stroke-accent' : 'fill-none stroke-current'}`}>
                  <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
                </svg>
              </button>
            )}
            {canShowMenu && (
              <div className="relative">
                <button onClick={toggleMenu} className="p-0 -m-1.5 w-8 h-8 border-none bg-transparent flex items-center justify-center text-textSecondary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </button>
                {isMenuOpen && (
                  <div ref={menuRef} className="absolute top-full right-0 mt-1 z-[100] w-[180px] bg-white rounded-large border border-gray-200 p-2 shadow-large">
                      {canEdit && onEdit && <button className={menuButtonClassName} onClick={handleEdit}>Edit</button>}
                      {hasWebsite && <button className={menuButtonClassName} onClick={handleViewWebsite}>View Website</button>}
                      {onShare && <button className={menuButtonClassName} onClick={handleShare}>Share</button>}
                      {onDelete && <button className={`${menuButtonClassName} text-danger`} onClick={handleDelete}>Delete</button>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom part of right side: Admin badge and Stats */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className={`text-[0.65rem] font-semibold px-1 py-0.5 rounded-sm border ${isFromApi ? 'text-gray-500 bg-gray-100 border-gray-200' : 'text-primary bg-blue-100 border-primary/20'}`}>
                {isFromApi ? 'API' : 'DB'}
              </div>
            )}
            {(restaurant.dishCount ?? 0) > 0 && (
              <div title={`${restaurant.dishCount} rated dishes`} className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-textSecondary inline-block"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></svg>
                <span className="text-textSecondary font-semibold text-sm tracking-tight">{restaurant.dishCount}</span>
              </div>
            )}
            {(restaurant.raterCount ?? 0) > 0 && (
              <div title={`${restaurant.raterCount} raters`} className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textSecondary inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span className="text-textSecondary font-semibold text-sm tracking-tight">{restaurant.raterCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;