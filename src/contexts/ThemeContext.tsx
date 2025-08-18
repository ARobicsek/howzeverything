// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeSpec, GeneratedTheme } from '../styles/themeEngine';

// Use the new GeneratedTheme interface from the engine
export type Theme = GeneratedTheme;

export interface ThemeContextType {
  currentTheme: string;
  theme: Theme;
  availableThemes: Theme[];
  switchTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Minimal theme specifications - Phase 2 engine-driven approach
const THEME_SPECS: { [key: string]: ThemeSpec } = {
  victorian: {
    id: 'victorian',
    name: 'Nouveau Victorian',
    description: 'Elegant and refined with classic sensibilities',
    colors: {
      primary: '#2563EB',    // Royal blue
      surface: '#F9FAFB',    // Light gray  
      text: '#374151',       // Dark gray
      accent: '#642e32',     // Deep burgundy
    },
    typography: {
      primaryFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      headingFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontScaleRatio: 1.25,  // Perfect fourth scale
    },
    geometry: {
      baseSpacingUnit: 16,      // 1rem base
      baseBorderRadius: 8,      // Moderate rounded corners
      shadowPreset: 'soft',     // Subtle, refined shadows
    },
  },
  '90s': {
    id: '90s',
    name: 'Neon 90s',
    description: 'Electric cyberpunk aesthetics with neon colors',
    colors: {
      primary: '#FF00FF',    // Electric magenta
      surface: '#0D0515',    // Very dark purple
      text: '#fecd06',       // Electric yellow
      accent: '#00FFFF',     // Electric cyan
    },
    typography: {
      primaryFont: '"Courier New", "Monaco", "Lucida Console", monospace',
      headingFont: '"Impact", "Arial Black", "Helvetica Inserat", fantasy',
      fontScaleRatio: 1.3,   // Aggressive scale for impact
    },
    geometry: {
      baseSpacingUnit: 16,      // Same base for consistency
      baseBorderRadius: 0,      // Sharp, angular edges
      shadowPreset: 'glow',     // Neon glow effects
    },
  },
  'grumpy-cat': {
    id: 'grumpy-cat',
    name: 'Grumpy Cat',
    description: 'Playful, warm colors, inspired by argyle blankets and the enduring grumpiness of cats',
    colors: {
      primary: '#dd5a14',    // Warm orange-brown
      surface: '#fbeedd',    // Cream background
      text: '#ca4719',       // Darker orange-brown text
      accent: '#ee9d2a',     // Golden accent
    },
    typography: {
      primaryFont: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      headingFont: '"Comfortaa", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontScaleRatio: 1.25,  // Balanced scale
    },
    geometry: {
      baseSpacingUnit: 16,      // Standard base
      baseBorderRadius: 4,      // Gently rounded corners
      shadowPreset: 'soft',     // Soft shadows
    },
  },
};

// Specific color overrides to match original themes exactly
const THEME_COLOR_OVERRIDES: { [themeId: string]: Partial<Theme['colors']> } = {
  '90s': {
    // Copy EVERY color from the original 90s theme exactly
    primary: '#FF00FF',              // Electric magenta for main actions
    primaryHover: '#E600E6',         // Darker magenta for hover
    primaryLight: '#FF66FF',         // Light magenta backgrounds
    accent: '#00FFFF',               // Electric cyan accent
    
    // Neon Grays with dark theme feel
    gray50: '#1A0D26',               // Dark purple background
    gray100: '#2D1B3D',              // Darker card backgrounds
    gray200: '#3D2954',              // Borders with purple tint
    gray300: '#4D3664',              // Disabled states
    gray400: '#6B4C85',              // Placeholder text with purple
    gray500: '#8A6BA3',              // Secondary text
    gray600: '#A488C1',              // Custom secondary text
    gray700: '#fecd06',              // Primary text - electric yellow with glow
    gray900: '#fecd06',              // Headers - electric yellow with glow
    
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
    overlay: 'rgba(26, 13, 38, 0.9)',       // Dark purple overlay
    
    // Neon Rating Colors
    ratingGold: '#FFFF00',           // Electric yellow
    ratingGoldLight: '#FFFF99',      // Light yellow
    ratingEmpty: '#4D3664',          // Dark purple for empty
    
    // Neon Action Colors
    danger: '#FF0040',               // Electric red
    success: '#00FF40',              // Electric green
    warning: '#FFFF00',              // Electric yellow
    
    // Navigation - Hot pink top bar
    navBar: '#1A0D26',               // Dark purple navigation
    navBarDark: '#FF1493',           // Hot pink background for top navigation
    navBarBorder: '#FF00FF',         // Magenta border
    
    // Text Colors - high contrast on dark
    text: '#fecd06',                 // Electric yellow text with glow
    textSecondary: '#C2A6DE',        // Lighter purple for secondary text
    textWhite: '#FFFFFF',            // Pure white text
    
    // Background Colors
    background: '#0D0515',           // Very dark purple background (default)
    cardBg: '#1A0D26',               // Dark purple cards
    inputBg: '#2D1B3D',              // Darker input backgrounds
    
    // Legacy mappings for compatibility
    star: '#00FFFF',                 // Electric cyan stars (matches restaurant names)
    starEmpty: '#4D3664',            // Dark purple empty
    starCommunity: '#fecd06',        // Electric yellow community rating (matches dish name color)
    starCommunityEmpty: '#4D3664',   // Dark purple empty
    secondary: '#00FFFF',            // Cyan secondary
    iconPrimary: '#fecd06',          // Electric yellow icons with glow
    iconBackground: '#2D1B3D',       // Dark purple icon backgrounds
    
    // Aliases for common color usages
    error: '#FF0040',                // Electric red
    surface: '#1A0D26',              // Dark purple surface
    border: '#FF00FF',               // Magenta borders
    textPrimary: '#fecd06',          // Electric yellow primary text with glow
    
    // Semantic tokens for component-specific needs
    ratingBreakdownBackground: 'transparent', // Transparent background for 90s rating breakdown
    starOutlineMode: true, // Use outline mode for stars in 90s theme
    avatarFontFamily: '"Courier New", "Monaco", "Lucida Console", monospace', // 90s theme uses monospace for avatar
    appBackground: 'linear-gradient(135deg, #0D0515 0%, #1A0D26 25%, #2D1B3D 50%, #0D0515 75%, #0D0515 100%)', // 90s theme gradient background
    // AboutScreen semantic tokens for 90s theme
    aboutHeaderBackground: 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)',
    aboutContainerMaxWidth: '700px',
    aboutContainerPadding: '0 24px',
    aboutHeroImageBorder: 'none',
    aboutHeroImageBorderRadius: '0px',
    aboutHeroImageWidth: '200px',
    aboutHeadingTextShadow: '0 0 15px #ff00ff, 0 0 30px #ff00ff',
    aboutSectionPadding: '24px 0',
    aboutCtaCardBackground: 'rgba(255, 0, 255, 0.1)',
    aboutCtaCardBorder: '2px solid #ff00ff',
    aboutCtaCardBoxShadow: '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.1)',
    aboutCtaButtonBackground: '#ff00ff',
    aboutCtaButtonPadding: '16px 32px',
    aboutCtaButtonBoxShadow: '0 0 20px #ff00ff, 0 4px 15px rgba(255, 0, 255, 0.4)',
    aboutCtaButtonTextShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
    // Text styling semantic tokens for 90s theme
    aboutHeadingColor: '#FFFFFF',
    aboutHeadingFontWeight: '700',
    aboutHeadingLineHeight: '1.2',
    aboutBodyColor: '#FFFFFF',
    aboutBodyFontSize: '1.125rem',
    aboutCtaHeadingColor: '#fecd06',
    aboutCtaHeadingFontSize: '1.75rem',
    aboutCtaHeadingFontWeight: '700',
    aboutCtaHeadingLineHeight: '1.2',
    aboutCtaBodyLineHeight: '1.6',
    aboutButtonFontSize: '1.125rem',
    aboutButtonBorderRadius: '12px',
    // FindRestaurantScreen semantic tokens for 90s theme
    findRestaurantHeaderBackground: 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)',
    findRestaurantHeroImageWidth: '200px',
    findRestaurantHeroImageBorder: 'none',
    findRestaurantHeroImageBorderRadius: '0px',
    findRestaurantTitleTextShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
    findRestaurantSearchBorder: '2px solid #ff00ff',
    findRestaurantSearchShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
    findRestaurantInputBorder: '2px solid #ff00ff',
    findRestaurantDistanceColor: '#111827',
    // MenuScreen semantic tokens for 90s theme
    menuSearchContainerBackground: 'transparent',
    menuSearchContainerBackdropFilter: 'none',
    menuSearchTitleColor: '#ff00ff',
    menuInputBorder: 'none',
    menuInputBoxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
    menuHeaderBackground: 'rgba(13, 5, 21, 0.95)',
    menuHeaderBoxShadow: '0 2px 20px rgba(255, 0, 255, 0.2)',
    menuRestaurantNameTextShadow: '0 0 10px #ff00ff',
    menuPinButtonFilter: 'drop-shadow(0 0 5px #ff00ff)',
    menuEmptyStateIconColor: '#ff00ff',
    // Star styling
    starBorderWidth: '1',
    // DiscoveryScreen semantic tokens for 90s theme
    discoveryRestaurantNameColor: '#00FFFF',
    discoveryRestaurantDistanceColor: '#00FFFF',
    discoveryHeaderBackground: 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)',
    discoveryHeroImageStyle: {
      width: '200px',
      height: '200px',
      objectFit: 'contain',
      marginBottom: '24px',
      border: 'none',
      borderRadius: '0px'
    },
    discoveryHeadingTextShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
    discoverySearchInputBorder: '2px solid #ff00ff',
    discoverySearchInputBoxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
    discoverySelectBorder: '2px solid #640464',
    // RatingsScreen semantic tokens for 90s theme
    ratingsHeaderBackground: 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)',
    ratingsHeroImageWidth: '200px',
    ratingsHeroImageBorder: 'none',
    ratingsHeroImageBorderRadius: '0px',
    ratingsTitleTextShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
    ratingsSearchBorder: '2px solid #ff00ff',
    ratingsSearchShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
    
    // LoginForm semantic tokens for 90s theme
    loginFormContainer: {
      backgroundColor: '#1A0D26',
      border: '2px solid #ff00ff',
      boxShadow: '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.1)',
      borderRadius: '0px',
    },
    loginFormHeaderTitleColor: '#fecd06',
    loginFormHeaderTitleTextShadow: '0 0 15px #ff00ff, 0 0 30px #ff00ff',
    loginFormHeaderSubtitleColor: '#C2A6DE',
    loginFormErrorBackground: 'rgba(255, 0, 64, 0.2)',
    loginFormErrorBorder: '1px solid #FF0040',
    loginFormErrorTextColor: '#FF0040',
    loginFormLabelColor: '#C2A6DE',
    loginFormInputBackground: '#2D1B3D',
    loginFormInputBorder: '2px solid #ff00ff',
    loginFormInputBoxShadow: '0 0 10px rgba(255, 0, 255, 0.2)',
    loginFormInputColor: '#fecd06',
    loginFormSubmitButtonBackground: '#ff00ff',
    loginFormSubmitButtonHoverBackground: '#E600E6',
    loginFormSubmitButtonTextColor: '#FFFFFF',
    loginFormSubmitButtonBoxShadow: '0 0 20px #ff00ff, 0 4px 15px rgba(255, 0, 255, 0.4)',
    loginFormModeToggleColor: '#00FFFF',
    loginFormCancelColor: '#C2A6DE',
    loginFormPasswordToggleColor: '#C2A6DE',
    
    // MenuScreen sort options box for 90s theme
    menuSortOptionsContainer: {
      backgroundColor: '#1A0D26',
      border: '2px solid #ff00ff',
      boxShadow: '0 0 20px rgba(255, 0, 255, 0.3), inset 0 0 20px rgba(255, 0, 255, 0.1)',
      borderRadius: '0px',
    },
    menuSortButtonDefault: {
      backgroundColor: '#2D1B3D',
      border: '2px solid #640464',
      color: '#fecd06',
      boxShadow: '0 0 10px rgba(255, 0, 255, 0.2)',
    },
    menuSortButtonActive: {
      backgroundColor: '#ff00ff',
      border: '2px solid #ff00ff',
      color: '#FFFFFF',
      boxShadow: '0 0 15px rgba(255, 0, 255, 0.4)',
    },
    
    // Restaurant name modal semantic tokens for 90s theme
    restaurantModalContainer: {
      backgroundColor: '#1A0D26',
      border: '2px solid #ff00ff',
      boxShadow: '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.1)',
      borderRadius: '0px',
    },
    restaurantModalNameColor: '#fecd06',
    restaurantModalNameTextShadow: '0 0 15px #ff00ff, 0 0 30px #ff00ff',
    restaurantModalAddressColor: '#C2A6DE',
    restaurantModalCloseButtonBackground: '#ff00ff',
    restaurantModalCloseButtonHoverBackground: '#E600E6',
    restaurantModalCloseButtonTextColor: '#FFFFFF',
    restaurantModalCloseButtonBoxShadow: '0 0 20px #ff00ff, 0 4px 15px rgba(255, 0, 255, 0.4)',
  },
  
  victorian: {
    // Copy EVERY color from the original Victorian theme exactly
    primary: '#2563EB',              // Main accent, buttons, links
    primaryHover: '#1D4ED8',         // Hover states
    primaryLight: '#DBEAFE',         // Light backgrounds, highlights
    accent: '#642e32',               // NEW: Accent color for sliders, etc.
    
    // Neutral Grays
    gray50: '#F9FAFB',               // Page backgrounds
    gray100: '#F3F4F6',              // Card backgrounds
    gray200: '#E5E7EB',              // Borders, dividers
    gray300: '#D1D5DB',              // Disabled states
    gray400: '#9CA3AF',              // Placeholder text
    gray500: '#6B7280',              // Secondary text
    gray600: '#586780',              // Custom secondary text / stats
    gray700: '#374151',              // Primary text
    gray900: '#111827',              // Headers, emphasis
    
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
    white: '#FFFFFF',                // Pure white for cards, modals
    black: '#000000',                // Text, borders
    
    // Shadow & Overlay
    shadowLight: 'rgba(0, 0, 0, 0.05)', // Subtle shadows
    shadowMedium: 'rgba(0, 0, 0, 0.1)',  // Card shadows
    overlay: 'rgba(0, 0, 0, 0.6)',       // Modal overlays
    
    // Rating Colors (No Green)
    ratingGold: '#F59E0B',           // Star fills, rating highlights
    ratingGoldLight: '#FEF3C7',      // Rating backgrounds
    ratingEmpty: '#E5E7EB',          // Empty stars
    
    // Action Colors
    danger: '#EF4444',               // Delete actions
    success: '#10B981',              // Success states
    warning: '#F59E0B',              // Warning states
    
    // Navigation
    navBar: '#FFFFFF',               // Clean white navigation
    navBarDark: '#101010',           // NEW: Dark background for navigation elements
    navBarBorder: '#E5E7EB',         // Navigation border
    
    // Text Colors (simplified)
    text: '#374151',                 // Primary text (gray-700)
    textSecondary: '#6B7280',        // Secondary text (gray-500)
    textWhite: '#FFFFFF',            // White text
    
    // Background Colors
    background: '#F9FAFB',           // Main page background (gray-50)
    cardBg: '#FFFFFF',               // Card backgrounds
    inputBg: '#FFFFFF',              // Input backgrounds
    
    // Legacy mappings for compatibility
    star: '#642e32',                 // Personal rating (brownish purple - accent)
    starEmpty: '#E5E7EB',            // Empty stars
    starCommunity: '#2563EB',        // Community rating (blue - primary)
    starCommunityEmpty: '#E5E7EB',   // Empty community stars
    secondary: '#6B7280',            // Secondary color
    iconPrimary: '#374151',          // Icon color
    iconBackground: '#FFFFFF',       // Icon button backgrounds
    
    // NEW: Aliases for common color usages in AdminScreen
    error: '#EF4444',                // Maps to danger
    surface: '#FFFFFF',              // Maps to white/cardBg
    border: '#E5E7EB',               // Maps to gray200
    textPrimary: '#374151',          // Maps to text
    
    // Semantic tokens for component-specific needs
    ratingBreakdownBackground: '#F9FAFB', // Gray-50 background for Victorian rating breakdown
    starOutlineMode: false, // Use filled mode for stars in Victorian theme
    avatarFontFamily: '"Pinyon Script", cursive', // Victorian theme uses elegant cursive for avatar
    appBackground: '#F9FAFB', // Victorian theme solid background
    // AboutScreen semantic tokens for Victorian theme
    aboutHeaderBackground: '#101010',
    aboutContainerMaxWidth: '700px',
    aboutContainerPadding: '0 32px',
    aboutHeroImageBorder: '2px solid #FFFFFF',
    aboutHeroImageBorderRadius: '12px',
    aboutHeroImageWidth: '180px',
    aboutHeadingTextShadow: 'none',
    aboutSectionPadding: '64px 0 96px',
    aboutCtaCardBackground: '#cac2af',
    aboutCtaCardBorder: 'none',
    aboutCtaCardBoxShadow: 'none',
    aboutCtaButtonBackground: '#642e32',
    aboutCtaButtonPadding: '12px 24px',
    aboutCtaButtonBoxShadow: 'none',
    aboutCtaButtonTextShadow: 'none',
    // Text styling semantic tokens for Victorian theme
    aboutHeadingColor: '#111827',
    aboutHeadingFontWeight: '600',
    aboutHeadingLineHeight: '2.5rem',
    aboutBodyColor: '#374151',
    aboutBodyFontSize: '1rem',
    aboutCtaHeadingColor: '#642e32',
    aboutCtaHeadingFontSize: '1.5rem',
    aboutCtaHeadingFontWeight: '600',
    aboutCtaHeadingLineHeight: '2rem',
    aboutCtaBodyLineHeight: '1.5',
    aboutButtonFontSize: '1rem',
    aboutButtonBorderRadius: '8px',
    // FindRestaurantScreen semantic tokens for Victorian theme
    findRestaurantHeaderBackground: '#101010',
    findRestaurantHeroImageWidth: '180px',
    findRestaurantHeroImageBorder: '2px solid #FFFFFF',
    findRestaurantHeroImageBorderRadius: '12px',
    findRestaurantTitleTextShadow: 'none',
    findRestaurantSearchBorder: '2px solid #E5E7EB',
    findRestaurantSearchShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    findRestaurantInputBorder: '2px solid #E5E7EB',
    findRestaurantDistanceColor: '#6B7280',
    // MenuScreen semantic tokens for Victorian theme
    menuSearchContainerBackground: 'rgba(255, 255, 255, 0.1)',
    menuSearchContainerBackdropFilter: 'blur(4px)',
    menuSearchTitleColor: '#111827',
    menuInputBorder: '2px solid #E5E7EB',
    menuInputBoxShadow: 'none',
    menuHeaderBackground: 'rgba(255, 255, 255, 0.95)',
    menuHeaderBoxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    menuRestaurantNameTextShadow: 'none',
    menuPinButtonFilter: 'none',
    menuEmptyStateIconColor: '#6B7280',
    // Star styling
    starBorderWidth: '2',
    // DiscoveryScreen semantic tokens for Victorian theme
    discoveryRestaurantNameColor: '#642e32',
    discoveryRestaurantDistanceColor: '#6B7280',
    discoveryHeaderBackground: '#101010',
    discoveryHeroImageStyle: {
      width: '180px',
      height: 'auto',
      objectFit: 'contain',
      marginBottom: '24px',
      border: '2px solid #FFFFFF',
      borderRadius: '12px'
    },
    discoveryHeadingTextShadow: 'none',
    discoverySearchInputBorder: '2px solid #E5E7EB',
    discoverySearchInputBoxShadow: 'none',
    discoverySelectBorder: '2px solid #E5E7EB',
    // RatingsScreen semantic tokens for Victorian theme
    ratingsHeaderBackground: '#101010',
    ratingsHeroImageWidth: '180px',
    ratingsHeroImageBorder: '2px solid #FFFFFF',
    ratingsHeroImageBorderRadius: '12px',
    ratingsTitleTextShadow: 'none',
    ratingsSearchBorder: '2px solid #E5E7EB',
    ratingsSearchShadow: 'none',
  },
  
  'grumpy-cat': {
    // Top navigation background - restore to cream
    navBar: '#fbeedd',
    navBarDark: '#fbeedd',
    
    // Background colors - restore to cream
    background: '#fbeedd',
    cardBg: '#fbeedd',
    inputBg: '#fbeedd',
    surface: '#fbeedd', // Ensure all surfaces use cream
    
    // Override border colors for visibility in Grumpy Cat theme
    gray200: '#e8dcc6', // Use cream border instead of gray for better visibility
    
    // Keep primary color for backgrounds but add specific border override
    iconButtonBorderActive: '#e8dcc6', // Use cream border for active icon buttons instead of orange
    iconButtonBorderInactive: '#e8dcc6', // Use cream border for inactive icon buttons
    
    // White text color for home screen (to match about screen)
    white: '#ca4719',
    textWhite: '#ca4719', 
    
    // Custom header background for all screen headers
    aboutHeaderBackground: '#df5d12',
    findRestaurantHeaderBackground: '#df5d12',
    discoveryHeaderBackground: '#df5d12',
    ratingsHeaderBackground: '#df5d12',
    menuHeaderBackground: 'rgba(251, 238, 221, 0.95)', // Cream color with transparency
    
    // Hero image styling for grumpy cat theme
    aboutHeroImageWidth: '180px',
    aboutHeroImageBorder: '2px solid #482107',
    aboutHeroImageBorderRadius: '4px',
    findRestaurantHeroImageWidth: '180px', 
    findRestaurantHeroImageBorder: '2px solid #482107',
    findRestaurantHeroImageBorderRadius: '4px',
    ratingsHeroImageWidth: '180px',
    ratingsHeroImageBorder: '2px solid #482107', 
    ratingsHeroImageBorderRadius: '4px',
    discoveryHeroImageStyle: {
      width: '180px',
      height: 'auto',
      objectFit: 'contain' as const,
      marginBottom: '24px',
      border: '2px solid #482107',
      borderRadius: '4px'
    },
    
    // Search and input styling - use cream backgrounds with subtle borders
    findRestaurantSearchBorder: '2px solid #e8dcc6',
    findRestaurantInputBorder: '2px solid #e8dcc6', 
    discoverySearchInputBorder: '2px solid #e8dcc6',
    ratingsSearchBorder: '2px solid #e8dcc6',
    menuInputBorder: '2px solid #e8dcc6',
    
    // Remove any colored shadows/effects from search inputs
    findRestaurantSearchShadow: 'none',
    discoverySearchInputBoxShadow: 'none',
    ratingsSearchShadow: 'none',
    menuInputBoxShadow: 'none',
    
    // Text shadows - none for clean look
    aboutHeadingTextShadow: 'none',
    findRestaurantTitleTextShadow: 'none',
    discoveryHeadingTextShadow: 'none',
    ratingsTitleTextShadow: 'none',
    menuRestaurantNameTextShadow: 'none',
    
    // CTA card styling for about screen
    aboutCtaCardBackground: '#f4d4b8',
    aboutCtaCardBorder: '2px solid #dd5a14',
    aboutCtaButtonBackground: '#dd5a14',
    
    // Menu specific styling
    menuSearchTitleColor: '#ca4719',
    menuEmptyStateIconColor: '#ee9d2a',
    
    // Star styling - use warm colors
    star: '#ee9d2a',
    starCommunity: '#dd5a14',
    
    // Distance colors
    findRestaurantDistanceColor: '#ca4719',
    discoveryRestaurantDistanceColor: '#ca4719',
    
    // Restaurant name colors
    discoveryRestaurantNameColor: '#dd5a14',
    
    // Navigation elements styling
    iconPrimary: '#df5d12', // Hamburger menu icon color
    iconBackground: '#df5d12', // Avatar button background
    
    // Rating card backgrounds - ensure cream color
    ratingBreakdownBackground: '#fbeedd', // Cream background for rating breakdown
    
    // Navigation modal - use golden color for admin items
    ratingGold: '#ee9d2a', // Golden accent color for Admin Panel and My Restaurants
    
    // Profile page sign out button - use white text for better visibility
    signOutButtonText: '#ffffff', // White text for sign out button
    
    // LoginForm semantic tokens for Grumpy Cat theme
    loginFormContainer: {
      backgroundColor: '#fbeedd',
      border: '2px solid #dd5a14',
      boxShadow: '0 4px 12px rgba(221, 90, 20, 0.15)',
      borderRadius: '4px',
      backgroundImage: `
        repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(221, 90, 20, 0.1) 14px, rgba(221, 90, 20, 0.1) 16px),
        repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(238, 157, 42, 0.08) 14px, rgba(238, 157, 42, 0.08) 16px)
      `,
    },
    loginFormHeaderTitleColor: '#482107',
    loginFormHeaderTitleTextShadow: 'none',
    loginFormHeaderSubtitleColor: '#ca4719',
    loginFormErrorBackground: 'rgba(221, 90, 20, 0.1)',
    loginFormErrorBorder: '1px solid #dd5a14',
    loginFormErrorTextColor: '#dd5a14',
    loginFormLabelColor: '#482107',
    loginFormInputBackground: '#fbeedd',
    loginFormInputBorder: '2px solid #e8dcc6',
    loginFormInputBoxShadow: 'none',
    loginFormInputColor: '#482107',
    loginFormSubmitButtonBackground: '#dd5a14',
    loginFormSubmitButtonHoverBackground: '#c54f11',
    loginFormSubmitButtonTextColor: '#ffffff',
    loginFormSubmitButtonBoxShadow: '0 2px 4px rgba(221, 90, 20, 0.2)',
    loginFormModeToggleColor: '#ee9d2a',
    loginFormCancelColor: '#ca4719',
    loginFormPasswordToggleColor: '#ca4719',
    
    // MenuScreen sort options box for Grumpy Cat theme
    menuSortOptionsContainer: {
      backgroundColor: '#fbeedd',
      border: '2px solid #482107',
      boxShadow: '0 4px 12px rgba(221, 90, 20, 0.15)',
      borderRadius: '4px',
      backgroundImage: `
        repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(221, 90, 20, 0.05) 14px, rgba(221, 90, 20, 0.05) 16px),
        repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(238, 157, 42, 0.04) 14px, rgba(238, 157, 42, 0.04) 16px)
      `,
    },
    menuSortButtonDefault: {
      backgroundColor: '#fbeedd',
      border: '2px solid #e8dcc6',
      color: '#482107',
      boxShadow: 'none',
    },
    menuSortButtonActive: {
      backgroundColor: '#dd5a14',
      border: '2px solid #e8dcc6',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(221, 90, 20, 0.2)',
    },
    
    // Restaurant name modal semantic tokens for Grumpy Cat theme
    restaurantModalContainer: {
      backgroundColor: '#fbeedd',
      border: '2px solid #dd5a14',
      boxShadow: '0 4px 12px rgba(221, 90, 20, 0.15)',
      borderRadius: '4px',
      backgroundImage: `
        repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(221, 90, 20, 0.1) 14px, rgba(221, 90, 20, 0.1) 16px),
        repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(238, 157, 42, 0.08) 14px, rgba(238, 157, 42, 0.08) 16px)
      `,
    },
    restaurantModalNameColor: '#482107',
    restaurantModalNameTextShadow: 'none',
    restaurantModalAddressColor: '#ca4719',
    restaurantModalCloseButtonBackground: '#dd5a14',
    restaurantModalCloseButtonHoverBackground: '#c54f11',
    restaurantModalCloseButtonTextColor: '#ffffff',
    restaurantModalCloseButtonBoxShadow: '0 2px 4px rgba(221, 90, 20, 0.2)',
    restaurantModalCloseButtonBorder: '2px solid #482107',
  },
};

