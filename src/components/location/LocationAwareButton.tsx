// src/components/location/LocationAwareButton.tsx
import React from 'react';
import { COLORS } from '../../constants';
import { useLocationService } from '../../hooks/useLocationService';
import LocationPermissionModal from './LocationPermissionModal';

const LocationAwareButton: React.FC = () => {
  const { status, requestLocation, isAvailable } = useLocationService();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // If location is already granted and available, do not render the button.
  if (isAvailable) {
    return null;
  }

  const handleClick = () => {
    if (status === 'denied') {
      setIsModalOpen(true);
    } else if (status === 'idle') {
      requestLocation();
    }
  };

  const getTitle = () => {
     switch (status) {
      case 'requesting':
        return "Requesting location...";
      case 'denied':
        return "Location services denied. Click for help.";
      case 'idle':
         return "Turn on location services";
      default:
        return "Location status";
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        title={getTitle()}
        aria-label={getTitle()}
      >
        <div style={{ animation: status === 'requesting' ? 'spin 1.5s linear infinite' : 'none' }}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/>
                <path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/>
                <path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/>
                <circle cx="12" cy="12" r="10"/>
            </svg>
        </div>
      </button>
      <LocationPermissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default LocationAwareButton;