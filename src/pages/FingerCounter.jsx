import React, { useState } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Hand, Users } from 'lucide-react';

export default function FingerCounter() {
  const [totalFingers, setTotalFingers] = useState(0);
  const [personsCount, setPersonsCount] = useState(1);

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    let count = 0;
    let handCount = 0;
    
    if (results.multiHandLandmarks && results.multiHandedness) {
      handCount = results.multiHandLandmarks.length;
      for (let i = 0; i < handCount; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i].label;
        count += countFingers(landmarks, handedness);
      }
    }
    
    setTotalFingers(count);
    
    const detectedPersons = handCount > 2 ? 2 : (handCount > 0 ? 1 : 0);
    setPersonsCount(detectedPersons);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Finger Counter</h2>
          <p className="text-slate-400 text-sm">Hold up your hands to count fingers in real-time</p>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black shadow-xl">
        <div className="w-full h-full relative pointer-events-none">
          <WebcamOverlay onResults={handleResults}>
            <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-auto">
              <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 bg-slate-900/80">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Hand className="text-primary" size={28} />
                </div>
                <div>
                  <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">Fingers</p>
                  <p className="text-4xl font-black text-white">{totalFingers}</p>
                </div>
              </div>
              
              <div className={`glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 bg-slate-900/80 transition-opacity duration-300 ${personsCount > 1 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="p-3 bg-secondary/20 rounded-xl">
                  <Users className="text-secondary" size={28} />
                </div>
                <div>
                  <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">Persons</p>
                  <p className="text-2xl font-bold text-white">{personsCount}</p>
                </div>
              </div>
            </div>
          </WebcamOverlay>
        </div>
      </div>
    </div>
  );
}
