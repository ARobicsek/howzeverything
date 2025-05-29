// src/components/ErrorScreen.tsx
import React from 'react';
import { COLORS, FONTS, STYLES } from '../constants';

interface ErrorScreenProps {
  error: string;
  onBack: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onBack }) => (
  <div 
    className="min-h-screen flex flex-col items-center justify-center p-6" 
    style={{
      backgroundColor: COLORS.background, 
      ...FONTS.elegant, 
      color: COLORS.text
    }}
  >
    <p className="text-xl mb-4">{error}</p>
    <button 
      onClick={onBack} 
      style={{
        ...STYLES.primaryButton, 
        background: COLORS.primary, 
        width: 'auto'
      }}
    >
      {error.includes('not found') ? 'Go Back' : 'Try Again'}
    </button>
  </div>
);

export default ErrorScreen;