// src/hooks/useLocationService.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { BrowserInfo, LocationDenialType, LocationState } from '../types/location';
import { getBrowserInfo } from '../utils/browserDetection';


const LOCATION_CACHE_KEY = 'howzeverything-user-location';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes


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
    const locationData = { coordinates, timestamp: Date.now() };


    try {
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } catch (e) {
      console.warn('Failed to save location to localStorage:', e);
    }


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
      // In modern browsers, it's hard to distinguish programmatically between
      // browser-level and site-level denial without complex heuristics.
      // We'll use a general 'site' denial type and provide instructions that cover both.
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


  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, status: 'denied', denialType: 'browser', lastChecked: Date.now() }));
      return;
    }


    setState(prev => ({ ...prev, status: 'requesting' }));


    navigator.geolocation.getCurrentPosition(setLocation, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, [setLocation, handleError]);


  // Initial check on load
  useEffect(() => {
    const checkInitialState = async () => {
      // 1. Check for a valid cache
      try {
        const cachedItem = localStorage.getItem(LOCATION_CACHE_KEY);
        if (cachedItem) {
          const cachedData = JSON.parse(cachedItem);
          if (Date.now() - cachedData.timestamp < CACHE_TTL_MS) {
            setState(prev => ({
              ...prev,
              status: 'granted',
              coordinates: cachedData.coordinates,
              lastChecked: cachedData.timestamp,
            }));
            return; // Found valid cache, we're done.
          }
        }
      } catch (e) {
        console.warn('Failed to read location from cache', e);
      }


      // 2. If no valid cache, check permissions silently
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          if (permissionStatus.state === 'granted') {
            // Permission is granted, but we don't have a fresh location.
            // Let's get it.
            requestLocation();
          } else if (permissionStatus.state === 'denied') {
            setState(prev => ({ ...prev, status: 'denied', denialType: 'site', lastChecked: Date.now() }));
          } else {
            // State is 'prompt', so we remain 'idle'.
             setState(prev => ({ ...prev, status: 'idle', lastChecked: Date.now() }));
          }
           permissionStatus.onchange = () => checkInitialState();
        } catch (error) {
           console.warn('Permissions API not supported or failed, falling back to idle state.', error);
           setState(prev => ({ ...prev, status: 'idle', lastChecked: Date.now() }));
        }
      } else {
         // Fallback for older browsers without Permissions API
         setState(prev => ({ ...prev, status: 'idle', lastChecked: Date.now() }));
      }
    };
    checkInitialState();
  }, [requestLocation]);


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