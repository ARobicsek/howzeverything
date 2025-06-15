// src/ProfileScreen.tsx
import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import type { AppScreenType, NavigableScreenType } from './components/navigation/BottomNavigation';
import BottomNavigation from './components/navigation/BottomNavigation';
import ProfileCard from './components/user/ProfileCard';
import UserForm from './components/user/UserForm';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';


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
  };


  const handleProfileFormCancel = () => {
    setShowProfileEdit(false);
  };


  // If auth is still loading
  if (authLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }


  // After sign out or if no user/profile
  if (!user || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
        {/* Header - Standardized to match other screens */}
        <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            {/* Left spacer for centering */}
            <div className="w-12 h-12" />
                   
            <h1 className="text-xl text-center flex-1 tracking-wide mx-2" style={{
              ...FONTS.elegant, // Consistent font
              color: COLORS.text, // Consistent color
            }}>
              My Profile
            </h1>
            {/* Right spacer for centering */}
            <div className="w-12 h-12" />
          </div>
        </header>


        <main style={{
          flex: 1,
          paddingBottom: STYLES.mainContentPadding, // Consistent padding for bottom nav
          maxWidth: '768px',
          width: '100%',
          margin: '0 auto'
        }}>
          {/* Main content wrapper with consistent padding */}
          <div className="max-w-md mx-auto space-y-6" style={{
            paddingLeft: SPACING.containerPadding,
            paddingRight: SPACING.containerPadding,
            paddingTop: SPACING[4]
          }}>
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: STYLES.borderRadiusLarge,
              padding: `${SPACING[12]} ${SPACING[6]}`,
              boxShadow: STYLES.shadowMedium,
              border: `1px solid ${COLORS.gray200}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: SPACING[3] }}>👤</div>
              <p style={{
                ...FONTS.body,
                fontSize: TYPOGRAPHY.base.fontSize,
                color: COLORS.textSecondary,
                margin: 0
              }}>
                No user profile loaded. You might be signed out.
              </p>
            </div>
          </div>
        </main>


        <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
      </div>
    );
  }


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
      {/* Header - Standardized to match other screens */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left spacer for centering */}
          <div className="w-12 h-12" />
                 
          <h1 className="text-xl text-center flex-1 tracking-wide mx-2" style={{
            ...FONTS.elegant, // Consistent font
            color: COLORS.text, // Consistent color
          }}>
            My Profile
          </h1>
          {/* Right spacer for centering */}
          <div className="w-12 h-12" />
        </div>
      </header>


      <main style={{
        flex: 1,
        paddingBottom: STYLES.mainContentPadding, // Consistent padding for bottom nav
        maxWidth: '768px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Main content wrapper with consistent padding */}
        <div className="max-w-md mx-auto space-y-6" style={{
          paddingLeft: SPACING.containerPadding,
          paddingRight: SPACING.containerPadding,
          paddingTop: SPACING[4]
        }}>
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