// src/components/AddRestaurantForm.tsx
import React, { useState } from 'react';
import { COLORS, FONTS, STYLES } from '../../constants';

interface AddRestaurantFormProps {
  show: boolean;
  onToggleShow: () => void;
  onSubmit: (name: string) => Promise<void>;
}

const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({ 
  show, 
  onToggleShow, 
  onSubmit 
}) => {
  const [restaurantName, setRestaurantName] = useState('');

  const handleSubmit = async () => {
    if (restaurantName.trim()) {
      await onSubmit(restaurantName);
      setRestaurantName('');
    }
  };

  const handleCancel = () => {
    setRestaurantName('');
    onToggleShow();
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      {!show ? (
        <div className="flex justify-center">
          <button
            onClick={onToggleShow}
            className="transition-all duration-300 transform hover:scale-105 focus:outline-none w-full text-white"
            style={{
              ...STYLES.primaryButton,
              background: COLORS.primary,
              padding: '0.6rem 1.5rem',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = COLORS.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
          >
            + Add New Restaurant
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Enter restaurant name..."
              className="px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 text-gray-800 w-full"
              style={{
                background: 'white',
                fontSize: '1rem',
                ...FONTS.elegant,
                color: COLORS.textDark
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && restaurantName.trim()) handleSubmit();
              }}
            />
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!restaurantName.trim()}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{
                ...STYLES.formButton,
                background: !restaurantName.trim() ? COLORS.disabled : COLORS.success
              }}
              onMouseEnter={(e) => {
                if (restaurantName.trim()) e.currentTarget.style.background = COLORS.successHover;
              }}
              onMouseLeave={(e) => {
                if (restaurantName.trim()) e.currentTarget.style.background = COLORS.success;
              }}
            >
              Save Restaurant
            </button>
            <button
              onClick={handleCancel}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={STYLES.secondaryButton}
              onMouseEnter={(e) => e.currentTarget.style.background = COLORS.secondaryHover}
              onMouseLeave={(e) => e.currentTarget.style.background = COLORS.secondary}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRestaurantForm;