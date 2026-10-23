import { useState, useEffect } from 'react';

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

interface NavigatorWithConnection {
  connection?: NetworkInformation;
}

export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // Check media query
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return true;

    // Check data saver mode
    const nav = navigator as unknown as NavigatorWithConnection;
    if (nav.connection && (nav.connection.saveData || nav.connection.effectiveType === 'slow-2g' || nav.connection.effectiveType === '2g')) {
      return true;
    }

    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      const nav = navigator as unknown as NavigatorWithConnection;
      const isDataSaver = Boolean(nav.connection && nav.connection.saveData);
      setShouldReduceMotion(motionQuery.matches || isDataSaver);
    };

    motionQuery.addEventListener('change', updateMotion);
    return () => motionQuery.removeEventListener('change', updateMotion);
  }, []);

  return shouldReduceMotion;
}
