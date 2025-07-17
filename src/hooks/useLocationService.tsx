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
    setInitialCheckComplete(true);
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
    setInitialCheckComplete(true);
  }, []);




  const checkAndFetchLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, status: 'denied', denialType: 'browser', lastChecked: Date.now() }));
      setInitialCheckComplete(true);
      return;
    }


    // Use a functional update to check the most recent state without adding a dependency
    setState(prevState => {
      // Don't re-fetch if a request is already in flight.
      if (prevState.status === 'requesting') {
        return prevState;
      }


      (async () => {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });


          if (permissionStatus.state === 'granted') {
            setState(p => ({ ...p, status: 'requesting' }));
            navigator.geolocation.getCurrentPosition(setLocation, handleError, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          } else if (permissionStatus.state === 'denied') {
            // Manually create an error object because one isn't provided by the permissions API
            handleError({
              code: GeolocationPositionError.PERMISSION_DENIED,
              message: 'Permission denied by user.',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          } else { // 'prompt'
            setState(p => ({ ...p, status: 'idle', denialType: null, coordinates: null, error: null, lastChecked: Date.now() }));
            setInitialCheckComplete(true);
          }
        } catch (error) {
          // Fallback for browsers that don't support the Permissions API.
          setState(p => ({ ...p, status: 'requesting' }));
          navigator.geolocation.getCurrentPosition(setLocation, handleError);
        }
      })();


      return prevState; // Return original state for this render pass
    });
  }, [setLocation, handleError]);


  // This useEffect runs once on mount to set up listeners.
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