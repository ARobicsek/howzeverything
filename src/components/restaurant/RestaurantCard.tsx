// src/components/restaurant/RestaurantCard.tsx - MODIFIED
import React, { useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES } from '../../constants';
import { Restaurant } from '../../types/restaurant';


interface RestaurantCardProps {
  restaurant: Restaurant & { dishCount?: number; raterCount?: number; date_favorited?: string | null };
  onDelete: (restaurantId: string) => void;
  onNavigateToMenu: (restaurantId: string) => void;
}


const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onDelete,
  onNavigateToMenu
}) => {
  // =================================================================
  // === PLAY WITH THIS NUMBER ===
  // Change this value up or down to resize the buttons and icons.
  const actionButtonSize = 34;
  // =================================================================


  // The icon size is calculated automatically to fit inside the button.
  // You can adjust the multiplier (e.g., 0.5 for smaller icons, 0.7 for larger).
  const svgIconSize = Math.round(actionButtonSize * 0.6);


  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [isWebsiteHovered, setIsWebsiteHovered] = useState(false);
  const [isHovering, setIsHovering] = useState(false);


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this restaurant and all its dishes?')) {
      onDelete(restaurant.id);
    }
  };


  const handleViewWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.website_url) {
      window.open(restaurant.website_url, '_blank', 'noopener,noreferrer');
    }
  };


  const smallIconButton: React.CSSProperties = {
    ...STYLES.deleteButton,
    width: `${actionButtonSize}px`, // Uses the variable
    height: `${actionButtonSize}px`, // Uses the variable
    border: `1.5px solid ${COLORS.black}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };


  const deleteButtonStyle = {
    ...smallIconButton,
    backgroundColor: isDeleteHovered ? COLORS.primaryHover : COLORS.primary,
    // Add margin only if the website button will also be rendered
    marginBottom: restaurant.website_url ? SPACING[2] : 0,
  };


  const websiteButtonStyle = {
    ...smallIconButton,
    backgroundColor: isWebsiteHovered ? COLORS.primaryHover : COLORS.primary
  };


  const hasDishes = (restaurant.dishCount ?? 0) > 0;
  const hasRaters = (restaurant.raterCount ?? 0) > 0;


  return (
    <div
      onClick={() => onNavigateToMenu(restaurant.id)}
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
      <div className="flex justify-between items-start gap-x-4">
        <div className="flex-1 min-w-0">
          <h2
            className="hover:underline"
            style={{
              ...FONTS.elegant,
              fontWeight: '500',
              color: COLORS.text,
              fontSize: '1.125rem',
              lineHeight: '1.3',
              margin: 0,
              marginBottom: '8px',
              wordWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {restaurant.name}
          </h2>
         
          {restaurant.address && (
            <p
              className="text-sm"
              style={{
                ...FONTS.elegant,
                color: COLORS.text,
                opacity: 0.7,
                fontSize: '0.8rem',
                lineHeight: '1.3',
                marginBottom: '8px',
              }}
            >
              📍 {restaurant.address}
            </p>
          )}
         
          {(hasDishes || hasRaters) && (
             <div className="mt-2 flex items-center" style={{
                fontFamily: FONTS.elegant.fontFamily,
                fontSize: '0.8rem',
                color: COLORS.gray600,
                fontWeight: 500,
                gap: SPACING[4], // Space between the two stat groups
              }}>
               {hasDishes && (
                <span className="flex items-center" style={{ gap: '2px' /* Tighter spacing */ }}>
                  {/* CookingPot icon from Lucide */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#afafa7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h20"/>
                    <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/>
                    <path d="m4 8 16-4"/>
                    <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>
                  </svg>
                  <span>{restaurant.dishCount}</span>
                </span>
               )}
               {hasRaters && (
                <span className="flex items-center" style={{ gap: '2px' /* Tighter spacing */ }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#afafa7">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                  <span>{restaurant.raterCount}</span>
                </span>
               )}
             </div>
          )}
        </div>


        <div className="flex flex-col flex-shrink-0">
          <button
            onClick={handleDelete}
            style={deleteButtonStyle}
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            aria-label={`Delete ${restaurant.name}`}
          >
            {/* This icon's size is controlled by the svgIconSize variable */}
            <svg width={svgIconSize} height={svgIconSize} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </button>
         
          {restaurant.website_url && (
            <button
              onClick={handleViewWebsite}
              style={websiteButtonStyle}
              onMouseEnter={() => setIsWebsiteHovered(true)}
              onMouseLeave={() => setIsWebsiteHovered(false)}
              aria-label={`View ${restaurant.name} website`}
              title="View Menu Online"
            >
              {/* This icon's size is also controlled by the svgIconSize variable */}
              <svg width={svgIconSize} height={svgIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"/>
                <path d="M10 14 21 3"/>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default RestaurantCard;