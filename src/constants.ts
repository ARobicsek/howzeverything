import React from 'react'; // Import React to get React.CSSProperties

// 1. Core Design Tokens
export const DESIGN_TOKENS = {
  colors: {
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
  spacing: {
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px - Base unit
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
  },
  typography: {
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
  },
  borderRadius: {
    small: '6px',
    medium: '8px',
    large: '12px',
    full: '9999px',
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    default: 1,
    dropdown: 100,
    header: 10,
    modal: 2147483647,
  }
};

// 2. Component Styles
export const COMPONENT_STYLES = {
  card: {
    backgroundColor: DESIGN_TOKENS.colors.white,
    borderRadius: DESIGN_TOKENS.borderRadius.large,
    border: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
    padding: DESIGN_TOKENS.spacing[5],
    transition: `all ${DESIGN_TOKENS.transitions.slow} ease`,
  },
  button: {
    close: {
      position: 'absolute',
      top: DESIGN_TOKENS.spacing[4],
      right: DESIGN_TOKENS.spacing[4],
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: DESIGN_TOKENS.spacing[2],
    },
    icon: {
      base: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: DESIGN_TOKENS.colors.gray700,
      },
      default: {
        // Combines base styles with default variant styles
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: DESIGN_TOKENS.colors.gray700,
        backgroundColor: DESIGN_TOKENS.colors.gray100,
        border: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
      },
      transparent: {
        // Combines base styles with transparent variant styles
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: DESIGN_TOKENS.colors.gray700,
        backgroundColor: 'transparent',
        border: 'none',
      },
    },
  },
  input: { /* input styles */ },
  modal: {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      animation: 'fadeIn 0.3s ease',
    },
    content: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 'min(300px, 80vw)',
      backgroundColor: DESIGN_TOKENS.colors.navBarDark,
      boxShadow: DESIGN_TOKENS.shadows.large,
      display: 'flex',
      flexDirection: 'column',
      padding: `${DESIGN_TOKENS.spacing[8]} ${DESIGN_TOKENS.spacing[4]}`,
      animation: 'slideInFromRight 0.3s ease',
      zIndex: DESIGN_TOKENS.zIndex.modal,
    },
  },
  logo: {
    height: '60px',
    width: 'auto',
  },
  navButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: DESIGN_TOKENS.spacing[2],
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `1px solid ${DESIGN_TOKENS.colors.white}`,
    boxShadow: DESIGN_TOKENS.shadows.small,
    color: DESIGN_TOKENS.colors.white,
    fontFamily: '"Pinyon Script", cursive',
    fontSize: '1.6rem',
    lineHeight: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing[4],
    padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[2]}`,
    textDecoration: 'none',
    // ...TYPOGRAPHY['2xl'], // This will be handled in the component
    // color: linkColor, // This will be handled in the component
    // fontWeight: TYPOGRAPHY.medium, // This will be handled in the component
    borderRadius: DESIGN_TOKENS.borderRadius.medium,
    transition: 'background-color 0.2s ease',
  },
  restaurantCard: {
    container: {
      position: 'relative' as 'relative',
      cursor: 'pointer',
      borderBottom: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
      padding: `${DESIGN_TOKENS.spacing[3]} 0`,
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: DESIGN_TOKENS.spacing[2],
    } as React.CSSProperties,
    title: {
      fontWeight: 500,
      color: DESIGN_TOKENS.colors.text,
      fontSize: '1.1rem',
      lineHeight: 1.3,
      margin: 0,
      wordWrap: 'break-word' as 'break-word',
    } as React.CSSProperties,
    address: {
      color: DESIGN_TOKENS.colors.textSecondary,
      fontSize: '0.875rem',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    } as React.CSSProperties,
    stats: {
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing[3],
      flexShrink: 0,
    } as React.CSSProperties,
    actionMenu: {
      position: 'absolute' as 'absolute',
      top: '100%',
      right: 0,
      marginTop: DESIGN_TOKENS.spacing[1],
      zIndex: DESIGN_TOKENS.zIndex.dropdown,
      width: '180px',
      padding: DESIGN_TOKENS.spacing[2],
      boxShadow: DESIGN_TOKENS.shadows.large,
      backgroundColor: DESIGN_TOKENS.colors.white,
    } as React.CSSProperties,
    menuButton: {
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing[2],
      width: '100%',
      padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: DESIGN_TOKENS.typography.sm.fontSize,
      textAlign: 'left' as 'left',
      transition: 'background-color 0.2s ease',
    } as React.CSSProperties,
  },
  dishCard: {
    collapsed: {
      cursor: 'pointer' as 'pointer',
      transition: 'all 0.3s ease',
    },
    expanded: {
      borderColor: DESIGN_TOKENS.colors.accent,
      boxShadow: DESIGN_TOKENS.shadows.large,
      cursor: 'default' as 'default',
    },
    menuButton: {
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing[2],
      width: '100%',
      padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      textAlign: 'left' as 'left',
      transition: 'background-color 0.2s ease',
    },
  }
};

// 3. Layout Styles
export const LAYOUT_STYLES = {
  container: { /* container styles */ },
  header: { /* header styles */ },
  navigation: {
    list: {
      listStyle: 'none',
      padding: 0,
    },
  },
  navigationModal: {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: DESIGN_TOKENS.zIndex.modal - 1,
    }
  },
  topNavigation: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: DESIGN_TOKENS.colors.navBarDark,
    border: 'none',
    zIndex: DESIGN_TOKENS.zIndex.header,
    padding: `0 ${DESIGN_TOKENS.spacing[4]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
};

