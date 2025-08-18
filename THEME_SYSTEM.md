# Theme System Documentation

## Overview

HowzEverything uses a sophisticated semantic token-based theme system that automatically generates complete themes from simple specifications. This system eliminates conditional logic throughout the codebase and provides a scalable architecture for unlimited theme variations.

## Quick Start

### Using Themes in Components

```typescript
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      border: theme.colors.border,
      boxShadow: theme.colors.shadowMedium
    }}>
      {/* Use semantic tokens instead of hardcoded values */}
    </div>
  );
}
```

### Never Use Conditional Logic

❌ **Don't do this:**
```typescript
// BAD: Conditional theme logic
backgroundColor: theme.id === 'victorian' ? '#101010' : '#0D0515'
```

✅ **Do this instead:**
```typescript
// GOOD: Use semantic tokens
backgroundColor: theme.colors.aboutHeaderBackground
```

## Architecture

### Core Components

1. **ThemeContext.tsx** - Active theme provider (current system)
2. **themes.ts** - Theme type definitions and static theme definitions
3. **themeEngine.ts** - Advanced theme generation engine (future system)
4. **useTheme.ts** - Hook for accessing current theme

### Theme Structure

Each theme provides:
- **57 semantic tokens** covering all UI needs
- **Colors** - All color values including screen-specific tokens
- **Typography** - Font families, sizes, and weights  
- **Spacing** - Consistent spacing system
- **Effects** - Shadows, borders, and animations
- **Images** - Theme-specific asset paths

## Available Themes

### Victorian Theme (default)
- **Background**: Light (`#F9FAFB`)
- **Style**: Elegant, classic design with serif fonts
- **Colors**: Muted grays and browns
- **Use case**: Professional, readable interface

### 90s Theme
- **Background**: Dark (`#0D0515`) 
- **Style**: Cyberpunk aesthetic with neon effects
- **Colors**: Electric purples and neon pink (`#ff00ff`)
- **Use case**: Modern, edgy interface

### Grumpy Cat Theme
- **Background**: Cream (`#fbeedd`)
- **Style**: Warm, playful design with argyle patterns
- **Colors**: Warm oranges (`#dd5a14`) and golden accents (`#ee9d2a`)
- **Use case**: Friendly, approachable interface with personality

## Semantic Tokens by Screen

### Global Tokens
```typescript
// Basic colors
theme.colors.background      // Main background color
theme.colors.text           // Primary text color  
theme.colors.textSecondary  // Secondary text color
theme.colors.white          // White text (headers)
theme.colors.border         // Standard border color

// Navigation
theme.colors.navBar         // Navigation background
theme.colors.navBarDark     // Navigation dark variant

// Actions & States
theme.colors.primary        // Primary action color
theme.colors.danger         // Error/danger states
theme.colors.success        // Success states
```

### Screen-Specific Tokens

#### AboutScreen
```typescript
theme.colors.aboutHeaderBackground      // Header section background
theme.colors.aboutHeroImageWidth       // Hero image dimensions
theme.colors.aboutHeroImageBorder      // Hero image border
theme.colors.aboutHeadingTextShadow    // Title text effects
theme.colors.aboutCtaCardBackground    // Call-to-action card styling
```

#### FindRestaurantScreen  
```typescript
theme.colors.findRestaurantHeaderBackground     // Header section background
theme.colors.findRestaurantHeroImageWidth      // Hero image dimensions
theme.colors.findRestaurantTitleTextShadow     // Title text effects
theme.colors.findRestaurantSearchBorder        // Search input styling
theme.colors.findRestaurantDistanceColor       // Distance text color
```

#### MenuScreen
```typescript
theme.colors.menuHeaderBackground              // Header background
theme.colors.menuSearchTitleColor              // Search title color
theme.colors.menuInputBorder                   // Input field borders
theme.colors.menuRestaurantNameTextShadow      // Restaurant name effects
```

#### DiscoveryScreen
```typescript
theme.colors.discoveryHeaderBackground         // Header background
theme.colors.discoveryHeadingTextShadow        // Title text effects
theme.colors.discoverySearchInputBorder        // Search styling
theme.colors.discoveryRestaurantNameColor      // Restaurant name color
```

