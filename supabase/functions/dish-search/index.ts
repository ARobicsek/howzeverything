// supabase/functions/dish-search/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- TYPE DEFINITIONS ---
interface DishPhoto {
  id: string;
  dish_id: string;
  user_id: string;
  storage_path: string;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
  updated_at: string;
  photographer_name?: string;
  photographer_email?: string;
  url?: string;
}
interface DishComment {
  id: string;
  dish_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_hidden?: boolean | null;
  commenter_name?: string;
  commenter_email?: string;
}
interface DishRating {
  id: string;
  user_id: string;
  rating: number;
  notes?: string | null;
  date_tried: string;
  created_at: string;
  updated_at: string;
  dish_id: string;
}
interface RestaurantDish {
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
}
interface DishWithDetails extends RestaurantDish {
  comments: DishComment[];
  ratings: DishRating[];
  photos: DishPhoto[];
  dateAdded: string;
}
interface DishSearchResultWithRestaurant extends DishWithDetails {
  restaurant: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

// --- SEARCH UTILITIES ---
const FOOD_SYNONYMS: { [key: string]: string[] } = {
  'pasta': ['spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'noodles'],
  'sandwich': ['sub', 'hoagie', 'grinder', 'hero', 'panini', 'wrap'],
  'burger': ['hamburger', 'cheeseburger'],
  'chicken': ['pollo', 'fowl'],
  'beef': ['steak', 'meat'],
  'fish': ['seafood', 'salmon', 'tuna', 'cod'],
  'coffee': ['latte', 'cappuccino', 'espresso', 'americano'],
  'tea': ['chai', 'green tea', 'black tea'],
  'cake': ['dessert', 'torte', 'cupcake'],
  'pie': ['dessert', 'tart'],
  'ice cream': ['gelato', 'sorbet', 'frozen yogurt', 'froyo'],
  'bbq': ['barbecue', 'barbeque', 'bar-b-q', 'grilled'],
  'bread': ['toast','loaf', 'baguette', 'ciabatta', 'sourdough', 'rye', 'pumpernickel', 'challah', 'brioche', 'focaccia','ciabatta','bagel','bialy', 'pita', 'lavash'],
};

const REVERSE_FOOD_SYNONYMS = new Map<string, string>();
Object.entries(FOOD_SYNONYMS).forEach(([key, synonyms]) => {
  const normalizedKey = key.toLowerCase().trim();
  synonyms.forEach(synonym => {
    const normalizedSynonym = synonym.toLowerCase().trim();
    if (!REVERSE_FOOD_SYNONYMS.has(normalizedSynonym)) {
      REVERSE_FOOD_SYNONYMS.set(normalizedSynonym, normalizedKey);
    }
  });
});
Object.keys(FOOD_SYNONYMS).forEach(key => {
  const normalizedKey = key.toLowerCase().trim();
  REVERSE_FOOD_SYNONYMS.set(normalizedKey, normalizedKey);
});

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
}

function generatePlurals(term: string): string[] {
  const forms = [term];
  if (term.endsWith('s') || term.endsWith('x') || term.endsWith('z') || term.endsWith('sh') || term.endsWith('ch')) {
    forms.push(term + 'es');
  } else if (term.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(term[term.length - 2])) {
    forms.push(term.slice(0, -1) + 'ies');
  } else if (!term.endsWith('s')) {
    forms.push(term + 's');
  }
  return [...new Set(forms)];
}

function getAllRelatedTerms(term: string): string[] {
  const normalizedTerm = normalizeText(term);
  const relatedTerms = new Set<string>([normalizedTerm]);
  generatePlurals(normalizedTerm).forEach(form => relatedTerms.add(form));
  if (FOOD_SYNONYMS[normalizedTerm]) {
    FOOD_SYNONYMS[normalizedTerm].forEach(syn => relatedTerms.add(normalizeText(syn)));
  }
  const mainTerm = REVERSE_FOOD_SYNONYMS.get(normalizedTerm);
  if (mainTerm) {
    relatedTerms.add(mainTerm);
    if (FOOD_SYNONYMS[mainTerm]) {
      FOOD_SYNONYMS[mainTerm].forEach(syn => relatedTerms.add(normalizeText(syn)));
    }
  }
  return Array.from(relatedTerms);
}

// Initialize the Admin client ONCE for connection pooling
const supabaseAdminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// --- MAIN SERVER LOGIC ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchTerm, minRating } = await req.json();

