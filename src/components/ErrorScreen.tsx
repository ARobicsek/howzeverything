// src/components/ErrorScreen.tsx
import React from 'react';
import { COLORS, FONT_FAMILIES, SPACING, STYLES, TYPOGRAPHY } from '../constants'; // Added STYLES for button

interface ErrorScreenProps { // Renamed from LoadingScreenProps
  error: string; // Added error prop
  onBack: () => void; // Added onBack prop
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onBack }) => { // Changed component name to ErrorScreen, destructured props
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
        gap: SPACING[4],
        backgroundColor: COLORS.white, // Added background for better presentation
        padding: SPACING[6],
        borderRadius: STYLES.borderRadiusLarge,
        boxShadow: STYLES.shadowMedium,
        border: `1px solid ${COLORS.gray200}`
      }}>
        {/* Error icon or message */}
        <div style={{ fontSize: '3rem', marginBottom: SPACING[2] }}>❌</div>
        <p style={{
          fontFamily: FONT_FAMILIES.heading, fontWeight: '600', letterSpacing: '-0.025em', // Using heading for emphasis
          fontSize: TYPOGRAPHY.lg.fontSize,
          color: COLORS.danger, // Use danger color for errors
          margin: 0,
          textAlign: 'center'
        }}>
          Error!
        </p>
        <p style={{ // Display the actual error message
          fontFamily: FONT_FAMILIES.body, lineHeight: '1.5',
          fontSize: TYPOGRAPHY.base.fontSize,
          color: COLORS.textSecondary,
          margin: 0,
          textAlign: 'center'
        }}>
          {error}
        </p>
        <button
          onClick={onBack}
          style={{
            ...STYLES.secondaryButton, // Using a secondary button style
            marginTop: SPACING[4],
            padding: `${SPACING[3]} ${SPACING[5]}`
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen; // Export as ErrorScreen