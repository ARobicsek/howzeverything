// src/components/ThemeSelector.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SPACING, BORDERS, SHADOWS } from '../constants';
import { THEMES } from '../styles/themes';

const ThemeSelector: React.FC = () => {
  const { currentTheme, availableThemes, switchTheme, theme } = useTheme();

  const selectorStyle: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    borderRadius: BORDERS.radius.large,
    padding: SPACING[6],
    boxShadow: SHADOWS.large,
    border: `1px solid ${theme.colors.gray200}`,
    marginBottom: SPACING[6],
  };

  const headerStyle: React.CSSProperties = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '600',
    letterSpacing: '-0.025em',
    fontSize: '1.25rem',
    color: '#111827', // Always black regardless of theme
    marginBottom: SPACING[6],
    textAlign: 'center',
  };

  const optionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING[4],
  };

  // Helper function to get theme-specific styles for each button
  const getThemeButtonStyle = (themeId: string): React.CSSProperties => {
    const isSelected = currentTheme === themeId;
    const themeData = THEMES[themeId === 'victorian' ? 'default' : themeId];
    
    if (themeId === 'victorian') {
      return {
        padding: SPACING[4],
        borderRadius: BORDERS.radius.medium,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: themeData.accent,
        border: isSelected 
          ? `3px solid ${themeData.primary}` 
          : `2px solid ${themeData.gray300}`,
        boxShadow: isSelected 
          ? `0 4px 12px rgba(37, 99, 235, 0.3)` 
          : '0 2px 6px rgba(0, 0, 0, 0.1)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      };
    } else if (themeId === '90s') {
      return {
        padding: SPACING[4],
        borderRadius: BORDERS.radius.medium,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: themeData.cardBg,
        border: isSelected 
          ? `3px solid ${themeData.primary}` 
          : `2px solid ${themeData.accent}`,
        boxShadow: isSelected 
          ? `0 0 20px ${themeData.primary}, 0 0 40px ${themeData.accent}` 
          : `0 0 8px ${themeData.accent}`,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      };
    } else if (themeId === 'grumpy-cat') {
      return {
        padding: SPACING[4],
        borderRadius: '4px', // Use custom border radius
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        // Argyle pattern using overlapping diagonal stripes (faded for better text readability)
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(221, 90, 20, 0.3) 14px, rgba(221, 90, 20, 0.3) 16px),
          repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(238, 157, 42, 0.25) 14px, rgba(238, 157, 42, 0.25) 16px)
        `,
        backgroundColor: '#fbeedd', // Cream base color
        border: isSelected 
          ? `3px solid #dd5a14` 
          : `2px solid #ee9d2a`,
        boxShadow: isSelected 
          ? `0 4px 12px rgba(221, 90, 20, 0.3)` 
          : '0 2px 6px rgba(238, 157, 42, 0.2)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      };
    } else if (themeId === 'copenhagen') {
      return {
        padding: SPACING[4],
        borderRadius: '4px', // Subtle rounded corners matching theme geometry
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: '#f6f5f1', // Warm cream surface
        // Elegant Nordic-inspired subtle texture using minimal linear gradients
        backgroundImage: `
          linear-gradient(135deg, rgba(38, 55, 69, 0.03) 0%, transparent 50%, rgba(139, 111, 71, 0.02) 100%),
          linear-gradient(45deg, rgba(38, 55, 69, 0.01) 25%, transparent 25%, transparent 75%, rgba(38, 55, 69, 0.01) 75%),
          linear-gradient(-45deg, rgba(38, 55, 69, 0.01) 25%, transparent 25%, transparent 75%, rgba(38, 55, 69, 0.01) 75%)
        `,
        backgroundSize: '100% 100%, 20px 20px, 20px 20px',
        border: isSelected 
          ? `2px solid #263745` // Deep charcoal blue for selected
          : `1px solid #8B6F47`, // Muted brass for unselected
        boxShadow: isSelected 
          ? `0 4px 16px rgba(38, 55, 69, 0.15), 0 2px 6px rgba(139, 111, 71, 0.1)` 
          : '0 2px 8px rgba(38, 55, 69, 0.08)',
        transform: isSelected ? 'scale(1.01)' : 'scale(1)', // Subtle scale for elegant feel
      };
    }
    return {};
  };

  const getThemeTextStyle = (themeId: string): React.CSSProperties => {
    const themeData = THEMES[themeId === 'victorian' ? 'default' : themeId];
    
    if (themeId === 'victorian') {
      return {
        fontFamily: '"Pinyon Script", cursive',
        fontSize: '1.5rem',
        fontWeight: '400',
        color: themeData.white,
        marginBottom: SPACING[2],
      };
    } else if (themeId === '90s') {
      return {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '1.125rem',
        fontWeight: '900',
        color: themeData.text,
        textShadow: '0 0 10px #fecd06, 0 0 20px #fecd06',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: SPACING[2],
      };
    } else if (themeId === 'grumpy-cat') {
      return {
        fontFamily: 'Comfortaa, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#482107', // Dark brown to match hero image borders
        marginBottom: SPACING[2],
      };
    } else if (themeId === 'copenhagen') {
      return {
        fontFamily: '"Playfair Display", Georgia, serif', // Elegant serif for headings
        fontSize: '1.375rem',
        fontWeight: '600',
        color: '#263745', // Deep charcoal blue
        letterSpacing: '-0.025em',
        marginBottom: SPACING[2],
      };
    }
    return {};
  };

  const getThemeDescriptionStyle = (themeId: string): React.CSSProperties => {
    const themeData = THEMES[themeId === 'victorian' ? 'default' : themeId];
    
    if (themeId === 'victorian') {
      return {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '0.875rem',
        color: themeData.white,
        lineHeight: '1.4',
      };
    } else if (themeId === '90s') {
      return {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '0.875rem',
        color: themeData.textSecondary,
        lineHeight: '1.4',
      };
    } else if (themeId === 'grumpy-cat') {
      return {
        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '0.875rem',
        color: '#482107', // Dark brown to match hero image borders
        lineHeight: '1.4',
      };
    } else if (themeId === 'copenhagen') {
      return {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif', // Clean sans-serif for body text
        fontSize: '0.875rem',
        color: '#1A1A1A', // Rich near-black text
        lineHeight: '1.5',
        letterSpacing: '0.01em',
      };
    }
    return {};
  };

  const getSelectedIndicator = (themeId: string): React.ReactNode => {
    const isSelected = currentTheme === themeId;
    if (!isSelected) return null;

    if (themeId === 'victorian') {
      return (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          backgroundColor: THEMES.default.primary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ✓
        </div>
      );
    } else if (themeId === '90s') {
      return (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          backgroundColor: THEMES['90s'].primary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 0 15px #FF00FF'
        }}>
          ✓
        </div>
      );
    } else if (themeId === 'grumpy-cat') {
      return (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          backgroundColor: '#dd5a14', // Primary grumpy cat color
          borderRadius: '4px', // Match theme border radius
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ✓
        </div>
      );
    } else if (themeId === 'copenhagen') {
      return (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          backgroundColor: '#263745', // Deep charcoal blue
          borderRadius: '4px', // Subtle rounded corners
          border: '1px solid #8B6F47', // Brass accent border
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f6f5f1', // Cream text
          fontSize: '12px',
          fontWeight: '600'
        }}>
          ✓
        </div>
      );
    }
    return null;
  };

  return (
    <div style={selectorStyle}>
      <h3 style={headerStyle}>Choose Your Theme</h3>
      <div style={optionsContainerStyle}>
        {availableThemes.map((themeOption) => (
          <div 
            key={themeOption.id}
            style={{
              ...getThemeButtonStyle(themeOption.id),
              position: 'relative',
            }}
            onClick={() => switchTheme(themeOption.id)}
          >
            {getSelectedIndicator(themeOption.id)}
            <div>
              <div style={getThemeTextStyle(themeOption.id)}>
                {themeOption.name}
              </div>
              <div style={getThemeDescriptionStyle(themeOption.id)}>
                {themeOption.id === 'victorian' 
                  ? 'Classic elegance with refined typography and subtle shadows'
                  : themeOption.id === '90s'
                  ? 'Bold neon colors with retro fonts and electric effects'
                  : themeOption.description
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;