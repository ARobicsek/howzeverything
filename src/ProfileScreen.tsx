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
        <header style={{
          backgroundColor: COLORS.white,
          borderBottom: `1px solid ${COLORS.gray200}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: STYLES.shadowSmall
        }}>
          <div style={{
            maxWidth: '768px',
            margin: '0 auto',
            padding: `${SPACING[4]} ${SPACING[4]}`,
            textAlign: 'center'
          }}>
            <h1 style={{
              ...FONTS.heading,
              fontSize: TYPOGRAPHY.xl.fontSize,
              color: COLORS.gray900,
              margin: 0
            }}>
              My Profile
            </h1>
          </div>
        </header>

        <main style={{ 
          flex: 1, 
          padding: SPACING[4], 
          paddingBottom: STYLES.mainContentPadding,
          maxWidth: '768px',
          width: '100%',
          margin: '0 auto'
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
        </main>

        <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
      <header style={{
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.gray200}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: STYLES.shadowSmall
      }}>
        <div style={{
          maxWidth: '768px',
          margin: '0 auto',
          padding: `${SPACING[4]} ${SPACING[4]}`,
          textAlign: 'center'
        }}>
          <h1 style={{
            ...FONTS.heading,
            fontSize: TYPOGRAPHY.xl.fontSize,
            color: COLORS.gray900,
            margin: 0
          }}>
            My Profile
          </h1>
        </div>
      </header>

      <main style={{ 
        flex: 1, 
        padding: SPACING[4], 
        paddingBottom: STYLES.mainContentPadding,
        maxWidth: '768px',
        width: '100%',
        margin: '0 auto'
      }}>
        <ProfileCard
          onEditProfile={handleEditProfile}
          showEditButton={true}
        />
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