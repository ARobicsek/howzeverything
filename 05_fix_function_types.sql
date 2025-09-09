-- Step 5: Fix Function Return Types
-- Run this to fix the type mismatch error

-- Drop and recreate the function with correct return types
DROP FUNCTION IF EXISTS find_dishes_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, DOUBLE PRECISION, INTEGER);

-- Recreate with correct types matching the actual database schema
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
  dish_description TEXT,
  restaurant_id TEXT,
  restaurant_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  distance_miles DOUBLE PRECISION,
  average_rating NUMERIC,
  total_ratings BIGINT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
DECLARE
  radius_meters DOUBLE PRECISION := radius_miles * 1609.344;
  user_location geography;
BEGIN
  -- Create user location point
  user_location := extensions.ST_MakePoint(user_lng, user_lat)::geography;
  
  RETURN QUERY
  SELECT 
    rd.id::TEXT as dish_id,
    rd.name as dish_name,
    rd.description as dish_description,
    r.id::TEXT as restaurant_id,
    r.name as restaurant_name,
    r.latitude,
    r.longitude,
    (extensions.ST_Distance(user_location, r.location) / 1609.344)::DOUBLE PRECISION as distance_miles,
    rd.average_rating,
    rd.total_ratings,
    rd.created_at
  FROM restaurant_dishes rd
  INNER JOIN restaurants r ON rd.restaurant_id = r.id
  WHERE 
    rd.is_active = true
    AND r.location IS NOT NULL
    AND extensions.ST_DWithin(user_location, r.location, radius_meters)
    AND (search_term IS NULL OR rd.name ILIKE '%' || search_term || '%')
    AND rd.average_rating >= min_rating
  ORDER BY extensions.ST_Distance(user_location, r.location)
  LIMIT result_limit;
END;
$$;