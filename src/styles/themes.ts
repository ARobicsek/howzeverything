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
  // Page-specific backgrounds
  homeBackground: string;
  menuBackground: string;
  findRestaurantBackground: string;
  discoveryBackground: string;
  ratingsBackground: string;
  profileBackground: string;
  adminBackground: string;
  aboutBackground: string;
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
    // Page-specific backgrounds (default theme uses same background)
    homeBackground: '#F9FAFB',
    menuBackground: '#F9FAFB',
    findRestaurantBackground: '#F9FAFB',
    discoveryBackground: '#F9FAFB',
    ratingsBackground: '#F9FAFB',
    profileBackground: '#F9FAFB',
    adminBackground: '#F9FAFB',
    aboutBackground: '#F9FAFB'
  },
  '90s': {
    // Primary Colors - Neon and Electric
    primary: '#FF00FF', // Electric magenta for main actions
    primaryHover: '#E600E6', // Darker magenta for hover
    primaryLight: '#FF66FF', // Light magenta backgrounds
    accent: '#00FFFF', // Electric cyan accent
    // Neon Grays with dark theme feel
    gray50: '#1A0D26', // Dark purple background
    gray100: '#2D1B3D', // Darker card backgrounds
    gray200: '#3D2954', // Borders with purple tint
    gray300: '#4D3664', // Disabled states
    gray400: '#6B4C85', // Placeholder text with purple
    gray500: '#8A6BA3', // Secondary text
    gray600: '#A488C1', // Custom secondary text
    gray700: '#C2A6DE', // Primary text - light purple
    gray900: '#E6D9FF', // Headers - very light purple
    // Neon Blue variants
    blue50: '#001A33',
    blue100: '#003366',
    blue200: '#0066CC',
    blue600: '#0099FF',
    blue700: '#00CCFF',
    blue800: '#00FFFF',
    // Neon Green variants
    green100: '#003300',
    green700: '#00FF00',
    // Neon Red variants
    red50: '#330000',
    red200: '#660000',
    red700: '#FF0000',
    // Base Colors - high contrast
    white: '#FFFFFF',
    black: '#000000',
    // Neon Shadows & Overlay
    shadowLight: 'rgba(255, 0, 255, 0.3)', // Magenta glow
    shadowMedium: 'rgba(0, 255, 255, 0.4)', // Cyan glow
    overlay: 'rgba(26, 13, 38, 0.9)', // Dark purple overlay
    // Neon Rating Colors
    ratingGold: '#FFFF00', // Electric yellow
    ratingGoldLight: '#FFFF99', // Light yellow
    ratingEmpty: '#4D3664', // Dark purple for empty
    // Neon Action Colors
    danger: '#FF0040', // Electric red
    success: '#00FF40', // Electric green
    warning: '#FFFF00', // Electric yellow
    // Navigation - Hot pink top bar
    navBar: '#1A0D26', // Dark purple navigation
    navBarDark: '#FF1493', // Hot pink background for top navigation
    navBarBorder: '#FF00FF', // Magenta border
    // Text Colors - high contrast on dark
    text: '#E6D9FF', // Light purple text
    textSecondary: '#A488C1', // Medium purple text
    textWhite: '#FFFFFF', // Pure white text
    // Background Colors - wild different colors per page
    background: '#0D0515', // Very dark purple background (default)
    cardBg: '#1A0D26', // Dark purple cards
    inputBg: '#2D1B3D', // Darker input backgrounds
    // Legacy mappings for compatibility
    star: '#FFFF00', // Electric yellow stars
    starEmpty: '#4D3664', // Dark purple empty
    starCommunity: '#00FFFF', // Cyan community rating
    starCommunityEmpty: '#4D3664', // Dark purple empty
    secondary: '#00FFFF', // Cyan secondary
    iconPrimary: '#E6D9FF', // Light purple icons
    iconBackground: '#2D1B3D', // Dark purple icon backgrounds
    // Aliases for common color usages
    error: '#FF0040', // Electric red
    surface: '#1A0D26', // Dark purple surface
    border: '#FF00FF', // Magenta borders
    textPrimary: '#E6D9FF', // Light purple primary text
    // Page-specific wild backgrounds
    homeBackground: 'linear-gradient(45deg, #FF0080, #8000FF, #0080FF)', // Hot pink to purple to blue
    menuBackground: 'linear-gradient(135deg, #00FF80, #80FF00, #FFFF00)', // Electric green to lime to yellow
    findRestaurantBackground: 'linear-gradient(45deg, #FF4000, #FF8000, #FFFF00)', // Orange to red to yellow flame
    discoveryBackground: 'linear-gradient(180deg, #0040FF, #8000FF, #FF0080)', // Blue to purple to pink
    ratingsBackground: 'linear-gradient(225deg, #FF0040, #FF4080, #8040FF)', // Electric red to pink to purple
    profileBackground: 'linear-gradient(90deg, #40FF00, #00FFFF, #0080FF)', // Lime to cyan to blue
    adminBackground: 'linear-gradient(315deg, #FF8000, #FFFF00, #80FF00)', // Orange to yellow to lime
    aboutBackground: 'linear-gradient(270deg, #8000FF, #FF0080, #FF4000)', // Purple to magenta to red
  },
};
