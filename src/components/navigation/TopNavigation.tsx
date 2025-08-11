// src/components/navigation/TopNavigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LAYOUT_STYLES, COMPONENT_STYLES, UTILITIES, DESIGN_TOKENS } from '../../constants';
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

  const avatarStyle: React.CSSProperties = {
    ...COMPONENT_STYLES.avatar,
    backgroundColor: profile?.avatar_url ? 'transparent' : DESIGN_TOKENS.colors.accent,
    backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none',
  };

  return (
    <Link to="/profile" style={UTILITIES.textDecorationNone}>
      <div style={avatarStyle}>
        {!profile?.avatar_url && <span>{initials.length > 1 ? initials.charAt(0) : initials}</span>}
      </div>
    </Link>
  );
};

const TopNavigation: React.FC<TopNavigationProps> = ({ onToggleMenu }) => {
  return (
    <header style={LAYOUT_STYLES.topNavigation.container as React.CSSProperties}>
      <div style={LAYOUT_STYLES.topNavigation.leftContainer}>
        <Link to="/home">
          <img
            src="/HowzEverything.png"
            alt="HowzEverything Logo"
            style={COMPONENT_STYLES.logo}
          />
        </Link>
      </div>

      <div style={LAYOUT_STYLES.topNavigation.centerContainer}>
        {/* Empty space in the center */}
      </div>

      <div style={LAYOUT_STYLES.topNavigation.rightContainer}>
        <LocationAwareButton />
        <Avatar />
        <button onClick={onToggleMenu} style={COMPONENT_STYLES.navButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" color={DESIGN_TOKENS.colors.white}>
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;