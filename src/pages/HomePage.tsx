import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Navigation, Bell } from 'lucide-react';
import { ProfileDrawer } from '@/src/components/ProfileDrawer';
import { User, TriggerDistance } from '@/src/types';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '@/src/hooks/useDeviceStatus';

const MOCK_USER: User = {
  name: "Priya Gowda",
  email: "priyagowdaa07@gmail.com",
  bloodGroup: "O+",
  avatar: "https://picsum.photos/seed/priya/200"
};

export default function HomePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { location, error } = useGeolocation();
  const [selectedDistance, setSelectedDistance] = useState<TriggerDistance>(() => {
    const saved = localStorage.getItem('selected_trigger_distance');
    return saved ? (Number(saved) as TriggerDistance) : 5;
  });
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDest, setActiveDest] = useState<{ name: string; distText?: string } | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('selected_destination_name');
    const dist = localStorage.getItem('selected_destination_base_dist') || '12.4 km';
    if (name) {
      setActiveDest({ name, distText: dist });
    }
  }, []);

  const handleDistanceChange = (dist: TriggerDistance) => {
    setSelectedDistance(dist);
    localStorage.setItem('selected_trigger_distance', String(dist));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/navigation', { state: { query: searchQuery.trim() } });
    }
  };

  const handleStartJourney = () => {
    if (activeDest) {
      navigate('/tracking');
    } else {
      navigate('/navigation');
    }
  };

  const handleSelectPredefined = (name: string, lat: number, lng: number, distText: string) => {
    localStorage.setItem('selected_destination_name', name);
    localStorage.setItem('selected_destination_lat', String(lat));
    localStorage.setItem('selected_destination_lng', String(lng));
    localStorage.setItem('selected_destination_base_dist', distText);
    navigate('/tracking');
  };

  return (
    <div className="pb-24 p-6 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-12 h-12 rounded-full border-2 border-brand-cyan p-0.5 overflow-hidden active:scale-90 transition-transform"
        >
          <img src={MOCK_USER.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
        </button>
        <div className="text-right">
          <p className="text-white/60 text-xs">Current Location</p>
          <p className="font-semibold text-brand-cyan flex items-center justify-end gap-1 text-xs">
            <MapPin size={12} /> {location ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°` : 'Wait GPS...'}
          </p>
        </div>
      </header>

      <section className="mb-8">
        <div className="glass-card h-48 w-full overflow-hidden relative mb-6">
          <img 
            src="https://picsum.photos/seed/map/800/400" 
            className="w-full h-full object-cover opacity-50 grayscale"
            alt="Map Preview"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-4 h-4 bg-brand-cyan rounded-full shadow-[0_0_15px_#22d3ee]"
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4 glass-card p-3 bg-brand-deep/80 backdrop-blur-md">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full">
              <Search size={18} className="text-white/50 shrink-0" />
              <input 
                type="text" 
                placeholder="Where are you going?" 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-white/40 font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>

        {activeDest && (
          <div className="glass-card mb-6 p-4 border-brand-cyan/20 bg-brand-cyan/5 flex justify-between items-center">
            <div className="min-w-0 flex-1 pr-3">
              <span className="text-[9px] text-brand-cyan font-bold uppercase tracking-wider block mb-1">Active Set Target</span>
              <p className="text-sm font-bold text-white truncate">{activeDest.name}</p>
              <p className="text-xs text-white/50 mt-0.5">{activeDest.distText || "12.4 km"} • Trigger Zone: {selectedDistance} KM</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  localStorage.removeItem('selected_destination_name');
                  localStorage.removeItem('selected_destination_lat');
                  localStorage.removeItem('selected_destination_lng');
                  localStorage.removeItem('selected_destination_base_dist');
                  setActiveDest(null);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-bold active:scale-95 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => navigate('/navigation')}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-brand-cyan text-[10px] font-bold active:scale-95 transition-all"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-4">Trigger Distance</h3>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[10, 5, 2].map((dist) => (
            <button
              key={dist}
              onClick={() => handleDistanceChange(dist as TriggerDistance)}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                selectedDistance === dist 
                ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan neon-glow" 
                : "bg-white/5 border-white/10 text-white/60"
              }`}
            >
              <span className="text-xl font-bold">{dist}</span>
              <span className="text-[10px] block uppercase tracking-tighter">KM</span>
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartJourney}
          className="w-full py-5 rounded-[24px] bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold text-lg shadow-lg relative overflow-hidden group mb-8"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10 flex items-center justify-center gap-2 px-4 truncate">
            <Navigation size={20} className="rotate-45 shrink-0" />
            <span className="truncate">
              {activeDest ? `Start Journey to ${activeDest.name.split(' ')[0]}` : 'Start Journey'}
            </span>
          </span>
          <motion.div 
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-white/20 rounded-full"
          />
        </motion.button>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Saved Locations</h3>
          <button className="text-brand-cyan text-sm" onClick={() => navigate('/navigation')}>See All</button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Home (Maple Street)', address: '123 Maple Street, Bangalore', icon: '🏠', lat: 12.9716, lng: 77.5946, distText: '4.2 km' },
            { name: 'Office (Tech Park)', address: 'Tech Park, Whitefield', icon: '💼', lat: 12.9698, lng: 77.7499, distText: '18.5 km' },
          ].map((loc, i) => (
            <button 
              key={i} 
              onClick={() => handleSelectPredefined(loc.name, loc.lat, loc.lng, loc.distText)}
              className="w-full text-left glass-card p-4 flex items-center gap-4 hover:bg-white/10 active:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                {loc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{loc.name}</p>
                <p className="text-xs text-white/50 truncate">{loc.address}</p>
              </div>
              <Navigation size={16} className="text-brand-cyan shrink-0 rotate-45" />
            </button>
          ))}
        </div>
      </section>

      <ProfileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        user={MOCK_USER} 
      />
    </div>
  );
}
