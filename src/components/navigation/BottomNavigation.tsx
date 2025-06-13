// src/components/navigation/BottomNavigation.tsx
import React from 'react';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';

type AppScreenType = 'home' | 'restaurants' | 'ratings' | 'profile' | 'menu';
type NavigableScreenType = 'home' | 'restaurants' | 'ratings' | 'profile';

interface BottomNavigationProps {
  onNav: (screen: NavigableScreenType) => void;
  activeScreenValue: AppScreenType;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onNav, activeScreenValue }) => {
  const navItems = [
    { 
      icon: 'home', 
      label: 'Home', 
      screen: 'home' as const,
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    { 
      icon: 'restaurant', 
      label: 'Restaurants', 
      screen: 'restaurants' as const,
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
        </svg>
      )
    },
    { 
      icon: 'star', 
      label: 'Ratings', 
      screen: 'ratings' as const,
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      )
    },
    { 
      icon: 'user', 
      label: 'Profile', 
      screen: 'profile' as const,
      svg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    }
  ];

  let currentTabActive: NavigableScreenType;
  if (activeScreenValue === 'menu') {
    currentTabActive = 'restaurants';
  } else {
    currentTabActive = activeScreenValue as NavigableScreenType;
  }

  return (
    <nav
      style={{
        position: 'fixed',
        left: SPACING[4],
        right: SPACING[4],
        bottom: SPACING[4],
        backgroundColor: COLORS.white,
        borderRadius: STYLES.borderRadiusLarge,
        boxShadow: STYLES.shadowLarge,
        border: `1px solid ${COLORS.gray200}`,
        zIndex: 50,
        overflow: 'hidden'
      }}
    >
      <div
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: `${SPACING[2]} 0`
        }}
      >
        {navItems.map((item) => {
          const isActive = currentTabActive === item.screen;
          
          return (
            <button
              key={item.screen}
              onClick={() => onNav(item.screen)}
              style={{
                position: 'relative',
                padding: `${SPACING[3]} ${SPACING[4]}`,
                minWidth: '72px',
                height: '56px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING[1],
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: STYLES.borderRadiusMedium,
                overflow: 'visible'
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '3px',
                    backgroundColor: COLORS.primary,
                    borderRadius: '0 0 3px 3px'
                  }}
                />
              )}
              
              {/* Icon */}
              <div
                style={{
                  color: isActive ? COLORS.primary : COLORS.gray500,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.svg}
              </div>
              
              {/* Label */}
              <span
                style={{
                  ...FONTS.body,
                  fontSize: '0.625rem', // 10px
                  fontWeight: isActive ? TYPOGRAPHY.semibold : TYPOGRAPHY.normal,
                  color: isActive ? COLORS.primary : COLORS.gray500,
                  letterSpacing: '0.02em'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
export type { AppScreenType, NavigableScreenType };