// Font styling overrides for specific theme effects
const THEME_FONT_OVERRIDES: { [themeId: string]: Partial<Theme['fonts']> } = {
  '90s': {
    primary: {
      fontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
      letterSpacing: '0.05em',
      textShadow: '0 0 5px rgba(255, 0, 255, 0.5)', // Magenta glow
    },
    heading: {
      fontFamily: '"Impact", "Arial Black", "Helvetica Inserat", fantasy',
      fontWeight: '900',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.8)', // Cyan glow - CRITICAL
    },
    body: {
      fontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
      lineHeight: '1.6',
      letterSpacing: '0.02em',
    },
    elegant: {
      fontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
      letterSpacing: '0.05em',
      textShadow: '0 0 3px rgba(255, 0, 255, 0.3)', // Subtle magenta glow
    },
  },
};

// Effects overrides to match original theme behaviors exactly
const THEME_EFFECTS_OVERRIDES: { [themeId: string]: Partial<Theme['effects']> } = {
  '90s': {
    primaryButtonHover: {
      transform: 'translateY(-1px) scale(1.02)',
      boxShadow: `0 0 20px rgba(255, 0, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)`,
    },
    cardHover: {
      transform: 'translateY(-3px)',
      boxShadow: `0 0 25px rgba(255, 0, 255, 0.4), 0 0 50px rgba(0, 255, 255, 0.2)`,
    },
    glowEffect: {
      boxShadow: `0 0 15px rgba(255, 0, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3)`,
    },
  },
};

