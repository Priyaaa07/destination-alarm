import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, Timer, ShieldAlert, Check, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playAlarmTune, stopAnyPlayingTune } from '@/src/lib/audioEngine';
import { EmergencyContact } from '@/src/types';

export default function AlertPage() {
  const navigate = useNavigate();
  const [isEmergencyPending, setIsEmergencyPending] = useState(false);
  const [countdown, setCountdown] = useState(25); // high excitement timer
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // Load contacts
  useEffect(() => {
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    } else {
      setContacts([
        { id: '1', name: 'Mom', phone: '+91 98765 43210', email: 'mom@example.com' },
        { id: '2', name: 'Dad', phone: '+91 98765 43211', email: 'dad@example.com' },
      ]);
    }
  }, []);

  useEffect(() => {
    // Play selected alarm tune immediately on mount, and repeat every 3.5 seconds
    const tuneId = localStorage.getItem('selected_alarm_tune') || 'cyber';
    
    // Play first time
    playAlarmTune(tuneId, 3200);

    // Loop interval
    const audioInterval = setInterval(() => {
      playAlarmTune(tuneId, 3200);
    }, 3500);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          triggerEmergencyBroadcast();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(audioInterval);
      clearInterval(interval);
      stopAnyPlayingTune();
    };
  }, [contacts]);

  const triggerEmergencyBroadcast = () => {
    setIsEmergencyPending(true);
    stopAnyPlayingTune();

    // Store a history card item
    const journeyHistory = JSON.parse(localStorage.getItem('journey_history') || '[]');
    const newRecord = {
      id: Date.now().toString(),
      destination: 'Electronic City Terminal',
      date: new Date().toISOString().split('T')[0],
      triggerDistance: 5,
      status: 'Emergency Alert Sent'
    };
    localStorage.setItem('journey_history', JSON.stringify([newRecord, ...journeyHistory]));

    // Hit express backend to dispatch notifications 
    fetch('/api/emergency/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'priya_gowda',
        location: '12.9716° N, 77.5946° E (Electronic City Route)',
        contacts: contacts.map(c => `${c.name} (${c.phone})`)
      })
    })
    .then(r => r.json())
    .then(data => {
      console.log('Emergency broadcast API response:', data);
    })
    .catch(err => {
      console.error('Failed to notify backend server:', err);
    });
  };

  const handleStopAlarm = () => {
    stopAnyPlayingTune();
    
    // Add success history record as completed
    const journeyHistory = JSON.parse(localStorage.getItem('journey_history') || '[]');
    const newRecord = {
      id: Date.now().toString(),
      destination: 'Destination Reached',
      date: new Date().toISOString().split('T')[0],
      triggerDistance: 5,
      status: 'Completed'
    };
    localStorage.setItem('journey_history', JSON.stringify([newRecord, ...journeyHistory]));

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-red-650 flex flex-col p-6 relative overflow-hidden font-sans">
      {/* Flashing Danger Background */}
      <motion.div 
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="absolute inset-0 bg-red-500 z-0"
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-red-600 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          <Bell size={56} fill="currentColor" className="animate-pulse" />
        </motion.div>

        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Wake Up!</h1>
        <p className="text-lg text-white/90 mb-6 font-medium">You are entering your alarm zone.</p>
        
        <div className="glass-card bg-black/30 border-white/20 p-5 w-full mb-8">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1.5 font-bold">Auto Rescue Dispatch In</p>
          <p className="text-5xl font-black text-white tracking-tight">{countdown}s</p>
          <span className="text-[10px] text-white/40 block mt-2">Press Stop to prevent emergency alerts</span>
        </div>

        <div className="space-y-4 w-full">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleStopAlarm}
            className="w-full py-5 rounded-2xl bg-white text-red-600 font-extrabold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <BellOff size={22} /> STOP ALARM
          </motion.button>

          <button
            onClick={() => setCountdown(prev => prev + 120)}
            className="w-full py-3.5 rounded-2xl bg-black/30 border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 "
          >
            <Timer size={18} /> Snooze 2 Minutes
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isEmergencyPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 z-[300] p-6 flex flex-col items-center justify-center text-center"
          >
            <ShieldAlert size={72} className="text-red-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Emergency Alert Active</h2>
            <p className="text-white/60 text-sm mb-6 max-w-sm">
              Your device did not detect response. High-priority safety dispatch initiated with current live GPS coordinates.
            </p>

            <div className="w-full max-w-xs glass-card border-brand-purple/40 bg-brand-purple/10 p-4.5 mb-8 text-left">
              <span className="text-[10px] uppercase font-extrabold text-brand-purple tracking-widest block mb-3.5 flex items-center gap-1.5">
                <Users size={12} /> Contacted Responders
              </span>
              <div className="space-y-2.5">
                {contacts.map((contact, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-white">{contact.name}</p>
                      <p className="text-[10px] text-white/50 font-mono">{contact.phone}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check size={8} /> Sent
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setIsEmergencyPending(false);
                navigate('/');
              }}
              className="px-8 py-4 bg-brand-cyan text-brand-deep rounded-2xl font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 transition-all"
            >
              I am Safe & Awake
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
