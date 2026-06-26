import React from 'react';

export default function Aurora({ colorStops = ["#00f2fe", "#4facfe", "#8b5cf6"], blend = 0.5, amplitude = 1.0, speed = 1.0 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 mix-blend-screen opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% -20%, ${colorStops[0]}, transparent 70%),
                       radial-gradient(ellipse at 80% 0%, ${colorStops[1]}, transparent 50%),
                       radial-gradient(ellipse at 20% 0%, ${colorStops[2]}, transparent 50%)`,
          animation: `aurora-wave ${10 / speed}s ease-in-out infinite alternate`,
          transform: `scale(1.${Math.floor(amplitude * 2)})`
        }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      
      <style>{`
        @keyframes aurora-wave {
          0% { transform: translateY(-5%) rotate(-2deg) scale(1.1); opacity: ${blend}; }
          50% { transform: translateY(5%) rotate(2deg) scale(1.15); opacity: ${blend + 0.2}; }
          100% { transform: translateY(-5%) rotate(-2deg) scale(1.1); opacity: ${blend}; }
        }
      `}</style>
    </div>
  );
}
