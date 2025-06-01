// src/components/ErrorScreen.tsx
import React from 'react';
import { COLORS, FONTS } from '../constants';

interface ErrorScreenProps {
  error: string;
  onBack?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onBack }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          ⚠️
        </div>
        
        <h2 style={{
          ...FONTS.elegant,
          fontSize: '24px',
          fontWeight: '600',
          color: COLORS.text,
          margin: '0 0 16px 0'
        }}>
          Oops! Something went wrong
        </h2>
        
        <p style={{
          ...FONTS.elegant,
          fontSize: '16px',
          color: COLORS.textDark,
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          {error}
        </p>
        
        {onBack && (
          <button
            onClick={onBack}
            style={{
              ...FONTS.elegant,
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;