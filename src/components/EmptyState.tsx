// src/components/EmptyState.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface EmptyStateProps {
  hasSearchTerm: boolean;
  restaurantName: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasSearchTerm, restaurantName }) => {
  const { theme } = useTheme();
  
  return (
    <div className="text-center py-12">
      <h3 className="text-xl mb-2" style={{...theme.fonts.elegant, color: theme.colors.text}}>
        {hasSearchTerm ? 'No dishes found' : `No dishes yet for ${restaurantName}`}
      </h3>
      <p className="text-sm" style={{...theme.fonts.elegant, color: theme.colors.text, opacity: 0.7}}>
        {hasSearchTerm ? 'Try a different search term' : 'Add your first dish to start rating!'}
      </p>
    </div>
  );
};

export default EmptyState;