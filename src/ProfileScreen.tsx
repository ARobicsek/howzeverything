import React from 'react';
import LoadingScreen from './components/LoadingScreen';
import ProfileCard from './components/user/ProfileCard';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { useAuth } from './hooks/useAuth';


interface ProfileScreenProps {
  onEditProfile: () => void;
}


const ProfileScreen: React.FC<ProfileScreenProps> = ({ onEditProfile }) => {
  const { user, profile, loading: authLoading } = useAuth();


  if (authLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }


  if (!user || !profile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, padding: `${SPACING[4]} ${SPACING.containerPadding}` }}>
        <div style={{ maxWidth: '448px', width: '100%', margin: '0 auto' }}>
            <div style={{ backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusLarge, padding: `${SPACING[12]} ${SPACING[6]}`, boxShadow: STYLES.shadowMedium, border: `1px solid ${COLORS.gray200}`, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: SPACING[3] }}>👤</div>
              <p style={{ ...FONTS.body, fontSize: TYPOGRAPHY.base.fontSize, color: COLORS.textSecondary, margin: 0 }}>
                No user profile loaded. You might be signed out.
              </p>
            </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, padding: `${SPACING[4]} ${SPACING.containerPadding}` }}>
        <div style={{
          maxWidth: '448px',
          width: '100%',
          margin: '0 auto'
        }}>
          <ProfileCard
            onEditProfile={onEditProfile}
            showEditButton={true}
          />
        </div>
    </div>
  );
};


export default ProfileScreen;