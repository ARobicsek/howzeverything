// src/hooks/useTheme.ts
// Re-export the hook from ThemeContext for easier imports
export { useTheme } from '../contexts/ThemeContext';

// Helper function to get theme-specific asset paths
export const getThemeAsset = (assetKey: string, fallback: string = '') => {
  // This will be imported in components that need it
  // For now, it's a placeholder - components will import useTheme directly
  console.log('getThemeAsset called with:', assetKey); // Temporary to avoid unused param error
  return fallback;
};