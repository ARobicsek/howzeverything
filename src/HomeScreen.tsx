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
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-center">
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
          </h1>
        </div>
      </header>

      <main className="flex-1 px-6 py-6" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-full py-8">
          <div className="mb-12">
            <img
              src="/logo.png"
              alt="Howzeverything Logo"
              className="mx-auto"
              style={{ width: '10rem', height: '10rem', maxWidth: '160px' }}
            />
          </div>
          <button
            className="bg-white text-gray-800 px-8 py-4 rounded-2xl text-lg font-light shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
            style={{
              background: 'white',
              color: COLORS.textDark,
              padding: '1rem 2rem',
              borderRadius: '1rem',
              fontSize: '1.125rem',
              fontWeight: '300',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              maxWidth: '280px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'white';
            }}
            onClick={() => onNavigateToScreen('restaurants')}
          >
            Begin Your Journey
          </button>
        </div>
      </main>
      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
    </div>
  );
};

export default HomeScreen;