#### RatingsScreen
```typescript
theme.colors.ratingsHeaderBackground           // Header background  
theme.colors.ratingsHeroImageWidth            // Hero image size
theme.colors.ratingsTitleTextShadow           // Title effects
theme.colors.ratingsSearchBorder              // Search input borders
```

#### LoginForm (Modal Components)
```typescript
theme.colors.loginFormContainer                // Container styling object with background, border, shadow
theme.colors.loginFormHeaderTitleColor         // Header title text color
theme.colors.loginFormHeaderTitleTextShadow    // Header title text effects
theme.colors.loginFormHeaderSubtitleColor      // Subtitle text color
theme.colors.loginFormErrorBackground          // Error container background
theme.colors.loginFormErrorBorder              // Error container border
theme.colors.loginFormErrorTextColor           // Error text color
theme.colors.loginFormLabelColor               // Form label text color
theme.colors.loginFormInputBackground          // Input field backgrounds
theme.colors.loginFormInputBorder              // Input field borders
theme.colors.loginFormInputBoxShadow           // Input field shadow effects
theme.colors.loginFormInputColor               // Input text color
theme.colors.loginFormSubmitButtonBackground   // Submit button background
theme.colors.loginFormSubmitButtonHoverBackground // Submit button hover state
theme.colors.loginFormSubmitButtonTextColor    // Submit button text color
theme.colors.loginFormSubmitButtonBoxShadow    // Submit button shadow effects
theme.colors.loginFormModeToggleColor          // Mode toggle button color
theme.colors.loginFormCancelColor              // Cancel button color
theme.colors.loginFormPasswordToggleColor      // Password visibility toggle color
```

#### Restaurant Modal (Modal Components)
```typescript
theme.colors.restaurantModalContainer          // Container styling object with background, border, shadow, patterns
theme.colors.restaurantModalNameColor          // Restaurant name text color
theme.colors.restaurantModalNameTextShadow     // Restaurant name text effects
theme.colors.restaurantModalAddressColor       // Address text color
theme.colors.restaurantModalCloseButtonBackground       // Close button background
theme.colors.restaurantModalCloseButtonHoverBackground  // Close button hover state
theme.colors.restaurantModalCloseButtonTextColor        // Close button text color
theme.colors.restaurantModalCloseButtonBoxShadow        // Close button shadow effects
theme.colors.restaurantModalCloseButtonBorder           // Close button border color
```

#### MenuScreen Sort Options
```typescript
theme.colors.menuSortOptionsContainer          // Sort container styling object with background, border, patterns
theme.colors.menuSortButtonDefault            // Default sort button styling object
theme.colors.menuSortButtonActive             // Active sort button styling object
```

## Adding New Themes

### Method 1: Static Theme Definition (Current)

Add to `src/contexts/ThemeContext.tsx`:

```typescript
const NEW_THEME: ColorPalette = {
  // Copy existing theme and modify values
  primary: '#YOUR_COLOR',
  background: '#YOUR_BG', 
  text: '#YOUR_TEXT',
  // ... all 57 semantic tokens
};
```

### Method 2: Theme Engine (Future)

Create 8-line specification in `src/styles/themeEngine.ts`:

```typescript
const newThemeSpec: ThemeSpec = {
  id: 'mytheme',
  name: 'My Theme',
  description: 'Custom theme description',
  colors: {
    primary: '#2563EB',
    surface: '#FFFFFF', 
    text: '#374151',
    accent: '#642e32'
  },
  typography: {
    primaryFont: '"Inter", sans-serif',
    headingFont: '"Inter", sans-serif', 
    fontScaleRatio: 1.25
  },
  geometry: {
    baseSpacingUnit: 16,
    baseBorderRadius: 8,
    shadowPreset: 'soft'
  }
};

// Engine automatically generates all 57 semantic tokens
const generatedTheme = createTheme(newThemeSpec);
```

## Component Integration Patterns

### Screen Headers
All screens use consistent header patterns:
```typescript
<div style={{
  background: theme.colors.{screen}HeaderBackground,
  paddingTop: '84px',
  paddingBottom: '32px',
  minHeight: '400px'
}}>
```

### Hero Images
Theme-appropriate hero image styling:
```typescript
<img 
  src={theme.images.{screen}Hero}
  style={{
    width: theme.colors.{screen}HeroImageWidth,
    border: theme.colors.{screen}HeroImageBorder,
    borderRadius: theme.colors.{screen}HeroImageBorderRadius
  }}
/>
```

