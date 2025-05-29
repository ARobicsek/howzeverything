// src/components/RestaurantCard.tsx
import React from 'react';
import { COLORS, FONTS } from '../../constants';

interface Restaurant {
  id: string;
  name: string;
  dateAdded: string;
  created_at: string;
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

        <div className="flex flex-col flex-shrink-0" style={{ marginLeft: '20px' }}>
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