import React from 'react';
import LoadingScreen from './components/LoadingScreen';
import ProfileCard from './components/user/ProfileCard';
import { SCREEN_STYLES, createFullWidthBackground } from './constants';
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
      <div style={{ ...createFullWidthBackground('linear-gradient(90deg, #40FF00, #00FFFF, #0080FF)') }}>
        {/* Content container with original width */}
        <div style={SCREEN_STYLES.profile.container}>
          <div style={SCREEN_STYLES.profile.noUserContainer}>
            <div style={SCREEN_STYLES.profile.noUserIcon}>👤</div>
            <p style={SCREEN_STYLES.profile.noUserText}>
              No user profile loaded. You might be signed out.
            </p>
          </div>
        </div>
      </div>
    );
  }




  return (
    <div style={{ ...createFullWidthBackground('linear-gradient(90deg, #40FF00, #00FFFF, #0080FF)') }}>
      {/* Content container with original width */}
      <div style={SCREEN_STYLES.profile.container}>
        <ProfileCard
          onEditProfile={onEditProfile}
          showEditButton={true}
        />
      </div>
    </div>
  );
};




export default ProfileScreen;