// Audio Engine using Web Audio API for synthetic Alarm Tunes
let activeAudioContext: AudioContext | null = null;
let activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
let playbackTimeout: any = null;

export const TUNES = [
  { id: 'cyber', name: 'Cyber Pulse', desc: 'Fast futuristic high-frequency beep pulses' },
  { id: 'retro', name: 'Retro Radar', desc: 'Arcade-vintage twin-tone warning sound' },
  { id: 'sunrise', name: 'Sunrise Echo', desc: 'Slightly softer rising frequency alarm' },
  { id: 'siren', name: 'Emergency Siren', desc: 'Classic repeating emergency sound sweep' },
  { id: 'cosmic', name: 'Cosmic Chimes', desc: 'Ambient space arpeggio chimes' },
];

export function stopAnyPlayingTune() {
  if (playbackTimeout) {
    clearTimeout(playbackTimeout);
    playbackTimeout = null;
  }
  activeOscillators.forEach(({ osc, gain }) => {
    try {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    } catch (e) {
      // already stopped
    }
  });
  activeOscillators = [];
  if (activeAudioContext) {
    try {
      activeAudioContext.close();
    } catch (e) {}
    activeAudioContext = null;
  }
}

export function playAlarmTune(tuneId: string, durationMs: number = 3000) {
  stopAnyPlayingTune();

  // Create standard AudioContext
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  activeAudioContext = ctx;

  const playPulse = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(0.2, start + 0.05);
    gainNode.gain.setValueAtTime(0.2, start + duration - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration);

    activeOscillators.push({ osc, gain: gainNode });
  };

  const now = ctx.currentTime;

  if (tuneId === 'cyber') {
    // Rapid high-pitched cyber synth pulses
    for (let i = 0; i < durationMs / 1000 * 4; i++) {
      const t = now + i * 0.25;
      playPulse(880, t, 0.12, 'square');
    }
  } else if (tuneId === 'retro') {
    // Twin alternating retro beep
    for (let i = 0; i < durationMs / 1000 * 2; i++) {
      const t = now + i * 0.5;
      playPulse(i % 2 === 0 ? 587.33 : 698.46, t, 0.22, 'triangle');
    }
  } else if (tuneId === 'sunrise') {
    // Sunrise Echo - rising frequencies
    for (let i = 0; i < durationMs / 1000 * 3; i++) {
      const t = now + i * 0.35;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, t);
      osc.frequency.exponentialRampToValueAtTime(660, t + 0.25);
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.25, t + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
      activeOscillators.push({ osc, gain: gainNode });
    }
  } else if (tuneId === 'siren') {
    // Continuously repeating slide up and down
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    
    // Create alternating sweep logic
    let index = 0;
    const interval = 0.5;
    const steps = durationMs / 1000 / interval;
    for (let i = 0; i < steps; i++) {
      const t = now + i * interval;
      if (i % 2 === 0) {
        osc.frequency.linearRampToValueAtTime(800, t + interval);
      } else {
        osc.frequency.linearRampToValueAtTime(400, t + interval);
      }
    }

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.setValueAtTime(0.15, now + durationMs / 1000 - 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationMs / 1000);
    activeOscillators.push({ osc, gain: gainNode });
  } else {
    // Cosmic chimes - arpeggiator
    const scale = [523.25, 659.25, 783.99, 987.77, 1046.50];
    const steps = durationMs / 1000 * 5;
    for (let i = 0; i < steps; i++) {
      const t = now + i * 0.2;
      const freq = scale[i % scale.length];
      playPulse(freq, t, 0.4, 'sine');
    }
  }

  playbackTimeout = setTimeout(() => {
    stopAnyPlayingTune();
  }, durationMs);
}
