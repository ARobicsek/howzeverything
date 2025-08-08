// src/components/user/ProfileCard.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProfileCardProps {
  onEditProfile?: () => void;
  showEditButton?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onEditProfile, showEditButton = true }) => {
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
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="font-body text-base text-textSecondary m-0">
          {loading ? 'Loading profile...' : 'No profile found'}
        </p>
      </div>
    );
  }

  const getInitials = (name?: string | null): string => {
    if (!name) return user.email?.charAt(0).toUpperCase() ?? '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    return names[0].charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Unknown';
    }
  };

  const initials = getInitials(profile.full_name);
  const avatarBgStyle = profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : {};

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {error && (
        <div className="bg-red-100 border border-red-200 rounded-md p-3 mb-5">
          <p className="font-body text-sm text-danger m-0">{error}</p>
        </div>
      )}

      <div className="flex items-center mb-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mr-5 flex-shrink-0 border-4 border-gray-100 shadow-md bg-cover bg-center ${
            profile.avatar_url ? 'bg-transparent' : 'bg-accent'
          }`}
          style={avatarBgStyle}
        >
          {!profile.avatar_url && (
            <span className="font-pinyon font-normal text-4xl text-white leading-none">
              {initials.length > 1 ? initials.charAt(0) : initials}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-xl text-gray-900 mb-1 break-words">
            {profile.full_name || 'No name set'}
          </h3>
          <p className="font-body text-sm text-textSecondary m-0 break-words">{user.email}</p>
          {profile.is_admin && (
            <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-accent bg-accent/10 rounded-md">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 pt-5 border-t border-gray-100">
        {profile.bio && (
          <div className="mb-4">
            <h4 className="font-body text-sm font-semibold text-textSecondary mb-2 uppercase tracking-wider">Bio</h4>
            <p className="font-body text-base text-text m-0 leading-relaxed break-words">{profile.bio}</p>
          </div>
        )}
        {profile.location && (
          <div className="mb-4">
            <h4 className="font-body text-sm font-semibold text-textSecondary mb-2 uppercase tracking-wider">Location</h4>
            <p className="font-body text-base text-text m-0">{profile.location}</p>
          </div>
        )}
        <div>
          <h4 className="font-body text-sm font-semibold text-textSecondary mb-2 uppercase tracking-wider">Member Since</h4>
          <p className="font-body text-base text-text m-0">{formatDate(profile.created_at ?? '')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {showEditButton && onEditProfile && (
          <button
            onClick={onEditProfile}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg border-2 border-black text-white bg-accent transition-colors hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit Profile
          </button>
        )}
        <button
          onClick={handleSignOut}
          disabled={loading || isSigningOut}
          className="w-full px-4 py-3 rounded-lg border-2 border-black text-black bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;