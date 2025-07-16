// src/components/location/LocationAwareButton.tsx
import React from 'react';
import { COLORS } from '../../constants';
import { useLocationService } from '../../hooks/useLocationService';
import LocationPermissionModal from './LocationPermissionModal';


const LocationAwareButton: React.FC = () => {
  const { status, requestLocation, isAvailable, openPermissionModal, isPermissionModalOpen, closePermissionModal } = useLocationService();


  // If location is already granted and available, do not render the button.
  if (isAvailable) {
    return null;
  }


  const handleClick = () => {
    if (status === 'denied') {
      openPermissionModal();
    } else if (status === 'idle' || status === 'requesting') {
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
        <div style={{ animation: status === 'requesting' ? 'spin 1.5s linear infinite' : 'none', color: COLORS.white, width: '25px', height: '25px' }}>
            <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.2">
                <path d="M5.5 16.5H19.5M5.5 8.5H19.5M4.5 12.5H20.5M12.5 20.5C12.5 20.5 8 18.5 8 12.5C8 6.5 12.5 4.5 12.5 4.5M12.5 4.5C12.5 4.5 17 6.5 17 12.5C17 18.5 12.5 20.5 12.5 20.5M12.5 4.5V20.5M20.5 12.5C20.5 16.9183 16.9183 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 8.08172 8.08172 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5Z"></path>
            </svg>
        </div>
      </button>
      <LocationPermissionModal isOpen={isPermissionModalOpen} onClose={closePermissionModal} />
    </>
  );
};


export default LocationAwareButton;