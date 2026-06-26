import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Calculator, Delete, HelpCircle } from 'lucide-react';

export default function GestureCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [detectedNumber, setDetectedNumber] = useState(null);
  
  const lastPinchRef = useRef(0);
  const hoverTargetRef = useRef(null);
  
  const numberBufferRef = useRef([]);
  const lastNumberAddedTimeRef = useRef(0);

  const operatorRegions = [
    { label: '+', x: 80, y: 100 }, { label: '-', x: 200, y: 100 }, { label: '*', x: 320, y: 100 }, { label: '/', x: 440, y: 100 },
    { label: 'C', x: 140, y: 220 }, { label: '=', x: 380, y: 220 }
  ];

  const handleInput = (val) => {
    if (val === 'C') {
      setExpression('');
      setResult(null);
    } else if (val === '=') {
      try {
        const evalResult = eval(expression);
        setResult(evalResult);
      } catch (e) {
        setResult('Error');
      }
    } else {
      setExpression(prev => prev + val);
    }
  };

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    ctx.save();
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    operatorRegions.forEach(btn => {
      ctx.fillStyle = hoverTargetRef.current === btn.label ? 'rgba(59, 130, 246, 0.8)' : 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(btn.x - 50, btn.y - 50, 100, 100, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(btn.label, btn.x, btn.y);
    });
    ctx.restore();

    if (!results.multiHandLandmarks) {
      setDetectedNumber(null);
      numberBufferRef.current = [];
      return;
    }

    let isPinching = false;
    let pointerPos = null;
    let fingersCount = 0;

    results.multiHandLandmarks.forEach((landmarks, index) => {
      const handedness = results.multiHandedness[index].label;
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      
      const x = (1 - indexTip.x) * canvas.width;
      const y = indexTip.y * canvas.height;
      const tX = (1 - thumbTip.x) * canvas.width;
      const tY = thumbTip.y * canvas.height;
      
      const dist = Math.hypot(x - tX, y - tY);
      
      fingersCount += countFingers(landmarks, handedness);

      // Prefer right hand for pointer, or whatever hand is available
      if (!pointerPos || handedness === 'Right') {
        pointerPos = { x, y };
        isPinching = dist < 40;
      }
    });

    // Handle number detection
    numberBufferRef.current.push(fingersCount);
    if (numberBufferRef.current.length > 15) numberBufferRef.current.shift();
    
    const counts = {};
    numberBufferRef.current.forEach(n => counts[n] = (counts[n] || 0) + 1);
    
    let stableNumber = null;
    for (const [nStr, count] of Object.entries(counts)) {
      if (count > 10) { // Stable for roughly 10/15 frames
        stableNumber = parseInt(nStr);
      }
    }

    setDetectedNumber(stableNumber);

    const now = Date.now();
    if (stableNumber !== null && now - lastNumberAddedTimeRef.current > 1500) {
      handleInput(stableNumber.toString());
      lastNumberAddedTimeRef.current = now;
      
      // Flash screen green slightly
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Handle operator pinch
    let hoveredBtn = null;
    if (pointerPos) {
      ctx.beginPath();
      ctx.arc(pointerPos.x, pointerPos.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = isPinching ? '#ef4444' : '#3b82f6';
      ctx.fill();

      operatorRegions.forEach(btn => {
        if (pointerPos.x > btn.x - 50 && pointerPos.x < btn.x + 50 && pointerPos.y > btn.y - 50 && pointerPos.y < btn.y + 50) {
          hoveredBtn = btn.label;
        }
      });
    }

    hoverTargetRef.current = hoveredBtn;

    if (isPinching && hoveredBtn && now - lastPinchRef.current > 500) {
      handleInput(hoveredBtn);
      lastPinchRef.current = now;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      const btn = operatorRegions.find(b => b.label === hoveredBtn);
      if (btn) {
        ctx.beginPath();
        ctx.roundRect(btn.x - 50, btn.y - 50, 100, 100, 20);
        ctx.fill();
      }
    }
  };

  const deleteLast = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Calculator className="text-primary"/> Gesture Calculator
          </h2>
          <p className="text-slate-400 text-sm">Hold up fingers (0-10) for 1.5s to type numbers. Pinch operators.</p>
        </div>
        <button onClick={() => setShowInstructions(!showInstructions)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
          <HelpCircle size={24} />
        </button>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col lg:flex-row shadow-2xl">
        <div className="w-full lg:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults}>
            
            <div className="absolute top-4 left-4 z-20 flex gap-4">
               <div className="w-24 h-24 rounded-2xl border-2 border-primary bg-black/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Fingers</span>
                 <span className="text-5xl font-black text-white">{detectedNumber !== null ? detectedNumber : '-'}</span>
               </div>
            </div>

            {showInstructions && (
              <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center backdrop-blur-md p-8 overflow-y-auto pointer-events-auto">
                <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                  <HelpCircle className="text-primary"/> How to Calculate
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mb-8">
                  <div className="glass-panel p-6 border-t-4 border-t-green-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">1. Input Numbers</span>
                    <p className="text-slate-400 text-sm mb-4">Hold up fingers (0 to 10) steadily for 1.5 seconds. The screen will flash green when the number is entered!</p>
                  </div>
                  <div className="glass-panel p-6 border-t-4 border-t-blue-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">2. Select Operators</span>
                    <p className="text-slate-400 text-sm mb-4">Hover over operators (+, -, *, /) and <strong>Pinch</strong> to add them to your expression.</p>
                  </div>
                </div>

                <button onClick={() => setShowInstructions(false)} className="px-10 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-xl text-xl font-black text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  Got It!
                </button>
              </div>
            )}
          </WebcamOverlay>
        </div>

        <div className="w-full lg:w-1/3 glass-panel rounded-none border-l border-slate-700/50 flex flex-col bg-slate-900 p-8">
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner mb-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calculator size={100} />
              </div>
              <div className="text-slate-400 text-right min-h-[2rem] text-xl font-mono mb-2 break-all">
                {expression || '0'}
              </div>
              <div className="text-right text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe] break-all">
                {result !== null ? result : '='}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={deleteLast}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold rounded-2xl transition-all border border-slate-700 shadow-lg"
              >
                <Delete size={20} /> Backspace
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