    const processRawDishes = (rawData: any[]): DishSearchResultWithRestaurant[] => {
        return (rawData || [])
            .map((d): DishSearchResultWithRestaurant | null => {
            if (!d || !d.restaurants || !d.id || !d.restaurant_id) return null;
            const ratings = (d.dish_ratings as DishRating[]) || [];
            const actualTotalRatings = ratings.length;
            const actualAverageRating = actualTotalRatings > 0
                ? ratings.reduce((sum: number, r: DishRating) => sum + r.rating, 0) / actualTotalRatings
                : 0;
            const commentsWithUserInfo: DishComment[] = ((d.dish_comments as any[]) || [])
                .filter((comment: any) => comment.is_hidden !== true)
                .map((comment: any): DishComment => ({
                    id: comment.id,
                    dish_id: comment.dish_id || d.id,
                    comment_text: comment.comment_text,
                    created_at: comment.created_at,
                    updated_at: comment.updated_at,
                    user_id: comment.user_id,
                    is_hidden: comment.is_hidden,
                    commenter_name: comment.users?.full_name || 'Anonymous User',
                    commenter_email: comment.users?.email,
                }));
            const photosWithInfo: DishPhoto[] = ((d.dish_photos as any[]) || [])
                .map((photo: any): DishPhoto | null => {
                // --- THE FIX: Manually construct the URL. This is MUCH faster and avoids resource contention. ---
                const imageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/dish-photos/${photo.storage_path}`;
                if (!photo.user_id || !photo.created_at || !photo.id) return null;
                return {
                    id: photo.id,
                    dish_id: photo.dish_id ?? d.id,
                    user_id: photo.user_id,
                    storage_path: photo.storage_path,
                    caption: photo.caption,
                    width: photo.width,
                    height: photo.height,
                    created_at: photo.created_at,
                    updated_at: photo.updated_at ?? photo.created_at,
                    photographer_name: photo.users?.full_name || 'Anonymous User',
                    photographer_email: photo.users?.email,
                    url: imageUrl,
                };
                }).filter((p): p is DishPhoto => p !== null);
            const result: DishSearchResultWithRestaurant = {
                id: d.id,
                restaurant_id: d.restaurant_id,
                name: d.name || '',
                description: d.description,
                category: d.category,
                is_active: d.is_active ?? true,
                created_by: d.created_by,
                verified_by_restaurant: d.verified_by_restaurant ?? false,
                created_at: d.created_at ?? new Date().toISOString(),
                updated_at: d.updated_at ?? new Date().toISOString(),
                comments: commentsWithUserInfo,
                ratings: ratings,
                photos: photosWithInfo,
                total_ratings: actualTotalRatings,
                average_rating: Math.round(actualAverageRating * 10) / 10,
                dateAdded: d.created_at ?? new Date().toISOString(),
                restaurant: d.restaurants,
            };
            return result;
            })
            .filter((d): d is DishSearchResultWithRestaurant => d !== null);
    };

    let query = supabaseAdminClient
      .from('restaurant_dishes')
      .select(`
        *,
        restaurants!inner ( id, name, latitude, longitude ),
        dish_comments ( *, users!dish_comments_user_id_fkey (full_name, email) ),
        dish_ratings ( * ),
        dish_photos ( *, users!dish_photos_user_id_fkey (full_name) )
      `)
      .eq('is_active', true)
      .not('restaurants.latitude', 'is', null)
      .not('restaurants.longitude', 'is', null);

    const term = searchTerm?.trim();
    if (term && term.length > 1) {
      const expandedTerms = getAllRelatedTerms(term).slice(0, 15);
      const orFilter = expandedTerms
          .map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
          .join(',');
      query = query.or(orFilter);
    }

    if (minRating && minRating > 0) {
      query = query.gte('average_rating', minRating);
    }

    query = query.order('average_rating', { ascending: false }).limit(200);

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    
    const results = processRawDishes(data || []);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})