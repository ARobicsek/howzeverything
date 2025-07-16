// src/utils/geolocation.ts
import { RestaurantWithStats } from "../types/restaurantSearch";

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates the distance between two lat/lon points in miles using the Haversine formula.
 * This is the primary function to use for distance calculations.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in miles.
 */
export function calculateDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of the earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in miles
  return d;
}

/**
 * Formats a distance in miles into a readable string (e.g., "5.2 mi" or "750 ft").
 */
export function formatDistanceMiles(distanceMiles: number): string {
    if (distanceMiles < 0.2) { // Show feet for less than ~1000 feet
        const feet = Math.round(distanceMiles * 5280);
        return `${feet} ft`;
    }
    if (distanceMiles < 10) {
        return `${distanceMiles.toFixed(1)} mi`;
    }
    return `${Math.round(distanceMiles)} mi`;
}

/**
 * Calculates the distance between two lat/lon points in kilometers using the Haversine formula.
 */
export function calculateDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

/**
 * Formats a distance in kilometers into a readable string (e.g., "5.2 km" or "750 m").
 */
export function formatDistanceKm(distanceKm: number): string {
    if (distanceKm < 1) {
        const meters = Math.round(distanceKm * 1000);
        return `${meters} m`;
    }
    if (distanceKm < 10) {
        return `${distanceKm.toFixed(1)} km`;
    }
    return `${Math.round(distanceKm)} km`;
}


/**
 * Sorts an array of restaurants based on a given criterion and direction.
 * @param array The array of restaurants to sort.
 * @param sortBy The sorting criterion and direction.
 * @param userLat The user's latitude for distance sorting.
 * @param userLon The user's longitude for distance sorting.
 * @returns A new, sorted array of restaurants.
 */
export const sortRestaurantsArray = (
  array: RestaurantWithStats[],
  sortBy: { criterion: 'name' | 'date' | 'distance'; direction: 'asc' | 'desc' },
  userLat?: number | null,
  userLon?: number | null
): RestaurantWithStats[] => {
  return [...array].sort((a, b) => {
    let comparison = 0;
    if (sortBy.criterion === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy.criterion === 'date') {
      const dateA = new Date(a.date_favorited || a.created_at).getTime();
      const dateB = new Date(b.date_favorited || b.created_at).getTime();
      comparison = dateA - dateB;
    } else if (sortBy.criterion === 'distance') {
      if (!userLat || !userLon) {
        // Restaurants without location data or if user location is unavailable are pushed to the end.
        if (a.latitude === null || a.longitude === null) return 1;
        if (b.latitude === null || b.longitude === null) return -1;
        // If no user location, fall back to name sort.
        comparison = a.name.localeCompare(b.name);
      } else {
        const distanceA = (a.latitude !== null && a.longitude !== null) ? calculateDistanceInMiles(userLat, userLon, a.latitude, a.longitude) : Infinity;
        const distanceB = (b.latitude !== null && b.longitude !== null) ? calculateDistanceInMiles(userLat, userLon, b.latitude, b.longitude) : Infinity;
        comparison = distanceA - distanceB;
      }
    }
    return sortBy.direction === 'asc' ? comparison : -comparison;
  });
};