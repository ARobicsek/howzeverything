// supabase/functions/get-menu-data/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RawDishData {
  id: string;
  name: string;
  description?: string;
  dish_ratings?: Array<{
    rating: number;
    user_id: string;
  }>;
  dish_comments?: Array<{
    id: string;
    comment_text: string;
    created_at: string;
    is_hidden?: boolean;
    users?: {
      full_name?: string;
      email?: string;
    };
  }>;
  dish_photos?: Array<{
    id: string;
    storage_path: string;
    caption?: string;
    created_at: string;
    users?: {
      full_name?: string;
      email?: string;
    };
  }>;
  [key: string]: unknown;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

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
    return new Response('ok', { headers: corsHeaders });
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
    const { restaurantId } = await req.json();

    if (!restaurantId) {
      throw new Error('Missing restaurantId in request body.');
    }
    
    // This is the exact query logic from the useDishes hook, now running on the server.
    // Added back the ordering for consistency.
    const { data, error } = await supabaseAdminClient
      .from('restaurant_dishes')
      .select(`
        *,
        dish_comments ( *, users!dish_comments_user_id_fkey (full_name, email) ),
        dish_ratings (*),
        dish_photos ( *, users!dish_photos_user_id_fkey (full_name, email) )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('created_at', { foreignTable: 'dish_comments', ascending: true })
      .order('created_at', { foreignTable: 'dish_ratings', ascending: false })
      .order('created_at', { foreignTable: 'dish_photos', ascending: false });

    if (error) {
      throw error;
    }

    // This robust processing function ensures the data shape is always correct,
    // preventing client-side crashes by flattening user data and creating photo URLs.
    const processRawDishes = (rawData: RawDishData[]) => {
      return (rawData || []).map((d: RawDishData) => {
        if (!d || !d.id) return null;
        
        const ratings = d.dish_ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum: number, r: { rating: number; }) => sum + r.rating, 0) / totalRatings 
          : 0;

        const commentsWithUserInfo = (d.dish_comments || [])
          .filter((comment) => comment.is_hidden !== true)
          .map((comment) => {
            const { users, ...restOfComment } = comment;
            return {
              ...restOfComment,
              commenter_name: users?.full_name || 'Anonymous User',
              commenter_email: users?.email,
            };
          });

        const photosWithInfo = (d.dish_photos || []).map((photo) => {
          const { users, ...restOfPhoto } = photo;
          return {
            ...restOfPhoto,
            url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/dish-photos/${photo.storage_path}`,
            photographer_name: users?.full_name || 'Anonymous User',
            photographer_email: users?.email,
          };
        });
        
        const { ...dishData } = d;

        return {
          ...dishData,
          ratings,
          comments: commentsWithUserInfo,
          photos: photosWithInfo,
          total_ratings: totalRatings,
          average_rating: Math.round(averageRating * 10) / 10,
          dateAdded: d.created_at,
        };
      }).filter(Boolean);
    };

    const results = processRawDishes(data);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[GET-MENU-DATA FUNCTION ERROR]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});