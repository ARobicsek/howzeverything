-- Step 4: Test All Functions
-- Run this to verify everything is working correctly

-- Test 1: Verify PostGIS version
SELECT extensions.postgis_version() as postgis_version;

-- Test 2: Test distance calculation between two known points
-- Should return approximately 6.8 miles between Seattle locations
SELECT test_postgis_distance(47.6, -122.3, 47.617987, -122.1921993) as test_distance_miles;

-- Test 3: Find sample restaurants within 10 miles of Seattle (47.6, -122.3)
SELECT 
    restaurant_name,
    latitude,
    longitude,
    distance_miles
FROM find_dishes_within_radius(47.6, -122.3, 10.0)
ORDER BY distance_miles
LIMIT 5;

-- Test 4: Find dishes with search term within 25 miles
SELECT 
    dish_name,
    restaurant_name,
    distance_miles,
    average_rating
FROM find_dishes_within_radius(47.6, -122.3, 25.0, 'chicken')
ORDER BY distance_miles
LIMIT 10;

-- Test 5: Check index usage (performance test)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    restaurant_name,
    distance_miles
FROM find_dishes_within_radius(47.6, -122.3, 5.0)
LIMIT 20;