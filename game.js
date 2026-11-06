// Cooking Dede - Core Game Engine
// Manages states, minigames, physics, scoring, and comedic Mama flair!

class CookingDedeGame {
  constructor() {
    this.currentView = 'title';
    this.currentRecipe = null;
    this.score = 0;
    this.combo = 0;
    this.zucchiniCutCount = 0;
    this.timer = 15;
    this.timerInterval = null;

    // Subsystems
    this.dede = new DedeRenderer('dede-canvas');
    this.audio = window.audioManager;

    // DOM Elements
    this.initDOMElements();
    this.attachEventListeners();

    // Minigame States
    this.rhythmState = null;
    this.rapidState = null;
    this.dojoState = null;

    this.showView('title');
    this.dede.setState('idle', '“Benvenuto! Oggi cuciniamo... le mie adorate zucchine!”');
  }

  initDOMElements() {
    this.views = {
      title: document.getElementById('view-title'),
      recipes: document.getElementById('view-recipes'),
      rhythm: document.getElementById('view-minigame-rhythm'),
      rapid: document.getElementById('view-minigame-rapid'),
      dojo: document.getElementById('view-minigame-dojo'),
      result: document.getElementById('view-result')
    };

    this.scoreEl = document.getElementById('score-val');
    this.streakEl = document.getElementById('streak-val');
    this.streakBox = document.getElementById('streak-box');
    this.timerEl = document.getElementById('timer-val');
    this.timerBox = document.getElementById('timer-box');
    this.stageTitleEl = document.getElementById('stage-title');

    // Canvases
    this.rhythmCanvas = document.getElementById('rhythm-canvas');
    this.rapidCanvas = document.getElementById('rapid-canvas');
    this.dojoCanvas = document.getElementById('dojo-canvas');

    // Modals
    this.howtoModal = document.getElementById('modal-howto');
  }

