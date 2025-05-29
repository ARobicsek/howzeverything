// src/components/AddDishForm.tsx
import React, { useState } from 'react';
import { COLORS, FONTS, STYLES } from '../constants';

interface AddDishFormProps {
  show: boolean;
  onToggleShow: () => void;
  onSubmit: (name: string, rating: number) => Promise<void>;
}

const StarRating: React.FC<{ 
  rating: number; 
  onRatingChange: (rating: number) => void; 
}> = ({ rating, onRatingChange }) => (
  <div className="flex gap-px">
    {[1, 2, 3, 4, 5].map((star) => (
      <button 
        key={star} 
        onClick={() => onRatingChange(star)} 
        className="transition-all duration-200 cursor-pointer hover:scale-105 focus:outline-none" 
        style={{ 
          color: star <= rating ? COLORS.star : COLORS.starEmpty, 
          background: 'none', 
          border: 'none', 
          padding: '0 1px', 
          fontSize: '1.3rem', 
          lineHeight: '1' 
        }}
        aria-label={`Rate ${star} of 5 stars`} 
      > 
        ★ 
      </button> 
    ))}
  </div>
);

const AddDishForm: React.FC<AddDishFormProps> = ({ show, onToggleShow, onSubmit }) => {
  const [dishName, setDishName] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = async () => {
    if (dishName.trim()) {
      await onSubmit(dishName, rating);
      setDishName('');
      setRating(5);
    }
  };

  const handleCancel = () => {
    setDishName('');
    setRating(5);
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
            + Add New Dish
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Enter dish name..."
              className="px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 text-gray-800 w-full"
              style={{ 
                background: 'white', 
                fontSize: '1rem', 
                ...FONTS.elegant, 
                color: COLORS.textDark 
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && dishName.trim()) handleSubmit();
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm mb-0.5" style={{...FONTS.elegant, color: COLORS.text}}>
              Rate this dish:
            </p>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!dishName.trim()}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{ 
                ...STYLES.formButton, 
                background: !dishName.trim() ? COLORS.disabled : COLORS.success 
              }}
              onMouseEnter={(e) => { 
                if (dishName.trim()) e.currentTarget.style.background = COLORS.successHover; 
              }}
              onMouseLeave={(e) => { 
                if (dishName.trim()) e.currentTarget.style.background = COLORS.success; 
              }}
            >
              Add Dish
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

export default AddDishForm;