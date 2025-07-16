// src/utils/browserDetection.ts
import { BrowserInfo } from '../types/location';

export const getBrowserInfo = (): BrowserInfo => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);

  let browser: BrowserInfo['browser'] = 'Browser';
  if (isIOS) {
    if (ua.includes('CriOS')) {
      browser = 'Chrome';
    } else if (ua.includes('FxiOS')) {
      browser = 'Firefox';
    } else if (ua.includes('EdgiOS')) {
      browser = 'Edge';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
    }
  } else {
    if (ua.includes('Edg')) {
      browser = 'Edge';
    } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Android')) {
      browser = 'Safari';
    }
  }

  return {
    isIOS,
    isAndroid,
    browser,
    os: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Unknown'
  };
};