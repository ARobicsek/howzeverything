// src/utils/geolocation.ts

/**
 * Calculates the distance between two lat/lon points in kilometers using the Haversine formula.
 */
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats a distance in kilometers into a readable string (e.g., "5.2 km" or "750 m").
 */
export function formatDistance(distanceKm: number): string {
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
 * NEW: Calculates the distance between two lat/lon points in miles using the Haversine formula.
 */
export function getDistanceFromLatLonInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
 * NEW: Formats a distance in miles into a readable string (e.g., "5.2 mi" or "750 ft").
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