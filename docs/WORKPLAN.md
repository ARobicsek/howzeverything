# HowzEverything - Work Plan

> Created: March 21, 2026
> Status: Active

This document tracks planned improvements identified during a comprehensive codebase review. Work is organized into phases by priority.

---

## Phase 1: Session Management Cleanup ✅ COMPLETED (Mar 21, 2026)

**Goal:** Streamline documentation so sessions start fast and work across Claude and Gemini.

- ✅ 1A. Trimmed SESSION_HISTORY.md from 2,337 lines to ~25-line summary table
- ✅ 1B. Created root-level CLAUDE.md pointing to app/CLAUDE.md
- ✅ 1C. Simplified start-session workflow (loads scriptReferences.md + PROGRESS.md only)
- ✅ 1D. Deleted SupabaseDebugTest.tsx, 5 empty component dirs, orphaned src/src/

---

## Phase 2: PWA Conversion ✅ COMPLETED (Mar 21, 2026)

**Goal:** Make the app installable on iPhones with a native-like experience.

- ✅ 2A. Installed vite-plugin-pwa with generateSW mode, autoUpdate
- ✅ 2B. Generated PWA icons from logo.png (192x192, 512x512, 180x180 apple-touch-icon)
- ✅ 2C. Updated index.html with theme-color, apple-mobile-web-app-capable, description, apple-touch-icon
- ✅ 2D. Configured service worker: fonts cache-first, Supabase API network-first, JS/CSS/HTML precached
- ✅ 2E. Tested on iPhone - PWA works correctly (Mar 23)

---

## Phase 3: Low-Risk Security & Performance Fixes ✅ COMPLETED (Mar 21, 2026)

**Goal:** Quick wins that don't touch auth/RLS.

- ✅ 3A. Restricted CORS to `https://howzeverything.netlify.app` in all 5 edge functions
- ✅ 3B. Fixed SELECT * → name-filtered query with specific columns in searchService.ts
- ✅ 3C. Added 5-minute TTL + 50-entry max to search cache in searchService.ts
- ✅ 3D. Replaced hardcoded admin emails with `profile.is_admin` in App.tsx, AdminScreen.tsx, FindRestaurantScreen.tsx, RestaurantScreen.tsx, and admin-data edge function
- ✅ 3E. Re-enabled shared search-logic import in admin-data edge function

---

## Phase 4: Restaurant Search Quality

**Goal:** Improve search results without switching APIs (first), then evaluate Foursquare.

### 4A. Quick search improvements (Geoapify) ✅ COMPLETED (Mar 22, 2026)
- ✅ Lowered word-match filter from 80% to 50% (`searchService.ts`)
- ✅ Deduplication now uses lat/lon distance (>200m apart = different location), falls back to text similarity when no coordinates
- ✅ Location-specific searches (city/street): kept Places API + Geocode API but added business name filtering to Places API results — eliminates noise while preserving POI coverage
- ✅ Reduced city search radius from 80km to 30km for tighter results
- ✅ Added type guard for non-string feature names (fixed crash on "dunkin in santa fe")
- ✅ CORS: all 5 edge functions now use dynamic origin allowlist (production + localhost:3000)
- Tested: "dunkin in newton" ✓, "dunkin in santa fe" ✓

### 4B. Evaluate Foursquare Places API - EVALUATION COMPLETE (Mar 23, 2026)
- Signed up for Foursquare developer account ($200 free Sandbox credit)
- API uses new Places API: `places-api.foursquare.com` with Bearer auth + `X-Places-Api-Version` header
- Created and deployed `foursquare-proxy` edge function
- **Test results (Foursquare vs Geoapify):**
  - "Dunkin in Newton": 5 exact Dunkin' locations with full addresses (Geoapify required tuning)
  - "Cafe Landwer in Boston": 2 exact locations found (Geoapify: known problem area)
  - "Restaurants near Skokie": 10 real restaurants - Pita Inn, Kaufman's, Taboun Grill etc (Geoapify: known problem area)
  - "Starbucks in Santa Fe": 5 exact locations (Geoapify required crash fix)
  - "Pizza near Skokie": 10 results including Jet's, Pequod's, Giordano's (untested on Geoapify)
- **Verdict: Foursquare is significantly better** - accurate names, full addresses, much better POI coverage
- Next: migrate searchService.ts to use Foursquare as primary, keep Geoapify as fallback

### 4C. Reduce nearby restaurants cache TTL ✅ COMPLETED (Mar 22, 2026)
- ✅ Changed from 24 hours to 3 hours in `useNearbyRestaurants.tsx`

**Estimated effort:** 1-2 sessions (4A+4C done in 1 session)

---

## Phase 5: RLS (Only If Needed)

**Goal:** Re-enable Row Level Security if the app ever goes beyond family use.

### Context
RLS was previously implemented but disabled due to issues with views (user_restaurants, dish_with_stats) and complex queries. Policies for `restaurants` still exist but aren't enforced. The app currently has no RLS on any table. Edge functions use service_role_key which bypasses RLS, and client-side queries rely on Supabase auth tokens without database-level access control.

### When to revisit
- If the app is shared beyond family
- If you add public-facing features (public restaurant pages, etc.)
- If you notice data being modified unexpectedly

### If revisiting
- Start with the safest table: `admin_activity_log` (unused, zero risk)
- Test thoroughly before moving to `restaurants`, `restaurant_dishes`, etc.
- Key issue to solve: views with SECURITY DEFINER (`user_restaurants`, `dish_with_stats`)
- Have a rollback plan for each table

**Not currently scheduled.**

---

## Quick Reference

| Phase | Item | Effort | Risk |
|-------|------|--------|------|
| 1 | Session management cleanup | ✅ Done | None |
| 2 | PWA conversion | ✅ Done | ✅ Tested on iPhone |
| 3A | CORS restriction | ✅ Done | Low (test after deploy) |
| 3B | Fix SELECT * per search | ✅ Done | Low (test search) |
| 3C | Search cache TTL | ✅ Done | None |
| 3D | Admin email hardcoding | ✅ Done | Low (test admin access) |
| 3E | Admin search fix | ✅ Done | Low (test admin search) |
| 4A | Search quality tweaks | ✅ Done | Test known queries |
| 4B | Foursquare evaluation | ✅ Done (verdict: much better) | Migration next |
| 4C | Nearby cache TTL | ✅ Done | None |
| 5 | RLS | High | High (previous issues) |
