// src/components/shared/AccordionSection.tsx
import React, { ReactNode } from 'react';
import { COLORS, SPACING } from '../../constants';

interface AccordionSectionProps {
  title: string;
  isExpanded: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  isDisabled?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isExpanded,
  onClick,
  children,
  className = '',
  isEmpty = false,
  isDisabled = false,
}) => {
  const isGrayedOut = isEmpty || isDisabled;

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={isGrayedOut}
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
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500, color: COLORS.text }}>
          {title}
        </h3>
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
            color: COLORS.textSecondary,
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div
        style={{
          maxHeight: isExpanded ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.5s ease-in-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AccordionSection;