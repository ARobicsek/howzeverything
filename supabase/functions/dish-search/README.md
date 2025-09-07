# Dish Search Edge Function

This edge function provides authenticated dish search with categorical expansion.

## Search Logic Dependency

This function imports `search-logic.ts` locally to avoid Supabase deployment issues with shared imports. 

**Important**: The `search-logic.ts` file in this directory is **generated** from `../_shared/search-logic.ts`.

### To Update Search Logic:

1. Edit the master file: `supabase/functions/_shared/search-logic.ts`
2. Run the sync command: `npm run sync-search`
3. Deploy the updated edge function

**DO NOT** edit `search-logic.ts` directly in this directory - your changes will be overwritten.

### Automatic Sync

```bash
npm run sync-search
```

This ensures the dish-search function always uses the latest search logic without maintaining duplicates manually.