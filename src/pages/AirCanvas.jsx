import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { Trash2, Download } from 'lucide-react';

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Eraser', value: '#000000' } // Eraser is handled specially or uses a globalCompositeOperation
];

export default function AirCanvas() {
  const [color, setColor] = useState(COLORS[1].value);
  const drawingCanvasRef = useRef(null);
  const prevPosRef = useRef(null);

  useEffect(() => {
    // Initialize drawing canvas
    if (drawingCanvasRef.current) {
      const canvas = drawingCanvasRef.current;
      canvas.width = 1280;
      canvas.height = 720;
    }
  }, []);

  const handleResults = (results, ctx, webcamCanvas) => {
    drawHandResults(results, ctx, webcamCanvas);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      
      // Determine if index is up and middle is down (Drawing mode)
      const isIndexUp = indexTip.y < landmarks[6].y;
      const isMiddleUp = middleTip.y < landmarks[10].y;

      const drawCtx = drawingCanvasRef.current.getContext('2d');
      // MediaPipe coordinates are normalized [0, 1]. Map to canvas size.
      // Since video is mirrored, x is 1 - indexTip.x
      const x = (1 - indexTip.x) * drawingCanvasRef.current.width;
      const y = indexTip.y * drawingCanvasRef.current.height;

      if (isIndexUp && !isMiddleUp) {
        if (prevPosRef.current) {
          drawCtx.beginPath();
          drawCtx.moveTo(prevPosRef.current.x, prevPosRef.current.y);
          drawCtx.lineTo(x, y);
          if (color === '#000000') {
            drawCtx.globalCompositeOperation = 'destination-out';
            drawCtx.lineWidth = 40;
          } else {
            drawCtx.globalCompositeOperation = 'source-over';
            drawCtx.strokeStyle = color;
            drawCtx.lineWidth = 8;
            drawCtx.lineCap = 'round';
          }
          drawCtx.stroke();
        }
        prevPosRef.current = { x, y };
      } else {
        // Stop drawing if condition not met
        prevPosRef.current = null;
      }
    } else {
      prevPosRef.current = null;
    }
  };

  const clearCanvas = () => {
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    }
  };

  const saveCanvas = () => {
    if (drawingCanvasRef.current) {
      const link = document.createElement('a');
      link.download = 'air-canvas.png';
      link.href = drawingCanvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Air Canvas</h2>
          <p className="text-slate-400 text-sm">Raise Index finger to draw. Raise Index + Middle to pause.</p>
        </div>
        
        <div className="flex items-center gap-4 glass-panel px-4 py-2">
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c.value ? 'scale-125 border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c.value === '#000000' ? '#e2e8f0' : c.value }}
                title={c.name}
              >
                {c.value === '#000000' && <span className="text-xs font-bold text-slate-800">E</span>}
              </button>
            ))}
          </div>
          <div className="w-px h-8 bg-slate-700 mx-2"></div>
          <button onClick={clearCanvas} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
            <Trash2 size={20} />
          </button>
          <button onClick={saveCanvas} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black">
        <WebcamOverlay onResults={handleResults}>
          <canvas
            ref={drawingCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </WebcamOverlay>
      </div>
    </div>
  );
}
