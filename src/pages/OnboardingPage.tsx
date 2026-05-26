import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Bell, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    title: "Destination Alarm",
    description: "Never miss your stop again. Set a distance and we'll wake you up exactly when you need.",
    icon: Bell,
    color: "text-brand-cyan",
    bg: "bg-brand-cyan/20"
  },
  {
    title: "Offline Maps",
    description: "No internet? No problem. Use cached routes and GPS tracking even in the dead zones.",
    icon: MapPin,
    color: "text-yellow-400",
    bg: "bg-yellow-400/20"
  },
  {
    title: "Emergency Network",
    description: "If you don't respond to the alarm, we'll automatically notify your emergency contacts.",
    icon: ShieldAlert,
    color: "text-brand-purple",
    bg: "bg-brand-purple/20"
  }
];

export default function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8 bg-brand-deep relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-brand-purple/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-brand-cyan/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -50 }}
            className="flex flex-col items-center"
          >
            <div className={`w-32 h-32 rounded-[40px] ${STEPS[currentStep].bg} flex items-center justify-center ${STEPS[currentStep].color} mb-12 shadow-2xl`}>
              {React.createElement(STEPS[currentStep].icon, { size: 64 })}
            </div>
            <h1 className="text-4xl font-black mb-6 tracking-tighter leading-tight">
              {STEPS[currentStep].title}
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-xs">
              {STEPS[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-12">
        <div className="flex justify-center gap-2 mb-12">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-brand-cyan' : 'w-2 bg-white/20'}`} 
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-5 rounded-[24px] bg-white text-brand-deep font-black text-xl flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-transform"
        >
          {currentStep === STEPS.length - 1 ? (
            <>Get Started <CheckCircle2 size={24} /></>
          ) : (
            <>Next <ArrowRight size={24} /></>
          )}
        </button>
      </div>
    </div>
  );
}
