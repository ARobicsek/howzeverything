// supabase/functions/dish-search/index.ts  
// 
// PERFORMANCE NOTE: For optimal database performance, ensure these indexes exist:
// 1. CREATE INDEX idx_restaurant_dishes_name_gin ON restaurant_dishes USING gin(name gin_trgm_ops);
// 2. CREATE INDEX idx_restaurant_dishes_active_rating ON restaurant_dishes(is_active, average_rating DESC);
// 3. CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude) WHERE latitude IS NOT NULL;
// 4. CREATE INDEX idx_dish_ratings_dish_id ON dish_ratings(dish_id);
//
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RawDishData {
  id: string;
  name: string;
  description?: string;
  restaurants?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
  dish_ratings?: Array<{
    rating: number;
    user_id: string;
  }>;
  [key: string]: unknown;
}

interface ProcessedDishData {
  id: string;
  name: string;
  description?: string;
  restaurant?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
  ratings: never[];
  comments: never[];
  photos: never[];
  total_ratings: number;
  average_rating: number;
  dateAdded: string;
  [key: string]: unknown;
}
// Import from shared search logic - using local copy to avoid Supabase deployment issues
import { checkCategorySearch, getAllRelatedTerms, getCategoryTerms, getExclusionTerms } from './search-logic.ts';

// Distance calculation function
function calculateDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}


// CORS headers for browser access  
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}


// --- TYPE DEFINITIONS ---  
/* interface DishSearchResultWithRestaurant {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_by: string | null;
  verified_by_restaurant: boolean;
  total_ratings: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  restaurant: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  // other relations
} */


const supabaseAdminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const securityCheck = async (req: Request, supabaseUrl: string, supabaseAnonKey: string): Promise<{ user: unknown; error: string | null }> => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { user: null, error: 'Missing Authorization header.' };
  }
   
  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
     
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return { user: null, error: 'Invalid token.' };
    }

    return { user, error: null };

  } catch {
      return { user: null, error: 'An error occurred during authentication.' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Set a timeout to prevent extremely long queries
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 30000); // 30 second timeout

  try {
    // --- SECURITY CHECK ---  
    const { error: authError } = await securityCheck(req, Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    if (authError) {
      return new Response(JSON.stringify({ error: authError }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { searchTerm, minRating, userLocation, maxDistance } = await req.json();


    // --- THE FIX: This function is now much lighter ---
    // It calculates stats from a minimal ratings payload and returns empty arrays for heavy data.
    const processRawDishes = (rawData: RawDishData[]): ProcessedDishData[] => {
      return (rawData || []).map((d: RawDishData): ProcessedDishData | null => {
        if (!d || !d.restaurants || !d.id) return null;
         
        // Destructure to separate the lightweight ratings from the main dish and restaurant data
        const { dish_ratings, restaurants, ...dishData } = d;


        // Calculate stats from the minimal ratings payload: [{rating: number}, ...]
        const ratings = dish_ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? ratings.reduce((sum: number, r: { rating: number; }) => sum + r.rating, 0) / totalRatings
          : 0;


        // Return a lightweight object. Comments and photos are not needed for discovery.
        return {
          ...dishData,
          restaurant: restaurants,
          ratings: [], // Send empty array to client to save bandwidth
          comments: [], // Send empty array
          photos: [], // Send empty array
          total_ratings: totalRatings, // Use freshly calculated value
          average_rating: Math.round(averageRating * 10) / 10, // Use freshly calculated value
          dateAdded: d.created_at,
        };
      }).filter((dish): dish is ProcessedDishData => dish !== null);
    };
     
    // --- THE FIX: The query is now much more efficient ---
    // It no longer fetches the full dish_comments or dish_photos tables.
    // It only fetches the 'rating' column from dish_ratings to calculate the average.
    let query = supabaseAdminClient
      .from('restaurant_dishes')
      .select(`
        *,
        restaurants!inner(id, name, latitude, longitude),
        dish_ratings(rating)
      `)
      .eq('is_active', true)
      .not('restaurants.latitude', 'is', null);


    const term = searchTerm?.trim();
    if (term && term.length > 1) {
      const allSearchTerms = new Set<string>();
      const exclusionTerms = new Set<string>();
     
      const isCategory = checkCategorySearch(term);
     
      // Performance optimization: only limit expansion for very short terms
      const shouldLimitExpansion = term.length < 4 && !isCategory;
      const maxTerms = shouldLimitExpansion ? 8 : (isCategory ? 50 : 30); // Increased limits to handle large cuisine families
     
      const needsContextFiltering = term.toLowerCase() === 'roll' || term.toLowerCase() === 'rolls' || term.toLowerCase() === 'bakery';
     
      const synonymTerms = getAllRelatedTerms(term, needsContextFiltering || term.toLowerCase() === 'bakery');
      const synonymLimit = shouldLimitExpansion ? 6 : synonymTerms.length; // No artificial limits for full terms
      synonymTerms.slice(0, synonymLimit).forEach(t => allSearchTerms.add(t));
     
      if (isCategory) {
        const categoryTerms = getCategoryTerms(term);
        // For categories, prioritize category terms over synonyms
        const availableSlots = Math.max(maxTerms - synonymTerms.length, 20); // Ensure at least 20 slots for category terms
        categoryTerms.slice(0, availableSlots).forEach(t => allSearchTerms.add(t));
      }
     
      if (needsContextFiltering || isCategory) {
        const excludeTerms = getExclusionTerms(term, allSearchTerms);
        excludeTerms.forEach(t => exclusionTerms.add(t));
      }
     
      const finalSearchTerms = Array.from(allSearchTerms).slice(0, maxTerms);
      
      // Performance logging
      console.log(`[DISH-SEARCH] Term: "${term}" | Category: ${isCategory} | Terms: ${finalSearchTerms.length}/${allSearchTerms.size} | Max: ${maxTerms}`);
      console.log(`[DISH-SEARCH-PERF] Final search terms: [${finalSearchTerms.join(', ')}]`);
     
      if (finalSearchTerms.length > 0) {
        console.time(`[PERF] Building OR filter with ${finalSearchTerms.length} terms`);
        const orFilter = finalSearchTerms
          .map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
          .join(',');
        console.timeEnd(`[PERF] Building OR filter with ${finalSearchTerms.length} terms`);
       
        console.time(`[PERF] Executing database query`);
        query = query.or(orFilter);
       
        if (exclusionTerms.size > 0) {
          Array.from(exclusionTerms).forEach(excludeTerm => {
            query = query.not('name', 'ilike', `%${excludeTerm}%`);
          });
        }
      }
    }


    if (minRating && minRating > 0) {
      query = query.gte('average_rating', minRating);
    }


    // Reduce query size for better performance - more aggressive limits to prevent timeouts
    const queryLimit = (userLocation && maxDistance && maxDistance > 0) ? 40 : 60;
    query = query.order('average_rating', { ascending: false }).limit(queryLimit);

    const { data, error } = await query;
    console.timeEnd(`[PERF] Executing database query`);
    if (error) throw error;
     
    let results = processRawDishes(data || []);

    // Apply distance filtering if userLocation and maxDistance are provided
    if (userLocation && maxDistance && maxDistance > 0) {
      results = results.filter((dish: ProcessedDishData) => {
        if (dish.restaurant?.latitude && dish.restaurant?.longitude) {
          const distance = calculateDistanceInMiles(
            userLocation.latitude,
            userLocation.longitude,
            dish.restaurant.latitude,
            dish.restaurant.longitude
          );
          return distance <= maxDistance;
        }
        return false;
      });
    }


    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[EDGE FUNCTION ERROR]', error);
    const isTimeout = error.name === 'AbortError';
    return new Response(JSON.stringify({ 
      error: isTimeout ? 'Search timed out - please try a more specific search term' : error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: isTimeout ? 408 : 500,
    })
  } finally {
    clearTimeout(timeoutId);
  }
})