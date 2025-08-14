// src/components/SearchAndSort.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';




interface SearchAndSortProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: 'name' | 'rating' | 'date';
  onSortChange: (sort: 'name' | 'rating' | 'date') => void;
  disabled?: boolean;
}




const SearchAndSort: React.FC<SearchAndSortProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  disabled = false
}) => {
  const { theme } = useTheme();
  
  return (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search dishes..."
        className={`px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 w-full ${disabled ? 'opacity-60' : 'text-gray-800'}`}
        style={{
          background: disabled ? theme.colors.gray300 : 'white',
          fontSize: '1rem',
          ...theme.fonts.body,
          color: disabled ? theme.colors.gray500 : theme.colors.black,
          cursor: disabled ? 'not-allowed' : 'auto',
          border: '2px solid ' + theme.colors.gray200
        }}
        disabled={disabled}
      />
      <div className="flex gap-2 justify-center">
        {(['name', 'rating', 'date'] as const).map((option) => (
          <button
            key={option}
            onClick={() => onSortChange(option)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              background: sortBy === option ? 'white' : 'transparent',
              color: sortBy === option ? theme.colors.black : theme.colors.text,
              border: sortBy === option ? 'none' : `1px solid ${theme.colors.text}30`,
              ...theme.fonts.body
            }}
            disabled={disabled}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </div>
  </div>
  );
};




export default SearchAndSort;