import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Trash2, Download, Play, Square, Circle, Triangle, PenTool } from 'lucide-react';
import ClickSpark from '../components/reactbits/ClickSpark';

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'White', value: '#ffffff' }
];

export default function AirCanvas() {
  const [color, setColor] = useState(COLORS[1].value);
  const [thickness, setThickness] = useState(8);
  const [isReplaying, setIsReplaying] = useState(false);
  const [shapeMode, setShapeMode] = useState('free'); // free, circle, rectangle, triangle
  
  const drawingCanvasRef = useRef(null);
  const prevPosRef = useRef(null);
  const strokesRef = useRef([]); // Store history for replay
  const currentStrokeRef = useRef([]);
  
  useEffect(() => {
    if (drawingCanvasRef.current) {
      const canvas = drawingCanvasRef.current;
      canvas.width = 1280;
      canvas.height = 720;
    }
  }, []);

  const clearCanvasContext = (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawStrokeSegment = (ctx, start, end, col, thick, erase) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    if (erase) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 40;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = col;
      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
    }
    ctx.stroke();
  };

  const handleResults = (results, ctx, webcamCanvas) => {
    drawHandResults(results, ctx, webcamCanvas);
    if (isReplaying) return; // Disable drawing during replay

    if (results.multiHandLandmarks && results.multiHandedness && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const handedness = results.multiHandedness[0].label;
      const fingersUp = countFingers(landmarks, handedness);
      
      const indexTip = landmarks[8];
      
      const x = (1 - indexTip.x) * drawingCanvasRef.current.width;
      const y = indexTip.y * drawingCanvasRef.current.height;

      const drawCtx = drawingCanvasRef.current.getContext('2d');

      const isEraser = fingersUp === 0;
      const isDrawing = fingersUp === 1;

      if (isDrawing || isEraser) {
        let x, y;
        if (isEraser) {
          x = (1 - landmarks[9].x) * drawingCanvasRef.current.width;
          y = landmarks[9].y * drawingCanvasRef.current.height;
        } else {
          x = (1 - indexTip.x) * drawingCanvasRef.current.width;
          y = indexTip.y * drawingCanvasRef.current.height;
        }

        if (prevPosRef.current) {
          drawStrokeSegment(drawCtx, prevPosRef.current, {x, y}, color, thickness, isEraser);
          
          currentStrokeRef.current.push({
            start: prevPosRef.current,
            end: {x, y},
            color,
            thickness,
            isEraser
          });
        }
        prevPosRef.current = { x, y };
      } else {
        if (currentStrokeRef.current.length > 0) {
          // If in shape mode and just finished a stroke, replace stroke with shape
          if (shapeMode !== 'free' && !isEraser) {
            snapToShape(drawCtx);
          } else {
            strokesRef.current.push([...currentStrokeRef.current]);
          }
          currentStrokeRef.current = [];
        }
        prevPosRef.current = null;
      }
    } else {
      if (currentStrokeRef.current.length > 0) {
        if (shapeMode !== 'free') snapToShape(drawingCanvasRef.current.getContext('2d'));
        else strokesRef.current.push([...currentStrokeRef.current]);
        currentStrokeRef.current = [];
      }
      prevPosRef.current = null;
    }
  };

  const snapToShape = (ctx) => {
    const stroke = currentStrokeRef.current;
    if (stroke.length < 5) return; // Too short

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    stroke.forEach(s => {
      if(s.start.x < minX) minX = s.start.x;
      if(s.start.x > maxX) maxX = s.start.x;
      if(s.start.y < minY) minY = s.start.y;
      if(s.start.y > maxY) maxY = s.start.y;
    });

    const w = maxX - minX;
    const h = maxY - minY;
    const cx = minX + w/2;
    const cy = minY + h/2;

    // Erase the messy stroke
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = thickness + 2;
    stroke.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.start.x, s.start.y);
      ctx.lineTo(s.end.x, s.end.y);
      ctx.stroke();
    });

    // Draw Shape
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();

    const newShapeStroke = []; // Save as an artificial stroke for replay

    if (shapeMode === 'rectangle') {
      ctx.rect(minX, minY, w, h);
    } else if (shapeMode === 'circle') {
      const r = Math.max(w, h)/2;
      ctx.arc(cx, cy, r, 0, 2*Math.PI);
    } else if (shapeMode === 'triangle') {
      ctx.moveTo(cx, minY);
      ctx.lineTo(maxX, maxY);
      ctx.lineTo(minX, maxY);
      ctx.closePath();
    }
    ctx.stroke();
    
    // For replay simplicity, we just push the messy stroke right now,
    // advanced would generate path points. We'll store the messy stroke 
    // but note it was a shape to replay it properly later if needed.
    strokesRef.current.push([...currentStrokeRef.current]);
  };

  const clearCanvas = () => {
    if (drawingCanvasRef.current) {
      clearCanvasContext(drawingCanvasRef.current.getContext('2d'), drawingCanvasRef.current);
      strokesRef.current = [];
    }
  };

  const saveCanvas = () => {
    if (drawingCanvasRef.current) {
      const link = document.createElement('a');
      link.download = 'air-canvas-masterpiece.png';
      link.href = drawingCanvasRef.current.toDataURL();
      link.click();
    }
  };

  const replayDrawing = () => {
    if (!drawingCanvasRef.current || strokesRef.current.length === 0 || isReplaying) return;
    setIsReplaying(true);
    
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    clearCanvasContext(ctx, canvas);

    let strokeIndex = 0;
    let segmentIndex = 0;

    const drawNext = () => {
      if (strokeIndex >= strokesRef.current.length) {
        setIsReplaying(false);
        return;
      }
      
      const currentStroke = strokesRef.current[strokeIndex];
      if (segmentIndex < currentStroke.length) {
        const seg = currentStroke[segmentIndex];
        drawStrokeSegment(ctx, seg.start, seg.end, seg.color, seg.thickness, seg.isEraser);
        segmentIndex++;
        requestAnimationFrame(drawNext);
      } else {
        strokeIndex++;
        segmentIndex = 0;
        setTimeout(() => requestAnimationFrame(drawNext), 200); // pause between strokes
      }
    };
    
    drawNext();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Air Canvas AI</h2>
          <p className="text-slate-400 text-sm">1 Finger = Draw | Fist = Erase</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 glass-panel px-4 py-2">
          {/* Colors */}
          <div className="flex gap-2 border-r border-slate-700 pr-4">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c.value ? 'scale-125 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
          
          {/* Thickness */}
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <span className="text-xs text-slate-400 font-bold">SIZE</span>
            <input 
              type="range" min="2" max="30" value={thickness} 
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-24 accent-primary"
            />
          </div>

          {/* Shapes */}
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <button onClick={() => setShapeMode('free')} className={`p-2 rounded-lg ${shapeMode==='free'?'bg-primary/20 text-primary':'text-slate-400'}`}><PenTool size={18}/></button>
            <button onClick={() => setShapeMode('circle')} className={`p-2 rounded-lg ${shapeMode==='circle'?'bg-primary/20 text-primary':'text-slate-400'}`}><Circle size={18}/></button>
            <button onClick={() => setShapeMode('rectangle')} className={`p-2 rounded-lg ${shapeMode==='rectangle'?'bg-primary/20 text-primary':'text-slate-400'}`}><Square size={18}/></button>
            <button onClick={() => setShapeMode('triangle')} className={`p-2 rounded-lg ${shapeMode==='triangle'?'bg-primary/20 text-primary':'text-slate-400'}`}><Triangle size={18}/></button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={clearCanvas} className="p-2 hover:bg-slate-700 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Clear">
              <Trash2 size={20} />
            </button>
            <button onClick={replayDrawing} disabled={isReplaying} className={`p-2 rounded-lg transition-colors ${isReplaying ? 'text-primary animate-pulse' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`} title="Replay">
              <Play size={20} />
            </button>
            <button onClick={saveCanvas} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors" title="Save">
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900 shadow-2xl group">
        <ClickSpark sparkColor={color} sparkSize={12} sparkRadius={20} sparkCount={10} duration={600} />
        
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        <WebcamOverlay onResults={handleResults}>
          <canvas
            ref={drawingCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          {isReplaying && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-primary/50 text-primary font-bold flex items-center gap-2 animate-pulse">
              <Play size={16} fill="currentColor" /> Replaying...
            </div>
          )}
        </WebcamOverlay>
      </div>
    </div>
  );
}
