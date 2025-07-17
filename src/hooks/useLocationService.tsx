// src/hooks/useLocationService.tsx
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { BrowserInfo, LocationDenialType, LocationState } from '../types/location';
import { getBrowserInfo } from '../utils/browserDetection';

interface LocationContextType extends LocationState {
  browserInfo: BrowserInfo;
  requestLocation: () => void;
  isAvailable: boolean;
  isPermissionModalOpen: boolean;
  openPermissionModal: () => void;
  closePermissionModal: () => void;
  initialCheckComplete: boolean;
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
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const isRequestingRef = useRef(false);

  const openPermissionModal = useCallback(() => setIsPermissionModalOpen(true), []);
  const closePermissionModal = useCallback(() => setIsPermissionModalOpen(false), []);

  const setLocation = useCallback((position: GeolocationPosition) => {
    isRequestingRef.current = false;
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
    if (!initialCheckComplete) setInitialCheckComplete(true);
  }, [initialCheckComplete]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    isRequestingRef.current = false;
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
    if (!initialCheckComplete) setInitialCheckComplete(true);
  }, [initialCheckComplete]);

  const checkAndFetchLocation = useCallback(async () => {
    if (isRequestingRef.current) return;

    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, status: 'denied', denialType: 'browser', lastChecked: Date.now() }));
      setInitialCheckComplete(true);
      return;
    }

    isRequestingRef.current = true;
    setState(prev => ({ ...prev, status: 'requesting' }));

    try {
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

        if (permissionStatus.state === 'granted') {
          navigator.geolocation.getCurrentPosition(setLocation, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        } else if (permissionStatus.state === 'denied') {
          handleError({
            code: GeolocationPositionError.PERMISSION_DENIED,
            message: 'Permission denied by user.',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          });
        } else { // 'prompt'
          isRequestingRef.current = false;
          setState(prev => ({ ...prev, status: 'idle', denialType: null, coordinates: null, error: null, lastChecked: Date.now() }));
          setInitialCheckComplete(true);
        }
      } else {
        // Fallback for older browsers without Permissions API
        navigator.geolocation.getCurrentPosition(setLocation, handleError);
      }
    } catch (error) {
      // Fallback if the Permissions API itself throws an error
      handleError({
        code: GeolocationPositionError.POSITION_UNAVAILABLE,
        message: 'Location service unavailable.',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    }
  }, [setLocation, handleError]);

  const requestLocation = useCallback(() => {
    if (state.status === 'denied') {
      openPermissionModal();
    } else if (state.status === 'idle') {
      checkAndFetchLocation();
    }
  }, [state.status, openPermissionModal, checkAndFetchLocation]);

  useEffect(() => {
    const recheck = () => {
      if (document.visibilityState === 'visible') {
        checkAndFetchLocation();
      }
    };

    window.addEventListener('focus', recheck);
    document.addEventListener('visibilitychange', recheck);
    
    let permissionStatus: PermissionStatus | null = null;
    const handleChange = () => recheck();

    navigator.permissions?.query({ name: 'geolocation' }).then(status => {
      permissionStatus = status;
      permissionStatus.addEventListener('change', handleChange);
    });

    recheck(); // Initial check

    return () => {
      window.removeEventListener('focus', recheck);
      document.removeEventListener('visibilitychange', recheck);
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handleChange);
      }
    };
  }, [checkAndFetchLocation]);

  const value = {
    ...state,
    browserInfo,
    requestLocation,
    isAvailable: state.status === 'granted' && state.coordinates !== null,
    isPermissionModalOpen,
    openPermissionModal,
    closePermissionModal,
    initialCheckComplete,
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