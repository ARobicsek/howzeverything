// src/utils/restaurantGeolocation.ts
import { RestaurantWithStats } from '../types/restaurantSearch';

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d / 1000 * 0.621371;
};

export const formatDistanceMiles = (distanceMiles: number): string => {
    if (distanceMiles < 0.2) {
        const feet = Math.round(distanceMiles * 5280);
        return `${feet} ft`;
    }
    if (distanceMiles < 10) {
        return `${distanceMiles.toFixed(1)} mi`;
    }
    return `${Math.round(distanceMiles)} mi`;
};

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
        comparison = a.name.localeCompare(b.name);
      } else {
        const distanceA = (a.latitude !== null && a.longitude !== null) ? calculateDistance(userLat, userLon, a.latitude, a.longitude) : Infinity;
        const distanceB = (b.latitude !== null && b.longitude !== null) ? calculateDistance(userLat, userLon, b.latitude, b.longitude) : Infinity;
        comparison = distanceA - distanceB;
      }
    }
    return sortBy.direction === 'asc' ? comparison : -comparison;
  });
};