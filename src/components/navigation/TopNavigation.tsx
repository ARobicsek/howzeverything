// src/components/navigation/TopNavigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LocationAwareButton from '../location/LocationAwareButton';

interface TopNavigationProps {
  onToggleMenu: () => void;
}

const Avatar: React.FC = () => {
  const { user, profile } = useAuth();

  const getInitials = (name?: string | null): string => {
    if (!name) return user?.email?.charAt(0).toUpperCase() ?? '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  };

  const initials = getInitials(profile?.full_name);
  const avatarBgStyle = profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : {};

  return (
    <Link to="/profile" className="no-underline">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white shadow-sm text-white font-pinyon text-2xl leading-none bg-cover bg-center ${
          profile?.avatar_url ? 'bg-transparent' : 'bg-accent'
        }`}
        style={avatarBgStyle}
      >
        {!profile?.avatar_url && <span>{initials.length > 1 ? initials.charAt(0) : initials}</span>}
      </div>
    </Link>
  );
};

const TopNavigation: React.FC<TopNavigationProps> = ({ onToggleMenu }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-navBarDark z-header px-4 flex items-center justify-between">
      <div className="flex-1 flex justify-start">
        <Link to="/home">
          <img
            src="/HowzEverything.png"
            alt="HowzEverything Logo"
            className="h-16 w-auto"
          />
        </Link>
      </div>

      <div className="flex-1 flex justify-center">
        {/* Empty space */}
      </div>

      <div className="flex-1 flex justify-end items-center gap-4">
        <LocationAwareButton />
        <Avatar />
        <button onClick={onToggleMenu} className="bg-transparent border-none cursor-pointer p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;