import { useEffect, useRef } from 'react';

export function useHandTracking(videoRef, onResults) {
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const onResultsRef = useRef(onResults);

  // Keep the latest callback reference without triggering the main useEffect
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (!window.Hands || !window.Camera) {
      console.error('MediaPipe libraries not loaded via CDN. Please check index.html');
      return;
    }

    // Initialize MediaPipe Hands
    handsRef.current = new window.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    handsRef.current.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    handsRef.current.onResults((results) => {
      if (onResultsRef.current) {
        onResultsRef.current(results);
      }
    });

    // Initialize Camera
    cameraRef.current = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720
    });

    cameraRef.current.start();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [videoRef]); // onResults removed to prevent infinite re-mounting

  return { hands: handsRef.current, camera: cameraRef.current };
}
