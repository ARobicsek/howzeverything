// src/constants.ts
import React from 'react'; // Import React to get React.CSSProperties
import { THEMES } from './styles/themes';


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
  }
};

export const COLORS = THEMES.default;

export const STYLE_FUNCTIONS = {
  getPaginationButtonStyle: (disabled: boolean) => ({
    ...SCREEN_STYLES.admin.paginationButton,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  getTabButtonStyle: (isActive: boolean) => ({
    ...SCREEN_STYLES.admin.tabButton,
    backgroundColor: isActive ? COLORS.primary : 'transparent',
    color: isActive ? COLORS.white : COLORS.textPrimary,
  }),
  getAddRestaurantButtonStyle: (loading: boolean) => ({
    ...SCREEN_STYLES.admin.button,
    padding: SPACING[4],
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
  }),
  getCommentItemStyle: (isHidden: boolean) => ({
    ...SCREEN_STYLES.admin.itemCard,
    backgroundColor: isHidden ? COLORS.gray100 : COLORS.surface,
    opacity: isHidden ? 0.7 : 1,
  }),
  getToggleCommentVisibilityButtonStyle: (isHidden: boolean) => ({
    ...SCREEN_STYLES.admin.button,
    backgroundColor: isHidden ? COLORS.success : COLORS.warning,
    color: COLORS.white,
  }),
  getFetchAnalyticsButtonStyle: (loading: boolean) => ({
    ...SCREEN_STYLES.admin.button,
    padding: `${SPACING[3]} ${SPACING[4]}`,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    cursor: loading ? 'not-allowed' : 'pointer',
    alignSelf: 'flex-end',
    opacity: loading ? 0.6 : 1,
  }),
  getSortableHeaderStyle: (align: 'left' | 'center' | 'right') => ({
    ...SCREEN_STYLES.admin.tableHeader,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textAlign: align,
  }),
  getPasswordToggleButtonStyle: (loading: boolean) => ({
    ...COMPONENT_STYLES.loginForm.passwordToggleButton,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1,
  }),
  getSubmitButtonStyle: (loading: boolean) => ({
    ...STYLES.primaryButton,
    width: '100%',
    minHeight: '50px',
    marginBottom: SPACING[4],
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
    backgroundColor: loading ? COLORS.gray300 : COLORS.accent,
    borderColor: loading ? COLORS.gray300 : COLORS.black,
  }),
  getModeToggleButtonStyle: (loading: boolean) => ({
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
  getCancelButtonStyle: (loading: boolean) => ({
    ...STYLES.secondaryButton,
    width: '100%',
    color: COLORS.black,
    borderColor: COLORS.black,
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
  }),
  getAvatarContainerStyle: (avatarUrl?: string | null) => ({
    ...COMPONENT_STYLES.profileCard.avatarContainer,
    backgroundColor: avatarUrl ? 'transparent' : COLORS.accent,
    backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
  }),
  getEditProfileButtonStyle: (loading: boolean) => ({
    ...STYLES.primaryButton,
    width: '100%',
    backgroundColor: COLORS.accent,
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
  }),
  getSignOutButtonStyle: (loading: boolean, isSigningOut: boolean) => ({
    ...STYLES.secondaryButton,
    width: '100%',
    color: COLORS.black,
    borderColor: COLORS.black,
    opacity: (loading || isSigningOut) ? 0.5 : 1,
    cursor: (loading || isSigningOut) ? 'not-allowed' : 'pointer',
  }),
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

export const UTILITIES = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
  } as React.CSSProperties,
  fullBleed: {
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
  } as React.CSSProperties,
};

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
    ...UTILITIES.flexCenter,
    display: 'inline-flex',
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
    ...UTILITIES.flexCenter,
    display: 'inline-flex',
  } as React.CSSProperties, // Added casting
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
    ...UTILITIES.flexCenter,
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
    ...UTILITIES.flexCenter,
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
    ...UTILITIES.flexCenter,
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
    ...UTILITIES.flexCenter,
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

// 2. Component Styles
export const COMPONENT_STYLES = {
  loginForm: {
    container: {
      ...STYLES.modal,
      maxWidth: '400px',
      width: '100%',
      padding: SPACING[8],
    } as React.CSSProperties,
    headerContainer: {
      marginBottom: SPACING[6],
      textAlign: 'center',
    } as React.CSSProperties,
    headerTitle: {
      ...FONTS.heading,
      fontSize: TYPOGRAPHY['2xl'].fontSize,
      color: COLORS.gray900,
      margin: `0 0 ${SPACING[2]} 0`,
    } as React.CSSProperties,
    headerSubtitle: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
    } as React.CSSProperties,
    errorContainer: {
      backgroundColor: '#FEE2E2',
      border: `1px solid #FECACA`,
      borderRadius: STYLES.borderRadiusMedium,
      padding: SPACING[3],
      marginBottom: SPACING[5],
    } as React.CSSProperties,
    errorText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.danger,
      margin: 0,
    } as React.CSSProperties,
    formFieldContainer: {
      marginBottom: SPACING[5],
    } as React.CSSProperties,
    label: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      fontWeight: TYPOGRAPHY.medium,
      color: COLORS.textSecondary,
      display: 'block',
      marginBottom: SPACING[2],
    } as React.CSSProperties,
    usernameHint: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.xs.fontSize,
      fontWeight: TYPOGRAPHY.normal,
      color: COLORS.gray400,
      marginLeft: SPACING[2],
    } as React.CSSProperties,
    passwordInputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    loadingSpinnerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING[2],
    } as React.CSSProperties,
    loadingSpinner: {
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTopColor: COLORS.white,
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      animation: 'spin 0.8s linear infinite',
    } as React.CSSProperties,
    modeToggleContainer: {
      textAlign: 'center',
      marginBottom: SPACING[4],
    } as React.CSSProperties,
  },
  profileCard: {
    container: {
      ...STYLES.card,
      boxShadow: STYLES.shadowLarge,
      padding: SPACING[6],
    } as React.CSSProperties,
    noProfileContainer: {
      ...STYLES.card,
      textAlign: 'center',
      padding: SPACING[6],
    } as React.CSSProperties,
    noProfileText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
    } as React.CSSProperties,
    errorContainer: {
      backgroundColor: '#FEE2E2',
      border: '1px solid #FECACA',
      borderRadius: STYLES.borderRadiusMedium,
      padding: SPACING[3],
      marginBottom: SPACING[5],
    } as React.CSSProperties,
    errorText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.danger,
      margin: 0,
    } as React.CSSProperties,
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: SPACING[6],
    } as React.CSSProperties,
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
      boxShadow: STYLES.shadowMedium,
    } as React.CSSProperties,
    avatarInitials: {
      fontFamily: '"Pinyon Script", cursive',
      fontWeight: 400,
      fontSize: '2.5rem',
      color: COLORS.white,
      lineHeight: 1,
    } as React.CSSProperties,
    nameAndEmailContainer: {
      flex: 1,
      minWidth: 0,
    } as React.CSSProperties,
    name: {
      ...FONTS.heading,
      fontSize: TYPOGRAPHY.xl.fontSize,
      color: COLORS.gray900,
      margin: `0 0 ${SPACING[1]} 0`,
      wordBreak: 'break-word',
    } as React.CSSProperties,
    email: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
      wordBreak: 'break-word',
    } as React.CSSProperties,
    adminBadge: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.xs.fontSize,
      fontWeight: TYPOGRAPHY.semibold,
      color: COLORS.accent,
      backgroundColor: `${COLORS.accent}2A`,
      padding: `${SPACING[1]} ${SPACING[3]}`,
      borderRadius: STYLES.borderRadiusSmall,
      display: 'inline-block',
      marginTop: SPACING[2],
    } as React.CSSProperties,
    detailsContainer: {
      marginBottom: SPACING[6],
      paddingTop: SPACING[5],
      borderTop: `1px solid ${COLORS.gray100}`,
    } as React.CSSProperties,
    bioContainer: {
      marginBottom: SPACING[4],
    } as React.CSSProperties,
    sectionHeader: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      fontWeight: TYPOGRAPHY.semibold,
      color: COLORS.textSecondary,
      margin: `0 0 ${SPACING[2]} 0`,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    } as React.CSSProperties,
    bioText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.text,
      margin: 0,
      lineHeight: '1.6',
      wordBreak: 'break-word',
    } as React.CSSProperties,
    locationText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.text,
      margin: 0,
    } as React.CSSProperties,
    actionButtonsContainer: {
      display: 'flex',
      gap: SPACING[3],
      flexDirection: 'column',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    content: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    } as React.CSSProperties,
    headerContainer: {
      marginBottom: '24px',
      textAlign: 'center',
    } as React.CSSProperties,
    headerTitle: {
      ...FONTS.elegant,
      fontSize: '24px',
      fontWeight: '600',
      color: COLORS.text,
      margin: '0 0 8px 0',
    } as React.CSSProperties,
    headerSubtitle: {
      ...FONTS.elegant,
      fontSize: '14px',
      color: COLORS.text,
      margin: 0,
    } as React.CSSProperties,
    errorContainer: {
      backgroundColor: '#FEF2F2',
      border: '1px solid #FECACA',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
    } as React.CSSProperties,
    errorText: {
      ...FONTS.elegant,
      fontSize: '14px',
      color: COLORS.danger,
      margin: 0,
    } as React.CSSProperties,
    formFieldContainer: {
      marginBottom: '16px',
    } as React.CSSProperties,
    formFieldContainerLargeMargin: {
      marginBottom: '24px',
    } as React.CSSProperties,
    label: {
      ...FONTS.elegant,
      fontSize: '14px',
      fontWeight: '500',
      color: COLORS.text,
      display: 'block',
      marginBottom: '6px',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    avatarUrlHint: {
      ...FONTS.elegant,
      fontSize: '12px',
      color: COLORS.text,
      margin: '4px 0 0 0',
    } as React.CSSProperties,
    actionButtonsContainer: {
      display: 'flex',
      gap: '12px',
      flexDirection: 'column',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
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
    } as React.CSSProperties,
  }
};

