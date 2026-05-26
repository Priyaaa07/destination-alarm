import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, ChevronRight, Navigation, Trash2 } from 'lucide-react';
import { JourneyHistory } from '@/src/types';

const INITIAL_MOCK: JourneyHistory[] = [
  { id: '1', destination: 'Electronic City Terminal', date: '2026-05-20', triggerDistance: 5, status: 'Completed' },
  { id: '2', destination: 'Kempegowda Airport Way', date: '2026-05-18', triggerDistance: 10, status: 'Alarm Triggered' },
  { id: '3', destination: 'Indiranagar Metro Road', date: '2026-05-15', triggerDistance: 2, status: 'Emergency Alert Sent' },
];

export default function HistoryPage() {
  const [history, setHistory] = useState<JourneyHistory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('journey_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory(INITIAL_MOCK);
      }
    } else {
      localStorage.setItem('journey_history', JSON.stringify(INITIAL_MOCK));
      setHistory(INITIAL_MOCK);
    }
  }, []);

  const clearHistory = () => {
    localStorage.setItem('journey_history', '[]');
    setHistory([]);
  };

  return (
    <div className="pb-28 p-6 min-h-screen font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent tracking-tight">Trip History</h1>
          <p className="text-white/60 text-sm">Review safety records and system updates</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 text-xs flex items-center gap-1.5"
            title="Clear all logs"
          >
            <Trash2 size={14} /> Clear
          </button>
        )}
      </header>

      <div className="relative">
        {/* Timeline main accent line */}
        {history.length > 0 && (
          <div className="absolute left-6 top-1 bottom-1 w-0.5 bg-gradient-to-b from-brand-cyan via-brand-purple to-indigo-900/40" />
        )}

        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="text-center py-16 glass-card border-dashed border-white/10">
              <p className="text-sm text-white/50">Your travel log is empty.</p>
              <p className="text-xs text-white/35 mt-1">Trips will persist here upon destination arrival.</p>
            </div>
          ) : (
            history.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.08, 0.8) }}
                className="relative pl-12"
              >
                {/* Timeline status indicating custom dot */}
                <span className={`absolute left-[19px] top-6 w-4 h-4 rounded-full border-4 border-brand-deep z-10 ${
                  item.status === 'Completed' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 
                  item.status === 'Alarm Triggered' ? 'bg-brand-cyan shadow-[0_0_8px_#22d3ee]' : 
                  'bg-red-500 shadow-[0_0_8px_#ef4444]'
                }`} />

                <div className="glass-card p-4.5 bg-white/[0.03] hover:bg-white/[0.05] transition-all">
                  <div className="flex justify-between items-start mb-2.5 gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{item.destination}</h3>
                      <p className="text-[10px] text-white/40 mt-0.5 font-mono">{item.date}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      item.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                      item.status === 'Alarm Triggered' ? 'bg-brand-cyan/20 text-brand-cyan' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-white/5 text-[11px] text-white/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Navigation size={11} className="text-brand-cyan" /> {item.triggerDistance}km Alarm
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-brand-purple" /> Captured Auto
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-white/20" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
