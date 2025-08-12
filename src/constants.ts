// src/constants.ts
import React from 'react';
import { THEMES, ColorPalette } from './styles/themes';

// --- TYPE DEFINITIONS ---
export type StyleObject = React.CSSProperties;
export type NamedStyles<T> = { [key: string]: T };

// --- NEW: Layout Controller for Restaurant Cards ---
export const RESTAURANT_CARD_MAX_WIDTH = '350px';

// NEW: Layout Configuration System
export const LAYOUT_CONFIG = {
  // App-level container settings
  APP_CONTAINER: {
    maxWidth: '1280px',
    padding: '1rem', // 16px
    paddingTop: '60px', // Space for top navigation
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
  },
};

export const COLORS: ColorPalette = THEMES.default;

export const STYLE_FUNCTIONS = {
  getPaginationButtonStyle: (disabled: boolean): StyleObject => ({
    ...SCREEN_STYLES.admin.paginationButton,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  getTabButtonStyle: (isActive: boolean): StyleObject => ({
    ...SCREEN_STYLES.admin.tabButton,
    backgroundColor: isActive ? COLORS.primary : 'transparent',
    color: isActive ? COLORS.white : COLORS.textPrimary,
  }),
  getAddRestaurantButtonStyle: (loading: boolean): StyleObject => ({
    ...SCREEN_STYLES.admin.button,
    padding: SPACING[4],
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
  }),
  getCommentItemStyle: (isHidden: boolean): StyleObject => ({
    ...SCREEN_STYLES.admin.itemCard,
    backgroundColor: isHidden ? COLORS.gray100 : COLORS.surface,
    opacity: isHidden ? 0.7 : 1,
  }),
  getToggleCommentVisibilityButtonStyle: (isHidden: boolean): StyleObject => ({
    ...SCREEN_STYLES.admin.button,
    backgroundColor: isHidden ? COLORS.success : COLORS.warning,
    color: COLORS.white,
  }),
  getFetchAnalyticsButtonStyle: (loading: boolean): StyleObject => ({
    ...SCREEN_STYLES.admin.button,
    padding: `${SPACING[3]} ${SPACING[4]}`,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    cursor: loading ? 'not-allowed' : 'pointer',
    alignSelf: 'flex-end',
    opacity: loading ? 0.6 : 1,
  }),
  getSortableHeaderStyle: (align: 'left' | 'center' | 'right'): StyleObject => ({
    ...SCREEN_STYLES.admin.tableHeader,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textAlign: align,
  }),
  getPasswordToggleButtonStyle: (loading: boolean): StyleObject => ({
    ...COMPONENT_STYLES.loginForm.passwordToggleButton,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1,
  }),
  getSubmitButtonStyle: (loading: boolean): StyleObject => ({
    ...STYLES.primaryButton,
    width: '100%',
    minHeight: '50px',
    marginBottom: SPACING[4],
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
    backgroundColor: loading ? COLORS.gray300 : COLORS.accent,
    borderColor: loading ? COLORS.gray300 : COLORS.black,
  }),
  getModeToggleButtonStyle: (loading: boolean): StyleObject => ({
    ...FONTS.body,
    background: 'none',
    border: 'none',
    color: COLORS.accent,
    fontSize: TYPOGRAPHY.sm.fontSize,
    cursor: loading ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    padding: `${SPACING[2]} ${SPACING[3]}`,
    borderRadius: STYLES.borderRadiusMedium,
    transition: 'background-color 0.2s ease',
    outline: 'none',
  }),
  getCancelButtonStyle: (loading: boolean): StyleObject => ({
    ...STYLES.secondaryButton,
    width: '100%',
    color: COLORS.black,
    borderColor: COLORS.black,
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
  }),
  getAvatarContainerStyle: (avatarUrl?: string | null): StyleObject => ({
    ...COMPONENT_STYLES.profileCard.avatarContainer,
    backgroundColor: avatarUrl ? 'transparent' : COLORS.accent,
    backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
  }),
  getEditProfileButtonStyle: (loading: boolean): StyleObject => ({
    ...STYLES.primaryButton,
    width: '100%',
    backgroundColor: COLORS.accent,
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
  }),
  getSignOutButtonStyle: (loading: boolean, isSigningOut: boolean): StyleObject => ({
    ...STYLES.secondaryButton,
    width: '100%',
    color: COLORS.black,
    borderColor: COLORS.black,
    opacity: (loading || isSigningOut) ? 0.5 : 1,
    cursor: (loading || isSigningOut) ? 'not-allowed' : 'pointer',
  }),
};

export const FONTS: NamedStyles<StyleObject> = {
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
  },
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
  h1: { ...FONTS.heading, fontSize: '1.875rem', lineHeight: '2.25rem' } as StyleObject, // 30px - Maps to TYPOGRAPHY['3xl']
  h2: { ...FONTS.heading, fontSize: '1.5rem', lineHeight: '2rem' } as StyleObject, // 24px - Maps to TYPOGRAPHY['2xl']
  h3: { ...FONTS.heading, fontSize: '1.25rem', lineHeight: '1.75rem' } as StyleObject, // 20px - Maps to TYPOGRAPHY.xl
  body: { ...FONTS.body, fontSize: '1rem', lineHeight: '1.5rem' } as StyleObject, // 16px - Maps to TYPOGRAPHY.base
  caption: { ...FONTS.body, fontSize: '0.875rem', lineHeight: '1.25rem' } as StyleObject, // 14px - Maps to TYPOGRAPHY.sm
  button: { ...FONTS.primary, fontSize: '1rem', fontWeight: '600', lineHeight: '1.5rem' } as StyleObject, // Maps to TYPOGRAPHY.base, semibold
};

export const SPACING: Record<string | number, string> = {
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

export const UTILITIES: NamedStyles<StyleObject> = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
  },
  fullBleed: {
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
  },
};

