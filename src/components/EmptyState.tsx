// src/components/EmptyState.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface EmptyStateProps {
  hasSearchTerm: boolean;
  restaurantName: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasSearchTerm, restaurantName }) => {
  const { theme } = useTheme();
  const is90sTheme = theme.colors.background === '#0D0515';
  
  return (
    <div className="text-center py-12">
      <h3 
        className="text-xl mb-2" 
        style={{
          ...theme.fonts.heading, 
          color: theme.colors.text,
          fontSize: '1.5rem'
        }}
      >
        {hasSearchTerm ? 'No dishes found' : `No dishes yet for ${restaurantName}`}
      </h3>
      <p 
        className="text-sm" 
        style={{
          ...theme.fonts.body, 
          color: theme.colors.text, 
          opacity: 0.7,
          fontSize: '1rem'
        }}
      >
        {hasSearchTerm ? 'Try a different search term' : 'Add your first dish to start rating!'}
      </p>
    </div>
  );
};

export default EmptyState;