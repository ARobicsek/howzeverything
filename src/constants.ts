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

export const FONT_FAMILIES = {
  primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  elegant: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  pinyon: '"Pinyon Script", cursive',
}

// --- LEGACY OR UNCATEGORIZED STYLES ---
// These will be migrated or removed in the next steps.

export const COLORS = DESIGN_TOKENS.colors;
export const SPACING = {
  ...DESIGN_TOKENS.spacing,
  containerPadding: '1rem', // 16px
  sectionGap: '1.5rem', // 24px
};
export const TYPOGRAPHY = {
  ...DESIGN_TOKENS.typography,
  h1: { fontFamily: FONT_FAMILIES.heading, fontWeight: '600', letterSpacing: '-0.025em', fontSize: '1.875rem', lineHeight: '2.25rem' } as React.CSSProperties,
  h2: { fontFamily: FONT_FAMILIES.heading, fontWeight: '600', letterSpacing: '-0.025em', fontSize: '1.5rem', lineHeight: '2rem' } as React.CSSProperties,
  h3: { fontFamily: FONT_FAMILIES.heading, fontWeight: '600', letterSpacing: '-0.025em', fontSize: '1.25rem', lineHeight: '1.75rem' } as React.CSSProperties,
  body: { fontFamily: FONT_FAMILIES.body, lineHeight: '1.5', fontSize: '1rem' } as React.CSSProperties,
  caption: { fontFamily: FONT_FAMILIES.body, lineHeight: '1.5', fontSize: '0.875rem' } as React.CSSProperties,
  button: { fontFamily: FONT_FAMILIES.primary, letterSpacing: '-0.01em', fontSize: '1rem', fontWeight: '600', lineHeight: '1.5rem' } as React.CSSProperties,
};
export const BORDERS = {
  radius: DESIGN_TOKENS.borderRadius,
};
export const SHADOWS = DESIGN_TOKENS.shadows;
export const BREAKPOINTS = DESIGN_TOKENS.breakpoints;


// 2. Component Styles
const baseCardStyle = {
  backgroundColor: DESIGN_TOKENS.colors.white,
  borderRadius: DESIGN_TOKENS.borderRadius.large,
  border: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
  padding: DESIGN_TOKENS.spacing[5],
  transition: `all ${DESIGN_TOKENS.transitions.slow} ease`,
};

