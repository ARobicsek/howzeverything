// src/HomeScreen.tsx  
import React from 'react';
import type { AppScreenType, NavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import { COLORS, SIZES, STYLES } from './constants'; // FONTS removed as it's unused

interface HomeScreenProps {  
  onNavigateToScreen: (screen: NavigableScreenType) => void;  
  currentAppScreen: AppScreenType;  
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToScreen, currentAppScreen }) => {  
  return (  
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>  
      {/* Header Removed */}

      {/* Main Content */}  
      <main  
        className="flex-1 px-4 sm:px-6 flex flex-col items-center"  
        style={{  
          paddingTop: SIZES['3xl'],  
          paddingBottom: STYLES.mainContentPadding  
        }}  
      >  
        <div className="max-w-md mx-auto w-full text-center flex flex-col items-center" style={{ gap: SIZES['2xl'] /* Space between logo and button */ }}>  
          {/* Logo Section - Moved to top, increased size slightly */}  
          <div className="flex justify-center">  
            <img  
              src="/logo.png"  
              alt="Howzeverything Logo"  
              style={{  
                maxWidth: '180px',  
                height: 'auto',      
              }}  
            />  
          </div>

          {/* Action Button Section - Moved up, colored blue */}  
          <div className="flex justify-center w-full">  
            <button  
              onClick={() => onNavigateToScreen('restaurants')}  
              className="transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"  
              style={{  
                ...STYLES.addButton,  
                fontSize: '1.125rem',  
                fontWeight: '500',  
                maxWidth: '320px',  
                width: '100%',  
                boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 10px -5px rgba(0, 0, 0, 0.04)',  
              }}  
              onMouseEnter={(e) => {  
                e.currentTarget.style.transform = 'scale(1.03)';  
                e.currentTarget.style.backgroundColor = COLORS.addButtonHover;  
              }}  
              onMouseLeave={(e) => {  
                e.currentTarget.style.transform = 'scale(1)';  
                e.currentTarget.style.backgroundColor = COLORS.addButtonBg;  
              }}  
            >  
              Restaurants  
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