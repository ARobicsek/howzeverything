---
description: End a development session on the HowzEverything project
---

# End Session Workflow

Follow these steps when finishing a development session:

## 1. Verify Build
// turbo
Ensure the project builds successfully:
```
npm run build
```

## 2. Run Type Check
// turbo
Verify no TypeScript errors:
```
npm run type-check
```

## 3. Update Documentation

### Always: Update PROGRESS.md
Update `docs/session-logs/PROGRESS.md` with:
- Move any completed items to "Recent Work" section
- Update "Known Issues" if any were discovered
- Update "Next Priorities" based on work done
- Add any handoff notes to "Session Notes" section

### If Significant Work: Update SESSION_HISTORY.md
**For complex features, debugging, or investigations**, add a detailed entry to `docs/session-logs/SESSION_HISTORY.md`:
- Prepend new entry at the top (newest first)
- Include: Date, Problem Statement, Solution, Files Modified, Commits
- Follow the existing entry format

**Skip this for**: Simple bug fixes, minor UI tweaks, documentation-only changes.

## 4. Commit Changes
// turbo
Stage and review changes:
```
git status
git add -A
git diff --staged --stat
```

Then commit with a descriptive message:
```
git commit -m "descriptive message here"
```

## 5. Push Changes
// turbo
Push to remote:
```
git push
```

---

**Session complete!** Documentation is ready for the next developer.
