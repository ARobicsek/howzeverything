// src/components/restaurant/RestaurantCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { COMPONENT_STYLES, DESIGN_TOKENS, FONTS, TYPOGRAPHY } from '../../constants';
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
  const cardRef = useRef<HTMLDivElement>(null);




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




  const menuButtonStyle: React.CSSProperties = {
    ...COMPONENT_STYLES.restaurantCard.menuButton,
    ...FONTS.body,
  };


  const statsPaddingRight = canShowMenu ? `calc(32px + ${DESIGN_TOKENS.spacing[2]})` : '0px';


  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      style={COMPONENT_STYLES.restaurantCard.container}
      onMouseEnter={() => { if(cardRef.current) cardRef.current.style.backgroundColor = DESIGN_TOKENS.colors.gray50; }}
      onMouseLeave={() => { if(cardRef.current) cardRef.current.style.backgroundColor = 'transparent'; }}
    >
      {/* TOP ROW: Name and Controls */}
      <div style={COMPONENT_STYLES.restaurantCard.header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            className="hover:underline"
            style={{
                ...COMPONENT_STYLES.restaurantCard.title,
                ...FONTS.elegant,
            }}
          >
            {restaurant.name}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2], flexShrink: 0 }}>
          {restaurant.distance && (
            <span style={{ ...FONTS.elegant, color: DESIGN_TOKENS.colors.accent, fontWeight: TYPOGRAPHY.semibold, fontSize: TYPOGRAPHY.sm.fontSize }}>
              {restaurant.distance}
            </span>
          )}
          {isAdmin && (
            <div style={{
                ...FONTS.body,
                fontSize: '0.65rem', fontWeight: '600', padding: '2px 4px', borderRadius: '4px',
                color: isFromApi ? DESIGN_TOKENS.colors.gray500 : DESIGN_TOKENS.colors.primary,
                backgroundColor: isFromApi ? 'rgba(107, 114, 128, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                border: `1px solid ${isFromApi ? 'rgba(107, 114, 128, 0.2)' : 'rgba(99, 102, 241, 0.3)'}`,
            }}>
              {isFromApi ? 'API' : 'DB'}
            </div>
          )}
          {onTogglePin && (
            <button
              onClick={handlePinClick}
              style={{ ...COMPONENT_STYLES.button.icon.transparent, width: '32px', height: '32px', margin: '-6px' }}
              title={isPinned ? "Unpin restaurant" : "Pin restaurant"} aria-label={isPinned ? "Unpin restaurant" : "Pin restaurant"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isPinned ? DESIGN_TOKENS.colors.accent : "none"} stroke={isPinned ? DESIGN_TOKENS.colors.accent : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
          )}
          {canShowMenu && (
            <div style={{ position: 'relative' }}>
              <button onClick={toggleMenu} style={{ ...COMPONENT_STYLES.button.icon.transparent, width: '32px', height: '32px', margin: '-6px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isMenuOpen && (
                <div ref={menuRef} style={COMPONENT_STYLES.restaurantCard.actionMenu}>
                    {canEdit && onEdit && <button style={menuButtonStyle} onClick={handleEdit}>Edit</button>}
                    {hasWebsite && <button style={menuButtonStyle} onClick={handleViewWebsite}>View Website</button>}
                    {onShare && <button style={menuButtonStyle} onClick={handleShare}>Share</button>}
                    {onDelete && <button style={{...menuButtonStyle, color: DESIGN_TOKENS.colors.danger}} onClick={handleDelete}>Delete</button>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* BOTTOM ROW: Address and Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: DESIGN_TOKENS.spacing[2], marginTop: DESIGN_TOKENS.spacing[1] }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
                ...COMPONENT_STYLES.restaurantCard.address,
                ...FONTS.body,
            }}
          >
            {displayAddress}
          </p>
        </div>
        <div style={{...COMPONENT_STYLES.restaurantCard.stats, paddingRight: statsPaddingRight }}>
          {(restaurant.dishCount ?? 0) > 0 && (
            <div title={`${restaurant.dishCount} rated dishes`} style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[1] }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: DESIGN_TOKENS.colors.accent }}><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></svg>
              <span style={{...FONTS.elegant, color: DESIGN_TOKENS.colors.textSecondary, fontWeight: TYPOGRAPHY.semibold, fontSize: TYPOGRAPHY.sm.fontSize}}>{restaurant.dishCount}</span>
            </div>
          )}
          {(restaurant.raterCount ?? 0) > 0 && (
            <div title={`${restaurant.raterCount} raters`} style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[1] }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: DESIGN_TOKENS.colors.accent }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span style={{...FONTS.elegant, color: DESIGN_TOKENS.colors.textSecondary, fontWeight: TYPOGRAPHY.semibold, fontSize: TYPOGRAPHY.sm.fontSize}}>{restaurant.raterCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




export default RestaurantCard;