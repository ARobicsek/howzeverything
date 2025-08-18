// src/hooks/useLocationService.tsx
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { BrowserInfo, LocationDenialType, LocationState } from '../types/location';
import { getBrowserInfo } from '../utils/browserDetection';


interface LocationContextType extends LocationState {
  browserInfo: BrowserInfo;
  requestLocation: () => void;
  refreshLocation: () => Promise<{ latitude: number, longitude: number } | null>;
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
  const requestPromiseRef = useRef<Promise<GeolocationPosition> | null>(null);


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
    if (!initialCheckComplete) setInitialCheckComplete(true);
  }, [initialCheckComplete]);


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
    if (!initialCheckComplete) setInitialCheckComplete(true);
  }, [initialCheckComplete]);


  const checkAndFetchLocation = useCallback(() => {
    if (requestPromiseRef.current) {
        return requestPromiseRef.current;
    }

    const promise = new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                status: 'denied',
                denialType: 'browser',
                lastChecked: Date.now(),
            }));
            if (!initialCheckComplete) setInitialCheckComplete(true);
            reject(new Error('Geolocation not supported'));
            return;
        }

        setState(prev => ({ ...prev, status: 'requesting' }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(position);
                resolve(position);
            },
            (error) => {
                handleError(error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }).finally(() => {
        requestPromiseRef.current = null;
    });

    requestPromiseRef.current = promise;
    return promise;
  }, [setLocation, handleError, initialCheckComplete]);


  const fetchCoordinatesIfGranted = useCallback(async () => {
    if (!navigator.permissions || state.coordinates || state.status === 'requesting') return;
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (permissionStatus.state === 'granted') {
        checkAndFetchLocation().catch(() => {});
      }
    } catch {
      // This is a proactive check, so we can ignore errors.
    }
  }, [state.coordinates, state.status, checkAndFetchLocation]);


  // Main event handler for focus and visibility changes
  useEffect(() => {
    const handleAction = () => {
      if (!state.coordinates && state.status !== 'requesting') {
        checkAndFetchLocation().catch(() => {});
      }
      setTimeout(() => fetchCoordinatesIfGranted(), 500);
    };


    window.addEventListener('focus', handleAction);
    document.addEventListener('visibilitychange', handleAction);


    // Initial check on mount
    if (state.status === 'idle' && !state.coordinates) {
        checkAndFetchLocation().catch(() => {});
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
      if (permissionStatus?.state === 'granted' && !state.coordinates && state.status !== 'requesting') {
        checkAndFetchLocation().catch(() => {});
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
  }, [state.coordinates, state.status, checkAndFetchLocation]);


  // Safety valve for stuck "requesting" state
  useEffect(() => {
    if (state.status === 'requesting') {
      const timeout = setTimeout(() => {
        if (state.status === 'requesting') {
          requestPromiseRef.current = null;
          const timeoutError: GeolocationPositionError = {
            code: 3, // GeolocationPositionError.TIMEOUT
            message: "Location request timed out.",
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          };
          setState(prev => ({
            ...prev,
            status: 'denied',
            denialType: 'unavailable',
            error: timeoutError,
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
    } else if (state.status !== 'requesting') {
      checkAndFetchLocation().catch(() => {});
    }
  }, [state.status, openPermissionModal, checkAndFetchLocation]);
 
  const refreshLocation = useCallback(async () => {
    try {
      const position = await checkAndFetchLocation();
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch (error) {
      console.error('Failed to refresh location:', error);
      return null;
    }
  }, [checkAndFetchLocation]);
 
  const value = {
    ...state,
    browserInfo,
    requestLocation,
    refreshLocation,
    isAvailable: state.status === 'granted' && state.coordinates !== null,
    isPermissionModalOpen,
    openPermissionModal,
    closePermissionModal,
    initialCheckComplete,
  };


  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};


// eslint-disable-next-line react-refresh/only-export-components
export const useLocationService = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationService must be used within a LocationProvider');
  }
  return context;
};