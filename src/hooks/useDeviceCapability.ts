import { useState, useEffect } from 'react';

export interface DeviceCapabilities {
  isLowEndDevice: boolean;
  isSlowConnection: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  shouldAutoPlayVideo: boolean;
  allowVideoOverride: boolean;
  toggleVideoOverride: () => void;
}

interface NavigatorExtended {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
    addEventListener?: (type: string, listener: () => void) => void;
    removeEventListener?: (type: string, listener: () => void) => void;
  };
  mozConnection?: NavigatorExtended['connection'];
  webkitConnection?: NavigatorExtended['connection'];
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export function useDeviceCapability(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<{
    isLowEndDevice: boolean;
    isSlowConnection: boolean;
    isMobile: boolean;
    prefersReducedMotion: boolean;
  }>(() => {
    if (typeof window === 'undefined') {
      return {
        isLowEndDevice: false,
        isSlowConnection: false,
        isMobile: false,
        prefersReducedMotion: false,
      };
    }

    const nav = navigator as unknown as NavigatorExtended;

    // 1. Connection check (Data-Saver / 2G / 3G)
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    const isSlowConn = Boolean(
      conn && (
        conn.saveData ||
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g' ||
        conn.effectiveType === '3g'
      )
    );

    // 2. Hardware constraints (RAM <= 4GB or CPU Cores <= 4)
    const memory = nav.deviceMemory || 8;
    const cores = nav.hardwareConcurrency || 8;
    const isLowEnd = memory <= 4 || cores <= 4;

    // 3. Screen / Mobile check
    const isMobileScreen = window.innerWidth < 768;

    // 4. Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = motionQuery.matches;

    return {
      isLowEndDevice: isLowEnd,
      isSlowConnection: isSlowConn,
      isMobile: isMobileScreen,
      prefersReducedMotion: reducedMotion,
    };
  });

  const [allowVideoOverride, setAllowVideoOverride] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = navigator as unknown as NavigatorExtended;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateCapabilities = () => {
      const isSlowConn = Boolean(
        conn && (
          conn.saveData ||
          conn.effectiveType === 'slow-2g' ||
          conn.effectiveType === '2g' ||
          conn.effectiveType === '3g'
        )
      );
      const memory = nav.deviceMemory || 8;
      const cores = nav.hardwareConcurrency || 8;
      const isLowEnd = memory <= 4 || cores <= 4;
      const isMobileScreen = window.innerWidth < 768;

      setCapabilities({
        isLowEndDevice: isLowEnd,
        isSlowConnection: isSlowConn,
        isMobile: isMobileScreen,
        prefersReducedMotion: motionQuery.matches,
      });
    };

    window.addEventListener('resize', updateCapabilities);
    motionQuery.addEventListener('change', updateCapabilities);
    if (conn) {
      conn.addEventListener?.('change', updateCapabilities);
    }

    return () => {
      window.removeEventListener('resize', updateCapabilities);
      motionQuery.removeEventListener('change', updateCapabilities);
      if (conn) {
        conn.removeEventListener?.('change', updateCapabilities);
      }
    };
  }, []);

  // Determine if video should autoplay smoothly without causing stutter or data overage
  const shouldAutoPlayVideo =
    allowVideoOverride ||
    (!capabilities.prefersReducedMotion &&
      !capabilities.isSlowConnection &&
      !capabilities.isLowEndDevice);

  const toggleVideoOverride = () => {
    setAllowVideoOverride((prev) => !prev);
  };

  return {
    ...capabilities,
    shouldAutoPlayVideo,
    allowVideoOverride,
    toggleVideoOverride,
  };
}
