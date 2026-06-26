import React, { useRef } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';

export default function WebcamOverlay({ onResults, children, mirror = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useHandTracking(videoRef, (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to match video if dimensions change
    if (videoRef.current && videoRef.current.videoWidth) {
      if (canvas.width !== videoRef.current.videoWidth || canvas.height !== videoRef.current.videoHeight) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
      }
    }

    if (onResults) {
      onResults(results, ctx, canvas);
    }
  });

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className={`absolute w-full h-full object-cover ${mirror ? '-scale-x-100' : ''}`}
        autoPlay
        playsInline
      />
      {/* 
        The canvas must match the scaling of the video to overlay correctly. 
        Note: pointer-events-auto allows canvas to be interacted with for Air Canvas if needed. 
      */}
      <canvas
        ref={canvasRef}
        className={`absolute w-full h-full object-cover ${mirror ? '-scale-x-100' : ''} pointer-events-none`}
        width={1280}
        height={720}
      />
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 [&>*]:pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
