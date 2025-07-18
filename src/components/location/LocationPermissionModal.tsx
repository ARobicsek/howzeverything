// src/components/location/LocationPermissionModal.tsx
import React from 'react';
import { COLORS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import { useLocationService } from '../../hooks/useLocationService';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ isOpen, onClose }) => {
  const { denialType, browserInfo } = useLocationService();

  if (!isOpen) return null;

  const getInstructions = () => {
    const { os, browser } = browserInfo;
    
    let instructions = '';

    if (denialType === 'browser') {
      instructions = "Your browser is not configured to allow location services. Please check your browser's main settings.";
    } else if (os === 'iOS') {
      instructions = `To enable location for ${browser} on your device:\n\n1. Open the Settings app\n2. Tap 'Privacy & Security'\n3. Tap 'Location Services' (make sure it's ON)\n4. Scroll down and find '${browser}'\n5. Select 'While Using the App'\n6. Refresh HowzEverything`;
    } else if (os === 'Android') {
      instructions = `To enable location for ${browser} on your device:\n\n1. Open Settings\n2. Tap 'Location'\n3. Tap 'App permissions'\n4. Find and tap on '${browser}'\n5. Select 'Allow only while using the app'\n6. Refresh HowzEverything`;
    } else {
      instructions = "To enable location services, please go to your browser's settings for this site and change the Location permission to 'Allow' or 'Ask'. Then refresh HowzEverything.";
    }

    return instructions;
  };

  const message = getInstructions();

  return (
    <div style={STYLES.modalOverlay} onClick={onClose}>
      <div style={{ ...STYLES.modal, maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ ...TYPOGRAPHY.h3, marginTop: 0, color: COLORS.textPrimary }}>
          HowzEverything is much more fun if location services are enabled.
        </h3>
        <p style={{ ...TYPOGRAPHY.body, whiteSpace: 'pre-wrap', color: COLORS.textSecondary, marginTop: SPACING[4] }}>
          {message}
        </p>
        <div style={{ marginTop: SPACING[6], display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...STYLES.primaryButton, minWidth: '120px' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;