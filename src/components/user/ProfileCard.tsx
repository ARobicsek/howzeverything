// src/components/user/ProfileCard.tsx
import React, { useState } from 'react'
import { COLORS, FONTS } from '../../constants'
import { useAuth } from '../../hooks/useAuth'

interface ProfileCardProps {
  onEditProfile?: () => void
  showEditButton?: boolean
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  onEditProfile, 
  showEditButton = true 
}) => {
  const { user, profile, signOut, loading, error } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user || !profile) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        margin: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <p style={{
          ...FONTS.elegant,
          fontSize: '16px',
          color: COLORS.textDark,
          margin: 0
        }}>
          {loading ? 'Loading profile...' : 'No profile found'}
        </p>
      </div>
    )
  }

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null): string => {
    if (!name) return user.email?.charAt(0).toUpperCase() ?? '?'
    
    const names = name.trim().split(' ')
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }
    return names[0].charAt(0).toUpperCase()
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  const initials = getInitials(profile.full_name)

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      margin: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <p style={{
            ...FONTS.elegant,
            fontSize: '14px',
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
        marginBottom: '20px'
      }}>
        {/* Avatar */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: profile.avatar_url ? 'transparent' : COLORS.primary,
          backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
          flexShrink: 0
        }}>
          {!profile.avatar_url && (
            <span style={{
              ...FONTS.elegant,
              fontSize: '24px',
              fontWeight: '600',
              color: 'white'
            }}>
              {initials}
            </span>
          )}
        </div>

        {/* Name and Email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            ...FONTS.elegant,
            fontSize: '20px',
            fontWeight: '600',
            color: COLORS.text,
            margin: '0 0 4px 0',
            wordBreak: 'break-word'
          }}>
            {profile.full_name || 'No name set'}
          </h3>
          <p style={{
            ...FONTS.elegant,
            fontSize: '14px',
            color: COLORS.textDark,
            margin: 0,
            wordBreak: 'break-word'
          }}>
            {user.email}
          </p>
          {profile.is_admin && (
            <span style={{
              ...FONTS.elegant,
              fontSize: '12px',
              fontWeight: '600',
              color: COLORS.primary,
              backgroundColor: '#EBF8FF',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-block',
              marginTop: '4px'
            }}>
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div style={{ marginBottom: '20px' }}>
        {profile.bio && (
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '600',
              color: COLORS.text,
              margin: '0 0 4px 0'
            }}>
              Bio
            </h4>
            <p style={{
              ...FONTS.elegant,
              fontSize: '14px',
              color: COLORS.textDark,
              margin: 0,
              lineHeight: '1.4',
              wordBreak: 'break-word'
            }}>
              {profile.bio}
            </p>
          </div>
        )}

        {profile.location && (
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '600',
              color: COLORS.text,
              margin: '0 0 4px 0'
            }}>
              Location
            </h4>
            <p style={{
              ...FONTS.elegant,
              fontSize: '14px',
              color: COLORS.textDark,
              margin: 0
            }}>
              {profile.location}
            </p>
          </div>
        )}

        <div>
          <h4 style={{
            ...FONTS.elegant,
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.text,
            margin: '0 0 4px 0'
          }}>
            Member Since
          </h4>
          <p style={{
            ...FONTS.elegant,
            fontSize: '14px',
            color: COLORS.textDark,
            margin: 0
          }}>
            {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: 'column'
      }}>
        {showEditButton && onEditProfile && (
          <button
            onClick={onEditProfile}
            disabled={loading}
            style={{
              ...FONTS.elegant,
              height: '44px',
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            Edit Profile
          </button>
        )}

        <button
          onClick={handleSignOut}
          disabled={loading || isSigningOut}
          style={{
            ...FONTS.elegant,
            height: '44px',
            backgroundColor: 'transparent',
            color: COLORS.danger,
            border: `1px solid ${COLORS.danger}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: (loading || isSigningOut) ? 'not-allowed' : 'pointer',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}

export default ProfileCard