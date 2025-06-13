// src/components/LoadingScreen.tsx
import React from 'react';
import { COLORS, FONTS, SPACING, TYPOGRAPHY } from '../constants';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.background,
      padding: SPACING[4]
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACING[4]
      }}>
        {/* Loading spinner */}
        <div className="loading-spinner" style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${COLORS.gray200}`,
          borderTopColor: COLORS.primary,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        
        {/* Loading text */}
        <p style={{
          ...FONTS.body,
          fontSize: TYPOGRAPHY.lg.fontSize,
          color: COLORS.textSecondary,
          margin: 0
        }}>
          {message || 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;