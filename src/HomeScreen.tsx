// src/HomeScreen.tsx  
import React from 'react';
import type { AppScreenType, NavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
// MODIFIED: Updated imports to include FONTS, SPACING, TYPOGRAPHY
import { COLORS, FONTS, SIZES, STYLES, TYPOGRAPHY } from './constants';




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
        <div className="max-w-md mx-auto w-full text-center flex flex-col items-center" style={{ gap: SIZES['2xl'] /* Space between logo and text box */ }}>  
          {/* Logo Section */}  
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




          {/* MODIFIED: Replaced Action Button Section with text box. maxWidth reverted to 180px */}
          <div
            style={{
              ...STYLES.card, // Apply Dish Card styling
              maxWidth: '180px', // MODIFIED: Set to exactly 180px to match logo
              display: 'flex', // Use flex to easily center text
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box' // Ensure max-width includes padding and border
            }}
          >
            <p
              style={{
                ...FONTS.elegant, // Same typeface as restaurant names
                fontWeight: TYPOGRAPHY.medium, // '500' based on RestaurantCard
                color: COLORS.text, // Same color as primary text
                fontSize: TYPOGRAPHY.lg.fontSize, // '1.125rem' based on RestaurantCard
                lineHeight: '1.3', // '1.3' based on RestaurantCard
                margin: 0, // Remove default paragraph margin
                textAlign: 'center', // Ensure text is centered within the box
                wordBreak: 'break-word', // Allow long words to break
              }}
            >
              Rate and discover great dishes
            </p>
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