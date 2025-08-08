// src/components/shared/AccordionSection.tsx
import React, { ReactNode } from 'react';

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
  const isGrayedOut = isEmpty || isDisabled;

  return (
    <div className={className}>
      <div
        onClick={isGrayedOut ? undefined : onClick}
        className={`w-full flex justify-between items-center px-4 py-3 bg-transparent border-none text-left ${
          isGrayedOut ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2">
          <h3
            className={`m-0 text-xl font-medium font-elegant ${
              isGrayedOut ? 'text-textSecondary' : 'text-accent'
            }`}
          >
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
          className={`transition-transform duration-300 ease-in-out text-textSecondary flex-shrink-0 mr-12 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div
        className="overflow-y-auto overflow-x-hidden transition-max-height duration-500 ease-in-out"
        style={{ maxHeight: isExpanded && !isGrayedOut ? '60vh' : '0' }}
      >
        {children}
      </div>
    </div>
  );
};

export default AccordionSection;