### Text Effects
Conditional text effects using semantic tokens:
```typescript
<h1 style={{
  ...theme.fonts.heading,
  color: theme.colors.white,
  textShadow: theme.colors.{screen}TitleTextShadow
}}>
```

### Form Inputs
Consistent input styling:
```typescript
<input style={{
  border: theme.colors.{screen}SearchBorder,
  boxShadow: theme.colors.{screen}SearchShadow,
  backgroundColor: theme.colors.inputBg
}} />
```

### Modal Components
Theme-aware modal styling using semantic tokens:
```typescript
// Container with theme-specific styling object
<div style={getContainerStyle()}>
  {/* Uses theme.colors.loginFormContainer which can include
      backgroundColor, border, boxShadow, borderRadius, backgroundImage */}
  
  {/* Header with theme-specific text effects */}
  <h2 style={{
    color: theme.colors.loginFormHeaderTitleColor,
    textShadow: theme.colors.loginFormHeaderTitleTextShadow
  }}>
    
  {/* Form inputs with theme-specific styling */}
  <input style={{
    backgroundColor: theme.colors.loginFormInputBackground,
    border: theme.colors.loginFormInputBorder,
    boxShadow: theme.colors.loginFormInputBoxShadow,
    color: theme.colors.loginFormInputColor
  }} />
  
  {/* Submit button with theme-specific effects */}
  <button style={{
    backgroundColor: theme.colors.loginFormSubmitButtonBackground,
    color: theme.colors.loginFormSubmitButtonTextColor,
    boxShadow: theme.colors.loginFormSubmitButtonBoxShadow
  }}>
</div>
```

**Pattern**: Modal components use component-specific semantic tokens (`loginForm*`, `restaurantModal*`) that can override default styling per theme. This allows for complex theming like 90s neon effects or Grumpy Cat argyle patterns without conditional logic.

### Restaurant Modal Example
Theme-aware restaurant modal styling using semantic tokens:
```typescript
// Container with theme-specific styling object
<div style={getRestaurantModalContainerStyle()}>
  {/* Uses theme.colors.restaurantModalContainer which can include
      backgroundColor, border, boxShadow, borderRadius, backgroundImage (argyle patterns) */}
  
  {/* Restaurant name with theme-specific text effects */}
  <p style={{
    color: theme.colors.restaurantModalNameColor,
    textShadow: theme.colors.restaurantModalNameTextShadow
  }}>
    
  {/* Address with theme-specific color */}
  <p style={{
    color: theme.colors.restaurantModalAddressColor
  }}>
  
  {/* Close button with theme-specific styling and hover effects */}
  <button style={{
    backgroundColor: theme.colors.restaurantModalCloseButtonBackground,
    color: theme.colors.restaurantModalCloseButtonTextColor,
    border: theme.colors.restaurantModalCloseButtonBorder,
    boxShadow: theme.colors.restaurantModalCloseButtonBoxShadow
  }}>
</div>
```

### Interactive UI Components
Theme-aware interactive elements like sort options:
```typescript
// Sort options container with theme-specific patterns
<div style={getSortOptionsContainerStyle()}>
  {/* Uses theme.colors.menuSortOptionsContainer which can include
      backgroundColor, border, boxShadow, borderRadius, backgroundImage */}
  
  {/* Sort buttons with state-specific theming */}
  <button style={getSortButtonStyle(isActive)}>
    {/* Uses theme.colors.menuSortButtonDefault or menuSortButtonActive
        depending on isActive state */}
  </button>
</div>
```

**Pattern**: Interactive components like sort buttons use state-specific semantic tokens (e.g., `menuSortButtonDefault` vs `menuSortButtonActive`) to provide different styling for different interaction states, maintaining visual consistency within each theme's aesthetic.

## Common Gotchas & Implementation Notes

### Asset Management
**Critical**: Theme assets must be committed to git for production deployment.

```bash
# ❌ Images work locally but fail in production
git status
# Untracked files: public/cat_logo.png, public/cat_hero.jpg

# ✅ Always commit theme assets  
git add public/theme_*
git commit -m "assets: add theme image files"
```

### React Inline Style Considerations

