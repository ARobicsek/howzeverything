// supabase/functions/dish-search/index.ts  
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RawDishData {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
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

// Basic search term expansion - simplified version
function expandSearchTerm(term: string): string[] {
  const normalizedTerm = term.toLowerCase().trim();
  const searchTerms = [normalizedTerm];
  
  // Add basic plurals/singulars
  if (normalizedTerm.endsWith('s') && normalizedTerm.length > 2) {
    searchTerms.push(normalizedTerm.slice(0, -1));
  } else if (!normalizedTerm.endsWith('s')) {
    searchTerms.push(normalizedTerm + 's');
  }
  
  // Basic synonyms for common food terms
  const basicSynonyms: { [key: string]: string[] } = {
    'pasta': ['spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'noodles'],
    'pizza': ['pie', 'slice'],
    'burger': ['hamburger', 'cheeseburger'],
    'sandwich': ['sub', 'hoagie', 'grinder', 'hero', 'panini'],
    'chicken': ['pollo', 'fowl'],
    'beef': ['steak', 'meat'],
    'fish': ['seafood', 'salmon', 'tuna', 'cod'],
    'coffee': ['latte', 'cappuccino', 'espresso', 'americano'],
    'tea': ['chai', 'green tea', 'black tea'],
    'dessert': ['cake', 'ice cream', 'pie', 'cookie'],
    'drink': ['beverage', 'drinks', 'beverages']
  };
  
  if (basicSynonyms[normalizedTerm]) {
    searchTerms.push(...basicSynonyms[normalizedTerm]);
  }
  
  // Check if term is a synonym of something
  for (const [key, synonyms] of Object.entries(basicSynonyms)) {
    if (synonyms.includes(normalizedTerm)) {
      searchTerms.push(key);
      searchTerms.push(...synonyms.filter(s => s !== normalizedTerm));
    }
  }
  
  return [...new Set(searchTerms)];
}

// CORS headers for browser access  
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

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

    // Process raw dishes function - optimized for performance
    const processRawDishes = (rawData: RawDishData[]) => {
      return (rawData || []).map((d: RawDishData) => {
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
      }).filter(Boolean);
    };
     
    // Build the query - much more efficient, only fetches needed data
    let query = supabaseAdminClient
      .from('restaurant_dishes')
      .select(`
        *,
        restaurants!inner(id, name, latitude, longitude),
        dish_ratings(rating)
      `)
      .eq('is_active', true)
      .not('restaurants.latitude', 'is', null);

    // Handle search term processing
    const term = searchTerm?.trim();
    if (term && term.length > 1) {
      const searchTerms = expandSearchTerm(term);
      const searchFilters = searchTerms
        .slice(0, 20) // Limit to prevent query overload
        .map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
        .join(',');
      
      if (searchFilters) {
        query = query.or(searchFilters);
      }
    }

    // Apply rating filter
    if (minRating && minRating > 0) {
      query = query.gte('average_rating', minRating);
    }

    // Order and limit results
    query = query.order('average_rating', { ascending: false }).limit(200);

    const { data, error } = await query;
    if (error) throw error;
     
    let results = processRawDishes(data || []);

    // Apply distance filtering if userLocation and maxDistance are provided
    if (userLocation && maxDistance && maxDistance > 0) {
      results = results.filter((dish: any) => {
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})