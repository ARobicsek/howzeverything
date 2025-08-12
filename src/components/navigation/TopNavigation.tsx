// src/components/navigation/TopNavigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, SPACING, STYLES } from '../../constants';
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

  return (
    <Link to="/profile" style={{ textDecoration: 'none' }}>
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: profile?.avatar_url ? 'transparent' : '#642e32',
        backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${COLORS.white}`,
        boxShadow: SHADOWS.small,
        color: COLORS.white,
        fontFamily: '"Pinyon Script", cursive',
        fontSize: '1.6rem',
        lineHeight: 1,
      }}>
        {!profile?.avatar_url && <span>{initials.length > 1 ? initials.charAt(0) : initials}</span>}
      </div>
    </Link>
  );
};

const TopNavigation: React.FC<TopNavigationProps> = ({ onToggleMenu }) => {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: COLORS.navBarDark,
      border: 'none',
      zIndex: STYLES.zHeader,
      padding: `0 ${SPACING[4]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Link to="/home">
          <img
            src="/HowzEverything.png"
            alt="HowzEverything Logo"
            style={{ height: '60px', width: 'auto' }}
          />
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {/* Empty space in the center */}
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'end', alignItems: 'center', gap: SPACING[4] }}>
        <LocationAwareButton />
        <Avatar />
        <button onClick={onToggleMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: SPACING[2] }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" color={COLORS.white}>
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;