// Custom image mappings for existing assets
const CUSTOM_IMAGES: { [themeId: string]: Partial<Theme['images']> } = {
  victorian: {
    logo: '/HowzEverything.png',
    homeFindRestaurants: '/critic_2.png',
    homeDiscoverDishes: '/explorer_2.png',
    discoveryHero: '/stolen_dish.png',
    findRestaurantHero: '/finding_restaurant.png',
    ratingsHero: '/my_ratings.png',
    aboutHero: '/ordering.png',
    restaurantDefault: '/victorian_restaurant2.png',
  },
  '90s': {
    logo: '/90s logo.png',
    homeFindRestaurants: '/90s critic.png',
    homeDiscoverDishes: '/90s explorer.png',
    discoveryHero: '/90s discover.png',
    findRestaurantHero: '/90s find restaurant.png',
    ratingsHero: '/90s judge.png',
    aboutHero: '/90s about us.png',
    restaurantDefault: '/90s find restaurant.png', // Reuse for now
  },
  'grumpy-cat': {
    logo: '/cat_logo.png',
    homeFindRestaurants: '/cat_home_find_hero.jpg',
    homeDiscoverDishes: '/cat_home_dish_hero.JPG',
    discoveryHero: '/cat_discovery_hero.JPG',
    findRestaurantHero: '/cat_find_hero.JPG',
    ratingsHero: '/cat_ratings_hero.JPG',
    aboutHero: '/cat_about_hero.JPG',
    restaurantDefault: '/cat_find_hero.JPG', // Reuse find hero for restaurant default
  },
};

