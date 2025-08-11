// src/services/searchService.ts
import { supabase } from '../supabaseClient';
import { GeoapifyPlace, GeoapifyPlaceDetails } from '../types/restaurantSearch';
import { parseAddress } from '../utils/addressParser';
import { incrementGeoapifyCount, logGeoapifyCount } from '../utils/apiCounter';
import { analyzeQuery } from '../utils/queryAnalysis';
import { calculateEnhancedSimilarity } from '../utils/textUtils';

export class SearchService {
  private abortController: AbortController | null = null;
  private cache = new Map<string, GeoapifyPlace[]>();

  public async searchRestaurants(
    searchParams: string,
    userLat: number | null,
    userLon: number | null
  ): Promise<GeoapifyPlace[]> {
    const query = searchParams.trim();
    if (!query) {
      return [];
    }

    const latKey = userLat?.toFixed(4) || 'null';
    const lonKey = userLon?.toFixed(4) || 'null';
    const cacheKey = `search_${query}_${latKey}_${lonKey}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') throw new Error('API key is missing or not set properly');

      let rawApiFeatures: any[] = [];
      const queryAnalysis = analyzeQuery(query);

      // --- ADDED: Log the output of the query analysis ---
      console.log(
        `%c[Query Analysis] -> Original: "${query}"`,
        'color: #2e6c6e; font-weight: bold; background-color: #f0f9ff; padding: 2px 6px; border-radius: 4px;',
        {
          type: queryAnalysis.type,
          businessName: queryAnalysis.businessName,
          location: queryAnalysis.location,
        }
      );

      if (queryAnalysis.type === 'business_location_proposal' && queryAnalysis.location && queryAnalysis.businessName) {
        const [smartResults, textResults] = await Promise.all([
            (async () => {
                const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryAnalysis.location!)}&limit=1&apiKey=${apiKey}`;
                incrementGeoapifyCount(); logGeoapifyCount();
                const geocodeResponse = await fetch(geocodeUrl, { signal });
                if (!geocodeResponse.ok) return [];
                const geocodeData = await geocodeResponse.json();
                if (!geocodeData.features || geocodeData.features.length === 0) return [];
                const { lat, lon } = geocodeData.features[0].properties;
                const smartSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryAnalysis.businessName!)}&type=amenity&limit=20&filter=circle:${lon},${lat},50000&bias=proximity:${lon},${lat}&apiKey=${apiKey}`;
                incrementGeoapifyCount(); logGeoapifyCount();
                const response = await fetch(smartSearchUrl, { signal });
                return response.ok ? (await response.json()).features || [] : [];
            })(),
            (async () => {
                const textSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&type=amenity&limit=20&apiKey=${apiKey}`;
                incrementGeoapifyCount(); logGeoapifyCount();
                const response = await fetch(textSearchUrl, { signal });
                return response.ok ? (await response.json()).features || [] : [];
            })()
        ]);
        const combined = [...smartResults, ...textResults];
        rawApiFeatures = combined.filter((result, index, self) => index === self.findIndex(r => r.properties.place_id === result.properties.place_id));
      } else {
        const bias = (userLat && userLon) ? `&bias=proximity:${userLon},${userLat}` : '';
        const simpleSearchUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&type=amenity&limit=20${bias}&apiKey=${apiKey}`;
        incrementGeoapifyCount(); logGeoapifyCount();
        const fuzzyResponse = await fetch(simpleSearchUrl, { signal });
          if (fuzzyResponse.ok) {
            const fuzzyData = await fuzzyResponse.json();
            rawApiFeatures = fuzzyData.features || [];
        } else { throw new Error(`Geoapify API responded with status ${fuzzyResponse.status}`); }
      }
      
      const apiPlaces: GeoapifyPlace[] = rawApiFeatures
        .filter(f => f && f.properties && f.properties.place_id)
        .map(f => {
          const props = f.properties;

          if (!props.name) {
            return null;
          }

          let cleanAddress = props.address_line1; 
          let cleanCity = props.city;

          if (cleanAddress && calculateEnhancedSimilarity(cleanAddress, props.name) > 90) { 
            cleanAddress = null; 
          }

          if (!cleanAddress) {
              const addressToParseFrom = props.address_line2 || props.formatted;
              if (addressToParseFrom) {
                  const namePattern = new RegExp(`^${props.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[, ]*`, 'i');
                  const addressToParse = addressToParseFrom.replace(namePattern, '');
                  const parsed = parseAddress(addressToParse);
                  if (parsed.data) { 
                    cleanAddress = parsed.data.address || cleanAddress; 
                    cleanCity = parsed.data.city || cleanCity; 
                  }
              }
          }
          return { place_id: props.place_id, properties: { ...props, address_line1: cleanAddress, city: cleanCity }};
        })
        .filter((p): p is GeoapifyPlace => p !== null);
      
      const { data: allDbRestaurants } = await supabase.from('restaurants').select('*');
      const dbMatches = (allDbRestaurants || []).map(r => ({ restaurant: r, score: calculateEnhancedSimilarity(r.name, query) })).filter(item => item.score > 60).map(match => ({ place_id: `db_${match.restaurant.id}`, properties: { name: match.restaurant.name, formatted: match.restaurant.full_address || [match.restaurant.address, match.restaurant.city, match.restaurant.state, match.restaurant.zip_code].filter(Boolean).join(', '), address_line1: match.restaurant.address || undefined, city: match.restaurant.city || undefined, state: match.restaurant.state || undefined, postcode: match.restaurant.zip_code || undefined, country: match.restaurant.country || undefined, lat: match.restaurant.latitude || 0, lon: match.restaurant.longitude || 0, categories: ['database'], datasource: { sourcename: 'database', attribution: 'Our Database' } } }));
      
      const uniqueApiPlaces: GeoapifyPlace[] = [];
      for (const apiPlace of apiPlaces) {
          const isDuplicateOfDb = dbMatches.some(dbMatch => calculateEnhancedSimilarity(dbMatch.properties.name, apiPlace.properties.name) > 95 && calculateEnhancedSimilarity(dbMatch.properties.address_line1 || dbMatch.properties.formatted, apiPlace.properties.address_line1 || apiPlace.properties.formatted) > 70);
          if (isDuplicateOfDb) continue;
          const existingMatchIndex = uniqueApiPlaces.findIndex(uniquePlace => calculateEnhancedSimilarity(uniquePlace.properties.name, apiPlace.properties.name) > 95 && calculateEnhancedSimilarity(uniquePlace.properties.address_line1 || uniquePlace.properties.formatted, apiPlace.properties.address_line1 || apiPlace.properties.formatted) > 80);
          if (existingMatchIndex !== -1) {
              const existingPlace = uniqueApiPlaces[existingMatchIndex];
              const isNewPlaceBetter = (apiPlace.properties.address_line1 && !existingPlace.properties.address_line1) || (apiPlace.properties.formatted.length > existingPlace.properties.formatted.length);
              if (isNewPlaceBetter) { uniqueApiPlaces[existingMatchIndex] = apiPlace; }
          } else {
              uniqueApiPlaces.push(apiPlace);
          }
      }

      const combinedResults = [...dbMatches, ...uniqueApiPlaces];
      this.cache.set(cacheKey, combinedResults);
      return combinedResults;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Search aborted');
        return [];
      }
      console.error('Error searching restaurants:', err);
      throw new Error(`Search failed: ${err.message}`);
    } finally {
      this.abortController = null;
    }
  }

  public async getRestaurantDetails(placeId: string): Promise<GeoapifyPlaceDetails | null> {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('Geoapify API key is not configured');
      }
      incrementGeoapifyCount();
      logGeoapifyCount();
      const response = await fetch(`https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        throw new Error('No details found for this place');
      }

      const feature = data.features[0];
      return { place_id: feature.properties.place_id, properties: { ...feature.properties } };
    } catch (err: any) {
      console.error(`Error fetching details for ${placeId}:`, err);
      throw err;
    }
  }

  public abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  public clearCache() {
    this.cache.clear();
  }
}