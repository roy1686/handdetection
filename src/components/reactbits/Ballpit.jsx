import React, { useEffect, useRef, useState } from 'react';

export default function Ballpit({ count = 20, gravity = 0.5, bounce = 0.7, colors = ['#00f2fe', '#4facfe', '#8b5cf6', '#f83600'] }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let balls = [];

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize balls
    for (let i = 0; i < count; i++) {
      balls.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height, // Start above
        radius: 10 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      balls.forEach(ball => {
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Floor collision
        if (ball.y + ball.radius > canvas.height) {
          ball.y = canvas.height - ball.radius;
          ball.vy *= -bounce;
          ball.vx *= 0.99; // friction
        }
        
        // Wall collision
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
          ball.vx *= -bounce;
          ball.x = ball.x - ball.radius < 0 ? ball.radius : canvas.width - ball.radius;
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, gravity, bounce, colors]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}
