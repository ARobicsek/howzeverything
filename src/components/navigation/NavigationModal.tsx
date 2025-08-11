// src/components/navigation/NavigationModal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LAYOUT_STYLES, COMPONENT_STYLES, DESIGN_TOKENS, TYPOGRAPHY } from '../../constants';


interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

// Define a type for menu items for better type safety
interface MenuItem {
  to: string;
  label:string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  iconStyle?: 'fill' | 'stroke'; // To handle different icon types
}


const NavigationModal: React.FC<NavigationModalProps> = ({ isOpen, onClose, isAdmin }) => {
  if (!isOpen) return null;


  const baseMenuItems: MenuItem[] = [
    {
      to: '/home',
      label: 'Home',
      icon: (
        <>
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </>
      ),
      iconStyle: 'stroke'
    },
    {
      to: '/find-restaurant',
      label: 'Find a Restaurant & Rate Dishes',
      icon: (
        <>
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
          <path d="M2 7h20"/>
          <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
        </>
      ),
      iconStyle: 'stroke'
    },
    { to: '/discover', label: 'Discover Dishes', icon: <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/> },
    {
      to: '/ratings',
      label: 'My Ratings',
      icon: <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>,
      iconStyle: 'stroke'
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: (
        <>
          <circle cx="12" cy="8" r="5"/>
          <path d="M20 21a8 8 0 0 0-16 0"/>
        </>
      ),
      iconStyle: 'stroke'
    },
    { to: '/about', label: 'About Us', icon: <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/> },
    // Admin items are now grouped together
    { to: '/admin', label: 'Admin Panel', icon: <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5L12 2zm0 14.5c-2.33 0-4.29-1.58-4.87-3.75h9.74c-.58 2.17-2.54 3.75-4.87 3.75zM17.5 9h-11v-3l5.5-2.25L17.5 6V9z"/>, adminOnly: true },
    { to: '/restaurants', label: 'My Restaurants', icon: <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7z"/>, adminOnly: true },
  ];


  const menuItems = baseMenuItems.filter(item => !item.adminOnly || isAdmin);


  return (
    <div style={LAYOUT_STYLES.navigationModal.overlay as React.CSSProperties}>
      <div
        onClick={onClose}
        style={COMPONENT_STYLES.modal.sidePanel.overlay as React.CSSProperties}
      />


      <div style={COMPONENT_STYLES.modal.sidePanel.content as React.CSSProperties}>
        <button
          onClick={onClose}
          style={COMPONENT_STYLES.button.close as React.CSSProperties}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" color={DESIGN_TOKENS.colors.white}>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <nav>
          <ul style={LAYOUT_STYLES.navigation.modalList}>
            {menuItems.map(item => {
              const linkColor = item.adminOnly ? DESIGN_TOKENS.colors.ratingGold : DESIGN_TOKENS.colors.textWhite;

              const svgProps: React.SVGAttributes<SVGSVGElement> = item.iconStyle === 'stroke'
                ? { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
                : { fill: 'currentColor' };


              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    style={{
                      ...COMPONENT_STYLES.navLink,
                      color: linkColor,
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" {...svgProps}>
                      {item.icon}
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};


export default NavigationModal;