// 4. Screen-Specific Styles
export const SCREEN_STYLES = {
  findRestaurant: { /* screen-specific */ },
  menuScreen: { /* screen-specific */ },
  // ... etc
};

// 5. Utility Styles
export const UTILITIES = {
  textDecorationNone: {
    textDecoration: 'none',
  }
};

// --- LEGACY OR UNCATEGORIZED STYLES ---
// These will be migrated or removed in the next steps.

export const RESTAURANT_CARD_MAX_WIDTH = '350px';

export const LAYOUT_CONFIG = {
  APP_CONTAINER: {
    maxWidth: '1280px',
    padding: '1rem',
    paddingTop: '60px',
  },
  SCREEN_MAX_WIDTHS: {
    menu: 'none',
    restaurants: '768px',
    findRestaurant: 'none',
    ratings: 'none',
    profile: '370px',
    discovery: 'none',
    home: '1280px',
    about: '768px',
    admin: '1280px',
  } as Record<string, string>,
  COMPONENT_WIDTHS: {
    dishCard: '100%',
    restaurantCard: '350px',
    searchBar: '100%',
    header: '100%',
  },
  CONTENT_PADDING: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  }
};

export const COLORS = DESIGN_TOKENS.colors;
export const SPACING = {
  ...DESIGN_TOKENS.spacing,
  containerPadding: '1rem', // 16px
  sectionGap: '1.5rem', // 24px
};
export const TYPOGRAPHY = {
  ...DESIGN_TOKENS.typography,
  h1: { fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600', letterSpacing: '-0.025em', fontSize: '1.875rem', lineHeight: '2.25rem' } as React.CSSProperties,
  h2: { fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600', letterSpacing: '-0.025em', fontSize: '1.5rem', lineHeight: '2rem' } as React.CSSProperties,
  h3: { fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600', letterSpacing: '-0.025em', fontSize: '1.25rem', lineHeight: '1.75rem' } as React.CSSProperties,
  body: { fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', lineHeight: '1.5', fontSize: '1rem' } as React.CSSProperties,
  caption: { fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', lineHeight: '1.5', fontSize: '0.875rem' } as React.CSSProperties,
  button: { fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.01em', fontSize: '1rem', fontWeight: '600', lineHeight: '1.5rem' } as React.CSSProperties,
};
export const BORDERS = {
  radius: DESIGN_TOKENS.borderRadius,
};
export const SHADOWS = DESIGN_TOKENS.shadows;
export const BREAKPOINTS = DESIGN_TOKENS.breakpoints;

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
  elegant: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '-0.01em',
  }
};

export const IMAGE_COMPRESSION = {
  MAX_FILE_SIZE_MB: 2.5,
  MAX_ORIGINAL_SIZE_MB: 50,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  INITIAL_QUALITY: 0.9,
  MIN_QUALITY: 0.3,
  QUALITY_STEP: 0.1,
  OUTPUT_FORMAT: 'image/jpeg',
  MIME_TYPE: 'image/jpeg',
  COMPRESSION_TIMEOUT: 15000,
};

export const STYLES = {
  borderRadiusSmall: DESIGN_TOKENS.borderRadius.small,
  borderRadiusMedium: DESIGN_TOKENS.borderRadius.medium,
  borderRadiusLarge: DESIGN_TOKENS.borderRadius.large,
  borderRadiusFull: DESIGN_TOKENS.borderRadius.full,
  shadowSmall: DESIGN_TOKENS.shadows.small,
  shadowMedium: DESIGN_TOKENS.shadows.medium,
  shadowLarge: DESIGN_TOKENS.shadows.large,
  zDefault: DESIGN_TOKENS.zIndex.default,
  zDropdown: DESIGN_TOKENS.zIndex.dropdown,
  zHeader: DESIGN_TOKENS.zIndex.header,
  zModal: DESIGN_TOKENS.zIndex.modal,
  animationFast: DESIGN_TOKENS.transitions.fast,
  animationNormal: DESIGN_TOKENS.transitions.normal,
  animationSlow: DESIGN_TOKENS.transitions.slow,
  primaryButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: '2px solid ' + COLORS.black,
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: TYPOGRAPHY.base.fontSize,
    fontWeight: TYPOGRAPHY.medium,
    fontFamily: FONTS.primary.fontFamily,
    minHeight: '44px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
  card: {
    backgroundColor: DESIGN_TOKENS.colors.white,
    borderRadius: DESIGN_TOKENS.borderRadius.large,
    border: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
    padding: DESIGN_TOKENS.spacing[5],
    transition: `all ${DESIGN_TOKENS.transitions.slow} ease`,
  } as React.CSSProperties,
  cardHover: {
    borderColor: COLORS.primary,
    boxShadow: '0 2px 8px ' + COLORS.shadowLight,
  } as React.CSSProperties,
  modal: {
    background: COLORS.white,
    borderRadius: '12px',
    border: '2px solid ' + COLORS.black,
    padding: SPACING[6],
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  } as React.CSSProperties,
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
  } as React.CSSProperties,
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: COLORS.gray200,
    borderRadius: DESIGN_TOKENS.borderRadius.medium,
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
  } as React.CSSProperties,
  inputFocusBlack: {
    borderColor: COLORS.black,
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
};

export const SIZES = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
  '4xl': '4rem',
};
