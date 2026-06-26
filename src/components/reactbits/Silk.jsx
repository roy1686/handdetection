import React from 'react';

export default function Silk({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background: 'linear-gradient(45deg, #00f2fe, #4facfe, #00f2fe)',
          backgroundSize: '400% 400%',
          animation: 'silk-flow 15s ease infinite',
          filter: 'blur(60px)'
        }}
      />
      <div 
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8), transparent 60%)',
          animation: 'silk-pulse 8s ease-in-out infinite alternate',
        }}
      />
      <style>{`
        @keyframes silk-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes silk-pulse {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
