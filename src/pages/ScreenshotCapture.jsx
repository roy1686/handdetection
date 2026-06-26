import React, { useState, useRef, useEffect } from 'react';
import WebcamOverlay from '../components/WebcamOverlay';
import { drawHandResults } from '../utils/drawHands';
import { countFingers } from '../utils/gestureMath';
import { Aperture, Download, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function ScreenshotCapture() {
  const [filter, setFilter] = useState('none'); // none, grayscale, cartoon, sketch
  const [gallery, setGallery] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const videoCanvasRef = useRef(null);
  const peaceSignTimeRef = useRef(0);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gesture_screenshots');
    if (saved) {
      setGallery(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('gesture_screenshots', JSON.stringify(gallery));
  }, [gallery]);

  const takeScreenshot = (ctx, canvas) => {
    // Apply filter and save
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    
    // Draw current webcam frame
    tCtx.filter = getCanvasFilter(filter);
    tCtx.drawImage(canvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
    setGallery(prev => [{ id: Date.now(), url: dataUrl }, ...prev]);
    
    // Play shutter sound
    const audio = new Audio('https://www.soundjay.com/mechanical/sounds/camera-shutter-click-01.mp3');
    audio.play().catch(e => console.log('Audio error:', e));
  };

  const getCanvasFilter = (f) => {
    switch(f) {
      case 'grayscale': return 'grayscale(100%)';
      case 'cartoon': return 'contrast(1.5) saturate(2) brightness(0.9)';
      case 'sketch': return 'grayscale(100%) contrast(2) brightness(1.2)';
      default: return 'none';
    }
  };

  const handleResults = (results, ctx, canvas) => {
    // Save reference for capture
    videoCanvasRef.current = canvas;
    
    // Apply visual filter to live feed
    ctx.filter = getCanvasFilter(filter);
    // Draw original image first
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    // Reset filter for landmarks
    ctx.filter = 'none';

    drawHandResults(results, ctx, canvas);

    if (isCapturing) return;

    let fingers = 0;
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      fingers = countFingers(results.multiHandLandmarks[0], results.multiHandedness[0].label);
    }

    // Trigger on Peace Sign (2 fingers)
    if (fingers === 2) {
      if (peaceSignTimeRef.current === 0) {
        peaceSignTimeRef.current = Date.now();
      } else {
        const elapsed = Date.now() - peaceSignTimeRef.current;
        if (elapsed > 2000) { // 2 seconds of holding peace sign
          setIsCapturing(true);
          startCountdown();
          peaceSignTimeRef.current = 0;
        }
      }
    } else {
      peaceSignTimeRef.current = 0;
    }
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(0);
        if (videoCanvasRef.current) {
          const ctx = videoCanvasRef.current.getContext('2d');
          takeScreenshot(ctx, videoCanvasRef.current);
        }
        setTimeout(() => setIsCapturing(false), 1000); // Wait 1 sec before allowing next
      }
    }, 1000);
  };

  const deleteImage = (id) => {
    setGallery(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
            <Aperture className="text-primary"/> Screenshot Capture
          </h2>
          <p className="text-slate-400 text-sm">Hold a Peace ✌️ sign for 2 seconds to take a photo</p>
        </div>
        
        <div className="glass-panel px-4 py-2 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Filter</span>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-transparent text-slate-300 outline-none p-1 border border-slate-700 rounded-lg">
            <option value="none">Normal</option>
            <option value="grayscale">Grayscale</option>
            <option value="cartoon">Cartoon</option>
            <option value="sketch">Sketch</option>
          </select>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col lg:flex-row gap-6">
        
        {/* Camera Area */}
        <div className="w-full lg:w-2/3 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-black h-full min-h-[400px]">
          <WebcamOverlay onResults={handleResults} />
          
          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
              <span className="text-[12rem] font-black text-white animate-ping drop-shadow-[0_0_30px_rgba(255,255,255,1)]">
                {countdown}
              </span>
            </div>
          )}
          {countdown === 0 && isCapturing && (
            <div className="absolute inset-0 bg-white z-30 animate-flash"></div>
          )}
        </div>

        {/* Gallery Area */}
        <div className="w-full lg:w-1/3 glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
            <ImageIcon className="text-secondary" /> Gallery
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {gallery.length === 0 ? (
              <div className="text-slate-500 text-center italic mt-10">No screenshots yet. Pose!</div>
            ) : (
              gallery.map(img => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-700">
                  <img src={img.url} alt="Screenshot" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <a href={img.url} download={`gesture-snap-${img.id}.jpg`} className="p-3 bg-primary text-white rounded-full hover:bg-blue-600 transition-transform hover:scale-110">
                      <Download size={20} />
                    </a>
                    <button onClick={() => deleteImage(img.id)} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
