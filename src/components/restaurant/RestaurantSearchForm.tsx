// src/components/restaurant/RestaurantSearchForm.tsx
import React, { useEffect, useState } from 'react';
import { COLORS, FONTS } from '../../constants';




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




  // Reset function to clear form and results
  const handleReset = () => {
    setQuery('');
    setLocation('Seattle, WA');
    if (onReset) {
      onReset();
    }
  };




  // OPTIMIZED: Longer debounce to reduce API calls + minimum query length
  useEffect(() => {
    // Require at least 3 characters to search (reduces API calls)
    if (!query.trim() || query.trim().length < 3) {
      return;
    }




    // Increased debounce from 500ms to 1000ms (reduces API calls)
    const timeoutId = setTimeout(() => {
      onSearch(query, location);
    }, 1000);




    return () => clearTimeout(timeoutId);
  }, [query, location]);




  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      <div className="space-y-3">
        {/* Header with conditional Reset Button */}
        <div className="flex justify-between items-center">
          <h3 style={{...FONTS.elegant, color: COLORS.text, fontSize: '1rem', fontWeight: 500}}>
            Search Restaurants Online
          </h3>
          {/* Only show Clear & Reset button when user has typed something */}
          {query.trim().length > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1 rounded-lg text-xs transition-colors focus:outline-none hover:opacity-90"
              style={{
                ...FONTS.elegant,
                color: 'white', // WHITE TEXT
                background: COLORS.danger, // RED BACKGROUND
                border: 'none',
                fontSize: '0.75rem'
              }}
              disabled={disabled}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Clear & Reset
            </button>
          )}
        </div>




        <div>
          <label
            className="block text-sm mb-2"
            style={{...FONTS.elegant, color: COLORS.text}}
          >
            Search for restaurants:
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type restaurant name (e.g., 'Cafe Flora', 'Starbucks')..."
            className={`px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 w-full ${disabled ? 'opacity-60' : 'text-gray-800'}`}
            style={{
              background: disabled ? COLORS.gray300 : 'white', // Changed COLORS.disabled
              fontSize: '1rem',
              ...FONTS.elegant,
              color: disabled ? COLORS.text : COLORS.text, // Changed COLORS.textDark
              cursor: disabled ? 'not-allowed' : 'auto',
              border: '2px solid ' + COLORS.gray200 // MODIFIED: Added grey border
            }}
            disabled={disabled}
          />
          <p
            className="text-xs mt-1"
            style={{...FONTS.elegant, color: COLORS.text, opacity: 0.6}}
          >
            {query.length < 3 ?
              `Type at least 3 characters to search (${query.length}/3)` :
              'Optimized for restaurant names - finds exact matches first!'
            }
          </p>
        </div>
       
        <div>
          <label
            className="block text-sm mb-2"
            style={{...FONTS.elegant, color: COLORS.text}}
          >
            Location:
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Seattle, WA"
            className={`px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 w-full ${disabled ? 'opacity-60' : 'text-gray-800'}`}
            style={{
              background: disabled ? COLORS.gray300 : 'white', // Changed COLORS.disabled
              fontSize: '1rem',
              ...FONTS.elegant,
              color: disabled ? COLORS.text : COLORS.text, // Changed COLORS.textDark
              cursor: disabled ? 'not-allowed' : 'auto',
              border: '2px solid ' + COLORS.gray200 // MODIFIED: Added grey border
            }}
            disabled={disabled}
          />
          <p
            className="text-xs mt-1"
            style={{...FONTS.elegant, color: COLORS.text, opacity: 0.6}}
          >
            Location cached to save API calls - change only when needed
          </p>
        </div>




        {isSearching && (
          <div className="text-center py-2">
            <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.7}}>
              Searching for restaurants...
            </p>
          </div>
        )}




        {/* API Usage Indicator */}
        <div className="text-center">
          <p style={{...FONTS.elegant, color: COLORS.text, opacity: 0.5, fontSize: '0.7rem'}}>
            ⚡ Optimized search - fewer API calls, better results
          </p>
        </div>
      </div>
    </div>
  );
};




export default RestaurantSearchForm;