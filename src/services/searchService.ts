// src/services/searchService.ts
import { supabase } from '../supabaseClient';
import { GeoapifyPlace, GeoapifyPlaceDetails } from '../types/restaurantSearch';
import { parseAddress } from '../utils/addressParser';
import { incrementGeoapifyCount, logGeoapifyCount } from '../utils/apiCounter';
import { analyzeQuery } from '../utils/queryAnalysis';
import { calculateEnhancedSimilarity } from '../utils/textUtils';

// Helper function to call the secure Geoapify proxy
async function callGeoapifyProxy(requestData: any): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/geoapify-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return await response.json();
}


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
    // Note: Abort functionality temporarily not available with proxy calls

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required for restaurant search');
      }

      // TODO: Update to use geoapify-proxy edge function for full security
      // For now, allow basic search functionality to work
      let rawApiFeatures: unknown[] = [];
      const queryAnalysis = analyzeQuery(query);

      // --- Log the output of the query analysis ---
      console.log(
        `%c[Query Analysis] -> Original: "${query}"`,
        'color: #2e6c6e; font-weight: bold; background-color: #f0f9ff; padding: 2px 6px; border-radius: 4px;',
        {
          type: queryAnalysis.type,
          businessName: queryAnalysis.businessName,
          location: queryAnalysis.location,
          hasUserLocation: !!(userLat && userLon),
          userCoords: userLat && userLon ? { lat: userLat, lon: userLon } : 'Not available'
        }
      );

      // Warn if searching without location
      if (!userLat || !userLon) {
        console.warn(
          `%c[Search Warning] Searching without user location - results may be from anywhere in the world!`,
          'color: #d97706; font-weight: bold; background-color: #fef3c7; padding: 2px 6px; border-radius: 4px;',
          'Enable location permissions for better results.'
        );
      }

      if (queryAnalysis.type === 'business_location_proposal' && queryAnalysis.location && queryAnalysis.businessName) {
        const [smartResults, textResults] = await Promise.all([
            (async () => {
                try {
                  incrementGeoapifyCount(); logGeoapifyCount();
                  const geocodeData = await callGeoapifyProxy({
                    apiType: 'geocode',
                    text: queryAnalysis.location!,
                    limit: 1
                  });
                  
                  if (!geocodeData.features || geocodeData.features.length === 0) return [];
                  const { lat, lon } = geocodeData.features[0].properties;
                  
                  incrementGeoapifyCount(); logGeoapifyCount();
                  const smartData = await callGeoapifyProxy({
                    apiType: 'geocode',
                    text: queryAnalysis.businessName!,
                    type: 'amenity',
                    limit: 20,
                    filter: `circle:${lon},${lat},50000`,
                    bias: `proximity:${lon},${lat}`
                  });
                  
                  return smartData.features || [];
                } catch (error) {
                  console.error('Smart search failed:', error);
                  return [];
                }
            })(),
            (async () => {
                try {
                  incrementGeoapifyCount(); logGeoapifyCount();
                  const textRequestData: any = {
                    apiType: 'geocode',
                    text: query,
                    type: 'amenity',
                    limit: 20
                  };

                  // Add geographic filtering to the fallback text search too
                  if (userLat && userLon) {
                    textRequestData.filter = `circle:${userLon},${userLat},40000`;
                    textRequestData.bias = `proximity:${userLon},${userLat}`;
                  }

                  const textData = await callGeoapifyProxy(textRequestData);
                  return textData.features || [];
                } catch (error) {
                  console.error('Text search failed:', error);
                  return [];
                }
            })()
        ]);
        const combined = [...smartResults, ...textResults];
        rawApiFeatures = combined.filter((result, index, self) => index === self.findIndex(r => r.properties.place_id === result.properties.place_id));
      } else {
        try {
          incrementGeoapifyCount(); logGeoapifyCount();
          const requestData: any = {
            apiType: 'geocode',
            text: query,
            type: 'amenity',
            limit: 20
          };

          // Add geographic filtering when user location is available
          if (userLat && userLon) {
            // Filter to results within 40km (25 miles) radius of user
            // This prevents getting results from other countries/states
            requestData.filter = `circle:${userLon},${userLat},40000`;
            // Also bias results to prioritize closer locations
            requestData.bias = `proximity:${userLon},${userLat}`;

            console.log(
              `%c[Geographic Filter] Searching within 25 miles of user location`,
              'color: #059669; font-weight: bold; background-color: #f0fdf4; padding: 2px 6px; border-radius: 4px;',
              { lat: userLat, lon: userLon, radiusKm: 40 }
            );
          }

          const fuzzyData = await callGeoapifyProxy(requestData);
          rawApiFeatures = fuzzyData.features || [];
        } catch (error) {
          console.error('Simple search failed:', error);
          throw new Error(`Search API failed: ${error}`);
        }
      }
      
      const apiPlaces: GeoapifyPlace[] = rawApiFeatures
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((f: any) => f && f.properties && f.properties.place_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((f: any) => {
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
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Search aborted');
        return [];
      }
      console.error('Error searching restaurants:', err);
      throw new Error(`Search failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      this.abortController = null;
    }
  }

  public async getRestaurantDetails(placeId: string): Promise<GeoapifyPlaceDetails | null> {
    try {
      incrementGeoapifyCount();
      logGeoapifyCount();
      
      const detailsData = await callGeoapifyProxy({
        apiType: 'place-details',
        placeId: placeId
      });

      if (!detailsData.features || detailsData.features.length === 0) {
        throw new Error('No details found for this place');
      }

      const feature = detailsData.features[0];
      return { place_id: feature.properties.place_id, properties: { ...feature.properties } };
    } catch (err: unknown) {
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