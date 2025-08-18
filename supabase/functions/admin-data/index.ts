// supabase/functions/admin-data/index.ts  
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkCategorySearch, getAllRelatedTerms, getCategoryTerms, getExclusionTerms } from '../_shared/search-logic.ts';

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

    const superAdminEmails = ['admin@howzeverything.com', 'ari.robicsek@gmail.com'];
    if (user.email && superAdminEmails.includes(user.email)) {
        return { user, error: null };
    }
     
    const { data: profile } = await supabaseAdminClient
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
     
    if (profile && profile.is_admin) {
        return { user, error: null };
    }
     
    return { user: null, error: 'User is not an administrator.' };

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
                const allSearchTerms = new Set<string>();
                const exclusionTerms = new Set<string>();
                
                const isCategory = checkCategorySearch(term);
                
                // Check if we need context-aware filtering for "roll"
                const needsContextFiltering = term.toLowerCase() === 'roll' || term.toLowerCase() === 'rolls' || term.toLowerCase() === 'bakery';
                
                // Get related terms with context awareness
                const synonymTerms = getAllRelatedTerms(term, needsContextFiltering || term.toLowerCase() === 'bakery');
                synonymTerms.forEach(t => allSearchTerms.add(t));
                
                if (isCategory) {
                    const categoryTerms = getCategoryTerms(term);
                    categoryTerms.forEach(t => allSearchTerms.add(t));
                }
                
                // Get exclusion terms if needed
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
                    
                    // If we have exclusion terms, add NOT filters
                    if (exclusionTerms.size > 0) {
                        // Chain NOT filters for each exclusion term
                        Array.from(exclusionTerms).forEach(excludeTerm => {
                            query = query.not('name', 'ilike', `%${excludeTerm}%`);
                        });
                    }
                }
            }
            query = query.order('created_at', { ascending: false }).range(from, to);
            break;
             
        case 'comments': {
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
        }

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