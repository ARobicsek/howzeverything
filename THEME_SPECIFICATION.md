# Theme Specification Template

This document defines the minimal specification required to create a new theme for HowzEverything. Designers need only provide the core elements below, and the theme engine will automatically generate the complete theme definition.

## Specification Format

### Basic Information
```typescript
{
  id: string;           // kebab-case identifier (e.g., "grumpy-cat")
  name: string;         // Display name (e.g., "Grumpy Cat")
  description: string;  // Brief theme description
}
```

### Core Colors (4 Required)
The engine generates 70+ color variants from these 4 base colors:

```typescript
colors: {
  primary: string;     // Main action color (buttons, links, highlights)
  surface: string;     // Background and card colors  
  text: string;        // Primary text color
  accent: string;      // Secondary highlights, special elements
}
```

### Typography (3 Properties)
```typescript
typography: {
  primaryFont: string;      // Main body text font stack
  headingFont: string;      // Header and title font stack  
  fontScaleRatio: number;   // Size relationship (1.125 = minor third, 1.2 = major third)
}
```

### Visual Geometry (3 Properties)
```typescript
geometry: {
  baseSpacingUnit: number;              // Base spacing in pixels (generates full scale)
  baseBorderRadius: number;             // Base border radius in pixels
  shadowPreset: 'soft' | 'sharp' | 'glow';  // Shadow style approach
}
```

## Complete Example Specifications

### Victorian Theme Specification
```typescript
const victorianSpec = {
  id: 'victorian',
  name: 'Nouveau Victorian',
  description: 'Elegant and refined with classic sensibilities',
  colors: {
    primary: '#2563EB',    // Royal blue
    surface: '#F9FAFB',    // Light gray
    text: '#374151',       // Dark gray
    accent: '#642e32',     // Deep burgundy
  },
  typography: {
    primaryFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headingFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontScaleRatio: 1.25,  // Perfect fourth scale
  },
  geometry: {
    baseSpacingUnit: 16,      // 1rem base
    baseBorderRadius: 8,      // Moderate rounded corners
    shadowPreset: 'soft',     // Subtle, refined shadows
  },
};
```

### 90s Theme Specification  
```typescript
const ninetiesSpec = {
  id: '90s',
  name: 'Neon 90s',
  description: 'Electric cyberpunk aesthetics with neon colors',
  colors: {
    primary: '#FF00FF',    // Electric magenta
    surface: '#0D0515',    // Very dark purple
    text: '#fecd06',       // Electric yellow
    accent: '#00FFFF',     // Electric cyan
  },
  typography: {
    primaryFont: '"Courier New", "Monaco", "Lucida Console", monospace',
    headingFont: '"Impact", "Arial Black", "Helvetica Inserat", fantasy',
    fontScaleRatio: 1.3,   // Aggressive scale for impact
  },
  geometry: {
    baseSpacingUnit: 16,      // Same base for consistency
    baseBorderRadius: 0,      // Sharp, angular edges
    shadowPreset: 'glow',     // Neon glow effects
  },
};
```

### Grumpy Cat Theme Specification (Example)
```typescript
const grumpyCatSpec = {
  id: 'grumpy-cat',
  name: 'Grumpy Cat',
  description: 'Moody and sarcastic with earthy tones',
  colors: {
    primary: '#8B4513',    // Saddle brown
    surface: '#F5F5DC',    // Beige
    text: '#2F4F4F',       // Dark slate gray
    accent: '#CD853F',     // Peru orange
  },
  typography: {
    primaryFont: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive',
    headingFont: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive',
    fontScaleRatio: 1.2,   // Major third for playful hierarchy
  },
  geometry: {
    baseSpacingUnit: 20,      // Looser spacing for relaxed feel
    baseBorderRadius: 16,     // Very rounded for friendly appearance
    shadowPreset: 'soft',     // Gentle, non-aggressive shadows
  },
};
```