**Complex CSS Patterns**: Use template literals and RGBA for React compatibility:
```typescript
// ❌ Complex gradients may not work reliably
background: 'linear-gradient(45deg, #color1 25%, transparent 75%), linear-gradient(-45deg, #color2 25%, transparent 75%)'

// ✅ Use RGBA with template literals for better compatibility
backgroundImage: `
  repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(221, 90, 20, 0.3) 14px, rgba(221, 90, 20, 0.3) 16px),
  repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(238, 157, 42, 0.25) 14px, rgba(238, 157, 42, 0.25) 16px)
`
```

**Opacity for Readability**: When using patterned backgrounds, reduce opacity for text readability:
```typescript
// ✅ Use alpha transparency to ensure text readability
backgroundColor: 'rgba(221, 90, 20, 0.3)' // 30% opacity
```

### Semantic Token Misuse

**Common Error**: Components using `theme.colors.white` for backgrounds instead of semantic tokens:
```typescript
// ❌ Wrong - uses theme text color for backgrounds
backgroundColor: theme.colors.white // In grumpy-cat theme, this is brown text color!

// ✅ Correct - use semantic background tokens
backgroundColor: theme.colors.inputBg
backgroundColor: theme.colors.cardBg
backgroundColor: theme.colors.background
```

### Theme Selector Integration

**Custom Theme Selectors**: Themes may need special handling in the theme selector:
```typescript
// Example: Custom argyle background with proper text color
if (themeId === 'grumpy-cat') {
  return {
    backgroundImage: 'argyle-pattern...',
    color: '#482107', // Dark brown for readability
  };
}
```

### File Path Case Sensitivity

**Critical for Production**: Ensure image file extensions match exactly:
```typescript
// ❌ Case mismatch causes production failures
homeFindRestaurants: '/cat_home_find_hero.JPG', // Config expects uppercase
// But file is: cat_home_find_hero.jpg (lowercase)

// ✅ Exact case match required
homeFindRestaurants: '/cat_home_find_hero.jpg', // Matches actual file
```

### New Token Creation Pattern

When themes need new capabilities, create semantic tokens instead of hardcoding:
```typescript
// ❌ Don't hardcode theme-specific values
color: currentTheme === 'grumpy-cat' ? '#ffffff' : theme.colors.text

// ✅ Create semantic tokens and override in specific themes
color: theme.colors.signOutButtonText || theme.colors.text

// In theme overrides:
'grumpy-cat': {
  signOutButtonText: '#ffffff',
}
```

## Best Practices

### 1. Always Use Semantic Tokens
- Use `theme.colors.aboutHeaderBackground` not `'#101010'`
- Tokens automatically adapt to theme changes
- Maintains consistency across the application

### 2. Screen-Specific Tokens
- Use screen-specific tokens for screen-unique styling
- Example: `findRestaurantHeaderBackground` for FindRestaurant screen
- Falls back to global tokens when screen-specific not needed

### 3. Consistent Patterns
- All screen headers use the same structure with different tokens
- Hero images follow the same pattern with theme-specific dimensions
- Form inputs use consistent semantic token patterns

### 4. Future-Proof Development
- New components should use semantic tokens from day one
- Avoid hardcoded theme values
- Design with multiple themes in mind

### 5. Testing Themes
- Always test components in both Victorian and 90s themes
- Verify text readability and contrast
- Ensure UI elements are properly styled in both themes

## File Structure

```
src/
├── contexts/
│   └── ThemeContext.tsx     # Active theme definitions & provider
├── styles/
│   ├── themes.ts           # Type definitions & static themes  
│   └── themeEngine.ts      # Advanced theme generation
├── hooks/
│   └── useTheme.ts         # Theme access hook
└── components/
    └── [screen].tsx        # Components using semantic tokens
```

## Implementation Workflow

### Adding a New Theme (Complete Process)

Based on real implementation experience, follow this proven workflow:

#### 1. Theme Definition
```typescript
// Add to THEME_SPECS in ThemeContext.tsx
'new-theme': {
  id: 'new-theme',
  name: 'New Theme',
  description: 'Theme description that will appear in selector',
  colors: { primary: '#color', surface: '#color', text: '#color', accent: '#color' },
  typography: { primaryFont: 'font-stack', headingFont: 'font-stack', fontScaleRatio: 1.25 },
  geometry: { baseSpacingUnit: 16, baseBorderRadius: 8, shadowPreset: 'soft' }
}
```

