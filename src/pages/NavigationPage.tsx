import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Navigation, WifiOff, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNetwork, useGeolocation } from '@/src/hooks/useDeviceStatus';
import { LeafletMap } from '@/src/components/LeafletMap';

const DESTINATIONS = [
  { name: 'Electronic City Terminal', lat: 12.8407, lng: 77.6763, distText: '12.4 km', timeText: '24 mins' },
  { name: "Kempegowda Int'l Airport", lat: 13.1986, lng: 77.7066, distText: '35.8 km', timeText: '52 mins' },
  { name: 'Indiranagar Metro Station', lat: 12.9784, lng: 77.6413, distText: '6.2 km', timeText: '15 mins' },
  { name: 'Majestic Station Phase 1', lat: 12.9779, lng: 77.5729, distText: '8.8 km', timeText: '20 mins' }
];

export default function NavigationPage() {
  const navigate = useNavigate();
  const locationState = useLocation().state as { query?: string } | null;
  const isOnline = useNetwork();
  const { location: gpsLoc } = useGeolocation();

  // Base coordinates for user if GPS is loading
  const userLat = gpsLoc?.latitude ?? 12.9716;
  const userLng = gpsLoc?.longitude ?? 77.5946;

  const [search, setSearch] = useState(locationState?.query || '');
  const [selectedDest, setSelectedDest] = useState(() => {
    const savedName = localStorage.getItem('selected_destination_name');
    if (savedName) {
      const matchSaved = DESTINATIONS.find(d => d.name === savedName);
      if (matchSaved) return matchSaved;
      return {
        name: savedName,
        lat: Number(localStorage.getItem('selected_destination_lat')) || 12.8407,
        lng: Number(localStorage.getItem('selected_destination_lng')) || 77.6763,
        distText: localStorage.getItem('selected_destination_base_dist') || '12.4 km',
        timeText: '24 mins'
      };
    }
    return DESTINATIONS[0];
  });

  const triggerDistance = localStorage.getItem('selected_trigger_distance') || '5';

  // Dynamic state update when search query changes
  useEffect(() => {
    if (!search.trim()) {
      return;
    }

    const match = DESTINATIONS.find(d => d.name.toLowerCase().includes(search.toLowerCase().trim()));
    if (match) {
      setSelectedDest(match);
    } else {
      setSelectedDest({
        name: search.trim(),
        lat: userLat + 0.032,
        lng: userLng + 0.024,
        distText: '8.4 km',
        timeText: '18 mins'
      });
    }
  }, [search, userLat, userLng]);

  const handleConfirm = () => {
    localStorage.setItem('selected_destination_name', selectedDest.name);
    localStorage.setItem('selected_destination_lat', String(selectedDest.lat));
    localStorage.setItem('selected_destination_lng', String(selectedDest.lng));
    localStorage.setItem('selected_destination_base_dist', selectedDest.distText);
    navigate('/tracking');
  };

  const filteredDests = DESTINATIONS.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 glass-button rounded-full shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 glass-card px-4 py-2 flex items-center gap-2">
          <MapPin size={16} className="text-brand-cyan" />
          <input 
            type="text" 
            placeholder="Search Bangalore hotspots..." 
            className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-white/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Recommended list */}
      <div className="px-6 pb-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-cyan block mb-2">Select Active SafeZone Destination</span>
        <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-none">
          {filteredDests.map((dest) => (
            <button 
              key={dest.name}
              onClick={() => setSelectedDest(dest)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                selectedDest.name === dest.name 
                  ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-[0_0_10px_rgba(34,211,238,0.25)]" 
                  : "bg-white/5 border-white/10 text-white/70"
              }`}
            >
              {dest.name.split(' ')[0]}
            </button>
          ))}
          {search.trim().length > 0 && !DESTINATIONS.some(d => d.name.toLowerCase() === search.toLowerCase().trim()) && (
            <button 
              onClick={() => setSelectedDest({
                name: search.trim(),
                lat: userLat + 0.032,
                lng: userLng + 0.024,
                distText: '8.4 km',
                timeText: '18 mins'
              })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                selectedDest.name === search.trim() 
                  ? "bg-brand-purple/20 border-brand-purple text-brand-purple shadow-[0_0_10px_rgba(168,85,247,0.25)] font-black" 
                  : "bg-brand-purple/10 border-brand-purple/20 text-brand-purple/80"
              }`}
            >
              🔍 Set Custom: "{search.trim()}"
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-brand-deep">
        {/* Real Dynamic Google/Leaflet Map connection */}
        <div className="absolute inset-0 z-0">
          <LeafletMap 
            userLat={userLat} 
            userLng={userLng} 
            destLat={selectedDest.lat} 
            destLng={selectedDest.lng} 
            triggerDistKm={Number(triggerDistance)} 
          />
        </div>
        
        <div className="absolute top-4 right-4 z-[400]">
          {!isOnline && (
            <div className="glass-card px-3 py-1.5 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border-yellow-400/30">
              <WifiOff size={14} /> Offline Mode Active
            </div>
          )}
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-[400]">
          <motion.div 
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-5 border-brand-cyan/25 bg-brand-deep/90 backdrop-blur-md"
          >
            <div className="flex justify-between items-end mb-4">
              <div className="min-w-0 pr-2">
                <span className="text-[9px] text-brand-cyan font-extrabold uppercase tracking-widest block mb-1">Target Coordinates</span>
                <h2 className="text-lg font-bold text-white truncate mb-1">{selectedDest.name}</h2>
                <p className="text-white/60 text-xs">{selectedDest.distText} total • {selectedDest.timeText} remaining</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] text-white/40 uppercase font-bold">Wake Trigger</p>
                <span className="text-brand-cyan font-black text-base">{triggerDistance} KM</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
            >
              <Navigation size={16} />
              Confirm Destination
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
