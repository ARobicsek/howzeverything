// src/styles/themes.ts

export type ColorPalette = {
  // Primary Colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  // Neutral Grays
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray900: string;
  // Blue variants
  blue50: string;
  blue100: string;
  blue200: string;
  blue600: string;
  blue700: string;
  blue800: string;
  // Green variants
  green100: string;
  green700: string;
  // Red variants
  red50: string;
  red200: string;
  red700: string;
  // Base Colors
  white: string;
  black: string;
  // Shadow & Overlay
  shadowLight: string;
  shadowMedium: string;
  overlay: string;
  // Rating Colors
  ratingGold: string;
  ratingGoldLight: string;
  ratingEmpty: string;
  // Action Colors
  danger: string;
  success: string;
  warning: string;
  // Navigation
  navBar: string;
  navBarDark: string;
  navBarBorder: string;
  // Text Colors
  text: string;
  textSecondary: string;
  textWhite: string;
  // Background Colors
  background: string;
  cardBg: string;
  inputBg: string;
  // Legacy mappings
  star: string;
  starEmpty: string;
  starCommunity: string;
  starCommunityEmpty: string;
  secondary: string;
  iconPrimary: string;
  iconBackground: string;
  // Aliases
  error: string;
  surface: string;
  border: string;
  textPrimary: string;
};

export type Themes = {
  [key: string]: ColorPalette;
};

export const THEMES: Themes = {
  default: {
    // Primary Colors
    primary: '#2563EB', // Main accent, buttons, links
    primaryHover: '#1D4ED8', // Hover states
    primaryLight: '#DBEAFE', // Light backgrounds, highlights
    accent: '#642e32', // NEW: Accent color for sliders, etc.
    // Neutral Grays
    gray50: '#F9FAFB', // Page backgrounds
    gray100: '#F3F4F6', // Card backgrounds
    gray200: '#E5E7EB', // Borders, dividers
    gray300: '#D1D5DB', // Disabled states
    gray400: '#9CA3AF', // Placeholder text
    gray500: '#6B7280', // Secondary text
    gray600: '#586780', // Custom secondary text / stats
    gray700: '#374151', // Primary text
    gray900: '#111827', // Headers, emphasis
    // Blue variants (needed for new components)
    blue50: '#EFF6FF',
    blue100: '#DBEAFE',
    blue200: '#BFDBFE',
    blue600: '#2563EB',
    blue700: '#1D4ED8',
    blue800: '#1E40AF',
    // Green variants (needed for success states)
    green100: '#DCFCE7',
    green700: '#15803D',
    // Red variants (needed for error states)
    red50: '#FEF2F2',
    red200: '#FECACA',
    red700: '#B91C1C',
    // Base Colors
    white: '#FFFFFF', // Pure white for cards, modals
    black: '#000000', // Text, borders
    // Shadow & Overlay
    shadowLight: 'rgba(0, 0, 0, 0.05)', // Subtle shadows
    shadowMedium: 'rgba(0, 0, 0, 0.1)', // Card shadows
    overlay: 'rgba(0, 0, 0, 0.6)', // Modal overlays
    // Rating Colors (No Green)
    ratingGold: '#F59E0B', // Star fills, rating highlights
    ratingGoldLight: '#FEF3C7', // Rating backgrounds
    ratingEmpty: '#E5E7EB', // Empty stars
    // Action Colors
    danger: '#EF4444', // Delete actions
    success: '#10B981', // Success states
    warning: '#F59E0B', // Warning states
    // Navigation
    navBar: '#FFFFFF', // Clean white navigation
    navBarDark: '#101010', // NEW: Dark background for navigation elements
    navBarBorder: '#E5E7EB', // Navigation border
    // Text Colors (simplified)
    text: '#374151', // Primary text (gray-700)
    textSecondary: '#6B7280', // Secondary text (gray-500)
    textWhite: '#FFFFFF', // White text
    // Background Colors
    background: '#F9FAFB', // Main page background (gray-50)
    cardBg: '#FFFFFF', // Card backgrounds
    inputBg: '#FFFFFF', // Input backgrounds
    // Legacy mappings for compatibility
    star: '#2563EB', // Personal rating (blue)
    starEmpty: '#E5E7EB', // Empty stars
    starCommunity: '#F59E0B', // Community rating (gold)
    starCommunityEmpty: '#E5E7EB', // Empty community stars
    secondary: '#6B7280', // Secondary color
    iconPrimary: '#374151', // Icon color
    iconBackground: '#FFFFFF', // Icon button backgrounds
    // NEW: Aliases for common color usages in AdminScreen
    error: '#EF4444', // Maps to danger
    surface: '#FFFFFF', // Maps to white/cardBg
    border: '#E5E7EB', // Maps to gray200
    textPrimary: '#374151', // Maps to text
  },
};
