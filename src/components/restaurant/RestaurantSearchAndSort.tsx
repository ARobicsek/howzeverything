// src/components/RestaurantSearchAndSort.tsx
import React from 'react';

interface RestaurantSearchAndSortProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: 'name' | 'date';
  onSortChange: (sort: 'name' | 'date') => void;
  disabled?: boolean;
}

const RestaurantSearchAndSort: React.FC<RestaurantSearchAndSortProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  disabled = false
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search restaurants..."
        className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-white/50 text-base font-elegant border-2
          ${disabled
            ? 'bg-gray-300 text-text opacity-60 cursor-not-allowed border-gray-200'
            : 'bg-white text-text border-gray-200'
          }`}
        disabled={disabled}
      />
      <div className="flex gap-2 justify-center">
        {(['name', 'date'] as const).map((option) => (
          <button
            key={option}
            onClick={() => onSortChange(option)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-white font-elegant
              ${sortBy === option
                ? 'bg-white text-text border-none'
                : 'bg-transparent text-text border border-text/20'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
            }
            disabled={disabled}
          >
            {option === 'name' ? 'Name' : 'Date Added'}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default RestaurantSearchAndSort;