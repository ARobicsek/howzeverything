// src/components/LoadingScreen.tsx
import React, { useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  

  
  return (
    // Use the same layout structure as MenuScreen to prevent viewport width changes
    <>
      <style>{spinAnimation}</style>
      <div 
        ref={containerRef}
        style={{ 
          width: '100vw',
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: theme.colors.background,
          minHeight: '100vh'
        }}>
        <div style={{
          minHeight: '100vh'
        }}>
          <main style={{
            backgroundColor: 'transparent',
            minHeight: 'calc(100vh - 60px)',
            paddingTop: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 16px 24px 16px',
              backgroundColor: 'transparent',
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
          </main>
        </div>
      </div>
    </>
  );
};


export default LoadingScreen;