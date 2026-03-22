# HowzEverything - Work Plan

> Created: March 21, 2026
> Status: Active

This document tracks planned improvements identified during a comprehensive codebase review. Work is organized into phases by priority.

---

## Phase 1: Session Management Cleanup

**Goal:** Streamline documentation so sessions start fast and work across Claude and Gemini.

### 1A. Trim SESSION_HISTORY.md
- Current: 2,336 lines of verbose implementation logs with full code snippets
- Action: Replace with a concise summary (~100 lines) of session dates, one-line descriptions, and commit hashes
- The git log IS the real implementation history - no need to duplicate it

### 1B. Create root-level CLAUDE.md
- Currently only exists inside `app/` - Claude Code won't auto-find it from the project root
- Create `howzeverything/CLAUDE.md` that points to app/CLAUDE.md and includes key context
- Keep it compatible with Gemini (plain markdown, no tool-specific syntax)

### 1C. Simplify start-session workflow
- Current workflow loads ~3,000 lines before any work begins
- Reduce to: load scriptReferences.md + PROGRESS.md (skip SESSION_HISTORY.md and README.md)
- SESSION_HISTORY.md should be opt-in ("read if you need historical context")

### 1D. Clean up dead files
- Delete `src/components/SupabaseDebugTest.tsx` (unused, not imported anywhere)
- Remove empty component directories: auth/, common/, layout/, menu/, rating/
- Remove orphaned `src/src/` directory

---

## Phase 2: PWA Conversion

**Goal:** Make the app installable on iPhones with a native-like experience.

### 2A. Install and configure vite-plugin-pwa
- `npm install -D vite-plugin-pwa`
- Add plugin to vite.config.ts with manifest configuration:
  - App name: "HowzEverything"
  - Theme color matching Copenhagen theme primary
  - Display: standalone (fullscreen, no Safari chrome)
  - registerType: autoUpdate (service worker auto-updates)

### 2B. Create app icons
- Generate from existing logo.png:
  - 192x192 (Android/PWA standard)
  - 512x512 (Android/PWA standard)
  - 180x180 (apple-touch-icon)
- Place in public/ directory

### 2C. Update index.html
- Add `<meta name="theme-color">`
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- Add `<meta name="apple-mobile-web-app-status-bar-style">`
- Add `<link rel="apple-touch-icon">`
- Add `<meta name="description">`
- Replace vite.svg favicon with proper app icon

### 2D. Configure service worker caching strategy
- Static assets (JS, CSS, fonts, images): cache-first
- API calls (Supabase, Geoapify): network-first (app needs connectivity for data)
- Offline fallback: show a "You're offline" message rather than blank screen

### 2E. Test on iPhone
- Verify "Add to Home Screen" works
- Verify standalone mode (no Safari URL bar)
- Verify splash screen appears
- Verify app icon on home screen

**Estimated effort:** 1 session

---

## Phase 3: Low-Risk Security & Performance Fixes

**Goal:** Quick wins that don't touch auth/RLS.

### 3A. Restrict CORS to app domain
- All 5 edge functions use `Access-Control-Allow-Origin: *`
- Change to `https://howzeverything.netlify.app`
- Files: geoapify-proxy, admin-data, dish-search, get-menu-data, keep-alive
- Test: verify app still works after deploy

### 3B. Fix SELECT * on all restaurants per search
- `searchService.ts:399` fetches entire restaurants table on every search
- Replace with a name-filtered query: `.ilike('name', `%${query}%`)`
- Or use PostGIS proximity if available (check if PostGIS extension exists)
- Test: verify search results are unchanged for common queries

### 3C. Add TTL to search cache
- `searchService.ts:37` uses a Map with no eviction
- Add timestamp to cache entries, expire after 5 minutes
- Or use a simple LRU with max 50 entries

### 3D. Fix admin hardcoded emails
- Remove email checks from App.tsx:149, AdminScreen.tsx:192, FindRestaurantScreen.tsx:85, RestaurantScreen.tsx:270
- Use the `is_admin` field from the user's profile (already available via `useAuth().profile`)
- Single source of truth: the database `users.is_admin` column

### 3E. Fix broken admin search (placeholder functions)
- `admin-data/index.ts:8-11` has commented-out import and stub functions
- Re-enable the shared search-logic import or inline the needed logic
- Test: verify admin dish search returns expected results

**Estimated effort:** 1 session

---

## Phase 4: Restaurant Search Quality

**Goal:** Improve search results without switching APIs (first), then evaluate Foursquare.

### 4A. Quick search improvements (Geoapify)
- Lower word-match filter from 80% to 50% (`searchService.ts:322`)
- Make deduplication compare lat/lon distance (>200m apart = different location) instead of text similarity
- Remove the `catering` category filter when the user has typed a specific restaurant name
- Test with known problem queries: "starbucks in skokie", "starbucks on dempster"

### 4B. Evaluate Foursquare Places API
- Sign up for free tier (200K calls/month)
- Test coverage for known problem areas (Skokie, Boston)
- Compare result quality against Geoapify for same queries
- If better: create a foursquare-proxy edge function alongside the existing geoapify-proxy
- Migration plan: swap search service to use Foursquare, keep Geoapify as fallback

### 4C. Reduce nearby restaurants cache TTL
- `useNearbyRestaurants.tsx:50`: Change from 24 hours to 2-4 hours
- Ensures newly added restaurants appear sooner

**Estimated effort:** 1-2 sessions

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
| 1 | Session management cleanup | Low | None |
| 2 | PWA conversion | Low | None |
| 3A | CORS restriction | Trivial | Low (test after deploy) |
| 3B | Fix SELECT * per search | Low | Low (test search) |
| 3C | Search cache TTL | Trivial | None |
| 3D | Admin email hardcoding | Low | Low (test admin access) |
| 3E | Admin search fix | Low | Low (test admin search) |
| 4A | Search quality tweaks | Low | Low (test known queries) |
| 4B | Foursquare evaluation | Medium | None (additive) |
| 4C | Nearby cache TTL | Trivial | None |
| 5 | RLS | High | High (previous issues) |
