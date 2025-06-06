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
      <p style={{ fontSize: '18px', ...FONTS.elegant }}>  
        {message || 'Loading...'} {/* Display the message or a default */}  
      </p>  
    </div>  
  );  
};

export default LoadingScreen;