## How the Engine Uses This Specification

### Color Generation
From the 4 core colors, the engine automatically generates:
- **Primary variants**: hover states, light versions, transparencies
- **Gray scale**: 9 shades derived from text/surface colors
- **Semantic colors**: success, warning, danger, info
- **Component colors**: navigation, ratings, borders, shadows
- **Accessibility**: Ensures proper contrast ratios

### Typography Generation  
From the 3 typography properties, the engine creates:
- **Font objects**: Primary, heading, body, elegant variants with proper CSS
- **Type scale**: h1, h2, h3, body, caption based on fontScaleRatio
- **Text effects**: Shadows, letter spacing, transforms based on theme style

### Geometry & Effects Generation
From the 3 geometry properties, the engine generates:
- **Spacing scale**: Full spacing system based on baseSpacingUnit
- **Border radius scale**: Small, medium, large variants
- **Shadow system**: Coordinated shadows matching the preset
- **Animation timing**: Speeds that match the theme's energy

### Asset Path Resolution
The engine automatically resolves image paths based on theme ID:
```typescript
images: {
  logo: `/themes/${spec.id}/logo.png`,
  homeFindRestaurants: `/themes/${spec.id}/home-find-restaurants.png`,
  homeDiscoverDishes: `/themes/${spec.id}/home-discover-dishes.png`,
  findRestaurantHero: `/themes/${spec.id}/find-restaurant-hero.png`,
  aboutHero: `/themes/${spec.id}/about-hero.png`,
  discoveryHero: `/themes/${spec.id}/discovery-hero.png`,
  ratingsHero: `/themes/${spec.id}/ratings-hero.png`,
  restaurantDefault: `/themes/${spec.id}/restaurant-default.png`,
}
```

## Required Assets (8 Images)

Each theme requires exactly 8 images placed in `/public/themes/{theme-id}/`:

1. **logo.png** - Theme-appropriate logo variation
2. **home-find-restaurants.png** - Home screen "Find restaurants" card illustration  
3. **home-discover-dishes.png** - Home screen "Discover dishes" card illustration
4. **find-restaurant-hero.png** - Find restaurant screen header image
5. **about-hero.png** - About page header image  
6. **discovery-hero.png** - Discovery screen header image
7. **ratings-hero.png** - My ratings screen header image
8. **restaurant-default.png** - Default restaurant placeholder image

### Image Requirements
- **Format**: PNG (with transparency) or JPG
- **Logo**: 200x200px maximum, transparent background preferred
- **Heroes**: 400x400px maximum, square aspect ratio
- **Style**: All images should share consistent artistic style
- **Content**: Theme-appropriate but recognizable functionality

## Validation Checklist

Before implementing a theme specification:

### Color Requirements
- [ ] All 4 colors provided in valid hex format
- [ ] Primary and accent colors have sufficient contrast with surface
- [ ] Text color has adequate contrast ratio (4.5:1 minimum) with surface
- [ ] Colors create cohesive, harmonious palette

### Typography Requirements  
- [ ] Primary font stack includes web-safe fallbacks
- [ ] Heading font stack includes web-safe fallbacks
- [ ] Font scale ratio between 1.125 (minor third) and 1.414 (√2)
- [ ] Fonts are available or have good fallback chains

### Asset Requirements
- [ ] All 8 required images provided
- [ ] Images follow naming convention exactly
- [ ] Images are appropriate resolution and format
- [ ] Visual style is consistent across all images
- [ ] No copyrighted content without permission

### Accessibility Requirements
- [ ] Color contrast ratios meet WCAG AA standards
- [ ] Theme works for users with color vision differences
- [ ] Fonts are readable at all required sizes
- [ ] Interactive elements have sufficient contrast

---

This specification format reduces theme creation from a complex 1000+ line definition to a simple 20-line specification that captures the theme's essence while letting the engine handle all the technical complexity.