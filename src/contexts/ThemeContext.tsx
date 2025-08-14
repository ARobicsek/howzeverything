// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { THEMES, ColorPalette } from '../styles/themes';

// Basic theme interface for Phase 1
export interface Theme {
  id: string;
  name: string;
  colors: ColorPalette;
  fonts: {
    primary: React.CSSProperties;
    heading: React.CSSProperties;
    body: React.CSSProperties;
    elegant: React.CSSProperties;
  };
  images: { [key: string]: string };
  effects: {
    primaryButtonHover: React.CSSProperties;
    cardHover: React.CSSProperties;
    glowEffect: React.CSSProperties;
  };
}

export interface ThemeContextType {
  currentTheme: string;
  theme: Theme;
  availableThemes: Theme[];
  switchTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme definitions - Phase 1 simple structure
const THEME_DEFINITIONS: { [key: string]: Theme } = {
  victorian: {
    id: 'victorian',
    name: 'Nouveau Victorian',
    colors: THEMES.default, // Victorian theme colors
    fonts: {
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
      },
    },
    images: {
      logo: '/HowzEverything.png',
      homeHero: '/critic_2.png',
      homeExplorer: '/explorer_2.png',
      discoveryHero: '/stolen_dish.png',
      findRestaurantHero: '/finding_restaurant.png',
      ratingsHero: '/my_ratings.png',
      aboutHero: '/ordering.png',
      restaurantIllustration: '/victorian_restaurant2.png',
    },
    effects: {
      primaryButtonHover: {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
      },
      cardHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      glowEffect: {
        // No glow for Victorian theme
      },
    },
  },
  '90s': {
    id: '90s',
    name: 'Neon 90s',
    colors: THEMES['90s'], // 90s theme colors
    fonts: {
      primary: {
        fontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
        letterSpacing: '0.05em',
        textShadow: '0 0 5px rgba(255, 0, 255, 0.5)',
      },
      heading: {
        fontFamily: '"Impact", "Arial Black", "Helvetica Inserat", fantasy',
        fontWeight: '900',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
      },
      body: {
        fontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
        lineHeight: '1.6',
        letterSpacing: '0.02em',
      },
      elegant: {
        fontFamily: '"Courier New", "Monaco", "Lucida Console", monospace',
        letterSpacing: '0.05em',
        textShadow: '0 0 3px rgba(255, 0, 255, 0.3)',
      },
    },
    images: {
      logo: '/90s logo.png',
      homeHero: '/90s critic.png',
      homeExplorer: '/90s explorer.png',
      discoveryHero: '/90s discover.png',
      findRestaurantHero: '/90s find restaurant.png',
      ratingsHero: '/90s judge.png',
      aboutHero: '/90s about us.png',
      restaurantIllustration: '/90s find restaurant.png', // Reuse for now
    },
    effects: {
      primaryButtonHover: {
        transform: 'translateY(-1px) scale(1.02)',
        boxShadow: `0 0 20px rgba(255, 0, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)`,
      },
      cardHover: {
        transform: 'translateY(-3px)',
        boxShadow: `0 0 25px rgba(255, 0, 255, 0.4), 0 0 50px rgba(0, 255, 255, 0.2)`,
      },
      glowEffect: {
        boxShadow: `0 0 15px rgba(255, 0, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3)`,
      },
    },
  },
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or default to victorian
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('howzeverything-theme');
    return savedTheme && THEME_DEFINITIONS[savedTheme] ? savedTheme : 'victorian';
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('howzeverything-theme', currentTheme);
  }, [currentTheme]);

  const switchTheme = (themeId: string) => {
    if (THEME_DEFINITIONS[themeId]) {
      setCurrentTheme(themeId);
    } else {
      console.warn(`Theme '${themeId}' not found. Available themes:`, Object.keys(THEME_DEFINITIONS));
    }
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    theme: THEME_DEFINITIONS[currentTheme],
    availableThemes: Object.values(THEME_DEFINITIONS),
    switchTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};