// Updated AddDishForm with fixed overflow and responsive constraints
// src/components/AddDishForm.tsx
import React, { useState } from 'react';
import { STYLES } from '../constants'; // Import STYLES for secondary button
import { useTheme } from '../hooks/useTheme';
import { StarRating } from './shared/StarRating';


interface AddDishFormProps {
  show: boolean;
  onToggleShow: () => void;
  onSubmit: (name: string, rating: number) => Promise<void>;
}




const AddDishForm: React.FC<AddDishFormProps> = ({ show, onToggleShow, onSubmit }) => {
  const { theme } = useTheme();
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
              backgroundColor: theme.colors.primary, // Changed COLORS.addButtonBg
              color: theme.colors.textWhite,
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              ...theme.fonts.elegant,
              fontWeight: '500',
              fontSize: '1rem',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primaryHover;
              Object.assign(e.currentTarget.style, theme.effects.primaryButtonHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            + Add New Dish
          </button>
        </div>
      ) : (
        <div className="space-y-4 w-full max-w-full">
          <div className="flex justify-center w-full px-2">
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Enter dish name..."
              className="w-full max-w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50"
              style={{
                background: 'white',
                fontSize: '1rem',
                ...theme.fonts.elegant,
                color: theme.colors.text, // Changed COLORS.textDark
                maxWidth: 'calc(100% - 16px)', // Account for container padding
                boxSizing: 'border-box',
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && dishName.trim()) handleSubmit();
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm mb-0.5" style={{...theme.fonts.elegant, color: theme.colors.text}}>
              Rate this dish:
            </p>
            <StarRating rating={rating} onRatingChange={setRating} variant="personal" />
          </div>
         
          {/* Add Dish and Cancel buttons */}
          <div className="flex justify-center gap-3 w-full max-w-full">
            {/* Add Dish button with consistent styling */}
            <button
              onClick={handleSubmit}
              disabled={!dishName.trim()}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{
                backgroundColor: !dishName.trim() ? theme.colors.gray300 : theme.colors.primary, // Changed COLORS.disabled and COLORS.addButtonBg
                color: theme.colors.textWhite,
                border: 'none',
                ...theme.fonts.elegant,
                fontWeight: '500',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                if (dishName.trim()) e.currentTarget.style.backgroundColor = theme.colors.primaryHover; // Changed COLORS.addButtonHover
              }}
              onMouseLeave={(e) => {
                if (dishName.trim()) e.currentTarget.style.backgroundColor = theme.colors.primary; // Changed COLORS.addButtonBg
              }}
            >
              Add Dish
            </button>
           
            {/* Cancel button with consistent secondary styling */}
            <button
              onClick={handleCancel}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{
                ...STYLES.secondaryButton, // Use secondaryButton style
                color: theme.colors.primary // Ensure text color is primary as per secondaryButton style
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray700} // Hardcoded '#5b6574' replaced with COLORS.gray700
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.white} // Changed COLORS.viewCommentsBg to COLORS.white to revert to secondaryButton's background
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