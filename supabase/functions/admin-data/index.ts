// supabase/functions/admin-data/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize the Admin client ONCE for connection pooling
const supabaseAdminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper to get all related terms for dish/comment search
const getAllRelatedTerms = (term: string): string[] => {
    // A simplified version for the admin panel is sufficient
    const normalized = term.toLowerCase().trim();
    if (!normalized) return [];
    return [normalized, normalized + 's', normalized.slice(0, -1)];
}

const securityCheck = async (req: Request, supabaseUrl: string, supabaseAnonKey: string): Promise<{ user: any; error: string | null }> => {
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

    // --- THE FIX: Check both the hardcoded email list AND the database flag ---

    // Check 1: Is the user's email in the hardcoded super-admin list?
    const superAdminEmails = ['admin@howzeverything.com', 'ari.robicsek@gmail.com'];
    if (user.email && superAdminEmails.includes(user.email)) {
        return { user, error: null }; // Email is valid, grant access immediately.
    }
    
    // Check 2: Does the user have the is_admin flag in their profile?
    // This allows you to add other admins from the database in the future.
    const { data: profile, error: profileError } = await supabaseAdminClient
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    
    if (profile && profile.is_admin) {
        return { user, error: null }; // Database flag is valid, grant access.
    }
    
    // If BOTH checks fail, then deny access.
    return { user: null, error: 'User is not an administrator.' };

  } catch (e) {
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

    const { 
        dataType, 
        page, 
        limit,
        restaurantSearchTerm,
        dishSearchTerm,
        commentRestaurantSearch,
        commentDishSearch
    } = await req.json();
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query;
    let count = 0;

    switch (dataType) {
        case 'restaurants':
            query = supabaseAdminClient.from('restaurants').select('*', { count: 'exact' });
            if (restaurantSearchTerm) {
                const term = restaurantSearchTerm.trim();
                query = query.or(`name.ilike.%${term}%,city.ilike.%${term}%,full_address.ilike.%${term}%`);
            }
            query = query.order('created_at', { ascending: false }).range(from, to);
            break;
        
        case 'dishes':
            query = supabaseAdminClient.from('restaurant_dishes').select(`id, name, created_at, restaurants (name)`, { count: 'exact' });
            if (dishSearchTerm && dishSearchTerm.trim().length >= 2) {
                const term = dishSearchTerm.trim();
                const expandedTerms = getAllRelatedTerms(term).slice(0, 10);
                const orFilter = expandedTerms.map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`).join(',');
                query = query.or(orFilter);
            }
            query = query.order('created_at', { ascending: false }).range(from, to);
            break;
            
        case 'comments':
            query = supabaseAdminClient
                .from('dish_comments')
                .select(`*, restaurant_dishes!inner(name, restaurant_id, restaurants!inner(name)), users!dish_comments_user_id_fkey(full_name, email)`, { count: 'exact' });
            
            const restaurantTerm = commentRestaurantSearch?.trim();
            const dishTerm = commentDishSearch?.trim();
            const foreignTableFilters: string[] = [];

            if (restaurantTerm) {
              foreignTableFilters.push(`restaurants.name.ilike.%${restaurantTerm}%`);
            }
            if (dishTerm && dishTerm.length >= 2) {
              const expandedTerms = getAllRelatedTerms(dishTerm).slice(0, 10);
              const dishOrFilter = expandedTerms.map(t => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`).join(',');
              if (expandedTerms.length > 0) {
                foreignTableFilters.push(`or(${dishOrFilter})`);
              }
            }
            if (foreignTableFilters.length > 0) {
              const filterString = foreignTableFilters.length > 1 ? `and(${foreignTableFilters.join(',')})` : foreignTableFilters[0];
              query = query.or(filterString, { foreignTable: 'restaurant_dishes' });
            }
            query = query.order('created_at', { ascending: false }).range(from, to);
            break;

        default:
            throw new Error('Invalid data type requested.');
    }

    const { data, error, count: queryCount } = await query;
    if (error) throw error;
    
    return new Response(JSON.stringify({ data, count: queryCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})