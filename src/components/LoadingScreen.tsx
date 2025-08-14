// src/components/LoadingScreen.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SPACING, TYPOGRAPHY } from '../constants';


// We define the keyframes for our animation here. By injecting this <style>
// tag, the `spin` animation becomes available for the component to use.
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


interface LoadingScreenProps {
  message?: string;
}


const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const { theme } = useTheme();
  
  return (
    // We use a React Fragment (<>) to return multiple elements without a wrapper div.
    <>
      <style>{spinAnimation}</style>
      <div style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme.colors.background,
        minHeight: '100vh',
        padding: '8rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: SPACING[4]
        }}>
          {/* This div will now correctly use the 'spin' animation */}
          <div className="loading-spinner" style={{
            width: '48px',
            height: '48px',
            border: `3px solid ${theme.colors.gray200}`,
            borderTopColor: theme.colors.primary,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
       
          {/* Loading text */}
          <p style={{
            ...theme.fonts.body,
            fontSize: TYPOGRAPHY.lg.fontSize,
            color: theme.colors.textSecondary,
            margin: 0
          }}>
            {message || 'Loading...'}
          </p>
        </div>
      </div>
    </>
  );
};


export default LoadingScreen;