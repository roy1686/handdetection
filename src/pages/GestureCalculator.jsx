import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Calculator, Delete, Plus, Minus, X as Multiply, Divide, Equal, RefreshCcw, HelpCircle } from 'lucide-react';

export default function GestureCalculator() {
  const [operand1, setOperand1] = useState(null);
  const [operator, setOperator] = useState(null);
  const [operand2, setOperand2] = useState(null);
  const [result, setResult] = useState(null);
  const [stage, setStage] = useState('operand1');
  const [detectedNumber, setDetectedNumber] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [displayMessage, setDisplayMessage] = useState('Show fingers to input the first operand.');

  const lastPinchRef = useRef(0);
  const hoverTargetRef = useRef(null);
  const numberBufferRef = useRef([]);
  const lastNumberLockedTimeRef = useRef(0);

  const operatorRegions = [
    { label: '+', x: 80, y: 100 },
    { label: '-', x: 200, y: 100 },
    { label: '*', x: 320, y: 100 },
    { label: '/', x: 440, y: 100 },
    { label: 'sin', x: 80, y: 220 },
    { label: 'cos', x: 200, y: 220 },
    { label: 'tan', x: 320, y: 220 },
    { label: '=', x: 440, y: 220 },
    { label: 'C', x: 260, y: 320 },
  ];

  const resetCalculator = () => {
    setOperand1(null);
    setOperator(null);
    setOperand2(null);
    setResult(null);
    setStage('operand1');
    setDetectedNumber(null);
    setDisplayMessage('Show fingers to input the first operand.');
    numberBufferRef.current = [];
    lastNumberLockedTimeRef.current = 0;
  };

  const getExpressionText = () => {
    const parts = [];
    if (operand1 !== null) parts.push(operand1);
    if (operator) parts.push(operator);
    if (operand2 !== null) parts.push(operand2);
    return parts.join(' ');
  };

  const formatResult = (value) => {
    if (typeof value === 'number' && !Number.isFinite(value)) return 'Error';
    if (typeof value === 'number') return Number.isInteger(value) ? value : Number(value.toFixed(6));
    return value;
  };

  const calculateResult = () => {
    const a = Number(operand1);
    const b = Number(operand2);

    if (Number.isNaN(a) || (operator && !['sin', 'cos', 'tan'].includes(operator) && Number.isNaN(b))) {
      return 'Error';
    }

    switch (operator) {
      case '+': return formatResult(a + b);
      case '-': return formatResult(a - b);
      case '*': return formatResult(a * b);
      case '/': return b === 0 ? 'Error' : formatResult(a / b);
      case 'sin': return formatResult(Math.sin(a));
      case 'cos': return formatResult(Math.cos(a));
      case 'tan': return formatResult(Math.tan(a));
      default: return 'Error';
    }
  };

  const lockNumber = (value) => {
    if (stage === 'operand1') {
      setOperand1(value);
      setDisplayMessage('Operand 1 locked. Point and pinch an operator.');
      setStage('operator');
      return;
    }

    if (stage === 'operand2') {
      setOperand2(value);
      setDisplayMessage('Operand 2 locked. Pinch "=" to compute the result.');
      return;
    }
  };

  const chooseOperator = (label) => {
    if (label === 'C') {
      resetCalculator();
      return;
    }

    if (label === '=') {
      if (!operator) {
        setDisplayMessage('Choose an operator before pressing equals.');
        return;
      }

      if (['sin', 'cos', 'tan'].includes(operator)) {
        const calc = calculateResult();
        setResult(calc);
        setDisplayMessage('Unary result ready. Press C to start again.');
        setStage('result');
        return;
      }

      if (operand2 === null) {
        setDisplayMessage('Show the second operand using fingers before pressing equals.');
        return;
      }

      const calc = calculateResult();
      setResult(calc);
      setDisplayMessage('Result ready. Press C to start again.');
      setStage('result');
      return;
    }

    if (stage === 'operand1' && operand1 === null) {
      setDisplayMessage('First show the initial number before selecting an operator.');
      return;
    }

    setOperator(label);
    if (['sin', 'cos', 'tan'].includes(label)) {
      setDisplayMessage('Unary operator selected. Pinch "=" to compute the result.');
      setStage('operator');
    } else {
      setDisplayMessage('Operator selected. Show fingers to input the second operand.');
      setStage('operand2');
      setDetectedNumber(null);
      numberBufferRef.current = [];
      lastNumberLockedTimeRef.current = 0;
    }
  };

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    ctx.save();
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    operatorRegions.forEach(btn => {
      ctx.fillStyle = hoverTargetRef.current === btn.label ? 'rgba(59, 130, 246, 0.95)' : 'rgba(30, 41, 59, 0.92)';
      ctx.beginPath();
      ctx.roundRect(btn.x - 55, btn.y - 55, 110, 110, 26);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(btn.label, btn.x, btn.y);
    });
    ctx.restore();

    if (!results.multiHandLandmarks) {
      if (stage === 'operand1' || stage === 'operand2') setDetectedNumber(null);
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
      if (!pointerPos || handedness === 'Right') {
        pointerPos = { x, y };
        isPinching = dist < 40;
      }
    });

    const now = Date.now();
    const shouldTrackNumber = stage === 'operand1' || stage === 'operand2';

    if (shouldTrackNumber) {
      numberBufferRef.current.push(fingersCount);
      if (numberBufferRef.current.length > 15) numberBufferRef.current.shift();
      const counts = {};
      numberBufferRef.current.forEach(n => counts[n] = (counts[n] || 0) + 1);
      let stableNumber = null;
      for (const [nStr, count] of Object.entries(counts)) {
        if (count > 10) {
          stableNumber = parseInt(nStr, 10);
          break;
        }
      }
      setDetectedNumber(stableNumber);

      if (stableNumber !== null && now - lastNumberLockedTimeRef.current > 1800) {
        if (stage === 'operand1' && operand1 !== stableNumber) {
          lockNumber(stableNumber);
          lastNumberLockedTimeRef.current = now;
          ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (stage === 'operand2' && operand2 !== stableNumber) {
          setOperand2(stableNumber);
          setDisplayMessage('Operand 2 locked. Pinch "=" to compute the result.');
          lastNumberLockedTimeRef.current = now;
          ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    } else {
      setDetectedNumber(null);
      numberBufferRef.current = [];
    }

    let hoveredBtn = null;
    if (pointerPos) {
      ctx.beginPath();
      ctx.arc(pointerPos.x, pointerPos.y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = isPinching ? '#ef4444' : '#3b82f6';
      ctx.fill();
      operatorRegions.forEach(btn => {
        if (pointerPos.x > btn.x - 55 && pointerPos.x < btn.x + 55 && pointerPos.y > btn.y - 55 && pointerPos.y < btn.y + 55) {
          hoveredBtn = btn.label;
        }
      });
    }

    hoverTargetRef.current = hoveredBtn;
    if (isPinching && hoveredBtn && now - lastPinchRef.current > 500) {
      chooseOperator(hoveredBtn);
      lastPinchRef.current = now;
      const btn = operatorRegions.find(b => b.label === hoveredBtn);
      if (btn) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.roundRect(btn.x - 55, btn.y - 55, 110, 110, 26);
        ctx.fill();
      }
    }
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

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col lg:flex-row shadow-xl">
        <div className="w-full lg:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults}>
            
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-4">
               <div className="w-24 h-24 rounded-3xl border-2 border-primary bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.45)]">
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Detected</span>
                 <span className="text-5xl font-black text-white">{detectedNumber !== null ? detectedNumber : '-'}</span>
               </div>
               <div className="w-48 rounded-3xl border border-slate-700/50 bg-slate-950/85 p-4 text-left text-sm text-slate-300 shadow-lg">
                 <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-2">Status</p>
                 <p>{displayMessage}</p>
               </div>
            </div>

            {showInstructions && (
              <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center backdrop-blur-2xl p-8 overflow-y-auto pointer-events-auto">
                <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                  <HelpCircle className="text-primary"/> Gesture Calculator Guide
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mb-8">
                  <div className="glass-panel p-6 border-t-4 border-t-green-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">Step 1: Enter Operand 1</span>
                    <p className="text-slate-400 text-sm mb-4">Show the number using your fingers. Hold the value steadily for about 1.5 seconds until it locks in.</p>
                  </div>
                  <div className="glass-panel p-6 border-t-4 border-t-blue-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">Step 2: Select Operator</span>
                    <p className="text-slate-400 text-sm mb-4">Point with your index finger and pinch to choose an operator. Use +, -, *, / or unary operators sin / cos / tan.</p>
                  </div>
                  <div className="glass-panel p-6 border-t-4 border-t-violet-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">Step 3: Enter Operand 2</span>
                    <p className="text-slate-400 text-sm mb-4">For binary operators, show your second number with fingers. Once it locks in, pinch the equals button to compute.</p>
                  </div>
                  <div className="glass-panel p-6 border-t-4 border-t-cyan-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">Step 4: Compute Result</span>
                    <p className="text-slate-400 text-sm mb-4">Pinch the = button when ready. For sin/cos/tan, select the function and then pinch = to get the result.</p>
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
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calculator size={100} />
              </div>
              <div className="text-slate-400 text-right min-h-[2rem] text-sm font-mono mb-2 break-all">
                {getExpressionText() || '0'}
              </div>
              <div className="text-right text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe] break-all">
                {result !== null ? result : '='}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-4 text-sm text-slate-300 shadow-lg">
                <p className="text-slate-400 uppercase tracking-[0.18em] text-xs mb-3">Current Values</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Operand 1</span>
                    <span className="font-bold text-white">{operand1 !== null ? operand1 : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Operator</span>
                    <span className="font-bold text-white">{operator || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Operand 2</span>
                    <span className="font-bold text-white">{operand2 !== null ? operand2 : '-'}</span>
                  </div>
                </div>
              </div>

              <button onClick={resetCalculator} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold hover:from-red-400 hover:to-pink-400 transition-all shadow-[0_15px_40px_rgba(239,68,68,0.25)]">
                <Delete size={20} /> Reset Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
