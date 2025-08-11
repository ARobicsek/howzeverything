// src/components/restaurant/RestaurantSearchResults.tsx
import React from 'react';
import { COLORS, FONT_FAMILIES } from '../../constants'; // STYLES removed as it's unused


interface GeoapifyPlace {
  place_id: string;
  properties: {
    name: string;
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    lat: number;
    lon: number;
    categories: string[];
    datasource: {
      sourcename: string;
      attribution: string;
    };
  };
}


interface RestaurantSearchResultsProps {
  results: GeoapifyPlace[];
  onSelectRestaurant: (restaurant: GeoapifyPlace) => void;
  isImporting?: boolean;
  isLoadingDetails?: boolean;
  restaurantErrors?: Map<string, string>;
}


const RestaurantSearchResults: React.FC<RestaurantSearchResultsProps> = ({
  results,
  onSelectRestaurant,
  isImporting = false,
  isLoadingDetails = false,
  restaurantErrors = new Map()
}) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p style={{fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, opacity: 0.7}}>
          No restaurants found. Try a different search term.
        </p>
      </div>
    );
  }


  const getCategoryDisplay = (categories: string[]) => {
    const categoryMap: { [key: string]: string } = {
      'catering.restaurant': 'Restaurant',
      'catering.fast_food': 'Fast Food',
      'catering.cafe': 'Cafe',
      'catering.bar': 'Bar',
      'catering.pub': 'Pub'
    };


    return categories
      .slice(0, 2)
      .map(cat => categoryMap[cat] || cat.split('.').pop() || 'Restaurant')
      .join(', ');
  };


  const getDistanceDisplay = (lat: number, lon: number) => {
    const seattleLat = 47.6062;
    const seattleLon = -122.3321;
   
    const distance = Math.sqrt(
      Math.pow(lat - seattleLat, 2) + Math.pow(lon - seattleLon, 2)
    ) * 69;
   
    if (distance < 1) return 'Nearby';
    return `~${distance.toFixed(1)} mi`;
  };


  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <p style={{fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, fontSize: '0.9rem'}}>
          Found {results.length} restaurants - tap to add:
        </p>
      </div>
     
      {isLoadingDetails && (
        <div className="text-center py-2 mb-4">
          <p style={{fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.primary, fontSize: '0.9rem'}}>
            Getting restaurant details (including website)...
          </p>
        </div>
      )}
     
      {results.map((restaurant) => {
        const hasError = restaurantErrors.has(restaurant.place_id);
        const errorMessage = restaurantErrors.get(restaurant.place_id);
       
        return (
          <div key={restaurant.place_id}>
            {hasError && errorMessage && (
              <div
                className="bg-red-500/20 p-3 rounded-lg mb-2 text-center"
                style={{
                  border: `1px solid ${COLORS.danger}40`
                }}
              >
                <p style={{color: COLORS.danger, fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', fontSize: '0.9rem'}}>
                  {errorMessage}
                </p>
              </div>
            )}
           
            <div
              className="bg-white/5 backdrop-blur-sm p-4 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => onSelectRestaurant(restaurant)}
              style={{
                opacity: (isImporting || isLoadingDetails) ? 0.6 : 1,
                border: hasError ? `1px solid ${COLORS.danger}40` : 'none'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                    <span style={{color: COLORS.text, opacity: 0.6, fontSize: '1.5rem'}}>
                      🍽️
                    </span>
                  </div>
                </div>
               
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-medium mb-1"
                    style={{
                      fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em',
                      fontWeight: '500',
                      color: COLORS.text,
                      fontSize: '1rem',
                      lineHeight: '1.3'
                    }}
                  >
                    {restaurant.properties.name}
                  </h3>
                 
                  <p
                    className="text-sm mb-2"
                    style={{
                      fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em',
                      color: COLORS.text,
                      opacity: 0.8,
                      fontSize: '0.8rem',
                      lineHeight: '1.3'
                    }}
                  >
                    {restaurant.properties.formatted}
                  </p>
                 
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span
                      className="px-2 py-1 rounded-md text-xs"
                      style={{
                        background: COLORS.primary + '30',
                        color: COLORS.text,
                        fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em',
                        fontSize: '0.7rem'
                      }}
                    >
                      {getCategoryDisplay(restaurant.properties.categories)}
                    </span>
                   
                    <span
                      className="px-2 py-1 rounded-md text-xs"
                      style={{
                        background: COLORS.success + '30',
                        color: COLORS.text,
                        fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em',
                        fontSize: '0.7rem'
                      }}
                    >
                      {getDistanceDisplay(restaurant.properties.lat, restaurant.properties.lon)}
                    </span>
                  </div>
                </div>
               
                <div className="flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: hasError ? COLORS.danger : COLORS.primary // Changed COLORS.addButtonBg
                    }}
                  >
                    {hasError ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
     
      <div className="text-center pt-2">
        <p style={{fontFamily: FONT_FAMILIES.elegant, letterSpacing: '-0.01em', color: COLORS.text, opacity: 0.6, fontSize: '0.7rem'}}>
          Powered by Geoapify • Data from OpenStreetMap
        </p>
      </div>
    </div>
  );
};


export default RestaurantSearchResults;