  attachEventListeners() {
    // Title buttons
    document.getElementById('btn-start-recipes').addEventListener('click', () => {
      this.audio.init();
      this.audio.playGood();
      this.showView('recipes');
      this.dede.setState('idle', '“Scegli pure qualsiasi ricetta! Tanto io ci metto solo zucchine!”');
    });

    document.getElementById('btn-start-arcade').addEventListener('click', () => {
      this.audio.init();
      this.audio.playGood();
      this.startDojoMinigame();
    });

    document.getElementById('btn-how-to').addEventListener('click', () => {
      this.audio.init();
      this.howtoModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-howto').addEventListener('click', () => {
      this.audio.playGood();
      this.howtoModal.classList.add('hidden');
    });

    document.getElementById('btn-back-from-recipes').addEventListener('click', () => {
      this.audio.playGood();
      this.showView('title');
      this.dede.setState('idle', '“Non andartene! Le zucchine hanno bisogno di noi!”');
    });

    // Sound / Music headers
    const btnSound = document.getElementById('btn-sound');
    btnSound.addEventListener('click', () => {
      const active = this.audio.toggleSound();
      btnSound.innerText = active ? '🔊' : '🔇';
    });

    const btnMusic = document.getElementById('btn-music');
    btnMusic.addEventListener('click', () => {
      const active = this.audio.toggleMusic();
      btnMusic.innerText = active ? '🎵' : '💤';
    });

    // Recipe cards selection
    document.querySelectorAll('.recipe-card').forEach(card => {
      card.addEventListener('click', () => {
        const recipeType = card.getAttribute('data-recipe');
        this.selectRecipe(recipeType);
      });
    });

    // Minigame 1: Rhythm action button and keyboard
    const chopBtn = document.getElementById('btn-chop-action');
    chopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.triggerRhythmChop();
    });
    this.rhythmCanvas.addEventListener('pointerdown', () => {
      this.triggerRhythmChop();
    });

    // Minigame 2: Rapid action button and keyboard
    const rapidBtn = document.getElementById('btn-rapid-action');
    rapidBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.triggerRapidChop();
    });
    this.rapidCanvas.addEventListener('pointerdown', () => {
      this.triggerRapidChop();
    });

    // Minigame 3: Dojo canvas tap
    this.dojoCanvas.addEventListener('pointerdown', (e) => {
      const rect = this.dojoCanvas.getBoundingClientRect();
      const scaleX = this.dojoCanvas.width / rect.width;
      const scaleY = this.dojoCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      this.triggerDojoSlice(x, y);
    });

    // Global Keyboard Spacebar trigger
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.currentView === 'rhythm') {
          this.triggerRhythmChop();
        } else if (this.currentView === 'rapid') {
          this.triggerRapidChop();
        }
      }
    });

    // Result actions
    document.getElementById('btn-replay').addEventListener('click', () => {
      this.audio.playGood();
      if (this.currentRecipe) {
        this.selectRecipe(this.currentRecipe.id);
      } else {
        this.startDojoMinigame();
      }
    });

    document.getElementById('btn-result-menu').addEventListener('click', () => {
      this.audio.playGood();
      this.showView('title');
      this.dede.setState('idle', '“Che bontà! Tagliamo ancora?”');
    });
  }

  showView(viewName) {
    this.currentView = viewName;
    Object.keys(this.views).forEach(k => {
      if (k === viewName) {
        this.views[k].classList.add('active');
      } else {
        this.views[k].classList.remove('active');
      }
    });

    // Reset top bar info visibility
    if (viewName === 'title' || viewName === 'recipes') {
      this.timerBox.style.display = 'none';
      this.streakBox.style.display = 'none';
      this.stageTitleEl.innerText = 'Cucina di Dede';
    } else {
      this.timerBox.style.display = 'flex';
      this.streakBox.style.display = 'flex';
    }
  }

  updateHUD() {
    this.scoreEl.innerText = this.score;
    this.streakEl.innerText = `x${this.combo}`;
    this.timerEl.innerText = `${Math.max(0, Math.ceil(this.timer))}s`;
  }

  // ==========================================
  // RECIPES SYSTEM
  // ==========================================
  selectRecipe(recipeId) {
    this.audio.playGood();
    this.score = 0;
    this.combo = 0;
    this.zucchiniCutCount = 0;
    this.updateHUD();

    const recipes = {
      trifolate: {
        id: 'trifolate',
        name: 'Zucchine Trifolate alla Dede',
        desc: 'Trionfo di Zucchine a Rondelle',
        phases: ['rhythm', 'rapid'],
        quotes: {
          start: '“Questa è la mia ricetta leggendaria! Fai fette sottili e tonde!”',
          rapid: '“Ora trita tutto con passione incontenibile!”'
        }
      },
      carbonara: {
        id: 'carbonara',
        name: 'Carbonara (100% Zucchine)',
        desc: 'Spaghetti di Zucchina con Crema di Zucchina',
        phases: ['rhythm', 'rapid'],
        quotes: {
          start: '“Niente pecorino né pasta: solo la nobile cucurbitacea!”',
          rapid: '“Riduci la zucchina a striscioline sottilissime!”'
        }
      },
      sacher: {
        id: 'sacher',
        name: 'Torta Sacher alle Zucchine',
        desc: 'Fetta di Zucchina glassata alla Zucchina',
        phases: ['rapid', 'rhythm'],
        quotes: {
          start: '“Cacao? No no, ho una cassa di zucchine appena raccolte!”',
          rapid: '“Frulla tutto a colpi di mannaia rapida!”'
        }
      }
    };

    this.currentRecipe = recipes[recipeId];
    this.currentRecipePhaseIndex = 0;
    this.startRecipePhase();
  }

  startRecipePhase() {
    const phase = this.currentRecipe.phases[this.currentRecipePhaseIndex];
    if (phase === 'rhythm') {
      this.stageTitleEl.innerText = `${this.currentRecipe.name} (Fase 1)`;
      this.dede.setState('focus', this.currentRecipe.quotes.start);
      this.startRhythmMinigame();
    } else if (phase === 'rapid') {
      this.stageTitleEl.innerText = `${this.currentRecipe.name} (Fase Turbo)`;
      this.dede.setState('flame', this.currentRecipe.quotes.rapid, true);
      this.startRapidMinigame();
    }
  }

  nextRecipePhase() {
    this.currentRecipePhaseIndex++;
    if (this.currentRecipePhaseIndex < this.currentRecipe.phases.length) {
      this.startRecipePhase();
    } else {
      this.showResults();
    }
  }

  // ==========================================
  // MINIGAME 1: RHYTHM SLICER
  // ==========================================
  startRhythmMinigame() {
    this.showView('rhythm');
    this.timer = 18;
    this.updateHUD();

    const canvas = this.rhythmCanvas;
    const ctx = canvas.getContext('2d');

    // Slice indicators configuration
    const totalSlices = 10;
    const slicePositions = [];
    const boardStartX = 140;
    const zucchiniWidth = 320;
    const step = zucchiniWidth / totalSlices;

    for (let i = 1; i <= totalSlices; i++) {
      slicePositions.push({
        x: boardStartX + (i * step),
        cut: false
      });
    }

    this.rhythmState = {
      active: true,
      currentSliceIndex: 0,
      knifeX: boardStartX + 20,
      knifeSpeed: 3.5,
      direction: 1,
      minX: boardStartX,
      maxX: boardStartX + zucchiniWidth + 20,
      slices: slicePositions,
      flyingSlices: [],
      particles: [],
      feedbackEl: document.getElementById('rhythm-hit-feedback')
    };

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer -= 0.5;
      this.updateHUD();
      if (this.timer <= 0) {
        this.endRhythmMinigame();
      }
    }, 500);

    // Animation Loop
    const loop = () => {
      if (!this.rhythmState || !this.rhythmState.active) return;
      this.updateRhythm();
      this.drawRhythm(ctx);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  triggerRhythmChop() {
    if (!this.rhythmState || !this.rhythmState.active) return;
    const state = this.rhythmState;
    const currentTarget = state.slices[state.currentSliceIndex];
    if (!currentTarget) return;

    const diff = Math.abs(state.knifeX - currentTarget.x);

    let rating = 'miss';
    let pts = 0;
    let comment = '';

    if (diff < 14) {
      rating = 'perfect';
      pts = 120 + (this.combo * 15);
      this.combo++;
      comment = '“Rondella da maestro!”';
      this.audio.playPerfect();
      this.dede.setState('flame', comment, true);
    } else if (diff < 32) {
      rating = 'good';
      pts = 60;
      this.combo++;
      comment = '“Bella fetta! Dede approva!”';
      this.audio.playGood();
      this.dede.setState('happy', comment);
    } else {
      rating = 'miss';
      pts = 10;
      this.combo = 0;
      comment = '“Un po’ storta, ma è pur sempre una zucchina!”';
      this.audio.playMiss();
      this.dede.setState('focus', comment);
    }

    this.score += pts;
    this.zucchiniCutCount++;
    this.updateHUD();

    // Show feedback tag
    this.showFeedback(state.feedbackEl, rating === 'perfect' ? 'PERFETTO! ✨' : (rating === 'good' ? 'BUONO! 👍' : 'QUASI! 🥒'), rating);

    // Spawn flying slice
    currentTarget.cut = true;
    state.flyingSlices.push({
      x: currentTarget.x,
      y: 170,
      vx: 3 + Math.random() * 4,
      vy: -6 - Math.random() * 3,
      rot: 0,
      vrot: 0.15 + Math.random() * 0.15,
      radius: 28,
      alpha: 1
    });

    // Particle splash
    for (let i = 0; i < 8; i++) {
      state.particles.push({
        x: currentTarget.x,
        y: 170,
        vx: (Math.random() - 0.5) * 6,
        vy: -3 - Math.random() * 4,
        radius: 2 + Math.random() * 3,
        color: Math.random() > 0.4 ? '#81c784' : '#fff59d',
        life: 1
      });
    }

    state.currentSliceIndex++;
    if (state.currentSliceIndex >= state.slices.length) {
      setTimeout(() => {
        this.endRhythmMinigame();
      }, 700);
    }
  }

  updateRhythm() {
    const s = this.rhythmState;
    if (!s) return;

    // Move knife back and forth
    s.knifeX += s.knifeSpeed * s.direction;
    if (s.knifeX > s.maxX) {
      s.knifeX = s.maxX;
      s.direction = -1;
    } else if (s.knifeX < s.minX) {
      s.knifeX = s.minX;
      s.direction = 1;
    }

    // Flying slices physics
    s.flyingSlices.forEach(sl => {
      sl.x += sl.vx;
      sl.y += sl.vy;
      sl.vy += 0.4; // gravity
      sl.rot += sl.vrot;
      if (sl.y > 300) sl.alpha -= 0.05;
    });
    s.flyingSlices = s.flyingSlices.filter(sl => sl.alpha > 0);

    // Particles
    s.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.life -= 0.04;
    });
    s.particles = s.particles.filter(p => p.life > 0);
  }

  drawRhythm(ctx) {
    const s = this.rhythmState;
    if (!s) return;
    const w = this.rhythmCanvas.width;
    const h = this.rhythmCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Cutting Board Texture
    ctx.fillStyle = '#deb887';
    ctx.fillRect(40, 40, w - 80, h - 80);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Wood Grain lines
    ctx.strokeStyle = 'rgba(141, 110, 99, 0.2)';
    ctx.lineWidth = 2;
    for (let y = 60; y < h - 60; y += 35) {
      ctx.beginPath();
      ctx.moveTo(45, y);
      ctx.bezierCurveTo(200, y + 8, 400, y - 8, w - 45, y);
      ctx.stroke();
    }

    // --- ZUCCHINI BODY ON BOARD ---
    const boardStartX = 140;
    const zucchiniWidth = 320;
    const zY = 170;

    // Remaining uncut zucchini segments
    ctx.save();
    ctx.fillStyle = '#2e7d32';
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 3;

    // Main zucchini cylinder
    ctx.beginPath();
    ctx.roundRect(boardStartX, zY - 32, zucchiniWidth, 64, [32, 8, 8, 32]);
    ctx.fill();
    ctx.stroke();

    // Zucchini shiny highlight & ridges
    ctx.fillStyle = '#43a047';
    ctx.fillRect(boardStartX + 10, zY - 26, zucchiniWidth - 20, 6);
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(boardStartX + 10, zY + 20, zucchiniWidth - 20, 5);

    // Stem at left end
    ctx.fillStyle = '#33691e';
    ctx.beginPath();
    ctx.roundRect(boardStartX - 22, zY - 10, 22, 20, [8, 0, 0, 8]);
    ctx.fill();
    ctx.restore();

    // Target slicing line markers
    s.slices.forEach((target, idx) => {
      if (idx === s.currentSliceIndex) {
        // Active pulsing target
        ctx.strokeStyle = '#ff1744';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(target.x, zY - 45);
        ctx.lineTo(target.x, zY + 45);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cut indicator arrow
        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 18px Fredoka';
        ctx.textAlign = 'center';
        ctx.fillText('▼ TAGLIA!', target.x, zY - 50);
      } else if (!target.cut) {
        // Future cuts
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(target.x, zY - 34);
        ctx.lineTo(target.x, zY + 34);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Already cut line notch
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(target.x, zY - 32);
        ctx.lineTo(target.x, zY + 32);
        ctx.stroke();
      }
    });

    // --- FLYING ZUCCHINI SLICES ---
    s.flyingSlices.forEach(sl => {
      ctx.save();
      ctx.globalAlpha = sl.alpha;
      ctx.translate(sl.x, sl.y);
      ctx.rotate(sl.rot);

      // Zucchini round slice
      ctx.fillStyle = '#2e7d32'; // dark skin rim
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e8f5e9'; // juicy pale flesh
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius - 4, 0, Math.PI * 2);
      ctx.fill();

      // Core seeds
      ctx.fillStyle = '#c8e6c9';
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#81c784';
      ctx.beginPath();
      ctx.arc(-4, -2, 2, 0, Math.PI * 2);
      ctx.arc(4, -3, 2, 0, Math.PI * 2);
      ctx.arc(0, 4, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Particles
    s.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // --- THE MOVING CHEF KNIFE ---
    ctx.save();
    ctx.translate(s.knifeX, zY - 60);

    // Knife blade shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-2, 10, 4, 90);

    // Knife blade
    ctx.fillStyle = '#eceff1';
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -60);
    ctx.lineTo(4, -60);
    ctx.lineTo(4, 30);
    ctx.lineTo(-4, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Knife edge highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -58, 2, 85);

    // Knife handle
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(-6, -95, 12, 35);
    ctx.restore();
  }

  endRhythmMinigame() {
    if (!this.rhythmState || !this.rhythmState.active) return;
    this.rhythmState.active = false;
    clearInterval(this.timerInterval);

    this.audio.playGood();
    if (this.currentRecipe) {
      this.nextRecipePhase();
    } else {
      this.showResults();
    }
  }

  // ==========================================
  // MINIGAME 2: RAPID JULIENNE (SPAM SLICING)
  // ==========================================
  startRapidMinigame() {
    this.showView('rapid');
    this.timer = 8;
    this.updateHUD();

    const canvas = this.rapidCanvas;
    const ctx = canvas.getContext('2d');

    const meterFill = document.getElementById('rapid-meter-fill');
    const statusText = document.getElementById('rapid-status-text');

    this.rapidState = {
      active: true,
      cutProgress: 0,
      targetCuts: 35,
      rapidPower: 0,
      meterFillEl: meterFill,
      statusEl: statusText,
      knifeChopY: 0,
      zucchiniPiles: [],
      particles: []
    };

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer -= 0.5;
      this.updateHUD();

      // Drain rapid power over time if not spamming
      if (this.rapidState && this.rapidState.rapidPower > 0) {
        this.rapidState.rapidPower = Math.max(0, this.rapidState.rapidPower - 8);
        this.updateRapidMeter();
      }

      if (this.timer <= 0) {
        this.endRapidMinigame();
      }
    }, 500);

    const loop = () => {
      if (!this.rapidState || !this.rapidState.active) return;
      this.updateRapid();
      this.drawRapid(ctx);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  triggerRapidChop() {
    if (!this.rapidState || !this.rapidState.active) return;
    const s = this.rapidState;

    s.cutProgress++;
    this.zucchiniCutCount++;
    s.rapidPower = Math.min(100, s.rapidPower + 12);
    s.knifeChopY = 25; // chop down
    this.score += 25;
    this.updateHUD();
    this.audio.playChop();

    // Spawn julienne sticks
    for (let i = 0; i < 4; i++) {
      s.zucchiniPiles.push({
        x: 280 + (Math.random() - 0.5) * 80,
        y: 170 + (Math.random() - 0.5) * 20,
        w: 16 + Math.random() * 8,
        h: 4,
        angle: (Math.random() - 0.5) * 0.8,
        color: Math.random() > 0.5 ? '#2e7d32' : '#c8e6c9'
      });
    }

    // Anime flame state if power is high
    if (s.rapidPower > 70) {
      this.dede.setState('flame', '“NON MI PUÒ FERMARE NESSUNO! JULIENNE PURA!”', true);
    } else {
      this.dede.setState('focus', '“Più veloce! Trita, trita, trita!”');
    }

    this.updateRapidMeter();

    if (s.cutProgress >= s.targetCuts) {
      this.audio.playPerfect();
      this.showFeedback(document.getElementById('rhythm-hit-feedback'), 'TRITATA TOTALMENTE! ⚡', 'perfect');
      setTimeout(() => {
        this.endRapidMinigame();
      }, 500);
    }
  }

  updateRapidMeter() {
    const s = this.rapidState;
    if (!s) return;
    s.meterFillEl.style.width = `${s.rapidPower}%`;
    if (s.rapidPower > 80) {
      s.statusEl.innerText = 'TURBO DEDE! 🔥';
      s.statusEl.style.color = '#d50000';
    } else if (s.rapidPower > 40) {
      s.statusEl.innerText = 'OTTIMO RITMO! ⚡';
      s.statusEl.style.color = '#f57c00';
    } else {
      s.statusEl.innerText = 'PIÙ VELOCE! 🔪';
      s.statusEl.style.color = '#388e3c';
    }
  }

  updateRapid() {
    const s = this.rapidState;
    if (!s) return;

    if (s.knifeChopY > 0) {
      s.knifeChopY -= 5;
    }
  }

  drawRapid(ctx) {
    const s = this.rapidState;
    if (!s) return;
    const w = this.rapidCanvas.width;
    const h = this.rapidCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Cutting board
    ctx.fillStyle = '#deb887';
    ctx.fillRect(40, 20, w - 80, h - 40);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 20, w - 80, h - 40);

    // Growing mountain of julienne zucchini sticks
    s.zucchiniPiles.forEach(stick => {
      ctx.save();
      ctx.translate(stick.x, stick.y);
      ctx.rotate(stick.angle);
      ctx.fillStyle = stick.color;
      ctx.fillRect(-stick.w / 2, -stick.h / 2, stick.w, stick.h);
      ctx.restore();
    });

    // Whole zucchini being sliced away
    const remainingRatio = Math.max(0, 1 - (s.cutProgress / s.targetCuts));
    if (remainingRatio > 0.05) {
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(160, 140, 220 * remainingRatio, 45);
    }

    // Blurred motion knife chopping down
    ctx.save();
    const knifeX = 280;
    const knifeY = 80 + s.knifeChopY;

    // Afterimage if turbo
    if (s.rapidPower > 60) {
      ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
      ctx.fillRect(knifeX - 15, knifeY - 40, 30, 80);
    }

    // Big Cleaver
    ctx.fillStyle = '#cfd8dc';
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(knifeX - 20, knifeY - 30, 40, 80, 4);
    ctx.fill();
    ctx.stroke();

    // Wooden cleaver handle
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(knifeX - 8, knifeY - 70, 16, 40);
    ctx.restore();
  }

  endRapidMinigame() {
    if (!this.rapidState || !this.rapidState.active) return;
    this.rapidState.active = false;
    clearInterval(this.timerInterval);

    this.audio.playGood();
    if (this.currentRecipe) {
      this.nextRecipePhase();
    } else {
      this.showResults();
    }
  }

  // ==========================================
  // MINIGAME 3: DEDE DOJO (SOLO ZUCCHINE!)
  // ==========================================
  startDojoMinigame() {
    this.currentRecipe = null;
    this.score = 0;
    this.combo = 0;
    this.zucchiniCutCount = 0;
    this.timer = 30;
    this.stageTitleEl.innerText = 'Dede Dojo (Solo Zucchine!)';
    this.showView('dojo');
    this.updateHUD();

    const canvas = this.dojoCanvas;
    const ctx = canvas.getContext('2d');
    const feedbackEl = document.getElementById('dojo-feedback');
    const livesEl = document.getElementById('dojo-lives');

    this.dojoState = {
      active: true,
      lives: 3,
      items: [],
      particles: [],
      livesEl: livesEl,
      feedbackEl: feedbackEl,
      spawnTimer: 0
    };

    this.updateDojoLivesDisplay();
    this.dede.setState('focus', '“Taglia SOLO LE ZUCCHINE! Le altre verdure mi fanno orrore!”');

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer -= 0.5;
      this.updateHUD();
      if (this.timer <= 0) {
        this.endDojoMinigame();
      }
    }, 500);

    const loop = () => {
      if (!this.dojoState || !this.dojoState.active) return;
      this.updateDojo();
      this.drawDojo(ctx);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateDojoLivesDisplay() {
    const hearts = ['🤍', '🤍', '🤍'];
    for (let i = 0; i < this.dojoState.lives; i++) {
      hearts[i] = '💚';
    }
    this.dojoState.livesEl.innerHTML = `<span>Vite:</span> ` + hearts.map(h => `<span class="heart">${h}</span>`).join('');
  }

  triggerDojoSlice(x, y) {
    if (!this.dojoState || !this.dojoState.active) return;
    const s = this.dojoState;

    // Check hit items
    for (let i = s.items.length - 1; i >= 0; i--) {
      const item = s.items[i];
      if (item.sliced) continue;

      const dist = Math.hypot(x - item.x, y - item.y);
      if (dist < item.radius + 15) {
        item.sliced = true;

        if (item.isZucchini) {
          // RIGHT! Zucchini cut!
          this.audio.playChop();
          this.score += 150 + (this.combo * 20);
          this.combo++;
          this.zucchiniCutCount += 2;
          this.updateHUD();

          this.showFeedback(s.feedbackEl, 'BELLA ZUCCHINA! 🥒', 'perfect');
          this.dede.setState('happy', '“Sì! L’adoro! Più fette per me!”');

          // Green splash particles
          for (let p = 0; p < 12; p++) {
            s.particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              radius: 3 + Math.random() * 4,
              color: '#81c784',
              life: 1
            });
          }
        } else {
          // WRONG! Non-zucchini vegetable!
          this.audio.playMiss();
          s.lives--;
          this.combo = 0;
          this.updateHUD();
          this.updateDojoLivesDisplay();

          this.showFeedback(s.feedbackEl, 'NON È UNA ZUCCHINA! 🚨', 'miss');
          this.dede.setState('shock', `“BLEAH! ${item.name.toUpperCase()}?! CHE SCHIFO!”`, true);

          if (s.lives <= 0) {
            setTimeout(() => {
              this.endDojoMinigame();
            }, 600);
            return;
          }
        }
        break;
      }
    }
  }

  updateDojo() {
    const s = this.dojoState;
    if (!s) return;

    // Spawning items
    s.spawnTimer++;
    if (s.spawnTimer > 32) {
      s.spawnTimer = 0;

      // 65% chance of Zucchini, 35% chance of Impostor vegetable!
      const isZucchini = Math.random() < 0.65;
      const impostors = [
        { name: 'Pomodoro', icon: '🍅', color: '#e53935' },
        { name: 'Carota', icon: '🥕', color: '#ff9800' },
        { name: 'Melanzana', icon: '🍆', color: '#8e24aa' },
        { name: 'Peperone', icon: '🫑', color: '#43a047' }
      ];

      const imp = impostors[Math.floor(Math.random() * impostors.length)];

      s.items.push({
        isZucchini: isZucchini,
        name: isZucchini ? 'Zucchina' : imp.name,
        icon: isZucchini ? '🥒' : imp.icon,
        x: 60 + Math.random() * 480,
        y: 350,
        vx: (Math.random() - 0.5) * 4,
        vy: -9 - Math.random() * 4,
        radius: 30,
        sliced: false,
        rot: 0,
        vrot: (Math.random() - 0.5) * 0.15
      });
    }

    // Physics
    s.items.forEach(item => {
      item.x += item.vx;
      item.y += item.vy;
      item.vy += 0.35; // Gravity
      item.rot += item.vrot;
    });

    // Remove offscreen
    s.items = s.items.filter(item => item.y < 420);

    // Particles
    s.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
    });
    s.particles = s.particles.filter(p => p.life > 0);
  }

  drawDojo(ctx) {
    const s = this.dojoState;
    if (!s) return;
    const w = this.dojoCanvas.width;
    const h = this.dojoCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dojo Tatami / Kitchen Wood background
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(0, 0, w, h);

    // Dojo bamboo stripes
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 6;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw Vegetables
    s.items.forEach(item => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);

      if (item.sliced) {
        // Sliced halves flying apart
        ctx.font = '28px Arial';
        ctx.fillText(item.icon, -15, 0);
        ctx.fillText(item.icon, 15, 0);
      } else {
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, 0, 0);

        // Highlight ring around zucchinis
        if (item.isZucchini) {
          ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    // Particles
    s.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  endDojoMinigame() {
    if (!this.dojoState || !this.dojoState.active) return;
    this.dojoState.active = false;
    clearInterval(this.timerInterval);
    this.showResults();
  }

  // ==========================================
  // RESULTS VIEW & RATING (BETTER THAN MAMA!)
  // ==========================================
  showResults() {
    this.showView('result');
    this.audio.playFanfare();

    const resultTitleEl = document.getElementById('result-title');
    const starsEl = document.getElementById('result-stars');
    const totalScoreEl = document.getElementById('result-total-score');
    const zucchiniCountEl = document.getElementById('result-zucchini-count');
    const commentEl = document.getElementById('result-dede-comment');
    const dishNameEl = document.getElementById('result-dish-name');

    totalScoreEl.innerText = this.score;
    zucchiniCountEl.innerText = `${this.zucchiniCutCount} fette perfette`;

    if (this.currentRecipe) {
      dishNameEl.innerText = this.currentRecipe.desc;
    } else {
      dishNameEl.innerText = 'Trionfo del Dojo delle Zucchine';
    }

    // Rating evaluation
    if (this.score >= 1200) {
      // 3 STARS: EVEN BETTER THAN MAMA!
      resultTitleEl.innerText = 'EVEN BETTER THAN DEDE! 🥒✨';
      starsEl.innerHTML = '<span class="star-icon star-pop-1">⭐</span><span class="star-icon star-pop-2">⭐</span><span class="star-icon star-pop-3">⭐</span>';
      commentEl.innerText = '“INCREDIBILE! Neanche Mama saprebbe tagliare una zucchina con tanta maestria!”';
      this.dede.setState('flame', '“SONO COMMOSSO! SEI IL MIO EREDE DELLE ZUCCHINE!”', true);
    } else if (this.score >= 600) {
      // 2 STARS: DEDE APPROVA!
      resultTitleEl.innerText = 'BUONO! DEDE APPROVA! 👍';
      starsEl.innerHTML = '<span class="star-icon star-pop-1">⭐</span><span class="star-icon star-pop-2">⭐</span><span class="star-icon" style="opacity:0.3">⭐</span>';
      commentEl.innerText = '“Bel lavoro! Abbiamo riempito tre ciotole di rondelle croccanti!”';
      this.dede.setState('happy', '“Bravo! Con qualche altro taglio sarai perfetto!”');
    } else {
      // 1 STAR: NON PIANGERE!
      resultTitleEl.innerText = 'NON PIANGERE... C’È DEDE! 💚';
      starsEl.innerHTML = '<span class="star-icon star-pop-1">⭐</span><span class="star-icon" style="opacity:0.3">⭐</span><span class="star-icon" style="opacity:0.3">⭐</span>';
      commentEl.innerText = '“Non ti preoccupare! Dede taglierà altre mille zucchine per consolarti!”';
      this.dede.setState('cry', '“Le zucchine sono buone lo stesso... singh!”');
    }
  }

  showFeedback(el, text, type) {
    if (!el) return;
    el.innerText = text;
    el.className = `hit-feedback show ${type}`;
    setTimeout(() => {
      el.className = 'hit-feedback';
    }, 600);
  }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new CookingDedeGame();
});
