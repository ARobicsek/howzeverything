import React from 'react';
import { createPortal } from 'react-dom';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import { Restaurant } from '../../types/restaurant';
import RestaurantCard from './RestaurantCard';


interface DuplicateRestaurantModalProps {
  isOpen: boolean;
  newRestaurantName: string;
  similarRestaurants: Restaurant[];
  onCreateNew: () => void;
  onUseExisting: (restaurant: Restaurant) => void;
  onCancel: () => void;
}


const DuplicateRestaurantModal: React.FC<DuplicateRestaurantModalProps> = ({
  isOpen,
  newRestaurantName,
  similarRestaurants,
  onCreateNew,
  onUseExisting,
  onCancel,
}) => {
  if (!isOpen) return null;


  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    // In a test environment, or if the root doesn't exist, you might want a fallback.
    // For this app, 'modal-root' should be in index.html.
    return null;
  }


  return createPortal(
    <div style={STYLES.modalOverlay} onClick={onCancel}>
      <div
        style={{ ...STYLES.modal, maxWidth: '600px', width: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: SPACING[5], flexShrink: 0 }}>
          <h2 style={{ ...TYPOGRAPHY.h2, color: COLORS.gray900, marginBottom: SPACING[2] }}>
            Similar Restaurant Found
          </h2>
          <p style={{ ...TYPOGRAPHY.body, color: COLORS.textSecondary, margin: 0 }}>
            We found {similarRestaurants.length > 1 ? 'restaurants' : 'a restaurant'} that might be the same as "{newRestaurantName}". Please review before creating a new entry.
          </p>
        </div>


        <div style={{ flex: 1, overflowY: 'auto', margin: `0 -${SPACING[4]}`, padding: `0 ${SPACING[4]}` }}>
          <div className="space-y-3">
            {similarRestaurants.map((restaurant) => (
              <div key={restaurant.id}>
                <RestaurantCard
                  restaurant={restaurant}
                  currentUserId={null} // Not needed for display
                  onNavigateToMenu={() => onUseExisting(restaurant)}
                  onClick={() => onUseExisting(restaurant)}
                />
                <button
                  onClick={() => onUseExisting(restaurant)}
                  style={{
                    ...STYLES.primaryButton,
                    width: '100%',
                    marginTop: SPACING[2],
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}`
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.blue200; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryLight; }}
                >
                  Use this one
                </button>
              </div>
            ))}
          </div>
        </div>


        <div style={{ paddingTop: SPACING[5], marginTop: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: SPACING[3], flexDirection: 'column' }}>
            <button
              onClick={onCreateNew}
              style={{ ...STYLES.secondaryButton, borderColor: COLORS.gray300, color: COLORS.text }}
            >
              Create "{newRestaurantName}" as a New Restaurant
            </button>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.textSecondary,
                ...FONTS.body,
                fontSize: TYPOGRAPHY.sm.fontSize,
                cursor: 'pointer',
                padding: SPACING[2],
                textDecoration: 'underline'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};


export default DuplicateRestaurantModal;