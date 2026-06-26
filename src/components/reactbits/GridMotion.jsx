import React from 'react';

export default function GridMotion({ color = "rgba(0, 242, 254, 0.2)", size = 40, speed = 2 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-[1000px]">
      <div 
        className="absolute w-[200%] h-[200%] left-[-50%] top-[-50%]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${color} 1px, transparent 1px),
            linear-gradient(to bottom, ${color} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          transform: 'rotateX(60deg) translateZ(-200px)',
          animation: `grid-move ${speed}s linear infinite`,
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 80%)'
        }}
      />
      <style>{`
        @keyframes grid-move {
          0% { transform: rotateX(60deg) translateY(0) translateZ(-200px); }
          100% { transform: rotateX(60deg) translateY(${size}px) translateZ(-200px); }
        }
      `}</style>
    </div>
  );
}
