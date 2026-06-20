import React, { useState, useRef } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';

const CHOICES = ['Rock', 'Paper', 'Scissors'];

export default function RockPaperScissors() {
  const [gameState, setGameState] = useState('idle'); // idle, countdown, result
  const [countdown, setCountdown] = useState(3);
  const [userChoice, setUserChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ player: 0, ai: 0 });
  
  const currentFingersRef = useRef(0);

  const determineGesture = (fingers) => {
    if (fingers === 0) return 'Rock';
    if (fingers === 5 || fingers === 4) return 'Paper'; // sometimes thumb is missed
    if (fingers === 2) return 'Scissors';
    return 'Unknown';
  };

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    let fingers = 0;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      fingers = countFingers(results.multiHandLandmarks[0], results.multiHandedness[0].label);
    }
    currentFingersRef.current = fingers;
    
    // Auto-update user choice if idle so they can see what's being detected
    if (gameState === 'idle') {
      const gesture = determineGesture(fingers);
      if (gesture !== 'Unknown') setUserChoice(gesture);
    }
  };

  const startGame = () => {
    setGameState('countdown');
    setResult('');
    setAiChoice(null);
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        finishGame();
      }
    }, 1000);
  };

  const finishGame = () => {
    const finalUserGesture = determineGesture(currentFingersRef.current);
    const finalAiChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    
    setUserChoice(finalUserGesture);
    setAiChoice(finalAiChoice);

    if (finalUserGesture === 'Unknown') {
      setResult('Invalid Gesture');
      setGameState('result');
      return;
    }

    let winner = '';
    if (finalUserGesture === finalAiChoice) winner = 'Draw';
    else if (
      (finalUserGesture === 'Rock' && finalAiChoice === 'Scissors') ||
      (finalUserGesture === 'Paper' && finalAiChoice === 'Rock') ||
      (finalUserGesture === 'Scissors' && finalAiChoice === 'Paper')
    ) {
      winner = 'Player Wins!';
      setScore(s => ({ ...s, player: s.player + 1 }));
    } else {
      winner = 'AI Wins!';
      setScore(s => ({ ...s, ai: s.ai + 1 }));
    }

    setResult(winner);
    setGameState('result');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Rock Paper Scissors</h2>
          <p className="text-slate-400 text-sm">Play against the AI using hand gestures</p>
        </div>
        <div className="glass-panel px-6 py-2 flex items-center gap-6">
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest">Player</span>
            <div className="text-xl font-bold text-primary">{score.player}</div>
          </div>
          <div className="text-2xl text-slate-600">-</div>
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest">AI</span>
            <div className="text-xl font-bold text-secondary">{score.ai}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults} />
          
          {gameState === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
              <span className="text-9xl font-bold text-white animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                {countdown}
              </span>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/3 glass-panel rounded-none border-l border-slate-700/50 p-6 flex flex-col justify-center items-center text-center">
          {gameState === 'idle' && (
            <>
              <div className="mb-8">
                <span className="block text-slate-400 mb-2">Current Detection</span>
                <span className="text-3xl font-bold text-primary">{userChoice || 'None'}</span>
              </div>
              <button 
                onClick={startGame}
                className="px-8 py-4 bg-primary hover:bg-blue-600 rounded-xl font-bold text-white transition-all w-full max-w-[200px]"
              >
                Play Round
              </button>
            </>
          )}

          {gameState === 'result' && (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <h3 className={`text-4xl font-extrabold mb-8 ${result.includes('Player') ? 'text-green-400' : result.includes('AI') ? 'text-red-400' : 'text-yellow-400'}`}>
                {result}
              </h3>
              
              <div className="flex w-full justify-around mb-8">
                <div>
                  <span className="block text-slate-400 text-sm mb-2">You played</span>
                  <span className="text-2xl font-bold">{userChoice}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-sm mb-2">AI played</span>
                  <span className="text-2xl font-bold">{aiChoice}</span>
                </div>
              </div>

              <button 
                onClick={startGame}
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-white transition-all w-full max-w-[200px]"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
