# PostGIS Migration Plan for Distance Search Scalability

## Overview
This document outlines the steps to enable PostGIS and migrate from JavaScript distance filtering to database-level spatial queries.

## Phase 1: Enable PostGIS Extension

### Method 1: Via Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/cjznbkcurzotvusorjec)
2. Navigate to Database → Extensions
3. Search for "postgis" and click "Enable"
4. Choose "Create a new schema" and name it "extensions" or "gis"

### Method 2: Via SQL Editor in Dashboard
Execute the following SQL commands in the SQL Editor:

```sql
-- Create schema for PostGIS functions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Grant access to schemas
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
```

## Phase 2: Create Spatial Indexes

Since we have existing `restaurants` table with `latitude`/`longitude` columns, we'll create spatial indexes:

```sql
-- Create spatial index using PostGIS functions
CREATE INDEX IF NOT EXISTS idx_restaurants_location_spatial 
ON restaurants 
USING GIST(extensions.ST_MakePoint(longitude, latitude)::extensions.geography)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create standard B-tree index for non-spatial filtering
CREATE INDEX IF NOT EXISTS idx_restaurants_coordinates 
ON restaurants(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

## Phase 3: Create Helper Functions

Create RPC functions for distance-based queries:

```sql
-- Function to find dishes within distance radius
CREATE OR REPLACE FUNCTION find_dishes_within_radius(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION,
  search_term TEXT DEFAULT NULL,
  min_rating DOUBLE PRECISION DEFAULT 0,
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  dish_id TEXT,
  dish_name TEXT,
  restaurant_id TEXT,
  restaurant_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_miles DOUBLE PRECISION,
  average_rating DOUBLE PRECISION
) 
LANGUAGE plpgsql
AS $$
DECLARE
  radius_meters DOUBLE PRECISION := radius_miles * 1609.344;
BEGIN
  RETURN QUERY
  SELECT 
    rd.id::TEXT as dish_id,
    rd.name as dish_name,
    r.id::TEXT as restaurant_id,
    r.name as restaurant_name,
    r.latitude,
    r.longitude,
    (extensions.ST_Distance(
      extensions.ST_MakePoint(user_lng, user_lat)::extensions.geography,
      extensions.ST_MakePoint(r.longitude, r.latitude)::extensions.geography
    ) / 1609.344)::DOUBLE PRECISION as distance_miles,
    rd.average_rating
  FROM restaurant_dishes rd
  INNER JOIN restaurants r ON rd.restaurant_id = r.id
  WHERE 
    rd.is_active = true
    AND r.latitude IS NOT NULL 
    AND r.longitude IS NOT NULL
    AND extensions.ST_DWithin(
      extensions.ST_MakePoint(user_lng, user_lat)::extensions.geography,
      extensions.ST_MakePoint(r.longitude, r.latitude)::extensions.geography,
      radius_meters
    )
    AND (search_term IS NULL OR rd.name ILIKE '%' || search_term || '%')
    AND rd.average_rating >= min_rating
  ORDER BY extensions.ST_Distance(
    extensions.ST_MakePoint(user_lng, user_lat)::extensions.geography,
    extensions.ST_MakePoint(r.longitude, r.latitude)::extensions.geography
  )
  LIMIT result_limit;
END;
$$;
```

## Phase 4: Test PostGIS Functions

Create a test function to verify PostGIS is working:

```sql
-- Test function to verify PostGIS functionality
CREATE OR REPLACE FUNCTION test_postgis_distance(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN extensions.ST_Distance(
    extensions.ST_MakePoint(lng1, lat1)::extensions.geography,
    extensions.ST_MakePoint(lng2, lat2)::extensions.geography
  ) / 1609.344; -- Convert meters to miles
END;
$$;
```

## Phase 5: Update Edge Function

After PostGIS is enabled and functions are created, update the `dish-search` edge function to use the new `find_dishes_within_radius` function instead of JavaScript filtering.

## Verification Steps

1. Test PostGIS extension: `SELECT extensions.postgis_version();`
2. Test distance calculation: `SELECT test_postgis_distance(47.6, -122.3, 47.617987, -122.1921993);`
3. Test spatial function: `SELECT * FROM find_dishes_within_radius(47.6, -122.3, 5.0) LIMIT 10;`

## Benefits After Migration

- ✅ **Scalable**: Works with millions of restaurants
- ✅ **Accurate**: Proper spherical distance calculations using PostGIS
- ✅ **Performance**: Database-optimized geospatial queries with spatial indexes
- ✅ **No Arbitrary Limits**: Distance filtering happens before result limits
- ✅ **Industry Standard**: PostGIS is the gold standard for geospatial data

## Next Steps

1. Execute Phase 1 in Supabase Dashboard
2. Run Phase 2-4 SQL commands in SQL Editor
3. Test functions work correctly
4. Update edge function to use new database functions
5. Remove JavaScript distance filtering logic