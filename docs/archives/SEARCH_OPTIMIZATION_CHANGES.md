# Restaurant Search Optimization - Technical Summary

**Date**: 2025-11-10
**Session**: claude/optimize-restaurant-search-011CUyQtcmaQucdY4Gp6dZkb

## Problem Statement

Users experienced inconsistent search results when searching for specific restaurant locations:

1. **Mobile search** for "Starbucks in Skokie" returned MOST correct Skokie locations but missed some (e.g., the Starbucks at 4116 Dempster St)
2. **Desktop search** for "starbucks in skokie" returned NO Skokie locations in top results
3. **User location mismatch**: Mobile device showed Boston, MA coordinates while searching for Skokie, IL locations, causing distance-based ranking to penalize correct results
4. Adding street names like "on Dempster" accidentally improved results, but the system wasn't properly utilizing street-level information

## Root Causes Identified

### 1. Limited Location Matching Logic
The original `matchesLocation` function returned a boolean and only checked if the ENTIRE location query string appeared in address fields:
- Query "skokie" would match city="Skokie" ✓
- Query "skokie on dempster" would NOT match city="Skokie" ✗
- Street names weren't being checked against `address_line1` field

### 2. Distance Penalty Applied Universally
When users explicitly searched for a location (e.g., "Starbucks in Skokie"), the system still heavily penalized results based on distance from the user's current location, even when that location was hundreds of miles away (Boston to Skokie).

### 3. No Street-Level Matching
Street names in queries weren't being matched against street addresses, missing an important signal for ranking relevance.

## Solution Implemented

### Enhanced Location Matching (`searchService.ts:357-405`)

**Changed from**: Boolean return value
**Changed to**: Numeric score (0-100) indicating match strength

```typescript
const matchesLocation = (place: GeoapifyPlace, locationQuery: string | null): number
```

**New capabilities**:
1. **Full string matching**: Checks if entire location query matches city/formatted address (100 points for perfect city match, 80 for formatted address match)

2. **Word-level matching**: Splits location query into individual words (filtering out prepositions like "in", "on", "at") and checks each word against:
   - City name: 100 points
   - State name: 90 points
   - Street address (address_line1): 70 points
   - Formatted address: 50 points

3. **Street name recognition**: Now properly recognizes and scores street names
   - Example: "Starbucks in Skokie on Dempster"
     - "skokie" matches city → 100 points
     - "dempster" matches street → 70 points
     - Final score: 100 (max of all matches)

### Improved Relevance Scoring (`searchService.ts:407-453`)

**Changed signature**:
```typescript
// OLD
calculateRelevanceScore(nameSimilarity, isFromDatabase, distanceKm, locationMatch: boolean)

// NEW
calculateRelevanceScore(nameSimilarity, isFromDatabase, distanceKm, locationMatchScore: number, hasExplicitLocation: boolean)
```

**Key improvements**:

1. **Scaled location bonus** (replaces fixed +30 bonus):
   - Perfect city match (100): +50 points
   - Street match (70): +35 points
   - Weak match (50): +25 points
   - Formula: `(locationMatchScore / 100) * 50`

2. **Context-aware distance penalties**:

   **When user specifies location AND result matches well** (locationMatchScore ≥ 70):
   - Minimal distance penalty
   - Only penalizes extreme distances (100km+)
   - Formula: `min(10, max(0, (distanceKm - 100) / 50))`
   - **Effect**: Searching "Starbucks in Skokie" from Boston now correctly ranks Skokie results at the top

   **When user specifies location, partial match** (locationMatchScore > 0):
   - Moderate distance penalty
   - Formula: `min(15, (distanceKm / 80) * 15)`

   **No explicit location or no match**:
   - Full distance penalty (original behavior)
   - Formula: `min(20, (distanceKm / 40) * 20)`

### Enhanced Logging (`searchService.ts:561-586`)

Added detailed debugging information showing:
- Top 10 results (increased from 5)
- Street address for each result
- Location match score (0-100)
- All scoring components

**Example new log output**:
```javascript
{
  name: "Starbucks",
  address: "4116 Dempster St",
  city: "Skokie",
  state: "IL",
  score: "145.2",  // Total relevance score
  nameSimilarity: "95.0",
  locationMatchScore: "100",  // NEW - shows why it ranked high
  source: "openstreetmap",
  distance: "15.2km"
}
```

## Expected Behavior After Changes

### Search: "Starbucks in Skokie" (from Boston, MA)
**Before**: Chicago-area Starbucks ranked higher due to distance
**After**: ALL Skokie Starbucks locations rank at top, regardless of user's distance
- Skokie locations get: +95 (name) +50 (perfect city match) ~0 (minimal distance penalty) = ~145 score
- Non-Skokie locations get: +95 (name) +0 (no location match) -20 (distance penalty) = ~75 score

### Search: "Starbucks in Skokie on Dempster"
**Before**: Worked by accident (formatted address contained "dempster")
**After**: Works by design - both city AND street name explicitly matched
- Dempster St locations get: +95 (name) +50 (city+street match) ~0 (minimal distance penalty) = ~145 score
- Other Skokie locations get: +95 (name) +50 (city match) ~0 (minimal distance penalty) = ~145 score
- Dempster locations may rank slightly higher due to street match

### Search: "Starbucks" (no location specified)
**Before**: Ranked by distance from user
**After**: Same behavior - ranked by distance from user (no change to this case)

## Files Modified

- `src/services/searchService.ts`
  - Lines 357-405: Enhanced `matchesLocation` function
  - Lines 407-453: Improved `calculateRelevanceScore` function
  - Lines 486-493: Updated database matching calls
  - Lines 540-547: Updated API place matching calls
  - Lines 561-586: Enhanced ranking logs

## Testing Recommendations

1. **Test from different locations**:
   - Search "Starbucks in Skokie" from Boston, MA (far away)
   - Search "Starbucks in Skokie" from Chicago, IL (nearby)
   - Verify Skokie results rank at top in both cases

2. **Test street-level queries**:
   - Search "Starbucks in Skokie on Dempster"
   - Verify BOTH Dempster St locations appear at top
   - Check that 4116 Dempster St is no longer missing

3. **Test location-less queries**:
   - Search "Starbucks" (no location)
   - Verify results still rank by proximity to user

4. **Check logs**:
   - Verify `locationMatchScore` shows expected values (100 for city match, 70 for street match)
   - Verify final scores show city-matched results scoring 140-150 range
   - Verify non-matched results score in 75-100 range

## Backward Compatibility

✅ **Fully backward compatible**
- All existing queries continue to work
- No database schema changes
- No API changes
- Only internal scoring logic improved

## Performance Impact

✅ **Minimal performance impact**
- Added word splitting and string matching (negligible CPU cost)
- No additional API calls
- Same number of results processed
- Logging slightly more detailed but still lightweight

## Future Enhancements (Optional)

1. **Fuzzy street matching**: Handle variations like "Dempster" vs "Dempster Street" vs "Dempster St"
2. **ZIP code matching**: If user includes ZIP code in query, boost results in that ZIP
3. **Neighborhood matching**: Recognize neighborhood names and match against geocoded data
4. **Address number matching**: If user searches "Starbucks at 4116 Dempster", prioritize exact address number match
