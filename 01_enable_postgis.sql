-- Step 1: Enable PostGIS Extension
-- Run this first in Supabase SQL Editor

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Grant access to the extensions schema
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Test that PostGIS is working
SELECT extensions.postgis_version() as postgis_version;