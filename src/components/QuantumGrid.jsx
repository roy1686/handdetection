import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function QuantumGrid({ activeGesture, mouse }) {
  const meshRef = useRef();
  
  // Custom shader for the glowing grid lines
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uImpact: { value: 0 }, // For Spatial Impact Warp
    uMouse: { value: new THREE.Vector2() }
  }), []);

  // Spatial Impact Warp triggering
  const impactRef = useRef(0);
  const prevGestureRef = useRef(activeGesture);

  useEffect(() => {
    if (activeGesture !== prevGestureRef.current) {
      // Trigger spatial impact warp (value goes to 1, then decays)
      impactRef.current = 1.0;
      prevGestureRef.current = activeGesture;
    }
  }, [activeGesture]);

  // Animate the grid
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    uniforms.uTime.value += delta;
    
    // Smoothly interpolate the mouse for "The Anchor" (tilt/roll)
    // A low-amplitude pitch/roll tilt synced with the user's cursor
    const targetRotX = -Math.PI / 2 + (mouse.current.y * 0.05);
    const targetRotY = (mouse.current.x * 0.05);
    
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.05;
    
    // Decay the impact warp over ~0.4 seconds
    // If we want it to decay in 0.4s (and we are running at 60fps), we can use a lerp or subtract
    if (impactRef.current > 0) {
      impactRef.current -= delta / 0.4; // Linear decay over 0.4s
      if (impactRef.current < 0) impactRef.current = 0;
    }
    
    // Smoothly pass the impact to the shader
    uniforms.uImpact.value += (impactRef.current - uniforms.uImpact.value) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[0, -5, -15]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 120, 120, 120]} />
      <shaderMaterial
        wireframe={true}
        transparent={true}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uImpact;
          
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            vUv = uv;
            vec3 pos = position;
            
            // 1. Passive Fluency: Ripple effect when idle
            // Multi-layered sine-wave to look like deep water
            float elevation = sin(pos.x * 0.15 + uTime * 0.5) * cos(pos.y * 0.15 + uTime * 0.5) * 1.5;
            elevation += sin(pos.x * 0.05 - uTime * 0.2) * 1.0;
            
            // 2. Spatial Impact Warp
            // Bend, pinch, and ripple outwards from the center of the hand
            // Hand is located roughly around center, slightly to the right (x>0)
            vec2 center = vec2(10.0, 0.0);
            float distToCenter = distance(pos.xy, center);
            
            // A heavy expanding ripple
            // We use uImpact (0 to 1) to drive an expanding ring
            float expandRadius = (1.0 - uImpact) * 40.0; 
            float ringThickness = 15.0;
            
            // Warp effect based on distance
            float warpInfluence = smoothstep(ringThickness, 0.0, abs(distToCenter - expandRadius));
            
            // Pinching inward
            vec2 dirToCenter = normalize(center - pos.xy);
            pos.xy += dirToCenter * warpInfluence * uImpact * 5.0;
            
            // Vertical distortion
            float verticalWarp = warpInfluence * uImpact * 10.0 * sin(distToCenter * 0.5 - uTime * 10.0);
            
            pos.z += elevation + verticalWarp;
            vElevation = pos.z;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            // Deep obsidian void color: #080B12 (normalized to ~ 0.03, 0.04, 0.07)
            vec3 baseColor = vec3(0.04, 0.06, 0.12); // Slightly pushed to blue
            vec3 highlightColor = vec3(0.0, 0.95, 1.0); // Cyan glow
            
            // Fade out grid lines in the distance smoothly
            float distanceFade = smoothstep(0.0, 0.5, 0.5 - distance(vUv, vec2(0.5)));
            
            // Make peaks brighter
            float intensity = smoothstep(-1.0, 3.0, vElevation);
            vec3 finalColor = mix(baseColor, highlightColor, intensity * 0.6);
            
            // Add a subtle scanline effect to the laser-fine lines
            float scanline = sin(vUv.y * 500.0 - uTime * 10.0) * 0.05;
            
            gl_FragColor = vec4(finalColor + scanline, distanceFade * 0.4);
          }
        `}
      />
    </mesh>
  );
}