// 4. Screen-Specific Styles
export const SCREEN_STYLES = {
  app: {
    authFlowContainer: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      position: 'relative',
    } as React.CSSProperties,
    authFlowInnerContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      minHeight: '100vh',
    } as React.CSSProperties,
    authFlowLogoContainer: {
      textAlign: 'center',
      marginBottom: '40px',
    } as React.CSSProperties,
    authFlowLogo: {
      maxWidth: '200px',
      height: 'auto',
      margin: '0 auto',
    } as React.CSSProperties,
    authFlowFormContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    } as React.CSSProperties,
    authFlowFormTitle: {
      ...FONTS.elegant,
      fontSize: '20px',
      fontWeight: '600',
      color: COLORS.text,
      margin: '0 0 24px 0',
    } as React.CSSProperties,
  },
  menu: {
    // Top-level container
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: COLORS.background,
    } as React.CSSProperties,
    // Sticky Header
    stickyHeader: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.white,
      borderBottom: `1px solid ${COLORS.gray200}`,
      position: 'sticky',
      top: '59px', // This assumes a fixed top navigation height
      zIndex: 10,
      boxShadow: STYLES.shadowSmall,
      width: '100vw',
    } as React.CSSProperties,
    headerContainer: {
      ...UTILITIES.flexBetween,
      maxWidth: '768px',
      margin: '0 auto',
      padding: `${SPACING[3]} ${LAYOUT_CONFIG.APP_CONTAINER.padding}`,
    } as React.CSSProperties,
    restaurantNameContainer: {
      flex: 1,
      textAlign: 'center',
      margin: `0 ${SPACING[2]}`,
      overflow: 'hidden',
      cursor: 'pointer',
    } as React.CSSProperties,
    restaurantName: {
      ...UTILITIES.truncate,
      ...FONTS.heading,
      fontSize: TYPOGRAPHY.xl.fontSize,
      color: COLORS.gray900,
      margin: 0,
    } as React.CSSProperties,
    address: {
      ...FONTS.elegant,
      color: COLORS.text,
      opacity: 0.7,
      fontSize: '0.8rem',
      lineHeight: '1.3',
      margin: '2px 0 0 0',
      ...UTILITIES.truncate,
    } as React.CSSProperties,
    headerButtonsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING[2],
    } as React.CSSProperties,
    pinButton: {
      ...STYLES.iconButton,
      border: 'none',
    } as React.CSSProperties,
    actionMenu: {
      container: {
        position: 'relative',
      } as React.CSSProperties,
      dropdown: {
        position: 'absolute',
        top: 'calc(100% + 4px)',
        right: 0,
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusMedium,
        boxShadow: STYLES.shadowLarge,
        border: `1px solid ${COLORS.gray200}`,
        overflow: 'hidden',
        zIndex: STYLES.zDropdown,
        minWidth: '160px',
      } as React.CSSProperties,
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
      } as React.CSSProperties,
      menuItemDanger: {
        color: COLORS.danger,
      } as React.CSSProperties,
    },
    // Main Content Area
    main: {
      flex: 1,
      maxWidth: '768px',
      width: '100%',
      margin: '0 auto',
      paddingTop: SPACING[4],
    } as React.CSSProperties,
    mainInnerContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: `0 ${SPACING[1]}`,
    } as React.CSSProperties,
    // Error Message
    error: {
      container: {
        backgroundColor: COLORS.red50,
        border: `1px solid ${COLORS.red200}`,
        borderRadius: STYLES.borderRadiusMedium,
        padding: SPACING[4],
        textAlign: 'center',
        marginBottom: SPACING[4],
      } as React.CSSProperties,
      text: {
        ...FONTS.body,
        color: COLORS.danger,
        margin: 0,
      } as React.CSSProperties,
    },
    // Advanced Sort Section
    advancedSort: {
      container: {
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge,
        padding: SPACING[4],
        boxShadow: STYLES.shadowMedium,
        border: `1px solid ${COLORS.gray200}`,
        marginBottom: SPACING[4],
      } as React.CSSProperties,
      innerContainer: {
        display: 'flex',
        gap: SPACING[2],
        flexWrap: 'wrap',
      } as React.CSSProperties,
      arrow: {
        marginLeft: SPACING[1],
      } as React.CSSProperties,
    },
    // Search Component Wrapper
    searchWrapper: {
      marginLeft: SPACING[1],
      marginRight: SPACING[1],
      marginBottom: SPACING[5],
    } as React.CSSProperties,
    // Dish List
    dishList: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING[2],
      } as React.CSSProperties,
      noResultsContainer: {
        textAlign: 'center',
        padding: SPACING[6],
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge,
        boxShadow: STYLES.shadowMedium,
        border: `1px solid ${COLORS.gray200}`,
      } as React.CSSProperties,
      noResultsText: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.base.fontSize,
        color: COLORS.textSecondary,
        margin: 0,
      } as React.CSSProperties,
    },
    // Empty State (No Dishes)
    emptyState: {
      container: {
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge,
        padding: SPACING[8],
        textAlign: 'center',
        boxShadow: STYLES.shadowMedium,
        border: `1px solid ${COLORS.gray200}`,
      } as React.CSSProperties,
      icon: {
        color: COLORS.gray400,
        marginBottom: SPACING[4],
      } as React.CSSProperties,
      title: {
        ...FONTS.heading,
        fontSize: TYPOGRAPHY.xl.fontSize,
        color: COLORS.gray900,
        marginBottom: SPACING[3],
      } as React.CSSProperties,
      text: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.base.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SPACING[5],
      } as React.CSSProperties,
    },
    // Add Form Container
    addFormContainer: {
      marginTop: SPACING[4],
    } as React.CSSProperties,
    // Full Name Modal
    fullNameModal: {
      content: {
        ...STYLES.modal,
        maxWidth: '500px',
        textAlign: 'center',
      } as React.CSSProperties,
      name: {
        ...FONTS.elegant,
        color: COLORS.text,
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
        wordBreak: 'break-word',
      } as React.CSSProperties,
      address: {
        ...FONTS.elegant,
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.base.fontSize,
        lineHeight: 1.5,
        marginBottom: SPACING[6],
        wordBreak: 'break-word',
      } as React.CSSProperties,
      closeButton: {
        ...STYLES.secondaryButton,
        width: '100%',
      } as React.CSSProperties,
    },
    // --- Sub-components defined in MenuScreen ---
    // Duplicate Dish Warning Modal
    duplicateWarningModal: {
      content: {
        ...STYLES.modal,
        maxWidth: '500px',
        border: `1px solid ${COLORS.border}`,
      } as React.CSSProperties,
      title: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginTop: 0,
        marginBottom: SPACING[2],
      } as React.CSSProperties,
      text: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        marginBottom: SPACING[4],
      } as React.CSSProperties,
      list: {
        listStyle: 'none',
        padding: 0,
        margin: `0 0 ${SPACING[6]} 0`,
        maxHeight: '200px',
        overflowY: 'auto',
        border: `1px solid ${COLORS.border}`,
        borderRadius: BORDERS.radius.medium,
      } as React.CSSProperties,
      listItem: {
        padding: `${SPACING[2]} ${SPACING[3]}`,
        cursor: 'pointer',
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.semibold,
        transition: 'background-color 0.2s ease',
      } as React.CSSProperties,
      buttonContainer: {
        display: 'flex',
        gap: SPACING[3],
      } as React.CSSProperties,
      cancelButton: {
        ...STYLES.secondaryButton,
        flex: 1,
        border: `1px solid ${COLORS.gray300}`,
        color: COLORS.text,
      } as React.CSSProperties,
      confirmButton: {
        ...STYLES.primaryButton,
        flex: 1,
      } as React.CSSProperties,
    },
    // Consolidated Search and Add Form
    search: {
      container: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: STYLES.borderRadiusLarge,
        padding: SPACING[4],
      } as React.CSSProperties,
      header: {
        ...UTILITIES.flexBetween,
        marginBottom: SPACING[1],
      } as React.CSSProperties,
      title: {
        ...FONTS.heading,
        fontSize: TYPOGRAPHY.lg.fontSize,
        color: COLORS.text,
        margin: 0,
      } as React.CSSProperties,
      resetButton: {
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: COLORS.textSecondary,
        transition: 'color 0.2s ease, transform 0.2s ease',
      } as React.CSSProperties,
      addDishContainer: {
        marginTop: SPACING[4],
        textAlign: 'center',
      } as React.CSSProperties,
      addDishText: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        color: COLORS.textSecondary,
        margin: `0 0 ${SPACING[2]} 0`,
      } as React.CSSProperties,
      addDishButton: {
        ...STYLES.primaryButton,
        padding: `${SPACING[2]} ${SPACING[4]}`,
        fontSize: TYPOGRAPHY.sm.fontSize,
      } as React.CSSProperties,
    },
    // Enhanced Add Dish Form
    addDishForm: {
      container: {
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge,
        padding: SPACING[6],
        boxShadow: STYLES.shadowLarge,
        border: `1px solid ${COLORS.gray200}`,
      } as React.CSSProperties,
      title: {
        ...FONTS.heading,
        fontSize: TYPOGRAPHY.xl.fontSize,
        color: COLORS.gray900,
        marginBottom: SPACING[5],
      } as React.CSSProperties,
      inputContainer: {
        marginBottom: SPACING[5],
      } as React.CSSProperties,
      label: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        fontWeight: TYPOGRAPHY.medium,
        color: COLORS.textSecondary,
        display: 'block',
        marginBottom: SPACING[2],
      } as React.CSSProperties,
      input: {
        ...STYLES.input,
        borderWidth: '1px',
      } as React.CSSProperties,
      ratingContainer: {
        marginBottom: SPACING[6],
      } as React.CSSProperties,
      starButtonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING[2],
      } as React.CSSProperties,
      starButtonsInnerContainer: {
        display: 'flex',
        gap: SPACING[1],
      } as React.CSSProperties,
      starButton: {
        background: 'none',
        border: 'none',
        padding: SPACING[1],
        fontSize: '1.5rem',
        transition: 'all 0.2s ease',
      } as React.CSSProperties,
      ratingText: {
        ...FONTS.body,
        fontSize: TYPOGRAPHY.base.fontSize,
        color: COLORS.text,
        marginLeft: SPACING[2],
        minWidth: '30px',
      } as React.CSSProperties,
      buttonContainer: {
        display: 'flex',
        gap: SPACING[3],
      } as React.CSSProperties,
      submitButton: {
        ...STYLES.primaryButton,
        flex: 1,
      } as React.CSSProperties,
      cancelButton: {
        ...STYLES.secondaryButton,
        flex: 1,
      } as React.CSSProperties,
    },
  },
  findRestaurant: {
    container: {
      backgroundColor: COLORS.background,
      minHeight: '100vh',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    headerInner: {
      paddingTop: `calc(60px + ${SPACING[4]})`,
      paddingBottom: SPACING[6],
    } as React.CSSProperties,
    headerImage: {
      width: '180px',
      marginTop: SPACING[4],
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium,
      height: 'auto',
      objectFit: 'contain',
    } as React.CSSProperties,
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[6],
    } as React.CSSProperties,
    searchBarContainer: {
      maxWidth: '350px',
    } as React.CSSProperties,
    searchBar: {
      ...STYLES.input,
      cursor: 'pointer',
      color: COLORS.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: SPACING[2],
    } as React.CSSProperties,
    mainContent: {
      overflow: 'hidden',
    } as React.CSSProperties,
    mainContentInner: {
      maxWidth: RESTAURANT_CARD_MAX_WIDTH,
    } as React.CSSProperties,
    addRestaurantTitle: {
      ...FONTS.elegant,
      color: COLORS.text,
      fontSize: '18px',
      fontWeight: 500,
    } as React.CSSProperties,
    refreshButton: {
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    } as React.CSSProperties,
    distanceLabel: {
      ...FONTS.elegant,
      color: COLORS.accent,
      fontSize: '1rem',
      fontWeight: 500,
      marginLeft: '16px',
      marginRight: '12px',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    distanceFilterContainer: {
        marginBottom: SPACING[4],
    } as React.CSSProperties,
  },
  discovery: {
    container: {
      backgroundColor: COLORS.background,
      minHeight: '100vh',
    } as React.CSSProperties,
    header: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
      marginBottom: SPACING[6],
    } as React.CSSProperties,
    headerInner: {
      paddingTop: `calc(60px + ${SPACING[4]})`,
      paddingBottom: SPACING[6],
    } as React.CSSProperties,
    headerImage: {
      width: '180px',
      marginTop: SPACING[4],
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium,
      height: 'auto',
      objectFit: 'contain',
    } as React.CSSProperties,
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[6],
    } as React.CSSProperties,
    searchBarContainer: {
      maxWidth: '350px',
      position: 'relative',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    filtersContainer: {
      display: 'flex',
      gap: SPACING[3],
      marginTop: SPACING[4],
      width: '100%',
      maxWidth: '350px',
    } as React.CSSProperties,
    filterContainer: {
      flex: 1,
      position: 'relative',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    main: {
      maxWidth: RESTAURANT_CARD_MAX_WIDTH,
    } as React.CSSProperties,
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[4],
    } as React.CSSProperties,
    messageText: {
      ...FONTS.elegant,
      color: COLORS.text,
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '8px',
    } as React.CSSProperties,
    messageSubText: {
      ...FONTS.elegant,
      color: COLORS.text,
      opacity: 0.7,
    } as React.CSSProperties,
    errorText: {
      ...FONTS.elegant,
      color: COLORS.danger,
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '8px',
    } as React.CSSProperties,
    restaurantHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${COLORS.gray200}`,
      paddingBottom: SPACING[2],
    } as React.CSSProperties,
    restaurantName: {
      ...FONTS.elegant,
      fontSize: '1.125rem',
      fontWeight: '600',
      color: COLORS.primary,
      margin: 0,
      cursor: 'pointer',
    } as React.CSSProperties,
    restaurantDistance: {
      ...FONTS.elegant,
      color: COLORS.accent,
      fontWeight: TYPOGRAPHY.semibold,
      fontSize: TYPOGRAPHY.sm.fontSize,
      flexShrink: 0,
      marginLeft: SPACING[3],
    } as React.CSSProperties,
    dishesContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[2],
    } as React.CSSProperties,
  },
  ratings: {
    header: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
    } as React.CSSProperties,
    headerInner: {
      maxWidth: '700px',
      margin: '0 auto',
      padding: `calc(60px + ${SPACING[4]}) ${SPACING[4]} ${SPACING[6]}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    } as React.CSSProperties,
    headerImage: {
      width: '180px',
      height: 'auto',
      objectFit: 'contain',
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium,
    } as React.CSSProperties,
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[4],
    } as React.CSSProperties,
    searchBarContainer: {
      maxWidth: '450px',
      position: 'relative',
    } as React.CSSProperties,
    searchInput: {
      ...STYLES.input,
      textAlign: 'center',
    } as React.CSSProperties,
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
    } as React.CSSProperties,
    body: {
      maxWidth: '768px',
      margin: `${SPACING[6]} auto 0`,
      padding: `0 ${SPACING[4]} ${SPACING[12]} `,
    } as React.CSSProperties,
    errorContainer: {
      textAlign: 'center',
      color: COLORS.danger,
    } as React.CSSProperties,
    dishesContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[4],
    } as React.CSSProperties,
    emptyStateContainer: {
      textAlign: 'center',
      color: COLORS.textSecondary,
      padding: SPACING[8],
    } as React.CSSProperties,
    emptyStateLink: {
      ...STYLES.primaryButton,
      marginTop: SPACING[4],
    } as React.CSSProperties,
    card: {
      ...STYLES.card,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
    cardInner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as React.CSSProperties,
    cardContent: {
      flex: 1,
      minWidth: 0,
      paddingRight: SPACING[3],
    } as React.CSSProperties,
    cardTitle: {
      ...FONTS.heading,
      fontSize: TYPOGRAPHY.lg.fontSize,
      color: COLORS.gray900,
      margin: `0 0 ${SPACING[1]} 0`,
    } as React.CSSProperties,
    cardSubtitle: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.textSecondary,
      margin: `0 0 ${SPACING[3]} 0`,
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: SPACING[1],
    } as React.CSSProperties,
    cardRestaurantLink: {
      color: COLORS.primary,
      fontWeight: '500',
    } as React.CSSProperties,
    cardDistance: {
      ...FONTS.elegant,
      color: COLORS.accent,
      fontWeight: TYPOGRAPHY.semibold,
      fontSize: TYPOGRAPHY.sm.fontSize,
      marginLeft: SPACING[1],
    } as React.CSSProperties,
    cardRatingsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING[1],
    } as React.CSSProperties,
    cardRatingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING[2],
    } as React.CSSProperties,
    cardRatingLabel: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.sm.fontSize,
      fontWeight: TYPOGRAPHY.medium,
      color: COLORS.textSecondary,
      width: '70px',
    } as React.CSSProperties,
    cardRatingValue: {
      ...TYPOGRAPHY.sm,
      color: COLORS.text,
      fontWeight: '500',
    } as React.CSSProperties,
    cardPhotoContainer: {
      width: '80px',
      height: '80px',
      borderRadius: STYLES.borderRadiusMedium,
      overflow: 'hidden',
      flexShrink: 0,
    } as React.CSSProperties,
    cardPhoto: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    } as React.CSSProperties,
  },
  profile: {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      paddingTop: SPACING[4],
    } as React.CSSProperties,
    noUserContainer: {
      backgroundColor: COLORS.white,
      borderRadius: STYLES.borderRadiusLarge,
      padding: `${SPACING[12]} ${SPACING[6]}`,
      boxShadow: STYLES.shadowMedium,
      border: `1px solid ${COLORS.gray200}`,
      textAlign: 'center',
    } as React.CSSProperties,
    noUserIcon: {
      fontSize: '3rem',
      marginBottom: SPACING[3],
    } as React.CSSProperties,
    noUserText: {
      ...FONTS.body,
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.textSecondary,
      margin: 0,
    } as React.CSSProperties,
  },
  admin: {
    container: {
      padding: SPACING[4],
      maxWidth: '1200px',
      margin: '0 auto',
    } as React.CSSProperties,
    title: {
      ...TYPOGRAPHY.h1,
      marginBottom: SPACING[6],
    } as React.CSSProperties,
    tabsContainer: {
      display: 'flex',
      gap: SPACING[2],
      marginBottom: SPACING[6],
      borderBottom: `2px solid ${COLORS.border}`,
      paddingBottom: SPACING[2],
      flexWrap: 'wrap',
    } as React.CSSProperties,
    tabButton: {
      ...TYPOGRAPHY.button,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      border: 'none',
      borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`,
      cursor: 'pointer',
    } as React.CSSProperties,
    errorContainer: {
      ...TYPOGRAPHY.body,
      color: COLORS.error,
      background: `${COLORS.error}10`,
      padding: SPACING[4],
      borderRadius: BORDERS.radius.medium,
      marginBottom: SPACING[4],
      cursor: 'pointer',
    } as React.CSSProperties,
    section: {
      background: COLORS.surface,
      padding: SPACING[6],
      borderRadius: BORDERS.radius.large,
      marginBottom: SPACING[6],
      boxShadow: SHADOWS.small,
    } as React.CSSProperties,
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[4],
    } as React.CSSProperties,
    sectionTitle: {
      ...TYPOGRAPHY.h2,
      margin: 0,
    } as React.CSSProperties,
    formGrid: {
      display: 'grid',
      gap: SPACING[4],
    } as React.CSSProperties,
    button: {
      ...TYPOGRAPHY.button,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      border: 'none',
      borderRadius: BORDERS.radius.small,
      cursor: 'pointer',
    } as React.CSSProperties,
    resetButton: {
      background: 'transparent',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      color: COLORS.textSecondary,
      transition: 'color 0.2s ease, transform 0.2s ease',
    } as React.CSSProperties,
    clearSearchButton: {
      position: 'absolute',
      top: '50%',
      right: '12px',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: COLORS.textSecondary,
    } as React.CSSProperties,
    itemCard: {
      background: COLORS.surface,
      padding: SPACING[4],
      borderRadius: BORDERS.radius.medium,
      boxShadow: SHADOWS.small,
    } as React.CSSProperties,
    itemCardTitle: {
      ...TYPOGRAPHY.h3,
      marginBottom: SPACING[2],
    } as React.CSSProperties,
    itemCardSubtitle: {
      ...TYPOGRAPHY.body,
      color: COLORS.textSecondary,
      marginBottom: SPACING[2],
    } as React.CSSProperties,
    itemCardActions: {
      display: 'flex',
      gap: SPACING[2],
    } as React.CSSProperties,
    link: {
      color: COLORS.primary,
      textDecoration: 'underline',
      cursor: 'pointer',
    } as React.CSSProperties,
    tableHeader: {
      ...TYPOGRAPHY.caption,
      fontWeight: TYPOGRAPHY.semibold,
      padding: SPACING[3],
      textAlign: 'left',
      borderBottom: `2px solid ${COLORS.border}`,
    } as React.CSSProperties,
    tableCell: {
      ...TYPOGRAPHY.body,
      padding: SPACING[3],
    } as React.CSSProperties,
    paginationContainer: {
      ...UTILITIES.flexCenter,
      gap: SPACING[2],
      marginTop: SPACING[4],
      flexWrap: 'wrap',
    } as React.CSSProperties,
    paginationButton: {
      ...TYPOGRAPHY.button,
      ...STYLES.sortButtonDefault,
    } as React.CSSProperties,
    paginationText: {
      ...TYPOGRAPHY.body,
      padding: `0 ${SPACING[2]}`,
    } as React.CSSProperties,
    accessDeniedContainer: {
      padding: SPACING[4],
      textAlign: 'center',
    } as React.CSSProperties,
    accessDeniedTitle: {
      ...TYPOGRAPHY.h2,
      color: COLORS.error,
    } as React.CSSProperties,
    accessDeniedText: {
      ...TYPOGRAPHY.body,
      marginTop: SPACING[2],
    } as React.CSSProperties,
    // New styles for refactoring AdminScreen
    backButton: {
      ...STYLES.secondaryButton,
      marginBottom: SPACING[4],
      display: 'inline-flex',
      alignItems: 'center',
      gap: SPACING[2],
    } as React.CSSProperties,
    titleWithMargin: {
      ...TYPOGRAPHY.h1,
      marginBottom: SPACING[6],
    } as React.CSSProperties,
    h2WithMargin: {
      ...TYPOGRAPHY.h2,
      marginBottom: SPACING[4],
    } as React.CSSProperties,
    flexEnd: {
      display: 'flex',
      gap: SPACING[2],
      justifyContent: 'flex-end',
    } as React.CSSProperties,
    flexGapCenter: {
      display: 'flex',
      gap: SPACING[2],
      alignItems: 'center',
    } as React.CSSProperties,
    fullWidthPrimaryButton: {
      ...STYLES.primaryButton,
      width: '100%',
      padding: SPACING[4],
    } as React.CSSProperties,
    relativeContainer: {
      position: 'relative',
    } as React.CSSProperties,
    manuallyAddedBadge: {
      ...TYPOGRAPHY.caption,
      color: COLORS.primary,
      marginLeft: SPACING[2],
    } as React.CSSProperties,
    itemCardSubtitleWithMargin: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginBottom: SPACING[4],
      fontSize: '0.75rem',
    } as React.CSSProperties,
    flexBetweenWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING[2],
      flexWrap: 'wrap',
    } as React.CSSProperties,
    gridTwoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: SPACING[4],
      marginBottom: SPACING[4],
    } as React.CSSProperties,
    hiddenCommentBadge: {
      ...TYPOGRAPHY.caption,
      color: COLORS.error,
      fontWeight: 'bold',
    } as React.CSSProperties,
    analyticsDateFilterContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: SPACING[4],
      alignItems: 'center',
      background: COLORS.surface,
      padding: SPACING[4],
      borderRadius: BORDERS.radius.medium,
      marginBottom: SPACING[6],
    } as React.CSSProperties,
    analyticsDateLabel: {
      ...TYPOGRAPHY.caption,
      display: 'block',
      marginBottom: SPACING[1],
    } as React.CSSProperties,
    analyticsDateInput: {
      ...STYLES.input,
      width: 'auto',
    } as React.CSSProperties,
    analyticsTableContainer: {
      overflowX: 'auto',
      background: COLORS.surface,
      borderRadius: BORDERS.radius.medium,
      padding: SPACING[2],
    } as React.CSSProperties,
    analyticsTable: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px',
    } as React.CSSProperties,
    analyticsTableHeaderRow: {
      borderBottom: `2px solid ${COLORS.border}`,
    } as React.CSSProperties,
    analyticsTableRow: {
      borderBottom: `1px solid ${COLORS.border}`,
    } as React.CSSProperties,
    analyticsTableCellCentered: {
      ...TYPOGRAPHY.body,
      padding: SPACING[3],
      textAlign: 'center',
    } as React.CSSProperties,
    analyticsTableCellName: {
      ...TYPOGRAPHY.body,
      padding: SPACING[3],
      fontWeight: TYPOGRAPHY.medium,
    } as React.CSSProperties,
    analyticsEmptyStateContainer: {
      textAlign: 'center',
      padding: SPACING[8],
      background: COLORS.surface,
      borderRadius: BORDERS.radius.medium,
    } as React.CSSProperties,
    analyticsEmptyStateSubtext: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginTop: SPACING[2],
    } as React.CSSProperties,
  },
  about: {
    header: {
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
    } as React.CSSProperties,
    headerInner: {
      maxWidth: '700px',
      margin: '0 auto',
      padding: `calc(60px + ${SPACING[4]}) ${SPACING[8]} ${SPACING[6]}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    } as React.CSSProperties,
    headerImage: {
      width: '180px',
      height: 'auto',
      objectFit: 'contain',
      marginBottom: SPACING[4],
      border: `2px solid ${COLORS.white}`,
      borderRadius: STYLES.borderRadiusMedium,
    } as React.CSSProperties,
    headerTitle: {
      ...TYPOGRAPHY.h1,
      color: COLORS.textWhite,
      marginBottom: SPACING[4],
    } as React.CSSProperties,
    headerSubtitle: {
      ...TYPOGRAPHY.body,
      color: COLORS.textWhite,
      lineHeight: 1.7,
    } as React.CSSProperties,
    body: {
      maxWidth: '700px',
      margin: `${SPACING[8]} auto 0`,
      padding: `0 ${SPACING[4]} ${SPACING[12]}`,
      color: COLORS.text,
    } as React.CSSProperties,
    bodyInner: {
      ...TYPOGRAPHY.body,
      lineHeight: 1.7,
    } as React.CSSProperties,
    sectionTitle: {
      ...TYPOGRAPHY.h2,
      marginTop: 0,
      marginBottom: SPACING[3],
    } as React.CSSProperties,
    sectionTitleSpaced: {
      ...TYPOGRAPHY.h2,
      marginTop: SPACING[8],
      marginBottom: SPACING[3],
    } as React.CSSProperties,
    list: {
      paddingLeft: SPACING[5],
      listStyle: 'decimal',
    } as React.CSSProperties,
    listItem: {
      marginBottom: SPACING[3],
    } as React.CSSProperties,
    communityBox: {
      marginTop: SPACING[10],
      padding: SPACING[6],
      backgroundColor: '#cac2af',
      borderRadius: STYLES.borderRadiusLarge,
      textAlign: 'center',
    } as React.CSSProperties,
    communityTitle: {
      ...TYPOGRAPHY.h3,
      marginTop: 0,
      marginBottom: SPACING[3],
      color: COLORS.accent,
    } as React.CSSProperties,
    communityText: {
      margin: `0 0 ${SPACING[4]} 0`,
    } as React.CSSProperties,
    communityLink: {
      ...STYLES.primaryButton,
      backgroundColor: COLORS.accent,
    } as React.CSSProperties,
  }
};
