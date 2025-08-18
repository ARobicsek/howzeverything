// src/components/restaurant/SearchResultsModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { RestaurantWithPinStatus } from '../../types/restaurant';
import type { GeoapifyPlace } from '../../types/restaurantSearch';
import RestaurantCard from './RestaurantCard';




interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: GeoapifyPlace[];
  onRestaurantClick: (place: GeoapifyPlace) => void;
  isSearching: boolean;
  onManualAddClick: (searchTerm: string) => void;
  pinnedRestaurantIds: Set<string>;
  onTogglePin: (restaurant: RestaurantWithPinStatus) => void;
  searchRestaurants: (searchParams: string, userLat: number | null, userLon: number | null) => void;
  userLocation: { latitude: number, longitude: number } | null;
  clearSearchResults: () => void;
  resetSearch: () => void;
}




const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  isOpen,
  onClose,
  results,
  onRestaurantClick,
  isSearching,
  onManualAddClick,
  pinnedRestaurantIds,
  onTogglePin,
  searchRestaurants,
  userLocation,
  clearSearchResults,
  resetSearch,
}) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);




  const performSearch = useMemo(() => (query: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
        if (query.trim().length > 2) {
            searchRestaurants(query, userLocation?.latitude ?? null, userLocation?.longitude ?? null);
        } else {
            clearSearchResults();
        }
    }, 800);
  }, [searchRestaurants, userLocation, clearSearchResults]);




  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);




  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
      resetSearch();
    }
  }, [isOpen, resetSearch]);




  if (!isOpen) return null;




  const handleReset = () => {
    setSearchTerm('');
    resetSearch();
  };




  const hasSearchTerm = searchTerm.trim().length > 0;




  return (
    <div style={{
      ...STYLES.modalOverlay,
      alignItems: 'flex-start',
      paddingTop: '10vh'
    }} onClick={onClose}>
      <div
        style={{ ...STYLES.modal, maxWidth: '600px', width: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: `${SPACING[4]} ${SPACING[4]} ${SPACING[3]}`,
          borderBottom: `1px solid ${COLORS.gray200}`,
          position: 'sticky',
          top: 0,
          backgroundColor: COLORS.white,
          zIndex: 10,
        }}>
          <div className="flex items-center justify-between mb-2">
              <label style={{ ...FONTS.elegant, fontSize: '1.1rem', fontWeight: '600', color: COLORS.text }}>Search online</label>
              <div className="flex items-center gap-4">
                  {hasSearchTerm && (<button onClick={handleReset} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.textSecondary }}><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg></button>)}
                  <button onClick={onClose} style={{...STYLES.iconButton, border: 'none', width: '32px', height: '32px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
              </div>
          </div>
          <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Chez Frontenac, Seattle (3+ chars)"
              style={{ ...STYLES.input, width: '100%', backgroundColor: COLORS.white }}
              autoFocus
          />
        </div>
       
        <div style={{ flex: 1, overflowY: 'auto', padding: SPACING[4], backgroundColor: COLORS.background }}>
          {isSearching && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: SPACING[6] }}><p style={{...FONTS.body, color: COLORS.textSecondary }}>Searching...</p></div>
          )}
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((place) => {
                const props = place.properties;
                const isDbRestaurant = /^[0-9a-f]{8}-/i.test(place.place_id);


                const restaurantForCard: RestaurantWithPinStatus = {
                  id: place.place_id,
                  name: props.name,
                  address: props.address_line1 || null,
                  city: props.city || null,
                  full_address: props.formatted,
                  state: props.state || null,
                  zip_code: props.postcode || null,
                  country: props.country_code?.toUpperCase() || props.country || null,
                  manually_added: false,
                  created_at: new Date().toISOString(),
                  dateAdded: new Date().toISOString(),
                  latitude: props.lat,
                  longitude: props.lon,
                  geoapify_place_id: isDbRestaurant ? null : place.place_id,
                  is_pinned: pinnedRestaurantIds.has(place.place_id),
                  phone: props.phone || null,
                  website_url: props.website || null,
                  rating: null,
                  price_tier: null,
                  category: Array.isArray(props.categories) ? props.categories.join(',') : null,
                  opening_hours: null,
                  created_by: null,
                  dishCount: (props as { dishCount?: number }).dishCount,
                  raterCount: (props as { raterCount?: number }).raterCount,
                };


                return (
                  <RestaurantCard
                    key={place.place_id}
                    restaurant={restaurantForCard}
                    onClick={() => onRestaurantClick(place)}
                    onNavigateToMenu={() => onRestaurantClick(place)}
                    currentUserId={user?.id || null}
                    isPinned={restaurantForCard.is_pinned}
                    onTogglePin={onTogglePin}
                  />
                )
              })}
            </div>
          ) : (
             !isSearching && hasSearchTerm && (
              <div style={{ textAlign: 'center', padding: SPACING[6] }}>
                <p style={{...FONTS.body, color: COLORS.textSecondary, marginBottom: SPACING[4] }}>
                  No results found.
                </p>
              </div>
            )
          )}
           <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center mt-4">
            <p style={{ ...FONTS.elegant, fontSize: '0.95rem', color: COLORS.text, marginBottom: '12px' }}>
              Don't see it?
            </p>
            <button
                onClick={() => onManualAddClick(searchTerm)}
                style={STYLES.addButton}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary; }}
            >
              Add it manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default SearchResultsModal;