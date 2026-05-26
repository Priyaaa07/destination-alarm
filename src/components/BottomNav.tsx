import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, ShieldAlert, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: History, label: 'History', path: '/history' },
    { icon: ShieldAlert, label: 'Emergency', path: '/emergency' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass-card rounded-t-[24px] rounded-b-none border-t border-white/10 bottom-nav-glow z-50 px-6 flex items-center justify-between">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center transition-all duration-300 relative",
              isActive ? "text-brand-cyan scale-110" : "text-white/50"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={24} className={cn(isActive && "neon-glow")} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-glow"
                  className="absolute -top-2 w-8 h-1 bg-brand-cyan rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
