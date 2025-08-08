// src/components/restaurant/RestaurantSearchForm.tsx
import React, { useEffect, useState } from 'react';

interface RestaurantSearchFormProps {
  onSearch: (query: string, location: string) => void;
  onReset?: () => void;
  isSearching: boolean;
  disabled?: boolean;
}

const RestaurantSearchForm: React.FC<RestaurantSearchFormProps> = ({
  onSearch,
  onReset,
  isSearching,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Seattle, WA');

  const handleReset = () => {
    setQuery('');
    setLocation('Seattle, WA');
    if (onReset) onReset();
  };

  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) return;
    const timeoutId = setTimeout(() => onSearch(query, location), 1000);
    return () => clearTimeout(timeoutId);
  }, [query, location, onSearch]);

  const inputClasses = `w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-white/50 text-base font-elegant border-2 ${
    disabled ? 'bg-gray-300 text-text opacity-60 cursor-not-allowed border-gray-200' : 'bg-white text-text border-gray-200'
  }`;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-elegant text-text text-base font-medium">
            Search Restaurants Online
          </h3>
          {query.trim().length > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1 rounded-lg text-xs transition-colors focus:outline-none hover:opacity-90 font-elegant text-white bg-danger border-none"
              disabled={disabled}
            >
              Clear & Reset
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm mb-2 font-elegant text-text">
            Search for restaurants:
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type restaurant name (e.g., 'Cafe Flora', 'Starbucks')..."
            className={inputClasses}
            disabled={disabled}
          />
          <p className="text-xs mt-1 font-elegant text-text opacity-60">
            {query.length < 3
              ? `Type at least 3 characters to search (${query.length}/3)`
              : 'Optimized for restaurant names - finds exact matches first!'}
          </p>
        </div>
       
        <div>
          <label className="block text-sm mb-2 font-elegant text-text">
            Location:
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Seattle, WA"
            className={inputClasses}
            disabled={disabled}
          />
          <p className="text-xs mt-1 font-elegant text-text opacity-60">
            Location cached to save API calls - change only when needed
          </p>
        </div>

        {isSearching && (
          <div className="text-center py-2">
            <p className="font-elegant text-text opacity-70">
              Searching for restaurants...
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="font-elegant text-text opacity-50 text-xs">
            ⚡ Optimized search - fewer API calls, better results
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSearchForm;