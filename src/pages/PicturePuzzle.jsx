import React, { useRef, useState, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { Puzzle, HelpCircle } from 'lucide-react';

const IMAGE_URL = 'https://picsum.photos/500/500';

const LEVELS = {
  'Very Easy': 2,
  Easy: 3,
  Medium: 4,
  Hard: 5
};

export default function PicturePuzzle() {
  const [level, setLevel] = useState('Very Easy');
  const [gameState, setGameState] = useState('idle'); // idle, playing, won
  const [moves, setMoves] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const gameCanvasRef = useRef(null);
  const imageRef = useRef(null);
  const piecesRef = useRef([]);
  const draggedPieceRef = useRef(null);
  const pinchRef = useRef(false);
  const animationRef = useRef(null);
  const gridInfoRef = useRef({ gridSize: 3, pieceWidth: 0, pieceHeight: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = IMAGE_URL;
    img.onload = () => {
      imageRef.current = img;
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setMoves(0);
    setShowInstructions(false);
    
    const gridSize = LEVELS[level];
    const targetAreaSize = 500;
    const pieceW = targetAreaSize / gridSize;
    const pieceH = targetAreaSize / gridSize;

    const targetX = 640 + (640 - targetAreaSize) / 2;
    const targetY = (720 - targetAreaSize) / 2;

    gridInfoRef.current = { gridSize, pieceWidth: pieceW, pieceHeight: pieceH, targetX, targetY };

    const newPieces = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        newPieces.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          x: Math.random() * (600 - pieceW) + 20,
          y: Math.random() * (680 - pieceH) + 20,
          correctX: targetX + c * pieceW,
          correctY: targetY + r * pieceH,
          isSnapped: false
        });
      }
    }
    
    piecesRef.current = newPieces.sort(() => Math.random() - 0.5);
    draggedPieceRef.current = null;
  };

  useEffect(() => {
    const loop = () => {
      if (!gameCanvasRef.current) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = gameCanvasRef.current.getContext('2d');
      const canvas = gameCanvasRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'playing' || gameState === 'won') {
        const { gridSize, pieceWidth, pieceHeight, targetX, targetY } = gridInfoRef.current;
        const targetAreaSize = gridSize * pieceWidth;

        // Draw grid placeholder
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(targetX, targetY, targetAreaSize, targetAreaSize);
        
        for(let r = 1; r < gridSize; r++) {
          ctx.beginPath();
          ctx.moveTo(targetX, targetY + r * pieceHeight);
          ctx.lineTo(targetX + targetAreaSize, targetY + r * pieceHeight);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(targetX + r * pieceWidth, targetY);
          ctx.lineTo(targetX + r * pieceWidth, targetY + targetAreaSize);
          ctx.stroke();
        }

        // Draw pieces
        if (imageRef.current) {
          const imgW = imageRef.current.width;
          const imgH = imageRef.current.height;
          const sxW = imgW / gridSize;
          const sxH = imgH / gridSize;

          const snapped = [];
          const unsnapped = [];
          
          piecesRef.current.forEach(p => {
            if (p === draggedPieceRef.current) return;
            if (p.isSnapped) snapped.push(p);
            else unsnapped.push(p);
          });

          const drawPiece = (p) => {
            ctx.save();
            if (p === draggedPieceRef.current) {
              ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
              ctx.shadowBlur = 20;
            }
            ctx.drawImage(
              imageRef.current,
              p.col * sxW, p.row * sxH, sxW, sxH,
              p.x, p.y, pieceWidth, pieceHeight
            );
            if (!p.isSnapped) {
              ctx.strokeStyle = 'rgba(255,255,255,0.5)';
              ctx.lineWidth = 1;
              ctx.strokeRect(p.x, p.y, pieceWidth, pieceHeight);
            }
            ctx.restore();
          };

          snapped.forEach(drawPiece);
          unsnapped.forEach(drawPiece);
          if (draggedPieceRef.current) {
            drawPiece(draggedPieceRef.current);
          }

          // Reference image
          ctx.globalAlpha = 0.8;
          ctx.drawImage(imageRef.current, canvas.width - 170, 20, 150, 150);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(canvas.width - 170, 20, 150, 150);
          ctx.globalAlpha = 1.0;
        }
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState]);

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

    if (gameState === 'playing' && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      
      const x = (1 - indexTip.x) * webcamCanvas.width;
      const y = indexTip.y * webcamCanvas.height;
      
      const thumbX = (1 - thumbTip.x) * webcamCanvas.width;
      const thumbY = thumbTip.y * webcamCanvas.height;
      
      const distance = Math.hypot(x - thumbX, y - thumbY);
      const isPinching = distance < 60; // Increased threshold
      
      const gameCtx = gameCanvasRef.current?.getContext('2d');
      if (gameCtx) {
        gameCtx.beginPath();
        gameCtx.arc(x, y, 10, 0, 2 * Math.PI);
        gameCtx.fillStyle = isPinching ? '#ef4444' : '#3b82f6';
        gameCtx.fill();
        gameCtx.strokeStyle = '#fff';
        gameCtx.lineWidth = 2;
        gameCtx.stroke();
      }

      if (isPinching && !pinchRef.current) {
        pinchRef.current = true;
        const { pieceWidth, pieceHeight } = gridInfoRef.current;
        
        let grabbed = null;
        for (let i = piecesRef.current.length - 1; i >= 0; i--) {
          const p = piecesRef.current[i];
          // Looser bounding box for easier grabbing
          if (!p.isSnapped && x >= p.x - 20 && x <= p.x + pieceWidth + 20 && y >= p.y - 20 && y <= p.y + pieceHeight + 20) {
            grabbed = p;
            break;
          }
        }
        
        if (grabbed) {
          draggedPieceRef.current = grabbed;
          grabbed.offsetX = x - grabbed.x;
          grabbed.offsetY = y - grabbed.y;
        }
      } else if (isPinching && pinchRef.current && draggedPieceRef.current) {
        const p = draggedPieceRef.current;
        // Smoothing
        p.x = p.x * 0.5 + (x - p.offsetX) * 0.5;
        p.y = p.y * 0.5 + (y - p.offsetY) * 0.5;
      } else if (!isPinching && pinchRef.current) {
        pinchRef.current = false;
        if (draggedPieceRef.current) {
          setMoves(m => m + 1);
          const p = draggedPieceRef.current;
          
          const distToTarget = Math.hypot(p.x - p.correctX, p.y - p.correctY);
          if (distToTarget < 80) { // Increased snap threshold
            p.x = p.correctX;
            p.y = p.correctY;
            p.isSnapped = true;
            
            if (piecesRef.current.every(piece => piece.isSnapped)) {
              setGameState('won');
            }
          }
          draggedPieceRef.current = null;
        }
      }
    } else {
      pinchRef.current = false;
      draggedPieceRef.current = null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Puzzle className="text-primary"/> Picture Puzzle
          </h2>
          <p className="text-slate-400 text-sm">Pinch index and thumb to drag and drop pieces into the grid.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button onClick={() => setShowInstructions(!showInstructions)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <HelpCircle size={24} />
          </button>
          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            disabled={gameState === 'playing'}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-primary font-bold shadow-lg"
          >
            {Object.keys(LEVELS).map(lvl => (
              <option key={lvl} value={lvl}>{lvl} ({LEVELS[lvl]}x{LEVELS[lvl]})</option>
            ))}
          </select>

          <div className="glass-panel px-6 py-2 text-center border-b-4 border-b-primary shadow-xl">
            <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest">Moves</span>
            <span className="text-2xl font-black text-white">{moves}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black shadow-2xl">
        <WebcamOverlay onResults={handleResults}>
          <canvas
            ref={gameCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          {showInstructions && gameState === 'idle' && (
             <div className="absolute top-4 right-4 z-50 glass-panel p-6 max-w-sm border border-primary/30 shadow-2xl bg-slate-900/90 backdrop-blur-xl">
               <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 border-b border-slate-700 pb-2">
                 <HelpCircle className="text-primary"/> How to Play
               </h3>
               <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                 Use the <strong>Pinch Gesture</strong> to grab puzzle pieces and move them to their correct spot on the grid.
               </p>
               <img src="/instructions/instruction_pinch_1782396757000.png" alt="Pinch Gesture" className="w-full rounded-xl border border-slate-700 shadow-md mb-2" />
               <button onClick={() => setShowInstructions(false)} className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">Got it!</button>
             </div>
          )}

          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm">
              <Puzzle size={80} className="text-primary mb-6 animate-float drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
              <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-2xl font-black text-white transition-all transform hover:scale-105 text-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                START PUZZLE
              </button>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-md">
              <div className="glass-panel p-12 flex flex-col items-center border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)] text-center animate-in zoom-in duration-500">
                <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4 drop-shadow-lg uppercase tracking-wider">Solved!</h3>
                <p className="text-2xl text-slate-300 mb-8 font-medium">Completed in <span className="text-white font-black">{moves}</span> moves</p>
                <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-white transition-all transform hover:scale-105 text-xl shadow-lg">
                  Play Again
                </button>
              </div>
            </div>
          )}
        </WebcamOverlay>
      </div>
    </div>
  );
}
