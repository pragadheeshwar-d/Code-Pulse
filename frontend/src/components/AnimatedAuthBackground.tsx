import React, { useEffect, useRef } from 'react';

export const AnimatedAuthBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes configuration
    const PARTICLE_COUNT = Math.min(width < 768 ? 35 : 75, 90);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      phase: number;
    }> = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const baseAlpha = 0.15 + Math.random() * 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        alpha: baseAlpha,
        baseAlpha,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Grid properties
    const GRID_SIZE = 48;
    let gridOffset = 0;

    let time = 0;

    const render = () => {
      time += 0.015;
      gridOffset = (gridOffset + 0.15) % GRID_SIZE;

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle moving engineering grid
      ctx.strokeStyle = 'rgba(38, 40, 45, 0.45)'; // var(--border) tone
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = gridOffset; y <= height; y += GRID_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Connect particles with subtle neural/constellation web lines
      const MAX_DIST = 110;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const lineAlpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`; // var(--accent) #34D399
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Render glowing particles with gentle breathing pulsing
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Pulse alpha
        const pulse = Math.sin(time * 2 + p.phase) * 0.15;
        const currentAlpha = Math.max(0.05, Math.min(0.8, p.baseAlpha + pulse));

        // Draw particle dot
        ctx.fillStyle = `rgba(52, 211, 153, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Subtle radial vignette overlay to keep focus on center content
      const radialGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.2,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      radialGradient.addColorStop(0, 'rgba(14, 15, 17, 0.45)');
      radialGradient.addColorStop(1, 'rgba(14, 15, 17, 0.88)');

      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      {/* Dynamic ambient floating gradient orbs */}
      <div className="absolute top-1/4 left-1/5 w-[550px] h-[550px] rounded-full bg-[var(--accent)]/[0.04] blur-[150px] animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[var(--accent)]/[0.03] blur-[130px] animate-pulse duration-[10000ms]" />
    </div>
  );
};
