// Updated AddDishForm with fixed overflow and responsive constraints
// src/components/AddDishForm.tsx
import React, { useState } from 'react';

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
        className={`transition-all duration-200 cursor-pointer hover:scale-105 focus:outline-none bg-transparent border-none p-px text-2xl leading-none ${
          star <= rating ? 'text-primary' : 'text-ratingEmpty'
        }`}
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
          <button
            onClick={onToggleShow}
            className="transition-all duration-300 transform hover:scale-105 focus:outline-none w-full bg-primary text-textWhite border-none rounded-xl px-5 py-3 font-elegant font-medium text-base"
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
              className="w-full max-w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 bg-white text-base font-elegant text-text"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && dishName.trim()) handleSubmit();
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm mb-0.5 font-elegant text-text">
              Rate this dish:
            </p>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
         
          <div className="flex justify-center gap-3 w-full max-w-full">
            <button
              onClick={handleSubmit}
              disabled={!dishName.trim()}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1 bg-primary text-textWhite border-none font-elegant font-medium text-base disabled:bg-gray-300"
            >
              Add Dish
            </button>
           
            <button
              onClick={handleCancel}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1 bg-white text-primary border border-primary hover:bg-gray-100"
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