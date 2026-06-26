import React, { useRef, useEffect, useState } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { Map, Trash2, Video, Square, Target, Play } from 'lucide-react';

export default function HandHeatmap() {
  const heatmapCanvasRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [analytics, setAnalytics] = useState({ distance: 0, activeRegion: 'None' });
  
  const historyRef = useRef([]); // Store raw points for replay
  const lastPosRef = useRef(null);
  
  // 3x3 Grid for regions
  const gridHitsRef = useRef(new Array(9).fill(0));

  useEffect(() => {
    if (heatmapCanvasRef.current) {
      heatmapCanvasRef.current.width = 1280;
      heatmapCanvasRef.current.height = 720;
    }
  }, []);

  const getRegionName = (idx) => {
    const names = ['Top-Left', 'Top-Center', 'Top-Right', 'Mid-Left', 'Center', 'Mid-Right', 'Bottom-Left', 'Bottom-Center', 'Bottom-Right'];
    return names[idx];
  };

  const calculateMostActiveRegion = () => {
    const maxIdx = gridHitsRef.current.indexOf(Math.max(...gridHitsRef.current));
    if (gridHitsRef.current[maxIdx] === 0) return 'None';
    return getRegionName(maxIdx);
  };

  const drawHeatmapPoint = (hCtx, x, y) => {
    const radius = 60;
    const gradient = hCtx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.08)'); // Red center
    gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.03)'); // Yellow middle
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent edge

    hCtx.beginPath();
    hCtx.arc(x, y, radius, 0, 2 * Math.PI);
    hCtx.fillStyle = gradient;
    hCtx.fill();
  };

  const handleResults = (results, ctx, webcamCanvas) => {
    ctx.save();
    ctx.globalAlpha = 0.3;
    drawHandResults(results, ctx, webcamCanvas);
    ctx.restore();

    if (isReplaying) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const hCtx = heatmapCanvasRef.current.getContext('2d');
      const cw = heatmapCanvasRef.current.width;
      const ch = heatmapCanvasRef.current.height;
      
      results.multiHandLandmarks.forEach(landmarks => {
        const center = landmarks[9];
        const x = (1 - center.x) * cw;
        const y = center.y * ch;

        drawHeatmapPoint(hCtx, x, y);

        if (isRecording) {
          historyRef.current.push({ x, y });
          
          // Distance
          if (lastPosRef.current) {
            const dx = x - lastPosRef.current.x;
            const dy = y - lastPosRef.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            setAnalytics(prev => ({ ...prev, distance: prev.distance + dist }));
          }
          lastPosRef.current = { x, y };

          // Region
          const col = Math.floor(x / (cw / 3));
          const row = Math.floor(y / (ch / 3));
          const gridIdx = Math.min(2, Math.max(0, row)) * 3 + Math.min(2, Math.max(0, col));
          gridHitsRef.current[gridIdx]++;
        }
      });
      
      if (isRecording) {
         setAnalytics(prev => ({ ...prev, activeRegion: calculateMostActiveRegion() }));
      }

    } else {
      lastPosRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      lastPosRef.current = null;
    } else {
      setIsRecording(true);
    }
  };

  const clearHeatmap = () => {
    if (heatmapCanvasRef.current) {
      const ctx = heatmapCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, heatmapCanvasRef.current.width, heatmapCanvasRef.current.height);
      historyRef.current = [];
      gridHitsRef.current = new Array(9).fill(0);
      setAnalytics({ distance: 0, activeRegion: 'None' });
      lastPosRef.current = null;
    }
  };

  const replayHeatmap = () => {
    if (historyRef.current.length === 0 || isReplaying) return;
    setIsReplaying(true);
    setIsRecording(false);

    const canvas = heatmapCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let idx = 0;
    const drawNext = () => {
      if (idx >= historyRef.current.length) {
        setIsReplaying(false);
        return;
      }
      const pt = historyRef.current[idx];
      drawHeatmapPoint(ctx, pt.x, pt.y);
      idx++;
      requestAnimationFrame(drawNext);
    };
    drawNext();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Map className="text-primary"/> Hand Heatmap Analytics
          </h2>
          <p className="text-slate-400 text-sm">Visualize frequent movements and track session metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={toggleRecording}
            disabled={isReplaying}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isRecording ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse border' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
          >
            {isRecording ? <Square size={16}/> : <Video size={16}/>} 
            {isRecording ? 'Stop Recording' : 'Start Session'}
          </button>

          <button 
            onClick={replayHeatmap}
            disabled={isRecording || isReplaying || historyRef.current.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${historyRef.current.length === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
          >
            <Play size={16}/> Replay
          </button>

          <button 
            onClick={clearHeatmap}
            disabled={isReplaying}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg transition-colors border border-slate-700"
          >
            <Trash2 size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black flex flex-col lg:flex-row shadow-xl">
        <div className="w-full lg:w-3/4 h-full relative">
          <WebcamOverlay onResults={handleResults}>
            {/* Grid Overlay for reference */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-10">
              {Array.from({length: 9}).map((_, i) => (
                <div key={i} className="border border-white/50 flex items-center justify-center"></div>
              ))}
            </div>
            
            <canvas
              ref={heatmapCanvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen"
            />
            
            {isReplaying && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-primary/50 text-primary font-bold flex items-center gap-2 animate-pulse">
                <Play size={16} fill="currentColor" /> Replaying Heatmap...
              </div>
            )}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-white"></div> REC
              </div>
            )}
          </WebcamOverlay>
        </div>

        <div className="w-full lg:w-1/4 glass-panel rounded-none border-l border-slate-700/50 flex flex-col p-6 bg-slate-900">
          <h3 className="text-lg font-bold mb-6 text-white border-b border-slate-800 pb-2">Session Analytics</h3>
          
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-primary/20"><Target size={40} /></div>
              <span className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Most Active Region</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe]">
                {analytics.activeRegion}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-secondary/20"><Map size={40} /></div>
              <span className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Distance</span>
              <span className="text-2xl font-black text-white">
                {Math.round(analytics.distance / 1000)} <span className="text-sm text-slate-500">kpx</span>
              </span>
            </div>
            
            <div className="flex-1 mt-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Click <strong>Start Session</strong> to begin tracking metrics and movement patterns. The 3x3 grid helps identify ergonomics and reachability.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
