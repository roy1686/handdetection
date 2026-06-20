import React, { useState } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { detectSignLanguage } from '../utils/signLanguageMath';
import { Languages } from 'lucide-react';

export default function SignLanguageDemo() {
  const [detectedLetter, setDetectedLetter] = useState(null);

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    let letter = null;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const handednessLabel = results.multiHandedness && results.multiHandedness.length > 0 ? results.multiHandedness[0].label : 'Right';
      letter = detectSignLanguage(results.multiHandLandmarks[0], handednessLabel);
    }
    
    // Simple smoothing/debouncing could be applied here
    setDetectedLetter(letter);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-white">Sign Language Demo</h2>
        <p className="text-slate-400 text-sm">Demonstrating basic ASL letters: A, B, C, D, E, F, L, V, W, Y.</p>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults} />
        </div>

        <div className="w-full md:w-1/3 glass-panel rounded-none border-l border-slate-700/50 p-6 flex flex-col justify-center items-center text-center">
          <Languages size={48} className="text-primary mb-6" />
          
          <span className="block text-slate-400 mb-2 uppercase tracking-widest text-sm">Detected Letter</span>
          
          <div className="w-48 h-48 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800/50 shadow-inner mb-8 transition-all duration-300">
            {detectedLetter ? (
              <span className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary animate-in zoom-in duration-200">
                {detectedLetter}
              </span>
            ) : (
              <span className="text-2xl text-slate-500 font-bold">None</span>
            )}
          </div>

          <div className="w-full p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-left">
            <h4 className="font-bold text-white mb-2">Supported Letters:</h4>
            <ul className="text-sm text-slate-400 space-y-2">
              <li><strong className="text-slate-200">A:</strong> Fist with thumb to the side</li>
              <li><strong className="text-slate-200">B:</strong> Flat hand, thumb folded in</li>
              <li><strong className="text-slate-200">C:</strong> Fingers curved like a C</li>
              <li><strong className="text-slate-200">D:</strong> Index up, others forming circle with thumb</li>
              <li><strong className="text-slate-200">E:</strong> All fingers curled tightly</li>
              <li><strong className="text-slate-200">F:</strong> Index and thumb touching, others straight</li>
              <li><strong className="text-slate-200">L:</strong> Index straight up, thumb out, others folded</li>
              <li><strong className="text-slate-200">V:</strong> Index and middle straight (V shape), others folded</li>
              <li><strong className="text-slate-200">W:</strong> Index, middle, ring straight, others folded</li>
              <li><strong className="text-slate-200">Y:</strong> Thumb and pinky out, others folded</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
