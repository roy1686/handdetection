import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Brain } from 'lucide-react';

export default function GestureMemory() {
  const [gameState, setGameState] = useState('start'); // start, showing, playing, over
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('');
  const [displayGesture, setDisplayGesture] = useState(null);
  
  const holdTimerRef = useRef(null);
  const currentFingersRef = useRef(null);

  const generateSequence = (len) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * 6)); // 0 to 5 fingers
    }
    return seq;
  };

  const startLevel = () => {
    const newSeq = generateSequence(level + 2);
    setSequence(newSeq);
    setGameState('showing');
    setCurrentIndex(0);
    setMessage('Memorize the sequence!');
    
    // Show sequence one by one
    let i = 0;
    const interval = setInterval(() => {
      if (i < newSeq.length) {
        setDisplayGesture(newSeq[i]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDisplayGesture(null);
          setGameState('playing');
          setMessage('Your turn! Show the gestures in order.');
        }, 1000);
      }
    }, 1500); // 1.5 seconds per gesture
  };

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    if (gameState !== 'playing') return;

    let fingers = -1;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      fingers = countFingers(results.multiHandLandmarks[0], results.multiHandedness[0].label);
    }

    // Check if the current detected gesture matches the expected one
    const expected = sequence[currentIndex];
    
    if (fingers === expected) {
      if (!holdTimerRef.current) {
        holdTimerRef.current = setTimeout(() => {
          // Gesture held and confirmed
          if (currentIndex + 1 === sequence.length) {
            // Level passed
            setGameState('start');
            setMessage(`Level ${level} Passed! Get ready for the next one.`);
            setLevel(l => l + 1);
          } else {
            setCurrentIndex(c => c + 1);
            setMessage(`Correct! Next gesture... (${currentIndex + 2}/${sequence.length})`);
          }
          holdTimerRef.current = null;
        }, 800); // Need to hold for 0.8 seconds
      }
    } else {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      // If they show a wrong gesture for a while, we could fail them, but for simplicity, we just wait for the right one.
      // Or we can say if they show the wrong stable gesture, game over. Let's just be lenient.
    }
    
    currentFingersRef.current = fingers;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Gesture Memory</h2>
          <p className="text-slate-400 text-sm">Memorize and repeat the sequence of finger gestures.</p>
        </div>
        <div className="glass-panel px-6 py-2">
          <span className="text-sm text-slate-400 uppercase tracking-widest mr-2">Level</span>
          <span className="text-xl font-bold text-primary">{level}</span>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults} />
        </div>

        <div className="w-full md:w-1/3 glass-panel rounded-none border-l border-slate-700/50 p-6 flex flex-col justify-center items-center text-center">
          <Brain size={48} className="text-secondary mb-6" />
          
          <div className="h-24 flex items-center justify-center mb-8">
            {gameState === 'showing' && displayGesture !== null && (
              <div className="animate-in zoom-in duration-300">
                <span className="block text-slate-400 mb-2">Show</span>
                <span className="text-7xl font-extrabold text-white">{displayGesture}</span>
                <span className="block text-slate-400 mt-2">Fingers</span>
              </div>
            )}
            
            {gameState === 'playing' && (
              <div>
                <span className="text-3xl font-bold text-primary">
                  {currentIndex} / {sequence.length}
                </span>
                <span className="block text-slate-400 mt-2">Gestures matched</span>
              </div>
            )}
          </div>

          <p className="text-lg text-slate-300 h-16">{message}</p>

          {gameState === 'start' && (
            <button 
              onClick={startLevel}
              className="mt-8 px-8 py-4 bg-primary hover:bg-blue-600 rounded-xl font-bold text-white transition-all w-full"
            >
              {level === 1 ? 'Start Game' : `Start Level ${level}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
