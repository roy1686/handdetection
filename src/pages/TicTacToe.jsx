import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { CircleDashed } from 'lucide-react';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // true = X, false = O
  const [gameMode, setGameMode] = useState('ai'); // 'ai' or '2p'
  const [winner, setWinner] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoverProgress, setHoverProgress] = useState(0);
  
  const hoverStartTimeRef = useRef(null);
  const currentHoveredCellRef = useRef(null);
  const canvasRef = useRef(null);

  // Check for winner
  useEffect(() => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        return;
      }
    }
    if (!board.includes(null)) {
      setWinner('Draw');
    } else if (!isPlayerTurn && !winner && gameMode === 'ai') {
      // AI Turn
      setTimeout(() => {
        const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (available.length > 0) {
          const randomIdx = available[Math.floor(Math.random() * available.length)];
          const newBoard = [...board];
          newBoard[randomIdx] = 'O';
          setBoard(newBoard);
          setIsPlayerTurn(true);
        }
      }, 1000);
    }
  }, [board, isPlayerTurn, winner, gameMode]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
    setHoverProgress(0);
    setHoveredCell(null);
    hoverStartTimeRef.current = null;
    currentHoveredCellRef.current = null;
  };

  const handleResults = (results, ctx, webcamCanvas) => {
    drawHandResults(results, ctx, webcamCanvas);
    
    // Store canvas reference to get dimensions later
    if (!canvasRef.current) canvasRef.current = webcamCanvas;

    if (winner || (gameMode === 'ai' && !isPlayerTurn)) {
      setHoverProgress(0);
      setHoveredCell(null);
      currentHoveredCellRef.current = null;
      hoverStartTimeRef.current = null;
      return;
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const indexTip = results.multiHandLandmarks[0][8];
      
      // Calculate which cell the index finger is over
      // Canvas is mirrored, so x is 1 - indexTip.x
      const x = 1 - indexTip.x;
      const y = indexTip.y;
      
      // Draw a cursor so user knows exactly where we think their finger is
      if (webcamCanvas) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x * webcamCanvas.width, y * webcamCanvas.height, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      
      let col = Math.floor(x * 3);
      let row = Math.floor(y * 3);
      
      // Clamp to grid
      col = Math.max(0, Math.min(2, col));
      row = Math.max(0, Math.min(2, row));
      
      const cellIndex = row * 3 + col;

      if (board[cellIndex] === null) {
        if (currentHoveredCellRef.current !== cellIndex) {
          currentHoveredCellRef.current = cellIndex;
          hoverStartTimeRef.current = performance.now();
          setHoveredCell(cellIndex);
        } else {
          const elapsed = performance.now() - hoverStartTimeRef.current;
          const progress = Math.min((elapsed / 800) * 100, 100);
          setHoverProgress(progress);

          if (progress === 100) {
            // Click!
            const newBoard = [...board];
            newBoard[cellIndex] = isPlayerTurn ? 'X' : 'O';
            setBoard(newBoard);
            setIsPlayerTurn(!isPlayerTurn);
            setHoverProgress(0);
            setHoveredCell(null);
            currentHoveredCellRef.current = null;
            hoverStartTimeRef.current = null;
          }
        }
      } else {
        setHoverProgress(0);
        setHoveredCell(null);
        currentHoveredCellRef.current = null;
        hoverStartTimeRef.current = null;
      }
    } else {
      setHoverProgress(0);
      setHoveredCell(null);
      currentHoveredCellRef.current = null;
      hoverStartTimeRef.current = null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Gesture Tic-Tac-Toe</h2>
          <p className="text-slate-400 text-sm">Hover your index finger over a cell to select it.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={gameMode} 
            onChange={(e) => { setGameMode(e.target.value); resetGame(); }}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 outline-none focus:border-primary"
          >
            <option value="ai">Vs AI</option>
            <option value="2p">2 Players</option>
          </select>
          <button onClick={resetGame} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium border border-slate-700 transition-colors">
            Restart Game
          </button>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults}>
            {/* 3x3 Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {board.map((cell, idx) => (
                <div key={idx} className="border border-slate-500/30 flex items-center justify-center relative">
                  {/* Hover Progress Ring */}
                  {hoveredCell === idx && hoverProgress > 0 && !winner && (isPlayerTurn || gameMode === '2p') && (
                    <div 
                      className="absolute inset-0 bg-primary/20 transition-all duration-75"
                      style={{ transform: `scale(${hoverProgress / 100})`, opacity: hoverProgress / 100 }}
                    />
                  )}
                  {/* X or O */}
                  {cell && (
                    <span className={`text-7xl font-extrabold ${cell === 'X' ? 'text-primary' : 'text-secondary'} drop-shadow-lg`}>
                      {cell}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </WebcamOverlay>
        </div>

        <div className="w-full md:w-1/3 glass-panel rounded-none border-l border-slate-700/50 p-6 flex flex-col justify-center items-center text-center">
          <CircleDashed size={48} className="text-white mb-6" />
          
          <h3 className="text-2xl font-bold mb-8">
            {winner ? (
              <span className={winner === 'X' ? 'text-green-400' : winner === 'O' ? 'text-red-400' : 'text-yellow-400'}>
                {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
              </span>
            ) : (
              <span className="text-white">
                {gameMode === 'ai' 
                  ? (isPlayerTurn ? 'Your Turn (X)' : 'AI Turn (O)')
                  : (isPlayerTurn ? 'Player 1 Turn (X)' : 'Player 2 Turn (O)')}
              </span>
            )}
          </h3>

          {(!winner && (isPlayerTurn || gameMode === '2p') && hoveredCell !== null) && (
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-primary transition-all duration-75"
                style={{ width: `${hoverProgress}%` }}
              />
            </div>
          )}
          {(!winner && (isPlayerTurn || gameMode === '2p') && hoveredCell !== null) && (
            <span className="text-slate-400 text-sm mt-2">Hold to select...</span>
          )}
        </div>
      </div>
    </div>
  );
}
