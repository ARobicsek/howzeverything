// src/types/location.ts
export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export type LocationDenialType = 'browser' | 'site' | 'unavailable';

export interface LocationState {
  status: LocationStatus;
  denialType: LocationDenialType | null;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  error: GeolocationPositionError | null;
  lastChecked: number | null;
}

export interface BrowserInfo {
  isIOS: boolean;
  isAndroid: boolean;
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Browser';
  os: 'iOS' | 'Android' | 'Unknown';
}