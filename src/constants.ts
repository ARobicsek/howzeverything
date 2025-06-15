// src/constants.ts
import React from 'react'; // Import React to get React.CSSProperties

export const COLORS = {
  // Primary Colors
  primary: '#2563EB', // Main accent, buttons, links
  primaryHover: '#1D4ED8', // Hover states
  primaryLight: '#DBEAFE', // Light backgrounds, highlights
 
  // Neutral Grays
  gray50: '#F9FAFB', // Page backgrounds
  gray100: '#F3F4F6', // Card backgrounds
  gray200: '#E5E7EB', // Borders, dividers
  gray300: '#D1D5DB', // Disabled states
  gray400: '#9CA3AF', // Placeholder text
  gray500: '#6B7280', // Secondary text
  gray700: '#374151', // Primary text
  gray900: '#111827', // Headers, emphasis
 
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
};


export const FONTS = {
  primary: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '-0.01em',
  },
  heading: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  body: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: '1.5',
  },
  // Legacy mappings
  elegant: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '-0.01em',
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


export const STYLES = {
  // Border Radius
  borderRadiusSmall: '6px',
  borderRadiusMedium: '8px',
  borderRadiusLarge: '12px',
  borderRadiusFull: '9999px',
 
  // Shadows
  shadowSmall: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  shadowMedium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLarge: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
 
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
    backgroundColor: COLORS.white,
    border: '2px solid ' + COLORS.gray200,
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: TYPOGRAPHY.base.fontSize,
    fontFamily: FONTS.primary.fontFamily,
    color: COLORS.gray700,
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  } as React.CSSProperties, // MODIFIED: Added explicit casting to React.CSSProperties
 
  inputFocus: {
    borderColor: COLORS.primary,
    boxShadow: '0 0 0 3px ' + COLORS.primaryLight,
  } as React.CSSProperties, // Added casting
 
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