export const STYLES: Record<string, StyleObject | string | number> = {
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
    ...UTILITIES.flexCenter,
    display: 'inline-flex',
    gap: '8px',
  },
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
    ...UTILITIES.flexCenter,
    display: 'inline-flex',
  },
  deleteButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: '2px solid ' + COLORS.black,
    cursor: 'pointer',
    ...UTILITIES.flexCenter,
    transition: 'all 0.2s ease',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    border: '1px solid ' + COLORS.gray200,
    padding: SPACING.cardPadding,
    transition: 'all 0.3s ease',
  },
  cardHover: {
    borderColor: COLORS.primary,
    boxShadow: '0 2px 8px ' + COLORS.shadowLight,
  },
  modal: {
    background: COLORS.white,
    borderRadius: '12px',
    border: '2px solid ' + COLORS.black,
    padding: SPACING[6],
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 2147483647,
    ...UTILITIES.flexCenter,
    padding: SPACING[4],
  },
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
  },
  inputFocus: {
    borderColor: COLORS.accent,
    boxShadow: '0 0 0 3px rgba(100, 46, 50, 0.25)',
  },
  // NEW: Style for the black border on active/focused inputs
  inputFocusBlack: {
    borderColor: COLORS.black,
    // Note: Padding is adjusted to '11px 15px' in components when this is active
    // to compensate for the thicker border and prevent layout shift.
    // However, the component logic has been simplified to just override borderColor.
  },
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
  },
  iconButton: {
    backgroundColor: COLORS.white,
    color: COLORS.gray700,
    border: '1px solid ' + COLORS.gray200,
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    ...UTILITIES.flexCenter,
    transition: 'all 0.2s ease',
  },
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
  },
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
    ...UTILITIES.flexCenter,
    gap: '4px',
  },
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
    ...UTILITIES.flexCenter,
    gap: '4px',
  },
};

// NEW: Export BORDERS and SHADOWS, mapping to STYLES for consistency
export const BORDERS = {
  radius: {
    small: STYLES.borderRadiusSmall as string,
    medium: STYLES.borderRadiusMedium as string,
    large: STYLES.borderRadiusLarge as string,
    full: STYLES.borderRadiusFull as string,
  },
};

export const SHADOWS = {
  small: STYLES.shadowSmall as string,
  medium: STYLES.shadowMedium as string,
  large: STYLES.shadowLarge as string,
};

