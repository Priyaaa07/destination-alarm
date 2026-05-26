import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, ChevronRight, CheckCircle2, ShieldAlert, KeyRound, AlertCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Real-time simulated system popup
  const [sysNotification, setSysNotification] = useState<{ phone: string; code: string } | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: any;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid active phone number!');
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim() })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setOtpSent(true);
        setCountdown(30);
        // Simulate real mobile carrier carrier gateway SMS delivery
        setSysNotification({ phone: phoneNumber.trim(), code: data.simulatedCode });
        // Automatically close SMS notification after 8 seconds
        setTimeout(() => {
          setSysNotification(null);
        }, 8000);
      } else {
        setErrorMsg(data.error || 'Failed to trigger OTP delivery script');
      }
    } catch (e) {
      setErrorMsg('Network error connecting with OTP authorization service');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 4-digit code!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim(), otp: otpCode.trim() })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Authenticate locally
        localStorage.setItem('user_phone', phoneNumber.trim());
        localStorage.setItem('auth_token', 'session_auth_active_priya');
        onLoginSuccess();
      } else {
        setErrorMsg(data.error || 'Invalid OTP code entered. Please check simulated SMS popup!');
      }
    } catch (e) {
      setErrorMsg('Authentication servers are unreachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-brand-deep relative overflow-hidden font-sans">
      {/* Background radial safety radar pulse */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[20%] w-[100%] h-[100%] bg-brand-purple/15 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ scale: [1.1, 0.9, 1.1], rotate: [0, -45, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[20%] -right-[20%] w-[100%] h-[100%] bg-brand-cyan/15 rounded-full blur-[140px]"
        />
      </div>

      {/* Header section Branding */}
      <div className="text-center pt-12">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center mx-auto mb-4 border border-brand-cyan/25 shadow-[0_0_25px_rgba(34,211,238,0.3)]"
        >
          <ShieldAlert size={32} className="text-white animate-pulse" />
        </motion.div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan via-brand-purple to-pink-400 bg-clip-text text-transparent tracking-tight">
          SafeJourney Secure
        </h1>
        <p className="text-white/60 text-xs mt-1.5 uppercase tracking-widest font-bold">
          Transit Alert Sentinel
        </p>
      </div>

      {/* Main glass authentication card */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-brand-cyan/20 bg-white/[0.04] backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple" />
          
          <h2 className="text-xl font-bold text-white mb-1.5">
            {otpSent ? 'OTP Verification' : 'Welcome Responder'}
          </h2>
          <p className="text-xs text-white/50 mb-6">
            {otpSent 
              ? `Confirm the code dispatched to ${phoneNumber}` 
              : 'Sign in with your mobile contact to initiate travel monitoring'}
          </p>

          {/* User notice / Error layout */}
          {errorMsg && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="text-[10px] uppercase font-extrabold tracking-widest text-white/60 block mb-2">
                  Mobile Phone Connection
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-cyan font-bold text-sm">
                    +91
                  </div>
                  <input 
                    type="tel" 
                    placeholder="99887 76655"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-brand-deep/80 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none font-semibold"
                    disabled={loading}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30">
                    <Phone size={15} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95 transition-all outline-none"
              >
                {loading ? 'Dispersing secure line...' : 'Send OTP verification code'}
                <ChevronRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="text-[10px] uppercase font-extrabold tracking-widest text-white/60 block mb-2">
                  Enter 4-Digit Security Key
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={4}
                    placeholder="• • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-brand-deep/80 border border-white/15 rounded-xl py-3.5 text-center text-lg tracking-[8px] text-brand-cyan focus:border-brand-cyan outline-none font-black"
                    disabled={loading}
                    required
                  />
                  <div className="absolute inset-y-0 left-4 flex items-center text-white/20 select-none pointer-events-none">
                    <KeyRound size={15} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-brand-cyan text-brand-deep font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 transition-all outline-none"
              >
                {loading ? 'Validating Session...' : 'Unlock SafeJourney'}
              </button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <p className="text-[11px] text-white/40">
                    Resend code in <span className="text-white/60 font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSendOTP}
                    className="text-xs text-brand-cyan font-bold hover:underline"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer information bar */}
      <div className="text-center pb-4 text-[10px] text-white/30 uppercase tracking-widest">
        Protected by Real-Time Geofence Protocol
      </div>

      {/* Carrier Dispatched SMS simulated popup notification */}
      <AnimatePresence>
        {sysNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0.95 }}
            className="fixed top-6 left-6 right-6 mx-auto max-w-sm rounded-[20px] bg-black/90 border border-brand-cyan/50 backdrop-blur-2xl p-4.5 z-[999] shadow-2xl flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
              <MessageSquare size={18} className="animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] tracking-wider text-brand-cyan uppercase font-black">Carrier Gateway SMS</span>
                <span className="text-[9px] text-white/35 font-mono">Just Now</span>
              </div>
              <p className="text-xs font-bold text-white mb-0.5">OTP Code Dispatched</p>
              <p className="text-[11px] text-white/60 leading-normal">
                Your login code for <span className="font-mono text-white font-bold bg-white/10 px-1 py-0.5 rounded">+91 {sysNotification.phone}</span> is <strong className="text-brand-cyan font-black text-xs px-1.5 py-0.5 rounded bg-brand-cyan/15">{sysNotification.code}</strong>. Expires in 5 minutes.
              </p>
              <button
                onClick={() => {
                  setOtpCode(sysNotification.code);
                  setSysNotification(null);
                }}
                className="mt-2 text-[10px] font-black text-brand-cyan uppercase hover:underline block"
              >
                Auto-fill Code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
