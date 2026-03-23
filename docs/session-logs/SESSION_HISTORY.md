# Session History

> Concise log of development sessions. The git log is the authoritative implementation history.

| Date | Developer | Summary | Key Commits |
|------|-----------|---------|-------------|
| Mar 22, 2026 | Claude Code | Phase 4A+4C: Search quality — word-match 80%→50%, lat/lon dedup, name-filtered Places API for location searches, radius 80→30km, nearby cache 24h→3h, CORS dynamic allowlist, deployed all edge functions | pending |
| Mar 21, 2026 | Claude Code | Phase 3: CORS restriction, SELECT * fix, cache TTL, admin email hardcoding fix, admin search fix | `c8f6c5c` |
| Jan 18, 2026 | Gemini | Fixed photo upload modal intermittent failure - replaced timeout-based protection with permanent picker-open tracking | `9555e68` |
| Jan 18, 2026 | Gemini | Project directory cleanup - reorganized 311 files into app/, archive/, assets/, docs/ structure | (no code changes) |
| Jan 18, 2026 | Gemini | Added Supabase keep-alive edge function + GitHub Actions workflow (Mon/Thu) to prevent project pausing | `9f7c40c` |
| Nov 9, 2025 | Claude Code | Restaurant search optimization - increased API limits to 100, added street-level "on" keyword detection | `781ac75`, `cbb23fe` |
| Nov 8, 2025 | Claude Code | Implemented forgot/reset password flow (ForgotPasswordForm, ResetPasswordForm, admin reset script) | merged via PR |
| Nov 8, 2025 | Claude Code | Fixed photo upload modal failures - memory-efficient previews (ObjectURL), click protection, processing guard | `ed3cfb3`, `5639e38`, `53c7e7a` |
| Nov 8, 2025 | Claude Code | Fixed new-dish photo upload race condition - extended justAddedDishId timer from 4s to 15s, added Eruda debugger | `4de5253`, `b836b59`, `687bab3` |

## Notable Decisions

- **Dual API strategy**: Places API + Geocoding API together provide best restaurant search coverage. Removing either makes results worse (tested Nov 9).
- **Eruda debugger**: Left in production, activated via `?debug=true` URL param. OK per user preference.
- **Photo upload protection**: Uses permanent file-picker-open ref + window focus listener instead of timeout-based approach.
- **justAddedDishId timer**: 15 seconds (was 4s) to allow time for photo selection on new dishes.
