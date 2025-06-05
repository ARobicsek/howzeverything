// src/constants.ts
export const COLORS = {
  // Core colors (restored to original, background updated)
  background: '#aeaea6', // USER MODIFIED from '#0f172a'
  text: '#34343b', // USER MODIFIED
  textWhite: '#ffffff',
  textDark: '#1e293b',
  primary: '#3b82f6',
  secondary: '#64748b',
  danger: '#ef4444',
  // Rating colors - keeping dual system for personal vs community
  star: '#3b82f6', // Blue for personal ratings
  starEmpty: '#edeadd', // USER MODIFIED
  // Community rating colors
  starCommunity: '#fbbf24', // Gold for community ratings
  starCommunityEmpty: '#edeadd', // USER MODIFIED
  // Action colors
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  // Background variations
  cardBg: 'rgba(0, 0, 0, 0.07)', // Adjusted for lighter background
  cardBgHover: 'rgba(0, 0, 0, 0.12)', // Adjusted
  inputBg: 'rgba(255, 255, 255, 0.95)',
  // Icon colors (restored to original)
  iconPrimary: '#000000', // Black icons
  iconBackground: '#ffffff', // White backgrounds for icon buttons
  // Comment and interaction colors
  viewCommentsBg: '#475569',
  disabled: '#6b7280',
  // State colors for different interaction states
  highlight: 'rgba(59, 130, 246, 0.1)',
  border: 'rgba(0, 0, 0, 0.2)', // Darker border for lighter background
  borderFocus: 'rgba(0, 0, 0, 0.4)', // Darker focus border
  // Button colors for consistency
  addButtonBg: '#3b82f6', // Blue background for all add buttons
  addButtonText: '#ffffff', // White text for all add buttons
  addButtonHover: '#2563eb', // Darker blue on hover
  // Navigation Bar Color
  navBar: '#34343b', // USER MODIFIED
  // Specific hover states that were missing
  secondaryHover: '#525e70', // Darker shade for secondary button hover
};
export const FONTS = {
  elegant: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    letterSpacing: '0.01em',
  },
  heading: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  body: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: '1.6',
  }
};
export const STYLES = {
  // Navigation and layout
  mainContentPadding: '80px', // For bottom navigation space
  headerHeight: '60px',
  // Animation durations
  animationFast: '150ms',
  animationNormal: '300ms',
  animationSlow: '500ms',
  // Border radius
  borderRadiusSmall: '6px',
  borderRadiusMedium: '12px',
  borderRadiusLarge: '16px',
  // Shadows
  shadowSmall: '0 1px 3px rgba(0, 0, 0, 0.1)',
  shadowMedium: '0 4px 6px rgba(0, 0, 0, 0.1)',
  shadowLarge: '0 10px 15px rgba(0, 0, 0, 0.1)',
  // Z-index values
  zModal: 1000,
  zDropdown: 100,
  zHeader: 10,
  zDefault: 1,
  // Consistent button styles
  addButton: {
    backgroundColor: COLORS.addButtonBg, 
    color: COLORS.addButtonText, 
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  // Icon button styles
  iconButton: {
    backgroundColor: COLORS.iconBackground, 
    color: COLORS.iconPrimary, 
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  // Primary button (for main actions like "Find or Add a Restaurant")
  primaryButton: { 
    borderRadius: '12px',
    padding: '16px 32px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    // Note: backgroundColor and color will be set by specific usages or by STYLES.addButton
  },
  // Secondary button
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    color: '#f1f5f9',
    border: '1px solid rgba(241, 245, 249, 0.3)', 
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  // Form button
  formButton: {
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: COLORS.textWhite,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }
};
// Size definitions for consistent spacing
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