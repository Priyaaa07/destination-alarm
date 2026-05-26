import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Navigation, Grid3X3, Eye, Compass } from 'lucide-react';

interface LeafletMapProps {
  userLat: number;
  userLng: number;
  destLat: number;
  destLng: number;
  triggerDistKm: number;
  isSimulating?: boolean;
}

type MapProvider = 'google-road' | 'google-hybrid' | 'safejourney-cyber';

export function LeafletMap({ 
  userLat, 
  userLng, 
  destLat, 
  destLng, 
  triggerDistKm,
  isSimulating = false
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Layer and vector references to update dynamic positions
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const triggerCircleRef = useRef<L.Circle | null>(null);

  const [mapProvider, setMapProvider] = useState<MapProvider>('safejourney-cyber');

  const providerUrls: Record<MapProvider, { url: string; attribution: string }> = {
    'google-road': {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Street View'
    },
    'google-hybrid': {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Hybrid/Satellite'
    },
    'safejourney-cyber': {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> dark tiles'
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create the Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: 13,
      zoomControl: false, // will style custom controls
      attributionControl: false
    });

    mapRef.current = map;

    // Add Tile Layer
    const activeProvider = providerUrls[mapProvider];
    const tiles = L.tileLayer(activeProvider.url, {
      maxZoom: 20,
      attribution: activeProvider.attribution
    }).addTo(map);
    tileLayerRef.current = tiles;

    // Create customized HTML element markers
    const userIcon = L.divIcon({
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-full h-full bg-cyan-400 opacity-25 rounded-full animate-ping"></div>
          <div class="w-3.5 h-3.5 bg-cyan-400 border-2 border-brand-deep rounded-full shadow-[0_0_12px_#22d3ee]"></div>
        </div>
      `,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const destIcon = L.divIcon({
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-full h-full bg-purple-500 opacity-20 rounded-full animate-pulse"></div>
          <div class="w-3.5 h-3.5 bg-brand-purple border-2 border-brand-deep rounded-full shadow-[0_0_12px_#c084fc]"></div>
          <div class="absolute -top-6 bg-brand-deep/90 text-brand-cyan border border-brand-cyan/20 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg uppercase tracking-wider">
            SafeZone
          </div>
        </div>
      `,
      className: 'custom-dest-marker',
      iconSize: [32, 24],
      iconAnchor: [16, 12]
    });

    // Plant Markers
    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
    const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
    
    // Polyline connector
    const routeLine = L.polyline([[userLat, userLng], [destLat, destLng]], {
      color: '#22d3ee',
      weight: 3.5,
      dashArray: '8, 8',
      className: 'neon-route-line'
    }).addTo(map);

    // Dynamic SafeZone geofence trigger radius around destination
    // Conversion: triggerDistKm in meters
    const triggerCircle = L.circle([destLat, destLng], {
      radius: triggerDistKm * 1000,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(map);

    userMarkerRef.current = userMarker;
    destMarkerRef.current = destMarker;
    routeLineRef.current = routeLine;
    triggerCircleRef.current = triggerCircle;

    // Fit bounds to show both user and target destination
    try {
      map.fitBounds([
        [userLat, userLng],
        [destLat, destLng]
      ], { padding: [50, 50] });
    } catch (e) {
      // fallback safe center
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Provider Tile URLs when toggled via interface controls
  useEffect(() => {
    if (tileLayerRef.current && mapRef.current) {
      const activeProvider = providerUrls[mapProvider];
      tileLayerRef.current.setUrl(activeProvider.url);
    }
  }, [mapProvider]);

  // Handle Dynamic Real-Time Marker Coordinate Updates (every second)
  useEffect(() => {
    if (!mapRef.current) return;

    // Update user marker coordinates
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    }

    // Update destination marker coordinates (just in case)
    if (destMarkerRef.current) {
      destMarkerRef.current.setLatLng([destLat, destLng]);
    }

    // Refresh dashed connecting polyline route
    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs([
        [userLat, userLng],
        [destLat, destLng]
      ]);
    }

    // Re-draw trigger radius circle
    if (triggerCircleRef.current) {
      triggerCircleRef.current.setLatLng([destLat, destLng]);
      triggerCircleRef.current.setRadius(triggerDistKm * 1000);
    }

    // Let map pane center frame around user coordinates or fit boundaries smoothly during simulation
    if (isSimulating) {
      mapRef.current.setView([userLat, userLng], mapRef.current.getZoom(), { animate: true });
    }
  }, [userLat, userLng, destLat, destLng, triggerDistKm, isSimulating]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
      {/* Dynamic leafet container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer selector bar overlay */}
      <div className="absolute top-4 left-4 z-[400] flex gap-2">
        <div className="bg-brand-deep/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-lg">
          <Layers size={13} className="text-brand-cyan" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white/80">Map Engine</span>
          <div className="h-3 w-[1px] bg-white/20 mx-1" />
          <select
            value={mapProvider}
            onChange={(e) => setMapProvider(e.target.value as MapProvider)}
            className="bg-transparent text-[10px] font-bold text-brand-cyan outline-none cursor-pointer uppercase font-mono"
          >
            <option value="safejourney-cyber" className="bg-brand-deep text-white">Cyber Dark</option>
            <option value="google-road" className="bg-brand-deep text-white">Google Street</option>
            <option value="google-hybrid" className="bg-brand-deep text-white">Google Hybrid</option>
          </select>
        </div>
      </div>

      {/* Mini coordinates telemetry HUD */}
      <div className="absolute bottom-4 right-4 z-[400] bg-brand-deep/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg text-[9px] font-mono text-white/70 max-w-[200px]">
        <div className="flex items-center gap-1.5 mb-1 select-none">
          <Compass size={11} className="text-brand-purple animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-extrabold uppercase text-white/90">Sentinel GPS Telemetry</span>
        </div>
        <p className="truncate">Lat: {userLat.toFixed(5)}° N</p>
        <p className="truncate">Lng: {userLng.toFixed(5)}° E</p>
      </div>
    </div>
  );
}
