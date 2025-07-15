// src/services/restaurantDataService.ts
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types/restaurant';
import { GeoapifyPlace } from '../types/restaurantSearch';
import { parseAddress } from '../utils/addressParser';
import { calculateEnhancedSimilarity, normalizeText } from '../utils/textUtils';
import { addToFavorites, isAlreadyFavorited } from './favoritesService';
import { geocodeAddress } from './geocodingService';

/**
 * Quickly checks if a restaurant with the given UUID exists in the database.
 * @param restaurantId The UUID of the restaurant to check.
 * @returns True if the restaurant exists, false otherwise.
 */
export const verifyRestaurantExists = async (restaurantId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('restaurants')
        .select('id') // Select only the ID for efficiency
        .eq('id', restaurantId)
        .maybeSingle(); // Use maybeSingle to avoid an error if not found

    if (error) {
        console.error('Error verifying restaurant existence:', error);
        return false; // On error, assume it doesn't exist or there's a problem
    }
    
    // If data is not null, the record exists.
    return !!data; 
};

export const fetchUserRestaurantsWithStats = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('get_user_favorite_restaurants_with_stats', { p_user_id: userId });

  if (error) {
    throw new Error('Failed to load your restaurant list. Please try again.');
  }
  return data || [];
};

export const isDuplicateRestaurant = async (
  newName: string,
  newAddress?: string,
  geoapifyPlaceId?: string
): Promise<Restaurant | null> => {
  try {
    if (geoapifyPlaceId) {
      const { data: existingByPlaceId, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('geoapify_place_id', geoapifyPlaceId)
        .maybeSingle();
      if (error) {
        console.error("Error checking for duplicate by place ID:", error);
      } else if (existingByPlaceId) {
        return existingByPlaceId as Restaurant;
      }
    }

    const { data: allRestaurants } = await supabase.from('restaurants').select('*');
    if (!allRestaurants) return null;

    const normalizedNewName = normalizeText(newName);
    const normalizedNewAddress = newAddress ? normalizeText(newAddress) : undefined;

    const duplicate = allRestaurants.find(existing => {
      const existingName = normalizeText(existing.name);
      const existingAddress = existing.address ? normalizeText(existing.address) : undefined;
      const nameScore = calculateEnhancedSimilarity(existingName, normalizedNewName);
      if (nameScore < 80) return false;
      if (existingAddress && normalizedNewAddress) {
        return calculateEnhancedSimilarity(existingAddress, normalizedNewAddress) > 70;
      }
      return nameScore > 90;
    });

    return duplicate ? (duplicate as Restaurant) : null;
  } catch (err) {
    console.error('Error checking for duplicates:', err);
    return null;
  }
};

export const findSimilarRestaurants = async (newName: string, newAddress?: string): Promise<Restaurant[]> => {
    try {
      const { data: allRestaurants } = await supabase.from('restaurants').select('*');
      if (!allRestaurants) return [];
      const normalizedNewName = normalizeText(newName);
      const normalizedNewAddress = newAddress ? normalizeText(newAddress) : undefined;
      const similar = allRestaurants.filter(existing => {
        const existingName = normalizeText(existing.name);
        const existingAddress = existing.address ? normalizeText(existing.address) : undefined;
        const nameScore = calculateEnhancedSimilarity(existingName, normalizedNewName);
        if (nameScore < 80) return false;
        if (existingAddress && normalizedNewAddress) {
          if (calculateEnhancedSimilarity(existingAddress, normalizedNewAddress) > 70) {
            return true;
          }
        }
        return nameScore > 90;
      });
      return similar as Restaurant[];
    } catch (err) {
      console.error('Error finding similar restaurants:', err);
      return [];
    }
  };


export const addRestaurant = async (
  restaurantDataOrName: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> | string,
  userId: string
): Promise<Restaurant | boolean | null> => {
  const restaurantData = typeof restaurantDataOrName === 'string'
    ? {
        name: restaurantDataOrName, address: '', full_address: null, city: null, state: null,
        zip_code: null, country: null, latitude: null, longitude: null, manually_added: true,
        geoapify_place_id: null,
      }
    : restaurantDataOrName;

  if (restaurantData.address && (restaurantData.latitude === null || restaurantData.longitude === null)) {
    const coords = await geocodeAddress(restaurantData);
    if (coords) {
      restaurantData.latitude = coords.latitude;
      restaurantData.longitude = coords.longitude;
    }
  }

  const duplicate = await isDuplicateRestaurant(
    restaurantData.name,
    restaurantData.address || undefined,
    restaurantData.geoapify_place_id || undefined
  );

  if (duplicate) {
    const favorited = await isAlreadyFavorited(userId, duplicate.id);
    if (!favorited) {
      await addToFavorites(userId, duplicate.id);
    }
    return typeof restaurantDataOrName === 'string' ? true : duplicate;
  }

  const { data: newRestaurant, error: insertError } = await supabase
    .from('restaurants')
    .insert([{ ...restaurantData, created_by: userId }])
    .select()
    .single();

  if (insertError) { throw insertError; }
  if (!newRestaurant) { throw new Error('Failed to create restaurant'); }

  const restaurant = newRestaurant as Restaurant;
  await addToFavorites(userId, restaurant.id);
  return typeof restaurantDataOrName === 'string' ? true : restaurant;
};

export const getOrCreateRestaurant = async (place: GeoapifyPlace, userId: string): Promise<Restaurant | null> => {
    try {
      if (place.place_id.startsWith('db_')) {
        const restaurantId = place.place_id.substring(3);
        const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();
        if (error) throw new Error(`Could not find database restaurant: ${error.message}`);
        if (!restaurant) throw new Error(`Restaurant with ID ${restaurantId} not found.`);
        return restaurant as Restaurant;
      }

      const { data: existingByPlaceId } = await supabase.from('restaurants').select('*').eq('geoapify_place_id', place.place_id).maybeSingle();
      if (existingByPlaceId) return existingByPlaceId as Restaurant;
      
      const duplicate = await isDuplicateRestaurant(place.properties.name, place.properties.address_line1 || place.properties.formatted, place.place_id);
      if (duplicate) {
        if (!duplicate.geoapify_place_id && place.place_id) {
          await supabase.from('restaurants').update({ geoapify_place_id: place.place_id }).eq('id', duplicate.id);
        }
        return duplicate;
      }

      const parsed = parseAddress(place.properties.formatted.replace(`${place.properties.name}, `, ''));
      const newRestaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
        name: place.properties.name,
        full_address: place.properties.formatted,
        address: parsed.data?.address || place.properties.address_line1 || null,
        city: parsed.data?.city || place.properties.city || null,
        state: parsed.data?.state || place.properties.state || null,
        zip_code: parsed.data?.zip_code || place.properties.postcode || null,
        country: parsed.data?.country || place.properties.country_code?.toUpperCase() || null,
        latitude: place.properties.lat,
        longitude: place.properties.lon,
        geoapify_place_id: place.place_id,
        website_url: place.properties.website || place.properties.contact?.website || null,
        phone: place.properties.phone || place.properties.contact?.phone || null,
        manually_added: false,
        created_by: userId,
        dateAdded: new Date().toISOString(),
        rating: null,
        price_tier: null,
        category: null,
        opening_hours: null,
      };

      const { data: created, error: insertError } = await supabase
        .from('restaurants')
        .insert(newRestaurantData)
        .select()
        .single();
      if (insertError) throw insertError;
      
      return created as Restaurant;
    } catch (err) {
      console.error("Error in getOrCreateRestaurant:", err);
      return null;
    }
};

export const updateRestaurantInSupabase = async (restaurantId: string, updates: Partial<Restaurant>, userId: string): Promise<Restaurant | null> => {
    const isAddressChanging = 'address' in updates || 'city' in updates || 'state' in updates || 'zip_code' in updates || 'country' in updates;
    if (isAddressChanging) {
      const { data: currentRestaurant } = await supabase.from('restaurants').select('address, city, state, zip_code, country').eq('id', restaurantId).single();
      const addressForGeocoding = { ...(currentRestaurant || {}), ...updates };
      const coords = await geocodeAddress(addressForGeocoding);
      updates.latitude = coords?.latitude ?? null;
      updates.longitude = coords?.longitude ?? null;
    }

    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .eq('manually_added', true)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Restaurant;
};