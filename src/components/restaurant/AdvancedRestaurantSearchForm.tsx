// src/components/restaurant/AdvancedRestaurantSearchForm.tsx
import React, { useEffect, useState } from 'react';
import { COLORS, FONTS, STYLES } from '../../constants';
import type { AdvancedSearchQuery } from '../../hooks/useRestaurants';


interface AdvancedRestaurantSearchFormProps {
  onSearchChange: (query: AdvancedSearchQuery) => void;
  initialQuery: AdvancedSearchQuery;
}


const AdvancedRestaurantSearchForm: React.FC<AdvancedRestaurantSearchFormProps> = ({
  onSearchChange,
  initialQuery,
}) => {
  const [query, setQuery] = useState<AdvancedSearchQuery>(initialQuery);


  useEffect(() => {
    // When the initial query from the parent changes (e.g., from basic search term), update our state
    setQuery(initialQuery);
  }, [initialQuery]);


  const handleChange = (field: keyof AdvancedSearchQuery, value: string) => {
    const newQuery = { ...query, [field]: value };
    setQuery(newQuery);
    onSearchChange(newQuery); // Call onSearch immediately, parent will debounce.
  };


  const labelStyle: React.CSSProperties = {
    ...FONTS.elegant,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: COLORS.text,
    display: 'block',
    marginBottom: '4px',
  };


  const inputStyle: React.CSSProperties = {
    ...FONTS.elegant,
    padding: '12px 16px',
    borderRadius: STYLES.borderRadiusMedium,
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: COLORS.text,
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    border: `2px solid ${COLORS.gray200}`,
    width: '100%',
    outline: 'none',
  };


  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="adv-search-name" style={labelStyle}>Restaurant Name*</label>
        <input
          id="adv-search-name"
          type="text"
          value={query.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Starbucks"
          style={inputStyle}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="adv-search-street" style={labelStyle}>Street Address (optional)</label>
        <input
          id="adv-search-street"
          type="text"
          value={query.street}
          onChange={(e) => handleChange('street', e.target.value)}
          placeholder="e.g., 2401 Promenade Blvd"
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="adv-search-city" style={labelStyle}>City / State (optional)</label>
        <input
          id="adv-search-city"
          type="text"
          value={query.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="e.g., Santa Fe, NM"
          style={inputStyle}
        />
      </div>
    </div>
  );
};


export default AdvancedRestaurantSearchForm;