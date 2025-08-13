// src/components/navigation/TopNavigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, SPACING, Z_INDICES } from '../../constants';
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
        backgroundColor: profile?.avatar_url ? 'transparent' : COLORS.primary,
        backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.accent})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `2px solid ${COLORS.accent}`,
        boxShadow: `0 0 15px ${COLORS.primary}, 0 0 25px ${COLORS.accent}`,
        color: COLORS.textWhite,
        fontFamily: '"Orbitron", "Courier New", monospace',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        lineHeight: 1,
        textShadow: `0 0 5px ${COLORS.accent}`,
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
      zIndex: Z_INDICES.header,
      padding: `0 ${SPACING[4]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Link to="/home">
          <img
            src="/90s logo.png"
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