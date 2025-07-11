// src/components/restaurant/RestaurantCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import { RestaurantWithPinStatus } from '../../types/restaurant';




interface RestaurantCardProps {
  restaurant: RestaurantWithPinStatus & {
    dishCount?: number;
    raterCount?: number;
    date_favorited?: string | null;
    created_by?: string | null;
    manually_added?: boolean | null;
    distance?: number | string;
  };
  onDelete?: (restaurantId: string) => void;
  onNavigateToMenu: (restaurantId: string) => void;
  onShare?: (restaurant: RestaurantWithPinStatus) => void;
  onEdit?: (restaurantId: string) => void;
  currentUserId: string | null;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
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
  onClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);




  const getDbId = (): string | null => {
    if (restaurant.id.startsWith('db_')) {
      return restaurant.id.substring(3);
    }
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
    if (onTogglePin && dbId) {
      onTogglePin(dbId);
    }
  };
 
  const hasWebsite = !!restaurant.website_url;
  const displayAddress = [restaurant.address, restaurant.city].filter(Boolean).join(', ');




  const menuButtonStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: SPACING[2], width: '100%', padding: `${SPACING[2]} ${SPACING[3]}`,
    border: 'none', background: 'none', cursor: 'pointer', ...FONTS.body, fontSize: TYPOGRAPHY.sm.fontSize,
    textAlign: 'left', transition: 'background-color 0.2s ease',
  };




  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderBottom: `1px solid ${COLORS.gray200}`,
        padding: `${SPACING[3]} 0`,
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={() => { if(cardRef.current) cardRef.current.style.backgroundColor = COLORS.gray50; }}
      onMouseLeave={() => { if(cardRef.current) cardRef.current.style.backgroundColor = 'transparent'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING[2] }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <h2
                className="hover:underline"
                style={{
                    ...FONTS.elegant,
                    fontWeight: 500,
                    color: COLORS.text,
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                    margin: 0,
                    wordWrap: 'break-word',
                }}
            >
                {restaurant.name}
            </h2>
            {displayAddress && (
              <p
                style={{
                  ...FONTS.body,
                  color: COLORS.textSecondary,
                  fontSize: '0.875rem',
                  margin: `${SPACING[1]} 0 0 0`,
                }}
              >
                {displayAddress}
              </p>
            )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2], flexShrink: 0 }}>
          {restaurant.distance && (
            <span style={{ ...FONTS.elegant, color: COLORS.accent, fontWeight: TYPOGRAPHY.semibold, fontSize: TYPOGRAPHY.sm.fontSize, }}>
              {restaurant.distance}
            </span>
          )}
          <div style={{
              ...FONTS.body,
              fontSize: '0.65rem', fontWeight: '600', padding: '2px 4px', borderRadius: '4px',
              color: isFromApi ? COLORS.gray500 : COLORS.primary,
              backgroundColor: isFromApi ? 'rgba(107, 114, 128, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              border: `1px solid ${isFromApi ? 'rgba(107, 114, 128, 0.2)' : 'rgba(99, 102, 241, 0.3)'}`,
          }}>
              {isFromApi ? 'API' : 'DB'}
          </div>
          {onTogglePin && (
            <button
              onClick={handlePinClick}
              style={{ ...STYLES.iconButton, width: '32px', height: '32px', border: 'none', backgroundColor: 'transparent', cursor: dbId ? 'pointer' : 'default', opacity: dbId ? 1 : 0.4, }}
              disabled={!dbId} title={dbId ? (isPinned ? "Unpin restaurant" : "Pin restaurant") : "Add this restaurant to pin it"} aria-label={isPinned ? "Unpin restaurant" : "Pin restaurant"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isPinned ? COLORS.accent : "none"} stroke={isPinned ? COLORS.accent : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
          )}
          {canShowMenu && (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={toggleMenu} style={{ ...STYLES.iconButton, width: '32px', height: '32px', backgroundColor: isMenuOpen ? COLORS.gray100 : 'transparent', border: 'none' }} aria-label="More options">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusMedium, boxShadow: STYLES.shadowLarge, border: `1px solid ${COLORS.gray200}`, overflow: 'hidden', zIndex: STYLES.zDropdown, minWidth: '140px', }}>
                  {onShare && (<button onClick={handleShare} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>Share</button>)}
                  {hasWebsite && (<button onClick={handleViewWebsite} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>Website</button>)}
                  {canEdit && onEdit && (<button onClick={handleEdit} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>Edit</button>)}
                  {onDelete && (<button onClick={handleDelete} style={{...menuButtonStyle, color: COLORS.danger}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>Delete</button>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




export default RestaurantCard;