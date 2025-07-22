// supabase/functions/dish-search/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkCategorySearch, getAllRelatedTerms, getCategoryTerms } from '../_shared/search-logic.ts';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- TYPE DEFINITIONS ---
interface DishSearchResultWithRestaurant {
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
}

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

    const processRawDishes = (rawData: any[]) => {
      return (rawData || []).map((d: any) => {
        if (!d || !d.restaurants || !d.id) return null;
       
        const { dish_ratings, dish_photos, dish_comments, restaurants, ...dishData } = d;

        const ratings = dish_ratings || [];
        const photos = dish_photos || [];
        const comments = dish_comments || [];

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? ratings.reduce((sum: number, r: { rating: number; }) => sum + r.rating, 0) / totalRatings
          : 0;

        return {
          ...dishData,
          restaurant: restaurants,
          ratings: ratings,
          comments: comments,
          photos: photos.map((p: any) => ({
            ...p,
            url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/dish-photos/${p.storage_path}`
          })),
          total_ratings: totalRatings,
          average_rating: Math.round(averageRating * 10) / 10,
          dateAdded: d.created_at,
        };
      }).filter(Boolean);
    };
   
    let query = supabaseAdminClient
      .from('restaurant_dishes')
      .select(`
        *,
        restaurants!inner(id, name, latitude, longitude),
        dish_ratings(*),
        dish_photos(*),
        dish_comments(*)
      `)
      .eq('is_active', true)
      .not('restaurants.latitude', 'is', null);

    const term = searchTerm?.trim();
    if (term && term.length > 1) {
      const allSearchTerms = new Set<string>();
      const isCategory = checkCategorySearch(term);
      const synonymTerms = getAllRelatedTerms(term);
      synonymTerms.forEach(t => allSearchTerms.add(t));
      if (isCategory) {
        const categoryTerms = getCategoryTerms(term);
        categoryTerms.forEach(t => allSearchTerms.add(t));
      }
      const finalSearchTerms = Array.from(allSearchTerms).slice(0, 100);
      if (finalSearchTerms.length > 0) {
        const orFilter = finalSearchTerms
            .map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
            .join(',');
        query = query.or(orFilter);
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