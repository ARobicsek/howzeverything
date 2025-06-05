// ProfileScreen.tsx
import React, { useState } from 'react'; // Added useState
import BottomNavigation from './components/navigation/BottomNavigation';
import type { NavigableScreenType, AppScreenType } from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants';
import { useAuth } from './hooks/useAuth'; // Added useAuth
import ProfileCard from './components/user/ProfileCard'; // Added ProfileCard
import UserForm from './components/user/UserForm'; // Added UserForm
import LoadingScreen from './components/LoadingScreen'; // Added LoadingScreen

interface ProfileScreenProps {
  onNavigateToScreen: (screen: NavigableScreenType) => void;
  currentAppScreen: AppScreenType;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateToScreen, currentAppScreen }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const handleEditProfile = () => {
    setShowProfileEdit(true);
  };

  const handleProfileFormSuccess = () => {
    setShowProfileEdit(false);
    // Optionally, you might want to refresh the profile data here if useAuth doesn't do it automatically
    // For now, we assume useAuth handles profile updates reflected in its state.
  };

  const handleProfileFormCancel = () => {
    setShowProfileEdit(false);
  };

  // If auth is still loading, or if there's no user/profile yet (e.g., after sign out, before redirect)
  if (authLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  // After sign out, user and profile will be null.
  // App.tsx should handle redirecting to the login screen if !user.
  // This check is more for robustness within this component.
  if (!user || !profile) {
    // This state should ideally be brief as App.tsx will redirect.
    // You could show a "Signing out..." or redirect message or a minimal loading.
    return (
        <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
            <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
                <div className="max-w-md mx-auto px-6 py-6 flex items-center justify-center">
                <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
                    Profile
                </h1>
                </div>
            </header>
            <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>
                <div className="max-w-md mx-auto text-center py-16">
                    <p style={{ ...FONTS.elegant, color: COLORS.text, opacity: 0.7 }}>
                        No user profile loaded. You might be signed out.
                    </p>
                </div>
            </main>
            <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{backgroundColor: COLORS.background}}>
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
          {/* Removed spacers for a cleaner centered title */}
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{...FONTS.elegant, color: COLORS.text}}>
            My Profile
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto">
          <ProfileCard 
            onEditProfile={handleEditProfile} 
            showEditButton={true} 
          />
        </div>
      </main>

      {showProfileEdit && (
        <UserForm 
          onSuccess={handleProfileFormSuccess} 
          onCancel={handleProfileFormCancel} 
        />
      )}

      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
    </div>
  );
};

export default ProfileScreen;