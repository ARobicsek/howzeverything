// src/services/searchService.ts
import { supabase } from '../supabaseClient';
import { GeoapifyPlace, GeoapifyPlaceDetails } from '../types/restaurantSearch';
import { parseAddress } from '../utils/addressParser';
import { incrementGeoapifyCount, logGeoapifyCount } from '../utils/apiCounter';
import { analyzeQuery } from '../utils/queryAnalysis';
import { calculateEnhancedSimilarity, normalizeText } from '../utils/textUtils';

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

      // Store target location for ranking (either from explicit mention or user location)
      let targetLat: number | null = userLat;
      let targetLon: number | null = userLon;
      let mentionedLocation: string | null = null;

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

                  // Store the target location for ranking purposes
                  targetLat = lat;
                  targetLon = lon;
                  mentionedLocation = queryAnalysis.location!.toLowerCase();

                  // Use Places API v2 for better restaurant discovery in the specified location
                  incrementGeoapifyCount(); logGeoapifyCount();
                  const placesData = await callGeoapifyProxy({
                    apiType: 'places',
                    latitude: lat,
                    longitude: lon,
                    radiusInMeters: 80000, // 80km = ~50 miles to capture metro area
                    categories: 'catering', // Use parent category to include all food/dining establishments
                    limit: 50,
                    bias: `proximity:${lon},${lat}`
                  });

                  // Also try geocoding API as fallback
                  incrementGeoapifyCount(); logGeoapifyCount();
                  const geocodeResults = await callGeoapifyProxy({
                    apiType: 'geocode',
                    text: queryAnalysis.businessName!,
                    type: 'amenity',
                    limit: 20,
                    filter: `circle:${lon},${lat},80000`, // Increased from 50km to 80km
                    bias: `proximity:${lon},${lat}`
                  });

                  return [...(placesData.features || []), ...(geocodeResults.features || [])];
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
          // Try multiple search strategies to find the restaurant
          const searchStrategies = [];

          // Strategy 1: Use Places API v2 (best for finding restaurants/cafes)
          // This is specifically designed for POI discovery
          if (userLat && userLon) {
            incrementGeoapifyCount(); logGeoapifyCount();
            const placesRequest: any = {
              apiType: 'places',
              latitude: userLat,
              longitude: userLon,
              radiusInMeters: 40000, // 40km = 25 miles
              categories: 'catering', // Use parent category to include all food/dining establishments
              limit: 50,
              bias: `proximity:${userLon},${userLat}`
            };
            searchStrategies.push(
              callGeoapifyProxy(placesRequest)
                .then(data => ({ source: 'places', data }))
                .catch(error => {
                  console.error('Places API search failed:', error);
                  return { source: 'places', data: { features: [] } };
                })
            );
          }

          // Strategy 2: Geocoding API with type=amenity (fallback)
          incrementGeoapifyCount(); logGeoapifyCount();
          const amenityRequest: any = {
            apiType: 'geocode',
            text: query,
            type: 'amenity',
            limit: 20
          };
          if (userLat && userLon) {
            amenityRequest.filter = `circle:${userLon},${userLat},40000`;
            amenityRequest.bias = `proximity:${userLon},${userLat}`;
          }
          searchStrategies.push(
            callGeoapifyProxy(amenityRequest)
              .then(data => ({ source: 'geocode-amenity', data }))
              .catch(error => {
                console.error('Geocode amenity search failed:', error);
                return { source: 'geocode-amenity', data: { features: [] } };
              })
          );

          // Strategy 3: Broader geocoding search without type restriction
          incrementGeoapifyCount(); logGeoapifyCount();
          const broadRequest: any = {
            apiType: 'geocode',
            text: query,
            limit: 20
          };
          if (userLat && userLon) {
            broadRequest.filter = `circle:${userLon},${userLat},40000`;
            broadRequest.bias = `proximity:${userLon},${userLat}`;
          }
          searchStrategies.push(
            callGeoapifyProxy(broadRequest)
              .then(data => ({ source: 'geocode-broad', data }))
              .catch(error => {
                console.error('Broad geocode search failed:', error);
                return { source: 'geocode-broad', data: { features: [] } };
              })
          );

          // Execute all strategies in parallel
          const results = await Promise.all(searchStrategies);

          // Combine and deduplicate results
          const combinedFeatures: any[] = [];
          for (const result of results) {
            if (result.data.features) {
              combinedFeatures.push(...result.data.features);
            }
          }

          // Filter by query match for Places API results (which returns ALL nearby restaurants)
          // Use flexible word-based matching instead of strict substring matching
          const queryLower = normalizeText(query);
          const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

          const filteredFeatures = combinedFeatures.filter((feature: any) => {
            const name = normalizeText(feature.properties?.name || '');
            const datasource = feature.properties?.datasource?.sourcename;

            // For Geocode API results, keep all (already filtered by query)
            if (datasource && datasource !== 'openstreetmap') {
              return true;
            }

            // For Places API and OpenStreetMap results, filter by name match
            // Check if all query words appear in the name (flexible matching)
            const nameWords = name.split(/\s+/);
            const matchCount = queryWords.filter(queryWord =>
              nameWords.some(nameWord => nameWord.includes(queryWord) || queryWord.includes(nameWord))
            ).length;

            // Require at least 80% of query words to match
            // This allows "Cafe Landwer" to match "Landwer Cafe" or "Café Landwer"
            const matchPercentage = (matchCount / queryWords.length) * 100;
            return matchPercentage >= 80;
          });

          // Deduplicate by place_id
          const seenPlaceIds = new Set();
          rawApiFeatures = filteredFeatures.filter((feature: any) => {
            if (seenPlaceIds.has(feature.properties.place_id)) {
              return false;
            }
            seenPlaceIds.add(feature.properties.place_id);
            return true;
          });

          console.log(
            `%c[Search Strategy] Used Places API + Geocoding API for comprehensive search`,
            'color: #059669; font-weight: bold; background-color: #f0fdf4; padding: 2px 6px; border-radius: 4px;',
            {
              query,
              lat: userLat,
              lon: userLon,
              radiusKm: 40,
              strategiesUsed: searchStrategies.length,
              totalResults: rawApiFeatures.length,
              results: results.map(r => ({ source: r.source, count: r.data.features?.length || 0 }))
            }
          );
        } catch (error) {
          console.error('Search failed:', error);
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

      // Helper function to calculate distance in km between two points
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      // Helper function to check if a place matches the mentioned location
      const matchesLocation = (place: GeoapifyPlace, locationQuery: string | null): boolean => {
        if (!locationQuery) return false;

        const normalized = locationQuery.toLowerCase();
        const city = place.properties.city?.toLowerCase() || '';
        const state = place.properties.state?.toLowerCase() || '';
        const formatted = place.properties.formatted?.toLowerCase() || '';

        // Check if the mentioned location appears in city, state, or formatted address
        return city.includes(normalized) ||
               normalized.includes(city) ||
               state.includes(normalized) ||
               normalized.includes(state) ||
               formatted.includes(normalized);
      };

      // Helper function to calculate relevance score
      const calculateRelevanceScore = (
        nameSimilarity: number,
        isFromDatabase: boolean,
        distanceKm: number | null,
        locationMatch: boolean = false
      ): number => {
        // Start with name similarity (0-100)
        let score = nameSimilarity;

        // Add bonus for database entries (they're already in our system)
        if (isFromDatabase) {
          score += 10; // Small boost for existing restaurants
        }

        // Strong bonus for matching explicitly mentioned location
        if (locationMatch) {
          score += 30; // Significantly boost results in the mentioned location
        }

        // Apply distance penalty if location is available
        if (distanceKm !== null) {
          // Closer is better: full score for <5km, decreasing penalty up to 40km
          const distancePenalty = Math.min(20, (distanceKm / 40) * 20);
          score -= distancePenalty;
        }

        return score;
      };

      // Create database matches with scores preserved
      interface ScoredPlace extends GeoapifyPlace {
        relevanceScore: number;
        nameSimilarity: number;
      }

      const dbMatches: ScoredPlace[] = (allDbRestaurants || [])
        .map(r => {
          const nameSimilarity = calculateEnhancedSimilarity(r.name, query);
          const distanceKm = (targetLat && targetLon && r.latitude && r.longitude)
            ? calculateDistance(targetLat, targetLon, r.latitude, r.longitude)
            : null;

          // Create place object for location matching
          const place: GeoapifyPlace = {
            place_id: `db_${r.id}`,
            properties: {
              name: r.name,
              formatted: r.full_address || [r.address, r.city, r.state, r.zip_code].filter(Boolean).join(', '),
              address_line1: r.address || undefined,
              city: r.city || undefined,
              state: r.state || undefined,
              postcode: r.zip_code || undefined,
              country: r.country || undefined,
              lat: r.latitude || 0,
              lon: r.longitude || 0,
              categories: ['database'],
              datasource: { sourcename: 'database', attribution: 'Our Database' }
            }
          };

          const locationMatch = matchesLocation(place, mentionedLocation);
          const relevanceScore = calculateRelevanceScore(nameSimilarity, true, distanceKm, locationMatch);

          return {
            ...place,
            relevanceScore,
            nameSimilarity
          };
        })
        .filter(item => item.nameSimilarity > 60); // Only include decent matches

      // Deduplicate API places and calculate scores
      const uniqueApiPlaces: ScoredPlace[] = [];
      for (const apiPlace of apiPlaces) {
          const isDuplicateOfDb = dbMatches.some(dbMatch =>
            calculateEnhancedSimilarity(dbMatch.properties.name, apiPlace.properties.name) > 95 &&
            calculateEnhancedSimilarity(
              dbMatch.properties.address_line1 || dbMatch.properties.formatted,
              apiPlace.properties.address_line1 || apiPlace.properties.formatted
            ) > 70
          );
          if (isDuplicateOfDb) continue;

          const existingMatchIndex = uniqueApiPlaces.findIndex(uniquePlace =>
            calculateEnhancedSimilarity(uniquePlace.properties.name, apiPlace.properties.name) > 95 &&
            calculateEnhancedSimilarity(
              uniquePlace.properties.address_line1 || uniquePlace.properties.formatted,
              apiPlace.properties.address_line1 || apiPlace.properties.formatted
            ) > 80
          );

          if (existingMatchIndex !== -1) {
              const existingPlace = uniqueApiPlaces[existingMatchIndex];
              const isNewPlaceBetter = (apiPlace.properties.address_line1 && !existingPlace.properties.address_line1) ||
                                       (apiPlace.properties.formatted.length > existingPlace.properties.formatted.length);
              if (isNewPlaceBetter) {
                uniqueApiPlaces[existingMatchIndex] = {
                  ...apiPlace,
                  relevanceScore: existingPlace.relevanceScore,
                  nameSimilarity: existingPlace.nameSimilarity
                } as ScoredPlace;
              }
          } else {
              // Calculate score for API place
              const nameSimilarity = calculateEnhancedSimilarity(apiPlace.properties.name, query);
              const distanceKm = (targetLat && targetLon && apiPlace.properties.lat && apiPlace.properties.lon)
                ? calculateDistance(targetLat, targetLon, apiPlace.properties.lat, apiPlace.properties.lon)
                : null;
              const locationMatch = matchesLocation(apiPlace, mentionedLocation);
              const relevanceScore = calculateRelevanceScore(nameSimilarity, false, distanceKm, locationMatch);

              uniqueApiPlaces.push({
                ...apiPlace,
                relevanceScore,
                nameSimilarity
              } as ScoredPlace);
          }
      }

      // Combine all results and sort by relevance score (highest first)
      const combinedResults = [...dbMatches, ...uniqueApiPlaces]
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Log scoring for debugging
      console.log(
        `%c[Search Ranking] Sorted ${combinedResults.length} results by relevance`,
        'color: #7c3aed; font-weight: bold; background-color: #faf5ff; padding: 2px 6px; border-radius: 4px;',
        {
          query,
          mentionedLocation,
          rankingBasedOn: mentionedLocation ? `Mentioned location: "${mentionedLocation}"` : 'User location',
          topResults: combinedResults.slice(0, 5).map(r => ({
            name: r.properties.name,
            city: r.properties.city,
            state: r.properties.state,
            score: r.relevanceScore.toFixed(1),
            nameSimilarity: r.nameSimilarity.toFixed(1),
            source: r.properties.datasource?.sourcename || 'api',
            locationMatch: matchesLocation(r, mentionedLocation),
            distance: targetLat && targetLon ?
              calculateDistance(targetLat, targetLon, r.properties.lat, r.properties.lon).toFixed(1) + 'km' :
              'unknown'
          }))
        }
      );

      // Remove scoring metadata before returning
      const finalResults: GeoapifyPlace[] = combinedResults.map(({ relevanceScore, nameSimilarity, ...place }) => place);

      this.cache.set(cacheKey, finalResults);
      return finalResults;
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