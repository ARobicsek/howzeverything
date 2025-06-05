// src/components/restaurant/AddRestaurantForm.tsx
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
      // Assuming onToggleShow is called by the parent if form needs to hide after submit
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
            className="transition-all duration-300 transform hover:scale-105 focus:outline-none w-full"
            style={STYLES.addButton} // Use consistent blue add button style
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}
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
              className="px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 w-full"
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
                ...STYLES.addButton, // Standardize to blue button
                backgroundColor: !restaurantName.trim() ? COLORS.disabled : COLORS.addButtonBg
              }}
              onMouseEnter={(e) => {
                if (restaurantName.trim()) e.currentTarget.style.backgroundColor = COLORS.addButtonHover;
              }}
              onMouseLeave={(e) => {
                if (restaurantName.trim()) e.currentTarget.style.backgroundColor = COLORS.addButtonBg;
              }}
            >
              Save Restaurant
            </button>
            <button
              onClick={handleCancel}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={STYLES.secondaryButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.secondaryHover} // Use defined secondaryHover
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.secondary}
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