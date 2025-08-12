// src/components/user/ProfileCard.tsx
import React, { useState } from 'react';
import { COLORS, COMPONENT_STYLES, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import { useAuth } from '../../hooks/useAuth';


interface ProfileCardProps {
  onEditProfile?: () => void;
  showEditButton?: boolean;
}


const ProfileCard: React.FC<ProfileCardProps> = ({
  onEditProfile,
  showEditButton = true
}) => {
  const { user, profile, signOut, loading, error } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);


  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };


  if (!user || !profile) {
    return (
      <div style={COMPONENT_STYLES.profileCard.noProfileContainer}>
        <p style={COMPONENT_STYLES.profileCard.noProfileText}>
          {loading ? 'Loading profile...' : 'No profile found'}
        </p>
      </div>
    );
  }


  // Get user initials for avatar fallback
  const getInitials = (name?: string | null): string => {
    if (!name) return user.email?.charAt(0).toUpperCase() ?? '?';
   
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  };


  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };


  const initials = getInitials(profile.full_name);


  return (
    <div style={COMPONENT_STYLES.profileCard.container}>
      {/* Error Display */}
      {error && (
        <div style={COMPONENT_STYLES.profileCard.errorContainer}>
          <p style={COMPONENT_STYLES.profileCard.errorText}>
            {error}
          </p>
        </div>
      )}


      {/* Profile Header */}
      <div style={COMPONENT_STYLES.profileCard.headerContainer}>
        {/* Avatar */}
        <div style={{
          ...COMPONENT_STYLES.profileCard.avatarContainer,
          backgroundColor: profile.avatar_url ? 'transparent' : COLORS.accent,
          backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : 'none',
        }}>
          {!profile.avatar_url && (
            <span style={COMPONENT_STYLES.profileCard.avatarInitials}>
              {initials.length > 1 ? initials.charAt(0) : initials}
            </span>
          )}
        </div>


        {/* Name and Email */}
        <div style={COMPONENT_STYLES.profileCard.nameAndEmailContainer}>
          <h3 style={COMPONENT_STYLES.profileCard.name}>
            {profile.full_name || 'No name set'}
          </h3>
          <p style={COMPONENT_STYLES.profileCard.email}>
            {user.email}
          </p>
          {profile.is_admin && (
            <span style={COMPONENT_STYLES.profileCard.adminBadge}>
              Admin
            </span>
          )}
        </div>
      </div>


      {/* Profile Details */}
      <div style={COMPONENT_STYLES.profileCard.detailsContainer}>
        {profile.bio && (
          <div style={COMPONENT_STYLES.profileCard.bioContainer}>
            <h4 style={COMPONENT_STYLES.profileCard.sectionHeader}>
              Bio
            </h4>
            <p style={COMPONENT_STYLES.profileCard.bioText}>
              {profile.bio}
            </p>
          </div>
        )}


        {profile.location && (
          <div style={COMPONENT_STYLES.profileCard.bioContainer}>
            <h4 style={COMPONENT_STYLES.profileCard.sectionHeader}>
              Location
            </h4>
            <p style={COMPONENT_STYLES.profileCard.locationText}>
              {profile.location}
            </p>
          </div>
        )}


        <div>
          <h4 style={COMPONENT_STYLES.profileCard.sectionHeader}>
            Member Since
          </h4>
          <p style={COMPONENT_STYLES.profileCard.locationText}>
            {formatDate(profile.created_at ?? '')}
          </p>
        </div>
      </div>


      {/* Action Buttons */}
      <div style={COMPONENT_STYLES.profileCard.actionButtonsContainer}>
        {showEditButton && onEditProfile && (
          <button
            onClick={onEditProfile}
            disabled={loading}
            style={{
              ...STYLES.primaryButton,
              width: '100%',
              backgroundColor: COLORS.accent,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = COLORS.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = COLORS.accent;
              }
            }}
          >
            Edit Profile
          </button>
        )}


        <button
          onClick={handleSignOut}
          disabled={loading || isSigningOut}
          style={{
            ...STYLES.secondaryButton,
            width: '100%',
            color: COLORS.black,
            borderColor: COLORS.black,
            opacity: (loading || isSigningOut) ? 0.5 : 1,
            cursor: (loading || isSigningOut) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && !isSigningOut) {
              e.currentTarget.style.backgroundColor = COLORS.gray100;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.white;
          }}
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};


export default ProfileCard;