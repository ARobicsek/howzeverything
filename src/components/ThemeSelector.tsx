// src/components/ThemeSelector.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SPACING, BORDERS, SHADOWS } from '../constants';

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
    marginBottom: SPACING[4],
    textAlign: 'center',
  };

  const optionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING[3],
  };

  const optionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: SPACING[3],
    borderRadius: BORDERS.radius.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `2px solid transparent`,
  };

  const getOptionStyle = (themeId: string): React.CSSProperties => ({
    ...optionStyle,
    backgroundColor: currentTheme === themeId ? theme.colors.primaryLight : theme.colors.gray50,
    borderColor: currentTheme === themeId ? theme.colors.primary : 'transparent',
    // Add theme-specific hover effects via CSS custom properties
    ...(theme.id === '90s' ? {
      // 90s theme: neon glow on hover
      boxShadow: currentTheme === themeId 
        ? `0 0 15px ${theme.colors.primary}, 0 0 30px ${theme.colors.accent}`
        : 'none',
    } : {
      // Victorian theme: subtle shadow on hover
      boxShadow: currentTheme === themeId ? SHADOWS.medium : 'none',
    }),
  });

  const radioStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: `2px solid ${theme.colors.primary}`,
    backgroundColor: theme.colors.white,
    marginRight: SPACING[3],
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const checkedDotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
  };

  const labelStyle: React.CSSProperties = {
    ...theme.fonts.body,
    fontSize: '1rem',
    color: theme.colors.gray900,
    fontWeight: '500',
  };

  const descriptionStyle: React.CSSProperties = {
    ...theme.fonts.body,
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    marginTop: SPACING[1],
  };

  return (
    <div style={selectorStyle}>
      <h3 style={headerStyle}>Choose Your Theme</h3>
      <div style={optionsContainerStyle}>
        {availableThemes.map((themeOption) => (
          <div 
            key={themeOption.id}
            style={getOptionStyle(themeOption.id)}
            onClick={() => switchTheme(themeOption.id)}
          >
            <div style={radioStyle}>
              {currentTheme === themeOption.id && <div style={checkedDotStyle} />}
            </div>
            <div>
              <div style={labelStyle}>{themeOption.name}</div>
              <div style={descriptionStyle}>
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