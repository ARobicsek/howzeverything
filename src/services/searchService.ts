// src/services/searchService.ts
import { supabase } from '../supabaseClient';
import { GeoapifyPlace, GeoapifyPlaceDetails } from '../types/restaurantSearch';
import { parseAddress } from '../utils/addressParser';
import { incrementGeoapifyCount, logGeoapifyCount } from '../utils/apiCounter';
import { analyzeQuery } from '../utils/queryAnalysis';
import { calculateEnhancedSimilarity, normalizeText } from '../utils/textUtils';

// Helper function to call the secure Geoapify proxy (used for geocoding + fallback)
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

// Helper function to call the secure Foursquare proxy
async function callFoursquareProxy(requestData: any): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const response = await fetch(`${supabaseUrl}/functions/v1/foursquare-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Foursquare API request failed with status ${response.status}`);
  }

  return await response.json();
}

// Convert a Foursquare result to our internal GeoapifyPlace format
function convertFoursquareResult(result: any): GeoapifyPlace | null {
  if (!result.name) return null;

  const loc = result.location || {};

  // New API: lat/lon at top level; old API: nested under geocodes.main
  const lat = result.latitude ?? result.geocodes?.main?.latitude ?? 0;
  const lon = result.longitude ?? result.geocodes?.main?.longitude ?? 0;

  // Build formatted address from location parts
  const formatted = loc.formatted_address
    || [loc.address, loc.locality, loc.region, loc.postcode, loc.country].filter(Boolean).join(', ')
    || result.name;

  return {
    place_id: result.fsq_place_id || result.fsq_id,
    properties: {
      name: result.name,
      formatted,
      address_line1: loc.address || undefined,
      city: loc.locality || undefined,
      state: loc.region || undefined,
      postcode: loc.postcode || undefined,
      country: loc.country || undefined,
      country_code: loc.country_code || undefined,
      lat,
      lon,
      categories: (result.categories || []).map((c: any) => c.name || 'Restaurant'),
      website: result.website || undefined,
      phone: result.tel || undefined,
      contact: {
        website: result.website || undefined,
        phone: result.tel || undefined,
      },
      datasource: {
        sourcename: 'foursquare',
        attribution: 'Foursquare',
      },
    },
  };
}

// Fallback: run the old Geoapify multi-strategy search
async function geoapifyFallbackSearch(
  query: string,
  userLat: number | null,
  userLon: number | null
): Promise<GeoapifyPlace[]> {
  console.log(
    '%c[Fallback] Using Geoapify search',
    'color: #d97706; font-weight: bold; background-color: #fef3c7; padding: 2px 6px; border-radius: 4px;'
  );

  const rawFeatures: any[] = [];

  // Strategy 1: Geocode API with type=amenity
  incrementGeoapifyCount(); logGeoapifyCount();
  const amenityRequest: any = {
    apiType: 'geocode',
    text: query,
    type: 'amenity',
    limit: 100,
  };
  if (userLat && userLon) {
    amenityRequest.filter = `circle:${userLon},${userLat},40000`;
    amenityRequest.bias = `proximity:${userLon},${userLat}`;
  }

  try {
    const amenityData = await callGeoapifyProxy(amenityRequest);
    if (amenityData.features) rawFeatures.push(...amenityData.features);
  } catch (e) {
    console.error('Geoapify amenity fallback failed:', e);
  }

  // Strategy 2: Broad geocoding
  incrementGeoapifyCount(); logGeoapifyCount();
  const broadRequest: any = {
    apiType: 'geocode',
    text: query,
    limit: 100,
  };
  if (userLat && userLon) {
    broadRequest.filter = `circle:${userLon},${userLat},40000`;
    broadRequest.bias = `proximity:${userLon},${userLat}`;
  }

  try {
    const broadData = await callGeoapifyProxy(broadRequest);
    if (broadData.features) rawFeatures.push(...broadData.features);
  } catch (e) {
    console.error('Geoapify broad fallback failed:', e);
  }

  // Deduplicate by place_id and filter by name
  const queryWords = normalizeText(query).split(/\s+/).filter(w => w.length > 0);
  const seen = new Set<string>();

  return rawFeatures
    .filter((f: any) => {
      if (!f?.properties?.place_id || !f.properties.name) return false;
      if (seen.has(f.properties.place_id)) return false;
      seen.add(f.properties.place_id);

      const name = normalizeText(f.properties.name);
      const nameWords = name.split(/\s+/);
      const matchCount = queryWords.filter(qw =>
        nameWords.some(nw => nw.includes(qw) || qw.includes(nw))
      ).length;
      return (matchCount / queryWords.length) * 100 >= 50;
    })
    .map((f: any) => {
      const props = f.properties;
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
      return {
        place_id: props.place_id,
        properties: { ...props, address_line1: cleanAddress, city: cleanCity },
      } as GeoapifyPlace;
    })
    .filter((p): p is GeoapifyPlace => p !== null);
}


