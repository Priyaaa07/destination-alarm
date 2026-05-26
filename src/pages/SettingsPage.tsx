import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Shield, BellRing, WifiOff, Moon, Sun, ChevronRight, Info, Volume2, Play, Square, LogOut } from 'lucide-react';
import { TUNES, playAlarmTune, stopAnyPlayingTune } from '@/src/lib/audioEngine';

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return {
      autoAlert: localStorage.getItem('setting_auto_alert') !== 'false',
      notifications: localStorage.getItem('setting_notifications') !== 'false',
      offlineMode: localStorage.getItem('setting_offline_mode') === 'true',
      darkMode: savedTheme !== 'light',
    };
  });

  const [selectedTune, setSelectedTune] = useState(() => {
    return localStorage.getItem('selected_alarm_tune') || 'cyber';
  });

  const [playingTuneId, setPlayingTuneId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopAnyPlayingTune();
    };
  }, []);

  const selectAndPlayTune = (tuneId: string) => {
    setSelectedTune(tuneId);
    localStorage.setItem('selected_alarm_tune', tuneId);
    
    if (playingTuneId === tuneId) {
      // Toggle stop if already playing this
      stopAnyPlayingTune();
      setPlayingTuneId(null);
    } else {
      stopAnyPlayingTune();
      setPlayingTuneId(tuneId);
      playAlarmTune(tuneId, 3000);
      
      // Auto reset playing state after 3 seconds
      setTimeout(() => {
        setPlayingTuneId(prev => prev === tuneId ? null : prev);
      }, 3000);
    }
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (key === 'darkMode') {
        const themeValue = updated.darkMode ? 'dark' : 'light';
        localStorage.setItem('theme', themeValue);
        document.documentElement.setAttribute('data-theme', themeValue);
      } else {
        localStorage.setItem(`setting_${String(key)}`, String(updated[key]));
      }
      return updated;
    });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 px-2">{title}</h3>
      <div className="glass-card overflow-hidden">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ icon: Icon, label, value, onToggle, color = "text-brand-cyan" }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-none active:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {onToggle ? (
        <button 
          onClick={onToggle}
          className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-brand-cyan' : 'bg-white/10'}`}
        >
          <motion.div 
            animate={{ x: value ? 20 : 0 }}
            className="w-5 h-5 bg-white rounded-full shadow-lg"
          />
        </button>
      ) : (
        <ChevronRight size={20} className="text-white/20" />
      )}
    </div>
  );

  return (
    <div className="pb-24 p-6 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-sans tracking-tight">Settings</h1>
        <p className="text-white/60 text-sm">Customize your experience</p>
      </header>

      <Section title="Alarm & Safety">
        <SettingItem icon={BellRing} label="Default Trigger (5km)" />
        <SettingItem 
          icon={Shield} 
          label="Auto Emergency Alert" 
          value={settings.autoAlert} 
          onToggle={() => toggle('autoAlert')}
          color="text-brand-purple"
        />
        <SettingItem 
          icon={Bell} 
          label="Push Notifications" 
          value={settings.notifications} 
          onToggle={() => toggle('notifications')}
        />
      </Section>

      <Section title="Alarm Tunes (5 Options)">
        <div className="p-2 space-y-1 bg-white/5">
          {TUNES.map((tune) => {
            const isSelected = selectedTune === tune.id;
            const isPlaying = playingTuneId === tune.id;
            return (
              <div 
                key={tune.id}
                onClick={() => selectAndPlayTune(tune.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? "bg-brand-cyan/15 border border-brand-cyan/40" 
                    : "border border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-brand-cyan/20 text-brand-cyan" : "bg-white/5 text-white/40"
                  }`}>
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${isSelected ? "text-brand-cyan" : "text-white"}`}>
                        {tune.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan font-bold tracking-wider uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">{tune.desc}</p>
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAndPlayTune(tune.id);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isPlaying 
                      ? "bg-red-500/20 text-red-400" 
                      : "bg-white/10 text-brand-cyan hover:bg-white/20"
                  }`}
                >
                  {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Connectivity">
        <SettingItem 
          icon={WifiOff} 
          label="Offline Mode" 
          value={settings.offlineMode} 
          onToggle={() => toggle('offlineMode')}
          color="text-yellow-400"
        />
        <SettingItem icon={Info} label="Pre-download Maps" />
      </Section>

      <Section title="Appearance">
        <SettingItem 
          icon={settings.darkMode ? Moon : Sun} 
          label="Dark Mode" 
          value={settings.darkMode} 
          onToggle={() => toggle('darkMode')}
          color={settings.darkMode ? "text-brand-purple" : "text-yellow-400"}
        />
      </Section>

      <div className="mt-8 px-2">
        <button
          onClick={() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_phone');
            window.location.reload();
          }}
          className="w-full py-4 rounded-xl pb-4 bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 hover:border-red-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all outline-none"
        >
          <LogOut size={16} /> Sign Out of Security Session
        </button>
      </div>

      <div className="text-center mt-12 mb-4">
        <p className="text-white/20 text-xs">SafeJourney v1.0.0</p>
        <p className="text-white/20 text-[10px] mt-1 uppercase tracking-tighter">Made with ❤️ for Travelers</p>
      </div>
    </div>
  );
}
