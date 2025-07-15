// src/services/restaurantDataService.ts
import { supabase } from '../supabaseClient';
import type { Restaurant } from '../types/restaurant';
import type { GeoapifyPlace } from '../types/restaurantSearch';
import { parseAddress } from '../utils/addressParser';
import { calculateEnhancedSimilarity } from '../utils/textUtils';
import { addToFavorites, isAlreadyFavorited } from './favoritesService';

// --- NEW FUNCTION ---
/**
 * Quickly checks if a restaurant with the given UUID exists in the database.
 * @param restaurantId The UUID of the restaurant to check.
 * @returns True if the restaurant exists, false otherwise.
 */
export const verifyRestaurantExists = async (restaurantId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('id', restaurantId)
        .maybeSingle();

    if (error) {
        console.error('Error verifying restaurant existence:', error);
        return false;
    }
    return !!data;
};


/**
 * Finds restaurants in the database with names similar to the provided name.
 * @param name - The name of the restaurant to search for.
 * @param address - Optional address to improve matching accuracy.
 * @returns A promise that resolves to an array of similar restaurants.
 */
export const findSimilarRestaurants = async (name: string, address?: string): Promise<Restaurant[]> => {
    const { data: potentialMatches, error } = await supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${name.trim()}%`);

    if (error) {
        console.error('Error finding similar restaurants:', error);
        return [];
    }

    // Further refine with textual similarity
    return potentialMatches.filter(match => {
        const nameSimilarity = calculateEnhancedSimilarity(name, match.name);
        if (address && match.full_address) {
            const addressSimilarity = calculateEnhancedSimilarity(address, match.full_address);
            return nameSimilarity > 80 && addressSimilarity > 50;
        }
        return nameSimilarity > 90; // Higher threshold if no address to compare
    });
};

/**
 * Checks if a restaurant with the same name and a similar address already exists.
 * @param name - The name of the restaurant.
 * @param address - The full address of the restaurant.
 * @returns A promise that resolves to the existing restaurant object or null.
 */
export const isDuplicateRestaurant = async (name: string, address: string): Promise<Restaurant | null> => {
    const similar = await findSimilarRestaurants(name, address);
    // Assuming the first highly similar result is the duplicate
    return similar.length > 0 ? similar[0] : null;
};

/**
 * Adds a new restaurant to the database and adds it to the user's favorites.
 * @param restaurantDataOrName - The full restaurant data object or just a name string.
 * @param userId - The ID of the user adding the restaurant.
 * @returns A promise that resolves to the newly created restaurant object, true if it already exists, or null on error.
 */
export const addRestaurant = async (
    restaurantDataOrName: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> | string,
    userId: string
): Promise<Restaurant | boolean | null> => {
    const restaurantData = typeof restaurantDataOrName === 'string'
        ? { name: restaurantDataOrName, manually_added: true, created_by: userId }
        : { ...restaurantDataOrName, manually_added: true, created_by: userId };

    // Check for duplicates before inserting
    const existing = await isDuplicateRestaurant(restaurantData.name, restaurantData.full_address || restaurantData.address || '');
    if (existing) {
        if (!(await isAlreadyFavorited(userId, existing.id))) {
            await addToFavorites(userId, existing.id);
        }
        return true; // Indicates it already existed
    }
    const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurantData])
        .select()
        .single();

    if (error) {
        console.error('Error inserting restaurant:', error);
        throw new Error(`Could not add restaurant: ${error.message}`);
    }
    if (data) {
        await addToFavorites(userId, data.id);
    }
    return data;
};

/**
 * Gets a restaurant from the DB by its Geoapify Place ID, or creates it if it doesn't exist.
 * @param place - The GeoapifyPlace object.
 * @param userId - The ID of the current user.
 * @returns The existing or newly created restaurant from the database.
 */
export const getOrCreateRestaurant = async (place: GeoapifyPlace, userId: string): Promise<Restaurant | null> => {
    // 1. Check if it exists by geoapify_place_id
    if (place.properties.place_id) {
        const { data: existingByPlaceId } = await supabase
            .from('restaurants')
            .select('*')
            .eq('geoapify_place_id', place.properties.place_id)
            .single();
        if (existingByPlaceId) return existingByPlaceId;
    }

    // 2. Check for textual duplicates
    const existingByName = await isDuplicateRestaurant(
        place.properties.name,
        place.properties.formatted || place.properties.address_line1 || ''
    );
    if (existingByName) {
        // If we found a match but it's missing the place_id, update it.
        if (!existingByName.geoapify_place_id && place.properties.place_id) {
            await supabase
                .from('restaurants')
                .update({ geoapify_place_id: place.properties.place_id })
                .eq('id', existingByName.id);
            existingByName.geoapify_place_id = place.properties.place_id;
        }
        return existingByName;
    }

    // 3. Create new restaurant
    let addressToParse = place.properties.formatted;
    if (addressToParse.toLowerCase().startsWith(place.properties.name.toLowerCase())) {
        addressToParse = addressToParse.substring(place.properties.name.length).replace(/^,?\s*/, '');
    }
    const parsed = parseAddress(addressToParse);
    
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
        geoapify_place_id: place.properties.place_id,
        website_url: place.properties.website || place.properties.contact?.website || null,
        phone: place.properties.phone || place.properties.contact?.phone || null,
        manually_added: false,
        created_by: userId,
        dateAdded: new Date().toISOString(),
        category: place.properties.categories.join(','),
    };

    const { data: createdRestaurant, error } = await supabase
        .from('restaurants')
        .insert(newRestaurantData)
        .select()
        .single();
        
    if (error) {
        console.error('Error creating new restaurant from Geoapify:', error);
        return null;
    }
    return createdRestaurant;
};

/**
 * Updates a restaurant record in the database.
 * @param restaurantId The UUID of the restaurant to update.
 * @param updates The partial data to update.
 * @param userId The ID of the user performing the update.
 * @returns The updated restaurant object.
 */
export const updateRestaurantInSupabase = async (restaurantId: string, updates: Partial<Restaurant>, userId: string): Promise<Restaurant | null> => {
    const { data, error } = await supabase
      .from('restaurants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', restaurantId)
      .select()
      .single();
  
    if (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
    return data;
};