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
  // Semantic tokens for component-specific needs
  ratingBreakdownBackground: string;
  starOutlineMode: boolean;
  avatarFontFamily: string;
  appBackground: string;
  // AboutScreen semantic tokens
  aboutHeaderBackground: string;
  aboutContainerMaxWidth: string;
  aboutContainerPadding: string;
  aboutHeroImageBorder: string;
  aboutHeroImageBorderRadius: string;
  aboutHeroImageWidth: string;
  aboutHeadingTextShadow: string;
  aboutSectionPadding: string;
  aboutCtaCardBackground: string;
  aboutCtaCardBorder: string;
  aboutCtaCardBoxShadow: string;
  aboutCtaButtonBackground: string;
  aboutCtaButtonPadding: string;
  aboutCtaButtonBoxShadow: string;
  aboutCtaButtonTextShadow: string;
  // Text styling semantic tokens
  aboutHeadingColor: string;
  aboutHeadingFontWeight: string;
  aboutHeadingLineHeight: string;
  aboutBodyColor: string;
  aboutBodyFontSize: string;
  aboutCtaHeadingColor: string;
  aboutCtaHeadingFontSize: string;
  aboutCtaHeadingFontWeight: string;
  aboutCtaHeadingLineHeight: string;
  aboutCtaBodyLineHeight: string;
  aboutButtonFontSize: string;
  aboutButtonBorderRadius: string;
  // MenuScreen semantic tokens
  menuSearchContainerBackground: string;
  menuSearchContainerBackdropFilter: string;
  menuSearchTitleColor: string;
  menuInputBorder: string;
  menuInputBoxShadow: string;
  menuHeaderBackground: string;
  menuHeaderBoxShadow: string;
  menuRestaurantNameTextShadow: string;
  menuPinButtonFilter: string;
  menuEmptyStateIconColor: string;
  // Star styling
  starBorderWidth: string;
  // DiscoveryScreen semantic tokens
  discoveryRestaurantNameColor: string;
  discoveryRestaurantDistanceColor: string;
  discoveryHeaderBackground: string;
  discoveryHeroImageStyle: object;
  discoveryHeadingTextShadow: string;
  discoverySearchInputBorder: string;
  discoverySearchInputBoxShadow: string;
  discoverySelectBorder: string;
  // RatingsScreen semantic tokens
  ratingsHeaderBackground: string;
  ratingsHeroImageWidth: string;
  ratingsHeroImageBorder: string;
  ratingsHeroImageBorderRadius: string;
  ratingsTitleTextShadow: string;
  ratingsSearchBorder: string;
  ratingsSearchShadow: string;
  // FindRestaurantScreen semantic tokens
  findRestaurantHeaderBackground: string;
  findRestaurantHeroImageWidth: string;
  findRestaurantHeroImageBorder: string;
  findRestaurantHeroImageBorderRadius: string;
  findRestaurantTitleTextShadow: string;
  findRestaurantSearchBorder: string;
  findRestaurantSearchShadow: string;
  findRestaurantInputBorder: string;
  findRestaurantDistanceColor: string;
  // LoginForm semantic tokens
  loginFormInputBackground: string;
  loginFormInputBorder: string;
  loginFormInputBoxShadow: string;
  loginFormInputColor: string;
  loginFormContainer: string;
  loginFormHeaderTitleColor: string;
  loginFormHeaderTitleTextShadow: string;
  loginFormHeaderSubtitleColor: string;
  loginFormErrorBackground: string;
  loginFormErrorBorder: string;
  loginFormErrorTextColor: string;
  loginFormLabelColor: string;
  loginFormSubmitButtonBackground: string;
  loginFormSubmitButtonTextColor: string;
  loginFormSubmitButtonBoxShadow: string;
  loginFormSubmitButtonHoverBackground: string;
  loginFormModeToggleColor: string;
  loginFormCancelColor: string;
  loginFormPasswordToggleColor: string;
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
    star: '#642e32', // Personal rating (brownish purple - accent)
    starEmpty: '#E5E7EB', // Empty stars
    starCommunity: '#2563EB', // Community rating (blue - primary)
    starCommunityEmpty: '#E5E7EB', // Empty community stars
    secondary: '#6B7280', // Secondary color
    iconPrimary: '#374151', // Icon color
    iconBackground: '#FFFFFF', // Icon button backgrounds
    // NEW: Aliases for common color usages in AdminScreen
    error: '#EF4444', // Maps to danger
    surface: '#FFFFFF', // Maps to white/cardBg
    border: '#E5E7EB', // Maps to gray200
    textPrimary: '#374151', // Maps to text
    // Semantic tokens for component-specific needs
    ratingBreakdownBackground: '#F9FAFB', // Gray-50 background for Victorian rating breakdown
    starOutlineMode: false,
    avatarFontFamily: '"Pinyon Script", cursive',
    appBackground: '#F9FAFB',
    // AboutScreen semantic tokens
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
    // Text styling semantic tokens
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
    // MenuScreen semantic tokens
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
    // DiscoveryScreen semantic tokens
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
    // RatingsScreen semantic tokens
    ratingsHeaderBackground: '#101010',
    ratingsHeroImageWidth: '180px',
    ratingsHeroImageBorder: '2px solid #FFFFFF',
    ratingsHeroImageBorderRadius: '12px',
    ratingsTitleTextShadow: 'none',
    ratingsSearchBorder: '2px solid #E5E7EB',
    ratingsSearchShadow: 'none',
    // FindRestaurantScreen semantic tokens
    findRestaurantHeaderBackground: '#101010',
    findRestaurantHeroImageWidth: '180px',
    findRestaurantHeroImageBorder: '2px solid #FFFFFF',
    findRestaurantHeroImageBorderRadius: '12px',
    findRestaurantTitleTextShadow: 'none',
    findRestaurantSearchBorder: '2px solid #E5E7EB',
    findRestaurantSearchShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    findRestaurantInputBorder: '2px solid #E5E7EB',
    findRestaurantDistanceColor: '#6B7280',
    // LoginForm semantic tokens
    loginFormInputBackground: '#FFFFFF',
    loginFormInputBorder: '2px solid #E5E7EB',
    loginFormInputBoxShadow: 'none',
    loginFormInputColor: '#374151',
    loginFormContainer: '#101010',
    loginFormHeaderTitleColor: '#111827',
    loginFormHeaderTitleTextShadow: 'none',
    loginFormHeaderSubtitleColor: '#6B7280',
    loginFormErrorBackground: '#FEF2F2',
    loginFormErrorBorder: '2px solid #FCA5A5',
    loginFormErrorTextColor: '#B91C1C',
    loginFormLabelColor: '#374151',
    loginFormSubmitButtonBackground: '#2563EB',
    loginFormSubmitButtonTextColor: '#FFFFFF',
    loginFormSubmitButtonBoxShadow: 'none',
    loginFormSubmitButtonHoverBackground: '#1D4ED8',
    loginFormModeToggleColor: '#2563EB',
    loginFormCancelColor: '#6B7280',
    loginFormPasswordToggleColor: '#6B7280',
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
    gray700: '#fecd06', // Primary text - electric yellow with glow
    gray900: '#fecd06', // Headers - electric yellow with glow
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
    text: '#fecd06', // Electric yellow text with glow
    textSecondary: '#C2A6DE', // Lighter purple for secondary text
    textWhite: '#FFFFFF', // Pure white text
    // Background Colors
    background: '#0D0515', // Very dark purple background (default)
    cardBg: '#1A0D26', // Dark purple cards
    inputBg: '#2D1B3D', // Darker input backgrounds
    // Legacy mappings for compatibility
    star: '#00FFFF', // Electric cyan stars (matches restaurant names)
    starEmpty: '#4D3664', // Dark purple empty
    starCommunity: '#fecd06', // Electric yellow community rating (matches dish name color)
    starCommunityEmpty: '#4D3664', // Dark purple empty
    secondary: '#00FFFF', // Cyan secondary
    iconPrimary: '#fecd06', // Electric yellow icons with glow
    iconBackground: '#2D1B3D', // Dark purple icon backgrounds
    // Aliases for common color usages
    error: '#FF0040', // Electric red
    surface: '#1A0D26', // Dark purple surface
    border: '#FF00FF', // Magenta borders
    textPrimary: '#fecd06', // Electric yellow primary text with glow
    // Semantic tokens for component-specific needs
    ratingBreakdownBackground: 'transparent', // Transparent background for 90s rating breakdown
    starOutlineMode: true,
    avatarFontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
    appBackground: 'linear-gradient(135deg, #0D0515 0%, #1A0D26 25%, #2D1B3D 50%, #0D0515 75%, #0D0515 100%)',
    // AboutScreen semantic tokens
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
    // Text styling semantic tokens
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
    // MenuScreen semantic tokens
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
    // DiscoveryScreen semantic tokens
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
    // RatingsScreen semantic tokens
    ratingsHeaderBackground: 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)',
    ratingsHeroImageWidth: '200px',
    ratingsHeroImageBorder: 'none',
    ratingsHeroImageBorderRadius: '0px',
    ratingsTitleTextShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
    ratingsSearchBorder: '2px solid #ff00ff',
    ratingsSearchShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
    // FindRestaurantScreen semantic tokens
    findRestaurantHeaderBackground: 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)',
    findRestaurantHeroImageWidth: '200px',
    findRestaurantHeroImageBorder: 'none',
    findRestaurantHeroImageBorderRadius: '0px',
    findRestaurantTitleTextShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
    findRestaurantSearchBorder: '2px solid #ff00ff',
    findRestaurantSearchShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
    findRestaurantInputBorder: '2px solid #ff00ff',
    findRestaurantDistanceColor: '#C2A6DE',
    // LoginForm semantic tokens
    loginFormInputBackground: '#1a0d1a',
    loginFormInputBorder: '2px solid #ff00ff',
    loginFormInputBoxShadow: '0 0 10px rgba(255, 0, 255, 0.3)',
    loginFormInputColor: '#ffffff',
    loginFormContainer: '#000000',
    loginFormHeaderTitleColor: '#ff00ff',
    loginFormHeaderTitleTextShadow: '0 0 20px #ff00ff',
    loginFormHeaderSubtitleColor: '#C2A6DE',
    loginFormErrorBackground: 'rgba(255, 0, 128, 0.1)',
    loginFormErrorBorder: '2px solid #ff0080',
    loginFormErrorTextColor: '#ff0080',
    loginFormLabelColor: '#C2A6DE',
    loginFormSubmitButtonBackground: '#ff00ff',
    loginFormSubmitButtonTextColor: '#000000',
    loginFormSubmitButtonBoxShadow: '0 0 15px rgba(255, 0, 255, 0.5)',
    loginFormSubmitButtonHoverBackground: '#cc00cc',
    loginFormModeToggleColor: '#ff00ff',
    loginFormCancelColor: '#C2A6DE',
    loginFormPasswordToggleColor: '#C2A6DE',
  },
};
