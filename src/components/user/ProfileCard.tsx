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
      <div style={{
        ...STYLES.card,
        textAlign: 'center',
        padding: SPACING[6]
      }}>
        <p style={{
          ...FONTS.body,
          fontSize: TYPOGRAPHY.base.fontSize,
          color: COLORS.textSecondary,
          margin: 0
        }}>
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
    <div style={{
      ...STYLES.card,
      boxShadow: STYLES.shadowLarge,
      padding: SPACING[6]
    }}>
      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: STYLES.borderRadiusMedium,
          padding: SPACING[3],
          marginBottom: SPACING[5]
        }}>
          <p style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.sm.fontSize,
            color: COLORS.danger,
            margin: 0
          }}>
            {error}
          </p>
        </div>
      )}


      {/* Profile Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: SPACING[6]
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: profile.avatar_url ? 'transparent' : COLORS.accent,
          backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: SPACING[5],
          flexShrink: 0,
          border: `3px solid ${COLORS.gray100}`,
          // --- THIS IS THE FIX ---
          // Added a shadow to give the avatar depth
          boxShadow: STYLES.shadowMedium,
        }}>
          {!profile.avatar_url && (
            <span style={{
              fontFamily: '"Pinyon Script", cursive',
              fontWeight: 400,
              fontSize: '2.5rem', 
              color: COLORS.white,
              lineHeight: 1, 
            }}>
              {initials.length > 1 ? initials.charAt(0) : initials}
            </span>
          )}
        </div>


        {/* Name and Email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            ...FONTS.heading,
            fontSize: TYPOGRAPHY.xl.fontSize,
            color: COLORS.gray900,
            margin: `0 0 ${SPACING[1]} 0`,
            wordBreak: 'break-word'
          }}>
            {profile.full_name || 'No name set'}
          </h3>
          <p style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.sm.fontSize,
            color: COLORS.textSecondary,
            margin: 0,
            wordBreak: 'break-word'
          }}>
            {user.email}
          </p>
          {profile.is_admin && (
            <span style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.xs.fontSize,
              fontWeight: TYPOGRAPHY.semibold,
              color: COLORS.accent,
              backgroundColor: `${COLORS.accent}2A`,
              padding: `${SPACING[1]} ${SPACING[3]}`,
              borderRadius: STYLES.borderRadiusSmall,
              display: 'inline-block',
              marginTop: SPACING[2]
            }}>
              Admin
            </span>
          )}
        </div>
      </div>


      {/* Profile Details */}
      <div style={{
        marginBottom: SPACING[6],
        paddingTop: SPACING[5],
        borderTop: `1px solid ${COLORS.gray100}`
      }}>
        {profile.bio && (
          <div style={{ marginBottom: SPACING[4] }}>
            <h4 style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              fontWeight: TYPOGRAPHY.semibold,
              color: COLORS.textSecondary,
              margin: `0 0 ${SPACING[2]} 0`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Bio
            </h4>
            <p style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.base.fontSize,
              color: COLORS.text,
              margin: 0,
              lineHeight: '1.6',
              wordBreak: 'break-word'
            }}>
              {profile.bio}
            </p>
          </div>
        )}


        {profile.location && (
          <div style={{ marginBottom: SPACING[4] }}>
            <h4 style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              fontWeight: TYPOGRAPHY.semibold,
              color: COLORS.textSecondary,
              margin: `0 0 ${SPACING[2]} 0`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Location
            </h4>
            <p style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.base.fontSize,
              color: COLORS.text,
              margin: 0
            }}>
              {profile.location}
            </p>
          </div>
        )}


        <div>
          <h4 style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.sm.fontSize,
            fontWeight: TYPOGRAPHY.semibold,
            color: COLORS.textSecondary,
            margin: `0 0 ${SPACING[2]} 0`,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Member Since
          </h4>
          <p style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.base.fontSize,
            color: COLORS.text,
            margin: 0
          }}>
            {formatDate(profile.created_at ?? '')}
          </p>
        </div>
      </div>


      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: SPACING[3],
        flexDirection: 'column'
      }}>
        {showEditButton && onEditProfile && (
          <button
            onClick={onEditProfile}
            disabled={loading}
            style={{
              ...COMPONENT_STYLES.button.profilePrimary,
              width: '100%',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Edit Profile
          </button>
        )}
        <button
          onClick={handleSignOut}
          disabled={loading || isSigningOut}
          style={{
            ...COMPONENT_STYLES.button.profileSecondary,
            width: '100%',
            opacity: (loading || isSigningOut) ? 0.5 : 1,
            cursor: (loading || isSigningOut) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};


export default ProfileCard;