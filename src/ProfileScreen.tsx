import React from 'react';
import LoadingScreen from './components/LoadingScreen';
import ProfileCard from './components/user/ProfileCard';
import ThemeSelector from './components/ThemeSelector';
import { SCREEN_STYLES, SPACING, STYLES, SHADOWS } from './constants';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';




interface ProfileScreenProps {
  onEditProfile: () => void;
}




const ProfileScreen: React.FC<ProfileScreenProps> = ({ onEditProfile }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const { theme } = useTheme();




  if (authLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }




  if (!user || !profile) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        paddingTop: SPACING[4],
      }}>
        <div style={{
          backgroundColor: theme.colors.white,
          borderRadius: STYLES.borderRadiusLarge as string,
          padding: `${SPACING[12]} ${SPACING[6]}`,
          boxShadow: SHADOWS.medium as string,
          border: `1px solid ${theme.colors.gray200}`,
          textAlign: 'center' as const,
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: SPACING[3],
          }}>👤</div>
          <p style={{
            ...theme.fonts.body,
            fontSize: '1rem',
            color: theme.colors.textSecondary,
            margin: 0,
          }}>
            No user profile loaded. You might be signed out.
          </p>
        </div>
      </div>
    );
  }




  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      paddingTop: SPACING[4],
    }}>
        <ProfileCard
          onEditProfile={onEditProfile}
          showEditButton={true}
        />
        <div style={{ marginTop: SPACING[8] }}>
          <ThemeSelector />
        </div>
    </div>
  );
};




export default ProfileScreen;