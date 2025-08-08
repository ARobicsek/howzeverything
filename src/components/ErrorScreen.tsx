// src/components/ErrorScreen.tsx
import React from 'react';

interface ErrorScreenProps {
  error: string;
  onBack: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="text-5xl mb-2">❌</div>
        <p className="font-heading text-lg text-danger m-0 text-center">
          Error!
        </p>
        <p className="font-body text-base text-textSecondary m-0 text-center">
          {error}
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-5 py-3 rounded-lg border-2 border-primary text-primary bg-white hover:bg-gray-100 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;