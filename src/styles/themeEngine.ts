// src/styles/themeEngine.ts
import React from 'react';
import { ColorPalette } from './themes';

// Designer-friendly theme specification interface
export interface ThemeSpec {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;    // Main action color
    surface: string;    // Background color  
    text: string;       // Primary text
    accent: string;     // Secondary highlight
  };
  typography: {
    primaryFont: string;
    headingFont: string;
    fontScaleRatio: number;
  };
  geometry: {
    baseSpacingUnit: number;
    baseBorderRadius: number;
    shadowPreset: 'soft' | 'sharp' | 'glow';
  };
}

// Complete theme interface (generated from spec)
export interface GeneratedTheme {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  fonts: {
    primary: React.CSSProperties;
    heading: React.CSSProperties;
    body: React.CSSProperties;
    elegant: React.CSSProperties;
  };
  typography: {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    body: React.CSSProperties;
    caption: React.CSSProperties;
    button: React.CSSProperties;
  };
  spacing: Record<string | number, string>;
  borders: {
    radius: {
      small: string;
      medium: string;
      large: string;
      full: string;
    };
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
  images: {
    logo: string;
    homeFindRestaurants: string;
    homeDiscoverDishes: string;
    findRestaurantHero: string;
    aboutHero: string;
    discoveryHero: string;
    ratingsHero: string;
    restaurantDefault: string;
  };
  effects: {
    primaryButtonHover: React.CSSProperties;
    cardHover: React.CSSProperties;
    glowEffect: React.CSSProperties;
  };
}

// Color utilities for generating palettes
class ColorUtils {
  static hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  static hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static lighten(color: string, amount: number): string {
    const [h, s, l] = this.hexToHsl(color);
    return this.hslToHex(h, s, Math.min(100, l + amount));
  }

  static darken(color: string, amount: number): string {
    const [h, s, l] = this.hexToHsl(color);
    return this.hslToHex(h, s, Math.max(0, l - amount));
  }

  static adjustSaturation(color: string, amount: number): string {
    const [h, s, l] = this.hexToHsl(color);
    return this.hslToHex(h, Math.max(0, Math.min(100, s + amount)), l);
  }

  static mix(color1: string, color2: string, ratio: number = 0.5): string {
    const [h1, s1, l1] = this.hexToHsl(color1);
    const [h2, s2, l2] = this.hexToHsl(color2);
    
    const h = h1 + (h2 - h1) * ratio;
    const s = s1 + (s2 - s1) * ratio;
    const l = l1 + (l2 - l1) * ratio;
    
    return this.hslToHex(h, s, l);
  }
}

// Main theme generation engine
export function createTheme(spec: ThemeSpec): GeneratedTheme {
  // Generate complete color palette from 4 core colors
  const colors = generateColorPalette(spec.colors, spec.typography);
  
  // Generate typography system
  const fonts = generateFonts(spec.typography);
  const typography = generateTypography(spec.typography);
  
  // Generate spacing system
  const spacing = generateSpacing(spec.geometry.baseSpacingUnit);
  
  // Generate borders
  const borders = generateBorders(spec.geometry.baseBorderRadius);
  
  // Generate shadows
  const shadows = generateShadows(spec.geometry.shadowPreset, colors);
  
  // Generate animations
  const animations = generateAnimations();
  
  // Generate image paths
  const images = generateImagePaths(spec.id);
  
  // Generate effects
  const effects = generateEffects(spec.geometry.shadowPreset, colors);

  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    colors,
    fonts,
    typography,
    spacing,
    borders,
    shadows,
    animations,
    images,
    effects,
  };
}

