import React from 'react';
import LoadingScreen from './components/LoadingScreen';
import ProfileCard from './components/user/ProfileCard';
import { SCREEN_STYLES } from './constants';
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
      // Added paddingTop here for consistency
      <div style={SCREEN_STYLES.profile.container}>
        <div style={SCREEN_STYLES.profile.noUserContainer}>
          <div style={SCREEN_STYLES.profile.noUserIcon}>👤</div>
          <p style={SCREEN_STYLES.profile.noUserText}>
            No user profile loaded. You might be signed out.
          </p>
        </div>
      </div>
    );
  }




  return (
    // --- THIS IS THE FIX ---
    // We are adding back the vertical spacing (paddingTop) that was removed before.
    // This creates the gap between the top navigation and the card.
    <div style={SCREEN_STYLES.profile.container}>
        <ProfileCard
          onEditProfile={onEditProfile}
          showEditButton={true}
        />
    </div>
  );
};




export default ProfileScreen;