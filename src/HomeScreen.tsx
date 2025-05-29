// HomeScreen.tsx
import React from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import type { NavigableScreenType, AppScreenType } from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants';

interface HomeScreenProps {
  onNavigateToScreen: (screen: NavigableScreenType) => void;
  currentAppScreen: AppScreenType;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToScreen, currentAppScreen }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
            Howzeverything
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-8">
          {/* Logo Section */}
          <div className="flex justify-center" style={{ marginTop: '32px' }}>
            <img
              src="/logo.png"
              alt="Howzeverything Logo"
              className="mx-auto"
              style={{ 
                width: '10rem', 
                height: '10rem', 
                maxWidth: '160px',
                display: 'block'
              }}
            />
          </div>

          {/* Action Button Section */}
          <div className="flex justify-center">
            <button
              onClick={() => onNavigateToScreen('restaurants')}
              className="transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
              style={{
                ...STYLES.primaryButton,
                background: 'white',
                color: COLORS.textDark,
                fontSize: '1.125rem',
                fontWeight: '300',
                maxWidth: '280px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'white';
              }}
            >
              Find or Add a Restaurant
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNav={onNavigateToScreen} 
        activeScreenValue={currentAppScreen} 
      />
    </div>
  );
};

export default HomeScreen;