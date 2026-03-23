# HowzEverything - Project Progress

> **Last Updated:** March 22, 2026
> **Status:** Active Development

## Current State

### Production
- **Live URL**: https://howzeverything.netlify.app
- **Backend**: Supabase (cjznbkcurzotvusorjec)
- **Git Branch**: `main`

### Recent Work
- ✅ Phase 4A+4C: Search quality improvements - lowered word-match filter (80%→50%), lat/lon dedup (>200m=different), removed broad catering search for name queries, nearby cache TTL 24h→3h (Mar 22)
- ✅ Phase 3: Low-risk security/perf fixes - CORS restriction, SELECT * fix, cache TTL, admin email hardcoding, admin search fix (Mar 21)
- ✅ Phase 1: Session management cleanup - trimmed SESSION_HISTORY.md, created root CLAUDE.md, simplified start-session workflow, deleted dead files (Mar 21)
- ✅ Phase 2: PWA conversion - vite-plugin-pwa, app icons, service worker, meta tags (Mar 21)
- ✅ Fixed photo upload modal intermittent failure (Jan 18)
- ✅ Fixed daily tracker values not persisting (Jan 18)
- ✅ Added Supabase keep-alive to prevent project pausing (Jan 18)
- ✅ Project directory reorganization (Jan 18)

## Known Issues

None blocking currently.

## Next Priorities

See [WORKPLAN.md](../WORKPLAN.md) for the full improvement roadmap.

Next up: Phase 4B (Foursquare evaluation).

---

## Session Notes

**March 22, 2026 (Claude Opus 4.6) - Session 4:** Completed Phase 4A and 4C (search quality improvements). Lowered word-match filter from 80% to 50% in searchService.ts to allow partial name matches. Replaced text-based deduplication with lat/lon distance check (>200m apart = different location) for both DB-vs-API and API-vs-API dedup. For location-specific searches (city/street), kept both Places API + Geocode API but added business name filtering to Places API results — eliminates noise while preserving POI coverage for chains like Dunkin'. Reduced city search radius from 80km to 30km for tighter results. Added type guard for non-string feature names. Reduced nearby restaurants cache TTL from 24h to 3h in useNearbyRestaurants.tsx. Updated CORS in all 5 edge functions to allow both production and localhost:3000 origins (dynamic allowlist). Deployed all 5 edge functions to Supabase.

**March 21, 2026 (Claude Opus 4.6) - Session 3:** Completed Phase 3 (low-risk security/perf fixes). Changed CORS from wildcard to howzeverything.netlify.app in all 5 edge functions. Fixed searchService.ts: replaced SELECT * with name-filtered query using specific columns, added 5-min TTL + 50-entry max to search cache. Replaced hardcoded admin email checks with profile.is_admin in 4 client files + admin-data edge function. Re-enabled shared search-logic import in admin-data (was stubbed out).

**March 21, 2026 (Claude Opus 4.6) - Session 2:** Completed Phase 1 (session management cleanup) and Phase 2 (PWA conversion). SESSION_HISTORY.md trimmed from 2,337 lines to ~25. Created root CLAUDE.md. Simplified start-session workflow. Deleted SupabaseDebugTest.tsx and 6 empty directories. Installed vite-plugin-pwa with manifest, service worker (generateSW mode), runtime caching for fonts (cache-first) and Supabase API (network-first). Generated PWA icons (192, 512, 180). Updated index.html with apple-mobile-web-app meta tags. App is now installable as PWA.

**March 21, 2026 (Claude Opus 4.6) - Session 1:** Comprehensive codebase review completed. Created WORKPLAN.md with 5 phases of improvements. Key findings: no PWA support, search quality limited by Geoapify/OSM data coverage, CORS wildcards on edge functions, SELECT * on every search, bloated session history. RLS was previously tried and disabled - not revisiting unless app goes public.

---

## Architecture Quick Reference

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Styling**: Tailwind CSS with design tokens in `src/constants.ts`
- **Key Files**:
  - `CLAUDE.md` - AI context file
  - `docs/architecture/TECHNICAL_DOCUMENTATION.md` - Full architecture
  - `docs/architecture/THEME_SYSTEM.md` - Theme documentation

## History

For detailed session history, see [SESSION_HISTORY.md](./SESSION_HISTORY.md).
