// supabase/functions/dish-search/index.ts  
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
import { checkCategorySearch, getAllRelatedTerms, getCategoryTerms, getExclusionTerms } from '../_shared/search-logic.ts';


// CORS headers for browser access  
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }


  try {
    const { searchTerm, minRating } = await req.json();


    // --- THE FIX: This function is now much lighter ---
    // It calculates stats from a minimal ratings payload and returns empty arrays for heavy data.
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
     
      const needsContextFiltering = term.toLowerCase() === 'roll' || term.toLowerCase() === 'rolls' || term.toLowerCase() === 'bakery';
     
      const synonymTerms = getAllRelatedTerms(term, needsContextFiltering || term.toLowerCase() === 'bakery');
      synonymTerms.forEach(t => allSearchTerms.add(t));
     
      if (isCategory) {
        const categoryTerms = getCategoryTerms(term);
        categoryTerms.forEach(t => allSearchTerms.add(t));
      }
     
      if (needsContextFiltering || isCategory) {
        const excludeTerms = getExclusionTerms(term, allSearchTerms);
        excludeTerms.forEach(t => exclusionTerms.add(t));
      }
     
      const finalSearchTerms = Array.from(allSearchTerms).slice(0, 100);
     
      if (finalSearchTerms.length > 0) {
        const orFilter = finalSearchTerms
          .map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
          .join(',');
       
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


    query = query.order('average_rating', { ascending: false }).limit(200);


    const { data, error } = await query;
    if (error) throw error;
     
    const results = processRawDishes(data || []);


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