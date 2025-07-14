// src/components/navigation/NavigationModal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';




interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}




const NavigationModal: React.FC<NavigationModalProps> = ({ isOpen, onClose, isAdmin }) => {
  if (!isOpen) return null;


  const baseMenuItems = [
    { to: '/about', label: 'About Us', icon: <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/> },
    { to: '/find-restaurant', label: 'Find a Restaurant and Rate Dishes', icon: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/> },
    { to: '/restaurants', label: 'My Restaurants', icon: <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7z"/>, adminOnly: true },
    { to: '/discover', label: 'Discover Dishes', icon: <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/> },
    { to: '/ratings', label: 'My Ratings', icon: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/> },
    { to: '/profile', label: 'My Profile', icon: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/> },
    { to: '/admin', label: 'Admin Panel', icon: <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5L12 2zm0 14.5c-2.33 0-4.29-1.58-4.87-3.75h9.74c-.58 2.17-2.54 3.75-4.87 3.75zM17.5 9h-11v-3l5.5-2.25L17.5 6V9z"/>, adminOnly: true },
  ];


  const menuItems = baseMenuItems.filter(item => !item.adminOnly || isAdmin);


  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: STYLES.zModal - 1,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.3s ease',
        }}
      />




      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(300px, 80vw)',
        backgroundColor: COLORS.navBarDark,
        boxShadow: STYLES.shadowLarge,
        display: 'flex',
        flexDirection: 'column',
        padding: `${SPACING[8]} ${SPACING[4]}`,
        animation: 'slideInFromRight 0.3s ease',
        zIndex: STYLES.zModal
      }}>
        <style>
          {`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
          `}
        </style>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: SPACING[4],
            right: SPACING[4],
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: SPACING[2]
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" color={COLORS.white}>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: `calc(60px + ${SPACING[4]}) 0 0 0` }}>
            {menuItems.map(item => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING[4],
                    padding: `${SPACING[4]} ${SPACING[2]}`,
                    textDecoration: 'none',
                    ...TYPOGRAPHY['2xl'],
                    color: COLORS.textWhite,
                    fontWeight: TYPOGRAPHY.medium,
                    borderRadius: STYLES.borderRadiusMedium,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <svg width="28" height="28" viewBox="0 0 24" fill="currentColor">
                    {item.icon}
                  </svg>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};




export default NavigationModal;