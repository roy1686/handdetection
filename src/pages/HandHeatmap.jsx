import React, { useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { Map, Trash2 } from 'lucide-react';

export default function HandHeatmap() {
  const heatmapCanvasRef = useRef(null);

  useEffect(() => {
    if (heatmapCanvasRef.current) {
      heatmapCanvasRef.current.width = 1280;
      heatmapCanvasRef.current.height = 720;
    }
  }, []);

  const handleResults = (results, ctx, webcamCanvas) => {
    // Optionally draw standard landmarks, but maybe heatmap is better without it or with it? Let's just draw landmarks lightly.
    ctx.save();
    ctx.globalAlpha = 0.3;
    drawHandResults(results, ctx, webcamCanvas);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const hCtx = heatmapCanvasRef.current.getContext('2d');
      
      results.multiHandLandmarks.forEach(landmarks => {
        // Use the center of the palm (landmark 9)
        const center = landmarks[9];
        const x = (1 - center.x) * heatmapCanvasRef.current.width;
        const y = center.y * heatmapCanvasRef.current.height;

        // Draw radial gradient for heatmap effect
        const radius = 60;
        const gradient = hCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.05)'); // Red center
        gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.02)'); // Yellow middle
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent edge

        hCtx.beginPath();
        hCtx.arc(x, y, radius, 0, 2 * Math.PI);
        hCtx.fillStyle = gradient;
        hCtx.fill();
      });
    }
  };

  const clearHeatmap = () => {
    if (heatmapCanvasRef.current) {
      const ctx = heatmapCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, heatmapCanvasRef.current.width, heatmapCanvasRef.current.height);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Hand Heatmap</h2>
          <p className="text-slate-400 text-sm">Visualizes frequently visited areas of your screen</p>
        </div>
        <button 
          onClick={clearHeatmap}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
        >
          <Trash2 size={16} /> Reset Map
        </button>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black">
        <WebcamOverlay onResults={handleResults}>
          <canvas
            ref={heatmapCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen"
          />
        </WebcamOverlay>
      </div>
    </div>
  );
}
