// src/components/shared/AccordionSection.tsx
import React, { ReactNode } from 'react';
import { SPACING } from '../../constants';
import { useTheme } from '../../hooks/useTheme';

interface AccordionSectionProps {
  title: string;
  isExpanded: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  isDisabled?: boolean;
  headerAccessory?: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isExpanded,
  onClick,
  children,
  className = '',
  isEmpty = false,
  isDisabled = false,
  headerAccessory,
}) => {
  const { theme } = useTheme();
  const isGrayedOut = isEmpty || isDisabled;

  return (
    <div className={className}>
      <div // MODIFIED from <button> to <div> to allow nesting an interactive element (the refresh button)
        onClick={isGrayedOut ? undefined : onClick}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `${SPACING[3]} ${SPACING[4]}`,
          border: 'none',
          background: 'transparent',
          cursor: isGrayedOut ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          opacity: isGrayedOut ? 0.5 : 1,
          minHeight: '60px', // Force consistent height to stabilize layout
          boxSizing: 'border-box',
          minWidth: '340px', // Force consistent width to prevent compression
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: SPACING[2],
          flex: 1, // Take available space
          minWidth: 0, // Allow text to wrap if needed
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 500,
            color: isGrayedOut ? theme.colors.textSecondary : theme.colors.accent,
            ...theme.fonts.elegant,
          }}>
            {title}
          </h3>
          {headerAccessory}
        </div>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            color: theme.colors.textSecondary,
            flexShrink: 0, // Prevent icon from shrinking
            marginLeft: SPACING[4], // Space from text
            width: '24px', // Fixed width
            height: '24px', // Fixed height
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div
        style={{
          maxHeight: isExpanded && !isGrayedOut ? '400px' : '0',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'max-height 0.5s ease-in-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AccordionSection;