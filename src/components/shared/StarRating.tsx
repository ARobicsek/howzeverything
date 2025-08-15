import React from 'react';
import { SPACING } from '../../constants';
import { useTheme } from '../../hooks/useTheme';

const Star: React.FC<{
  type: 'full' | 'half' | 'empty';
  filledColor: string;
  emptyColor: string;
  size: string;
  outlineMode?: boolean;
  borderWidth?: string;
}> = ({ type, filledColor, emptyColor, size, outlineMode = false, borderWidth = '2' }) => {
  const starPath = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

  return (
    <div style={{ display: 'inline-block', position: 'relative', width: size, height: size, lineHeight: '1' }}>
      {/* Base star - outline mode uses stroke only for empty stars */}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', left: 0, top: 0 }}>
        <path 
          d={starPath} 
          fill={outlineMode && type === 'empty' ? 'none' : emptyColor}
          stroke={outlineMode && type === 'empty' ? emptyColor : 'none'}
          strokeWidth={outlineMode && type === 'empty' ? borderWidth : '0'}
        />
      </svg>
      {/* Filled portion */}
      {type !== 'empty' &&
        <div style={{ position: 'absolute', left: 0, top: 0, width: type === 'half' ? '50%' : '100%', height: '100%', overflow: 'hidden' }}>
          <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', left: 0, top: 0, width: size, height: size }}>
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
  const { theme } = useTheme();
  
  const sizeMap = {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem'
  };
   
  const colorMap = {
    personal: { filled: theme.colors.star, empty: theme.colors.starEmpty },
    community: { filled: theme.colors.starCommunity, empty: theme.colors.starCommunityEmpty }
  };

  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          let type: 'full' | 'half' | 'empty' = 'empty';
          if (roundedRating >= star) {
            type = 'full';
          } else if (roundedRating >= star - 0.5) {
            type = 'half';
          }

          return (
            <button
              key={star}
              onClick={(e) => { e.stopPropagation(); !readonly && onRatingChange?.(star); }}
              disabled={readonly}
              className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              style={{
                background: 'none',
                border: 'none',
                padding: '0',
                lineHeight: '1'
              }}
              aria-label={readonly ? `${rating} of 5 stars` : `Rate ${star} of 5 stars`}
            >
              <Star
                type={type}
                filledColor={colorMap[variant].filled}
                emptyColor={colorMap[variant].empty}
                size={sizeMap[size]}
                outlineMode={theme.colors.starOutlineMode}
                borderWidth={theme.colors.starBorderWidth}
              />
            </button>
          );
        })}
      </div>
      {!readonly && showClearButton && rating > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onRatingChange?.(0); }}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: theme.colors.textSecondary,
            transition: 'color 0.2s ease, transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            marginLeft: SPACING[1]
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.danger;
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.textSecondary;
            e.currentTarget.style.transform = 'scale(1)';
          }}
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