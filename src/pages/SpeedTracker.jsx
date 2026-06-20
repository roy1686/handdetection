import React, { useState, useRef } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { Activity } from 'lucide-react';

export default function SpeedTracker() {
  const [speed, setSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  
  const lastPosRef = useRef(null);
  const lastTimeRef = useRef(null);

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Track the wrist (landmark 0)
      const wrist = results.multiHandLandmarks[0][0];
      const now = performance.now();

      if (lastPosRef.current && lastTimeRef.current) {
        const dt = now - lastTimeRef.current;
        if (dt > 0) {
          const dx = (wrist.x - lastPosRef.current.x) * canvas.width;
          const dy = (wrist.y - lastPosRef.current.y) * canvas.height;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Speed in pixels per second
          const currentSpeed = Math.round((distance / dt) * 1000);
          
          // Smooth the speed slightly
          setSpeed(prev => {
            const smoothed = Math.round(prev * 0.7 + currentSpeed * 0.3);
            if (smoothed > maxSpeed) {
              setMaxSpeed(smoothed);
            }
            return smoothed;
          });
        }
      }

      lastPosRef.current = { x: wrist.x, y: wrist.y };
      lastTimeRef.current = now;
    } else {
      setSpeed(0);
      lastPosRef.current = null;
    }
  };

  const resetMaxSpeed = () => setMaxSpeed(0);

  // Calculate speed percentage for the meter (assuming 5000 is very fast)
  const speedPercent = Math.min((speed / 5000) * 100, 100);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Hand Speed Tracker</h2>
          <p className="text-slate-400 text-sm">Measure how fast your hands are moving</p>
        </div>
        <button 
          onClick={resetMaxSpeed}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
        >
          Reset Max
        </button>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults} />
        </div>

        <div className="w-full md:w-1/3 glass-panel rounded-none border-l border-slate-700/50 p-6 flex flex-col justify-center items-center">
          <Activity size={48} className="text-primary mb-6" />
          
          <div className="w-full mb-12">
            <div className="flex justify-between text-slate-400 mb-2 text-sm">
              <span>Current Speed</span>
              <span>{speed} px/s</span>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-75"
                style={{ width: `${speedPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 w-full">
            <span className="block text-slate-400 text-sm uppercase tracking-widest mb-2">Maximum Speed</span>
            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
              {maxSpeed}
            </span>
            <span className="text-slate-500 text-sm ml-2">px/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
