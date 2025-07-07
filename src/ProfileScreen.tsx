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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
        <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
            <h1 className="text-xl text-center flex-1 tracking-wide mx-2" style={{ ...FONTS.elegant, color: COLORS.text }}>
              My Profile
            </h1>
          </div>
        </header>
        <main style={{ flex: 1, maxWidth: '768px', width: '100%', margin: '0 auto' }}>
          <div className="max-w-md mx-auto space-y-6" style={{ padding: SPACING[4] }}>
            <div style={{ backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusLarge, padding: `${SPACING[12]} ${SPACING[6]}`, boxShadow: STYLES.shadowMedium, border: `1px solid ${COLORS.gray200}`, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: SPACING[3] }}>👤</div>
              <p style={{ ...FONTS.body, fontSize: TYPOGRAPHY.base.fontSize, color: COLORS.textSecondary, margin: 0 }}>
                No user profile loaded. You might be signed out.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
        <div className="max-w-md mx-auto space-y-6" style={{
          padding: `${SPACING[4]} ${SPACING.containerPadding}`,
          width: '100%',
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