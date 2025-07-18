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

  const checkAndFetchLocation = useCallback(() => {
    if (isRequestingRef.current) return;

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        status: 'denied',
        denialType: 'browser',
        lastChecked: Date.now(),
      }));
      setInitialCheckComplete(true);
      return;
    }

    isRequestingRef.current = true;
    setState(prev => ({ ...prev, status: 'requesting' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
      },
      (error) => {
        handleError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setLocation, handleError]);

  const fetchCoordinatesIfGranted = useCallback(async () => {
    if (!navigator.permissions || state.coordinates || isRequestingRef.current) return;
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (permissionStatus.state === 'granted' && state.status !== 'requesting') {
        checkAndFetchLocation();
      }
    } catch (error) {
      // This is a proactive check, so we can ignore errors.
      // The main checkAndFetchLocation will handle the user flow.
    }
  }, [state.coordinates, state.status, checkAndFetchLocation]);

  // Main event handler for focus and visibility changes
  useEffect(() => {
    const handleAction = () => {
      if (!state.coordinates && state.status !== 'requesting') {
        checkAndFetchLocation();
      }
      setTimeout(() => fetchCoordinatesIfGranted(), 500);
    };

    window.addEventListener('focus', handleAction);
    document.addEventListener('visibilitychange', handleAction);

    // Initial check on mount
    if (state.status === 'idle' && !state.coordinates) {
        checkAndFetchLocation();
    }

    return () => {
      window.removeEventListener('focus', handleAction);
      document.removeEventListener('visibilitychange', handleAction);
    };
  }, [state.coordinates, state.status, checkAndFetchLocation, fetchCoordinatesIfGranted]);
  
  // Listener specifically for permission state changes
  useEffect(() => {
    if (!navigator.permissions) return;
    let permissionStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (permissionStatus?.state === 'granted' && !state.coordinates) {
        checkAndFetchLocation();
      } else if (permissionStatus?.state === 'denied') {
        setState(prev => ({
          ...prev,
          status: 'denied',
          denialType: 'site',
          coordinates: null,
          lastChecked: Date.now(),
        }));
        setInitialCheckComplete(true);
      }
    };

    navigator.permissions.query({ name: 'geolocation' })
      .then(status => {
        permissionStatus = status;
        permissionStatus.addEventListener('change', handlePermissionChange);
      })
      .catch(() => {});

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handlePermissionChange);
      }
    };
  }, [state.coordinates, checkAndFetchLocation]);

  // Safety valve for stuck "requesting" state
  useEffect(() => {
    if (state.status === 'requesting') {
      const timeout = setTimeout(() => {
        if (isRequestingRef.current) {
          isRequestingRef.current = false;
          setState(prev => ({
            ...prev,
            status: 'idle',
            lastChecked: Date.now(),
          }));
          setInitialCheckComplete(true);
        }
      }, 15000); // 15 seconds

      return () => clearTimeout(timeout);
    }
  }, [state.status]);

  const requestLocation = useCallback(() => {
    if (state.status === 'denied') {
      openPermissionModal();
    } else if (state.status === 'idle') {
      checkAndFetchLocation();
    }
  }, [state.status, openPermissionModal, checkAndFetchLocation]);
  
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