import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Hand, Edit3, Scissors, Calculator, Aperture, Activity, Map, Brain, Puzzle, CircleDashed, ArrowDownCircle, Code, Layers, Cpu, Zap, Heart } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import QuantumGrid from '../components/QuantumGrid';
import RoboticHand from '../components/RoboticHand';

const FEATURES = [
  { name: 'Hand Detection', path: '/app', icon: Camera, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  { name: 'Finger Counter', path: '/app/finger-counter', icon: Hand, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
  { name: 'Air Canvas', path: '/app/air-canvas', icon: Edit3, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30' },
  { name: 'Rock Paper Scissors', path: '/app/rock-paper-scissors', icon: Scissors, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  { name: 'Gesture Calculator', path: '/app/calculator', icon: Calculator, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  { name: 'Screenshot Trigger', path: '/app/screenshot', icon: Aperture, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  { name: 'Speed Tracker', path: '/app/speed-tracker', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  { name: 'Hand Heatmap', path: '/app/heatmap', icon: Map, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  { name: 'Gesture Memory', path: '/app/memory', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30' },
  { name: 'Picture Puzzle', path: '/app/picture-puzzle', icon: Puzzle, color: 'text-lime-400', bg: 'bg-lime-500/20', border: 'border-lime-500/30' },
  { name: 'Tic-Tac-Toe', path: '/app/tic-tac-toe', icon: CircleDashed, color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/30' },
  { name: 'Catch Game', path: '/app/catch-game', icon: ArrowDownCircle, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
];

const TECH_STACK = [
  { name: 'React 18', icon: Code, desc: 'Component Architecture' },
  { name: 'Tailwind CSS', icon: Layers, desc: 'Ultra Premium Styling' },
  { name: 'MediaPipe AI', icon: Cpu, desc: '60FPS Hand Tracking' },
  { name: 'Vite', icon: Zap, desc: 'Lightning Fast Builds' },
];

export default function LandingPage() {
  const [activeGesture, setActiveGesture] = useState(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#080B12] relative overflow-x-hidden font-sans text-white scroll-smooth">
      
      {/* 3D Background & Hand Layer - Fixed to viewport */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows dpr={[1, 1.5]} gl={{ powerPreference: "high-performance", antialias: false }}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          <color attach="background" args={['#080B12']} />
          
          <ambientLight intensity={0.5} />
          
          <spotLight 
            position={[10, 15, 10]} 
            angle={0.25} 
            penumbra={0.8} 
            intensity={2} 
            color="#f8fafc" 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
            shadow-bias={-0.0001}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f2fe" />
          
          <QuantumGrid activeGesture={activeGesture} mouse={mouse} />
          
          <group position={[-4.5, 0, 0]}>
            <RoboticHand activeGesture={activeGesture} mouse={mouse} />
            <ContactShadows position={[0, -4, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" frames={1} resolution={512} />
          </group>
          
          <Environment preset="city" />
          
          <EffectComposer disableNormalPass multisampling={0}>
            <Bloom luminanceThreshold={1.0} mipmapBlur intensity={1.5} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Scrolling Content Overlay */}
      <div className="relative z-10 w-full">
        
        {/* Hero Section (100vh) */}
        <div className="min-h-screen flex items-center max-w-7xl mx-auto px-8 lg:px-16 pointer-events-none">
          <div className="w-full lg:w-[60%] flex flex-col items-start pt-20 pointer-events-auto ml-auto pl-8">
            <motion.h1 
              initial={{ opacity: 0, x: 30, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[1.1] mb-6 drop-shadow-2xl"
            >
              Control with your <br />
              gestures.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, x: 30, filter: 'blur(5px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
              className="text-lg md:text-xl leading-relaxed font-medium mb-10 max-w-2xl p-6 rounded-2xl bg-[#080B12]/60 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-[#00f2fe]/40 transition-colors duration-500"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-white italic font-bold block mb-4 drop-shadow-[0_0_10px_rgba(0,242,254,0.4)]">
                "The most powerful interface is the one you already possess."
              </span>
              <span className="text-slate-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Experience the next evolution of spatial computing. Transform your browser into a magical canvas using advanced artificial intelligence. No hardware required—just your hands and your imagination.
              </span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex gap-4 mb-16"
            >
              <Link 
                to="/app" 
                className="px-8 py-3 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-black rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,242,254,0.4)]"
              >
                Get Started
              </Link>
              <a 
                href="#features"
                className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
              >
                Explore Features
              </a>
            </motion.div>
          </div>
        </div>

        {/* Content Below Fold - Transparent to keep 3D hand visible */}
        <div className="bg-transparent pointer-events-auto overflow-hidden">
          
          {/* Welcome Section */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto px-6 py-20 text-center"
          >
            <div className="p-8 md:p-12 rounded-3xl border border-[#00f2fe]/30 bg-[#080B12]/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <p className="text-xl md:text-3xl text-white leading-relaxed font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe] font-black drop-shadow-none">Gesture AI</span>, a revolutionary browser-based platform that translates your hand gestures into interactive commands. Whether you want to draw in mid-air, challenge an AI in Rock Paper Scissors, or test your memory, everything is controlled securely and privately through your webcam. No extra hardware, no downloads—just seamless spatial computing directly in your browser.
              </p>
            </div>
          </motion.section>

          {/* Features Grid */}
          <section id="features" className="max-w-7xl mx-auto px-4 py-24">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">12 Powerful Features</h2>
              <p className="text-xl md:text-2xl text-slate-200 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Jump directly into any module from right here.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {FEATURES.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to={feat.path} 
                      onMouseEnter={() => setActiveGesture(feat.name)}
                      onMouseLeave={() => setActiveGesture(null)}
                      className="p-6 h-full flex flex-col items-center justify-center text-center group relative overflow-hidden rounded-2xl bg-[#080B12]/90 backdrop-blur-md border border-white/10 hover:border-[#00f2fe]/60 hover:bg-[#00f2fe]/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(0,242,254,0.2)] transition-colors duration-300"
                    >
                      <div className={`w-16 h-16 rounded-2xl ${feat.bg} flex items-center justify-center mb-4 border ${feat.border} shadow-lg`}>
                        <Icon className={`${feat.color}`} size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-100 group-hover:text-[#00f2fe] transition-colors drop-shadow-md">{feat.name}</h3>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Tech Stack */}
          <section id="tech" className="max-w-7xl mx-auto px-4 py-24 border-t border-white/10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">Cutting Edge Tech</h2>
              <p className="text-xl md:text-2xl text-slate-200 font-medium max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Built with modern web technologies to ensure zero-latency performance and beautiful aesthetics.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TECH_STACK.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <motion.div 
                    key={tech.name} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="p-8 text-center group rounded-2xl bg-[#080B12]/90 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/5 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.4)] cursor-default"
                  >
                    <Icon size={48} className="mx-auto mb-6 text-slate-300 group-hover:text-white transition-colors drop-shadow-lg" />
                    <h3 className="text-2xl font-black text-slate-100 mb-2 drop-shadow-md">{tech.name}</h3>
                    <p className="text-slate-300 font-medium drop-shadow-sm">{tech.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 py-16 text-center bg-[#030712]/95 backdrop-blur-xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8 border border-[#00f2fe]/20 shadow-[0_0_20px_rgba(0,242,254,0.15)] bg-[#00f2fe]/5 hover:bg-[#00f2fe]/10 transition-colors">
              <Heart size={16} className="text-pink-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-300">Built with Passion & AI by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe] font-black">Priyanka Priyadarshinee</span></span>
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f2fe] to-[#4facfe] flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.4)]">
                <Camera className="text-white" size={20} />
              </div>
              <span className="text-xl font-black tracking-tight text-white">Gesture<span className="text-[#00f2fe]">AI</span></span>
            </div>
            <p className="text-slate-600 text-sm mt-2">© 2026 All rights reserved.</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
