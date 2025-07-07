// src/components/restaurant/RestaurantCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import { Restaurant } from '../../types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant & {
    dishCount?: number;
    raterCount?: number;
    date_favorited?: string | null;
    created_by?: string | null;
    manually_added?: boolean;
    distance?: number | string; // Optional distance prop
  };
  onDelete: (restaurantId: string) => void;
  onNavigateToMenu: (restaurantId: string) => void;
  onShare: (restaurant: Restaurant) => void;
  onEdit: (restaurantId: string) => void;
  currentUserId: string | null;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onDelete,
  onNavigateToMenu,
  onShare,
  onEdit,
  currentUserId,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null); // Ref for the entire card component

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && cardRef.current && !cardRef.current.contains(event.target as Node)) {
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
    handleAction(e, () => {
      if (window.confirm('Are you sure you want to delete this restaurant and all its dishes?')) {
        onDelete(restaurant.id);
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
    handleAction(e, () => onShare(restaurant));
  };
 
  const handleEdit = (e: React.MouseEvent) => {
    handleAction(e, () => onEdit(restaurant.id));
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };
 
  const handleCardClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    onNavigateToMenu(restaurant.id);
  };
 
  const hasDishes = (restaurant.dishCount ?? 0) > 0;
  const hasRaters = (restaurant.raterCount ?? 0) > 0;
  const hasWebsite = !!restaurant.website_url;
  const canEdit = !!(restaurant.manually_added && restaurant.created_by && restaurant.created_by === currentUserId);

  const menuButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING[2],
    width: '100%',
    padding: `${SPACING[2]} ${SPACING[3]}`,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    ...FONTS.body,
    fontSize: TYPOGRAPHY.sm.fontSize,
    textAlign: 'left',
    transition: 'background-color 0.2s ease',
  };

  const displayAddress = [restaurant.address, restaurant.city]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      style={{
        ...STYLES.card,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease',
        borderColor: isHovering ? COLORS.primary : COLORS.gray200,
        boxShadow: isHovering ? STYLES.shadowMedium : STYLES.shadowSmall,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2
          className="hover:underline"
          style={{
            ...FONTS.elegant,
            fontWeight: '500',
            color: COLORS.text,
            fontSize: '1.125rem',
            lineHeight: '1.3',
            margin: 0,
            wordWrap: 'break-word',
            hyphens: 'auto',
            flex: 1,
            minWidth: 0,
          }}
        >
          {restaurant.name}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2], flexShrink: 0, paddingLeft: SPACING[2] }}>
          {restaurant.distance && (
            <span style={{
              ...FONTS.body,
              color: COLORS.accent,
              fontWeight: TYPOGRAPHY.semibold,
              fontSize: TYPOGRAPHY.sm.fontSize,
            }}>
              {restaurant.distance}
            </span>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleMenu}
              style={{ ...STYLES.iconButton, width: '40px', height: '40px', backgroundColor: isMenuOpen ? COLORS.gray100 : 'transparent' }}
              aria-label="More options"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            {isMenuOpen && (
              <div
                ref={menuRef}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  backgroundColor: COLORS.white,
                  borderRadius: STYLES.borderRadiusMedium,
                  boxShadow: STYLES.shadowLarge,
                  border: `1px solid ${COLORS.gray200}`,
                  overflow: 'hidden',
                  zIndex: STYLES.zDropdown,
                  minWidth: '140px',
                }}
              >
                <button onClick={handleShare} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                  Share
                </button>
                {hasWebsite && (
                  <button onClick={handleViewWebsite} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Website
                  </button>
                )}
                {canEdit && (
                  <button onClick={handleEdit} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    Edit
                  </button>
                )}
                <button onClick={handleDelete} style={{...menuButtonStyle, color: COLORS.danger}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {displayAddress && (
        <p
          className="text-sm"
          style={{
            ...FONTS.elegant,
            color: COLORS.text,
            opacity: 0.7,
            fontSize: '0.8rem',
            lineHeight: '1.3',
            margin: `${SPACING[1]} 0 ${SPACING[3]} 0`, // 4px top, 12px bottom
          }}
        >
          {displayAddress}
        </p>
      )}

      <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING[4],
          marginTop: !displayAddress ? SPACING[3] : 0 // Add margin only if no address, to keep stats spaced from name
      }}>
        {(hasDishes || hasRaters) && (
          <div className="flex items-center" style={{
              fontFamily: FONTS.elegant.fontFamily,
              fontSize: '0.8rem',
              color: COLORS.gray600,
              fontWeight: 500,
              gap: SPACING[4],
            }}>
            {hasDishes && (
              <span className="flex items-center" style={{ gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>
                </svg>
                <span>{restaurant.dishCount}</span>
              </span>
            )}
            {hasRaters && (
              <span className="flex items-center" style={{ gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={COLORS.accent}>
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                <span>{restaurant.raterCount}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;