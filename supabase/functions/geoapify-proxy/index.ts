// supabase/functions/geoapify-proxy/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser access  
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

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

    const requestBody = await req.json();
    const { 
      // Places API (v2) parameters
      categories, longitude, latitude, radiusInMeters, bias, limit,
      // Geocode API (v1) parameters  
      text, type, filter, placeId, apiType
    } = requestBody;

    // Validate required parameters based on API type
    if (apiType === 'places') {
      if (!longitude || !latitude || !radiusInMeters) {
        return new Response(JSON.stringify({ error: 'Missing required parameters for places API: longitude, latitude, radiusInMeters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (apiType === 'geocode') {
      if (!text) {
        return new Response(JSON.stringify({ error: 'Missing required parameter for geocode API: text' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (apiType === 'place-details') {
      if (!placeId) {
        return new Response(JSON.stringify({ error: 'Missing required parameter for place-details API: placeId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid apiType. Must be "places", "geocode", or "place-details"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get API key from environment variables (server-side only)
    const apiKey = Deno.env.get('GEOAPIFY_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Geoapify API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build the Geoapify API URL based on API type
    let geoapifyUrl: string;
    
    if (apiType === 'places') {
      const baseUrl = 'https://api.geoapify.com/v2/places';
      const params = new URLSearchParams({
        categories: categories || 'catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub',
        filter: `circle:${longitude},${latitude},${radiusInMeters}`,
        bias: bias || `proximity:${longitude},${latitude}`,
        limit: (limit || 50).toString(),
        apiKey: apiKey
      });
      geoapifyUrl = `${baseUrl}?${params.toString()}`;
      
    } else if (apiType === 'geocode') {
      const baseUrl = 'https://api.geoapify.com/v1/geocode/search';
      const params = new URLSearchParams({
        text: text,
        apiKey: apiKey
      });
      
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit.toString());
      if (filter) params.append('filter', filter);
      if (bias) params.append('bias', bias);
      
      geoapifyUrl = `${baseUrl}?${params.toString()}`;
      
    } else if (apiType === 'place-details') {
      const baseUrl = 'https://api.geoapify.com/v2/place-details';
      const params = new URLSearchParams({
        id: placeId,
        apiKey: apiKey
      });
      geoapifyUrl = `${baseUrl}?${params.toString()}`;
    } else {
      // This should not happen due to earlier validation, but just in case
      throw new Error('Invalid API type');
    }

    // Make the request to Geoapify API
    const response = await fetch(geoapifyUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'API response was not valid JSON.' }));
      return new Response(JSON.stringify({ 
        error: `Geoapify API failed with status ${response.status}: ${errorData.message || 'Unknown error'}` 
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