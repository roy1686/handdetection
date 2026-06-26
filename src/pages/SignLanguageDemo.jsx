import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { detectSignLanguage } from '../utils/signLanguageMath';
import { Languages, Volume2, MessageSquare, Delete, BookOpen } from 'lucide-react';

const ALPHABET = [
  { letter: 'A', desc: 'Fist with thumb resting to the side' },
  { letter: 'B', desc: 'Flat hand, thumb folded across palm' },
  { letter: 'C', desc: 'Hand curved into a C shape' },
  { letter: 'D', desc: 'Index straight up, others folded, thumb touching middle' },
  { letter: 'E', desc: 'Fingers tightly curled, thumb folded' },
  { letter: 'F', desc: 'Index and thumb touching, others straight' },
  { letter: 'G', desc: 'Index straight horizontal, others folded' },
  { letter: 'H', desc: 'Index and middle straight horizontal' },
  { letter: 'I', desc: 'Pinky straight up, others folded' },
  { letter: 'J', desc: 'Make an I, trace J in the air' },
  { letter: 'K', desc: 'Index and middle up, thumb between them' },
  { letter: 'L', desc: 'Index and thumb form an L shape' },
  { letter: 'M', desc: 'Fist, thumb under first three fingers' },
  { letter: 'N', desc: 'Fist, thumb under first two fingers' },
  { letter: 'O', desc: 'Fingers curved to touch thumb, forming O' },
  { letter: 'P', desc: 'Like K, but pointing downward' },
  { letter: 'Q', desc: 'Like G, but pointing downward' },
  { letter: 'R', desc: 'Index and middle crossed' },
  { letter: 'S', desc: 'Fist with thumb over fingers' },
  { letter: 'T', desc: 'Fist, thumb under index finger' },
  { letter: 'U', desc: 'Index and middle straight and touching' },
  { letter: 'V', desc: 'Index and middle straight and separated' },
  { letter: 'W', desc: 'Index, middle, ring straight and separated' },
  { letter: 'X', desc: 'Index bent like a hook' },
  { letter: 'Y', desc: 'Thumb and pinky out, others folded' },
  { letter: 'Z', desc: 'Trace Z in the air with index' },
];

export default function SignLanguageDemo() {
  const [detectedLetter, setDetectedLetter] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const [sentence, setSentence] = useState('');
  const [showManual, setShowManual] = useState(true);
  
  const letterBufferRef = useRef([]);
  const lastLetterAddedTimeRef = useRef(0);

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    let letter = null;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const handednessLabel = results.multiHandedness && results.multiHandedness.length > 0 ? results.multiHandedness[0].label : 'Right';
      letter = detectSignLanguage(results.multiHandLandmarks[0], handednessLabel);
    }
    
    // Smoothing
    if (letter) {
      letterBufferRef.current.push(letter);
      if (letterBufferRef.current.length > 10) letterBufferRef.current.shift();
      
      const counts = {};
      letterBufferRef.current.forEach(l => counts[l] = (counts[l] || 0) + 1);
      
      let mostFrequent = null;
      let maxCount = 0;
      for (const [l, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequent = l;
        }
      }

      if (maxCount >= 7) { 
        setDetectedLetter(mostFrequent);
        
        const now = Date.now();
        if (now - lastLetterAddedTimeRef.current > 800) {  // 0.8s lock time
           setCurrentWord(prev => prev + mostFrequent);
           lastLetterAddedTimeRef.current = now;
        }
      }
    } else {
      letterBufferRef.current = [];
      setDetectedLetter(null);
    }
  };

  const addSpace = () => {
    if (currentWord) {
      setSentence(prev => prev + (prev ? ' ' : '') + currentWord);
      setCurrentWord('');
    } else {
      setSentence(prev => prev + ' ');
    }
  };

  const backspace = () => {
    if (currentWord.length > 0) {
      setCurrentWord(prev => prev.slice(0, -1));
    } else if (sentence.length > 0) {
      setSentence(prev => prev.slice(0, -1));
    }
  };

  const speakSentence = () => {
    const textToSpeak = sentence + (currentWord ? ' ' + currentWord : '');
    if (!textToSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    window.speechSynthesis.speak(utterance);
  };

  const clearAll = () => {
    setCurrentWord('');
    setSentence('');
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Languages className="text-primary"/> Sign Language Translator
          </h2>
          <p className="text-slate-400 text-sm">Hold a letter for 0.8s to type. Build words and sentences.</p>
        </div>
        <button 
          onClick={() => setShowManual(!showManual)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${showManual ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <BookOpen size={20} /> {showManual ? 'Hide Guide' : 'Show Guide'}
        </button>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col lg:flex-row shadow-2xl">
        
        {/* Camera Area */}
        <div className="flex-1 h-full relative">
          <WebcamOverlay onResults={handleResults} />
          
          <div className="absolute top-4 left-4 flex gap-4 z-20">
             <div className="w-24 h-24 rounded-2xl border-2 border-primary bg-black/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
               <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Detecting</span>
               <span className="text-5xl font-black text-white">{detectedLetter || '-'}</span>
             </div>
          </div>
        </div>

        {/* Translation Panel & Reference Guide (Right Side) */}
        <div className="w-full lg:w-[400px] glass-panel rounded-none border-l border-slate-700/50 flex flex-col bg-slate-900 z-20 relative h-full">
          
          <div className="p-6 flex flex-col h-full overflow-hidden">
            <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-6 flex flex-col shadow-inner relative overflow-hidden min-h-[150px]">
               <div className="absolute top-[-20px] right-[-20px] opacity-5">
                 <Languages size={100} />
               </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-2 relative z-10">
                <MessageSquare size={14} /> Output
              </div>
              
              <div className="flex-1 text-2xl font-medium text-white leading-relaxed break-words overflow-y-auto relative z-10">
                {sentence} <span className="text-[#00f2fe] font-bold">{currentWord}</span>
                <span className="animate-pulse opacity-50 ml-1">|</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={addSpace} className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-bold shadow-md">
                Space
              </button>
              <button onClick={backspace} className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl transition-colors font-bold shadow-md">
                <Delete size={18} /> Del
              </button>
              <button onClick={clearAll} className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors font-bold col-span-2 shadow-md">
                Clear All
              </button>
            </div>

            <button onClick={speakSentence} className="w-full flex items-center justify-center gap-2 p-4 mb-4 bg-gradient-to-r from-primary to-secondary hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transform hover:scale-[1.02]">
              <Volume2 size={20} /> Speak Text
            </button>

            {/* Bottom Right Manual Reference */}
            {showManual && (
              <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-700 pt-4 mt-auto">
                <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-[#00f2fe]" /> Quick Reference (A-Z)
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  {ALPHABET.map(item => (
                    <div key={item.letter} className={`p-2 rounded-lg border flex gap-3 items-center transition-colors ${detectedLetter === item.letter ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-800/50 border-slate-700/50'}`}>
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center font-black text-lg shadow-inner ${detectedLetter === item.letter ? 'bg-primary text-white' : 'bg-slate-900 text-slate-400'}`}>
                        {item.letter}
                      </div>
                      <div className="flex-1 text-[11px] text-slate-300 leading-tight">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