// Legacy SIZES for compatibility
export const SIZES: Record<string, string> = {
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
export const BREAKPOINTS: Record<string, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// 2. Component Styles
export const COMPONENT_STYLES: NamedStyles<NamedStyles<StyleObject>> = {
  loginForm: {
    container: {
      ...STYLES.modal,
      maxWidth: '400px',
      width: '100%',
      padding: SPACING[8],
    },
    headerContainer: {
      marginBottom: SPACING[6],
      textAlign: 'center',
    },
    headerTitle: {
      ...FONTS.heading,
      fontSize: TYPOGRAPHY['2xl'].fontSize,
      color: COLORS.gray900,
      margin: `0 0 ${SPACING[2]} 0`,
    },
    headerSubtitle: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
    },
    errorContainer: {
      backgroundColor: '#FEE2E2',
      border: `1px solid #FECACA`,
      borderRadius: STYLES.borderRadiusMedium as string,
      padding: SPACING[3],
      marginBottom: SPACING[5],
    },
    errorText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.danger,
      margin: 0,
    },
    formFieldContainer: {
      marginBottom: SPACING[5],
    },
    label: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      fontWeight: TYPOGRAPHY.medium,
      color: COLORS.textSecondary,
      display: 'block',
      marginBottom: SPACING[2],
    },
    usernameHint: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.xs.fontSize,
      fontWeight: TYPOGRAPHY.normal,
      color: COLORS.gray400,
      marginLeft: SPACING[2],
    },
    passwordInputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    passwordToggleButton: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLORS.gray400,
      transition: 'color 0.2s ease',
      zIndex: 1,
    },
    loadingSpinnerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING[2],
    },
    loadingSpinner: {
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTopColor: COLORS.white,
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      animation: 'spin 0.8s linear infinite',
    },
    modeToggleContainer: {
      textAlign: 'center',
      marginBottom: SPACING[4],
    },
  },
  profileCard: {
    container: {
      ...STYLES.card as StyleObject,
      boxShadow: STYLES.shadowLarge as string,
      padding: SPACING[6],
    },
    noProfileContainer: {
      ...STYLES.card as StyleObject,
      textAlign: 'center',
      padding: SPACING[6],
    },
    noProfileText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
    },
    errorContainer: {
      backgroundColor: '#FEE2E2',
      border: '1px solid #FECACA',
      borderRadius: STYLES.borderRadiusMedium as string,
      padding: SPACING[3],
      marginBottom: SPACING[5],
    },
    errorText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.danger,
      margin: 0,
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: SPACING[6],
    },
    avatarContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING[5],
      flexShrink: 0,
      border: `3px solid ${COLORS.gray100}`,
      boxShadow: STYLES.shadowMedium as string,
    },
    avatarInitials: {
      fontFamily: '"Pinyon Script", cursive',
      fontWeight: 400,
      fontSize: '2.5rem',
      color: COLORS.white,
      lineHeight: 1,
    },
    nameAndEmailContainer: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      ...FONTS.heading,
      fontSize: TYPOGRAPHY.xl.fontSize,
      color: COLORS.gray900,
      margin: `0 0 ${SPACING[1]} 0`,
      wordBreak: 'break-word',
    },
    email: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
      wordBreak: 'break-word',
    },
    adminBadge: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.xs.fontSize,
      fontWeight: TYPOGRAPHY.semibold,
      color: COLORS.accent,
      backgroundColor: `${COLORS.accent}2A`,
      padding: `${SPACING[1]} ${SPACING[3]}`,
      borderRadius: STYLES.borderRadiusSmall as string,
      display: 'inline-block',
      marginTop: SPACING[2],
    },
    detailsContainer: {
      marginBottom: SPACING[6],
      paddingTop: SPACING[5],
      borderTop: `1px solid ${COLORS.gray100}`,
    },
    bioContainer: {
      marginBottom: SPACING[4],
    },
    sectionHeader: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      fontWeight: TYPOGRAPHY.semibold,
      color: COLORS.textSecondary,
      margin: `0 0 ${SPACING[2]} 0`,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    bioText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.text,
      margin: 0,
      lineHeight: '1.6',
      wordBreak: 'break-word',
    },
    locationText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.text,
      margin: 0,
    },
    actionButtonsContainer: {
      display: 'flex',
      gap: SPACING[3],
      flexDirection: 'column',
    },
  },
  userForm: {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
    },
    content: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    headerContainer: {
      marginBottom: '24px',
      textAlign: 'center',
    },
    headerTitle: {
      ...FONTS.elegant,
      fontSize: '24px',
      fontWeight: '600',
      color: COLORS.text,
      margin: '0 0 8px 0',
    },
    headerSubtitle: {
      ...FONTS.elegant,
      fontSize: '14px',
      color: COLORS.text,
      margin: 0,
    },
    errorContainer: {
      backgroundColor: '#FEF2F2',
      border: '1px solid #FECACA',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
    },
    errorText: {
      ...FONTS.elegant,
      fontSize: '14px',
      color: COLORS.danger,
      margin: 0,
    },
    formFieldContainer: {
      marginBottom: '16px',
    },
    formFieldContainerLargeMargin: {
      marginBottom: '24px',
    },
    label: {
      ...FONTS.elegant,
      fontSize: '14px',
      fontWeight: '500',
      color: COLORS.text,
      display: 'block',
      marginBottom: '6px',
    },
    input: {
      ...FONTS.elegant,
      width: '100%',
      padding: '12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      WebkitAppearance: 'none',
    },
    avatarUrlHint: {
      ...FONTS.elegant,
      fontSize: '12px',
      color: COLORS.text,
      margin: '4px 0 0 0',
    },
    actionButtonsContainer: {
      display: 'flex',
      gap: '12px',
      flexDirection: 'column',
    },
    submitButton: {
      ...FONTS.elegant,
      height: '50px',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      WebkitAppearance: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    cancelButton: {
      ...FONTS.elegant,
      height: '44px',
      backgroundColor: 'transparent',
      color: COLORS.text,
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      WebkitAppearance: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
  },
};