const baseButtonPrimaryStyle = {
  backgroundColor: DESIGN_TOKENS.colors.primary,
  color: DESIGN_TOKENS.colors.white,
  border: '2px solid ' + DESIGN_TOKENS.colors.primary,
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: DESIGN_TOKENS.typography.base.fontSize,
  fontWeight: DESIGN_TOKENS.typography.medium,
  fontFamily: FONT_FAMILIES.primary,
  minHeight: '44px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const baseButtonSecondaryStyle = {
  backgroundColor: DESIGN_TOKENS.colors.white,
  color: DESIGN_TOKENS.colors.primary,
  border: '2px solid ' + DESIGN_TOKENS.colors.primary,
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: DESIGN_TOKENS.typography.base.fontSize,
  fontWeight: DESIGN_TOKENS.typography.medium,
  fontFamily: FONT_FAMILIES.primary,
  minHeight: '44px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const COMPONENT_STYLES = {
  card: baseCardStyle,
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
      light: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: DESIGN_TOKENS.colors.black,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        fontSize: '24px',
        fontWeight: 'bold',
      },
      primary: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: DESIGN_TOKENS.colors.white,
        backgroundColor: DESIGN_TOKENS.colors.primary,
        border: 'none',
      },
    },
    primary: baseButtonPrimaryStyle,
    secondary: baseButtonSecondaryStyle,
    profilePrimary: {
      backgroundColor: DESIGN_TOKENS.colors.accent,
      color: DESIGN_TOKENS.colors.white,
      border: '2px solid ' + DESIGN_TOKENS.colors.black, // The fix
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: DESIGN_TOKENS.typography.base.fontSize,
      fontWeight: DESIGN_TOKENS.typography.medium,
      fontFamily: FONT_FAMILIES.primary,
      minHeight: '44px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    profileSecondary: {
        backgroundColor: DESIGN_TOKENS.colors.white,
        color: DESIGN_TOKENS.colors.black, // Changed from primary
        border: '2px solid ' + DESIGN_TOKENS.colors.black, // Changed from primary
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontWeight: DESIGN_TOKENS.typography.medium,
        fontFamily: FONT_FAMILIES.primary,
        minHeight: '44px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
  },
  duplicateDishModal: {
    overlay: {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: DESIGN_TOKENS.spacing[4]
    },
    content: {
      backgroundColor: DESIGN_TOKENS.colors.white,
      borderRadius: DESIGN_TOKENS.borderRadius.large,
      padding: DESIGN_TOKENS.spacing[6],
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto' as 'auto',
      boxShadow: DESIGN_TOKENS.shadows.large
    },
    headerContainer: { marginBottom: DESIGN_TOKENS.spacing[5] },
    title: {
      fontFamily: FONT_FAMILIES.heading,
      fontWeight: '600',
      letterSpacing: '-0.025em',
      fontSize: TYPOGRAPHY.xl.fontSize,
      color: COLORS.gray900,
      marginBottom: SPACING[2]
    },
    description: {
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.textSecondary,
      margin: 0
    },
    listContainer: { marginBottom: DESIGN_TOKENS.spacing[6] },
    dishItem: {
      border: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
      borderRadius: DESIGN_TOKENS.borderRadius.medium,
      padding: DESIGN_TOKENS.spacing[4],
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: DESIGN_TOKENS.colors.gray50,
    },
    dishItemBestMatch: {
      border: `1px solid ${DESIGN_TOKENS.colors.gray300}`,
      backgroundColor: DESIGN_TOKENS.colors.gray50,
    },
    dishItemContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    dishItemDetails: { flex: 1 },
    dishItemTitle: {
      fontFamily: FONT_FAMILIES.heading,
      fontWeight: '600',
      letterSpacing: '-0.025em',
      fontSize: TYPOGRAPHY.base.fontSize,
      color: COLORS.gray900,
      marginBottom: SPACING[1]
    },
    dishItemMetaContainer: { display: 'flex', alignItems: 'center', gap: SPACING[3], marginBottom: SPACING[2] },
    dishItemRatingContainer: { display: 'flex', alignItems: 'center', gap: SPACING[1] },
    dishItemRatingIcon: { color: COLORS.ratingGold, fontSize: TYPOGRAPHY.sm.fontSize },
    dishItemRatingText: {
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.text
    },
    dishItemRatingCount: {
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
      fontSize: TYPOGRAPHY.xs.fontSize,
      color: COLORS.textSecondary
    },
    dishItemSimilarityContainer: { display: 'flex', alignItems: 'center', gap: SPACING[2] },
    dishItemSimilarityText: {
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
      fontSize: TYPOGRAPHY.xs.fontSize,
      color: COLORS.textSecondary
    },
    similarityBadge: {
      backgroundColor: DESIGN_TOKENS.colors.gray200,
      color: DESIGN_TOKENS.colors.gray700,
      padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
      borderRadius: DESIGN_TOKENS.borderRadius.small,
      fontSize: DESIGN_TOKENS.typography.xs.fontSize,
      fontWeight: DESIGN_TOKENS.typography.medium
    },
    similarityBadgeBestMatch: {
      backgroundColor: DESIGN_TOKENS.colors.gray300,
      color: DESIGN_TOKENS.colors.gray700,
    },
    bestMatchBadge: {
      color: COLORS.primary,
      fontSize: TYPOGRAPHY.xs.fontSize,
      fontWeight: TYPOGRAPHY.medium,
      marginLeft: SPACING[2]
    },
    moreDishesText: {
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: COLORS.textSecondary,
      textAlign: 'center' as 'center',
      margin: `${SPACING[2]} 0 0 0`,
      fontStyle: 'italic' as 'italic'
    },
    actionsContainer: { display: 'flex', gap: SPACING[3], flexDirection: 'column' as 'column' },
    useExistingButton: {
      ...baseButtonPrimaryStyle,
      padding: `${SPACING[3]} ${SPACING[4]}`,
      fontSize: TYPOGRAPHY.base.fontSize,
      fontWeight: TYPOGRAPHY.medium
    },
    createNewButton: {
      ...baseButtonSecondaryStyle,
      padding: `${SPACING[3]} ${SPACING[4]}`,
      fontSize: TYPOGRAPHY.base.fontSize
    },
    cancelButton: {
      background: 'none',
      border: 'none',
      color: COLORS.textSecondary,
      fontSize: TYPOGRAPHY.sm.fontSize,
      cursor: 'pointer',
      padding: SPACING[2],
      textDecoration: 'underline'
    },
  },
  locationPermissionModal: {
    overlay: {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 2147483647,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: DESIGN_TOKENS.spacing[4],
    },
    content: {
      background: DESIGN_TOKENS.colors.white,
      borderRadius: '12px',
      border: '2px solid ' + DESIGN_TOKENS.colors.black,
      padding: DESIGN_TOKENS.spacing[6],
      maxWidth: '450px',
      maxHeight: '90vh',
      overflow: 'auto',
    },
    title: {
      ...TYPOGRAPHY.h3,
      marginTop: 0,
      color: DESIGN_TOKENS.colors.textPrimary
    },
    message: {
      ...TYPOGRAPHY.body,
      whiteSpace: 'pre-wrap' as 'pre-wrap',
      color: DESIGN_TOKENS.colors.textSecondary,
      marginTop: DESIGN_TOKENS.spacing[4]
    },
    actionsContainer: {
      marginTop: DESIGN_TOKENS.spacing[6],
      display: 'flex',
      justifyContent: 'flex-end'
    },
    okButton: {
      ...baseButtonPrimaryStyle,
      minWidth: '120px',
      backgroundColor: DESIGN_TOKENS.colors.accent,
      color: DESIGN_TOKENS.colors.white,
      border: `1px solid ${DESIGN_TOKENS.colors.text}`,
    }
  },
  input: {
    backgroundColor: DESIGN_TOKENS.colors.inputBg,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: DESIGN_TOKENS.colors.gray200,
    borderRadius: DESIGN_TOKENS.borderRadius.medium,
    padding: '12px 16px',
    fontSize: DESIGN_TOKENS.typography.base.fontSize,
    fontFamily: FONT_FAMILIES.primary,
    color: DESIGN_TOKENS.colors.text,
    width: '100%',
    outline: 'none',
    transition: `all ${DESIGN_TOKENS.transitions.normal} ease`,
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  },
  modal: {
    sidePanel: {
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
    centered: {
      overlay: {
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: DESIGN_TOKENS.colors.overlay,
        zIndex: DESIGN_TOKENS.zIndex.modal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: DESIGN_TOKENS.spacing[4],
      },
      content: {
        background: DESIGN_TOKENS.colors.white,
        borderRadius: DESIGN_TOKENS.borderRadius.large,
        padding: DESIGN_TOKENS.spacing[6],
        maxWidth: '500px',
        width: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: DESIGN_TOKENS.shadows.large,
        animation: 'slideIn 0.3s ease',
      }
    },
    lightbox: {
      overlay: {
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease',
        zIndex: DESIGN_TOKENS.zIndex.modal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      content: {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: 'auto',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: DESIGN_TOKENS.colors.black,
        borderRadius: DESIGN_TOKENS.borderRadius.large,
        overflow: 'hidden',
        animation: 'slideIn 0.3s ease',
      },
      header: {
        position: 'absolute',
        top: DESIGN_TOKENS.spacing[4],
        left: DESIGN_TOKENS.spacing[4],
        right: DESIGN_TOKENS.spacing[4],
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      headerControls: {
        display: 'flex',
        gap: DESIGN_TOKENS.spacing[3],
        alignItems: 'center'
      },
      photoCounter: {
        padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
        borderRadius: DESIGN_TOKENS.borderRadius.medium,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        fontFamily: FONT_FAMILIES.body,
        fontSize: DESIGN_TOKENS.typography.sm.fontSize,
        fontWeight: DESIGN_TOKENS.typography.medium,
        color: DESIGN_TOKENS.colors.black
      },
      navButtonLeft: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: DESIGN_TOKENS.colors.black,
        transition: 'all 0.2s ease',
        left: DESIGN_TOKENS.spacing[4],
      },
      navButtonRight: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: DESIGN_TOKENS.colors.black,
        transition: 'all 0.2s ease',
        right: DESIGN_TOKENS.spacing[4],
      },
      imageContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: `80px ${DESIGN_TOKENS.spacing[8]} ${DESIGN_TOKENS.spacing[6]}`
      },
      image: {
        maxWidth: '100%',
        maxHeight: '70vh',
        objectFit: 'contain',
        borderRadius: DESIGN_TOKENS.borderRadius.medium
      },
      footer: {
        padding: DESIGN_TOKENS.spacing[5],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTop: `1px solid ${DESIGN_TOKENS.colors.gray700}`
      },
      caption: {
        fontFamily: FONT_FAMILIES.body,
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        color: DESIGN_TOKENS.colors.white,
        margin: 0,
      },
      meta: {
        fontFamily: FONT_FAMILIES.body,
        fontSize: DESIGN_TOKENS.typography.sm.fontSize,
        color: DESIGN_TOKENS.colors.gray400
      },
      captionInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: DESIGN_TOKENS.colors.gray200,
        borderRadius: DESIGN_TOKENS.borderRadius.medium,
        padding: '12px 16px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontFamily: FONT_FAMILIES.primary,
        color: DESIGN_TOKENS.colors.white,
        width: '100%',
        outline: 'none',
        transition: `all ${DESIGN_TOKENS.transitions.normal} ease`,
        boxSizing: 'border-box',
        WebkitAppearance: 'none',
      },
      captionActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        marginTop: '0.5rem'
      }
    }
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
    fontFamily: FONT_FAMILIES.pinyon,
    fontSize: '1.6rem',
    lineHeight: 1,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing[4],
    padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[2]}`,
    textDecoration: 'none',
    borderRadius: DESIGN_TOKENS.borderRadius.medium,
    transition: 'background-color 0.2s ease',
    ...TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.medium,
  },
  restaurantCard: {
    container: {
      position: 'relative' as 'relative',
      cursor: 'pointer',
      borderBottom: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
      padding: `${DESIGN_TOKENS.spacing[3]} 0`,
      transition: 'background-color 0.2s ease',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: DESIGN_TOKENS.spacing[2],
    },
    titleContainer: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontWeight: 500,
      color: DESIGN_TOKENS.colors.text,
      fontSize: '1.1rem',
      lineHeight: 1.3,
      margin: 0,
      wordWrap: 'break-word' as 'break-word',
      fontFamily: FONT_FAMILIES.elegant,
      letterSpacing: '-0.01em',
    },
    controlsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing[2],
      flexShrink: 0,
    },
    distanceText: {
      fontFamily: FONT_FAMILIES.elegant,
      letterSpacing: '-0.01em',
      color: DESIGN_TOKENS.colors.accent,
      fontWeight: TYPOGRAPHY.semibold,
      fontSize: TYPOGRAPHY.sm.fontSize,
    },
    adminBadge: {
      base: {
        fontFamily: FONT_FAMILIES.body,
        lineHeight: '1.5',
        fontSize: '0.65rem',
        fontWeight: '600',
        padding: '2px 4px',
        borderRadius: '4px',
      },
      api: {
        color: DESIGN_TOKENS.colors.gray500,
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        border: `1px solid rgba(107, 114, 128, 0.2)`,
      },
      db: {
        color: DESIGN_TOKENS.colors.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: `1px solid rgba(99, 102, 241, 0.3)`,
      }
    },
    cardIconButton: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      color: DESIGN_TOKENS.colors.gray700,
      backgroundColor: 'transparent',
      border: 'none',
      margin: '-6px',
    },
    actionMenuContainer: {
      position: 'relative' as 'relative',
    },
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
      fontSize: DESIGN_TOKENS.typography.sm.fontSize,
      textAlign: 'left' as 'left',
      transition: 'background-color 0.2s ease',
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
    },
    bottomRowContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: DESIGN_TOKENS.spacing[2],
      marginTop: DESIGN_TOKENS.spacing[1],
    },
    addressContainer: {
      flex: 1,
      minWidth: 0,
    },
    address: {
      color: DESIGN_TOKENS.colors.textSecondary,
      fontSize: '0.875rem',
      margin: 0,
      whiteSpace: 'nowrap' as 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
    },
    stats: {
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing[3],
      flexShrink: 0,
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: DESIGN_TOKENS.spacing[1],
    },
    statIcon: {
      color: DESIGN_TOKENS.colors.accent,
    },
    statText: {
      fontFamily: FONT_FAMILIES.elegant,
      letterSpacing: '-0.01em',
      color: DESIGN_TOKENS.colors.textSecondary,
      fontWeight: TYPOGRAPHY.semibold,
      fontSize: TYPOGRAPHY.sm.fontSize,
    },
  },
  dishCard: {
    star: {
      container: { display: 'inline-block', position: 'relative', lineHeight: '1' },
      svgBase: { position: 'absolute', left: 0, top: 0 },
      filledContainer: { position: 'absolute', left: 0, top: 0, height: '100%', overflow: 'hidden' }
    },
    starRating: {
      button: {
        background: 'none',
        border: 'none',
        padding: '0',
        lineHeight: '1',
      },
      clearButton: {
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: DESIGN_TOKENS.colors.textSecondary,
        transition: 'color 0.2s ease, transform 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        marginLeft: SPACING[1],
      }
    },
    ratingSummary: {
      container: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: DESIGN_TOKENS.spacing[1] },
      row: { display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2] },
      label: { fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.sm.fontSize, color: DESIGN_TOKENS.colors.textSecondary, fontWeight: DESIGN_TOKENS.typography.medium },
      value: { color: DESIGN_TOKENS.colors.text, fontWeight: DESIGN_TOKENS.typography.medium, fontSize: DESIGN_TOKENS.typography.sm.fontSize },
      ratingLine: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[1],
      },
    },
    ratingBreakdown: {
      container: { backgroundColor: DESIGN_TOKENS.colors.gray50, padding: DESIGN_TOKENS.spacing[4], borderRadius: DESIGN_TOKENS.borderRadius.medium, marginTop: DESIGN_TOKENS.spacing[4] },
      flexContainer: { display: 'flex', gap: DESIGN_TOKENS.spacing[8], alignItems: 'flex-start' },
      column: { flex: 1, minWidth: 0 },
      titleContainer: { marginBottom: DESIGN_TOKENS.spacing[2] },
      title: { fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.sm.fontSize, color: DESIGN_TOKENS.colors.textSecondary, fontWeight: DESIGN_TOKENS.typography.medium },
      ratingContainer: { display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2] },
      totalSummary: { marginTop: DESIGN_TOKENS.spacing[1] },
      totalText: { fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.xs.fontSize, color: DESIGN_TOKENS.colors.textSecondary }
    },
    commentsSection: {
      container: { marginTop: DESIGN_TOKENS.spacing[6] },
      toggleButton: { background: 'none', border: 'none', padding: `${DESIGN_TOKENS.spacing[3]} 0`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2], fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.base.fontSize, color: DESIGN_TOKENS.colors.text, fontWeight: DESIGN_TOKENS.typography.medium, width: '100%', textAlign: 'left' },
      toggleIcon: { transition: 'transform 0.2s ease', color: DESIGN_TOKENS.colors.gray400 },
      listContainer: { marginTop: DESIGN_TOKENS.spacing[3], display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing[3] },
      commentContainer: { backgroundColor: DESIGN_TOKENS.colors.gray50, padding: DESIGN_TOKENS.spacing[4], borderRadius: DESIGN_TOKENS.borderRadius.medium },
      commentBody: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
      commentTextContainer: { flex: 1, minWidth: 0, marginRight: DESIGN_TOKENS.spacing[2] },
      commentText: { fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.sm.fontSize, color: DESIGN_TOKENS.colors.text, margin: 0, wordBreak: 'break-word' as 'break-word' },
      commentMeta: { fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.xs.fontSize, color: DESIGN_TOKENS.colors.textSecondary, margin: 0, marginTop: DESIGN_TOKENS.spacing[1] },
      commentAuthor: { fontWeight: DESIGN_TOKENS.typography.medium },
      actionMenuContainer: { position: 'relative' },
      actionMenu: { position: 'absolute', bottom: '100%', right: 0, marginBottom: DESIGN_TOKENS.spacing[1], backgroundColor: DESIGN_TOKENS.colors.white, borderRadius: DESIGN_TOKENS.borderRadius.medium, boxShadow: DESIGN_TOKENS.shadows.large, border: `1px solid ${DESIGN_TOKENS.colors.gray200}`, overflow: 'hidden', zIndex: DESIGN_TOKENS.zIndex.dropdown, minWidth: '120px' },
      actionButton: { display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2], width: '100%', padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.sm.fontSize, textAlign: 'left', transition: 'background-color 0.2s ease', color: DESIGN_TOKENS.colors.text },
      editFormContainer: { width: '100%' },
      actionIconButton: {
        width: '32px',
        height: '32px',
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
    collapsed: {
      cursor: 'pointer' as 'pointer',
      transition: 'all 0.3s ease',
      container: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      textContainer: { flex: 1, minWidth: 0 },
      title: { fontFamily: FONT_FAMILIES.heading, fontSize: DESIGN_TOKENS.typography.lg.fontSize, color: DESIGN_TOKENS.colors.gray900, margin: 0, marginBottom: DESIGN_TOKENS.spacing[2] },
      imageContainer: { width: '60px', height: '60px', borderRadius: DESIGN_TOKENS.borderRadius.medium, overflow: 'hidden', flexShrink: 0 },
      image: { width: '100%', height: '100%', objectFit: 'cover' },
      arrow: { color: DESIGN_TOKENS.colors.gray400 },
      rightContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[3],
      },
    },
    expanded: {
      borderColor: DESIGN_TOKENS.colors.accent,
      boxShadow: DESIGN_TOKENS.shadows.large,
      cursor: 'default' as 'default',
      headerContainer: { marginBottom: DESIGN_TOKENS.spacing[4] },
      header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: DESIGN_TOKENS.spacing[2] },
      headerTextContainer: { flex: 1, minWidth: 0, paddingRight: DESIGN_TOKENS.spacing[4] },
      title: { fontFamily: FONT_FAMILIES.heading, fontSize: DESIGN_TOKENS.typography.lg.fontSize, color: DESIGN_TOKENS.colors.gray900, margin: 0, wordBreak: 'break-word' as 'break-word' },
      date: { fontFamily: FONT_FAMILIES.body, fontSize: DESIGN_TOKENS.typography.xs.fontSize, color: DESIGN_TOKENS.colors.textSecondary, margin: 0, marginTop: DESIGN_TOKENS.spacing[1] },
      editContainer: { display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing[3], width: '100%' },
      editInput: {
        backgroundColor: DESIGN_TOKENS.colors.inputBg,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: DESIGN_TOKENS.colors.gray200,
        borderRadius: DESIGN_TOKENS.borderRadius.medium,
        padding: '12px 16px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontFamily: FONT_FAMILIES.primary,
        color: DESIGN_TOKENS.colors.text,
        width: '100%',
        outline: 'none',
        transition: `all ${DESIGN_TOKENS.transitions.normal} ease`,
        boxSizing: 'border-box',
        WebkitAppearance: 'none',
       },
      editButtons: { display: 'flex', justifyContent: 'flex-end', gap: DESIGN_TOKENS.spacing[2] },
      actionMenuContainer: { position: 'relative', flexShrink: 0 },
      actionMenu: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, backgroundColor: DESIGN_TOKENS.colors.white, borderRadius: DESIGN_TOKENS.borderRadius.medium, boxShadow: DESIGN_TOKENS.shadows.large, border: `1px solid ${DESIGN_TOKENS.colors.gray200}`, overflow: 'hidden', zIndex: DESIGN_TOKENS.zIndex.dropdown, minWidth: '160px' },
      hr: { border: 0, borderTop: `1px solid ${DESIGN_TOKENS.colors.gray200}`, margin: `${DESIGN_TOKENS.spacing[1]} 0` },
      photosContainer: { marginTop: DESIGN_TOKENS.spacing[3] },
      hiddenInput: { display: 'none' }
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
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
      fontSize: TYPOGRAPHY.sm.fontSize,
      color: DESIGN_TOKENS.colors.text,
    },
    addCommentModal: {
      title: { fontFamily: FONT_FAMILIES.heading, fontSize: DESIGN_TOKENS.typography.xl.fontSize, color: DESIGN_TOKENS.colors.gray900, marginBottom: DESIGN_TOKENS.spacing[4] }
    }
  },
  addressInput: {
    label: { ...DESIGN_TOKENS.typography.caption, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing[1], display: 'block' },
    container: { marginBottom: DESIGN_TOKENS.spacing[2], position: 'relative' },
    fullAddressLabel: { fontFamily: FONT_FAMILIES.body, display: 'block', fontWeight: DESIGN_TOKENS.typography.medium, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing[2] },
    textarea: {
        backgroundColor: DESIGN_TOKENS.colors.inputBg,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: DESIGN_TOKENS.colors.gray200,
        borderRadius: DESIGN_TOKENS.borderRadius.medium,
        padding: '12px 16px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontFamily: FONT_FAMILIES.primary,
        color: DESIGN_TOKENS.colors.text,
        width: '100%',
        outline: 'none',
        transition: `all ${DESIGN_TOKENS.transitions.normal} ease`,
        boxSizing: 'border-box',
        WebkitAppearance: 'none',
        minHeight: '80px',
        resize: 'vertical'
    },
    suggestionsContainer: {
      position: 'absolute', top: '100%', left: 0, right: 0,
      background: DESIGN_TOKENS.colors.white,
      border: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
      borderRadius: DESIGN_TOKENS.borderRadius.medium,
      boxShadow: DESIGN_TOKENS.shadows.medium,
      zIndex: DESIGN_TOKENS.zIndex.dropdown,
      maxHeight: '200px',
      overflowY: 'auto'
    },
    suggestionItem: {
      padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
      cursor: 'pointer',
      fontFamily: FONT_FAMILIES.body
    },
    suggestionLoading: { padding: DESIGN_TOKENS.spacing[2], color: DESIGN_TOKENS.colors.textSecondary, fontFamily: FONT_FAMILIES.body },
    messageContainer: { minHeight: '20px', paddingTop: DESIGN_TOKENS.spacing[1] },
    parsingMessage: { ...DESIGN_TOKENS.typography.caption, color: DESIGN_TOKENS.colors.primary },
    parsedFieldsContainer: { borderTop: `1px solid ${DESIGN_TOKENS.colors.border}`, paddingTop: DESIGN_TOKENS.spacing[3], marginTop: DESIGN_TOKENS.spacing[2] },
    parsedFieldsDescription: { ...DESIGN_TOKENS.typography.caption, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 0, marginBottom: DESIGN_TOKENS.spacing[3] },
    fieldGroup: { marginBottom: DESIGN_TOKENS.spacing[3] },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: DESIGN_TOKENS.spacing[3] },
    gridWithTopMargin: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: DESIGN_TOKENS.spacing[3], marginTop: DESIGN_TOKENS.spacing[3] }
  },
  forms: {
    addRestaurant: {
      error: {
        color: DESIGN_TOKENS.colors.danger,
        textAlign: 'center' as 'center',
      },
      label: {
        ...DESIGN_TOKENS.typography.caption,
        color: DESIGN_TOKENS.colors.textSecondary,
        marginBottom: DESIGN_TOKENS.spacing[1],
        display: 'block' as 'block',
      },
      buttonContainer: {
        display: 'flex' as 'flex',
        gap: DESIGN_TOKENS.spacing[3],
        marginTop: DESIGN_TOKENS.spacing[4],
      },
      cancelButton: {
        backgroundColor: DESIGN_TOKENS.colors.white,
        color: DESIGN_TOKENS.colors.text,
        border: `2px solid ${DESIGN_TOKENS.colors.gray300}`,
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontWeight: DESIGN_TOKENS.typography.medium,
        fontFamily: FONT_FAMILIES.primary,
        minHeight: '44px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      },
      saveButton: {
        backgroundColor: DESIGN_TOKENS.colors.primary,
        color: DESIGN_TOKENS.colors.white,
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontWeight: DESIGN_TOKENS.typography.medium,
        fontFamily: FONT_FAMILIES.primary,
        minHeight: '44px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flex: 1,
      }
    },
    addDish: {
      starRatingButton: {
        background: 'none',
        border: 'none',
        padding: '0 1px',
        fontSize: '1.3rem',
        lineHeight: '1',
      },
      toggleButton: {
        backgroundColor: DESIGN_TOKENS.colors.primary,
        color: DESIGN_TOKENS.colors.textWhite,
        border: 'none',
        borderRadius: '12px',
        padding: '12px 20px',
        fontFamily: FONT_FAMILIES.elegant,
        fontWeight: '500',
        fontSize: '1rem',
        width: '100%',
      },
      input: {
        background: 'white',
        fontSize: '1rem',
        fontFamily: FONT_FAMILIES.elegant,
        color: DESIGN_TOKENS.colors.text,
        maxWidth: 'calc(100% - 16px)',
        boxSizing: 'border-box',
      },
      ratingLabel: {
        fontFamily: FONT_FAMILIES.elegant,
        color: DESIGN_TOKENS.colors.text,
      },
      submitButton: {
        color: DESIGN_TOKENS.colors.textWhite,
        border: 'none',
        fontFamily: FONT_FAMILIES.elegant,
        fontWeight: '500',
        fontSize: '1rem',
      },
      cancelButton: {
        color: DESIGN_TOKENS.colors.primary,
        backgroundColor: DESIGN_TOKENS.colors.white,
        border: '2px solid ' + DESIGN_TOKENS.colors.primary,
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontWeight: DESIGN_TOKENS.typography.medium,
        fontFamily: FONT_FAMILIES.primary,
        minHeight: '44px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    },
    commentForm: {
      form: {
        width: '100%',
      },
      textarea: {
        backgroundColor: DESIGN_TOKENS.colors.inputBg,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: DESIGN_TOKENS.colors.gray200,
        borderRadius: DESIGN_TOKENS.borderRadius.medium,
        padding: '12px 16px',
        fontSize: DESIGN_TOKENS.typography.base.fontSize,
        fontFamily: FONT_FAMILIES.primary,
        color: DESIGN_TOKENS.colors.text,
        width: '100%',
        outline: 'none',
        transition: `all ${DESIGN_TOKENS.transitions.normal} ease`,
        boxSizing: 'border-box',
        WebkitAppearance: 'none',
        minHeight: '100px',
        resize: 'vertical',
        marginBottom: DESIGN_TOKENS.spacing[4],
      },
      buttonContainer: {
        display: 'flex',
        gap: DESIGN_TOKENS.spacing[3],
        justifyContent: 'flex-end',
      }
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
      container: {
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
        fontFamily: FONT_FAMILIES.elegant,
        fontSize: '24px',
        fontWeight: '600',
        color: DESIGN_TOKENS.colors.text,
        margin: '0 0 8px 0',
      },
      headerSubtitle: {
        fontFamily: FONT_FAMILIES.elegant,
        fontSize: '14px',
        color: DESIGN_TOKENS.colors.text,
        margin: 0,
      },
      errorContainer: {
        backgroundColor: DESIGN_TOKENS.colors.red50,
        border: `1px solid ${DESIGN_TOKENS.colors.red200}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
      },
      errorText: {
        fontFamily: FONT_FAMILIES.elegant,
        fontSize: '14px',
        color: DESIGN_TOKENS.colors.danger,
        margin: 0,
      },
      fieldContainer: {
        marginBottom: '16px',
      },
      label: {
        fontFamily: FONT_FAMILIES.elegant,
        fontSize: '14px',
        fontWeight: '500',
        color: DESIGN_TOKENS.colors.text,
        display: 'block',
        marginBottom: '6px',
      },
      input: {
        fontFamily: FONT_FAMILIES.elegant,
        width: '100%',
        padding: '12px',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        fontSize: '16px',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        WebkitAppearance: 'none',
      },
      helpText: {
        fontFamily: FONT_FAMILIES.elegant,
        fontSize: '12px',
        color: DESIGN_TOKENS.colors.text,
        margin: '4px 0 0 0',
      },
      buttonContainer: {
        display: 'flex',
        gap: '12px',
        flexDirection: 'column',
      },
      submitButton: {
        fontFamily: FONT_FAMILIES.elegant,
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
        fontFamily: FONT_FAMILIES.elegant,
        height: '44px',
        backgroundColor: 'transparent',
        color: DESIGN_TOKENS.colors.text,
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        fontSize: '14px',
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent',
      },
    }
  },
  searchResultsModal: {
    overlay: {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: DESIGN_TOKENS.colors.overlay,
      zIndex: DESIGN_TOKENS.zIndex.modal,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: DESIGN_TOKENS.spacing[4],
    },
    container: {
      background: DESIGN_TOKENS.colors.white,
      borderRadius: '12px',
      border: `2px solid ${DESIGN_TOKENS.colors.black}`,
      padding: 0,
      maxWidth: '600px',
      width: '95vw',
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column' as 'column',
      overflow: 'hidden', // Changed from auto to hidden to manage scrolling internally
    },
    header: {
      padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[3]}`,
      borderBottom: `1px solid ${DESIGN_TOKENS.colors.gray200}`,
      position: 'sticky' as 'sticky',
      top: 0,
      backgroundColor: DESIGN_TOKENS.colors.white,
      zIndex: 10,
    },
    headerLabel: {
      fontFamily: FONT_FAMILIES.elegant,
      fontSize: '1.1rem',
      fontWeight: '600',
      color: DESIGN_TOKENS.colors.text,
    },
    resetButton: {
      background: 'transparent',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      color: DESIGN_TOKENS.colors.textSecondary,
    },
    closeButton: {
      width: '32px',
      height: '32px',
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
    input: {
      backgroundColor: DESIGN_TOKENS.colors.inputBg,
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: DESIGN_TOKENS.colors.gray200,
      borderRadius: DESIGN_TOKENS.borderRadius.medium,
      padding: '12px 16px',
      fontSize: DESIGN_TOKENS.typography.base.fontSize,
      fontFamily: FONT_FAMILIES.primary,
      color: DESIGN_TOKENS.colors.text,
      width: '100%',
      outline: 'none',
      transition: `all ${DESIGN_TOKENS.transitions.normal} ease`,
      boxSizing: 'border-box',
      WebkitAppearance: 'none',
    },
    resultsContainer: {
      flex: 1,
      overflowY: 'auto' as 'auto',
      padding: DESIGN_TOKENS.spacing[4],
      backgroundColor: DESIGN_TOKENS.colors.background,
    },
    messageText: {
      fontFamily: FONT_FAMILIES.body,
      color: DESIGN_TOKENS.colors.textSecondary,
      textAlign: 'center' as 'center',
      padding: DESIGN_TOKENS.spacing[6],
    },
    manualAddContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)', // Using rgba for transparency
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      borderRadius: DESIGN_TOKENS.borderRadius.large,
      padding: DESIGN_TOKENS.spacing[4],
      textAlign: 'center' as 'center',
      marginTop: DESIGN_TOKENS.spacing[4],
    },
    manualAddText: {
      fontFamily: FONT_FAMILIES.elegant,
      fontSize: '0.95rem',
      color: DESIGN_TOKENS.colors.text,
      marginBottom: '12px',
    },
    manualAddButton: {
      backgroundColor: DESIGN_TOKENS.colors.primary,
      color: DESIGN_TOKENS.colors.white,
      border: '2px solid ' + DESIGN_TOKENS.colors.black,
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: FONT_FAMILIES.primary,
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
    modalList: {
      listStyle: 'none',
      padding: 0,
      margin: `calc(60px + ${DESIGN_TOKENS.spacing[4]}) 0 0 0`,
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
    container: {
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
    },
    leftContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'flex-start' as 'flex-start',
    },
    centerContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center' as 'center',
    },
    rightContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'end' as 'end',
      alignItems: 'center' as 'center',
      gap: DESIGN_TOKENS.spacing[4],
    },
  }
};

// 4. Screen-Specific Styles
export const SCREEN_STYLES = {
  findRestaurant: { /* screen-specific */ },
  menuScreen: { /* screen-specific */ },
  home: {
    container: {
      backgroundColor: DESIGN_TOKENS.colors.navBarDark,
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      minHeight: '100vh',
      boxSizing: 'border-box',
      paddingBottom: DESIGN_TOKENS.spacing[8],
    },
    headerContainer: {
      maxWidth: '700px',
      margin: '0 auto',
      padding: `calc(60px + ${DESIGN_TOKENS.spacing[4]}) ${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[6]}`,
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center',
      textAlign: 'center' as 'center',
    },
    headerText: {
      fontFamily: FONT_FAMILIES.body,
      lineHeight: '1.5',
      ...TYPOGRAPHY.lg,
      color: DESIGN_TOKENS.colors.textWhite,
      lineHeight: 1.6,
      margin: 0,
    },
    mainContent: {
      maxWidth: '600px',
      margin: '0 auto',
      paddingLeft: DESIGN_TOKENS.spacing[4],
      paddingRight: DESIGN_TOKENS.spacing[4],
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: DESIGN_TOKENS.spacing[6],
    },
    infoCard: {
      link: { textDecoration: 'none', display: 'block' },
      card: {
        ...baseCardStyle,
        padding: 0,
        overflow: 'hidden',
        textAlign: 'center' as 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      },
      image: { width: '100%', height: 'auto', display: 'block' },
      content: { padding: DESIGN_TOKENS.spacing[4] },
      title: {
        fontFamily: FONT_FAMILIES.heading,
        fontWeight: '600',
        letterSpacing: '-0.025em',
        ...TYPOGRAPHY.h3,
        color: DESIGN_TOKENS.colors.text,
        margin: 0,
      },
    }
  }
};

// 5. Utility Styles
export const UTILITIES = {
  textDecorationNone: {
    textDecoration: 'none',
  }
};

export const STYLE_FUNCTIONS = {
  getDeleteButtonStyle: (isDeleting: boolean): React.CSSProperties => ({
    ...COMPONENT_STYLES.button.icon.primary,
    opacity: isDeleting ? 0.5 : 1,
    cursor: isDeleting ? 'not-allowed' : 'pointer',
  }),
  getCaptionStyle: (hasPhotographerName: boolean): React.CSSProperties => ({
    ...COMPONENT_STYLES.modal.lightbox.caption,
    marginBottom: hasPhotographerName ? DESIGN_TOKENS.spacing[2] : 0,
  }),
  getDishItemStyle: (isBestMatch: boolean): React.CSSProperties => {
    const baseStyle = COMPONENT_STYLES.duplicateDishModal.dishItem;
    if (isBestMatch) {
      return { ...baseStyle, ...COMPONENT_STYLES.duplicateDishModal.dishItemBestMatch };
    }
    return baseStyle;
  },
  getSimilarityBadgeStyle: (isBestMatch: boolean): React.CSSProperties => {
    const baseStyle = COMPONENT_STYLES.duplicateDishModal.similarityBadge;
    if (isBestMatch) {
      return { ...baseStyle, ...COMPONENT_STYLES.duplicateDishModal.similarityBadgeBestMatch };
    }
    return baseStyle;
  },
  getHomeScreenInfoCardStyle: (isHovering: boolean): React.CSSProperties => {
    const baseStyle = SCREEN_STYLES.home.infoCard.card;
    if (isHovering) {
      return {
        ...baseStyle,
        transform: 'scale(1.03)',
        boxShadow: STYLES.shadowLarge,
      };
    }
    return {
      ...baseStyle,
      transform: 'scale(1)',
      boxShadow: STYLES.shadowMedium,
    };
  },
};

export const STYLES = {
  // Backward compatibility
  input: COMPONENT_STYLES.input,
  primaryButton: COMPONENT_STYLES.button.primary,
  secondaryButton: COMPONENT_STYLES.button.secondary,

  // Old styles
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
    fontFamily: FONT_FAMILIES.primary,
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
    fontFamily: FONT_FAMILIES.primary,
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
    fontFamily: FONT_FAMILIES.primary,
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
    fontFamily: FONT_FAMILIES.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  } as React.CSSProperties,
};

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
