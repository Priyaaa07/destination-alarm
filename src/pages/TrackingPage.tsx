import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Square, Navigation, Battery, Wifi, MapPin, Play, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBattery, useNetwork, useGeolocation } from '@/src/hooks/useDeviceStatus';
import { calculateDistance } from '@/src/lib/utils';
import { LeafletMap } from '@/src/components/LeafletMap';

export default function TrackingPage() {
  const navigate = useNavigate();
  const battery = useBattery();
  const isOnline = useNetwork();
  
  // Real GPS Geolocation
  const { location: gpsLoc, error: gpsError } = useGeolocation();

  // Retrieve selected destination details
  const [destName, setDestName] = useState(() => localStorage.getItem('selected_destination_name') || 'Electronic City Terminal');
  const [destLat] = useState(() => Number(localStorage.getItem('selected_destination_lat')) || 12.8407);
  const [destLng] = useState(() => Number(localStorage.getItem('selected_destination_lng')) || 77.6763);
  const [baseDistText] = useState(() => localStorage.getItem('selected_destination_base_dist') || '12.4 km');
  
  // Trigger threshold
  const [triggerDist] = useState(() => Number(localStorage.getItem('selected_trigger_distance')) || 5);

  // States
  const [useSimulation, setUseSimulation] = useState(true);
  const [activeView, setActiveView] = useState<'radar' | 'map'>('map');
  const [isPaused, setIsPaused] = useState(false);
  const [distanceRemaining, setDistanceRemaining] = useState(() => {
    // Start with default base distance
    return parseFloat(baseDistText) || 12.4;
  });

  // Current Coordinates state for UI
  const [currCoord, setCurrCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Synchronize current coordinates with GPS or Simulation
  useEffect(() => {
    if (!useSimulation && gpsLoc) {
      setCurrCoord({
        lat: gpsLoc.latitude,
        lng: gpsLoc.longitude
      });
    }
  }, [gpsLoc, useSimulation]);

  // Main Tracking Tick (updates every second)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (useSimulation) {
        // Simulation mode: decrease distance by 0.15 KM every second to show travel simulation
        setDistanceRemaining((prev) => {
          const next = Math.max(0, prev - 0.15);
          
          // Generate simulated intermediate coordinates approaching target
          const fraction = 1 - (next / (parseFloat(baseDistText) || 12.4));
          const stepLat = gpsLoc ? gpsLoc.latitude + (destLat - gpsLoc.latitude) * fraction : dLatSim(fraction);
          const stepLng = gpsLoc ? gpsLoc.longitude + (destLng - gpsLoc.longitude) * fraction : dLngSim(fraction);
          setCurrCoord({ lat: stepLat, lng: stepLng });

          // Alarm Trigger check
          if (next <= triggerDist) {
            clearInterval(interval);
            setTimeout(() => {
              navigate('/alert');
            }, 1000);
          }
          return next;
        });
      } else {
        // True GPS Mode: Compute actual geodesic distance from watchPosition
        if (gpsLoc) {
          const actualKm = calculateDistance(gpsLoc.latitude, gpsLoc.longitude, destLat, destLng);
          setDistanceRemaining(actualKm);

          // Alarm Trigger check
          if (actualKm <= triggerDist) {
            clearInterval(interval);
            setTimeout(() => {
              navigate('/alert');
            }, 1000);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [useSimulation, isPaused, gpsLoc, destLat, destLng, triggerDist, baseDistText, navigate]);

  // Helper mock paths for Bangalore when no device GPS is ready initially
  const dLatSim = (fraction: number) => 12.9716 + (destLat - 12.9716) * fraction;
  const dLngSim = (fraction: number) => 77.5946 + (destLng - 77.5946) * fraction;

  return (
    <div className="min-h-screen p-6 flex flex-col relative overflow-hidden font-sans">
      {/* Background Pulse indicating active smart radar tracking */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="absolute inset-0 bg-brand-cyan/25 rounded-full blur-[100px] -z-10"
      />

      {/* Header Status Bar */}
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 flex items-center justify-center text-brand-cyan relative">
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-brand-deep animate-ping" />
            <Navigation size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">Tracking SafeZone</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono">1s GPS Sentinel Guard</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/5 ${battery && battery.level < 20 ? 'text-red-400' : 'text-white/60'}`}>
            <Battery size={13} /> {battery ? `${Math.round(battery.level)}%` : '85%'}
          </div>
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/5 text-white/60">
            <Wifi size={13} /> {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </header>

      {/* Unified Selector Panel for Transit Mode and Monitor View */}
      <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
        <div className="glass-card p-2.5 flex flex-col justify-between border-white/10">
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-white/50 pl-1 mb-1.5 bh-none">Transit Mode</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setUseSimulation(false)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                !useSimulation 
                  ? 'bg-brand-cyan text-brand-deep shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                  : 'text-white/55 hover:bg-white/5'
              }`}
            >
              True GPS
            </button>
            <button
              onClick={() => setUseSimulation(true)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                useSimulation 
                  ? 'bg-brand-purple text-white shadow-[0_0_8px_rgba(124,58,237,0.4)]' 
                  : 'text-white/55 hover:bg-white/5'
              }`}
            >
              Simulate
            </button>
          </div>
        </div>

        <div className="glass-card p-2.5 flex flex-col justify-between border-white/10">
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-white/50 pl-1 mb-1.5 bh-none">Monitor View</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveView('map')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeView === 'map' 
                  ? 'bg-brand-cyan text-brand-deep shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
                  : 'text-white/55 hover:bg-white/5'
              }`}
            >
              Live Map
            </button>
            <button
              onClick={() => setActiveView('radar')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeView === 'radar' 
                  ? 'bg-brand-purple text-white shadow-[0_0_8px_rgba(124,58,237,0.4)]' 
                  : 'text-white/55 hover:bg-white/5'
              }`}
            >
              Radar HUD
            </button>
          </div>
        </div>
      </div>

      {/* Main Radar Screen / Live Map Container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
        {activeView === 'map' ? (
          <div className="w-full h-64 mb-6 relative">
            <LeafletMap 
              userLat={currCoord?.lat ?? gpsLoc?.latitude ?? 12.9716} 
              userLng={currCoord?.lng ?? gpsLoc?.longitude ?? 77.5946} 
              destLat={destLat} 
              destLng={destLng} 
              triggerDistKm={triggerDist}
              isSimulating={useSimulation}
            />
          </div>
        ) : (
          <div className="relative w-60 h-60 mb-6 flex items-center justify-center">
            {/* Radial radar ripple borders */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-30" />
            <div className="absolute inset-4 rounded-full border border-brand-cyan/10 animate-pulse" />
            
            {/* Circular Progress dial */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="120"
                cy="120"
                r="105"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="5"
                fill="transparent"
                className="translate-x-[12px] translate-y-[12px]"
              />
              <motion.circle
                cx="120"
                cy="120"
                r="105"
                stroke="#22d3ee"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="660"
                animate={{ strokeDashoffset: 660 - (660 * Math.max(0, Math.min(1, distanceRemaining / (parseFloat(baseDistText) || 12.4)))) }}
                transition={{ duration: 0.8 }}
                className="translate-x-[12px] translate-y-[12px] neon-glow"
                strokeLinecap="round"
              />
            </svg>

            {/* Core Telemetry Text */}
            <div className="z-10 text-center">
              <motion.p 
                key={distanceRemaining}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-extrabold text-brand-cyan tracking-tighter"
              >
                {distanceRemaining.toFixed(2)}
              </motion.p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Kilometers Left</p>
            </div>
          </div>
        )}

        {/* Detailed current position telemetry */}
        <div className="text-center mb-6">
          <p className="text-base font-bold text-white mb-1 flex items-center justify-center gap-1.5">
            Targeting Alert at <span className="text-brand-cyan font-mono font-black">{triggerDist.toFixed(1)} KM</span>
          </p>
          {distanceRemaining > triggerDist ? (
            <p className="text-xs text-white/50">
              Alarm will play tune in <span className="text-brand-cyan font-bold font-mono">{(distanceRemaining - triggerDist).toFixed(2)} km</span>
            </p>
          ) : (
            <p className="text-xs text-red-400 font-bold animate-pulse flex items-center justify-center gap-1">
              <AlertTriangle size={12} /> Entering alarm zone!
            </p>
          )}
        </div>

        {/* Selected target card info */}
        <div className="glass-card w-full p-4.5 bg-white/[0.04] border-white/5">
          <div className="flex items-center justify-between mb-2 mb-3">
            <div className="flex items-center gap-2.5">
              <MapPin size={15} className="text-brand-purple" />
              <span className="text-xs font-bold text-white truncate">{destName}</span>
            </div>
            {useSimulation && (
              <span className="text-[9px] px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple font-mono font-bold uppercase tracking-wider animate-pulse">
                Sim +0.15km/s
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-[11px] text-white/50 border-t border-white/5 pt-3">
            <div className="flex justify-between">
              <span>Your coordinates:</span>
              <span className="font-mono text-white/70">
                {currCoord ? `${currCoord.lat.toFixed(5)}°, ${currCoord.lng.toFixed(5)}°` : 'Awaiting GPS lock...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Target coordinates:</span>
              <span className="font-mono text-white/70">{destLat.toFixed(4)}°, {destLng.toFixed(4)}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6 shrink-0">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={`py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
            isPaused 
              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
              : 'glass-button'
          }`}
        >
          {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />} 
          {isPaused ? 'Resume Duty' : 'Pause Tracking'}
        </button>
        <button 
          onClick={() => navigate('/')}
          className="py-4 rounded-xl bg-red-500/20 border border-red-500/35 text-red-400 flex items-center justify-center gap-2 font-bold text-xs hover:bg-red-500/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.12)]"
        >
          <Square size={12} fill="currentColor" /> End Mission
        </button>
      </div>
    </div>
  );
}
