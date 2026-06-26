import React, { useEffect, useRef } from 'react';

export default function ClickSpark({ sparkColor = '#fff', sparkSize = 10, sparkRadius = 15, sparkCount = 8, duration = 400 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let sparks = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lifeDecrease = 1 / (duration / 16);
      
      sparks.forEach((s, i) => {
        s.life -= lifeDecrease;
        s.x += s.vx;
        s.y += s.vy;
        
        if (s.life <= 0) {
          sparks.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
          ctx.fillStyle = sparkColor;
          ctx.globalAlpha = s.life;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      if (sparks.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const onClick = (e) => {
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount;
        const velocity = 2 + Math.random() * 2;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          size: sparkSize * (0.5 + Math.random() * 0.5)
        });
      }
      
      if (sparks.length > 0 && sparks.length <= sparkCount) {
        render(); // Restart loop if it was stopped
      }
    };

    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
}
