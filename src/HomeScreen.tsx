// src/HomeScreen.tsx - Recommended clean typography approach
import React from 'react';
import type { AppScreenType, NavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import { COLORS, FONTS, SIZES, STYLES } from './constants';

interface HomeScreenProps {    
  onNavigateToScreen: (screen: NavigableScreenType) => void;    
  currentAppScreen: AppScreenType;    
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToScreen, currentAppScreen }) => {    
  return (    
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>    
      {/* Main Content */}    
      <main    
        className="flex-1 px-4 sm:px-6 flex flex-col items-center"    
        style={{    
          paddingTop: SIZES['3xl'],    
          paddingBottom: STYLES.mainContentPadding    
        }}    
      >    
        <div className="max-w-md mx-auto w-full text-center flex flex-col items-center">    
          {/* Logo Section */}    
          <div className="flex justify-center" style={{ marginBottom: SIZES.lg }}>    
            <img    
              src="/logo.png"    
              alt="Howzeverything Logo"    
              style={{    
                maxWidth: '180px',    
                height: 'auto',        
              }}    
            />    
          </div>

          {/* Hero Typography Tagline */}
          <div style={{
            maxWidth: '320px',
            margin: '0 auto',
            marginTop: SIZES.md
          }}>
            <h2 style={{
              ...FONTS.elegant,
              fontSize: '1.5rem',
              fontWeight: '300', // Light weight for elegance
              color: COLORS.text,
              lineHeight: '1.4',
              margin: 0,
              letterSpacing: '0.5px'
            }}>
              Rate and discover
            </h2>
            <h2 style={{
              ...FONTS.elegant,
              fontSize: '1.5rem',
              fontWeight: '600', // Bold for emphasis on key phrase
              color: COLORS.primary,
              lineHeight: '1.4',
              margin: 0,
              marginTop: '4px',
              letterSpacing: '0.5px'
            }}>
              great dishes
            </h2>
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