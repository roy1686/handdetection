import React, { useRef, useState, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { ArrowDownCircle, ShieldQuestion, HelpCircle, Trophy } from 'lucide-react';

const LEVELS = {
  Easy: { spawnRate: 0.02, minSpeed: 150, maxSpeed: 200 },
  Medium: { spawnRate: 0.04, minSpeed: 250, maxSpeed: 250 },
  Hard: { spawnRate: 0.06, minSpeed: 350, maxSpeed: 300 }
};

export default function CatchGame() {
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
  const [showInstructions, setShowInstructions] = useState(true);
  const [level, setLevel] = useState('Medium');
  
  const gameCanvasRef = useRef(null);
  const objectsRef = useRef([]);
  const basketRef = useRef({ x: 0, y: 680, width: 150, height: 20 });
  const animationRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  const startGame = () => {
    setScore(0);
    setMisses(0);
    setGameState('playing');
    setShowInstructions(false);
    objectsRef.current = [];
    lastTimeRef.current = performance.now();
  };

  useEffect(() => {
    const loop = (time) => {
      if (!gameCanvasRef.current) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      
      const ctx = gameCanvasRef.current.getContext('2d');
      const canvas = gameCanvasRef.current;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      if (gameState === 'playing') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentLvl = LEVELS[level];

        // Spawn object randomly based on level
        if (Math.random() < currentLvl.spawnRate) { 
          objectsRef.current.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: -20,
            radius: 15 + Math.random() * 10,
            speed: currentLvl.minSpeed + Math.random() * currentLvl.maxSpeed, 
            color: `hsl(${Math.random() * 360}, 80%, 60%)`
          });
        }

        const basket = basketRef.current;
        const basketY = basket.y;

        for (let i = objectsRef.current.length - 1; i >= 0; i--) {
          const obj = objectsRef.current[i];
          obj.y += obj.speed * dt;

          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.shadowColor = obj.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;

          if (
            obj.y + obj.radius > basketY &&
            obj.y - obj.radius < basketY + basket.height &&
            obj.x + obj.radius > basket.x &&
            obj.x - obj.radius < basket.x + basket.width
          ) {
            objectsRef.current.splice(i, 1);
            setScore(s => s + 10);
          } else if (obj.y > canvas.height + obj.radius) {
            objectsRef.current.splice(i, 1);
            setMisses(m => {
              const newMisses = m + 1;
              if (newMisses >= 5) setGameState('gameover');
              return newMisses;
            });
          }
        }

        // Draw Basket
        ctx.fillStyle = '#00f2fe'; 
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(basket.x, basketY, basket.width, basket.height, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, level]);

  const handleResults = (results, ctx, webcamCanvas) => {
    ctx.save();
    ctx.globalAlpha = 0.4;
    drawHandResults(results, ctx, webcamCanvas);
    ctx.restore();

    if (gameCanvasRef.current) {
      if (gameCanvasRef.current.width !== webcamCanvas.width || gameCanvasRef.current.height !== webcamCanvas.height) {
        gameCanvasRef.current.width = webcamCanvas.width;
        gameCanvasRef.current.height = webcamCanvas.height;
      }
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const center = results.multiHandLandmarks[0][9];
      const x = (1 - center.x) * webcamCanvas.width;
      const y = center.y * webcamCanvas.height;
      
      const bW = basketRef.current.width;
      const bH = basketRef.current.height;
      basketRef.current.x = Math.max(0, Math.min(webcamCanvas.width - bW, x - bW / 2));
      basketRef.current.y = Math.max(0, Math.min(webcamCanvas.height - bH, y - bH / 2));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <ArrowDownCircle className="text-primary"/> Catch Game
          </h2>
          <p className="text-slate-400 text-sm">Move the basket with your palm. Don't drop 5 objects!</p>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setShowInstructions(!showInstructions)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <HelpCircle size={24} />
          </button>

          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            disabled={gameState === 'playing'}
            className="bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 outline-none focus:border-primary font-bold shadow-lg"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <div className="glass-panel px-6 py-2 text-center border-b-4 border-b-primary shadow-xl">
            <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest">Score</span>
            <span className="text-2xl font-black text-white">{score}</span>
          </div>
          <div className="glass-panel px-6 py-2 text-center border-b-4 border-b-red-500 shadow-xl">
            <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest">Misses</span>
            <span className="text-2xl font-black text-red-400">{misses} / 5</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black shadow-2xl">
        <WebcamOverlay onResults={handleResults}>
          <canvas
            ref={gameCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          {showInstructions && gameState === 'menu' && (
             <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center backdrop-blur-md p-8 overflow-y-auto pointer-events-auto">
               <h3 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                 <ShieldQuestion className="text-primary"/> How to Play
               </h3>
               
               <div className="flex flex-col items-center text-center max-w-sm mb-8">
                 <img src="/instructions/instruction_paper_1782396795310.png" alt="Open Palm" className="w-full rounded-2xl border border-slate-700 shadow-xl mb-4" />
                 <span className="text-xl font-bold text-white mb-2">Open Palm Movement</span>
                 <p className="text-sm text-slate-400 leading-relaxed">
                   Simply move your open palm in front of the camera. The basket will follow your palm's position to catch the falling objects! No pinching required.
                 </p>
               </div>

               <button onClick={() => setShowInstructions(false)} className="px-10 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-xl text-xl font-black text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                 Understood!
               </button>
             </div>
          )}

          {gameState === 'menu' && !showInstructions && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm">
              <ArrowDownCircle size={80} className="text-[#00f2fe] mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(0,242,254,0.8)]" />
              <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-2xl font-black text-white transition-all transform hover:scale-105 text-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                START GAME
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-md animate-in fade-in duration-500">
               <Trophy size={80} className="mb-6 drop-shadow-2xl text-red-500" />
               <h3 className="text-6xl font-black mb-4 text-white uppercase tracking-wider">
                 Game Over
               </h3>
               <p className="text-2xl text-slate-300 mb-8 font-medium">Final Score: <span className="text-[#00f2fe] font-black">{score}</span></p>
               <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-white transition-all transform hover:scale-105 text-xl shadow-lg">
                 Play Again
               </button>
            </div>
          )}
        </WebcamOverlay>
      </div>
    </div>
  );
}
