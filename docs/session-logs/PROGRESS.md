# HowzEverything - Project Progress

> **Last Updated:** March 21, 2026
> **Status:** Active Development

## Current State

### Production
- **Live URL**: https://howzeverything.netlify.app
- **Backend**: Supabase (cjznbkcurzotvusorjec)
- **Git Branch**: `main`

### Recent Work
- ✅ Fixed photo upload modal intermittent failure (Jan 18)
- ✅ Fixed daily tracker values not persisting (Jan 18)
- ✅ Added Supabase keep-alive to prevent project pausing (Jan 18)
- ✅ Project directory reorganization (Jan 18)

## Known Issues

None blocking currently.

## Next Priorities

See [WORKPLAN.md](../WORKPLAN.md) for the full improvement roadmap.

Next up: Phase 1 (session management cleanup) and Phase 2 (PWA conversion).

---

## Session Notes

**March 21, 2026 (Claude Opus 4.6):** Comprehensive codebase review completed. Created WORKPLAN.md with 5 phases of improvements. Key findings: no PWA support, search quality limited by Geoapify/OSM data coverage, CORS wildcards on edge functions, SELECT * on every search, bloated session history. RLS was previously tried and disabled - not revisiting unless app goes public.

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
