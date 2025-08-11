// src/components/EmptyState.tsx
import React from 'react';
import { COLORS, FONT_FAMILIES } from '../constants';

interface EmptyStateProps {
  hasSearchTerm: boolean;
  restaurantName: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasSearchTerm, restaurantName }) => (
  <div className="text-center py-12">
    <h3 className="text-xl mb-2" style={{fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text}}>
      {hasSearchTerm ? 'No dishes found' : `No dishes yet for ${restaurantName}`}
    </h3>
    <p className="text-sm" style={{fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, opacity: 0.7}}>
      {hasSearchTerm ? 'Try a different search term' : 'Add your first dish to start rating!'}
    </p>
  </div>
);

export default EmptyState;