// src/components/LoadingScreen.tsx
import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="py-32 px-4 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="loading-spinner w-12 h-12 border-3 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="font-body text-lg text-textSecondary m-0">
          {message || 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;