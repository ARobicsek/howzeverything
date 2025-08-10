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

  const headerClasses = [
    'w-full', 'flex', 'justify-between', 'items-center',
    'px-4', 'py-3', 'border-none', 'bg-transparent',
    'text-left',
    isGrayedOut ? 'cursor-not-allowed' : 'cursor-pointer',
    isGrayedOut ? 'opacity-50' : 'opacity-100',
  ].join(' ');

  const titleClasses = [
    'm-0', 'text-xl', 'font-medium', 'font-sans', 'tracking-tight',
    isGrayedOut ? 'text-textSecondary' : 'text-accent',
  ].join(' ');

  const chevronClasses = [
    'transform', 'transition-transform', 'duration-300',
    'text-textSecondary', 'flex-shrink-0', 'mr-12',
    isExpanded ? 'rotate-180' : 'rotate-0',
  ].join(' ');

  const contentClasses = [
    'overflow-y-auto', 'overflow-x-hidden', 'transition-all', 'duration-500', 'ease-in-out',
    isExpanded && !isGrayedOut ? 'max-h-[60vh]' : 'max-h-0',
  ].join(' ');

  return (
    <div className={className}>
      <div
        onClick={isGrayedOut ? undefined : onClick}
        className={headerClasses}
      >
        <div className="flex items-center gap-2">
          <h3 className={titleClasses}>
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
          className={chevronClasses}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

export default AccordionSection;