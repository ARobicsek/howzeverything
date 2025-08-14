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
    ...theme.fonts.heading,
    fontSize: '1.25rem',
    color: theme.colors.gray900,
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
        backgroundColor: themeData.white,
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
    }
    return {};
  };

  const getThemeTextStyle = (themeId: string): React.CSSProperties => {
    const themeData = THEMES[themeId === 'victorian' ? 'default' : themeId];
    
    if (themeId === 'victorian') {
      return {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '1.125rem',
        fontWeight: '600',
        color: themeData.gray900,
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
    }
    return {};
  };

  const getThemeDescriptionStyle = (themeId: string): React.CSSProperties => {
    const themeData = THEMES[themeId === 'victorian' ? 'default' : themeId];
    
    if (themeId === 'victorian') {
      return {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '0.875rem',
        color: themeData.textSecondary,
        lineHeight: '1.4',
      };
    } else if (themeId === '90s') {
      return {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '0.875rem',
        color: themeData.textSecondary,
        lineHeight: '1.4',
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
                  : 'Bold neon colors with retro fonts and electric effects'
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