#### 2. Asset Preparation
```bash
# Add theme images to public/ directory
public/
├── theme_logo.png
├── theme_hero_about.jpg
├── theme_hero_discovery.jpg
└── theme_hero_find.jpg

# CRITICAL: Commit assets immediately
git add public/theme_*
git commit -m "assets: add theme image files"
```

#### 3. Color Overrides
```typescript
// Add theme-specific overrides to THEME_COLOR_OVERRIDES
'new-theme': {
  // Fix common issues preemptively
  inputBg: '#your-input-bg',        // Not white!
  cardBg: '#your-card-bg',          // Not white!
  signOutButtonText: '#ffffff',     // If needed
  
  // Screen-specific headers
  aboutHeaderBackground: '#color',
  findRestaurantHeaderBackground: '#color',
  
  // Modal component theming (example: LoginForm)
  loginFormContainer: {
    backgroundColor: '#modal-bg',
    border: '2px solid #modal-border',
    boxShadow: '0 0 20px rgba(color, 0.3)',
    borderRadius: '8px',
    // Can include backgroundImage for patterns (e.g., argyle)
  },
  loginFormHeaderTitleColor: '#title-color',
  loginFormHeaderTitleTextShadow: '0 0 10px #glow-color', // For neon effects
  loginFormInputBackground: '#input-bg',
  loginFormInputBorder: '2px solid #input-border',
  loginFormSubmitButtonBackground: '#button-bg',
  loginFormSubmitButtonBoxShadow: '0 0 15px #button-glow',
  
  // Sort options theming (example: MenuScreen)
  menuSortOptionsContainer: {
    backgroundColor: '#sort-container-bg',
    border: '2px solid #sort-border',
    boxShadow: '0 0 15px rgba(color, 0.2)',
    borderRadius: '4px',
    // Can include backgroundImage for complex patterns
  },
  menuSortButtonDefault: {
    backgroundColor: '#button-default-bg',
    border: '2px solid #button-default-border',
    color: '#button-default-text',
  },
  menuSortButtonActive: {
    backgroundColor: '#button-active-bg',
    color: '#button-active-text',
    boxShadow: '0 0 10px rgba(color, 0.3)',
  },
  // ... etc
}
```

#### 4. Image Mapping
```typescript
// Add to CUSTOM_IMAGES
'new-theme': {
  logo: '/theme_logo.png',
  homeFindRestaurants: '/theme_home_find.jpg',    // Exact case match!
  discoveryHero: '/theme_discovery.jpg',
  // ... etc
}
```

#### 5. Theme Selector Integration
```typescript
// Add styling to ThemeSelector.tsx getThemeButtonStyle()
} else if (themeId === 'new-theme') {
  return {
    padding: SPACING[4],
    cursor: 'pointer',
    backgroundColor: '#base-color',
    // Add custom patterns if needed
    backgroundImage: 'pattern...',
    color: '#readable-text-color',    // Test readability!
    border: isSelected ? '3px solid #primary' : '2px solid #accent'
  };
}
```

#### 6. Testing Checklist
- [ ] Images appear on all screens
- [ ] Search bars use correct background colors  
- [ ] Text is readable on all backgrounds
- [ ] Theme selector card displays correctly
- [ ] Navigation modal works properly
- [ ] All screens have appropriate headers
- [ ] Production deployment includes assets

#### 7. Common Issues & Quick Fixes
1. **Images missing in production**: Check `git ls-files public/theme_*`
2. **Search bars wrong color**: Replace `theme.colors.white` with `theme.colors.inputBg`
3. **Text unreadable**: Reduce pattern opacity to 0.2-0.4
4. **Theme selector broken**: Add theme-specific styling logic

## Migration Guide

When updating existing components:

1. **Identify conditional logic**: Look for theme-specific conditions
2. **Create semantic tokens**: Add new tokens if needed  
3. **Replace conditions**: Use semantic tokens instead
4. **Test all themes**: Verify styling works in Victorian, 90s, AND new themes
5. **Update types**: Add tokens to ColorPalette interface if needed

## Troubleshooting

### Theme Not Updating
- Check that `useTheme()` hook is used correctly
- Verify component is wrapped in ThemeProvider
- Ensure semantic tokens exist in theme definition

### TypeScript Errors
- Add new semantic tokens to `ColorPalette` interface in `themes.ts`
- Verify token exists in both Victorian and 90s theme definitions
- Check spelling of semantic token names

