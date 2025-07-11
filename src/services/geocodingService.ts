// src/services/geocodingService.ts
import { Restaurant } from '../types/restaurant';
import { incrementGeoapifyCount, logGeoapifyCount } from '../utils/apiCounter';

export const geocodeAddress = async (addressData: Partial<Restaurant>): Promise<{ latitude: number; longitude: number } | null> => {
  const addressString = [
    addressData.address,
    addressData.city,
    addressData.state,
    addressData.zip_code,
    addressData.country,
  ]
    .filter(Boolean)
    .join(', ');

  if (!addressString) {
    return null;
  }

  try {
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return null;
    }

    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      addressString
    )}&limit=1&apiKey=${apiKey}`;

    incrementGeoapifyCount();
    logGeoapifyCount();
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const { lat, lon } = data.features[0].properties;
      return { latitude: lat, longitude: lon };
    } else {
      return null;
    }
  } catch (error) {
    console.error('An unexpected error occurred during geocoding:', error);
    return null;
  }
};