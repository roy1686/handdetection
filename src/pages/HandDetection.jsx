import React, { useState } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Activity, Hand } from 'lucide-react';

export default function HandDetection() {
  const [status, setStatus] = useState('Initializing...');
  const [fps, setFps] = useState(0);
  const [handCount, setHandCount] = useState(0);
  const [totalFingers, setTotalFingers] = useState(0);

  let lastFrameTime = performance.now();

  const handleResults = (results, ctx, canvas) => {
    // Calculate FPS
    const now = performance.now();
    const currentFps = Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;
    
    // Smooth FPS
    setFps((prev) => Math.round(prev * 0.9 + currentFps * 0.1));
    
    setStatus(results.multiHandLandmarks ? 'Tracking Active' : 'Waiting for hands...');
    
    let hands = 0;
    let fingers = 0;
    if (results.multiHandLandmarks && results.multiHandedness) {
      hands = results.multiHandLandmarks.length;
      for (let i = 0; i < hands; i++) {
        fingers += countFingers(results.multiHandLandmarks[i], results.multiHandedness[i].label);
      }
    }
    
    setHandCount(hands);
    setTotalFingers(fingers);

    // Draw Hands
    drawHandResults(results, ctx, canvas);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Real-Time Hand Detection</h2>
          <p className="text-slate-400 text-sm">Detects up to 2 hands using MediaPipe</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <Activity size={16} className={status === 'Tracking Active' ? 'text-green-400' : 'text-yellow-400'} />
            <span className="text-sm font-medium">{status}</span>
          </div>
          <div className="glass-panel px-4 py-2">
            <span className="text-sm text-slate-400">FPS:</span>
            <span className="ml-2 font-mono font-bold text-primary">{fps}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black">
        <WebcamOverlay onResults={handleResults}>
          <div className="absolute top-4 left-4 flex flex-col gap-3">
            <div className="glass-panel px-4 py-2 flex items-center justify-between min-w-[160px]">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2"><Hand size={16}/> Hands: </span>
              <span className="text-xl font-bold text-white">{handCount}</span>
            </div>
            <div className="glass-panel px-4 py-2 flex items-center justify-between min-w-[160px]">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2"><Hand size={16} className="rotate-45"/> Fingers: </span>
              <span className="text-xl font-bold text-primary">{totalFingers}</span>
            </div>
          </div>
        </WebcamOverlay>
      </div>
    </div>
  );
}