### Images Not Showing in Production
**Symptom**: Images work locally but fail in deployed environment
**Causes & Solutions**:
1. **Untracked assets**: `git status` shows untracked `public/` files
   - **Fix**: `git add public/theme_assets*` and commit
2. **Case sensitivity**: `theme.images.hero: '/Hero.jpg'` but file is `hero.JPG`
   - **Fix**: Ensure exact case match between config and files
3. **Path mismatch**: Config uses `/cat_image.jpg` but file is in wrong location
   - **Fix**: Verify `public/` directory structure matches theme config

### Search Bars Showing Wrong Colors
**Symptom**: Search inputs show theme text color instead of expected background
**Cause**: Components using `theme.colors.white` for backgrounds
**Fix**: Replace with semantic tokens:
```typescript
// Change from:
backgroundColor: theme.colors.white
// To:
backgroundColor: theme.colors.inputBg
```

### Text Unreadable on Patterned Backgrounds
**Symptom**: Text disappears or hard to read on complex theme backgrounds
**Solutions**:
1. **Reduce pattern opacity**: Use `rgba()` with 0.2-0.4 alpha
2. **Increase text contrast**: Use darker text colors (`#482107` vs `#000000`)
3. **Add text shadows**: `textShadow: '1px 1px 2px rgba(0,0,0,0.5)'`

### CSS Patterns Not Rendering in React
**Symptom**: Complex gradients or patterns don't appear
**Cause**: React inline style limitations with complex CSS
**Fix**: Use template literals and break complex patterns into simpler parts:
```typescript
// Instead of one complex gradient, use simpler repeating patterns
backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(221, 90, 20, 0.3) 14px, rgba(221, 90, 20, 0.3) 16px)`
```

### Theme Selector Cards Not Styled Correctly
**Symptom**: Custom themes don't show properly in theme selector
**Cause**: ThemeSelector component needs theme-specific styling logic
**Fix**: Add conditional styling in `getThemeButtonStyle()`:
```typescript
if (themeId === 'your-theme') {
  return {
    backgroundImage: 'your-pattern',
    color: 'readable-text-color'
  };
}
```

### Modal Components Not Themed Correctly
**Symptom**: Modal components (like LoginForm) don't show theme-specific styling
**Common Causes & Solutions**:

1. **Missing semantic tokens**: Component uses hardcoded styles instead of theme tokens
   - **Fix**: Add component-specific semantic tokens to `THEME_COLOR_OVERRIDES`
   - **Example**: Add `loginFormContainer`, `loginFormInputBackground`, etc.

2. **Component not using theme functions**: Component still uses static `COMPONENT_STYLES`
   - **Fix**: Create theme-aware style functions that merge base styles with theme tokens
   ```typescript
   const getInputStyle = () => ({
     ...STYLES.input,
     ...(theme.colors.loginFormInputBackground && {
       backgroundColor: theme.colors.loginFormInputBackground,
     }),
   });
   ```

3. **Complex styling objects not applied**: Theme tokens for complex objects (like `loginFormContainer`) ignored
   - **Fix**: Use object spread to merge complex styling objects
   ```typescript
   const getContainerStyle = () => ({
     ...COMPONENT_STYLES.loginForm.container,
     ...(theme.colors.loginFormContainer || {}),
   });
   ```

4. **Pattern backgrounds not rendering**: Complex CSS patterns in React inline styles
   - **Fix**: Use template literals for `backgroundImage` patterns
   ```typescript
   backgroundImage: `
     repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(221, 90, 20, 0.1) 14px, rgba(221, 90, 20, 0.1) 16px),
     repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(238, 157, 42, 0.08) 14px, rgba(238, 157, 42, 0.08) 16px)
   `
   ```

### Styling Issues
- Use browser dev tools to inspect applied theme values
- Verify semantic token values in theme definitions
- Check for CSS specificity conflicts
- Test in multiple themes to ensure compatibility

## Future Development

The theme system is designed for scalability:
- **Unlimited themes**: Easy to add new themes via specifications
- **Automatic generation**: Theme engine creates all tokens automatically  
- **Component libraries**: Semantic tokens work with any UI framework
- **Design systems**: Tokens align with design system principles

For questions or theme-related issues, refer to the semantic token definitions in `ThemeContext.tsx` and ensure all new development follows the semantic token patterns established in this system.