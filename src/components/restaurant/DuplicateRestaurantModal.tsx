import React from 'react';
import { createPortal } from 'react-dom';
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
  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-[95vw] max-h-[85vh] flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex-shrink-0">
          <h2 className="text-2xl font-heading text-gray-900 mb-2">
            Similar Restaurant Found
          </h2>
          <p className="font-body text-textSecondary m-0">
            We found {similarRestaurants.length > 1 ? 'restaurants' : 'a restaurant'} that might be the same as "{newRestaurantName}". Please review before creating a new entry.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          <div className="space-y-3">
            {similarRestaurants.map((restaurant) => (
              <div key={restaurant.id}>
                <RestaurantCard
                  restaurant={restaurant}
                  currentUserId={null}
                  onNavigateToMenu={() => onUseExisting(restaurant)}
                  onClick={() => onUseExisting(restaurant)}
                />
                <button
                  onClick={() => onUseExisting(restaurant)}
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-primaryLight text-primary border border-primary transition-colors hover:bg-blue-200"
                >
                  Use this one
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-5 mt-auto flex-shrink-0">
          <div className="flex flex-col gap-3">
            <button
              onClick={onCreateNew}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-text bg-white hover:bg-gray-100 transition-colors"
            >
              Create "{newRestaurantName}" as a New Restaurant
            </button>
            <button
              onClick={onCancel}
              className="bg-transparent border-none text-textSecondary font-body text-sm cursor-pointer p-2 underline hover:text-text"
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