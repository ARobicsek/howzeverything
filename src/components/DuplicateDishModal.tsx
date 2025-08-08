// src/components/DuplicateDishModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5">
          <h2 className="font-heading text-xl text-gray-900 mb-2">
            Similar Dish Found
          </h2>
          <p className="font-body text-base text-textSecondary m-0">
            We found {hasMultipleSimilar ? 'dishes' : 'a dish'} that might be the same as "{newDishName}".
            Would you like to use the existing {hasMultipleSimilar ? 'one' : 'dish'} or create a new one?
          </p>
        </div>

        <div className="mb-6">
          {similarDishes.slice(0, 3).map((dish, index) => (
            <div
              key={dish.id}
              className={`border rounded-md p-4 mb-3 cursor-pointer transition-all duration-200 ease-in-out ${
                index === 0 ? 'bg-gray-50 border-gray-300 hover:bg-gray-100' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onUseExisting(dish)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-heading text-base text-gray-900 mb-1">
                    {dish.name}
                  </h3>
                 
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-ratingGold text-sm">★</span>
                      <span className="font-body text-sm text-text">
                        {dish.average_rating > 0 ? dish.average_rating.toFixed(1) : 'No ratings'}
                      </span>
                      <span className="font-body text-xs text-textSecondary">
                        ({dish.total_ratings} {dish.total_ratings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs text-textSecondary">
                      {getSimilarityDescription(dish.similarityScore || 0)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      index === 0 ? 'bg-gray-300 text-gray-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {dish.similarityScore}% match
                    </span>
                  </div>
                </div>
               
                {index === 0 && (
                  <div className="text-primary text-xs font-medium ml-2">
                    Best match
                  </div>
                )}
              </div>
            </div>
          ))}
         
          {similarDishes.length > 3 && (
            <p className="font-body text-sm text-textSecondary text-center mt-2 italic">
              +{similarDishes.length - 3} more similar {similarDishes.length - 3 === 1 ? 'dish' : 'dishes'} found
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onUseExisting(topSimilarDish)}
            className="w-full px-4 py-3 text-base font-medium rounded-lg text-white bg-primary hover:bg-primaryHover transition-colors"
          >
            Use "{topSimilarDish.name}"
          </button>
         
          <button
            onClick={onCreateNew}
            className="w-full px-4 py-3 text-base rounded-lg border-2 border-primary text-primary bg-white hover:bg-gray-100 transition-colors"
          >
            Create "{newDishName}" as New Dish
          </button>
         
          <button
            onClick={onCancel}
            className="bg-transparent border-none text-textSecondary text-sm cursor-pointer p-2 underline hover:text-text transition-colors"
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