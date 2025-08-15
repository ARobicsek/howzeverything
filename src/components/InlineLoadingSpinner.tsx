// src/components/InlineLoadingSpinner.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SPACING, TYPOGRAPHY } from '../constants';

const spinAnimation = `
  @keyframes inline-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface InlineLoadingSpinnerProps {
  message?: string;
}

const InlineLoadingSpinner: React.FC<InlineLoadingSpinnerProps> = ({ message }) => {
  const { theme } = useTheme();
  
  return (
    <>
      <style>{spinAnimation}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${SPACING[8]} ${SPACING[4]}`,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: SPACING[3]
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${theme.colors.gray200}`,
            borderTopColor: theme.colors.primary,
            borderRadius: '50%',
            animation: 'inline-spin 0.8s linear infinite'
          }}></div>
          
          {message && (
            <p style={{
              ...theme.fonts.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              color: theme.colors.textSecondary,
              margin: 0,
              textAlign: 'center'
            }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default InlineLoadingSpinner;