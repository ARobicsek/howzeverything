# HowzEverything Style Guide

This document outlines the conventions and best practices for styling components in the HowzEverything application. The goal of our styling system is to be centralized, consistent, and easy to maintain.

## Guiding Principle: Centralization

All styles should be defined in `src/constants.ts`. Avoid using inline `style={{...}}` attributes or defining style objects directly within component files. This centralization allows us to manage the app's entire design system from a single source of truth.

## Core Style Files

-   **`src/constants.ts`**: The master file for all application styles. It contains design tokens, component-specific styles, layout styles, utility classes, and dynamic style functions.
-   **`src/styles/themes.ts`**: Defines theme objects, primarily for color palettes. Currently, it holds the `default` theme. This file is imported by `constants.ts`.

## How to Add or Modify Styles

### 1. Naming Conventions

-   **Component Styles**: Style objects for specific components are stored in `COMPONENT_STYLES`. Use camelCase for the component name (e.g., `COMPONENT_STYLES.restaurantCard`).
-   **Screen Styles**: Styles for top-level screen components are in `SCREEN_STYLES` (e.g., `SCREEN_STYLES.menu`).
-   **Layout Styles**: Broadly reusable layout patterns go into `LAYOUT_STYLES` (e.g., `LAYOUT_STYLES.container`).
-   **Style Properties**: Use camelCase for all CSS properties (e.g., `backgroundColor`, `borderRadius`).

### 2. Adding a New Style for a Component

1.  **Identify the Component**: Let's say you're styling a new `UserProfileBadge.tsx` component.
2.  **Open `src/constants.ts`**: Navigate to the `COMPONENT_STYLES` object.
3.  **Add a New Entry**: Create a new key for your component, `userProfileBadge`, and define the style objects for its elements.

    ```typescript
    // in src/constants.ts
    export const COMPONENT_STYLES = {
      // ... other components
      userProfileBadge: {
        container: {
          padding: `${SPACING[1]} ${SPACING[2]}`,
          backgroundColor: COLORS.primaryLight,
          borderRadius: BORDERS.radius.small,
          // ...
        },
        text: {
          ...TYPOGRAPHY.caption,
          color: COLORS.primary,
          fontWeight: TYPOGRAPHY.semibold,
        }
      }
    };
    ```

4.  **Use in Component**: Import the style object and apply it.

    ```tsx
    // in src/components/UserProfileBadge.tsx
    import { COMPONENT_STYLES } from '../constants';

    const UserProfileBadge = ({ text }) => (
      <div style={COMPONENT_STYLES.userProfileBadge.container}>
        <span style={COMPONENT_STYLES.userProfileBadge.text}>{text}</span>
      </div>
    );
    ```

### 3. Using Utilities vs. Component Styles

-   **Use `UTILITIES` for generic, single-purpose patterns**: If you find yourself repeatedly writing `{ display: 'flex', alignItems: 'center' }`, use `UTILITIES.flexCenter` instead. Utilities are great for layout and alignment.
-   **Use `COMPONENT_STYLES` for styles specific to one component**: A component's unique padding, color, and font styles belong in its own style object. This keeps the component's styling self-contained and easy to find.

    **Good Example (Combining Both):**
    ```typescript
    // in src/constants.ts
    COMPONENT_STYLES.someComponent = {
      container: {
        ...UTILITIES.flexBetween, // Use a utility for layout
        padding: SPACING[4],      // Add component-specific spacing
        backgroundColor: COLORS.cardBg, // Add component-specific color
      }
    }
    ```

### 4. Handling Dynamic Styles

When a style needs to change based on a component's props or state (e.g., a button's color when disabled), create a function for it in `STYLE_FUNCTIONS`.

1.  **Open `src/constants.ts`**: Navigate to the `STYLE_FUNCTIONS` object.
2.  **Create a New Function**: The function should accept the dynamic value (e.g., `isDisabled: boolean`) as an argument and return a style object.

    ```typescript
    // in src/constants.ts
    export const STYLE_FUNCTIONS = {
      // ... other functions
      getButtonStyle: (isDisabled: boolean) => ({
        ...STYLES.primaryButton, // Base styles
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        backgroundColor: isDisabled ? COLORS.gray300 : COLORS.primary,
      }),
    };
    ```

3.  **Use in Component**: Import the function and call it with the relevant state or prop.

    ```tsx
    // in some button component
    import { STYLE_FUNCTIONS } from '../constants';

    const MyButton = ({ isDisabled, children }) => {
      const buttonStyle = STYLE_FUNCTIONS.getButtonStyle(isDisabled);

      return (
        <button style={buttonStyle} disabled={isDisabled}>
          {children}
        </button>
      );
    };
    ```

By following these guidelines, we can maintain a clean, scalable, and highly manageable styling architecture.
