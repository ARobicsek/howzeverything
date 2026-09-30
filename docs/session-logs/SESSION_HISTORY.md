# Session History

> Concise log of development sessions. The git log is the authoritative implementation history.

| Date | Developer | Summary | Key Commits |
|------|-----------|---------|-------------|
| Sep 30, 2026 | Claude Code | Site down: Supabase paused because GitHub auto-disabled the keep-alive workflow (needs manual re-enable). Added AuthContext loading timeout. Found real root cause of intermittent photo upload failure (card collapse on `dishes` change unmounted the upload modal/input) and fixed it structurally. | `77675b7`, `f01ab04` |
| Mar 23, 2026 | Claude Code | Phase 4B: Foursquare evaluation — signed up, created+deployed foursquare-proxy edge function, tested 5 queries. Foursquare significantly better than Geoapify. New API: places-api.foursquare.com with Bearer auth. Migration next. | pending |
| Mar 22, 2026 | Claude Code | Phase 4A+4C: Search quality — word-match 80%→50%, lat/lon dedup, name-filtered Places API for location searches, radius 80→30km, nearby cache 24h→3h, CORS dynamic allowlist, deployed all edge functions | `3444565` |
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
- **Photo upload robustness (Sep 30, 2026)**: The file input and upload modal render regardless of the card's expanded state, and MenuScreen only changes `expandedDishId` from the URL when the `?dish=` param changes. Don't reintroduce effects that reset `expandedDishId` on data changes. The older picker-protection refs and the 15s `justAddedDishId` timer remain but are no longer what keeps uploads working.
- **Keep-alive workflow**: GitHub disables scheduled workflows after 60 days without repo activity; re-enable manually in the Actions tab if Supabase pauses again.
