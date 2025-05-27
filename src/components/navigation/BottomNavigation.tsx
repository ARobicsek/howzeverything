import React from 'react';
import { COLORS } from '../../constants';

type AppScreenType = 'home' | 'restaurants' | 'ratings' | 'profile' | 'menu';
type NavigableScreenType = 'home' | 'restaurants' | 'ratings' | 'profile';

interface BottomNavigationProps {
  onNav: (screen: NavigableScreenType) => void;
  activeScreenValue: AppScreenType;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onNav, activeScreenValue }) => {
  const navItems = [
    { icon: 'home', label: 'Home', screen: 'home' as const },
    { icon: 'restaurant', label: 'Restaurants', screen: 'restaurants' as const },
    { icon: 'star', label: 'Ratings', screen: 'ratings' as const },
    { icon: 'user', label: 'Profile', screen: 'profile' as const }
  ];

  const getIconSrc = (icon: string) => {
    switch (icon) {
      case 'home': return '/icon-home.PNG';
      case 'restaurant': return '/icon-restaurants.PNG';
      case 'star': return '/icon-ratings.PNG';
      case 'user': return '/icon-profile.PNG';
      default: return '';
    }
  };

  let currentTabActive: NavigableScreenType;
  if (activeScreenValue === 'menu') {
    currentTabActive = 'restaurants';
  } else {
    currentTabActive = activeScreenValue as NavigableScreenType;
  }

  const navHorizontalPadding = '10px';
  const navBottomPadding = '10px';

  return (
    <nav
      style={{
        position: 'fixed',
        left: navHorizontalPadding,
        right: navHorizontalPadding,
        bottom: navBottomPadding,
        backgroundColor: COLORS.navBar,
        backdropFilter: 'blur(4px)',
        borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: '12px',
        zIndex: 20,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <div
        className="w-full flex items-center justify-around"
        style={{ padding: '8px 0' }}
      >
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => onNav(item.screen)}
            className={`rounded-full transition-colors focus:outline-none
              ${
                currentTabActive === item.screen
                  ? 'bg-white/30'
                  : 'hover:bg-white/20 focus:bg-white/10'
              }
            `}
            style={{
              padding: '12px',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label={item.label}
          >
            <img
              src={getIconSrc(item.icon)}
              alt=""
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                maxWidth: '40px',
                maxHeight: '40px',
                objectFit: 'contain',
                display: 'block',
                transform: 'scale(4.0)',
                transformOrigin: 'center',
              }}
            />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
export type { AppScreenType, NavigableScreenType };