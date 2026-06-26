import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Brain, Users, Timer, HelpCircle } from 'lucide-react';

export default function GestureMemory() {
  const [gameState, setGameState] = useState('menu'); // menu, showing, playing, over
  const [mode, setMode] = useState('single'); // single, multi
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('');
  const [displayGesture, setDisplayGesture] = useState(null);
  
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [showInstructions, setShowInstructions] = useState(false);

  const holdTimerRef = useRef(null);
  const currentFingersRef = useRef(null);

  const getSeqLength = (lvl) => {
    if (difficulty === 'easy') return lvl + 1;
    if (difficulty === 'medium') return lvl + 2;
    return lvl + 3; // hard
  };

  const generateSequence = (len) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * 6)); // 0 to 5 fingers
    }
    return seq;
  };

  const startGame = () => {
    setLevel(1);
    setCurrentPlayer(1);
    setScores({ p1: 0, p2: 0 });
    startLevel(1, 1);
  };

  const startLevel = (lvl, player) => {
    const len = getSeqLength(lvl);
    const newSeq = generateSequence(len);
    setSequence(newSeq);
    setGameState('showing');
    setCurrentIndex(0);
    setMessage(mode === 'multi' ? `Player ${player}'s Turn! Memorize...` : 'Memorize the sequence!');
    
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
          setMessage('Your turn! Show the gestures.');
        }, 1000);
      }
    }, difficulty === 'easy' ? 2000 : difficulty === 'medium' ? 1500 : 1000);
  };

  const handleGameOver = (reason) => {
    setGameState('over');
    setMessage(`Game Over! ${reason}`);
  };

  const levelPassed = () => {
    
    const points = level * (difficulty === 'hard' ? 20 : difficulty === 'medium' ? 10 : 5);
    setScores(s => ({
      ...s,
      [currentPlayer === 1 ? 'p1' : 'p2']: s[currentPlayer === 1 ? 'p1' : 'p2'] + points
    }));

    if (mode === 'multi') {
      if (currentPlayer === 1) {
        setCurrentPlayer(2);
        setGameState('menu');
        setMessage(`Player 1 Passed! Get ready Player 2.`);
      } else {
        // Both passed, next level
        setLevel(l => l + 1);
        setCurrentPlayer(1);
        setGameState('menu');
        setMessage(`Level ${level} Complete! Next level...`);
      }
    } else {
      setLevel(l => l + 1);
      setGameState('menu');
      setMessage(`Level ${level} Passed! Get ready for the next one.`);
    }
  };

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    if (gameState !== 'playing') return;

    let fingers = -1;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      fingers = countFingers(results.multiHandLandmarks[0], results.multiHandedness[0].label);
    }

    const expected = sequence[currentIndex];
    
    if (fingers === expected) {
      if (!holdTimerRef.current) {
        holdTimerRef.current = setTimeout(() => {
          if (currentIndex + 1 === sequence.length) {
            levelPassed();
          } else {
            setCurrentIndex(c => c + 1);
          }
          holdTimerRef.current = null;
        }, 800);
      }
    } else {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }
    currentFingersRef.current = fingers;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Brain className="text-secondary"/> Gesture Memory
          </h2>
          <p className="text-slate-400 text-sm">Memorize and repeat the sequence of finger gestures.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button onClick={() => setShowInstructions(!showInstructions)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <HelpCircle size={24} />
          </button>
          <div className="glass-panel px-6 py-2 shadow-xl border-b-2 border-primary">
            <span className="text-xs text-slate-400 uppercase tracking-widest mr-2 font-black">Level</span>
            <span className="text-2xl font-black text-white">{level}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row shadow-2xl">
        
        <div className="w-full md:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults} />
          
          {showInstructions && gameState === 'menu' && (
             <div className="absolute top-4 left-4 z-50 glass-panel p-6 max-w-sm border border-primary/30 shadow-2xl bg-slate-900/90 backdrop-blur-xl">
               <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 border-b border-slate-700 pb-2">
                 <HelpCircle className="text-primary"/> How to Play
               </h3>
               <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                 The AI will show a sequence of numbers (0-5). You must reproduce them in order by holding up the correct number of fingers to the camera.
               </p>
               <button onClick={() => setShowInstructions(false)} className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">Understood</button>
             </div>
          )}
        </div>

        <div className="w-full md:w-1/3 glass-panel rounded-none md:border-l border-t md:border-t-0 border-slate-700/50 p-6 flex flex-col justify-center items-center text-center bg-slate-900">
          
          <div className="w-full mb-8 flex justify-center gap-6">
            <div className={`flex flex-col items-center ${mode === 'multi' && currentPlayer === 1 ? 'scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]' : ''} transition-all p-4 bg-slate-950 rounded-2xl border border-slate-800`}>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{mode === 'multi' ? 'Player 1' : 'Score'}</span>
              <span className="text-5xl font-black text-primary">{scores.p1}</span>
            </div>
            {mode === 'multi' && (
              <div className={`flex flex-col items-center ${currentPlayer === 2 ? 'scale-110 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]' : ''} transition-all p-4 bg-slate-950 rounded-2xl border border-slate-800`}>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Player 2</span>
                <span className="text-5xl font-black text-secondary">{scores.p2}</span>
              </div>
            )}
          </div>

          <div className="h-48 flex items-center justify-center mb-8 w-full bg-slate-950 rounded-3xl border border-slate-800 shadow-inner relative overflow-hidden">
            {gameState === 'showing' && displayGesture !== null && (
              <div className="animate-in zoom-in duration-300">
                <span className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-widest">Memorize</span>
                <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00f2fe] to-[#4facfe] drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">{displayGesture}</span>
              </div>
            )}
            
            {gameState === 'playing' && (
              <div>
                <span className="text-6xl font-black text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  {currentIndex} <span className="text-slate-700 text-4xl">/</span> {sequence.length}
                </span>
                <span className="block text-slate-500 text-[10px] font-black uppercase mt-4 tracking-widest">Matched</span>
                <div className="flex gap-3 mt-4 justify-center">
                  {sequence.map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full ${i < currentIndex ? 'bg-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,1)]' : 'bg-slate-800'}`}></div>
                  ))}
                </div>
              </div>
            )}

            {(gameState === 'menu' || gameState === 'over') && (
              <Brain size={80} className="text-slate-800 absolute opacity-20" />
            )}
            {(gameState === 'menu' || gameState === 'over') && (
               <span className={`text-xl font-medium relative z-10 px-4 ${gameState === 'over' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>{message}</span>
            )}
          </div>

          {(gameState === 'menu' || gameState === 'over') && (
            <div className="w-full flex flex-col gap-4 mt-auto">
              {gameState === 'menu' && level === 1 && (
                <>
                  <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button onClick={() => setMode('single')} className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider ${mode === 'single' ? 'bg-primary text-black shadow-lg' : 'text-slate-500'}`}>1P</button>
                    <button onClick={() => setMode('multi')} className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider ${mode === 'multi' ? 'bg-secondary text-white shadow-lg' : 'text-slate-500'}`}>2P</button>
                  </div>
                  <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button onClick={() => setDifficulty('easy')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${difficulty === 'easy' ? 'bg-green-500 text-black' : 'text-slate-500'}`}>Easy</button>
                    <button onClick={() => setDifficulty('medium')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${difficulty === 'medium' ? 'bg-yellow-500 text-black' : 'text-slate-500'}`}>Mid</button>
                    <button onClick={() => setDifficulty('hard')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'text-slate-500'}`}>Hard</button>
                  </div>
                  <button 
                    onClick={startGame}
                    className="mt-4 px-8 py-5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-2xl font-black text-white transition-all w-full transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)] text-lg"
                  >
                    START GAME
                  </button>
                </>
              )}
              
              {gameState === 'menu' && level > 1 && (
                <button 
                  onClick={() => startLevel(level, currentPlayer)}
                  className="mt-4 px-8 py-5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-2xl font-black text-white transition-all w-full transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)] text-lg uppercase"
                >
                  {mode === 'multi' ? `Player ${currentPlayer} Ready` : `Start Level ${level}`}
                </button>
              )}

              {gameState === 'over' && (
                <button 
                  onClick={() => setGameState('menu')}
                  className="mt-4 px-8 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-white transition-all w-full text-lg uppercase shadow-lg"
                >
                  Main Menu
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
