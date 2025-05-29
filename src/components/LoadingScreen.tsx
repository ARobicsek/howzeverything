// src/components/LoadingScreen.tsx
import React from 'react';
import { COLORS, FONTS } from '../constants';

const LoadingScreen: React.FC = () => (
  <div 
    className="min-h-screen flex items-center justify-center" 
    style={{
      backgroundColor: COLORS.background, 
      ...FONTS.elegant, 
      color: COLORS.text
    }}
  >
    Loading menu...
  </div>
);

export default LoadingScreen;