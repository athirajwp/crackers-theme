import React, { useEffect, useRef } from 'react';
import './Fireworks.css';

export default function Fireworks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let rockets = [];
    let particles = [];
    let sparklers = [];

    // Resize handler with High-DPI support
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Helpers
    const random = (min, max) => Math.random() * (max - min) + min;

    // Rocket Class
    class Rocket {
      constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.tx = targetX;
        this.ty = targetY;
        this.history = [];
        this.maxHistory = 15;
        
        // Calculate velocities to reach target
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.steps = random(40, 60); // ticks to reach target
        this.vx = dx / this.steps;
        this.vy = dy / this.steps;
        this.alpha = 1;
        this.hue = Math.floor(random(0, 360));
      }

      update() {
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) {
          this.history.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
        
        // Rocket trail smoke sparks
        if (Math.random() < 0.3) {
          sparklers.push(new SparklerParticle(this.x, this.y, `hsl(${this.hue}, 100%, 70%)`));
        }

        const dx = this.tx - this.x;
        const dy = this.ty - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If close to target or moving down, explode
        return dist < 8 || this.vy > 0;
      }

      draw() {
        ctx.beginPath();
        if (this.history.length > 0) {
          ctx.moveTo(this.history[0].x, this.history[0].y);
          for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
          }
        } else {
          ctx.moveTo(this.x, this.y);
        }
        ctx.strokeStyle = `hsla(${this.hue}, 100%, 65%, ${this.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Explosion Particle Class
    class Particle {
      constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.history = [];
        this.maxHistory = random(8, 15);
        
        // Circular distribution
        const angle = random(0, Math.PI * 2);
        const speed = random(1.5, 7.5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.friction = 0.96;
        this.gravity = 0.08;
        this.alpha = 1;
        this.decay = random(0.008, 0.02);
        this.color = `hsl(${hue}, 100%, ${random(50, 75)}%)`;
        
        // Sparkle flicker
        this.flicker = Math.random() < 0.4;
      }

      update() {
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) {
          this.history.shift();
        }

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        
        this.alpha -= this.decay;
        return this.alpha <= 0;
      }

      draw() {
        if (this.flicker && Math.random() < 0.15) return; // create sparkle animation

        ctx.beginPath();
        if (this.history.length > 0) {
          ctx.moveTo(this.history[0].x, this.history[0].y);
          for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
          }
        } else {
          ctx.moveTo(this.x, this.y);
        }
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.lineWidth = random(1, 2.5);
        ctx.stroke();
      }
    }

    // Sparkler/Mouse Trail Particle Class
    class SparklerParticle {
      constructor(x, y, color = '#fff') {
        this.x = x;
        this.y = y;
        this.vx = random(-1, 1);
        this.vy = random(-1, 1);
        this.alpha = 1;
        this.decay = random(0.02, 0.05);
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02; // soft gravity
        this.alpha -= this.decay;
        return this.alpha <= 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, random(0.8, 1.8), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }

    // Explode particles
    const createExplosion = (x, y, hue) => {
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 120 : Math.floor(random(160, 260));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, hue));
      }
    };

    // Auto launcher
    const autoLaunch = () => {
      const startX = random(window.innerWidth * 0.1, window.innerWidth * 0.9);
      const startY = window.innerHeight + 10;
      const targetX = random(window.innerWidth * 0.15, window.innerWidth * 0.85);
      const targetY = random(window.innerHeight * 0.15, window.innerHeight * 0.55);
      rockets.push(new Rocket(startX, startY, targetX, targetY));
    };

    let lastTime = 0;
    let autoLaunchTimer = 0;
    const autoLaunchDelay = 3000;

    // Global Interaction Handlers
    const handleMouseMove = (e) => {
      if (document.hidden) return;
      for (let i = 0; i < 2; i++) {
        sparklers.push(new SparklerParticle(e.clientX, e.clientY, `hsl(${random(0, 360)}, 100%, 75%)`));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Main animation loop
    const animate = (timestamp) => {
      if (!timestamp) timestamp = performance.now();
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!document.hidden) {
        autoLaunchTimer += delta;
        if (autoLaunchTimer >= autoLaunchDelay) {
          autoLaunch();
          autoLaunchTimer = 0;
        }

        // Transparent clear
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Render overlay glows with lighter composition mode
        ctx.globalCompositeOperation = 'lighter';

        // Update & Draw Rockets
        rockets = rockets.filter((rocket) => {
          const exploded = rocket.update();
          if (exploded) {
            createExplosion(rocket.tx, rocket.ty, rocket.hue);
            return false;
          }
          rocket.draw();
          return true;
        });

        // Update & Draw Explosion Particles
        particles = particles.filter((particle) => {
          const dead = particle.update();
          if (!dead) {
            particle.draw();
          }
          return !dead;
        });

        // Update & Draw Sparkler / Mouse trails
        sparklers = sparklers.filter((sparkler) => {
          const dead = sparkler.update();
          if (!dead) {
            sparkler.draw();
          }
          return !dead;
        });

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      } else {
        // Clear background queues completely when hidden
        rockets = [];
        particles = [];
        sparklers = [];
        autoLaunchTimer = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Kickoff
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fw-canvas" />;
}
