import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { Activity, Trophy, Timer, Flame } from 'lucide-react';

export default function SpeedTracker() {
  const [speed, setSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [rankings, setRankings] = useState([]);
  
  const [challengeMode, setChallengeMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const lastPosRef = useRef(null);
  const lastTimeRef = useRef(null);
  const speedHistoryRef = useRef([]); // for graph

  useEffect(() => {
    const pb = localStorage.getItem('gesture_pb');
    if (pb) setPersonalBest(Number(pb));

    const ranks = localStorage.getItem('gesture_ranks');
    if (ranks) setRankings(JSON.parse(ranks));
  }, []);

  const saveScore = (score) => {
    if (score > personalBest) {
      setPersonalBest(score);
      localStorage.setItem('gesture_pb', score.toString());
    }
    const newRanks = [...rankings, score].sort((a, b) => b - a).slice(0, 5);
    setRankings(newRanks);
    localStorage.setItem('gesture_ranks', JSON.stringify(newRanks));
  };

  const startChallenge = () => {
    setChallengeMode(true);
    setMaxSpeed(0);
    setTimeLeft(10);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setChallengeMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft === 0 && !challengeMode) {
      // Challenge ended, save score
      if (maxSpeed > 0) saveScore(maxSpeed);
    }
  }, [timeLeft, challengeMode, maxSpeed]);

  const handleResults = (results, ctx, canvas) => {
    drawHandResults(results, ctx, canvas);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const wrist = results.multiHandLandmarks[0][0];
      const now = performance.now();

      if (lastPosRef.current && lastTimeRef.current) {
        const dt = now - lastTimeRef.current;
        if (dt > 0) {
          const dx = (wrist.x - lastPosRef.current.x) * canvas.width;
          const dy = (wrist.y - lastPosRef.current.y) * canvas.height;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const currentSpeed = Math.round((distance / dt) * 1000);
          
          setSpeed(prev => {
            const smoothed = Math.round(prev * 0.7 + currentSpeed * 0.3);
            if (challengeMode || !challengeMode) {
               if (smoothed > maxSpeed) setMaxSpeed(smoothed);
            }
            return smoothed;
          });
        }
      }

      lastPosRef.current = { x: wrist.x, y: wrist.y };
      lastTimeRef.current = now;
    } else {
      setSpeed(0);
      lastPosRef.current = null;
    }
  };

  const resetMaxSpeed = () => {
    setMaxSpeed(0);
  };

  const speedPercent = Math.min((speed / 8000) * 100, 100);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Activity className="text-primary"/> Hand Speed Tracker
          </h2>
          <p className="text-slate-400 text-sm">Measure and record how fast your hands move</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={startChallenge}
            disabled={challengeMode}
            className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${challengeMode ? 'bg-red-500/20 text-red-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
          >
            <Timer size={18} /> {challengeMode ? `Challenge: ${timeLeft}s` : '10s Challenge'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col md:flex-row">
        <div className="w-full md:w-3/5 lg:w-2/3 h-full relative">
          <WebcamOverlay onResults={handleResults} />
          {challengeMode && (
             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-red-500 flex flex-col items-center">
               <span className="text-red-400 font-bold uppercase text-xs">Time Left</span>
               <span className="text-4xl font-black text-white">{timeLeft}s</span>
             </div>
          )}
        </div>

        <div className="w-full md:w-2/5 lg:w-1/3 glass-panel rounded-none border-l border-slate-700/50 p-6 flex flex-col bg-slate-900 overflow-y-auto">
          
          <div className="w-full mb-8">
            <div className="flex justify-between text-slate-400 mb-2 text-sm font-bold uppercase">
              <span>Live Speed</span>
              <span className="text-white">{speed} px/s</span>
            </div>
            <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
              <div 
                className="h-full bg-gradient-to-r from-[#00f2fe] via-yellow-400 to-red-500 transition-all duration-75"
                style={{ width: `${speedPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center p-6 bg-slate-950 rounded-2xl border border-slate-800 w-full mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 text-red-500 opacity-20 group-hover:opacity-100 transition-opacity"><Flame size={48} /></div>
            <span className="block text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Session Max Speed</span>
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              {maxSpeed}
            </span>
            <span className="text-slate-500 text-sm ml-2">px/s</span>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Trophy size={20} /></div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Personal Best</div>
                  <div className="text-xl font-bold text-white">{personalBest} px/s</div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top 5 Rankings</h3>
              <div className="space-y-2">
                {rankings.length === 0 ? (
                  <div className="text-sm text-slate-600 italic">No records yet.</div>
                ) : (
                  rankings.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800/50">
                      <span className="text-slate-400 font-bold">#{i + 1}</span>
                      <span className="text-white font-mono">{r} px/s</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
