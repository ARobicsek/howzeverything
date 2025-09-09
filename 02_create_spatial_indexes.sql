-- Step 2: Create Spatial Indexes
-- Run this after Step 1 is successful

-- First, add a computed geometry column for spatial indexing
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS location geography(POINT);

-- Update existing records to populate the location column
UPDATE restaurants 
SET location = extensions.ST_MakePoint(longitude, latitude)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- Create spatial index on the geography column
CREATE INDEX IF NOT EXISTS idx_restaurants_location_spatial 
ON restaurants 
USING GIST(location)
WHERE location IS NOT NULL;

-- Create standard B-tree index as backup
CREATE INDEX IF NOT EXISTS idx_restaurants_coordinates 
ON restaurants(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Verify indexes were created
SELECT 
    schemaname, 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'restaurants' 
    AND indexname LIKE '%location%' OR indexname LIKE '%coordinates%'
ORDER BY indexname;