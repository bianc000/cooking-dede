// Cooking Dede - Dede Character Renderer & Animation System
// Faithfully renders Denis (Dede) with his iconic chef paper cap, gold earring,
// goatee, and dynamic transformations:
// 1. Muscolosissimo (Gigachad Dede) when slicing well!
// 2. Perde i capelli (Shiny bald) on first mistake!
// 3. Si taglia un dito (Giant bandaged finger + tears) on consecutive misses!

class DedeRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // States
    this.state = 'idle'; // idle, focus, flame, happy, shock, cry
    this.muscleLevel = 0; // 0 (normal), 1 (pumped), 2 (ripped), 3 (GIGACHAD)
    this.injuryState = 'none'; // 'none', 'bald', 'cut_finger'
    
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.animTime = 0;
    this.auraParticles = [];
    this.tearParticles = [];
    this.sparkleParticles = [];
    this.hairPoofParticles = [];

    // Flying cap physics when hair is lost
    this.flyingCap = null;

    // Speech bubble element
    this.speechEl = document.getElementById('dede-speech');
    this.speechBubble = document.getElementById('speech-bubble');

    this.startLoop();
  }

  setState(state, quote = null, isShout = false) {
    this.state = state;
    if (quote && this.speechEl) {
      this.speechEl.innerText = quote;
    }
    if (this.speechBubble) {
      if (isShout) {
        this.speechBubble.classList.add('shout');
      } else {
        this.speechBubble.classList.remove('shout');
      }
    }

    if (window.audioManager) {
      window.audioManager.playDedeVoice(state);
    }
  }

  setMuscleLevel(level, quote = null) {
    const prev = this.muscleLevel;
    this.muscleLevel = Math.max(0, Math.min(3, level));
    if (this.muscleLevel > prev && window.audioManager) {
      window.audioManager.playFlex();
    }
    if (quote) {
      this.setState('flame', quote, true);
    }
  }

  setInjury(injury, quote = null) {
    const prev = this.injuryState;
    this.injuryState = injury;

    if (injury === 'bald' && prev !== 'bald') {
      if (window.audioManager) window.audioManager.playHairLoss();
      // Trigger cap flying off & hair poof
      this.flyingCap = {
        x: this.canvas.width / 2,
        y: 80,
        vx: 4 + Math.random() * 3,
        vy: -7,
        rot: 0,
        vrot: 0.2
      };
      for (let i = 0; i < 16; i++) {
        this.hairPoofParticles.push({
          x: this.canvas.width / 2 + (Math.random() - 0.5) * 60,
          y: 90 + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 5,
          vy: -2 - Math.random() * 3,
          radius: 4 + Math.random() * 6,
          alpha: 1
        });
      }
      this.muscleLevel = 0;
      this.setState('shock', quote || '“I MIEI CAPELLI! LO SHOCK MI HA FATTO PERDERE I CAPELLI!”', true);
    } else if (injury === 'cut_finger') {
      if (window.audioManager) window.audioManager.playOuch();
      this.muscleLevel = 0;
      this.setState('cry', quote || '“AHI! IL MIO DITO! HO AFFETTATO IL DITO INVECE DELLA ZUCCHINA!”', true);
    } else if (injury === 'none') {
      this.flyingCap = null;
    }
  }

  resetStatus() {
    this.injuryState = 'none';
    this.muscleLevel = 0;
    this.flyingCap = null;
    this.setState('idle', '“Ma cosa ne sapete voi di grigliate... e di zucchine!”');
  }

  startLoop() {
    const render = () => {
      this.update();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  update() {
    this.animTime += 0.05;

    // Blinking
    this.blinkTimer += 1;
    if (this.blinkTimer > 150) {
      this.isBlinking = true;
      if (this.blinkTimer > 162) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Flying cap physics
    if (this.flyingCap) {
      this.flyingCap.x += this.flyingCap.vx;
      this.flyingCap.y += this.flyingCap.vy;
      this.flyingCap.vy += 0.4;
      this.flyingCap.rot += this.flyingCap.vrot;
      if (this.flyingCap.y > 350) {
        this.flyingCap = null;
      }
    }

    // Aura particles if Muscular
    if (this.muscleLevel >= 2 || this.state === 'flame') {
      if (Math.random() < 0.6) {
        this.auraParticles.push({
          x: 140 + (Math.random() - 0.5) * 160,
          y: 220,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -3 - Math.random() * 3,
          radius: 3 + Math.random() * 6,
          color: this.muscleLevel === 3 ? (Math.random() > 0.5 ? '#ffd700' : '#ff9100') : '#76ff03',
          alpha: 1
        });
      }
    }

    // Tear particles if crying / cut finger
    if (this.state === 'cry' || this.injuryState === 'cut_finger') {
      if (Math.random() < 0.5) {
        this.tearParticles.push({
          x: 120,
          y: 125,
          vx: -2 - Math.random() * 2,
          vy: 2 + Math.random() * 3,
          radius: 3 + Math.random() * 4,
          alpha: 1
        });
        this.tearParticles.push({
          x: 160,
          y: 125,
          vx: 2 + Math.random() * 2,
          vy: 2 + Math.random() * 3,
          radius: 3 + Math.random() * 4,
          alpha: 1
        });
      }
    }

    // Update aura
    this.auraParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      p.radius *= 0.96;
    });
    this.auraParticles = this.auraParticles.filter(p => p.alpha > 0);

    // Update tears
    this.tearParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
    });
    this.tearParticles = this.tearParticles.filter(p => p.alpha > 0);

    // Update hair poofs
    this.hairPoofParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      p.radius *= 0.95;
    });
    this.hairPoofParticles = this.hairPoofParticles.filter(p => p.alpha > 0);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    let bobY = Math.sin(this.animTime) * 3;
    if (this.muscleLevel >= 2) {
      bobY = Math.sin(this.animTime * 3) * 4;
    }
    const centerY = 142 + bobY;

    // --- GOLDEN CHAD AURA ---
    if (this.muscleLevel >= 2) {
      ctx.save();
      const auraGradient = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, 130);
      auraGradient.addColorStop(0, this.muscleLevel === 3 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(118, 255, 3, 0.25)');
      auraGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY + 20, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // --- DRAW TORSO & ARMS (TRANSFORMS WITH MUSCLE LEVEL) ---
    this.drawBody(ctx, centerX, centerY);

    // --- HEAD, FACE & EXPRESSIONS (DENIS'S LIKENESS) ---
    this.drawHead(ctx, centerX, centerY);

    // --- FLYING CAP IF DETACHED ---
    if (this.flyingCap) {
      ctx.save();
      ctx.translate(this.flyingCap.x, this.flyingCap.y);
      ctx.rotate(this.flyingCap.rot);
      this.drawPaperCapShape(ctx, 0, 0, 60, 28);
      ctx.restore();
    }

    // --- CUT FINGER OVERLAY IF INJURED ---
    if (this.injuryState === 'cut_finger') {
      this.drawCutFingerHand(ctx, centerX, centerY);
    }

    // --- PARTICLES ---
    this.drawParticles(ctx);
  }

  drawBody(ctx, centerX, centerY) {
    ctx.save();
    const m = this.muscleLevel;

    // Width and bulk factors
    const shoulderWidth = 65 + (m * 22);
    const bicepSize = 14 + (m * 15);
    const neckWidth = 14 + (m * 8);

    // --- NECK & TRAPS ---
    ctx.fillStyle = '#ffe0bd';
    // Trapezius muscles when buff
    if (m >= 1) {
      ctx.beginPath();
      ctx.moveTo(centerX - 35 - (m * 10), centerY + 45);
      ctx.lineTo(centerX - neckWidth, centerY + 25);
      ctx.lineTo(centerX + neckWidth, centerY + 25);
      ctx.lineTo(centerX + 35 + (m * 10), centerY + 45);
      ctx.closePath();
      ctx.fill();
    }
    // Main neck
    ctx.fillRect(centerX - neckWidth / 2, centerY + 26, neckWidth, 24);

    // --- BULGING SHOULDERS & BICEPS ---
    if (m >= 1) {
      // Massive biceps!
      ctx.fillStyle = '#ffd1a9';
      // Left arm (viewer's left)
      ctx.beginPath();
      ctx.arc(centerX - shoulderWidth, centerY + 58, bicepSize, 0, Math.PI * 2);
      ctx.fill();
      // Right arm (viewer's right)
      ctx.beginPath();
      ctx.arc(centerX + shoulderWidth, centerY + 58, bicepSize, 0, Math.PI * 2);
      ctx.fill();

      // Veins on biceps if Chad level
      if (m >= 2) {
        ctx.strokeStyle = '#29b6f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - shoulderWidth - 5, centerY + 50);
        ctx.lineTo(centerX - shoulderWidth, centerY + 62);
        ctx.lineTo(centerX - shoulderWidth - 4, centerY + 70);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + shoulderWidth + 5, centerY + 50);
        ctx.lineTo(centerX + shoulderWidth, centerY + 62);
        ctx.lineTo(centerX + shoulderWidth + 4, centerY + 70);
        ctx.stroke();
      }
    }

    // --- CHEF SHIRT / CHEST ---
    ctx.fillStyle = '#ffffff'; // White chef jacket (Denis style)
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 80, shoulderWidth - 5, 45 + (m * 8), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ripped seams if Gigachad
    if (m === 3) {
      ctx.fillStyle = '#ffd1a9'; // Ripped open chest peek
      ctx.beginPath();
      ctx.moveTo(centerX - 18, centerY + 50);
      ctx.lineTo(centerX + 18, centerY + 50);
      ctx.lineTo(centerX, centerY + 80);
      ctx.closePath();
      ctx.fill();
    }

    // --- DENIS'S BLACK SUSPENDERS / STRAPS ---
    ctx.fillStyle = '#263238'; // Dark suspenders from photo
    const strapOffset = 22 + (m * 8);
    ctx.fillRect(centerX - strapOffset - 6, centerY + 45, 12, 60);
    ctx.fillRect(centerX + strapOffset - 6, centerY + 45, 12, 60);

    // Chef badge
    ctx.font = m === 3 ? 'bold 24px Arial' : '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(m === 3 ? '💪🥒💪' : '🥒', centerX, centerY + 86);

    ctx.restore();

    // --- CHEF KNIFE IN RIGHT HAND ---
    if (this.injuryState !== 'cut_finger') {
      ctx.save();
      const knifeX = centerX + shoulderWidth + 5;
      const knifeY = centerY + 45;
      ctx.translate(knifeX, knifeY);
      let knifeAngle = Math.sin(this.animTime * 2) * 0.12;
      if (m >= 2) knifeAngle = Math.sin(this.animTime * 8) * 0.25;
      ctx.rotate(knifeAngle);

      // Hand
      ctx.fillStyle = '#ffe0bd';
      ctx.beginPath();
      ctx.arc(0, 0, 11 + (m * 2), 0, Math.PI * 2);
      ctx.fill();

      // Knife blade
      ctx.fillStyle = '#eceff1';
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, -6);
      ctx.lineTo(44, -14);
      ctx.lineTo(48, 8);
      ctx.lineTo(6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Handle
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-14, -5, 16, 10);
      ctx.restore();
    }
  }

  drawHead(ctx, centerX, centerY) {
    ctx.save();

    // --- DENIS'S HAIR UNDER CAP (DARK BROWN) ---
    if (this.injuryState !== 'bald') {
      ctx.fillStyle = '#3e2723';
      // Side hair & back tufts
      ctx.beginPath();
      ctx.arc(centerX - 42, centerY - 6, 10, 0, Math.PI * 2);
      ctx.arc(centerX + 42, centerY - 6, 10, 0, Math.PI * 2);
      ctx.arc(centerX - 35, centerY - 25, 12, 0, Math.PI * 2);
      ctx.arc(centerX + 35, centerY - 25, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- HEAD BASE (OVAL / JAWLINE) ---
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    // Slightly sculpted jawline for Denis (or super-jaw for Chad)
    if (this.muscleLevel >= 2) {
      // Chad Jawline
      ctx.moveTo(centerX - 46, centerY - 20);
      ctx.lineTo(centerX - 44, centerY + 24);
      ctx.lineTo(centerX, centerY + 46);
      ctx.lineTo(centerX + 44, centerY + 24);
      ctx.lineTo(centerX + 46, centerY - 20);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.ellipse(centerX, centerY, 46, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- BALD HEAD SHINE IF HAIR IS LOST ---
    if (this.injuryState === 'bald') {
      // High polish bald dome top
      ctx.fillStyle = '#ffe0bd';
      ctx.beginPath();
      ctx.arc(centerX, centerY - 24, 44, Math.PI, 0);
      ctx.fill();

      // Comic shiny reflection star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX - 18, centerY - 40, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px Arial';
      ctx.fillText('✨', centerX + 15, centerY - 38);
    }

    // --- DENIS'S GOLD HOOP EARRING (ON HIS RIGHT EAR = VIEWER'S LEFT) ---
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(centerX - 47, centerY + 8, 7, 0, Math.PI * 2);
    ctx.stroke();

    // Ear shapes
    ctx.fillStyle = '#ffd1a9';
    ctx.beginPath();
    ctx.arc(centerX - 45, centerY + 4, 8, 0, Math.PI * 2);
    ctx.arc(centerX + 45, centerY + 4, 8, 0, Math.PI * 2);
    ctx.fill();

    // --- CHEF PAPER CAP ("BUSTINA CON RIGA BLU") ---
    if (this.injuryState !== 'bald') {
      this.drawPaperCapShape(ctx, centerX, centerY - 52, 92, 38);
    }

    // --- DENIS'S GOATEE & STUBBLE ---
    ctx.fillStyle = 'rgba(62, 39, 35, 0.35)'; // Stubble shadow
    ctx.beginPath();
    // Goatee on chin
    ctx.arc(centerX, centerY + 40, 14, 0, Math.PI);
    ctx.fill();
    // Light mustache line
    ctx.fillRect(centerX - 16, centerY + 21, 32, 4);

    // --- EYES & EXPRESSION ---
    const eyeY = centerY + 4;
    const eyeLeftX = centerX - 18;
    const eyeRightX = centerX + 18;

    if (this.state === 'shock' || this.injuryState === 'bald') {
      // WIDE SHOCK EYES
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeY, 11, 0, Math.PI * 2);
      ctx.arc(eyeRightX, eyeY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tiny pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeY, 3, 0, Math.PI * 2);
      ctx.arc(eyeRightX, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Open O-mouth
      ctx.fillStyle = '#37474f';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 30, 11, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blue sweat drop
      ctx.fillStyle = '#29b6f6';
      ctx.beginPath();
      ctx.arc(centerX + 36, centerY - 14, 6, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.state === 'cry' || this.injuryState === 'cut_finger') {
      // TEARFUL CLOSED EYES > <
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      // Left eye
      ctx.beginPath();
      ctx.moveTo(eyeLeftX - 10, eyeY - 6);
      ctx.lineTo(eyeLeftX + 4, eyeY);
      ctx.lineTo(eyeLeftX - 10, eyeY + 6);
      ctx.stroke();
      // Right eye
      ctx.beginPath();
      ctx.moveTo(eyeRightX + 10, eyeY - 6);
      ctx.lineTo(eyeRightX - 4, eyeY);
      ctx.lineTo(eyeRightX + 10, eyeY + 6);
      ctx.stroke();

      // Screaming open mouth
      ctx.fillStyle = '#d32f2f';
      ctx.beginPath();
      ctx.arc(centerX, centerY + 28, 15, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.muscleLevel === 3) {
      // GIGACHAD ANIME GLOW EYES
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.ellipse(eyeLeftX, eyeY, 9, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeRightX, eyeY, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sunglasses or Chad Brow
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(eyeLeftX - 12, eyeY - 8);
      ctx.lineTo(eyeLeftX + 10, eyeY - 4);
      ctx.moveTo(eyeRightX - 10, eyeY - 4);
      ctx.lineTo(eyeRightX + 12, eyeY - 8);
      ctx.stroke();

      // Grinning confident mouth with teeth
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(centerX - 16, centerY + 25, 32, 10, 4);
      ctx.fill();
      ctx.stroke();

    } else {
      // DENIS'S SIGNATURE SQUINT & SMIRK ("Ma cosa ne sapete voi...")
      if (this.isBlinking) {
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(eyeLeftX - 10, eyeY);
        ctx.lineTo(eyeLeftX + 8, eyeY);
        ctx.moveTo(eyeRightX - 8, eyeY);
        ctx.lineTo(eyeRightX + 10, eyeY);
        ctx.stroke();
      } else {
        // Asymmetric eyes: slightly squinting right eye (like in the photo!)
        // Left eye
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.ellipse(eyeLeftX, eyeY, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeLeftX - 2, eyeY - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Right eye (squinting down a bit)
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.ellipse(eyeRightX, eyeY + 1, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeRightX - 2, eyeY - 1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows (tilted quizzical look)
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(eyeLeftX - 10, eyeY - 10);
        ctx.lineTo(eyeLeftX + 8, eyeY - 7);
        ctx.moveTo(eyeRightX - 8, eyeY - 7);
        ctx.lineTo(eyeRightX + 12, eyeY - 12); // raised eyebrow
        ctx.stroke();
      }

      // Denis's iconic pursed-lip smirk
      ctx.fillStyle = '#d81b60';
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX + 2, centerY + 28, 9, 5, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw the iconic folded paper side cap with the blue stripe
  drawPaperCapShape(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);

    // Main paper boat hat (white paper)
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-width / 2, height / 2);
    ctx.lineTo(-width / 2 + 8, -height / 2);
    ctx.lineTo(0, -height / 2 - 8); // top central peak
    ctx.lineTo(width / 2 - 8, -height / 2);
    ctx.lineTo(width / 2, height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // The iconic blue chevron trim line (from Denis's photo!)
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 10, -height / 2 + 2);
    ctx.lineTo(0, height / 2 - 6); // V notch in center
    ctx.lineTo(width / 2 - 10, -height / 2 + 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw the injured hand with giant cartoon bandaged finger
  drawCutFingerHand(ctx, centerX, centerY) {
    ctx.save();
    const handX = centerX - 30;
    const handY = centerY + 15;

    // Throbbing comic anger/pain marks
    ctx.font = '28px Arial';
    ctx.fillText('💢', handX - 30, handY - 35);
    ctx.fillText('💥', handX + 25, handY - 45);

    // Fist
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    ctx.arc(handX, handY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Giant wrapped index finger pointing up
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(handX - 10, handY - 45, 20, 45, 10);
    ctx.fill();
    ctx.stroke();

    // Bandage wraps lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(handX - 8, handY - 32);
    ctx.lineTo(handX + 8, handY - 28);
    ctx.moveTo(handX - 8, handY - 18);
    ctx.lineTo(handX + 8, handY - 14);
    ctx.stroke();

    // Red Cross / Blood Drop on bandage
    ctx.fillStyle = '#d50000';
    // Cross
    ctx.fillRect(handX - 6, handY - 26, 12, 4);
    ctx.fillRect(handX - 2, handY - 30, 4, 12);

    ctx.restore();
  }

  drawParticles(ctx) {
    // Aura particles
    this.auraParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tear particles
    this.tearParticles.forEach(p => {
      ctx.fillStyle = '#29b6f6';
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Hair poof particles
    this.hairPoofParticles.forEach(p => {
      ctx.fillStyle = '#3e2723';
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1.0;
  }
}

window.DedeRenderer = DedeRenderer;
