// src/hooks/useRestaurants.tsx
// Updated for Global Restaurant Model with User Favorites
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Restaurant {
  id: string;
  name: string;
  dateAdded: string; // Now represents when user favorited the restaurant
  created_at: string; // When the global restaurant was first created
  // New fields for imported restaurants
  geoapify_place_id?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  rating?: number;
  price_tier?: number;
  category?: string;
  opening_hours?: any;
  latitude?: number;
  longitude?: number;
  // Fields from the favorite link
  date_favorited?: string; // When current user added to their list
  created_by?: string; // Who originally created this global restaurant
}

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

interface GeoapifyPlaceDetails {
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
    website?: string;
    phone?: string;
    opening_hours?: any;
    contact?: {
      website?: string;
      phone?: string;
      email?: string;
    };
    datasource: {
      sourcename: string;
      attribution: string;
    };
  };
}

export const useRestaurants = (sortBy: 'name' | 'date') => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search-related state
  const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [restaurantErrors, setRestaurantErrors] = useState<Map<string, string>>(new Map());

  // Cache coordinates to avoid repeated geocoding
  const [cachedLocation, setCachedLocation] = useState<{
    query: string;
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          return;
        }

        // Fetch user's favorite restaurants with details
        // Using a more explicit approach for better error handling
        const { data: favoriteLinks, error: favError } = await supabase
          .from('user_favorite_restaurants')
          .select('restaurant_id, added_at')
          .eq('user_id', user.id);

        if (favError) {
          console.error('Error fetching favorite links:', favError);
          setError('Failed to load your restaurant list. Please try again.');
          return;
        }

        if (!favoriteLinks || favoriteLinks.length === 0) {
          setRestaurants([]);
          return;
        }

        // Get restaurant IDs from favorites
        const restaurantIds = favoriteLinks.map(link => link.restaurant_id);

        // Fetch details for these restaurants from global catalog
        const { data: restaurantDetails, error: detailsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds);

        if (detailsError) {
          console.error('Error fetching restaurant details:', detailsError);
          setError('Failed to load restaurant details. Please try again.');
          return;
        }

        if (restaurantDetails) {
          // Combine favorite link data with restaurant details
          const combinedData = restaurantDetails.map(restaurant => {
            const favoriteLink = favoriteLinks.find(link => link.restaurant_id === restaurant.id);
            return {
              ...restaurant,
              dateAdded: favoriteLink?.added_at || restaurant.created_at, // When user favorited it
              date_favorited: favoriteLink?.added_at, // Explicit favorite date
            };
          });

          // Sort based on user preference
          const sortedRestaurants = combinedData.sort((a, b) => {
            if (sortBy === 'name') {
              return a.name.localeCompare(b.name);
            } else { // sortBy === 'date'
              // Sort by when user favorited the restaurant
              return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
            }
          });

          setRestaurants(sortedRestaurants);
        }
      } catch (err: any) {
        console.error('Error fetching restaurants:', err);
        setError(`Failed to load restaurants: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [sortBy]);

  // Enhanced duplicate detection for global restaurants
  const isDuplicateRestaurant = async (newName: string, newAddress?: string, geoapifyPlaceId?: string): Promise<Restaurant | null> => {
    try {
      // First check by geoapify_place_id if available
      if (geoapifyPlaceId) {
        const { data: existingByPlaceId } = await supabase
          .from('restaurants')
          .select('*')
          .eq('geoapify_place_id', geoapifyPlaceId)
          .single();

        if (existingByPlaceId) {
          return existingByPlaceId;
        }
      }

      // Then check by name and address similarity
      const { data: allRestaurants } = await supabase
        .from('restaurants')
        .select('*');

      if (!allRestaurants) return null;

      const normalizedNewName = newName.toLowerCase().trim();
      const normalizedNewAddress = newAddress?.toLowerCase().trim();

      const duplicate = allRestaurants.find(existing => {
        const existingName = existing.name.toLowerCase().trim();
        const existingAddress = existing.address?.toLowerCase().trim();

        // Check if names are very similar
        const nameMatch = (
          existingName === normalizedNewName ||
          existingName.includes(normalizedNewName) ||
          normalizedNewName.includes(existingName) ||
          // Handle common variations (spaces, punctuation)
          existingName.replace(/[^a-z0-9]/g, '') === normalizedNewName.replace(/[^a-z0-9]/g, '')
        );

        if (!nameMatch) return false;

        // If both have addresses, check address similarity
        if (existingAddress && normalizedNewAddress) {
          const addressMatch = (
            existingAddress === normalizedNewAddress ||
            existingAddress.includes(normalizedNewAddress) ||
            normalizedNewAddress.includes(existingAddress) ||
            // Check if they contain the same street number and street name
            (() => {
              const existingParts = existingAddress.split(',')[0]?.trim();
              const newParts = normalizedNewAddress.split(',')[0]?.trim();
              return existingParts && newParts && (
                existingParts === newParts ||
                existingParts.includes(newParts) ||
                newParts.includes(existingParts)
              );
            })()
          );
          return addressMatch;
        }

        // If only one has an address, still consider it a match if names are very similar
        const exactNameMatch = existingName === normalizedNewName;
        return exactNameMatch;
      });

      return duplicate || null;
    } catch (err) {
      console.error('Error checking for duplicates:', err);
      return null;
    }
  };

  // Check if user has already favorited a global restaurant
  const isAlreadyFavorited = async (restaurantId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('user_favorite_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  // IMPROVED SCORING: Same as before
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Exact match - highest score
    if (s1 === s2) return 100;
    
    // Contains match - very high score
    if (s1.includes(s2) || s2.includes(s1)) return 95;
    
    // Word-by-word comparison with better scoring
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    let wordMatches = 0;
    let partialMatches = 0;
    
    words2.forEach(word2 => {
      // Check for exact word matches
      if (words1.some(word1 => word1 === word2)) {
        wordMatches++;
      }
      // Check for partial word matches (e.g., "cafe" matches "café")
      else if (words1.some(word1 => 
        word1.includes(word2) || 
        word2.includes(word1) ||
        // Handle common variations
        (word1.replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e') === word2) ||
        (word2.replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e') === word1)
      )) {
        partialMatches++;
      }
    });
    
    if (wordMatches > 0 || partialMatches > 0) {
      // Score based on how many words matched
      const exactScore = (wordMatches / words2.length) * 80;
      const partialScore = (partialMatches / words2.length) * 60;
      return Math.min(95, 40 + exactScore + partialScore);
    }
    
    // Check for character similarity (basic Levenshtein-like)
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 100;
    
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    const charSimilarity = (matches / longer.length) * 30;
    return Math.max(0, charSimilarity);
  };

  // Search restaurants - same logic as before
  const searchRestaurants = async (query: string, location: string = 'Seattle, WA') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      console.log('🔑 API Key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('API key is missing or not set properly');
      }

      let lat = 47.6062; // Seattle default
      let lon = -122.3321;

      // Only geocode if location changed or not cached
      if (!cachedLocation || cachedLocation.query !== location) {
        console.log('🌍 Geocoding new location:', location);
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&limit=1&apiKey=${apiKey}`;
        
        const geocodeResponse = await fetch(geocodeUrl);
        console.log('🌍 Geocoding response status:', geocodeResponse.status);
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.features && geocodeData.features.length > 0) {
            lat = geocodeData.features[0].properties.lat;
            lon = geocodeData.features[0].properties.lon;
            setCachedLocation({ query: location, lat, lon });
            console.log('🌍 Cached new coordinates:', { lat, lon });
          }
        }
      } else {
        lat = cachedLocation.lat;
        lon = cachedLocation.lon;
        console.log('🌍 Using cached coordinates:', { lat, lon });
      }

      // STRATEGY 1: Use Geocoding API for text-based restaurant name search
      console.log('🎯 Strategy 1: Geocoding API text search for:', query);
      
      let allResults: GeoapifyPlace[] = [];

      const geocodeSearches = [
        `${query} ${location}`,
        `${query} restaurant ${location}`,
        `${query} Seattle`
      ];

      for (const searchText of geocodeSearches) {
        console.log(`🔍 Trying geocoding search: "${searchText}"`);
        const geocodeSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchText)}&bias=proximity:${lon},${lat}&limit=10&apiKey=${apiKey}`;
        
        const geocodeResponse = await fetch(geocodeSearchUrl);
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.features && geocodeData.features.length > 0) {
            const restaurantResults = geocodeData.features
              .filter((feature: any) => {
                const categories = feature.properties.categories || [];
                const resultType = feature.properties.result_type;
                const name = feature.properties.name || '';
                
                return (
                  resultType === 'amenity' ||
                  resultType === 'building' ||
                  categories.some((cat: string) => cat.includes('catering') || cat.includes('restaurant') || cat.includes('food')) ||
                  name.toLowerCase().includes('restaurant') ||
                  name.toLowerCase().includes('cafe') ||
                  name.toLowerCase().includes('grill') ||
                  name.toLowerCase().includes('food') ||
                  name.toLowerCase().includes('kitchen') ||
                  name.toLowerCase().includes('diner') ||
                  name.toLowerCase().includes('bistro')
                );
              })
              .map((feature: any) => ({
                place_id: feature.properties.place_id || `geocode_${feature.properties.lat}_${feature.properties.lon}`,
                properties: {
                  name: feature.properties.name || feature.properties.address_line1 || 'Unknown Restaurant',
                  formatted: feature.properties.formatted || `${feature.properties.address_line1 || ''}, ${feature.properties.city || ''}, ${feature.properties.state || ''}`.trim(),
                  address_line1: feature.properties.address_line1,
                  address_line2: feature.properties.address_line2,
                  city: feature.properties.city,
                  state: feature.properties.state,
                  postcode: feature.properties.postcode,
                  country: feature.properties.country,
                  lat: feature.properties.lat,
                  lon: feature.properties.lon,
                  categories: feature.properties.categories || ['catering.restaurant'],
                  datasource: feature.properties.datasource || { sourcename: 'geoapify', attribution: 'Geoapify' }
                }
              }));

            allResults = [...allResults, ...restaurantResults];
            console.log(`🎯 Geocoding found ${restaurantResults.length} restaurant results for "${searchText}"`);
            
            if (restaurantResults.length > 0) {
              console.log('🎯 First few geocoding results:', restaurantResults.slice(0, 3).map((r: GeoapifyPlace) => r.properties.name));
            }
            
            // If we found good matches, break early
            const goodMatches = restaurantResults.filter((r: GeoapifyPlace) => 
              calculateSimilarity(r.properties.name, query) > 70
            );
            if (goodMatches.length > 0) {
              console.log(`✅ Found ${goodMatches.length} good matches, stopping search`);
              break;
            }
          }
        }
      }

      // STRATEGY 2: Fallback to Places API if needed
      const goodGeocodingMatches = allResults.filter((r: GeoapifyPlace) => 
        calculateSimilarity(r.properties.name, query) > 50
      );
      
      if (goodGeocodingMatches.length === 0) {
        console.log('🔄 Strategy 2: Places API fallback search');
        
        const restaurantCategories = [
          'catering.restaurant',
          'catering.fast_food',
          'catering.cafe'
        ];

        const placesSearchUrl = `https://api.geoapify.com/v2/places?categories=${restaurantCategories.join(',')}&filter=circle:${lon},${lat},15000&limit=20&apiKey=${apiKey}`;
        
        const placesResponse = await fetch(placesSearchUrl);
        if (placesResponse.ok) {
          const placesData = await placesResponse.json();
          const placesResults = placesData.features?.map((feature: any) => ({
            place_id: feature.properties.place_id,
            properties: {
              name: feature.properties.name || 'Unknown Restaurant',
              formatted: feature.properties.formatted || feature.properties.address_line1 || '',
              address_line1: feature.properties.address_line1,
              address_line2: feature.properties.address_line2,
              city: feature.properties.city,
              state: feature.properties.state,
              postcode: feature.properties.postcode,
              country: feature.properties.country,
              lat: feature.properties.lat,
              lon: feature.properties.lon,
              categories: feature.properties.categories || [],
              datasource: feature.properties.datasource || { sourcename: 'geoapify', attribution: 'Geoapify' }
            }
          })) || [];
          
          allResults = [...allResults, ...placesResults];
          console.log('🔄 Places API found:', placesResults.length, 'results');
        }
      }

      // Remove duplicates and score results
      const uniqueResults = allResults.filter((item: GeoapifyPlace, index: number, self: GeoapifyPlace[]) => {
        return index === self.findIndex((t: GeoapifyPlace) => {
          if (t.place_id && item.place_id && t.place_id === item.place_id) return true;
          
          const distance = Math.sqrt(
            Math.pow((t.properties.lat - item.properties.lat) * 111000, 2) +
            Math.pow((t.properties.lon - item.properties.lon) * 111000, 2)
          );
          return distance < 50;
        });
      });

      console.log('🔀 Combined unique results:', uniqueResults.length);

      const scoredResults = uniqueResults.map((place: GeoapifyPlace) => {
        let similarity = calculateSimilarity(place.properties.name, query);
        
        if (place.place_id.startsWith('geocode_')) {
          similarity += 15;
        }
        
        if (similarity >= 90) {
          similarity += 10;
        }
        
        return {
          ...place,
          similarity
        };
      });

      const sortedResults = scoredResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 25);

      console.log('🏆 Top 5 matches:');
      sortedResults.slice(0, 5).forEach((result, i) => {
        console.log(`${i + 1}. ${result.properties.name} (score: ${result.similarity})`);
      });

      let finalResults = sortedResults;
      const goodMatches = sortedResults.filter((r: any) => r.similarity > 30);
      
      if (goodMatches.length >= 3) {
        finalResults = goodMatches;
        console.log('✨ Filtered to relevant matches only');
      } else {
        console.log('📍 Keeping all results due to few relevant matches');
      }

      const cleanResults = finalResults.map(({ similarity, ...place }: any) => place);
      setSearchResults(cleanResults);
      
    } catch (err: any) {
      console.error('🚨 Error searching restaurants:', err);
      setSearchError(`Failed to search restaurants: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get detailed restaurant information
  const getRestaurantDetails = async (placeId: string): Promise<GeoapifyPlaceDetails | null> => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      console.log('🏪 Fetching place details for:', placeId);
      
      if (placeId.startsWith('geocode_')) {
        console.log('🏪 Skipping place details for geocoded result');
        return null;
      }
      
      const response = await fetch(
        `https://api.geoapify.com/v2/place-details?id=${placeId}&features=details&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get place details: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          place_id: placeId,
          properties: {
            name: feature.properties.name || 'Unknown Restaurant',
            formatted: feature.properties.formatted || feature.properties.address_line1 || '',
            address_line1: feature.properties.address_line1,
            address_line2: feature.properties.address_line2,
            city: feature.properties.city,
            state: feature.properties.state,
            postcode: feature.properties.postcode,
            country: feature.properties.country,
            lat: feature.properties.lat,
            lon: feature.properties.lon,
            categories: feature.properties.categories || [],
            website: feature.properties.website || feature.properties.contact?.website,
            phone: feature.properties.phone || feature.properties.contact?.phone,
            opening_hours: feature.properties.opening_hours,
            contact: feature.properties.contact,
            datasource: feature.properties.datasource || { sourcename: 'geoapify', attribution: 'Geoapify' }
          }
        };
      }
      
      return null;
    } catch (err: any) {
      console.error('Error getting restaurant details:', err);
      throw err;
    }
  };

  // UPDATED: Import restaurant with global model logic
  const importRestaurant = async (selectedPlace: GeoapifyPlace) => {
    setError(null);
    setIsLoadingDetails(true);
    
    // Clear any previous error for this restaurant
    setRestaurantErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(selectedPlace.place_id);
      return newErrors;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // STEP 1: Check if this restaurant already exists in the global catalog
      const existingGlobalRestaurant = await isDuplicateRestaurant(
        selectedPlace.properties.name,
        selectedPlace.properties.formatted,
        selectedPlace.place_id
      );

      if (existingGlobalRestaurant) {
        console.log('🌍 Found existing global restaurant:', existingGlobalRestaurant.name);
        
        // Check if user has already favorited this restaurant
        const alreadyFavorited = await isAlreadyFavorited(existingGlobalRestaurant.id);
        
        if (alreadyFavorited) {
          setRestaurantErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.set(selectedPlace.place_id, `"${existingGlobalRestaurant.name}" is already in your restaurant list.`);
            return newErrors;
          });
          return false;
        }

        // Add to user's favorites
        const { error: favoriteError } = await supabase
          .from('user_favorite_restaurants')
          .insert([{
            user_id: user.id,
            restaurant_id: existingGlobalRestaurant.id,
            added_at: new Date().toISOString()
          }]);

        if (favoriteError) {
          console.error('Error adding to favorites:', favoriteError);
          setRestaurantErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.set(selectedPlace.place_id, 'Failed to add restaurant to your list. Please try again.');
            return newErrors;
          });
          return false;
        }

        // Add to local state with favorite date
        const restaurantWithFavoriteDate = {
          ...existingGlobalRestaurant,
          dateAdded: new Date().toISOString(),
          date_favorited: new Date().toISOString()
        };

        setRestaurants(prevRestaurants => 
          [restaurantWithFavoriteDate, ...prevRestaurants].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
            return 0;
          })
        );

        return existingGlobalRestaurant.id;
      }

      // STEP 2: Restaurant doesn't exist globally, so create it and add to favorites
      console.log('🆕 Creating new global restaurant');

      // Get detailed information if available
      let placeDetails: GeoapifyPlaceDetails | null = null;
      
      try {
        placeDetails = await getRestaurantDetails(selectedPlace.place_id);
      } catch (detailsError) {
        console.log('Could not fetch place details, using basic info');
      }

      const finalDetails = placeDetails || {
        place_id: selectedPlace.place_id,
        properties: {
          ...selectedPlace.properties,
          phone: undefined,
          website: undefined,
          opening_hours: undefined
        }
      };

      // Create new global restaurant
      const restaurantData = {
        name: finalDetails.properties.name,
        geoapify_place_id: finalDetails.place_id,
        address: finalDetails.properties.formatted,
        phone: finalDetails.properties.phone || null,
        website_url: finalDetails.properties.website || null,
        rating: null,
        price_tier: null,
        category: finalDetails.properties.categories?.[0] || 'Restaurant',
        opening_hours: finalDetails.properties.opening_hours || null,
        latitude: finalDetails.properties.lat,
        longitude: finalDetails.properties.lon,
        created_by: user.id
      };

      const { data: newGlobalRestaurant, error: insertError } = await supabase
        .from('restaurants')
        .insert([restaurantData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating global restaurant:', insertError);
        setRestaurantErrors(prev => {
          const newErrors = new Map(prev);
          newErrors.set(selectedPlace.place_id, 'Failed to create restaurant. Please try again.');
          return newErrors;
        });
        throw insertError;
      }

      // Add to user's favorites
      const { error: favoriteError } = await supabase
        .from('user_favorite_restaurants')
        .insert([{
          user_id: user.id,
          restaurant_id: newGlobalRestaurant.id,
          added_at: new Date().toISOString()
        }]);

      if (favoriteError) {
        console.error('Error adding new restaurant to favorites:', favoriteError);
        // If this fails, we should probably remove the global restaurant we just created
        // But for now, just show an error
        setRestaurantErrors(prev => {
          const newErrors = new Map(prev);
          newErrors.set(selectedPlace.place_id, 'Restaurant created but failed to add to your list. Please try again.');
          return newErrors;
        });
        return false;
      }

      // Add to local state
      const restaurantWithFavoriteDate = {
        ...newGlobalRestaurant,
        dateAdded: new Date().toISOString(),
        date_favorited: new Date().toISOString()
      };

      setRestaurants(prevRestaurants => 
        [restaurantWithFavoriteDate, ...prevRestaurants].sort((a, b) => {
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          if (sortBy === 'date') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          return 0;
        })
      );

      return newGlobalRestaurant.id;

    } catch (catchedError: any) {
      console.error('Caught error in importRestaurant:', catchedError);
      setRestaurantErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.set(selectedPlace.place_id, `Failed to import restaurant: ${catchedError.message}`);
        return newErrors;
      });
      return false;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // UPDATED: Manual add restaurant (creates global restaurant + favorite)
  const addRestaurant = async (name: string) => {
    if (!name.trim()) return false;

    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      // Check for duplicates in global catalog
      const duplicateRestaurant = await isDuplicateRestaurant(name.trim());
      
      if (duplicateRestaurant) {
        // Check if user has already favorited this restaurant
        const alreadyFavorited = await isAlreadyFavorited(duplicateRestaurant.id);
        
        if (alreadyFavorited) {
          setError(`"${duplicateRestaurant.name}" is already in your restaurant list.`);
          return false;
        }

        // Add existing restaurant to favorites
        const { error: favoriteError } = await supabase
          .from('user_favorite_restaurants')
          .insert([{
            user_id: user.id,
            restaurant_id: duplicateRestaurant.id,
            added_at: new Date().toISOString()
          }]);

        if (favoriteError) {
          setError('Failed to add restaurant to your list. Please try again.');
          return false;
        }

        // Add to local state
        const restaurantWithFavoriteDate = {
          ...duplicateRestaurant,
          dateAdded: new Date().toISOString(),
          date_favorited: new Date().toISOString()
        };

        setRestaurants(prevRestaurants => 
          [restaurantWithFavoriteDate, ...prevRestaurants].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
            return 0;
          })
        );

        return true;
      }

      // Create new global restaurant
      const { data: newGlobalRestaurant, error: insertError } = await supabase
        .from('restaurants')
        .insert([{
          name: name.trim(),
          created_by: user.id
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error adding restaurant:', insertError);
        setError('Failed to add restaurant. Please try again.');
        throw insertError;
      }

      // Add to user's favorites
      const { error: favoriteError } = await supabase
        .from('user_favorite_restaurants')
        .insert([{
          user_id: user.id,
          restaurant_id: newGlobalRestaurant.id,
          added_at: new Date().toISOString()
        }]);

      if (favoriteError) {
        console.error('Error adding to favorites:', favoriteError);
        setError('Restaurant created but failed to add to your list. Please try again.');
        return false;
      }

      // Add to local state
      const restaurantWithFavoriteDate = {
        ...newGlobalRestaurant,
        dateAdded: new Date().toISOString(),
        date_favorited: new Date().toISOString()
      };

      setRestaurants(prevRestaurants => 
        [restaurantWithFavoriteDate, ...prevRestaurants].sort((a, b) => {
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          if (sortBy === 'date') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          return 0;
        })
      );

      return true;
    } catch (catchedError) {
      console.error('Caught error in addRestaurant:', catchedError);
      return false;
    }
  };

  // UPDATED: Delete restaurant (removes from favorites, doesn't delete global)
  const deleteRestaurant = async (restaurantId: string) => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      // Remove from user's favorites (not from global restaurants table)
      const { error: deleteError } = await supabase
        .from('user_favorite_restaurants')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      if (deleteError) {
        console.error('Error removing restaurant from favorites:', deleteError);
        setError('Failed to remove restaurant from your list. Please try again.');
        throw deleteError;
      }

      // Remove from local state
      setRestaurants(prevRestaurants => 
        prevRestaurants.filter(r => r.id !== restaurantId)
      );
      
      return true;
    } catch (catchedError) {
      console.error('Caught error in deleteRestaurant:', catchedError);
      return false;
    }
  };

  // Reset search function
  const resetSearch = () => {
    setSearchResults([]);
    setSearchError(null);
    setRestaurantErrors(new Map());
  };

  return {
    restaurants,
    isLoading,
    error,
    setError,
    addRestaurant,
    deleteRestaurant,
    setRestaurants,
    // Search functionality
    searchResults,
    isSearching,
    searchError,
    isLoadingDetails,
    restaurantErrors,
    searchRestaurants,
    importRestaurant,
    clearSearchResults: () => setSearchResults([]),
    resetSearch
  };
};