// Generate complete themes from minimal specifications and apply overrides
const THEME_DEFINITIONS: { [key: string]: Theme } = Object.fromEntries(
  Object.entries(THEME_SPECS).map(([key, spec]) => {
    const generatedTheme = createTheme(spec);
    // Apply overrides to match original themes exactly
    const colorOverrides = THEME_COLOR_OVERRIDES[key] || {};
    const fontOverrides = THEME_FONT_OVERRIDES[key] || {};
    const effectsOverrides = THEME_EFFECTS_OVERRIDES[key] || {};
    const imageOverrides = CUSTOM_IMAGES[key] || {};
    
    return [key, {
      ...generatedTheme,
      colors: {
        ...generatedTheme.colors,
        ...colorOverrides,
      },
      fonts: {
        ...generatedTheme.fonts,
        ...fontOverrides,
      },
      effects: {
        ...generatedTheme.effects,
        ...effectsOverrides,
      },
      images: {
        ...generatedTheme.images,
        ...imageOverrides,
      },
    }];
  })
);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or default to victorian
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('howzeverything-theme');
    return savedTheme && THEME_DEFINITIONS[savedTheme] ? savedTheme : 'victorian';
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('howzeverything-theme', currentTheme);
  }, [currentTheme]);

  const switchTheme = (themeId: string) => {
    if (THEME_DEFINITIONS[themeId]) {
      setCurrentTheme(themeId);
    } else {
      console.warn(`Theme '${themeId}' not found. Available themes:`, Object.keys(THEME_DEFINITIONS));
    }
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    theme: THEME_DEFINITIONS[currentTheme],
    availableThemes: Object.values(THEME_DEFINITIONS),
    switchTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};