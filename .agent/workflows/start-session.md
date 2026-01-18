---
description: Start a development session on the HowzEverything project
---

# Start Session Workflow

Follow these steps at the beginning of each development session:

## 1. Review Current State
// turbo
Read the PROGRESS.md file to understand current project state:
```
cat docs/session-logs/PROGRESS.md
```

## 2. Check Git Status
// turbo
Verify clean working directory:
```
git status
```

## 3. Review Context (If Needed)
- Check "Session Notes" section in PROGRESS.md for handoff context
- For deeper history on specific features, see `docs/session-logs/SESSION_HISTORY.md`
- For architecture questions, see `docs/architecture/TECHNICAL_DOCUMENTATION.md`

## 4. Verify Development Environment
// turbo
Start the development server to ensure everything works:
```
npm run dev
```

## 5. Update PROGRESS.md
Add today's date to "Session Notes" section and note what you're working on.

---

**You're ready to start development!**
