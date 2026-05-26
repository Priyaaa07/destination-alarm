import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import NavigationPage from './pages/NavigationPage';
import TrackingPage from './pages/TrackingPage';
import AlertPage from './pages/AlertPage';
import EmergencyPage from './pages/EmergencyPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';

function AnimatedRoutes() {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboarding_complete');
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('auth_token');
  });

  if (showOnboarding) {
    return (
      <OnboardingPage 
        onComplete={() => {
          localStorage.setItem('onboarding_complete', 'true');
          setShowOnboarding(false);
        }} 
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginPage 
        onLoginSuccess={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const hideNav = ['/navigation', '/tracking', '/alert'].includes(location.pathname);

  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/navigation" element={<PageWrapper><NavigationPage /></PageWrapper>} />
          <Route path="/tracking" element={<PageWrapper><TrackingPage /></PageWrapper>} />
          <Route path="/alert" element={<PageWrapper><AlertPage /></PageWrapper>} />
          <Route path="/emergency" element={<PageWrapper><EmergencyPage /></PageWrapper>} />
          <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
      {!hideNav && <BottomNav />}
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
