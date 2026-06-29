import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Resize, Center } from '@react-three/drei';
import modelPath from '../assets/robotic-hand.glb';

export default function RoboticHand() {
  const rootRef = useRef();
  const handRef = useRef();
  
  // Load the 3D model
  const { scene } = useGLTF(modelPath);

  useFrame((state, delta) => {
    // Continuous smooth 360-degree auto-rotation
    if (handRef.current) {
      handRef.current.rotation.y += delta * 0.6; // Slightly faster showroom spin
    }
  });

  return (
    <group ref={rootRef} position={[0, -0.2, 0]}>
      
      {/* Bottom uplighting for rays/glow exactly from below the hand */}
      <pointLight position={[0, -3.5, 0]} intensity={12} color="#00f2fe" distance={10} />
      <spotLight position={[0, -4, 0]} angle={0.6} penumbra={1} intensity={6} color="#00f2fe" castShadow />

      {/* The actual hand model */}
      <group ref={handRef}>
        <Resize scale={7.5}>
          <Center>
            {/* We apply the 3D model directly and rotate it 90 degrees so it faces forward instead of the side */}
            <primitive object={scene} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
          </Center>
        </Resize>
      </group>
    </group>
  );
}

// Preload the model so it renders instantly
useGLTF.preload(modelPath);