function generateColorPalette(coreColors: ThemeSpec['colors'], typography: ThemeSpec['typography']): ColorPalette {
  const { primary, surface, text, accent } = coreColors;
  
  // Generate primary variants
  const primaryHover = ColorUtils.darken(primary, 10);
  const primaryLight = ColorUtils.lighten(primary, 30);
  
  // Generate neutral grays based on text and surface colors
  const textOnSurface = ColorUtils.mix(text, surface, 0.1); // Slight surface tint
  const gray50 = ColorUtils.lighten(surface, 2);
  const gray100 = ColorUtils.lighten(surface, 5);
  const gray200 = ColorUtils.mix(surface, text, 0.08);
  const gray300 = ColorUtils.mix(surface, text, 0.15);
  const gray400 = ColorUtils.mix(surface, text, 0.25);
  const gray500 = ColorUtils.mix(surface, text, 0.35);
  const gray600 = ColorUtils.mix(surface, text, 0.45);
  const gray700 = ColorUtils.mix(surface, text, 0.65);
  const gray900 = text;

  // Generate semantic colors based on primary
  const [h] = ColorUtils.hexToHsl(primary);
  const success = ColorUtils.hslToHex((h + 120) % 360, 70, 45); // Green-ish
  const danger = ColorUtils.hslToHex((h + 180) % 360, 70, 50); // Red-ish  
  const warning = ColorUtils.hslToHex((h + 60) % 360, 80, 55); // Yellow-ish

  // Determine if this is a dark theme
  const isDarkTheme = ColorUtils.hexToHsl(surface)[2] < 50;
  
  // Generate appropriate whites/blacks
  const white = isDarkTheme ? '#FFFFFF' : '#FFFFFF';
  const black = isDarkTheme ? '#000000' : '#000000';
  
  // Generate text colors
  const textWhite = white;
  const textSecondary = ColorUtils.mix(text, surface, 0.3);

  return {
    // Primary Colors
    primary,
    primaryHover,
    primaryLight,
    accent,
    
    // Neutral Grays
    gray50,
    gray100,
    gray200,
    gray300,
    gray400,
    gray500,
    gray600,
    gray700,
    gray900,
    
    // Blue variants (based on primary)
    blue50: ColorUtils.lighten(primary, 40),
    blue100: ColorUtils.lighten(primary, 30),
    blue200: ColorUtils.lighten(primary, 20),
    blue600: primary,
    blue700: primaryHover,
    blue800: ColorUtils.darken(primary, 20),
    
    // Green variants (success color)
    green100: ColorUtils.lighten(success, 30),
    green700: success,
    
    // Red variants (danger color)
    red50: ColorUtils.lighten(danger, 40),
    red200: ColorUtils.lighten(danger, 20),
    red700: danger,
    
    // Base Colors
    white,
    black,
    
    // Shadow & Overlay
    shadowLight: isDarkTheme ? 
      `rgba(${ColorUtils.hexToHsl(accent)[0]}, ${ColorUtils.hexToHsl(accent)[1]}, ${ColorUtils.hexToHsl(accent)[2]}, 0.15)` :
      'rgba(0, 0, 0, 0.05)',
    shadowMedium: isDarkTheme ?
      `rgba(${ColorUtils.hexToHsl(accent)[0]}, ${ColorUtils.hexToHsl(accent)[1]}, ${ColorUtils.hexToHsl(accent)[2]}, 0.25)` :
      'rgba(0, 0, 0, 0.1)',
    overlay: isDarkTheme ? 
      `rgba(${ColorUtils.hexToHsl(surface)[0]}, ${ColorUtils.hexToHsl(surface)[1]}, ${ColorUtils.hexToHsl(surface)[2]}, 0.9)` :
      'rgba(0, 0, 0, 0.6)',
    
    // Rating Colors
    ratingGold: warning,
    ratingGoldLight: ColorUtils.lighten(warning, 20),
    ratingEmpty: gray300,
    
    // Action Colors
    danger,
    success,
    warning,
    
    // Navigation
    navBar: isDarkTheme ? ColorUtils.lighten(surface, 5) : white,
    navBarDark: isDarkTheme ? accent : gray900,
    navBarBorder: gray200,
    
    // Text Colors
    text: textOnSurface,
    textSecondary,
    textWhite,
    
    // Background Colors
    background: surface,
    cardBg: isDarkTheme ? ColorUtils.lighten(surface, 8) : white,
    inputBg: isDarkTheme ? ColorUtils.lighten(surface, 12) : white,
    
    // Legacy mappings for compatibility
    star: isDarkTheme ? primary : accent,        // Victorian: accent (brownish purple), 90s: primary
    starEmpty: gray300,
    starCommunity: isDarkTheme ? warning : primary,  // Victorian: primary (blue), 90s: warning
    starCommunityEmpty: gray300,
    secondary: gray500,
    iconPrimary: text,
    iconBackground: isDarkTheme ? ColorUtils.lighten(surface, 12) : white,
    
    // Aliases for common usages
    error: danger,
    surface: isDarkTheme ? ColorUtils.lighten(surface, 8) : white,
    border: gray200,
    textPrimary: text,
    
    // Semantic tokens for component-specific needs
    ratingBreakdownBackground: isDarkTheme ? 'transparent' : gray50,
    starOutlineMode: isDarkTheme,
    avatarFontFamily: typography.primaryFont,
    appBackground: surface,
    // AboutScreen semantic tokens
    aboutHeaderBackground: isDarkTheme 
      ? 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)'
      : gray900,
    aboutContainerMaxWidth: isDarkTheme ? '700px' : '700px',
    aboutContainerPadding: isDarkTheme ? '0 24px' : '0 32px',
    aboutHeroImageBorder: isDarkTheme ? 'none' : `2px solid ${white}`,
    aboutHeroImageBorderRadius: isDarkTheme ? '0px' : '12px',
    aboutHeroImageWidth: isDarkTheme ? '200px' : '180px',
    aboutHeadingTextShadow: isDarkTheme 
      ? '0 0 15px #ff00ff, 0 0 30px #ff00ff'
      : 'none',
    aboutSectionPadding: isDarkTheme ? '24px 0' : '64px 0 96px',
    aboutCtaCardBackground: isDarkTheme 
      ? 'rgba(255, 0, 255, 0.1)'
      : '#cac2af',
    aboutCtaCardBorder: isDarkTheme ? '2px solid #ff00ff' : 'none',
    aboutCtaCardBoxShadow: isDarkTheme 
      ? '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.1)'
      : 'none',
    aboutCtaButtonBackground: isDarkTheme ? '#ff00ff' : accent,
    aboutCtaButtonPadding: isDarkTheme ? '16px 32px' : '12px 24px',
    aboutCtaButtonBoxShadow: isDarkTheme 
      ? '0 0 20px #ff00ff, 0 4px 15px rgba(255, 0, 255, 0.4)'
      : 'none',
    aboutCtaButtonTextShadow: isDarkTheme 
      ? '0 0 10px rgba(255, 255, 255, 0.8)'
      : 'none',
    // Text styling semantic tokens
    aboutHeadingColor: isDarkTheme ? white : gray900,
    aboutHeadingFontWeight: isDarkTheme ? '700' : '600',
    aboutHeadingLineHeight: isDarkTheme ? '1.2' : '2.5rem',
    aboutBodyColor: isDarkTheme ? white : text,
    aboutBodyFontSize: isDarkTheme ? '1.125rem' : '1rem',
    aboutCtaHeadingColor: isDarkTheme ? '#fecd06' : accent,
    aboutCtaHeadingFontSize: isDarkTheme ? '1.75rem' : '1.5rem',
    aboutCtaHeadingFontWeight: isDarkTheme ? '700' : '600',
    aboutCtaHeadingLineHeight: isDarkTheme ? '1.2' : '2rem',
    aboutCtaBodyLineHeight: isDarkTheme ? '1.6' : '1.5',
    aboutButtonFontSize: isDarkTheme ? '1.125rem' : '1rem',
    aboutButtonBorderRadius: isDarkTheme ? '12px' : '8px',
    // MenuScreen semantic tokens
    menuSearchContainerBackground: isDarkTheme 
      ? 'transparent' 
      : 'rgba(255, 255, 255, 0.1)',
    menuSearchContainerBackdropFilter: isDarkTheme 
      ? 'none' 
      : 'blur(4px)',
    menuSearchTitleColor: isDarkTheme 
      ? '#ff00ff'
      : gray900,
    menuInputBorder: isDarkTheme 
      ? 'none' 
      : `2px solid ${gray200}`,
    menuInputBoxShadow: isDarkTheme 
      ? '0 0 20px rgba(255, 0, 255, 0.3)' 
      : 'none',
    menuHeaderBackground: isDarkTheme 
      ? 'rgba(13, 5, 21, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    menuHeaderBoxShadow: isDarkTheme 
      ? '0 2px 20px rgba(255, 0, 255, 0.2)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
    menuRestaurantNameTextShadow: isDarkTheme 
      ? '0 0 10px #ff00ff' 
      : 'none',
    menuPinButtonFilter: isDarkTheme 
      ? 'drop-shadow(0 0 5px #ff00ff)' 
      : 'none',
    menuEmptyStateIconColor: isDarkTheme 
      ? '#ff00ff' 
      : gray500,
    // Star styling
    starBorderWidth: isDarkTheme ? '1' : '2',
    // DiscoveryScreen semantic tokens
    discoveryRestaurantNameColor: accent,
    discoveryRestaurantDistanceColor: isDarkTheme ? accent : textSecondary,
    discoveryHeaderBackground: isDarkTheme 
      ? 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)'
      : gray900,
    discoveryHeroImageStyle: isDarkTheme 
      ? {
          width: '200px',
          height: '200px',
          objectFit: 'contain' as const,
          marginBottom: '24px',
          border: 'none',
          borderRadius: '0px'
        }
      : {
          width: '180px',
          height: 'auto',
          objectFit: 'contain' as const,
          marginBottom: '24px',
          border: `2px solid ${white}`,
          borderRadius: '12px'
        },
    discoveryHeadingTextShadow: isDarkTheme 
      ? '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff'
      : 'none',
    discoverySearchInputBorder: isDarkTheme 
      ? '2px solid #ff00ff'
      : `2px solid ${gray200}`,
    discoverySearchInputBoxShadow: isDarkTheme 
      ? '0 0 20px rgba(255, 0, 255, 0.3)'
      : 'none',
    discoverySelectBorder: isDarkTheme 
      ? '2px solid #640464'
      : `2px solid ${gray200}`,
    // RatingsScreen semantic tokens
    ratingsHeaderBackground: isDarkTheme 
      ? 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)'
      : gray900,
    ratingsHeroImageWidth: isDarkTheme ? '200px' : '180px',
    ratingsHeroImageBorder: isDarkTheme ? 'none' : `2px solid ${white}`,
    ratingsHeroImageBorderRadius: isDarkTheme ? '0px' : '12px',
    ratingsTitleTextShadow: isDarkTheme 
      ? '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff'
      : 'none',
    ratingsSearchBorder: isDarkTheme 
      ? '2px solid #ff00ff'
      : `2px solid ${gray200}`,
    ratingsSearchShadow: isDarkTheme 
      ? '0 0 20px rgba(255, 0, 255, 0.3)'
      : 'none',
    // FindRestaurantScreen semantic tokens
    findRestaurantHeaderBackground: isDarkTheme 
      ? 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)'
      : gray900,
    findRestaurantHeroImageWidth: isDarkTheme ? '200px' : '180px',
    findRestaurantHeroImageBorder: isDarkTheme ? 'none' : `2px solid ${white}`,
    findRestaurantHeroImageBorderRadius: isDarkTheme ? '0px' : '12px',
    findRestaurantTitleTextShadow: isDarkTheme 
      ? '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff'
      : 'none',
    findRestaurantSearchBorder: isDarkTheme 
      ? '2px solid #ff00ff'
      : `2px solid ${gray200}`,
    findRestaurantSearchShadow: isDarkTheme 
      ? '0 0 20px rgba(255, 0, 255, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
    findRestaurantInputBorder: isDarkTheme 
      ? '2px solid #ff00ff'
      : `2px solid ${gray200}`,
    findRestaurantDistanceColor: isDarkTheme ? gray900 : textSecondary,
    // Missing properties used in components
    signOutButtonText: danger,
    discoverySelectTextColor: isDarkTheme ? '#fecd06' : text,
    menuSortOptionsContainer: isDarkTheme ? 'rgba(255, 0, 255, 0.1)' : white,
    menuSortButtonActive: isDarkTheme ? primary : primary,
    menuSortButtonDefault: isDarkTheme ? '#4D3664' : gray200,
    restaurantModalContainer: isDarkTheme ? 'rgba(26, 13, 38, 0.95)' : white,
    restaurantModalNameColor: isDarkTheme ? '#fecd06' : gray900,
    restaurantModalNameTextShadow: isDarkTheme ? '0 0 10px #ff00ff' : 'none',
    restaurantModalAddressColor: isDarkTheme ? '#C2A6DE' : gray500,
    restaurantModalCloseButtonBackground: danger,
    restaurantModalCloseButtonTextColor: white,
    restaurantModalCloseButtonBoxShadow: isDarkTheme ? '0 0 15px rgba(255, 0, 64, 0.5)' : 'none',
    restaurantModalCloseButtonBorder: isDarkTheme ? '2px solid #FF0040' : 'none',
    restaurantModalCloseButtonHoverBackground: isDarkTheme ? '#CC0033' : ColorUtils.darken(danger, 10),
    iconButtonBorderActive: isDarkTheme ? primary : primary,
    iconButtonBorderInactive: isDarkTheme ? '#4D3664' : gray200,
    
    // Login form properties
    loginFormInputBackground: isDarkTheme ? '#1a0d1a' : white,
    loginFormInputBorder: isDarkTheme ? '2px solid #ff00ff' : `2px solid ${gray200}`,
    loginFormInputBoxShadow: isDarkTheme ? '0 0 10px rgba(255, 0, 255, 0.3)' : 'none',
    loginFormInputColor: isDarkTheme ? white : gray700,
    loginFormContainer: isDarkTheme ? black : '#101010',
    loginFormHeaderTitleColor: isDarkTheme ? primary : gray900,
    loginFormHeaderTitleTextShadow: isDarkTheme ? '0 0 20px #ff00ff' : 'none',
    loginFormHeaderSubtitleColor: isDarkTheme ? '#C2A6DE' : gray500,
    loginFormErrorBackground: isDarkTheme ? 'rgba(255, 0, 128, 0.1)' : '#FEF2F2',
    loginFormErrorBorder: isDarkTheme ? '2px solid #ff0080' : '2px solid #FCA5A5',
    loginFormErrorTextColor: isDarkTheme ? '#ff0080' : '#B91C1C',
    loginFormLabelColor: isDarkTheme ? '#C2A6DE' : gray700,
    loginFormSubmitButtonBackground: isDarkTheme ? primary : primary,
    loginFormSubmitButtonTextColor: isDarkTheme ? black : white,
    loginFormSubmitButtonBoxShadow: isDarkTheme ? '0 0 15px rgba(255, 0, 255, 0.5)' : 'none',
    loginFormSubmitButtonHoverBackground: isDarkTheme ? '#cc00cc' : ColorUtils.darken(primary, 10),
    loginFormModeToggleColor: isDarkTheme ? primary : primary,
    loginFormCancelColor: isDarkTheme ? '#C2A6DE' : gray500,
    loginFormPasswordToggleColor: isDarkTheme ? '#C2A6DE' : gray500,
  };
}

