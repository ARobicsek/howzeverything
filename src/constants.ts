// src/constants.ts
import React from 'react'; // Import React to get React.CSSProperties


// --- NEW: Layout Controller for Restaurant Cards ---
export const RESTAURANT_CARD_MAX_WIDTH = '350px';


// NEW: Layout Configuration System
export const LAYOUT_CONFIG = {
  // App-level container settings
  APP_CONTAINER: {
    maxWidth: '1280px',
    padding: '1rem', // 16px
    paddingTop: '80px', // Space for top navigation
  },
  // Screen-specific max widths
  SCREEN_MAX_WIDTHS: {
    menu: 'none', // Full width within app container
    restaurants: '768px',
    findRestaurant: 'none', // Already has special handling
    ratings: 'none', // Set to none to allow full-bleed header
    profile: '370px',
    discovery: 'none', // Full bleed, handles its own width
    home: '1280px',
    about: '768px',
    admin: '1280px',
  } as Record<string, string>,
  // Component-level widths
  COMPONENT_WIDTHS: {
    dishCard: '100%', // Full width of container
    restaurantCard: '350px', // Already defined as RESTAURANT_CARD_MAX_WIDTH
    searchBar: '100%',
    header: '100%',
  },
  // Spacing for consistent gutters
  CONTENT_PADDING: {
    mobile: '1rem', // 16px
    tablet: '1.5rem', // 24px
    desktop: '2rem', // 32px
  }
};


export const COLORS = {
  // Primary Colors
  primary: '#642e32',
  primaryHover: '#4a2225',
  primaryLight: '#fdf8f8',
  accent: '#642e32',
  // Neutral Grays
  gray50: '#f9f9f9',
  gray100: '#f0f0f0',
  gray200: '#e0e0e0',
  gray300: '#cccccc',
  gray400: '#a0a0a0',
  gray500: '#808080',
  gray600: '#606060',
  gray700: '#404040',
  gray900: '#202020',
  // Blue variants
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  // Green variants
  green100: '#DCFCE7',
  green700: '#15803D',
  // Red variants
  red50: '#FEF2F2',
  red200: '#FECACA',
  red700: '#B91C1C',
  // Base Colors
  white: '#FFFFFF',
  black: '#000000',
  // Shadow & Overlay
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  // Rating Colors
  ratingGold: '#F59E0B',
  ratingGoldLight: '#FEF3C7',
  ratingEmpty: '#E5E7EB',
  // Action Colors
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  // Navigation
  navBar: '#1A1A1A',
  navBarDark: '#101010',
  navBarBorder: '#303030',
  // Text Colors
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  textWhite: '#FFFFFF',
  // Background Colors
  background: '#1A1A1A',
  cardBg: '#282828',
  inputBg: '#333333',
  // Legacy mappings
  star: '#642e32',
  starEmpty: '#404040',
  starCommunity: '#F59E0B',
  starCommunityEmpty: '#404040',
  secondary: '#A0A0A0',
  iconPrimary: '#E0E0E0',
  iconBackground: '#333333',
  // Aliases
  error: '#EF4444',
  surface: '#282828',
  border: '#404040',
  textPrimary: '#E0E0E0',
};


export const FONTS = {
  primary: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: 'normal',
  },
  heading: {
    fontFamily: 'Georgia, serif',
    fontWeight: '700',
    letterSpacing: 'normal',
  },
  body: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: '1.6',
  },
  elegant: {
    fontFamily: 'Georgia, serif',
    letterSpacing: 'normal',
  },
  pinyon: {
    fontFamily: '"Pinyon Script", cursive',
    letterSpacing: 'normal',
  }
};


export const TYPOGRAPHY = {
  // Font Sizes & Line Heights
  xs: { fontSize: '0.75rem', lineHeight: '1rem' }, // 12px
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem' }, // 14px
  base: { fontSize: '1rem', lineHeight: '1.5rem' }, // 16px
  lg: { fontSize: '1.125rem', lineHeight: '1.75rem' }, // 18px
  xl: { fontSize: '1.25rem', lineHeight: '1.75rem' }, // 20px
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem' }, // 24px
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' }, // 30px
  // Font Weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  // NEW: Composite typography styles for common elements
  h1: { ...FONTS.heading, fontSize: '1.875rem', lineHeight: '2.25rem' } as React.CSSProperties, // 30px - Maps to TYPOGRAPHY['3xl']
  h2: { ...FONTS.heading, fontSize: '1.5rem', lineHeight: '2rem' } as React.CSSProperties, // 24px - Maps to TYPOGRAPHY['2xl']
  h3: { ...FONTS.heading, fontSize: '1.25rem', lineHeight: '1.75rem' } as React.CSSProperties, // 20px - Maps to TYPOGRAPHY.xl
  body: { ...FONTS.body, fontSize: '1rem', lineHeight: '1.5rem' } as React.CSSProperties, // 16px - Maps to TYPOGRAPHY.base
  caption: { ...FONTS.body, fontSize: '0.875rem', lineHeight: '1.25rem' } as React.CSSProperties, // 14px - Maps to TYPOGRAPHY.sm
  button: { ...FONTS.primary, fontSize: '1rem', fontWeight: '600', lineHeight: '1.5rem' } as React.CSSProperties, // Maps to TYPOGRAPHY.base, semibold
};


export const SPACING = {
  // Consistent spacing scale
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px - Base unit
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  // Layout spacing
  containerPadding: '1rem', // 16px
  sectionGap: '1.5rem', // 24px
  cardPadding: '1.25rem', // 20px
};