const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_ENTRIES = 50;

interface CacheEntry {
  data: GeoapifyPlace[];
  timestamp: number;
}

export class SearchService {
  private abortController: AbortController | null = null;
  private cache = new Map<string, CacheEntry>();

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

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required for restaurant search');
      }

      const queryAnalysis = analyzeQuery(query);

      // Store target location for ranking
      let targetLat: number | null = userLat;
      let targetLon: number | null = userLon;
      let mentionedLocation: string | null = null;

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

      if (!userLat || !userLon) {
        console.warn(
          `%c[Search Warning] Searching without user location - results may be less relevant`,
          'color: #d97706; font-weight: bold; background-color: #fef3c7; padding: 2px 6px; border-radius: 4px;'
        );
      }

      // --- Determine search strategy ---
      let searchQuery = query;
      let searchNear: string | null = null; // Foursquare `near` param (text location)
      let searchLat = userLat;
      let searchLon = userLon;
      let searchRadius = 40000; // 40km default

      if (queryAnalysis.type === 'business_location_proposal' && queryAnalysis.location && queryAnalysis.businessName) {
        searchQuery = queryAnalysis.businessName;
        mentionedLocation = queryAnalysis.location.toLowerCase();

        if (queryAnalysis.locationType === 'street') {
          // Street-level search: include street name in query so Foursquare matches across address fields
          searchQuery = `${queryAnalysis.businessName} ${queryAnalysis.streetName || queryAnalysis.location}`;
          mentionedLocation = queryAnalysis.streetName?.toLowerCase() || mentionedLocation;
          console.log(
            `%c[Street Search] query="${searchQuery}" (business + street name)`,
            'color: #0891b2; font-weight: bold; background-color: #cffafe; padding: 2px 6px; border-radius: 4px;'
          );
        } else {
          // City/area search: let Foursquare geocode via `near` param (no Geoapify call needed)
          searchNear = queryAnalysis.location;
          searchLat = null;
          searchLon = null;
          console.log(
            `%c[Location Search] Using Foursquare near="${searchNear}"`,
            'color: #0891b2; font-weight: bold; background-color: #cffafe; padding: 2px 6px; border-radius: 4px;'
          );
        }
      }

      // --- Primary search: Foursquare ---
      let apiPlaces: GeoapifyPlace[] = [];

      const doFoursquareSearch = async (fsqQuery: string, near: string | null, lat: number | null, lon: number | null, radius: number): Promise<GeoapifyPlace[]> => {
        const fsqRequest: any = {
          apiType: 'search',
          query: fsqQuery,
          categories: '13000', // Dining and Drinking
          limit: 50,
        };

        if (near) {
          fsqRequest.near = near;
        } else if (lat && lon) {
          fsqRequest.ll = `${lat},${lon}`;
          fsqRequest.radius = radius;
        }

        console.log(
          `%c[Foursquare Search] query="${fsqQuery}"${near ? ` near="${near}"` : ` ll=${lat},${lon} radius=${radius}`}`,
          'color: #7c3aed; font-weight: bold; background-color: #faf5ff; padding: 2px 6px; border-radius: 4px;'
        );

        const fsqData = await callFoursquareProxy(fsqRequest);
        const fsqResults = fsqData.results || [];

        const places = fsqResults
          .map(convertFoursquareResult)
          .filter((p: GeoapifyPlace | null): p is GeoapifyPlace => p !== null);

        console.log(
          `%c[Foursquare Search] Found ${places.length} results`,
          'color: #059669; font-weight: bold; background-color: #f0fdf4; padding: 2px 6px; border-radius: 4px;',
          { query: fsqQuery, near, lat, lon, resultCount: places.length }
        );

        return places;
      };

      try {
        apiPlaces = await doFoursquareSearch(searchQuery, searchNear, searchLat, searchLon, searchRadius);

        // Retry: if few results and query has 2+ words without a detected location,
        // split off the last word as a `near` hint and retry
        if (apiPlaces.length < 3 && !searchNear && queryAnalysis.type === 'business') {
          const words = query.trim().split(/\s+/);
          if (words.length >= 2) {
            const retryQuery = words.slice(0, -1).join(' ');
            const retryNear = words[words.length - 1];
            console.log(
              `%c[Foursquare Retry] Few results, trying query="${retryQuery}" near="${retryNear}"`,
              'color: #d97706; font-weight: bold; background-color: #fef3c7; padding: 2px 6px; border-radius: 4px;'
            );
            try {
              const retryPlaces = await doFoursquareSearch(retryQuery, retryNear, null, null, searchRadius);
              if (retryPlaces.length > apiPlaces.length) {
                apiPlaces = retryPlaces;
                mentionedLocation = retryNear.toLowerCase();
              }
            } catch (retryError) {
              console.warn('Foursquare retry failed, keeping original results:', retryError);
            }
          }
        }

      } catch (fsqError) {
        console.error('Foursquare search failed, falling back to Geoapify:', fsqError);
        apiPlaces = await geoapifyFallbackSearch(query, userLat, userLon);
      }

      // When we used `near` instead of coordinates, derive target location from results for scoring
      if (searchNear && apiPlaces.length > 0 && !targetLat) {
        const firstWithCoords = apiPlaces.find(p => p.properties.lat && p.properties.lon);
        if (firstWithCoords) {
          targetLat = firstWithCoords.properties.lat;
          targetLon = firstWithCoords.properties.lon;
        }
      }

      // --- Database search ---
      const { data: allDbRestaurants } = await supabase
        .from('restaurants')
        .select('id, name, full_address, address, city, state, zip_code, country, latitude, longitude')
        .ilike('name', `%${query}%`);

      // --- Scoring and ranking ---

      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const matchesLocation = (place: GeoapifyPlace, locationQuery: string | null): number => {
        if (!locationQuery) return 0;

        const normalized = locationQuery.toLowerCase();
        const city = place.properties.city?.toLowerCase() || '';
        const state = place.properties.state?.toLowerCase() || '';
        const formatted = place.properties.formatted?.toLowerCase() || '';
        const street = place.properties.address_line1?.toLowerCase() || '';

        let matchScore = 0;

        if (city.includes(normalized) || normalized.includes(city)) {
          matchScore += 100;
        } else if (formatted.includes(normalized)) {
          matchScore += 80;
        }

        const locationWords = normalized.split(/\s+/).filter(word =>
          word.length > 2 && !['in', 'at', 'on', 'near', 'by', 'the'].includes(word)
        );

        for (const word of locationWords) {
          if (city.includes(word) || word.includes(city)) {
            matchScore = Math.max(matchScore, 100);
          }
          if (state.includes(word) || word.includes(state)) {
            matchScore = Math.max(matchScore, 90);
          }
          if (street.includes(word)) {
            matchScore = Math.max(matchScore, 70);
          }
          if (formatted.includes(word) && matchScore < 70) {
            matchScore = Math.max(matchScore, 50);
          }
        }

        return matchScore;
      };

      const calculateRelevanceScore = (
        nameSimilarity: number,
        isFromDatabase: boolean,
        distanceKm: number | null,
        locationMatchScore: number = 0,
        hasExplicitLocation: boolean = false
      ): number => {
        let score = nameSimilarity;

        if (isFromDatabase) {
          score += 10;
        }

        if (locationMatchScore > 0) {
          const locationBonus = (locationMatchScore / 100) * 50;
          score += locationBonus;
        }

        if (distanceKm !== null) {
          if (hasExplicitLocation && locationMatchScore >= 70) {
            // No distance penalty - user explicitly wants results in this location
          } else if (hasExplicitLocation && locationMatchScore > 0) {
            const distancePenalty = Math.min(15, (distanceKm / 80) * 15);
            score -= distancePenalty;
          } else {
            const distancePenalty = Math.min(20, (distanceKm / 40) * 20);
            score -= distancePenalty;
          }
        }

        return score;
      };

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
            true,
            distanceKm,
            locationMatchScore,
            !!mentionedLocation
          );

          return {
            ...place,
            relevanceScore,
            nameSimilarity
          };
        })
        .filter(item => item.nameSimilarity > 60);

      // Deduplicate API places against DB and each other
      const uniqueApiPlaces: ScoredPlace[] = [];
      for (const apiPlace of apiPlaces) {
          const isDuplicateOfDb = dbMatches.some(dbMatch => {
            if (calculateEnhancedSimilarity(dbMatch.properties.name, apiPlace.properties.name) <= 95) return false;
            if (dbMatch.properties.lat && dbMatch.properties.lon && apiPlace.properties.lat && apiPlace.properties.lon) {
              return calculateDistance(dbMatch.properties.lat, dbMatch.properties.lon, apiPlace.properties.lat, apiPlace.properties.lon) <= 0.2;
            }
            return calculateEnhancedSimilarity(
              dbMatch.properties.address_line1 || dbMatch.properties.formatted,
              apiPlace.properties.address_line1 || apiPlace.properties.formatted
            ) > 70;
          });
          if (isDuplicateOfDb) continue;

          const existingMatchIndex = uniqueApiPlaces.findIndex(uniquePlace => {
            if (calculateEnhancedSimilarity(uniquePlace.properties.name, apiPlace.properties.name) <= 95) return false;
            if (uniquePlace.properties.lat && uniquePlace.properties.lon && apiPlace.properties.lat && apiPlace.properties.lon) {
              return calculateDistance(uniquePlace.properties.lat, uniquePlace.properties.lon, apiPlace.properties.lat, apiPlace.properties.lon) <= 0.2;
            }
            return calculateEnhancedSimilarity(
              uniquePlace.properties.address_line1 || uniquePlace.properties.formatted,
              apiPlace.properties.address_line1 || apiPlace.properties.formatted
            ) > 80;
          });

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
              const nameSimilarity = calculateEnhancedSimilarity(apiPlace.properties.name, query);
              const distanceKm = (targetLat && targetLon && apiPlace.properties.lat && apiPlace.properties.lon)
                ? calculateDistance(targetLat, targetLon, apiPlace.properties.lat, apiPlace.properties.lon)
                : null;
              const locationMatchScore = matchesLocation(apiPlace, mentionedLocation);
              const relevanceScore = calculateRelevanceScore(
                nameSimilarity,
                false,
                distanceKm,
                locationMatchScore,
                !!mentionedLocation
              );

              uniqueApiPlaces.push({
                ...apiPlace,
                relevanceScore,
                nameSimilarity
              } as ScoredPlace);
          }
      }

      // Combine and sort by relevance
      const combinedResults = [...dbMatches, ...uniqueApiPlaces]
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

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

      const finalResults: GeoapifyPlace[] = combinedResults.map(({ relevanceScore, nameSimilarity, ...place }) => place);

      // Evict oldest entries if cache is full
      if (this.cache.size >= CACHE_MAX_ENTRIES) {
        const oldest = [...this.cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) this.cache.delete(oldest[0]);
      }
      this.cache.set(cacheKey, { data: finalResults, timestamp: Date.now() });
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
      // Use Foursquare details for Foursquare place IDs, Geoapify for legacy IDs
      // Geoapify IDs contain dots; Foursquare IDs are hex strings or fsq_ prefixed
      const isGeoapifyId = placeId.includes('.');
      const isDbId = placeId.startsWith('db_');
      if (!isGeoapifyId && !isDbId) {
        // Foursquare place ID
        const data = await callFoursquareProxy({
          apiType: 'details',
          place_id: placeId,
        });

        if (!data || !data.name) {
          throw new Error('No details found for this place');
        }

        const loc = data.location || {};
        const lat = data.latitude ?? data.geocodes?.main?.latitude ?? 0;
        const lon = data.longitude ?? data.geocodes?.main?.longitude ?? 0;
        const formatted = loc.formatted_address
          || [loc.address, loc.locality, loc.region, loc.postcode, loc.country].filter(Boolean).join(', ')
          || data.name;

        return {
          place_id: data.fsq_place_id || data.fsq_id || placeId,
          properties: {
            name: data.name,
            formatted,
            address_line1: loc.address || undefined,
            city: loc.locality || undefined,
            state: loc.region || undefined,
            postcode: loc.postcode || undefined,
            country: loc.country || undefined,
            lat,
            lon,
            categories: (data.categories || []).map((c: any) => c.name || 'Restaurant'),
            website: data.website || undefined,
            phone: data.tel || undefined,
            opening_hours: data.hours || undefined,
            contact: {
              website: data.website || undefined,
              phone: data.tel || undefined,
            },
            datasource: {
              sourcename: 'foursquare',
              attribution: 'Foursquare',
            },
          },
        };
      }

      // Legacy Geoapify place ID
      incrementGeoapifyCount();
      logGeoapifyCount();

      const detailsData = await callGeoapifyProxy({
        apiType: 'place-details',
        placeId: placeId,
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
