// Cooking Dede - Procedural Audio Engine (Web Audio API)
// Zero external files, 100% offline & instantaneous!

class AudioManager {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.bgmStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Master toggles
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.musicEnabled;
  }

  // Helper tone player
  playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (!this.soundEnabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {
      // Audio error safety
    }
  }

  // SFX: Zucchini chop sound
  playChop() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();

    // Noise burst + low thump
    const now = this.ctx.currentTime;
    
    // Thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);

    // Click snap
    this.playTone(800 + Math.random() * 200, 'square', 0.03, 0, 0.1);
  }

  // SFX: Perfect Slice (Mama sparkle)
  playPerfect() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.15, idx * 0.04, 0.12);
    });
  }

  // SFX: Good Slice
  playGood() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    this.playTone(587.33, 'sine', 0.1, 0, 0.12); // D5
    this.playTone(880.00, 'sine', 0.12, 0.05, 0.12); // A5
  }

  // SFX: Mistake / Wrong vegetable
  playMiss() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // SFX: Rapid slice whoosh
  playRapidSlice() {
    if (!this.soundEnabled || !this.ctx) return;
    this.playTone(300 + Math.random() * 300, 'triangle', 0.04, 0, 0.15);
  }

  // SFX: Victory Fanfare (Cooking Mama style)
  playFanfare() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const melody = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.50, d: 0.35, t: 0.36 },
      { f: 880.00, d: 0.12, t: 0.72 },
      { f: 1046.50, d: 0.5, t: 0.84 }
    ];

    melody.forEach(m => {
      this.playTone(m.f, 'triangle', m.d, m.t, 0.2);
      this.playTone(m.f * 0.5, 'sine', m.d, m.t, 0.15);
    });
  }

  // SFX: Muscle Flex / Chad Power
  playFlex() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // SFX: Hair Loss / Shock Poof
  playHairLoss() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // SFX: Cut Finger / Ouch Scream!
  playOuch() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    // High comical screech
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.linearRampToValueAtTime(450, now + 0.3);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // SFX: Dede voices
  playDedeVoice(emotion) {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();

    if (emotion === 'happy' || emotion === 'flame') {
      this.playTone(440, 'triangle', 0.06, 0, 0.15);
      this.playTone(660, 'triangle', 0.1, 0.05, 0.15);
    } else if (emotion === 'shock' || emotion === 'cry') {
      this.playTone(330, 'sawtooth', 0.1, 0, 0.12);
      this.playTone(240, 'sawtooth', 0.15, 0.08, 0.12);
    } else {
      this.playTone(500, 'sine', 0.08, 0, 0.1);
    }
  }

  // BGM: Catchy bouncy Cooking Mama style loop in C Major
  startBGM() {
    if (!this.musicEnabled || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;
    this.bgmStep = 0;

    // 130 BPM = ~115ms per 16th note
    const stepDuration = 115;

    // Cheerful cute melody notes (frequencies)
    const melody = [
      523.25, 0, 659.25, 0, 783.99, 659.25, 523.25, 0, // C, E, G, E, C
      587.33, 0, 698.46, 0, 880.00, 698.46, 587.33, 0, // D, F, A, F, D
      659.25, 0, 783.99, 0, 1046.50, 783.99, 659.25, 0, // E, G, C6, G, E
      783.99, 880.00, 783.99, 659.25, 587.33, 0, 523.25, 0 // G, A, G, E, D, C
    ];

    const bass = [
      130.81, 0, 130.81, 0, 196.00, 0, 130.81, 0,
      146.83, 0, 146.83, 0, 220.00, 0, 146.83, 0,
      164.81, 0, 164.81, 0, 246.94, 0, 164.81, 0,
      196.00, 0, 196.00, 0, 146.83, 0, 130.81, 0
    ];

    this.bgmInterval = setInterval(() => {
      if (!this.musicEnabled || !this.bgmPlaying) {
        clearInterval(this.bgmInterval);
        return;
      }

      const note = melody[this.bgmStep % melody.length];
      if (note > 0) {
        this.playTone(note, 'square', 0.08, 0, 0.035);
      }

      const b = bass[this.bgmStep % bass.length];
      if (b > 0) {
        this.playTone(b, 'triangle', 0.09, 0, 0.06);
      }

      // Soft cute percussion on beat
      if (this.bgmStep % 4 === 0) {
        this.playTone(80, 'sine', 0.04, 0, 0.08); // soft kick
      } else if (this.bgmStep % 4 === 2) {
        this.playTone(1200, 'triangle', 0.02, 0, 0.02); // soft hihat
      }

      this.bgmStep++;
    }, stepDuration);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

window.audioManager = new AudioManager();
