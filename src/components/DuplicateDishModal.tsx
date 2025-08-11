// src/components/DuplicateDishModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { COMPONENT_STYLES, STYLE_FUNCTIONS, COLORS } from '../constants';
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
      style={COMPONENT_STYLES.duplicateDishModal.overlay}
      onClick={onCancel}
    >
      <div
        style={COMPONENT_STYLES.duplicateDishModal.content}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={COMPONENT_STYLES.duplicateDishModal.headerContainer}>
          <h2 style={COMPONENT_STYLES.duplicateDishModal.title}>
            Similar Dish Found
          </h2>
          <p style={COMPONENT_STYLES.duplicateDishModal.description}>
            We found {hasMultipleSimilar ? 'dishes' : 'a dish'} that might be the same as "{newDishName}".
            Would you like to use the existing {hasMultipleSimilar ? 'one' : 'dish'} or create a new one?
          </p>
        </div>

        {/* Similar Dishes List */}
        <div style={COMPONENT_STYLES.duplicateDishModal.listContainer}>
          {similarDishes.slice(0, 3).map((dish, index) => (
            <div
              key={dish.id}
              style={{
                ...STYLE_FUNCTIONS.getDishItemStyle(index === 0),
                marginBottom: index < Math.min(similarDishes.length - 1, 2) ? '0.75rem' : 0,
              }}
              onClick={() => onUseExisting(dish)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.gray100;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.gray50;
              }}
            >
              <div style={COMPONENT_STYLES.duplicateDishModal.dishItemContent}>
                <div style={COMPONENT_STYLES.duplicateDishModal.dishItemDetails}>
                  <h3 style={COMPONENT_STYLES.duplicateDishModal.dishItemTitle}>
                    {dish.name}
                  </h3>
                 
                  <div style={COMPONENT_STYLES.duplicateDishModal.dishItemMetaContainer}>
                    {/* Community Rating */}
                    <div style={COMPONENT_STYLES.duplicateDishModal.dishItemRatingContainer}>
                      <span style={COMPONENT_STYLES.duplicateDishModal.dishItemRatingIcon}>★</span>
                      <span style={COMPONENT_STYLES.duplicateDishModal.dishItemRatingText}>
                        {dish.average_rating > 0 ? dish.average_rating.toFixed(1) : 'No ratings'}
                      </span>
                      <span style={COMPONENT_STYLES.duplicateDishModal.dishItemRatingCount}>
                        ({dish.total_ratings} {dish.total_ratings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>

                  <div style={COMPONENT_STYLES.duplicateDishModal.dishItemSimilarityContainer}>
                    <span style={COMPONENT_STYLES.duplicateDishModal.dishItemSimilarityText}>
                      {getSimilarityDescription(dish.similarityScore || 0)}
                    </span>
                    <span style={STYLE_FUNCTIONS.getSimilarityBadgeStyle(index === 0)}>
                      {dish.similarityScore}% match
                    </span>
                  </div>
                </div>
               
                {index === 0 && (
                  <div style={COMPONENT_STYLES.duplicateDishModal.bestMatchBadge}>
                    Best match
                  </div>
                )}
              </div>
            </div>
          ))}
         
          {similarDishes.length > 3 && (
            <p style={COMPONENT_STYLES.duplicateDishModal.moreDishesText}>
              +{similarDishes.length - 3} more similar {similarDishes.length - 3 === 1 ? 'dish' : 'dishes'} found
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={COMPONENT_STYLES.duplicateDishModal.actionsContainer}>
          {/* Primary action - Use existing */}
          <button
            onClick={() => onUseExisting(topSimilarDish)}
            style={COMPONENT_STYLES.duplicateDishModal.useExistingButton}
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
            style={COMPONENT_STYLES.duplicateDishModal.createNewButton}
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
            style={COMPONENT_STYLES.duplicateDishModal.cancelButton}
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