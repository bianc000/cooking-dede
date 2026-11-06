// Cooking Dede - Dede Character Renderer & Animation System
// Renders Dede procedurally on canvas with hilarious expressive anime states!

class DedeRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.state = 'idle'; // idle, focus, flame, happy, shock, cry
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.animTime = 0;
    this.flameParticles = [];
    this.tearParticles = [];
    this.sparkleParticles = [];

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

    // Blinking logic
    this.blinkTimer += 1;
    if (this.blinkTimer > 160) {
      this.isBlinking = true;
      if (this.blinkTimer > 172) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Flame particles if in flame state
    if (this.state === 'flame') {
      if (Math.random() < 0.4) {
        this.flameParticles.push({
          x: 105 + (Math.random() - 0.5) * 30,
          y: 110,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -2 - Math.random() * 2,
          radius: 4 + Math.random() * 5,
          color: Math.random() > 0.5 ? '#ffeb3b' : '#ff5722',
          alpha: 1
        });
        this.flameParticles.push({
          x: 175 + (Math.random() - 0.5) * 30,
          y: 110,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -2 - Math.random() * 2,
          radius: 4 + Math.random() * 5,
          color: Math.random() > 0.5 ? '#ffeb3b' : '#ff5722',
          alpha: 1
        });
      }
    }

    // Tear particles if in cry state
    if (this.state === 'cry') {
      if (Math.random() < 0.3) {
        this.tearParticles.push({
          x: 100,
          y: 120,
          vx: -1.5 - Math.random(),
          vy: 2 + Math.random() * 2,
          radius: 3 + Math.random() * 3,
          alpha: 1
        });
        this.tearParticles.push({
          x: 180,
          y: 120,
          vx: 1.5 + Math.random(),
          vy: 2 + Math.random() * 2,
          radius: 3 + Math.random() * 3,
          alpha: 1
        });
      }
    }

    // Update flame particles
    this.flameParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      p.radius *= 0.95;
    });
    this.flameParticles = this.flameParticles.filter(p => p.alpha > 0);

    // Update tear particles
    this.tearParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
    });
    this.tearParticles = this.tearParticles.filter(p => p.alpha > 0);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    // Breathing & bobbing offset
    let bobY = Math.sin(this.animTime) * 3;
    if (this.state === 'flame') {
      bobY = Math.sin(this.animTime * 4) * 5;
    }

    const centerY = 145 + bobY;

    // Speed lines background if flame mode
    if (this.state === 'flame') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 87, 34, 0.3)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + (this.animTime * 0.5);
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * 70, centerY + Math.sin(angle) * 70);
        ctx.lineTo(centerX + Math.cos(angle) * 160, centerY + Math.sin(angle) * 160);
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- CHEF APRON & BODY ---
    ctx.save();
    // Torso / shoulders
    ctx.fillStyle = '#42a5f5'; // Blue chef shirt
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 85, 65, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Apron
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 35, centerY + 55);
    ctx.lineTo(centerX + 35, centerY + 55);
    ctx.lineTo(centerX + 45, centerY + 110);
    ctx.lineTo(centerX - 45, centerY + 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute zucchini badge on apron!
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🥒', centerX, centerY + 85);
    ctx.restore();

    // --- NECK ---
    ctx.fillStyle = '#ffd1a9';
    ctx.fillRect(centerX - 12, centerY + 30, 24, 25);

    // --- HEAD ---
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = 'rgba(255, 112, 138, 0.45)';
    ctx.beginPath();
    ctx.arc(centerX - 33, centerY + 14, 11, 0, Math.PI * 2);
    ctx.arc(centerX + 33, centerY + 14, 11, 0, Math.PI * 2);
    ctx.fill();

    // Hair Tuft on sides
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(centerX - 48, centerY - 6, 8, 0, Math.PI * 2);
    ctx.arc(centerX + 48, centerY - 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // --- CHEF HAT ---
    ctx.save();
    // Hat brim
    ctx.fillStyle = '#f5f5f5';
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(centerX - 46, centerY - 48, 92, 16, 8);
    ctx.fill();
    ctx.stroke();

    // Hat puffy top
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - 24, centerY - 72, 24, 0, Math.PI * 2);
    ctx.arc(centerX + 24, centerY - 72, 24, 0, Math.PI * 2);
    ctx.arc(centerX, centerY - 85, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- EYES & EXPRESSION ---
    ctx.save();
    const eyeY = centerY - 4;
    const eyeLeftX = centerX - 20;
    const eyeRightX = centerX + 20;

    if (this.state === 'flame') {
      // ANIME FIRE EYES
      this.drawFlameEye(eyeLeftX, eyeY);
      this.drawFlameEye(eyeRightX, eyeY);

      // Intense grin
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.arc(centerX, centerY + 20, 16, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(centerX - 10, centerY + 20, 20, 5); // Teeth
    } else if (this.state === 'happy') {
      // Joyful curved anime eyes ^ ^
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeY, 12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeRightX, eyeY, 12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Big happy open mouth
      ctx.fillStyle = '#d81b60';
      ctx.beginPath();
      ctx.arc(centerX, centerY + 18, 14, 0, Math.PI);
      ctx.fill();
    } else if (this.state === 'shock') {
      // Tiny dot shock eyes
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeY, 4, 0, Math.PI * 2);
      ctx.arc(eyeRightX, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Open oval mouth
      ctx.fillStyle = '#37474f';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 22, 10, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sweat drop
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.arc(centerX + 38, centerY - 20, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.state === 'cry') {
      // Tearful eyes
      ctx.fillStyle = '#42a5f5';
      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeY, 10, 0, Math.PI * 2);
      ctx.arc(eyeRightX, eyeY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Wobbly mouth
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY + 26, 12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      // IDLE or FOCUS
      if (this.isBlinking) {
        // Closed blink line
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(eyeLeftX - 10, eyeY);
        ctx.lineTo(eyeLeftX + 10, eyeY);
        ctx.moveTo(eyeRightX - 10, eyeY);
        ctx.lineTo(eyeRightX + 10, eyeY);
        ctx.stroke();
      } else {
        // Big cute anime eyes
        this.drawCuteEye(eyeLeftX, eyeY);
        this.drawCuteEye(eyeRightX, eyeY);
      }

      // Mouth
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (this.state === 'focus') {
        // Tongue sticking out or concentrated grin
        ctx.arc(centerX, centerY + 18, 8, 0, Math.PI);
        ctx.stroke();
      } else {
        // Gentle smile
        ctx.arc(centerX, centerY + 15, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
    }
    ctx.restore();

    // --- PARTICLES DRAWING ---
    // Flame particles
    this.flameParticles.forEach(p => {
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
    ctx.globalAlpha = 1.0;

    // --- CHEF KNIFE IN HAND ---
    ctx.save();
    const knifeArmX = centerX + 46;
    let knifeAngle = Math.sin(this.animTime * 2) * 0.1;
    if (this.state === 'flame') {
      knifeAngle = Math.sin(this.animTime * 12) * 0.35;
    }
    ctx.translate(knifeArmX, centerY + 45);
    ctx.rotate(knifeAngle);

    // Hand
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Knife blade
    ctx.fillStyle = '#cfd8dc';
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.lineTo(38, -12);
    ctx.lineTo(42, 6);
    ctx.lineTo(5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Handle
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-12, -4, 14, 8);
    ctx.restore();
  }

  drawCuteEye(x, y) {
    const ctx = this.ctx;
    // Outer eye
    ctx.fillStyle = '#2e7d32'; // Zucchini green anime irises!
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(x, y + 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 3, y - 5, 4, 0, Math.PI * 2);
    ctx.arc(x + 4, y + 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFlameEye(x, y) {
    const ctx = this.ctx;
    // Roaring yellow-orange eye
    ctx.fillStyle = '#ff3d00';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

window.DedeRenderer = DedeRenderer;
