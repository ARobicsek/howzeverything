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
        // When user specifies location explicitly (e.g., "Starbucks in Boston"),
        // use targeted search around that location only
        try {
          incrementGeoapifyCount(); logGeoapifyCount();
          const geocodeData = await callGeoapifyProxy({
            apiType: 'geocode',
            text: queryAnalysis.location!,
            limit: 1
          });

          if (!geocodeData.features || geocodeData.features.length === 0) {
            rawApiFeatures = [];
          } else {
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

            // Also try geocoding API for the business name around the specified location
            incrementGeoapifyCount(); logGeoapifyCount();
            const geocodeResults = await callGeoapifyProxy({
              apiType: 'geocode',
              text: queryAnalysis.businessName!,
              type: 'amenity',
              limit: 20,
              filter: `circle:${lon},${lat},80000`, // Search within 80km of mentioned location
              bias: `proximity:${lon},${lat}`
            });

            const combined = [...(placesData.features || []), ...(geocodeResults.features || [])];
            rawApiFeatures = combined.filter((result, index, self) => index === self.findIndex(r => r.properties.place_id === result.properties.place_id));
          }
        } catch (error) {
          console.error('Location-specific search failed:', error);
          rawApiFeatures = [];
        }
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

          // Debug: Log Places API results for "landwer" searches
          if (queryLower.includes('landwer')) {
            const placesApiResults = combinedFeatures.filter(f => f.properties?.datasource?.sourcename === 'openstreetmap');
            console.log(
              `%c[Places API] Found ${placesApiResults.length} results from Places API (before name filtering)`,
              'color: #0891b2; background-color: #cffafe; padding: 2px 6px; border-radius: 4px;',
              placesApiResults.map(f => ({ name: f.properties.name, address: f.properties.formatted, categories: f.properties.categories }))
            );
          }

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
            const matches = matchPercentage >= 80;

            // Debug logging for filtering
            if (!matches && name.includes('landwer')) {
              console.log(
                `%c[Name Filter] Excluded: "${feature.properties?.name}" at ${feature.properties?.formatted}`,
                'color: #dc2626; background-color: #fee2e2; padding: 2px 6px; border-radius: 4px;',
                { matchPercentage: matchPercentage.toFixed(1), queryWords, nameWords, datasource }
              );
            }

            return matches;
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
      // Returns a score from 0-100 indicating strength of location match
      const matchesLocation = (place: GeoapifyPlace, locationQuery: string | null): number => {
        if (!locationQuery) return 0;

        const normalized = locationQuery.toLowerCase();
        const city = place.properties.city?.toLowerCase() || '';
        const state = place.properties.state?.toLowerCase() || '';
        const formatted = place.properties.formatted?.toLowerCase() || '';
        const street = place.properties.address_line1?.toLowerCase() || '';

        let matchScore = 0;

        // Check for full location string match (strongest match)
        if (city.includes(normalized) || normalized.includes(city)) {
          matchScore += 100; // Perfect city match
        } else if (formatted.includes(normalized)) {
          matchScore += 80; // Full query appears in formatted address
        }

        // Check for partial matches by splitting location query into words
        // This handles cases like "skokie on dempster" where we want to match:
        // - "skokie" in the city
        // - "dempster" in the street address
        const locationWords = normalized.split(/\s+/).filter(word =>
          word.length > 2 && !['in', 'at', 'on', 'near', 'by', 'the'].includes(word)
        );

        for (const word of locationWords) {
          // City name match
          if (city.includes(word) || word.includes(city)) {
            matchScore = Math.max(matchScore, 100); // Promote to perfect match
          }
          // State match
          if (state.includes(word) || word.includes(state)) {
            matchScore = Math.max(matchScore, 90);
          }
          // Street name match (e.g., "dempster" in "4116 Dempster St")
          if (street.includes(word)) {
            matchScore = Math.max(matchScore, 70); // Good street-level match
          }
          // Formatted address contains the word
          if (formatted.includes(word) && matchScore < 70) {
            matchScore = Math.max(matchScore, 50); // Weak match, appears somewhere
          }
        }

        return matchScore;
      };

      // Helper function to calculate relevance score
      const calculateRelevanceScore = (
        nameSimilarity: number,
        isFromDatabase: boolean,
        distanceKm: number | null,
        locationMatchScore: number = 0, // 0-100 score from matchesLocation
        hasExplicitLocation: boolean = false // Whether user specified a location in query
      ): number => {
        // Start with name similarity (0-100)
        let score = nameSimilarity;

        // Add bonus for database entries (they're already in our system)
        if (isFromDatabase) {
          score += 10; // Small boost for existing restaurants
        }

        // Scaled bonus based on location match strength
        // Perfect city match (100): +50 points
        // Street match (70): +35 points
        // Weak match (50): +25 points
        if (locationMatchScore > 0) {
          const locationBonus = (locationMatchScore / 100) * 50;
          score += locationBonus;
        }

        // Apply distance penalty - but reduce it significantly when user specified explicit location
        // If searching "Starbucks in Skokie" from Boston, we care about Skokie results, not Boston proximity
        if (distanceKm !== null) {
          if (hasExplicitLocation && locationMatchScore >= 70) {
            // User specified location AND result matches it well - minimal distance penalty
            // Only penalize extreme distances (100km+)
            const distancePenalty = Math.min(10, Math.max(0, (distanceKm - 100) / 50));
            score -= distancePenalty;
          } else if (hasExplicitLocation && locationMatchScore > 0) {
            // User specified location, partial match - moderate distance penalty
            const distancePenalty = Math.min(15, (distanceKm / 80) * 15);
            score -= distancePenalty;
          } else {
            // No explicit location or no match - full distance penalty
            // Closer is better: full score for <5km, decreasing penalty up to 40km
            const distancePenalty = Math.min(20, (distanceKm / 40) * 20);
            score -= distancePenalty;
          }
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

          const locationMatchScore = matchesLocation(place, mentionedLocation);
          const relevanceScore = calculateRelevanceScore(
            nameSimilarity,
            true, // isFromDatabase
            distanceKm,
            locationMatchScore,
            !!mentionedLocation // hasExplicitLocation
          );

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
              const locationMatchScore = matchesLocation(apiPlace, mentionedLocation);
              const relevanceScore = calculateRelevanceScore(
                nameSimilarity,
                false, // isFromDatabase
                distanceKm,
                locationMatchScore,
                !!mentionedLocation // hasExplicitLocation
              );

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
          topResults: combinedResults.slice(0, 10).map(r => {
            const locationMatchScore = matchesLocation(r, mentionedLocation);
            const distance = targetLat && targetLon ?
              calculateDistance(targetLat, targetLon, r.properties.lat, r.properties.lon) : null;
            return {
              name: r.properties.name,
              address: r.properties.address_line1 || 'N/A',
              city: r.properties.city,
              state: r.properties.state,
              score: r.relevanceScore.toFixed(1),
              nameSimilarity: r.nameSimilarity.toFixed(1),
              locationMatchScore: locationMatchScore.toFixed(0),
              source: r.properties.datasource?.sourcename || 'api',
              distance: distance ? distance.toFixed(1) + 'km' : 'unknown'
            };
          })
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