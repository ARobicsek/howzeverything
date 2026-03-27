// supabase/functions/foursquare-proxy/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ['https://howzeverything.netlify.app', 'http://localhost:3000'];

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
  const origin = req.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

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

    const requestBody = await req.json();
    const { apiType, query, ll, near, radius, categories, limit, place_id } = requestBody;

    const apiKey = Deno.env.get('FOURSQUARE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Foursquare API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'X-Places-Api-Version': '2025-06-17',
    };

    let fsqUrl: string;

    if (apiType === 'search') {
      // Places Search v3: https://docs.foursquare.com/reference/place-search
      if (!query && !ll && !near) {
        return new Response(JSON.stringify({ error: 'Missing required parameter: query, ll, or near' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const params = new URLSearchParams();
      if (query) params.append('query', query);
      // near and ll are mutually exclusive in Foursquare API; prefer near when provided
      if (near) {
        params.append('near', near);
      } else if (ll) {
        params.append('ll', ll);
      }
      if (radius && !near) params.append('radius', radius.toString());
      if (categories) params.append('categories', categories);
      params.append('limit', (limit || 50).toString());

      fsqUrl = `https://places-api.foursquare.com/places/search?${params.toString()}`;

    } else if (apiType === 'details') {
      // Place Details v3: https://docs.foursquare.com/reference/get-place-details
      if (!place_id) {
        return new Response(JSON.stringify({ error: 'Missing required parameter: place_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      fsqUrl = `https://places-api.foursquare.com/places/${place_id}`;

    } else {
      return new Response(JSON.stringify({ error: 'Invalid apiType. Must be "search" or "details"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(fsqUrl, { headers });

    if (!response.ok) {
      const rawText = await response.text();
      console.error(`[FSQ ERROR] Status: ${response.status}, URL: ${fsqUrl}, Body: ${rawText.substring(0, 500)}`);
      let errorMessage: string;
      try {
        const errorData = JSON.parse(rawText);
        errorMessage = errorData.message || errorData.error || rawText.substring(0, 200);
      } catch {
        errorMessage = rawText.substring(0, 200) || 'Empty response';
      }
      return new Response(JSON.stringify({
        error: `Foursquare API failed with status ${response.status}: ${errorMessage}`
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[EDGE FUNCTION ERROR]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})