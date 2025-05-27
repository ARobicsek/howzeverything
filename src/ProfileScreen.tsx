// ProfileScreen.tsx
import React from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import type { NavigableScreenType, AppScreenType } from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants';

interface ProfileScreenProps {
  onNavigateToScreen: (screen: NavigableScreenType) => void;
  currentAppScreen: AppScreenType;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateToScreen, currentAppScreen }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-between">
          <div className="w-6" />
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
            Profile
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 px-6 py-6" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="text-6xl mb-4" style={{color: COLORS.text, opacity: 0.8}}>👤</div>
          <h2 className="text-2xl mb-4" style={{ ...FONTS.elegant, color: COLORS.text, fontWeight: '400' }}>
            Profile Coming Soon
          </h2>
          <p style={{ ...FONTS.elegant, color: COLORS.text, opacity: 0.7 }}>
            Manage your account settings here!
          </p>
        </div>
      </main>
      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
    </div>
  );
};

export default ProfileScreen;
