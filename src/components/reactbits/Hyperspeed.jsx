import React, { useEffect, useRef } from 'react';

export default function Hyperspeed({ color = '#fff', speed = 5, density = 50 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < density; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width,
        pz: Math.random() * canvas.width
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      stars.forEach((star) => {
        star.z -= speed;
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
          star.z = canvas.width;
          star.pz = canvas.width;
        }

        const x = cx + (star.x / star.z) * canvas.width;
        const y = cy + (star.y / star.z) * canvas.width;
        
        const px = cx + (star.x / star.pz) * canvas.width;
        const py = cy + (star.y / star.pz) * canvas.width;

        star.pz = star.z;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.lineWidth = Math.max(0.1, (1 - star.z / canvas.width) * 3);
        ctx.strokeStyle = color;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, speed, density]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-50" />;
}
