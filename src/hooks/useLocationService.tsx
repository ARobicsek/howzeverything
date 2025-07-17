// src/hooks/useLocationService.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { BrowserInfo, LocationDenialType, LocationState } from '../types/location';
import { getBrowserInfo } from '../utils/browserDetection';

interface LocationContextType extends LocationState {
  browserInfo: BrowserInfo;
  requestLocation: () => void;
  isAvailable: boolean;
  isPermissionModalOpen: boolean;
  openPermissionModal: () => void;
  closePermissionModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    denialType: null,
    coordinates: null,
    error: null,
    lastChecked: null,
  });
  const [browserInfo] = useState<BrowserInfo>(getBrowserInfo());
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const openPermissionModal = useCallback(() => setIsPermissionModalOpen(true), []);
  const closePermissionModal = useCallback(() => setIsPermissionModalOpen(false), []);

  const setLocation = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const coordinates = { latitude, longitude };

    setState(prev => ({
      ...prev,
      status: 'granted',
      coordinates,
      error: null,
      denialType: null,
      lastChecked: Date.now(),
    }));
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let denialType: LocationDenialType = 'unavailable';
    if (error.code === error.PERMISSION_DENIED) {
      denialType = 'site';
    }
    setState(prev => ({
      ...prev,
      status: 'denied',
      denialType,
      coordinates: null,
      error,
      lastChecked: Date.now(),
    }));
  }, []);

  const checkInitialState = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, status: 'denied', denialType: 'browser', lastChecked: Date.now() }));
      return;
    }

    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permissionStatus.state === 'granted') {
          setState(prev => ({ ...prev, status: 'requesting' }));
          navigator.geolocation.getCurrentPosition(setLocation, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        } else if (permissionStatus.state === 'denied') {
          setState(prev => ({ ...prev, status: 'denied', denialType: 'site', lastChecked: Date.now() }));
        } else { // 'prompt'
          setState(prev => ({ ...prev, status: 'idle', lastChecked: Date.now() }));
        }

        permissionStatus.onchange = () => checkInitialState();
      } catch (error) {
         console.warn('Permissions API not supported or failed, falling back.', error);
         setState(prev => ({ ...prev, status: 'idle', lastChecked: Date.now() }));
      }
    } else {
        setState(prev => ({ ...prev, status: 'requesting' }));
        navigator.geolocation.getCurrentPosition(setLocation, handleError);
    }
  }, [setLocation, handleError]);

  const requestLocation = useCallback(() => {
    if (state.status === 'denied') {
      openPermissionModal();
    } else if (state.status === 'idle') {
      setState(prev => ({ ...prev, status: 'requesting' }));
      navigator.geolocation.getCurrentPosition(setLocation, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, 
      });
    }
  }, [state.status, openPermissionModal, setLocation, handleError]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInitialState();
      }
    };

    checkInitialState();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkInitialState]);

  const value = {
    ...state,
    browserInfo,
    requestLocation,
    isAvailable: state.status === 'granted' && state.coordinates !== null,
    isPermissionModalOpen,
    openPermissionModal,
    closePermissionModal,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationService = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationService must be used within a LocationProvider');
  }
  return context;
};