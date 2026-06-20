import React, { useRef, useState, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { ArrowDownCircle } from 'lucide-react';

export default function CatchGame() {
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameover
  
  const gameCanvasRef = useRef(null);
  const objectsRef = useRef([]);
  const basketRef = useRef({ x: 0, y: 680, width: 150, height: 20 });
  const animationRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  const startGame = () => {
    setScore(0);
    setMisses(0);
    setGameState('playing');
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
        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn object randomly
        if (Math.random() < 0.02) { // rough spawn rate
          objectsRef.current.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: -20,
            radius: 15 + Math.random() * 10,
            speed: 150 + Math.random() * 200, // pixels per second
            color: `hsl(${Math.random() * 360}, 80%, 60%)`
          });
        }

        // Update and draw objects
        const basket = basketRef.current;
        const basketY = basket.y;

        for (let i = objectsRef.current.length - 1; i >= 0; i--) {
          const obj = objectsRef.current[i];
          obj.y += obj.speed * dt;

          // Draw obj
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Check collision with basket
          if (
            obj.y + obj.radius > basketY &&
            obj.y - obj.radius < basketY + basket.height &&
            obj.x + obj.radius > basket.x &&
            obj.x - obj.radius < basket.x + basket.width
          ) {
            // Caught!
            objectsRef.current.splice(i, 1);
            setScore(s => s + 10);
          } else if (obj.y > canvas.height + obj.radius) {
            // Missed!
            objectsRef.current.splice(i, 1);
            setMisses(m => {
              const newMisses = m + 1;
              if (newMisses >= 5) setGameState('gameover');
              return newMisses;
            });
          }
        }

        // Draw Basket
        ctx.fillStyle = '#3b82f6'; // primary
        ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillRect(basket.x, basketY, basket.width, basket.height);
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState]);

  const handleResults = (results, ctx, webcamCanvas) => {
    // Only draw landmarks if we want to, otherwise just let the game canvas draw
    // Actually drawing hands helps user see tracking
    ctx.save();
    ctx.globalAlpha = 0.5;
    drawHandResults(results, ctx, webcamCanvas);
    ctx.restore();

    if (gameCanvasRef.current) {
      if (gameCanvasRef.current.width !== webcamCanvas.width || gameCanvasRef.current.height !== webcamCanvas.height) {
        gameCanvasRef.current.width = webcamCanvas.width;
        gameCanvasRef.current.height = webcamCanvas.height;
      }
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Use palm center (9) for basket x
      const center = results.multiHandLandmarks[0][9];
      // mirrored x
      const x = (1 - center.x) * webcamCanvas.width;
      const y = center.y * webcamCanvas.height;
      
      // Update basket x and y, keep it clamped
      const bW = basketRef.current.width;
      const bH = basketRef.current.height;
      basketRef.current.x = Math.max(0, Math.min(webcamCanvas.width - bW, x - bW / 2));
      basketRef.current.y = Math.max(0, Math.min(webcamCanvas.height - bH, y - bH / 2));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Catch the Objects</h2>
          <p className="text-slate-400 text-sm">Move the basket with your palm. Don't drop 5 objects!</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 text-center">
            <span className="block text-xs text-slate-400">SCORE</span>
            <span className="text-xl font-bold text-primary">{score}</span>
          </div>
          <div className="glass-panel px-4 py-2 text-center">
            <span className="block text-xs text-slate-400">MISSES</span>
            <span className="text-xl font-bold text-red-400">{misses} / 5</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black">
        <WebcamOverlay onResults={handleResults}>
          <canvas
            ref={gameCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          {gameState !== 'playing' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto">
              <h3 className="text-5xl font-extrabold text-white mb-4">
                {gameState === 'gameover' ? <span className="text-red-500">GAME OVER</span> : 'Catch Game'}
              </h3>
              {gameState === 'gameover' && <p className="text-xl text-white mb-8">Final Score: {score}</p>}
              <button onClick={startGame} className="px-8 py-4 bg-primary rounded-xl font-bold text-white hover:bg-blue-600 transition-colors">
                {gameState === 'gameover' ? 'Play Again' : 'Start Game'}
              </button>
            </div>
          )}
        </WebcamOverlay>
      </div>
    </div>
  );
}
