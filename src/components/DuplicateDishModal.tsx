// src/components/DuplicateDishModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../constants';
import { DishSearchResult } from '../hooks/useDishes';
import { getSimilarityDescription } from '../utils/dishSearch';


interface DuplicateDishModalProps {
  isOpen: boolean;
  newDishName: string;
  similarDishes: DishSearchResult[];
  onCreateNew: () => void;
  onUseExisting: (dish: DishSearchResult) => void;
  onCancel: () => void;
}


const DuplicateDishModal: React.FC<DuplicateDishModalProps> = ({
  isOpen,
  newDishName,
  similarDishes,
  onCreateNew,
  onUseExisting,
  onCancel
}) => {
  if (!isOpen) return null;


  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;


  const topSimilarDish = similarDishes[0];
  const hasMultipleSimilar = similarDishes.length > 1;


  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: SPACING[4]
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: STYLES.borderRadiusLarge,
          padding: SPACING[6],
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: STYLES.shadowLarge
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: SPACING[5] }}>
          <h2 style={{
            ...FONTS.heading,
            fontSize: TYPOGRAPHY.xl.fontSize,
            color: COLORS.gray900,
            marginBottom: SPACING[2]
          }}>
            Similar Dish Found
          </h2>
          <p style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.base.fontSize,
            color: COLORS.textSecondary,
            margin: 0
          }}>
            We found {hasMultipleSimilar ? 'dishes' : 'a dish'} that might be the same as "{newDishName}".
            Would you like to use the existing {hasMultipleSimilar ? 'one' : 'dish'} or create a new one?
          </p>
        </div>


        {/* Similar Dishes List */}
        <div style={{ marginBottom: SPACING[6] }}>
          {similarDishes.slice(0, 3).map((dish, index) => (
            <div
              key={dish.id}
              style={{
                backgroundColor: index === 0 ? COLORS.gray50 : COLORS.gray50,
                border: `1px solid ${index === 0 ? COLORS.gray300 : COLORS.gray200}`,
                borderRadius: STYLES.borderRadiusMedium,
                padding: SPACING[4],
                marginBottom: index < Math.min(similarDishes.length - 1, 2) ? SPACING[3] : 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onUseExisting(dish)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = index === 0 ? COLORS.gray100 : COLORS.gray100;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index === 0 ? COLORS.gray50 : COLORS.gray50;
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    ...FONTS.heading,
                    fontSize: TYPOGRAPHY.base.fontSize,
                    color: COLORS.gray900,
                    marginBottom: SPACING[1]
                  }}>
                    {dish.name}
                  </h3>
                 
                  <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[3], marginBottom: SPACING[2] }}>
                    {/* Community Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[1] }}>
                      <span style={{ color: COLORS.ratingGold, fontSize: TYPOGRAPHY.sm.fontSize }}>★</span>
                      <span style={{
                        ...FONTS.body,
                        fontSize: TYPOGRAPHY.sm.fontSize,
                        color: COLORS.text
                      }}>
                        {dish.average_rating > 0 ? dish.average_rating.toFixed(1) : 'No ratings'}
                      </span>
                      <span style={{
                        ...FONTS.body,
                        fontSize: TYPOGRAPHY.xs.fontSize,
                        color: COLORS.textSecondary
                      }}>
                        ({dish.total_ratings} {dish.total_ratings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>


                  <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
                    <span style={{
                      ...FONTS.body,
                      fontSize: TYPOGRAPHY.xs.fontSize,
                      color: COLORS.textSecondary
                    }}>
                      {getSimilarityDescription(dish.similarityScore || 0)}
                    </span>
                    <span style={{
                      backgroundColor: index === 0 ? COLORS.gray300 : COLORS.gray200,
                      color: index === 0 ? COLORS.gray700 : COLORS.gray700,
                      padding: `${SPACING[1]} ${SPACING[2]}`,
                      borderRadius: STYLES.borderRadiusSmall,
                      fontSize: TYPOGRAPHY.xs.fontSize,
                      fontWeight: TYPOGRAPHY.medium
                    }}>
                      {dish.similarityScore}% match
                    </span>
                  </div>
                </div>
               
                {index === 0 && (
                  <div style={{
                    color: COLORS.primary,
                    fontSize: TYPOGRAPHY.xs.fontSize,
                    fontWeight: TYPOGRAPHY.medium,
                    marginLeft: SPACING[2]
                  }}>
                    Best match
                  </div>
                )}
              </div>
            </div>
          ))}
         
          {similarDishes.length > 3 && (
            <p style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              color: COLORS.textSecondary,
              textAlign: 'center',
              margin: `${SPACING[2]} 0 0 0`,
              fontStyle: 'italic'
            }}>
              +{similarDishes.length - 3} more similar {similarDishes.length - 3 === 1 ? 'dish' : 'dishes'} found
            </p>
          )}
        </div>


        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: SPACING[3], flexDirection: 'column' }}>
          {/* Primary action - Use existing */}
          <button
            onClick={() => onUseExisting(topSimilarDish)}
            style={{
              ...STYLES.primaryButton,
              padding: `${SPACING[3]} ${SPACING[4]}`,
              fontSize: TYPOGRAPHY.base.fontSize,
              fontWeight: TYPOGRAPHY.medium
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primary;
            }}
          >
            Use "{topSimilarDish.name}"
          </button>
         
          {/* Secondary action - Create new */}
          <button
            onClick={onCreateNew}
            style={{
              ...STYLES.secondaryButton,
              padding: `${SPACING[3]} ${SPACING[4]}`,
              fontSize: TYPOGRAPHY.base.fontSize
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.gray100;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.white;
            }}
          >
            Create "{newDishName}" as New Dish
          </button>
         
          {/* Cancel action */}
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.textSecondary,
              fontSize: TYPOGRAPHY.sm.fontSize,
              cursor: 'pointer',
              padding: SPACING[2],
              textDecoration: 'underline'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.textSecondary;
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};


export default DuplicateDishModal;