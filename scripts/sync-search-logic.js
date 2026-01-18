#!/usr/bin/env node

// sync-search-logic.js
// Keeps the dish-search edge function's search logic in sync with the master version

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourceFile = path.join(__dirname, 'supabase/functions/_shared/search-logic.ts');
const targetFile = path.join(__dirname, 'supabase/functions/dish-search/search-logic.ts');

try {
  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ Source file not found:', sourceFile);
    process.exit(1);
  }

  // Copy the file
  fs.copyFileSync(sourceFile, targetFile);
  console.log('✅ Successfully synced search-logic.ts to dish-search directory');
  
  // Get file stats to show when it was last modified
  const stats = fs.statSync(sourceFile);
  console.log(`📅 Source file last modified: ${stats.mtime.toISOString()}`);
  
} catch (error) {
  console.error('❌ Error syncing search logic:', error.message);
  process.exit(1);
}