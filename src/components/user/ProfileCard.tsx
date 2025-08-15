// src/components/user/ProfileCard.tsx
import React, { useState } from 'react';
import { STYLE_FUNCTIONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';


interface ProfileCardProps {
  onEditProfile?: () => void;
  showEditButton?: boolean;
}


const ProfileCard: React.FC<ProfileCardProps> = ({
  onEditProfile,
  showEditButton = true
}) => {
  const { user, profile, signOut, loading, error } = useAuth();
  const { theme } = useTheme();
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
        backgroundColor: theme.colors.white,
        padding: '24px',
        borderRadius: '16px',
        textAlign: 'center' as const,
        ...theme.fonts.body
      }}>
        <p style={{
          color: theme.colors.textSecondary,
          margin: 0
        }}>
          {loading ? 'Loading profile...' : 'No profile found'}
        </p>
      </div>
    );
  }


  // Format date helper
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown';
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


  // Get user initials for avatar fallback
  const getInitials = (name?: string | null): string => {
    if (!name) return user.email?.charAt(0).toUpperCase() ?? '?';
   
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };


  const initials = getInitials(profile.full_name);


  return (
    <div style={{
      backgroundColor: theme.colors.white,
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: 'calc(100vw - 32px)',
      boxSizing: 'border-box' as const
    }}>
      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: theme.colors.red50,
          border: `1px solid ${theme.colors.danger}`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <p style={{
            color: theme.colors.danger,
            margin: 0,
            fontSize: '0.875rem',
            ...theme.fonts.body
          }}>
            {error}
          </p>
        </div>
      )}


      {/* Profile Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px'
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: theme.colors.accent,
          backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {!profile.avatar_url && (
            <span style={{
              color: theme.colors.white,
              fontSize: '2.5rem',
              fontWeight: '600',
              fontFamily: theme.colors.avatarFontFamily
            }}>
              {initials.length > 1 ? initials.charAt(0) : initials}
            </span>
          )}
        </div>


        {/* Name and Email */}
        <div style={{
          flex: 1,
          minWidth: 0
        }}>
          <h3 style={{
            margin: 0,
            marginBottom: '4px',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme.colors.text,
            ...theme.fonts.heading
          }}>
            {profile.full_name || 'No name set'}
          </h3>
          <p style={{
            margin: 0,
            marginBottom: '8px',
            fontSize: '0.875rem',
            color: theme.colors.textSecondary,
            ...theme.fonts.body
          }}>
            {user.email}
          </p>
          {profile.is_admin && (
            <span style={{
              display: 'inline-block',
              backgroundColor: theme.colors.accent,
              color: theme.colors.white,
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '12px',
              ...theme.fonts.body
            }}>
              Admin
            </span>
          )}
        </div>
      </div>


      {/* Profile Details */}
      <div style={{
        marginBottom: '24px'
      }}>
        {profile.bio && (
          <div style={{
            marginBottom: '16px'
          }}>
            <h4 style={{
              margin: 0,
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: theme.colors.text,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
              ...theme.fonts.heading
            }}>
              Bio
            </h4>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: theme.colors.textSecondary,
              lineHeight: '1.5',
              ...theme.fonts.body
            }}>
              {profile.bio}
            </p>
          </div>
        )}


        {profile.location && (
          <div style={{
            marginBottom: '16px'
          }}>
            <h4 style={{
              margin: 0,
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: theme.colors.text,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
              ...theme.fonts.heading
            }}>
              Location
            </h4>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: theme.colors.textSecondary,
              lineHeight: '1.5',
              ...theme.fonts.body
            }}>
              {profile.location}
            </p>
          </div>
        )}


        <div>
          <h4 style={{
            margin: 0,
            marginBottom: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: theme.colors.text,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            ...theme.fonts.heading
          }}>
            Member Since
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: theme.colors.textSecondary,
            lineHeight: '1.5',
            ...theme.fonts.body
          }}>
            {formatDate(profile.created_at ?? '')}
          </p>
        </div>
      </div>


      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const
      }}>
        {showEditButton && onEditProfile && (
          <button
            onClick={onEditProfile}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: theme.colors.accent,
              color: theme.colors.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              ...theme.fonts.body
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme.colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme.colors.accent;
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
            flex: 1,
            padding: '12px 24px',
            backgroundColor: theme.colors.white,
            color: theme.colors.text,
            border: `2px solid ${theme.colors.gray200}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: (loading || isSigningOut) ? 'not-allowed' : 'pointer',
            opacity: (loading || isSigningOut) ? 0.6 : 1,
            transition: 'all 0.2s ease',
            ...theme.fonts.body
          }}
          onMouseEnter={(e) => {
            if (!loading && !isSigningOut) {
              e.currentTarget.style.backgroundColor = theme.colors.gray100;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.white;
          }}
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};


export default ProfileCard;