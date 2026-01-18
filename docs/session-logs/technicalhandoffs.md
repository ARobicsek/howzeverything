# Technical Handoffs & Investigation Log

## Restaurant Search Investigation (November 9, 2025)

### Problem Statement

Restaurant search frequently fails to find known restaurants (success rate ~50% or less). User reported being unable to find "Cafe Landwer" while located in Newton, Massachusetts, despite the restaurant having multiple locations in the Boston area.

**Known Cafe Landwer Locations:**
- 383 Chestnut Hill Ave, Brookline, MA (closest to Newton)
- 900 Beacon St, Boston, MA (Cleveland Circle)
- 653 Boylston St, Boston, MA (Back Bay)

### Initial Diagnosis (from Console Logs)

**First Search Attempt Results:**
- Query: "Cafe" (user hadn't finished typing)
- Results returned from: Germany, UK, France, Israel (8+ results), Canada, USA (only 3 results)
- **Critical Issue #1:** No geographic filtering - searching worldwide
- **Critical Issue #2:** Query analysis was splitting "Cafe Landwer" into business="Cafe", location="Landwer"

### Fixes Implemented

#### 1. Geographic Filtering (searchService.ts)
**Commit:** `7dc5814 - fix: improve restaurant search with geographic filtering and better query parsing`

**Changes:**
- Added `filter: circle:${userLon},${userLat},40000` to limit results to 40km (25 miles) radius
- Applied to both simple searches and business_location_proposal searches
- Added console logging to show when geographic filtering is active

**Result:**  Successfully limiting results to USA only (verified in second console log)

#### 2. Query Analysis Fix (queryAnalysis.ts)
**Commit:** `7dc5814`

**Problem:** Automatically splitting multi-word restaurant names
- "Cafe Landwer" � business="Cafe", location="Landwer" L
- "Boston Market" � business="Boston", location="Market" L

**Solution:** Removed automatic word splitting. Now only splits on:
- Explicit location keywords: " in ", " at ", " near ", " on ", " by ", " around "
- Comma-separated format: "Restaurant, City"

**Result:**  "Cafe landwer" now correctly treated as complete business name (verified in logs)

#### 3. Multi-Strategy Search
**Commit:** `950469c - feat: add multi-strategy search to improve restaurant discovery`

**Changes:**
- Added parallel search with 2 strategies:
  1. Geocoding API with type=amenity
  2. Geocoding API broad search (no type restriction)
- Combined and deduplicated results

#### 4. Places API v2 Implementation
**Commit:** `00ec0f0 - fix: use Places API v2 for restaurant search instead of Geocoding API`

**Critical Discovery:** We were using the wrong Geoapify API!
- **Was using:** Geocoding API (v1) - designed for address lookup
- **Should use:** Places API (v2) - designed for POI/restaurant discovery

**Changes:**
- Added Places API v2 as primary search strategy
- Now uses 3 parallel strategies:
  1. **Places API v2** (primary) - gets all nearby restaurants, filters by query
  2. Geocoding API with type=amenity (fallback)
  3. Geocoding API broad search (fallback)

**Configuration:**
```javascript
placesRequest: {
  apiType: 'places',
  latitude: userLat,
  longitude: userLon,
  radiusInMeters: 40000, // 40km = 25 miles
  categories: 'catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub',
  limit: 50,
  bias: `proximity:${userLon},${userLat}`
}
```

#### 5. Location Permission Warning (SearchResultsModal.tsx)
**Changes:**
- Added yellow warning banner when location permissions not enabled
- Prompts users: "=� Tip: Enable location permissions for better search results near you!"

### Test Results After All Fixes

**Console Log from Final Test:**
```
[Query Analysis] -> Original: "Cafe landwer"
{
  type: "business",
  businessName: "cafe landwer",
  location: undefined,
  hasUserLocation: true,
  userCoords: { lat: 41.49108304148735, lon: -71.31287520660136 }
}

[Search Strategy] Used Places API + Geocoding API for comprehensive search
{
  query: "Cafe landwer",
  lat: 41.49108304148735,
  lon: -71.31287520660136,
  radiusKm: 40,
  strategiesUsed: 3,
  ...
}
```

**Status:** L Still did not find Cafe Landwer

**What's Working:**
-  Geographic filtering active (40km radius)
-  Query analysis correct (treating as complete name)
-  Places API v2 being used
-  Results limited to USA only
-  User location available

**What's Not Working:**
- L Cafe Landwer still not appearing in results
- L Unknown how many results were returned from each strategy (user didn't paste full results object)

### Open Questions & Next Steps

#### Investigation Needed

1. **Check actual API responses:**
   - What is Places API v2 returning for the area?
   - Are there ANY restaurants being found?
   - Is the query filter (`name.includes('cafe landwer')`) too restrictive?

2. **Verify Geoapify data coverage:**
   - Does Geoapify have Cafe Landwer in their database at all?
   - Can we see raw Places API results (without filtering)?
   - Try searching for known common chains (Starbucks, Dunkin) to verify API is working

3. **Location accuracy issue:**
   - User coordinates: (41.49, -71.31) - This is **Rhode Island area**, not Newton MA!
   - Newton MA should be: (42.34, -71.18)
   - **Is GPS accuracy the problem?** If user location is off by ~60 miles, the 25-mile radius won't include Boston restaurants

4. **Query matching logic:**
   ```javascript
   // Current filter logic (line 234 in searchService.ts)
   const filteredFeatures = combinedFeatures.filter((feature: any) => {
     const name = feature.properties?.name?.toLowerCase() || '';
     return name.includes(queryLower) ||
            feature.properties?.datasource?.sourcename !== 'openstreetmap';
   });
   ```
   - This keeps all non-OpenStreetMap results but filters OSM results by name
   - Is this logic correct? Should we be filtering ALL results by name?

#### Potential Next Fixes

**Option A: Expand radius when no results found**
```javascript
// If no results with 40km, try 80km fallback
if (rawApiFeatures.length === 0 && userLat && userLon) {
  // Retry with larger radius
}
```

**Option B: Improve query matching**
- Use fuzzy matching instead of exact substring match
- Try partial word matching ("cafe" OR "landwer")
- Add name variations ("Landwer Cafe" vs "Cafe Landwer")

**Option C: Better debugging**
- Log raw Places API response before filtering
- Show user how many restaurants were found in their area
- Display distance to each result

**Option D: Fallback to database**
- If Geoapify doesn't have the restaurant, prioritize local database
- Add UI to easily add missing restaurants to database
- Show message: "Not found? Add it to our database!"

#### Files Modified This Session

1. `src/services/searchService.ts` - Main search logic with Places API v2
2. `src/utils/queryAnalysis.ts` - Fixed query splitting logic
3. `src/components/restaurant/SearchResultsModal.tsx` - Added location warning banner

#### Commits Made

```
00ec0f0 - fix: use Places API v2 for restaurant search instead of Geocoding API
950469c - feat: add multi-strategy search to improve restaurant discovery
7dc5814 - fix: improve restaurant search with geographic filtering and better query parsing
```

**Branch:** `claude/fix-broken-feature-011CUxMnV8vdfijzJJ7SVPup`
**Status:** Needs to be merged to `main` (merge blocked by 403 permissions)

---

## Restaurant Search Ranking and Quality Improvements (November 9, 2025)

### Problem Statement

User reported three specific search quality issues:

1. **"Cafe Landwer" search shows irrelevant results**
   - Searching for "Cafe Landwer" (precise name) showed random cafes from database first
   - Even though user was 60 miles away, exact name match should show actual Cafe Landwer locations
   - Database matches with low similarity scores (60-70%) appeared before perfect API matches (100%)

2. **"Cafe Landwer in Boston" shows 2 locations but should show 3**
   - Boston area has 3 Cafe Landwer locations
   - Search only returned 2 of them

3. **"Starbucks in Skokie" misses 2 Starbucks branches on Dempster St**
   - Search showed several Chicago area results
   - But missed 2 Starbucks locations in the heart of Skokie on Dempster St

### Root Cause Analysis

**Issue 1: No Result Ranking**
- Database matches always appeared first (line 321: `[...dbMatches, ...uniqueApiPlaces]`)
- Similarity scores were calculated but never used for sorting
- A database restaurant with "cafe" in the name (60% match) would appear before "Cafe Landwer" (100% match)

**Issue 2: Limited Search Radius**
- Location-based searches used 50km radius
- Some metro area locations were outside this radius

**Issue 3: Strict Name Filtering**
- Name matching used strict substring matching: `name.includes(queryLower)`
- Didn't handle word order variations or accents
- Might filter out valid matches with different name formats

### Fixes Implemented

#### 1. Intelligent Relevance Scoring (searchService.ts)
**Commit:** `ec31112`

**Implementation:**
- Created `calculateRelevanceScore()` function that considers:
  * **Name similarity** (0-100): Higher is better
  * **Source bonus** (+10): Small boost for database entries already in system
  * **Distance penalty** (0-20): Closer results rank higher when user location available

**Scoring Formula:**
```javascript
score = nameSimilarity + (isDatabase ? 10 : 0) - distancePenalty
```

**Distance Penalty:**
- 0 penalty for restaurants <5km away
- Up to 20 penalty for restaurants 40km+ away
- Linear scaling between 5-40km

**Result:**
- All results (database + API) sorted by relevance score
- "Cafe Landwer" with 100% similarity now appears before "Some Cafe" with 60% similarity
- Nearby perfect matches rank highest

#### 2. Expanded Search Radius (searchService.ts)
**Changes:**
- Increased radius from **50km → 80km** (~50 miles)
- Added Places API v2 to location-based searches (in addition to geocoding)
- Captures full metro areas

**For "Cafe Landwer in Boston":**
```javascript
// Old: 50km radius
filter: `circle:${lon},${lat},50000`

// New: 80km radius + Places API
radiusInMeters: 80000 // Captures all Boston metro area
```

**Result:**
- All 3 Cafe Landwer locations in Boston area should now be captured
- Skokie Starbucks branches should appear (Chicago metro area)

#### 3. Flexible Name Matching (searchService.ts)
**Changes:**
- Replaced strict substring matching with word-based matching
- Uses `normalizeText()` for consistent comparisons (handles accents, apostrophes)
- Matches individual words in any order

**Algorithm:**
```javascript
// Split query into words: "Cafe Landwer" → ["cafe", "landwer"]
// Split name into words: "Landwer Cafe" → ["landwer", "cafe"]
// Check if query words appear in name words
// Require 80% of query words to match
```

**Examples:**
- ✅ "Cafe Landwer" matches "Landwer Cafe"
- ✅ "Cafe Landwer" matches "Café Landwer" (handles accent)
- ✅ "Cafe Landwer" matches "Landwer's Cafe"
- ✅ "Starbucks" matches "Starbucks Coffee"

#### 4. Enhanced Debugging (searchService.ts)
**Added Console Logging:**
```javascript
[Search Ranking] Sorted 12 results by relevance
{
  query: "Cafe Landwer",
  topResults: [
    {
      name: "Cafe Landwer",
      score: "98.5",
      nameSimilarity: 100,
      source: "api",
      distance: "8.2km"
    },
    ...
  ]
}
```

**Shows:**
- Total results found
- Top 5 results with scores
- Name similarity, source, and distance for each

### Expected Results

**"Cafe Landwer" search:**
- ✅ Actual Cafe Landwer locations appear first
- ✅ Sorted by distance from user
- ✅ Database cafes with "cafe" in name appear lower (if at all, depending on similarity)

**"Cafe Landwer in Boston" search:**
- ✅ All 3 Boston-area Cafe Landwer locations should appear
- ✅ Sorted by distance from Boston center

**"Starbucks in Skokie" search:**
- ✅ Dempster St Starbucks locations should appear
- ✅ All Skokie-area Starbucks sorted by distance

### Files Modified

**src/services/searchService.ts:**
- Added `normalizeText` import
- Added `calculateDistance()` helper function
- Added `calculateRelevanceScore()` function
- Created `ScoredPlace` interface
- Updated database match creation to preserve scores
- Updated API place deduplication to calculate scores
- Added sorting by relevance score
- Added debug logging for ranking
- Increased search radius from 50km to 80km
- Added Places API v2 to location-based searches
- Improved name filtering with word-based matching

**Line Changes:**
- +180 insertions
- -22 deletions

### Deployment

**Commit:** `ec31112`
**Branch:** `claude/import-implementation-011CUxrSvrKFUndy3vxMwRam`
**Status:** Pushed and ready for testing

### Testing Recommendations

1. **Test "Cafe Landwer" search from Newton, MA**
   - Verify exact matches appear first
   - Verify sorted by distance
   - Check console for ranking details

2. **Test "Cafe Landwer in Boston"**
   - Verify all 3 locations appear:
     * 383 Chestnut Hill Ave, Brookline
     * 900 Beacon St, Boston (Cleveland Circle)
     * 653 Boylston St, Boston (Back Bay)

3. **Test "Starbucks in Skokie"**
   - Verify Dempster St locations appear
   - Check that all Skokie-area Starbucks are included

4. **Test database priority**
   - Search for a restaurant that exists in database
   - Verify it gets +10 bonus but doesn't dominate if similarity is low

5. **Check console logs**
   - Look for `[Search Ranking]` logs
   - Verify scores make sense
   - Check that high similarity = high score

### Notes

- Database entries get +10 bonus but won't dominate if name match is poor
- Distance penalty only applies when user location is available
- Word matching is case-insensitive and handles accents/apostrophes
- 80% word match threshold balances precision and recall
- Places API v2 limit is 50 results per search

---

### Critical Information for Next Session

1. **The location discrepancy is suspicious:**
   - Previous log showed Newton MA: (42.34, -71.18) 
   - Latest log shows: (41.49, -71.31) L (60+ miles south, near RI border)
   - **Ask user:** Were you in a different location? Did GPS permissions reset?

2. **We need to see the actual results:**
   - Console log should show: `results: [{ source: 'places', count: X }, ...]`
   - We need to know if Places API is returning ANY restaurants
   - If count is 0, it's a data coverage issue
   - If count > 0 but Cafe Landwer missing, it's in the data but our filter is removing it

3. **Test with a known common restaurant:**
   - Try "Starbucks" or "Dunkin" (very common in Boston)
   - If these work, it confirms the implementation is correct
   - If these fail too, there's a deeper issue

4. **Consider the local database option:**
   - The app has an "Add it manually" button - this is the designed fallback
   - Once added to local DB, it will always be found in future searches
   - Maybe this is acceptable for less common chains?

### Architectural Notes

The search flow is now:

```
User types query � SearchResultsModal
  �
  useRestaurants.searchRestaurants(query, lat, lon)
  �
  SearchService.searchRestaurants()
  �
                                       
   If user location available:         
   1. Places API v2 (50 results)       
   2. Geocoding API amenity (20)       
   3. Geocoding API broad (20)         
   All filtered by 40km radius         
                                       
  �
  Filter Places API results by name.includes(query)
  �
  Deduplicate by place_id
  �
  Combine with local database results
  �
  Return to UI
```

**Bottlenecks identified:**
1. Query name filtering may be too strict (exact substring match)
2. Location accuracy critical for geographic filtering
3. Geoapify data coverage may be incomplete for certain restaurants

### References

- Geoapify Places API docs: https://apidocs.geoapify.com/docs/places/
- Edge function: `/home/user/howzeverything/supabase/functions/geoapify-proxy/index.ts`
- Search service: `/home/user/howzeverything/src/services/searchService.ts` (lines 152-268)

---

## Previous Sessions

(This section can be populated with other technical handoffs as needed)