function generateFonts(typography: ThemeSpec['typography']) {
  const { primaryFont, headingFont } = typography;
  
  return {
    primary: {
      fontFamily: primaryFont,
      letterSpacing: '-0.01em',
    },
    heading: {
      fontFamily: headingFont,
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    body: {
      fontFamily: primaryFont,
      lineHeight: '1.5',
    },
    elegant: {
      fontFamily: primaryFont,
      letterSpacing: '-0.01em',
    },
  };
}

function generateTypography(typography: ThemeSpec['typography']) {
  const { primaryFont, headingFont, fontScaleRatio } = typography;
  const baseFontSize = 16; // 1rem
  
  // Generate type scale
  const sizes = {
    caption: baseFontSize / fontScaleRatio,
    body: baseFontSize,
    h3: baseFontSize * fontScaleRatio,
    h2: baseFontSize * Math.pow(fontScaleRatio, 2),
    h1: baseFontSize * Math.pow(fontScaleRatio, 3),
  };

  return {
    h1: {
      fontFamily: headingFont,
      fontSize: `${sizes.h1}px`,
      fontWeight: '600',
      letterSpacing: '-0.025em',
      lineHeight: '1.2',
    },
    h2: {
      fontFamily: headingFont,
      fontSize: `${sizes.h2}px`,
      fontWeight: '600',
      letterSpacing: '-0.025em',
      lineHeight: '1.3',
    },
    h3: {
      fontFamily: headingFont,
      fontSize: `${sizes.h3}px`,
      fontWeight: '600',
      letterSpacing: '-0.01em',
      lineHeight: '1.4',
    },
    body: {
      fontFamily: primaryFont,
      fontSize: `${sizes.body}px`,
      lineHeight: '1.5',
    },
    caption: {
      fontFamily: primaryFont,
      fontSize: `${sizes.caption}px`,
      lineHeight: '1.4',
    },
    button: {
      fontFamily: primaryFont,
      fontSize: `${baseFontSize}px`,
      fontWeight: '600',
      lineHeight: '1.5',
    },
  };
}

function generateSpacing(baseUnit: number) {
  return {
    1: `${baseUnit * 0.25}px`,
    2: `${baseUnit * 0.5}px`,
    3: `${baseUnit * 0.75}px`,
    4: `${baseUnit}px`,
    5: `${baseUnit * 1.25}px`,
    6: `${baseUnit * 1.5}px`,
    8: `${baseUnit * 2}px`,
    10: `${baseUnit * 2.5}px`,
    12: `${baseUnit * 3}px`,
    // Legacy spacing
    containerPadding: `${baseUnit}px`,
    sectionGap: `${baseUnit * 1.5}px`,
    cardPadding: `${baseUnit * 1.25}px`,
  };
}

function generateBorders(baseRadius: number) {
  return {
    radius: {
      small: `${baseRadius * 0.75}px`,
      medium: `${baseRadius}px`,
      large: `${baseRadius * 1.5}px`,
      full: '9999px',
    },
  };
}

function generateShadows(preset: ThemeSpec['geometry']['shadowPreset'], colors: ColorPalette) {
  switch (preset) {
    case 'sharp':
      return {
        small: '0 1px 3px rgba(0, 0, 0, 0.2)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
        large: '0 10px 15px rgba(0, 0, 0, 0.4)',
      };
    case 'glow':
      return {
        small: `0 0 10px ${colors.shadowLight}`,
        medium: `0 0 20px ${colors.shadowMedium}`,
        large: `0 0 40px ${colors.shadowMedium}`,
      };
    case 'soft':
    default:
      return {
        small: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      };
  }
}

function generateAnimations() {
  return {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  };
}

function generateImagePaths(themeId: string) {
  return {
    logo: `/themes/${themeId}/logo.png`,
    homeFindRestaurants: `/themes/${themeId}/home-find-restaurants.png`,
    homeDiscoverDishes: `/themes/${themeId}/home-discover-dishes.png`,
    findRestaurantHero: `/themes/${themeId}/find-restaurant-hero.png`,
    aboutHero: `/themes/${themeId}/about-hero.png`,
    discoveryHero: `/themes/${themeId}/discovery-hero.png`,
    ratingsHero: `/themes/${themeId}/ratings-hero.png`,
    restaurantDefault: `/themes/${themeId}/restaurant-default.png`,
  };
}

function generateEffects(preset: ThemeSpec['geometry']['shadowPreset'], colors: ColorPalette) {
  switch (preset) {
    case 'glow':
      return {
        primaryButtonHover: {
          transform: 'translateY(-1px) scale(1.02)',
          boxShadow: `0 0 20px ${colors.primary}40, 0 0 40px ${colors.accent}30`,
        },
        cardHover: {
          transform: 'translateY(-3px)',
          boxShadow: `0 0 25px ${colors.primary}40, 0 0 50px ${colors.accent}20`,
        },
        glowEffect: {
          boxShadow: `0 0 15px ${colors.primary}50, 0 0 30px ${colors.accent}30`,
        },
      };
    case 'sharp':
      return {
        primaryButtonHover: {
          transform: 'translateY(-2px)',
          boxShadow: `4px 4px 0px ${colors.black}`,
        },
        cardHover: {
          transform: 'translateY(-4px)',
          boxShadow: `8px 8px 0px ${colors.black}`,
        },
        glowEffect: {},
      };
    case 'soft':
    default:
      return {
        primaryButtonHover: {
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${colors.primary}25`,
        },
        cardHover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        },
        glowEffect: {},
      };
  }
}