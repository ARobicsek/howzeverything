// This is a test comment to verify that you are seeing my changes.
// src/components/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  hasSearchTerm: boolean;
  restaurantName: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasSearchTerm, restaurantName }) => (
  <div className="text-center py-12">
    <h3 className="text-xl mb-2 font-elegant text-text">
      {hasSearchTerm ? 'No dishes found' : `No dishes yet for ${restaurantName}`}
    </h3>
    <p className="text-sm font-elegant text-text opacity-70">
      {hasSearchTerm ? 'Try a different search term' : 'Add your first dish to start rating!'}
    </p>
  </div>
);

export default EmptyState;