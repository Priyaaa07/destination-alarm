import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, User, Mail, Droplets, Phone } from 'lucide-react';
import { User as UserType } from '@/src/types';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export function ProfileDrawer({ isOpen, onClose, user }: ProfileDrawerProps) {
  const userPhone = localStorage.getItem('user_phone') || '+91 99012 34567';

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_phone');
    window.location.reload();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm glass-card rounded-r-[32px] rounded-l-none z-[70] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-brand-cyan">Profile</h2>
              <button onClick={onClose} className="p-2 glass-button rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 rounded-full border-2 border-brand-cyan p-1 mb-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-white/60 text-sm">{user.email}</p>
            </div>

            <div className="space-y-4 flex-1">
              <div className="glass-card p-4 flex items-center gap-4">
                <Mail className="text-brand-cyan" size={20} />
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              <div className="glass-card p-4 flex items-center gap-4">
                <Phone className="text-brand-purple" size={20} />
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Verified Contact</p>
                  <p className="text-sm font-mono">+91 {userPhone}</p>
                </div>
              </div>
              <div className="glass-card p-4 flex items-center gap-4">
                <Droplets className="text-red-400" size={20} />
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Blood Group</p>
                  <p className="text-sm font-bold">{user.bloodGroup}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="mt-auto w-full p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-500 flex items-center justify-center gap-2 font-semibold hover:bg-red-500/30 transition-all outline-none"
            >
              <LogOut size={20} />
              Logout
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
