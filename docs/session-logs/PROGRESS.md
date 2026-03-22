# HowzEverything - Project Progress

> **Last Updated:** March 21, 2026
> **Status:** Active Development

## Current State

### Production
- **Live URL**: https://howzeverything.netlify.app
- **Backend**: Supabase (cjznbkcurzotvusorjec)
- **Git Branch**: `main`

### Recent Work
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

Next up: Phase 3 (low-risk security/perf fixes).

---

## Session Notes

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
