import React, { useState } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Hand } from 'lucide-react';

export default function FingerCounter() {
  const [totalFingers, setTotalFingers] = useState(0);

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    let count = 0;
    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i].label;
        count += countFingers(landmarks, handedness);
      }
    }
    setTotalFingers(count);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-white">Finger Counter</h2>
        <p className="text-slate-400 text-sm">Hold up your hands to count fingers in real-time</p>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black">
        <WebcamOverlay onResults={handleResults}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
            <div className="glass-panel w-48 h-48 rounded-full flex flex-col items-center justify-center bg-slate-800/80 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              <span className="text-sm text-slate-300 mb-2 uppercase tracking-widest font-bold">Count</span>
              <span className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">
                {totalFingers}
              </span>
            </div>
          </div>
        </WebcamOverlay>
      </div>
    </div>
  );
}
