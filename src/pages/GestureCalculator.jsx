import React, { useState } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';

export default function GestureCalculator() {
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [operator, setOperator] = useState('+');

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    let left = 0;
    let right = 0;

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i].label; // "Left" or "Right"
        
        const count = countFingers(landmarks, handedness);
        if (handedness === 'Left') {
          left = count;
        } else {
          right = count;
        }
      }
    }

    setNumA(left);
    setNumB(right);
  };

  const calculateResult = () => {
    switch (operator) {
      case '+': return numA + numB;
      case '-': return numA - numB;
      case '*': return numA * numB;
      case '/': return numB === 0 ? 'Err' : (numA / numB).toFixed(2);
      default: return 0;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-white">Gesture Calculator</h2>
        <p className="text-slate-400 text-sm">Hold up fingers on your left and right hands to calculate</p>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults} />
        </div>

        <div className="w-full md:w-1/3 glass-panel rounded-none border-l border-slate-700/50 p-6 flex flex-col items-center bg-slate-900">
          <div className="w-full bg-slate-800 rounded-xl p-6 mb-8 text-right shadow-inner border border-slate-700">
            <div className="text-slate-400 text-lg mb-2">
              {numA} {operator} {numB} =
            </div>
            <div className="text-5xl font-extrabold text-primary font-mono tracking-tighter">
              {calculateResult()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {['+', '-', '*', '/'].map((op) => (
              <button
                key={op}
                onClick={() => setOperator(op)}
                className={`py-6 rounded-xl text-3xl font-bold transition-all ${
                  operator === op 
                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="mt-8 text-center text-slate-400 text-sm">
            <span className="block mb-2"><strong className="text-slate-300">Left Hand:</strong> First Number ({numA})</span>
            <span className="block"><strong className="text-slate-300">Right Hand:</strong> Second Number ({numB})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
