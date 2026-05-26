import React, { useState, useEffect } from 'react';

export function useBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);

  useEffect(() => {
    if (!('getBattery' in navigator)) return;

    (navigator as any).getBattery().then((batt: any) => {
      const updateBattery = () => {
        setBattery({
          level: batt.level * 100,
          charging: batt.charging,
        });
      };
      updateBattery();
      batt.addEventListener('levelchange', updateBattery);
      batt.addEventListener('chargingchange', updateBattery);
    });
  }, []);

  return battery;
}

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation(pos.coords),
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
}
