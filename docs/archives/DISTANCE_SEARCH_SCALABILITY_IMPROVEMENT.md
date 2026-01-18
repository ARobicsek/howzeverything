# Distance Search Scalability Improvement

## Problem Description

The current distance search implementation has a fundamental scalability issue that will become problematic as the database grows.

### Current Issue
- **Band-aid Solution**: Distance filtering happens in JavaScript after retrieving a limited set of dishes from the database
- **Current Limit**: 200 dishes for distance searches
- **Problem**: With 100,000+ dishes, nearby restaurants may not be in the first 200 results ordered by rating
- **Result**: Nearby restaurants get excluded from distance searches despite being geographically close

### Root Cause
The current architecture:
1. Queries database for top 200 dishes (ordered by rating)
2. Filters those 200 dishes by distance in JavaScript
3. Returns matches within distance radius

This approach fails when nearby restaurants have lower ratings and don't appear in the top 200 results.

### Example Scenario
- User searches "Within 2 mi" in Cambridge, MA
- Database returns top 200 highest-rated dishes (mostly from Seattle, Chicago, etc.)
- JavaScript filters these 200 dishes by distance
- Result: 0 dishes found because no highly-rated dishes are within 2 miles
- Reality: "White Mountain Creamery" (1.0 mi away) exists but has lower rating

## Recommended Solution: PostGIS Database-Level Distance Filtering

Use PostgreSQL's native geographic functions to filter by distance **at the database level** before applying limits.

### Benefits
- ✅ **Scalable**: Works with millions of restaurants
- ✅ **Accurate**: Proper spherical distance calculations
- ✅ **Performance**: Database-optimized geospatial queries with indexes
- ✅ **Industry Standard**: PostGIS is the standard for geospatial data
- ✅ **Future-proof**: No arbitrary limits needed

## Implementation Checklist

### Phase 1: Database Setup
- [ ] **Verify PostGIS Extension**
  - [ ] Check if PostGIS is enabled in Supabase
  - [ ] Enable PostGIS if not already available
  - [ ] Test basic PostGIS functions

- [ ] **Create Geospatial Indexes**
  - [ ] Add spatial index on restaurant coordinates
  - [ ] Verify index performance with EXPLAIN queries
  - [ ] Document index creation SQL

### Phase 2: Edge Function Updates
- [ ] **Update dish-search Edge Function**
  - [ ] Replace manual distance calculation with `ST_DWithin`
  - [ ] Use `ST_Distance` for distance-based ordering
  - [ ] Remove arbitrary 200-dish limit for distance searches
  - [ ] Add proper distance unit handling (miles vs meters)

- [ ] **Query Optimization**
  - [ ] Implement database-level distance filtering:
    ```sql
    WHERE ST_DWithin(
      ST_MakePoint(restaurants.longitude, restaurants.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      max_distance_meters
    )
    ORDER BY ST_Distance(
      ST_MakePoint(restaurants.longitude, restaurants.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    )
    ```
  - [ ] Test query performance with large datasets
  - [ ] Add proper error handling for invalid coordinates

### Phase 3: Testing & Validation
- [ ] **Functionality Testing**
  - [ ] Test distance searches with various radii (1mi, 5mi, 25mi)
  - [ ] Verify nearby restaurants appear in results
  - [ ] Test with user locations in different geographic areas
  - [ ] Confirm distance calculations are accurate

- [ ] **Performance Testing**
  - [ ] Measure query execution times
  - [ ] Test with larger datasets (simulate 100k+ restaurants)
  - [ ] Verify memory usage and response times
  - [ ] Compare performance vs current implementation

- [ ] **Edge Case Testing**
  - [ ] Test near coordinate boundaries (poles, date line)
  - [ ] Test with invalid/missing coordinates
  - [ ] Test extremely large and small distance values

### Phase 4: Cleanup & Documentation
- [ ] **Remove Temporary Code**
  - [ ] Remove JavaScript distance filtering logic
  - [ ] Remove debugging logs added during investigation
  - [ ] Clean up artificial search term workarounds

- [ ] **Update Documentation**
  - [ ] Document new distance search architecture
  - [ ] Update API documentation for distance parameters
  - [ ] Add performance characteristics to documentation

- [ ] **Code Review & Deployment**
  - [ ] Code review for geospatial query correctness
  - [ ] Staged deployment (test → staging → production)
  - [ ] Monitor production performance post-deployment

## Technical Notes

### PostGIS Functions to Use
- `ST_MakePoint(lng, lat)::geography` - Create geographic points
- `ST_DWithin(point1, point2, distance)` - Filter by distance
- `ST_Distance(point1, point2)` - Calculate exact distance for sorting

### Distance Unit Conversion
- Input: Miles (user preference)
- PostGIS: Meters (standard unit)
- Conversion: `miles * 1609.344 = meters`

### Index Creation
```sql
CREATE INDEX idx_restaurants_location_gist 
ON restaurants 
USING GIST(ST_MakePoint(longitude, latitude)::geography);
```

## Success Criteria
- ✅ Distance searches return results regardless of database size
- ✅ Nearby restaurants appear in distance searches consistently
- ✅ Query performance remains under 500ms for typical searches
- ✅ No arbitrary limits needed for distance filtering
- ✅ Accurate distance calculations and sorting

## Risk Mitigation
- **Backup Plan**: Keep current implementation as fallback during migration
- **Gradual Rollout**: Test with subset of users before full deployment
- **Performance Monitoring**: Add metrics to track query performance
- **Coordinate Validation**: Ensure all restaurants have valid coordinates before migration