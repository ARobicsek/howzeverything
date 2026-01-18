// supabase/functions/keep-alive/index.ts
//
// Simple keep-alive function to prevent Supabase free tier from pausing.
// This function is called by a scheduled GitHub Actions workflow.
//
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Simple query to register database activity and prevent project pausing
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[KEEP-ALIVE] Database query failed:', error.message);
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('[KEEP-ALIVE] Ping successful at', new Date().toISOString());
    
    return new Response(JSON.stringify({ 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      dbCheck: 'ok',
      recordsFound: data?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[KEEP-ALIVE] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