// 4. Screen-Specific Styles
export const SCREEN_STYLES: NamedStyles<NamedStyles<StyleObject>> = {
  app: {
    authFlowContainer: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      position: 'relative',
    },
    authFlowInnerContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      minHeight: '100vh',
    },
    authFlowLogoContainer: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    authFlowLogo: {
      maxWidth: '200px',
      height: 'auto',
      margin: '0 auto',
    },
    authFlowFormContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    authFlowFormTitle: {
      ...FONTS.elegant,
      fontSize: '20px',
      fontWeight: '600',
      color: COLORS.text,
      margin: '0 0 24px 0',
    },
  },
  menu: {
    // Top-level container
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: COLORS.background,
    },
    // Sticky Header
    stickyHeader: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.white,
      borderBottom: `1px solid ${COLORS.gray200}`,
      position: 'sticky',
      top: '59px', // This assumes a fixed top navigation height
      zIndex: 10,
      boxShadow: STYLES.shadowSmall as string,
      width: '100vw',
    },
    headerContainer: {
      ...UTILITIES.flexBetween,
      maxWidth: '768px',
      margin: '0 auto',
      padding: `${SPACING[3]} ${LAYOUT_CONFIG.APP_CONTAINER.padding}`,
    },
    restaurantNameContainer: {
      flex: 1,
      textAlign: 'center',
      margin: `0 ${SPACING[2]}`,
      overflow: 'hidden',
      cursor: 'pointer',
    },
    restaurantName: {
      ...UTILITIES.truncate,
      ...FONTS.heading,
      fontSize: TYPOGRAPHY.xl.fontSize,
      color: COLORS.gray900,
      margin: 0,
    },
    address: {
      ...FONTS.elegant,
      color: COLORS.text,
      opacity: 0.7,
      fontSize: '0.8rem',
      lineHeight: '1.3',
      margin: '2px 0 0 0',
      ...UTILITIES.truncate,
    },
    headerButtonsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING[2],
    },
    pinButton: {
      ...STYLES.iconButton as StyleObject,
      border: 'none',
    },
    actionMenu: {
      container: {
        position: 'relative',
      },
      dropdown: {
        position: 'absolute',
        top: 'calc(100% + 4px)',
        right: 0,
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusMedium as string,
        boxShadow: STYLES.shadowLarge as string,
        border: `1px solid ${COLORS.gray200}`,
        overflow: 'hidden',
        zIndex: STYLES.zDropdown as number,
        minWidth: '160px',
      },
      menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[2],
        width: '100%',
        padding: `${SPACING[2]} ${SPACING[3]}`,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        textAlign: 'left',
        transition: 'background-color 0.2s ease',
        color: COLORS.text,
      },
      menuItemDanger: {
        color: COLORS.danger,
      },
    },
    // Main Content Area
    main: {
      flex: 1,
      maxWidth: '768px',
      width: '100%',
      margin: '0 auto',
      paddingTop: SPACING[4],
    },
    mainInnerContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: `0 ${SPACING[1]}`,
    },
    // Error Message
    error: {
      container: {
        backgroundColor: COLORS.red50,
        border: `1px solid ${COLORS.red200}`,
        borderRadius: STYLES.borderRadiusMedium as string,
        padding: SPACING[4],
        textAlign: 'center',
        marginBottom: SPACING[4],
      },
      text: {
        ...FONTS.body,
        color: COLORS.danger,
        margin: 0,
      },
    },
    // Advanced Sort Section
    advancedSort: {
      container: {
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge as string,
        padding: SPACING[4],
        boxShadow: STYLES.shadowMedium as string,
        border: `1px solid ${COLORS.gray200}`,
        marginBottom: SPACING[4],
      },
      innerContainer: {
        display: 'flex',
        gap: SPACING[2],
        flexWrap: 'wrap',
      },
      arrow: {
        marginLeft: SPACING[1],
      },
    },
    // Search Component Wrapper
    searchWrapper: {
      marginLeft: SPACING[1],
      marginRight: SPACING[1],
      marginBottom: SPACING[5],
    },
    // Dish List
    dishList: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING[2],
      },
      noResultsContainer: {
        textAlign: 'center',
        padding: SPACING[6],
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge as string,
        boxShadow: STYLES.shadowMedium as string,
        border: `1px solid ${COLORS.gray200}`,
      },
      noResultsText: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.base.fontSize,
        color: COLORS.textSecondary,
        margin: 0,
      },
    },
    // Empty State (No Dishes)
    emptyState: {
      container: {
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge as string,
        padding: SPACING[8],
        textAlign: 'center',
        boxShadow: STYLES.shadowMedium as string,
        border: `1px solid ${COLORS.gray200}`,
      },
      icon: {
        color: COLORS.gray400,
        marginBottom: SPACING[4],
      },
      title: {
        ...FONTS.heading,
        fontSize: TYPOGRAPHY.xl.fontSize,
        color: COLORS.gray900,
        marginBottom: SPACING[3],
      },
      text: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.base.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SPACING[5],
      },
    },
    // Add Form Container
    addFormContainer: {
      marginTop: SPACING[4],
    },
    // Full Name Modal
    fullNameModal: {
      content: {
        ...STYLES.modal as StyleObject,
        maxWidth: '500px',
        textAlign: 'center',
      },
      name: {
        ...FONTS.elegant,
        color: COLORS.text,
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
        wordBreak: 'break-word',
      },
      address: {
        ...FONTS.elegant,
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.base.fontSize,
        lineHeight: 1.5,
        marginBottom: SPACING[6],
        wordBreak: 'break-word',
      },
      closeButton: {
        ...STYLES.secondaryButton as StyleObject,
        width: '100%',
      },
    },
    // --- Sub-components defined in MenuScreen ---
    // Duplicate Dish Warning Modal
    duplicateWarningModal: {
      content: {
        ...STYLES.modal as StyleObject,
        maxWidth: '500px',
        border: `1px solid ${COLORS.border}`,
      },
      title: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginTop: 0,
        marginBottom: SPACING[2],
      },
      text: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        marginBottom: SPACING[4],
      },
      list: {
        listStyle: 'none',
        padding: 0,
        margin: `0 0 ${SPACING[6]} 0`,
        maxHeight: '200px',
        overflowY: 'auto',
        border: `1px solid ${COLORS.border}`,
        borderRadius: BORDERS.radius.medium,
      },
      listItem: {
        padding: `${SPACING[2]} ${SPACING[3]}`,
        cursor: 'pointer',
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.semibold,
        transition: 'background-color 0.2s ease',
      },
      buttonContainer: {
        display: 'flex',
        gap: SPACING[3],
      },
      cancelButton: {
        ...STYLES.secondaryButton as StyleObject,
        flex: 1,
        border: `1px solid ${COLORS.gray300}`,
        color: COLORS.text,
      },
      confirmButton: {
        ...STYLES.primaryButton as StyleObject,
        flex: 1,
      },
    },
    // Consolidated Search and Add Form
    search: {
      container: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: STYLES.borderRadiusLarge as string,
        padding: SPACING[4],
      },
      header: {
        ...UTILITIES.flexBetween,
        marginBottom: SPACING[1],
      },
      title: {
        ...FONTS.heading,
        fontSize: TYPOGRAPHY.lg.fontSize,
        color: COLORS.text,
        margin: 0,
      },
      resetButton: {
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: COLORS.textSecondary,
        transition: 'color 0.2s ease, transform 0.2s ease',
      },
      addDishContainer: {
        marginTop: SPACING[4],
        textAlign: 'center',
      },
      addDishText: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        color: COLORS.textSecondary,
        margin: `0 0 ${SPACING[2]} 0`,
      },
      addDishButton: {
        ...STYLES.primaryButton as StyleObject,
        padding: `${SPACING[2]} ${SPACING[4]}`,
        fontSize: TYPOGRAPHY.sm.fontSize,
      },
    },
    // Enhanced Add Dish Form
    addDishForm: {
      container: {
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge as string,
        padding: SPACING[6],
        boxShadow: STYLES.shadowLarge as string,
        border: `1px solid ${COLORS.gray200}`,
      },
      title: {
        ...FONTS.heading,
        fontSize: TYPOGRAPHY.xl.fontSize,
        color: COLORS.gray900,
        marginBottom: SPACING[5],
      },
      inputContainer: {
        marginBottom: SPACING[5],
      },
      label: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        fontWeight: TYPOGRAPHY.medium,
        color: COLORS.textSecondary,
        display: 'block',
        marginBottom: SPACING[2],
      },
      input: {
        ...STYLES.input as StyleObject,
        borderWidth: '1px',
      },
      ratingContainer: {
        marginBottom: SPACING[6],
      },
      starButtonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING[2],
      },
      starButtonsInnerContainer: {
        display: 'flex',
        gap: SPACING[1],
      },
      starButton: {
        background: 'none',
        border: 'none',
        padding: SPACING[1],
        fontSize: '1.5rem',
        transition: 'all 0.2s ease',
      },
      ratingText: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.base.fontSize,
        color: COLORS.text,
        marginLeft: SPACING[2],
        minWidth: '30px',
      },
      buttonContainer: {
        display: 'flex',
        gap: SPACING[3],
      },
      submitButton: {
        ...STYLES.primaryButton as StyleObject,
        flex: 1,
      },
      cancelButton: {
        ...STYLES.secondaryButton as StyleObject,
        flex: 1,
      },
    },
  },
  findRestaurant: {
    container: {
      backgroundColor: COLORS.background,
      minHeight: '100vh',
    },
    spinAnimation: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    header: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
      marginBottom: SPACING[6],
    },
    headerInner: {
      paddingTop: `calc(60px + ${SPACING[4]})`,
      paddingBottom: SPACING[6],
    },
    headerImage: {
      width: '180px',
      marginTop: SPACING[4],
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium as string,
      height: 'auto',
      objectFit: 'contain',
    },
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[6],
    },
    searchBarContainer: {
      maxWidth: '350px',
    },
    searchBar: {
      ...STYLES.input as StyleObject,
      cursor: 'pointer',
      color: COLORS.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: SPACING[2],
    },
    mainContent: {
      overflow: 'hidden',
    },
    mainContentInner: {
      maxWidth: RESTAURANT_CARD_MAX_WIDTH,
    },
    addRestaurantTitle: {
      ...FONTS.elegant,
      color: COLORS.text,
      fontSize: '18px',
      fontWeight: 500,
    },
    refreshButton: {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    distanceLabel: {
      ...FONTS.elegant,
      color: COLORS.accent,
      fontSize: '1rem',
      fontWeight: 500,
      marginLeft: '16px',
      marginRight: '12px',
    },
    distanceSelect: {
      border: `1px solid ${COLORS.gray300}`,
      borderRadius: '8px',
      padding: '0.25rem 0.5rem',
      fontSize: '0.875rem',
      backgroundColor: COLORS.white,
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.25em 1.25em',
      paddingRight: '2rem',
    },
    distanceFilterContainer: {
      marginBottom: SPACING[4],
    },
  },
  discovery: {
    container: {
      backgroundColor: COLORS.background,
      minHeight: '100vh',
    },
    header: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
      marginBottom: SPACING[6],
    },
    headerInner: {
      paddingTop: `calc(60px + ${SPACING[4]})`,
      paddingBottom: SPACING[6],
    },
    headerImage: {
      width: '180px',
      marginTop: SPACING[4],
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium as string,
      height: 'auto',
      objectFit: 'contain',
    },
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[6],
    },
    searchBarContainer: {
      maxWidth: '350px',
      position: 'relative',
    },
    resetButton: {
      position: 'absolute',
      top: '-30px',
      right: '-5px',
      background: 'transparent',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      color: COLORS.white,
      opacity: 0.7,
      transition: 'all 0.2s ease',
    },
    filtersContainer: {
      display: 'flex',
      gap: SPACING[3],
      marginTop: SPACING[4],
      width: '100%',
      maxWidth: '350px',
    },
    filterContainer: {
      flex: 1,
      position: 'relative',
    },
    select: {
      border: `1px solid ${COLORS.gray300}`,
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      backgroundColor: COLORS.white,
      color: COLORS.text,
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.25em 1.25em',
      paddingRight: '2.5rem',
      width: '100%',
    },
    main: {
      maxWidth: RESTAURANT_CARD_MAX_WIDTH,
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[4],
    },
    messageText: {
      ...FONTS.elegant,
      color: COLORS.text,
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    messageSubText: {
      ...FONTS.elegant,
      color: COLORS.text,
      opacity: 0.7,
    },
    errorText: {
      ...FONTS.elegant,
      color: COLORS.danger,
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    restaurantHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${COLORS.gray200}`,
      paddingBottom: SPACING[2],
    },
    restaurantName: {
      ...FONTS.elegant,
      fontSize: '1.125rem',
      fontWeight: '600',
      color: COLORS.primary,
      margin: 0,
      cursor: 'pointer',
    },
    restaurantDistance: {
      ...FONTS.elegant,
      color: COLORS.accent,
      fontWeight: TYPOGRAPHY.semibold,
      fontSize: TYPOGRAPHY.sm.fontSize,
      flexShrink: 0,
      marginLeft: SPACING[3],
    },
    dishesContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[2],
    },
  },
  ratings: {
    header: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
    },
    headerInner: {
      maxWidth: '700px',
      margin: '0 auto',
      padding: `calc(60px + ${SPACING[4]}) ${SPACING[4]} ${SPACING[6]}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    headerImage: {
      width: '180px',
      height: 'auto',
      objectFit: 'contain',
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium as string,
    },
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[4],
    },
    searchBarContainer: {
      maxWidth: '450px',
      position: 'relative',
    },
    searchInput: {
      ...STYLES.input as StyleObject,
      textAlign: 'center',
    },
    resetButton: {
      position: 'absolute',
      top: '-30px',
      right: '-5px',
      background: 'transparent',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      color: COLORS.white,
      opacity: 0.7,
      transition: 'all 0.2s ease',
    },
    body: {
      maxWidth: '768px',
      margin: `${SPACING[6]} auto 0`,
      padding: `0 ${SPACING[4]} ${SPACING[12]} `,
    },
    errorContainer: {
      textAlign: 'center',
      color: COLORS.danger,
    },
    dishesContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[4],
    },
    emptyStateContainer: {
      textAlign: 'center',
      color: COLORS.textSecondary,
      padding: SPACING[8],
    },
    emptyStateLink: {
      ...STYLES.primaryButton as StyleObject,
      marginTop: SPACING[4],
    },
    card: {
      ...STYLES.card as StyleObject,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    cardInner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
      paddingRight: SPACING[3],
    },
    cardTitle: {
      ...FONTS.heading,
      fontSize: TYPOGRAPHY.lg.fontSize,
      color: COLORS.gray900,
      margin: `0 0 ${SPACING[1]} 0`,
    },
    cardSubtitle: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.textSecondary,
      margin: `0 0 ${SPACING[3]} 0`,
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: SPACING[1],
    },
    cardRestaurantLink: {
      color: COLORS.primary,
      fontWeight: '500',
    },
    cardDistance: {
      ...FONTS.elegant,
      color: COLORS.accent,
      fontWeight: TYPOGRAPHY.semibold,
      fontSize: TYPOGRAPHY.sm.fontSize,
      marginLeft: SPACING[1],
    },
    cardRatingsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[1],
    },
    cardRatingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING[2],
    },
    cardRatingLabel: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      fontWeight: TYPOGRAPHY.medium,
      color: COLORS.textSecondary,
      width: '70px',
    },
    cardRatingValue: {
      ...TYPOGRAPHY.sm,
      color: COLORS.text,
      fontWeight: '500',
    },
    cardPhotoContainer: {
      width: '80px',
      height: '80px',
      borderRadius: STYLES.borderRadiusMedium as string,
      overflow: 'hidden',
      flexShrink: 0,
    },
    cardPhoto: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  },
  profile: {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      paddingTop: SPACING[4],
    },
    noUserContainer: {
      backgroundColor: COLORS.white,
      borderRadius: STYLES.borderRadiusLarge as string,
      padding: `${SPACING[12]} ${SPACING[6]}`,
      boxShadow: STYLES.shadowMedium as string,
      border: `1px solid ${COLORS.gray200}`,
      textAlign: 'center',
    },
    noUserIcon: {
      fontSize: '3rem',
      marginBottom: SPACING[3],
    },
    noUserText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
    },
  },
  admin: {
    container: {
      padding: SPACING[4],
      maxWidth: '1200px',
      margin: '0 auto',
    },
    title: {
      ...TYPOGRAPHY.h1,
      marginBottom: SPACING[6],
    },
    tabsContainer: {
      display: 'flex',
      gap: SPACING[2],
      marginBottom: SPACING[6],
      borderBottom: `2px solid ${COLORS.border}`,
      paddingBottom: SPACING[2],
      flexWrap: 'wrap',
    },
    tabButton: {
      ...TYPOGRAPHY.button,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      border: 'none',
      borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`,
      cursor: 'pointer',
    },
    errorContainer: {
      ...TYPOGRAPHY.body,
      color: COLORS.error,
      background: `${COLORS.error}10`,
      padding: SPACING[4],
      borderRadius: BORDERS.radius.medium,
      marginBottom: SPACING[4],
      cursor: 'pointer',
    },
    section: {
      background: COLORS.surface,
      padding: SPACING[6],
      borderRadius: BORDERS.radius.large,
      marginBottom: SPACING[6],
      boxShadow: SHADOWS.small,
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[4],
    },
    sectionTitle: {
      ...TYPOGRAPHY.h2,
      margin: 0,
    },
    formGrid: {
      display: 'grid',
      gap: SPACING[4],
    },
    button: {
      ...TYPOGRAPHY.button,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      border: 'none',
      borderRadius: BORDERS.radius.small,
      cursor: 'pointer',
    },
    resetButton: {
      background: 'transparent',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      color: COLORS.textSecondary,
      transition: 'color 0.2s ease, transform 0.2s ease',
    },
    clearSearchButton: {
      position: 'absolute',
      top: '50%',
      right: '12px',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: COLORS.textSecondary,
    },
    itemCard: {
      background: COLORS.surface,
      padding: SPACING[4],
      borderRadius: BORDERS.radius.medium,
      boxShadow: SHADOWS.small,
    },
    itemCardTitle: {
      ...TYPOGRAPHY.h3,
      marginBottom: SPACING[2],
    },
    itemCardSubtitle: {
      ...TYPOGRAPHY.body,
      color: COLORS.textSecondary,
      marginBottom: SPACING[2],
    },
    itemCardActions: {
      display: 'flex',
      gap: SPACING[2],
    },
    link: {
      color: COLORS.primary,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    tableHeader: {
      ...TYPOGRAPHY.caption,
      fontWeight: TYPOGRAPHY.semibold,
      padding: SPACING[3],
      textAlign: 'left',
      borderBottom: `2px solid ${COLORS.border}`,
    },
    tableCell: {
      ...TYPOGRAPHY.body,
      padding: SPACING[3],
    },
    paginationContainer: {
      ...UTILITIES.flexCenter,
      gap: SPACING[2],
      marginTop: SPACING[4],
      flexWrap: 'wrap',
    },
    paginationButton: {
      ...TYPOGRAPHY.button,
      ...STYLES.sortButtonDefault as StyleObject,
    },
    paginationText: {
      ...TYPOGRAPHY.body,
      padding: `0 ${SPACING[2]}`,
    },
    accessDeniedContainer: {
      padding: SPACING[4],
      textAlign: 'center',
    },
    accessDeniedTitle: {
      ...TYPOGRAPHY.h2,
      color: COLORS.error,
    },
    accessDeniedText: {
      ...TYPOGRAPHY.body,
      marginTop: SPACING[2],
    },
    // New styles for refactoring AdminScreen
    backButton: {
      ...STYLES.secondaryButton as StyleObject,
      marginBottom: SPACING[4],
      display: 'inline-flex',
      alignItems: 'center',
      gap: SPACING[2],
    },
    titleWithMargin: {
      ...TYPOGRAPHY.h1,
      marginBottom: SPACING[6],
    },
    h2WithMargin: {
      ...TYPOGRAPHY.h2,
      marginBottom: SPACING[4],
    },
    flexEnd: {
      display: 'flex',
      gap: SPACING[2],
      justifyContent: 'flex-end',
    },
    flexGapCenter: {
      display: 'flex',
      gap: SPACING[2],
      alignItems: 'center',
    },
    fullWidthPrimaryButton: {
      ...STYLES.primaryButton as StyleObject,
      width: '100%',
      padding: SPACING[4],
    },
    relativeContainer: {
      position: 'relative',
    },
    manuallyAddedBadge: {
      ...TYPOGRAPHY.caption,
      color: COLORS.primary,
      marginLeft: SPACING[2],
    },
    itemCardSubtitleWithMargin: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginBottom: SPACING[4],
      fontSize: '0.75rem',
    },
    flexBetweenWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING[2],
      flexWrap: 'wrap',
    },
    gridTwoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: SPACING[4],
      marginBottom: SPACING[4],
    },
    hiddenCommentBadge: {
      ...TYPOGRAPHY.caption,
      color: COLORS.error,
      fontWeight: 'bold',
    },
    analyticsDateFilterContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: SPACING[4],
      alignItems: 'center',
      background: COLORS.surface,
      padding: SPACING[4],
      borderRadius: BORDERS.radius.medium,
      marginBottom: SPACING[6],
    },
    analyticsDateLabel: {
      ...TYPOGRAPHY.caption,
      display: 'block',
      marginBottom: SPACING[1],
    },
    analyticsDateInput: {
      ...STYLES.input as StyleObject,
      width: 'auto',
    },
    analyticsTableContainer: {
      overflowX: 'auto',
      background: COLORS.surface,
      borderRadius: BORDERS.radius.medium,
      padding: SPACING[2],
    },
    analyticsTable: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px',
    },
    analyticsTableHeaderRow: {
      borderBottom: `2px solid ${COLORS.border}`,
    },
    analyticsTableRow: {
      borderBottom: `1px solid ${COLORS.border}`,
    },
    analyticsTableCellCentered: {
      ...TYPOGRAPHY.body,
      padding: SPACING[3],
      textAlign: 'center',
    },
    analyticsTableCellName: {
      ...TYPOGRAPHY.body,
      padding: SPACING[3],
      fontWeight: TYPOGRAPHY.medium,
    },
    analyticsEmptyStateContainer: {
      textAlign: 'center',
      padding: SPACING[8],
      background: COLORS.surface,
      borderRadius: BORDERS.radius.medium,
    },
    analyticsEmptyStateSubtext: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginTop: SPACING[2],
    },
  },
  about: {
    header: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
    },
    headerInner: {
      maxWidth: '700px',
      margin: '0 auto',
      padding: `calc(60px + ${SPACING[4]}) ${SPACING[8]} ${SPACING[6]}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    headerImage: {
      width: '180px',
      height: 'auto',
      objectFit: 'contain',
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium as string,
    },
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[4],
    },
    headerSubtitle: {
      ...TYPOGRAPHY.body,
      color: COLORS.textWhite,
      lineHeight: 1.7,
    },
    body: {
      maxWidth: '700px',
      margin: `${SPACING[8]} auto 0`,
      padding: `0 ${SPACING[4]} ${SPACING[12]}`,
      color: COLORS.text,
    },
    bodyInner: {
      ...TYPOGRAPHY.body,
      lineHeight: 1.7,
    },
    sectionTitle: {
      ...TYPOGRAPHY.h2,
      marginTop: 0,
      marginBottom: SPACING[3],
    },
    sectionTitleSpaced: {
      ...TYPOGRAPHY.h2,
      marginTop: SPACING[8],
      marginBottom: SPACING[3],
    },
    list: {
      paddingLeft: SPACING[5],
      listStyle: 'decimal',
    },
    listItem: {
      marginBottom: SPACING[3],
    },
    communityBox: {
      marginTop: SPACING[10],
      padding: SPACING[6],
      backgroundColor: '#cac2af',
      borderRadius: STYLES.borderRadiusLarge as string,
      textAlign: 'center',
    },
    communityTitle: {
      ...TYPOGRAPHY.h3,
      marginTop: 0,
      marginBottom: SPACING[3],
      color: COLORS.accent,
    },
    communityText: {
      margin: `0 0 ${SPACING[4]} 0`,
    },
    communityLink: {
      ...STYLES.primaryButton as StyleObject,
      backgroundColor: COLORS.accent,
    },
  },
};
