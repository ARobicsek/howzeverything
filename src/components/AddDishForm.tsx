// Updated AddDishForm with fixed overflow and responsive constraints
// src/components/AddDishForm.tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from '../constants';

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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-full max-w-full">
      {!show ? (
        <div className="flex justify-center w-full">
          {/* Add New Dish button with consistent styling */}
          <button
            onClick={onToggleShow}
            className="transition-all duration-300 transform hover:scale-105 focus:outline-none w-full"
            style={{
              backgroundColor: COLORS.addButtonBg,
              color: COLORS.textWhite,
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              ...FONTS.elegant,
              fontWeight: '500',
              fontSize: '1rem',
              width: '100%'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}
          >
            + Add New Dish
          </button>
        </div>
      ) : (
        <div className="space-y-4 w-full max-w-full">
          <div className="flex justify-center w-full">
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Enter dish name..."
              className="w-full max-w-full box-border px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50"
              style={{
                background: 'white',
                fontSize: '1rem',
                ...FONTS.elegant,
                color: COLORS.textDark,
                minWidth: 0, // Allows shrinking below content width
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
          
          {/* Add Dish and Cancel buttons */}
          <div className="flex justify-center gap-3 w-full max-w-full">
            {/* Add Dish button with consistent styling */}
            <button
              onClick={handleSubmit}
              disabled={!dishName.trim()}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{
                backgroundColor: !dishName.trim() ? COLORS.disabled : COLORS.addButtonBg,
                color: COLORS.textWhite,
                border: 'none',
                ...FONTS.elegant,
                fontWeight: '500',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                if (dishName.trim()) e.currentTarget.style.backgroundColor = COLORS.addButtonHover;
              }}
              onMouseLeave={(e) => {
                if (dishName.trim()) e.currentTarget.style.backgroundColor = COLORS.addButtonBg;
              }}
            >
              Add Dish
            </button>
            
            {/* Cancel button with consistent secondary styling */}
            <button
              onClick={handleCancel}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{
                backgroundColor: COLORS.viewCommentsBg,
                color: COLORS.textWhite,
                border: 'none',
                ...FONTS.elegant,
                fontWeight: '500',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5b6574'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.viewCommentsBg}
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