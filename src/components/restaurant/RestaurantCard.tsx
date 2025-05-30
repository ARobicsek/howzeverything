// src/components/restaurant/RestaurantCard.tsx
import React from 'react';
import { COLORS, FONTS } from '../../constants';

interface Restaurant {
  id: string;
  name: string;
  dateAdded: string;
  created_at: string;
  geoapify_place_id?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  rating?: number;
  price_tier?: number;
  category?: string;
  opening_hours?: any;
  latitude?: number;
  longitude?: number;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onDelete: (restaurantId: string) => void;
  onNavigateToMenu: (restaurantId: string) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onDelete,
  onNavigateToMenu
}) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this restaurant and all its dishes?')) {
      onDelete(restaurant.id);
    }
  };

  const handleViewWebsite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the menu navigation
    if (restaurant.website_url) {
      window.open(restaurant.website_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start gap-x-6">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onNavigateToMenu(restaurant.id)}
            className="text-left w-full"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <h2 
              className="hover:underline mb-2" 
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
          </button>
          
          {/* Address */}
          {restaurant.address && (
            <p 
              className="text-sm mb-2"
              style={{
                ...FONTS.elegant, 
                color: COLORS.text, 
                opacity: 0.7,
                fontSize: '0.8rem',
                lineHeight: '1.3'
              }}
            >
              📍 {restaurant.address}
            </p>
          )}
          
          {/* Date Added - SIMPLIFIED: Removed "Added" text */}
          <p 
            className="text-xs" 
            style={{
              ...FONTS.elegant, 
              color: COLORS.text, 
              opacity: 0.5,
              fontSize: '0.7rem',
              lineHeight: '1.3'
            }}
          >
            {new Date(restaurant.dateAdded).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col flex-shrink-0 gap-4" style={{ marginLeft: '20px' }}>
          {/* View Website Button */}
          {restaurant.website_url && (
            <button
              onClick={handleViewWebsite}
              className="p-2 rounded-full hover:bg-blue-500/20 transition-colors focus:outline-none"
              aria-label={`View ${restaurant.name} website`}
              style={{ color: COLORS.primary }}
              onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.color = COLORS.primary}
              title="View Menu Online"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8.03,8M7.64,10C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14H4.26C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03Z"/>
              </svg>
            </button>
          )}
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none"
            aria-label={`Delete ${restaurant.name}`}
            style={{ color: COLORS.text }}
            onMouseEnter={(e) => e.currentTarget.style.color = COLORS.danger}
            onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;