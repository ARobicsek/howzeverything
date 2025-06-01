// src/components/LoadingScreen.tsx
import React from 'react';
import { COLORS, FONTS } from '../constants'; // Adjust path if necessary

interface LoadingScreenProps {
  message?: string; // Make message prop optional
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.background, // Or a specific loading screen background
      color: COLORS.text, // Or a specific loading text color
      fontFamily: FONTS.elegant.fontFamily // Use a base font
    }}>
      <svg 
        className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" // Example spinner, adjust color
        style={{ color: COLORS.primary }} // Use a theme color for the spinner
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" cy="12" r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p style={{ marginTop: '16px', fontSize: '18px', ...FONTS.elegant }}>
        {message || 'Loading...'} {/* Display the message or a default */}
      </p>
    </div>
  );
};

export default LoadingScreen;