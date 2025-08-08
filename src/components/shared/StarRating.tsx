import React from 'react';
import { COLORS } from '../../constants';

const Star: React.FC<{
  type: 'full' | 'half' | 'empty';
  filledColor: string;
  emptyColor: string;
  size: string;
}> = ({ type, filledColor, emptyColor, size }) => {
  const starPath = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

  return (
    <div className="inline-block relative leading-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" className="absolute left-0 top-0">
        <path d={starPath} fill={emptyColor} />
      </svg>
      {type !== 'empty' &&
        <div className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: type === 'half' ? '50%' : '100%' }}>
          <svg width={size} height={size} viewBox="0 0 24 24" className="absolute left-0 top-0" style={{ width: size, height: size }}>
            <path d={starPath} fill={filledColor} />
          </svg>
        </div>
      }
    </div>
  );
};

export const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  variant?: 'personal' | 'community';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
}> = ({ rating, onRatingChange, readonly = false, variant = 'personal', size = 'md', showClearButton = false }) => {
  const sizeMap = { sm: '1rem', md: '1.25rem', lg: '1.5rem' };
  const colorMap = {
    personal: { filled: COLORS.accent, empty: COLORS.ratingEmpty },
    community: { filled: '#101010', empty: COLORS.ratingEmpty }
  };
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          let type: 'full' | 'half' | 'empty' = 'empty';
          if (roundedRating >= star) type = 'full';
          else if (roundedRating >= star - 0.5) type = 'half';

          return (
            <button
              key={star}
              onClick={(e) => { e.stopPropagation(); !readonly && onRatingChange?.(star); }}
              disabled={readonly}
              className={`transition-all duration-200 bg-transparent border-none p-0 leading-none ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              aria-label={readonly ? `${rating} of 5 stars` : `Rate ${star} of 5 stars`}
            >
              <Star type={type} filledColor={colorMap[variant].filled} emptyColor={colorMap[variant].empty} size={sizeMap[size]} />
            </button>
          );
        })}
      </div>
      {!readonly && showClearButton && rating > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onRatingChange?.(0); }}
          className="bg-transparent border-none p-0 cursor-pointer text-textSecondary transition-all duration-200 ease-in-out flex items-center justify-center leading-none ml-1 hover:text-danger hover:scale-115"
          aria-label="Clear rating"
          title="Clear rating"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>
      )}
    </div>
  );
};