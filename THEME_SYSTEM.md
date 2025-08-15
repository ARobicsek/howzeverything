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

## Migration Guide

When updating existing components:

1. **Identify conditional logic**: Look for theme-specific conditions
2. **Create semantic tokens**: Add new tokens if needed  
3. **Replace conditions**: Use semantic tokens instead
4. **Test both themes**: Verify styling works in both themes
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

### Styling Issues
- Use browser dev tools to inspect applied theme values
- Verify semantic token values in theme definitions
- Check for CSS specificity conflicts

## Future Development

The theme system is designed for scalability:
- **Unlimited themes**: Easy to add new themes via specifications
- **Automatic generation**: Theme engine creates all tokens automatically  
- **Component libraries**: Semantic tokens work with any UI framework
- **Design systems**: Tokens align with design system principles

For questions or theme-related issues, refer to the semantic token definitions in `ThemeContext.tsx` and ensure all new development follows the semantic token patterns established in this system.