// NEW: Image compression settings
export const IMAGE_COMPRESSION = {
  // File size limits
  MAX_FILE_SIZE_MB: 2.5, // Target max file size after compression
  MAX_ORIGINAL_SIZE_MB: 50, // Reject files larger than this before compression
  // Image dimensions
  MAX_WIDTH: 1920, // Maximum width in pixels
  MAX_HEIGHT: 1920, // Maximum height in pixels
  // Quality settings
  INITIAL_QUALITY: 0.9, // Start with 90% quality
  MIN_QUALITY: 0.3, // Don't go below 30% quality
  QUALITY_STEP: 0.1, // Reduce quality by 10% each iteration
  // Formats
  OUTPUT_FORMAT: 'image/jpeg', // Always convert to JPEG for consistency
  MIME_TYPE: 'image/jpeg',
  // Performance
  COMPRESSION_TIMEOUT: 15000, // 15 seconds max for compression
};


// --- Values defined before STYLES to prevent reference errors ---
const _borderRadiusSmall = '6px';
const _borderRadiusMedium = '8px';
const _borderRadiusLarge = '12px';
const _borderRadiusFull = '9999px';
const _shadowSmall = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
const _shadowMedium = '0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
const _shadowLarge = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';


export const STYLES = {
  // Border Radius
  borderRadiusSmall: _borderRadiusSmall,
  borderRadiusMedium: _borderRadiusMedium,
  borderRadiusLarge: _borderRadiusLarge,
  borderRadiusFull: _borderRadiusFull,
  // Shadows
  shadowSmall: _shadowSmall,
  shadowMedium: _shadowMedium,
  shadowLarge: _shadowLarge,
  // Z-index values
  zDefault: 1,
  zDropdown: 100,
  zHeader: 10,
  zModal: 2147483647, // Maximum z-index for guaranteed visibility
  // Animation
  animationFast: '150ms',
  animationNormal: '200ms',
  animationSlow: '300ms',
  // Component Styles
  primaryButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: '2px solid ' + COLORS.black,
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: TYPOGRAPHY.base.fontSize,
    fontWeight: TYPOGRAPHY.medium,
    fontFamily: FONTS.primary.fontFamily,
    minHeight: '44px', // Touch target
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  } as React.CSSProperties, // Added casting
  secondaryButton: {
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    border: '2px solid ' + COLORS.primary,
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: TYPOGRAPHY.base.fontSize,
    fontWeight: TYPOGRAPHY.medium,
    fontFamily: FONTS.primary.fontFamily,
    minHeight: '44px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties, // Added casting
  deleteButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: '2px solid ' + COLORS.black,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  } as React.CSSProperties, // Added casting
  card: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    border: '1px solid ' + COLORS.gray200,
    padding: SPACING.cardPadding,
    transition: 'all 0.3s ease',
  } as React.CSSProperties, // Added casting
  cardHover: {
    borderColor: COLORS.primary,
    boxShadow: '0 2px 8px ' + COLORS.shadowLight,
  } as React.CSSProperties, // Added casting
  modal: {
    background: COLORS.white,
    borderRadius: '12px',
    border: '2px solid ' + COLORS.black,
    padding: SPACING[6],
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  } as React.CSSProperties, // Added casting
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[4],
  } as React.CSSProperties, // Added casting
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    // MODIFIED: Use longhand properties to avoid conflicts with conditional overrides
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: COLORS.gray200,
    borderRadius: _borderRadiusMedium,
    padding: '12px 16px',
    fontSize: TYPOGRAPHY.base.fontSize,
    fontFamily: FONTS.primary.fontFamily,
    color: COLORS.text,
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  } as React.CSSProperties,
  inputFocus: {
    borderColor: COLORS.accent,
    boxShadow: '0 0 0 3px rgba(100, 46, 50, 0.25)',
  } as React.CSSProperties, // MODIFIED: Use accent color for focus
  // NEW: Style for the black border on active/focused inputs
  inputFocusBlack: {
    borderColor: COLORS.black,
    // Note: Padding is adjusted to '11px 15px' in components when this is active
    // to compensate for the thicker border and prevent layout shift.
    // However, the component logic has been simplified to just override borderColor.
  } as React.CSSProperties,
  // Legacy styles for compatibility
  mainContentPadding: '80px',
  headerHeight: '60px',
  addButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: '2px solid ' + COLORS.black,
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: FONTS.primary.fontFamily,
  } as React.CSSProperties, // Added casting
  iconButton: {
    backgroundColor: COLORS.white,
    color: COLORS.gray700,
    border: '1px solid ' + COLORS.gray200,
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  } as React.CSSProperties, // Added casting
  formButton: {
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: COLORS.white,
    fontFamily: FONTS.primary.fontFamily,
  } as React.CSSProperties, // Added casting
  sortButtonDefault: {
    backgroundColor: COLORS.white,
    color: COLORS.gray700,
    border: '1px solid ' + COLORS.gray200,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: FONTS.primary.fontFamily,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  } as React.CSSProperties, // Added casting
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: '1px solid ' + COLORS.primary,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: FONTS.primary.fontFamily,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  } as React.CSSProperties, // Added casting
};


// NEW: Export BORDERS and SHADOWS, mapping to STYLES for consistency
export const BORDERS = {
  radius: {
    small: STYLES.borderRadiusSmall,
    medium: STYLES.borderRadiusMedium,
    large: STYLES.borderRadiusLarge,
    full: STYLES.borderRadiusFull,
  },
};


export const SHADOWS = {
  small: STYLES.shadowSmall,
  medium: STYLES.shadowMedium,
  large: STYLES.shadowLarge,
};


// Legacy SIZES for compatibility
export const SIZES = {
  xs: '0.5rem', // 8px
  sm: '0.75rem', // 12px
  md: '1rem', // 16px
  lg: '1.25rem', // 20px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
};


// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};



