import React, { useRef, useState, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { Puzzle } from 'lucide-react';

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
    
    const gridSize = LEVELS[level];
    const targetAreaSize = 500;
    const pieceW = targetAreaSize / gridSize;
    const pieceH = targetAreaSize / gridSize;

    // Right half center for the grid
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
          x: Math.random() * (600 - pieceW) + 20, // scatter on left half
          y: Math.random() * (680 - pieceH) + 20,
          correctX: targetX + c * pieceW,
          correctY: targetY + r * pieceH,
          isSnapped: false
        });
      }
    }
    
    // Shuffle display order
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

          // Draw snapped pieces first, then unsnapped, then dragged piece on top
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

          // Draw reference image in top right corner
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
      const isPinching = distance < 40; // 40 pixels threshold for pinch
      
      // Draw a cursor
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
        // Just pinched, try to grab a piece
        pinchRef.current = true;
        const { pieceWidth, pieceHeight } = gridInfoRef.current;
        
        // Find piece under cursor (search backwards to grab top piece)
        let grabbed = null;
        for (let i = piecesRef.current.length - 1; i >= 0; i--) {
          const p = piecesRef.current[i];
          if (!p.isSnapped && x >= p.x && x <= p.x + pieceWidth && y >= p.y && y <= p.y + pieceHeight) {
            grabbed = p;
            break;
          }
        }
        
        if (grabbed) {
          draggedPieceRef.current = grabbed;
          // Calculate offset so piece doesn't snap its top-left to cursor
          grabbed.offsetX = x - grabbed.x;
          grabbed.offsetY = y - grabbed.y;
        }
      } else if (isPinching && pinchRef.current && draggedPieceRef.current) {
        // Dragging
        const p = draggedPieceRef.current;
        p.x = x - p.offsetX;
        p.y = y - p.offsetY;
      } else if (!isPinching && pinchRef.current) {
        // Released
        pinchRef.current = false;
        if (draggedPieceRef.current) {
          setMoves(m => m + 1);
          const p = draggedPieceRef.current;
          
          // Check if close to correct spot
          const distToTarget = Math.hypot(p.x - p.correctX, p.y - p.correctY);
          if (distToTarget < 50) {
            p.x = p.correctX;
            p.y = p.correctY;
            p.isSnapped = true;
            
            // Check win
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
          <h2 className="text-2xl font-bold mb-1 text-white">Picture Puzzle</h2>
          <p className="text-slate-400 text-sm">Pinch index and thumb to drag and drop pieces into the grid.</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            disabled={gameState === 'playing'}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
          >
            {Object.keys(LEVELS).map(lvl => (
              <option key={lvl} value={lvl}>{lvl} ({LEVELS[lvl]}x{LEVELS[lvl]})</option>
            ))}
          </select>

          <div className="glass-panel px-4 py-2 text-center">
            <span className="block text-xs text-slate-400">MOVES</span>
            <span className="text-xl font-bold text-primary">{moves}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black">
        <WebcamOverlay onResults={handleResults}>
          <canvas
            ref={gameCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-auto">
              <Puzzle size={64} className="text-primary mb-6 animate-bounce" />
              <button onClick={startGame} className="px-8 py-4 bg-primary hover:bg-blue-600 rounded-xl font-bold text-white transition-colors text-xl">
                Start Puzzle
              </button>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto">
              <h3 className="text-5xl font-extrabold text-green-400 mb-4 drop-shadow-lg">PUZZLE SOLVED!</h3>
              <p className="text-2xl text-white mb-8">Moves: {moves}</p>
              <button onClick={startGame} className="px-8 py-4 bg-primary rounded-xl font-bold text-white hover:bg-blue-600 transition-colors text-xl">
                Play Again
              </button>
            </div>
          )}
        </WebcamOverlay>
      </div>
    </div>
  );
}
