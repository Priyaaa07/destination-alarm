import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Phone, MessageSquare, Trash2, ShieldCheck, Navigation, X, Check, AlertCircle } from 'lucide-react';
import { EmergencyContact } from '@/src/types';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore & fallback
      }
    }
    return [
      { id: '1', name: 'Mom', phone: '+91 98765 43210', email: 'mom@example.com' },
      { id: '2', name: 'Dad', phone: '+91 98765 43211', email: 'dad@example.com' },
    ];
  });

  const [autoAlert, setAutoAlert] = useState(() => {
    const saved = localStorage.getItem('auto_alert_enabled');
    return saved !== 'false';
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Call Simulated State
  const [activeCallContact, setActiveCallContact] = useState<EmergencyContact | null>(null);

  // Message Simulated State
  const [sentMessageTo, setSentMessageTo] = useState<string | null>(null);

  // Notification State
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('auto_alert_enabled', String(autoAlert));
  }, [autoAlert]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast('Name and Phone are required!');
      return;
    }

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`
    };

    setContacts(prev => [...prev, newContact]);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setIsAddModalOpen(false);
    showToast(`Added ${newContact.name} to safety network!`);
  };

  const handleDeleteContact = (id: string, name: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    showToast(`Removed ${name} from emergency network.`);
  };

  const handleCall = (contact: EmergencyContact) => {
    setActiveCallContact(contact);
    // Open tel protocol
    setTimeout(() => {
      window.location.href = `tel:${contact.phone}`;
    }, 1200);
  };

  const handleSendSMS = (contact: EmergencyContact) => {
    setSentMessageTo(contact.name);
    // Simulate API call to backend route
    fetch('/api/emergency/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'current-user-priya',
        location: { lat: 12.9716, lng: 77.5946, address: 'Bangalore General Area' },
        contacts: [contact.name],
      }),
    })
    .then(res => res.json())
    .then(data => {
      console.log('Notification API reply:', data);
    })
    .catch(err => {
      console.error('Error hitting notification API:', err);
    });

    setTimeout(() => {
      setSentMessageTo(null);
      showToast(`Emergency coordinates sent to ${contact.name}!`);
    }, 2800);
  };

  const handleSendLiveLocationAll = () => {
    showToast('Sending live coordinates to all emergency contacts...');
    
    // Call Node API endpoint to log emergency event
    fetch('/api/emergency/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'priya_gowda',
        location: '12.9716° N, 77.5946° E (Current Live Location)',
        contacts: contacts.map(c => c.name)
      })
    })
    .then(() => {
      showToast('Live location link shared via system gateway!');
    })
    .catch(e => {
      showToast('Shared local location with emergency contacts.');
    });
  };

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3500);
  };

  return (
    <div className="pb-28 p-6 min-h-screen relative font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-cyan via-brand-purple to-pink-400 bg-clip-text text-transparent tracking-tight">Emergency Setup</h1>
        <p className="text-white/60 text-sm">Configure automated alert logic and responders.</p>
      </header>

      {/* Auto Alert Toggle */}
      <div className="glass-card p-5 mb-8 flex items-center justify-between border-brand-cyan/25">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="font-bold text-sm">Automatic Protocol</p>
            <p className="text-xs text-white/50">Alert contacts automatically on missed alarms</p>
          </div>
        </div>
        <button 
          onClick={() => setAutoAlert(!autoAlert)}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${autoAlert ? 'bg-brand-cyan' : 'bg-white/10'}`}
        >
          <motion.div 
            animate={{ x: autoAlert ? 24 : 0 }}
            className="w-6 h-6 bg-brand-deep rounded-full shadow-lg"
          />
        </button>
      </div>

      {/* Headline section */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-semibold text-white/80 tracking-wide">Emergency Contacts List</h3>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="p-2.5 glass-button rounded-xl text-brand-cyan hover:border-brand-cyan/50 hover:bg-brand-cyan/10 transition-all flex items-center gap-1 text-xs"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Contacts Cards */}
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="text-center p-8 glass-card border-dashed border-white/10">
            <AlertCircle className="mx-auto text-white/30 mb-2" size={32} />
            <p className="text-sm text-white/50">No rescue contacts added yet.</p>
            <p className="text-xs text-white/30 mt-1">Add contacts to enable automatic alerts.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <motion.div 
              key={contact.id}
              layout
              className="glass-card p-4.5 flex items-center justify-between gap-3 border-white/5 bg-white/[0.04]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-purple/40 to-brand-cyan/40 flex items-center justify-center text-medium font-bold text-brand-cyan border border-brand-cyan/20">
                  {contact.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{contact.name}</p>
                  <p className="text-xs text-white/50 truncate font-mono">{contact.phone}</p>
                  <p className="text-[10px] text-white/30 truncate mt-0.5">{contact.email}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => handleCall(contact)}
                  className="p-2.5 glass-button rounded-xl text-brand-cyan hover:bg-brand-cyan/15 hover:border-brand-cyan border-white/10"
                  title="Call Contact"
                >
                  <Phone size={15} />
                </button>
                <button 
                  onClick={() => handleSendSMS(contact)}
                  className="p-2.5 glass-button rounded-xl text-brand-purple hover:bg-brand-purple/15 hover:border-brand-purple border-white/10"
                  title="Simulate Backup Coordinates Alert"
                >
                  <MessageSquare size={15} />
                </button>
                <button 
                  onClick={() => handleDeleteContact(contact.id, contact.name)}
                  className="p-2.5 glass-button rounded-xl text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border-white/10"
                  title="Delete responder"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <button 
        onClick={() => {
          // Preset simulated prompt contact
          setNewName('Emergency Services');
          setNewPhone('112');
          setNewEmail('assistance@emergency.gov');
          setIsAddModalOpen(true);
        }}
        className="mt-6 w-full py-4 rounded-xl border border-dashed border-white/10 text-white/40 font-medium flex items-center justify-center gap-2 text-xs bg-white/[0.01] hover:bg-white/[0.03] hover:text-white/60 transition-all"
      >
        <Plus size={16} /> Prefill Emergency Medical Hotlines
      </button>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSendLiveLocationAll}
        className="mt-5 w-full py-4 rounded-[18px] bg-gradient-to-r from-brand-purple/40 to-brand-cyan/40 border border-brand-cyan/30 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:border-brand-cyan/60 transition-all group"
      >
        <Navigation size={16} className="text-brand-cyan group-hover:animate-pulse" />
        Broadcast Current Coordinates
      </motion.button>

      {/* Add Responder Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="fixed inset-x-6 top-[15%] mx-auto max-w-sm glass-card border border-brand-cyan/35 p-6 z-[101] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-bold text-lg text-brand-cyan">Add Safety Responder</h4>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 glass-button rounded-circle">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider block mb-2">Responder Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-brand-deep/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider block mb-2">Mobile Phone</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +91 99887 76655"
                    value={newPhone} 
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full bg-brand-deep/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider block mb-2">Gmail Address (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="e.g. contact@gmail.com"
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-brand-deep/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-1/2 py-3 glass-button rounded-xl text-xs font-semibold text-white/70"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 py-3 bg-brand-cyan rounded-xl text-xs font-bold text-brand-deep hover:brightness-115 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calling Simulator UI */}
      <AnimatePresence>
        {activeCallContact && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-deep/95 backdrop-blur-lg z-[200] flex flex-col items-center justify-between p-12 text-center"
          >
            <div className="pt-20">
              <span className="text-xs uppercase tracking-widest text-brand-cyan font-bold block mb-3 animate-pulse">
                Initiating Emergency Link
              </span>
              <div className="w-28 h-28 rounded-full bg-brand-cyan/10 border-2 border-brand-cyan flex items-center justify-center text-4xl font-extrabold text-brand-cyan mx-auto mb-6 neon-glow">
                {activeCallContact.name.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold mb-1">{activeCallContact.name}</h2>
              <p className="text-white/50 text-sm font-mono">{activeCallContact.phone}</p>
            </div>

            <div className="mb-8">
              <p className="text-xs text-white/40 mb-6 font-medium">Automatic fallback connection routing enabled...</p>
              <button 
                onClick={() => setActiveCallContact(null)}
                className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-all shadow-lg active:scale-90"
              >
                <X size={28} className="text-white" />
              </button>
              <span className="text-[10px] uppercase font-bold text-red-400 block mt-2 tracking-wider">End Live Hotkey</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Simulator Modal */}
      <AnimatePresence>
        {sentMessageTo && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-6 bottom-24 mx-auto max-w-sm glass-card border border-brand-purple/45 p-5 z-[150] shadow-2xl flex items-center gap-4 bg-brand-purple/20"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
              <MessageSquare size={20} className="animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-xs text-brand-purple uppercase tracking-wider">Simulated Message Sent</h5>
              <p className="text-white text-xs truncate">To {sentMessageTo}: "GPS coordinates linked..."</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Overlay */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 inset-x-6 mx-auto bg-brand-deep/90 border border-brand-cyan/40 px-5 py-3.5 rounded-2xl z-[150] flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.6)]"
          >
            <Check size={18} className="text-brand-cyan shrink-0" />
            <span className="text-xs text-white font-medium">{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
