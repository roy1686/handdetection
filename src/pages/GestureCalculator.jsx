import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Calculator, Delete, HelpCircle } from 'lucide-react';

export default function GestureCalculator() {
  const [operand1, setOperand1] = useState(null);
  const [operator, setOperator] = useState(null);
  const [operand2, setOperand2] = useState(null);
  const [result, setResult] = useState(null);
  const [stage, setStage] = useState('operand1');
  const [detectedNumber, setDetectedNumber] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [displayMessage, setDisplayMessage] = useState('Show fingers to input the first operand.');

  const numberBufferRef = useRef([]);
  const stableNumberStartRef = useRef(0);
  const currentStableNumberRef = useRef(null);

  const resetCalculator = () => {
    setOperand1(null);
    setOperator(null);
    setOperand2(null);
    setResult(null);
    setStage('operand1');
    setDetectedNumber(null);
    setDisplayMessage('Show fingers to input the first operand.');
    numberBufferRef.current = [];
    stableNumberStartRef.current = 0;
    currentStableNumberRef.current = null;
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
      case 'sin': return formatResult(Math.sin(a * Math.PI / 180));
      case 'cos': return formatResult(Math.cos(a * Math.PI / 180));
      case 'tan': return formatResult(Math.tan(a * Math.PI / 180));
      default: return 'Error';
    }
  };

  const lockNumber = (value) => {
    if (stage === 'operand1') {
      setOperand1(prev => prev === null ? value : Number(`${prev}${value}`));
      setDisplayMessage(`Appended ${value}. Show another digit, or click an operator.`);
      return;
    }

    if (stage === 'operand2') {
      setOperand2(prev => prev === null ? value : Number(`${prev}${value}`));
      setDisplayMessage(`Appended ${value}. Show another digit, or click "=" to compute.`);
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
        setDisplayMessage('Unary result ready. Press Reset to start again.');
        setStage('result');
        return;
      }

      if (operand2 === null) {
        setDisplayMessage('Show the second operand using fingers before pressing equals.');
        return;
      }

      const calc = calculateResult();
      setResult(calc);
      setDisplayMessage('Result ready. Press Reset to start again.');
      setStage('result');
      return;
    }

    if (stage === 'operand1' && operand1 === null) {
      setDisplayMessage('First show the initial number before selecting an operator.');
      return;
    }

    setOperator(label);
    if (['sin', 'cos', 'tan'].includes(label)) {
      setDisplayMessage('Unary operator selected. Click "=" to compute the result.');
      setStage('operator');
    } else {
      setDisplayMessage('Operator selected. Show fingers to input the second operand.');
      setStage('operand2');
      setDetectedNumber(null);
      numberBufferRef.current = [];
      stableNumberStartRef.current = 0;
      currentStableNumberRef.current = null;
    }
  };

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      if (stage === 'operand1' || stage === 'operand2') setDetectedNumber(null);
      numberBufferRef.current = [];
      currentStableNumberRef.current = null;
      return;
    }

    let fingersCount = 0;
    results.multiHandLandmarks.forEach((landmarks, index) => {
      const handedness = results.multiHandedness[index].label;
      fingersCount += countFingers(landmarks, handedness);
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

      if (stableNumber !== null) {
        if (currentStableNumberRef.current !== stableNumber) {
          currentStableNumberRef.current = stableNumber;
          stableNumberStartRef.current = now;
        } else if (now - stableNumberStartRef.current > 1500) {
          if (stage === 'operand1' && operand1 !== stableNumber) {
            lockNumber(stableNumber);
            currentStableNumberRef.current = null; // Reset to prevent spamming
            ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (stage === 'operand2' && operand2 !== stableNumber) {
            lockNumber(stableNumber);
            currentStableNumberRef.current = null; // Reset to prevent spamming
            ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      } else {
        currentStableNumberRef.current = null;
      }
    } else {
      setDetectedNumber(null);
      numberBufferRef.current = [];
      currentStableNumberRef.current = null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Calculator className="text-primary"/> Gesture Calculator
          </h2>
          <p className="text-slate-400 text-sm">Hold up fingers (0-10) for 1.5s to type numbers. Click operators.</p>
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
               <div className="w-48 rounded-3xl border border-slate-700/50 bg-slate-950/85 p-4 text-left text-sm text-slate-300 shadow-lg pointer-events-auto">
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
                    <p className="text-slate-400 text-sm mb-4">Show a number with your fingers (0-10) and hold it for 1.5s to lock it in. Do this repeatedly to append digits.</p>
                  </div>
                  <div className="glass-panel p-6 border-t-4 border-t-blue-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">Step 2: Select Operator</span>
                    <p className="text-slate-400 text-sm mb-4">Click an operator button on the right menu with your mouse.</p>
                  </div>
                  <div className="glass-panel p-6 border-t-4 border-t-violet-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">Step 3: Enter Operand 2</span>
                    <p className="text-slate-400 text-sm mb-4">For binary operators (+, -, *, /), show your second number with fingers and hold to append digits.</p>
                  </div>
                  <div className="glass-panel p-6 border-t-4 border-t-cyan-500 text-center">
                    <span className="text-xl font-bold text-white mb-2 block">Step 4: Compute Result</span>
                    <p className="text-slate-400 text-sm mb-4">Click the = button on the menu to get your result.</p>
                  </div>
                </div>

                <button onClick={() => setShowInstructions(false)} className="px-10 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-400 rounded-xl text-xl font-black text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  Got It!
                </button>
              </div>
            )}
          </WebcamOverlay>
        </div>

        <div className="w-full lg:w-1/3 glass-panel rounded-none border-l border-slate-700/50 flex flex-col bg-slate-900 p-8 overflow-y-auto">
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

              {/* Calculator Keypad */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                <button onClick={() => chooseOperator('+')} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-white transition-colors text-xl shadow-md border border-slate-700/50">+</button>
                <button onClick={() => chooseOperator('-')} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-white transition-colors text-xl shadow-md border border-slate-700/50">-</button>
                <button onClick={() => chooseOperator('*')} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-white transition-colors text-xl shadow-md border border-slate-700/50">×</button>
                <button onClick={() => chooseOperator('/')} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-white transition-colors text-xl shadow-md border border-slate-700/50">÷</button>
                
                <button onClick={() => chooseOperator('sin')} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 transition-colors text-sm shadow-md border border-slate-700/50">sin</button>
                <button onClick={() => chooseOperator('cos')} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 transition-colors text-sm shadow-md border border-slate-700/50">cos</button>
                <button onClick={() => chooseOperator('tan')} className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 transition-colors text-sm shadow-md border border-slate-700/50">tan</button>
                <button onClick={() => chooseOperator('=')} className="py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-black text-white transition-colors text-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/30">=</button>
              </div>

              <button onClick={resetCalculator} className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-400 hover:to-pink-400 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.25)]">
                <Delete size={20} /> Reset Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
