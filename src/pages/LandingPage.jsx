import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Zap, Shield, Sparkles, ChevronRight, Activity, Hand, Brain, Scissors, Edit3, Calculator, Map, Puzzle, CircleDashed, ArrowDownCircle, Languages, Aperture, Code, Layers, Cpu, Heart } from 'lucide-react';

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
  const canvasRef = useRef(null);

  // Background particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist/150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-x-hidden font-sans scroll-smooth">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40"></canvas>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00f2fe] rounded-full blur-[180px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4facfe] rounded-full blur-[180px] opacity-20"></div>
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-600 rounded-full blur-[180px] opacity-10"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5 sticky top-0 bg-[#030712]/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00f2fe] to-[#4facfe] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)]">
            <Camera className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">Gesture<span className="text-[#00f2fe]">AI</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#tech" className="hover:text-white transition-colors">Tech Stack</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>
        <Link to="/app" className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-xl border border-white/10 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Launch App
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-40 text-center">
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter max-w-5xl leading-[1.1] mb-8 drop-shadow-2xl"
        >
          Control with your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#00f2fe] bg-[length:200%_auto] animate-gradient pb-2 inline-block drop-shadow-[0_0_30px_rgba(0,242,254,0.3)]">
            gestures.
          </span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl mb-12"
        >
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium mb-4">
            <span className="text-white italic">"The most powerful interface is the one you already possess."</span>
          </p>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed">
            Experience the next evolution of spatial computing. Transform your browser into a magical canvas using advanced artificial intelligence. No hardware required—just your hands and your imagination.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link 
            to="/app" 
            className="group relative px-8 py-4 bg-white text-black font-black rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 text-lg"
          >
            <span className="relative z-10">Get Started</span>
            <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
          
          <a 
            href="#features" 
            className="px-8 py-4 glass-panel rounded-2xl font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg border border-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Explore Features
          </a>
        </motion.div>
      </main>

      {/* Introduction Paragraph */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-primary/20 bg-slate-900/40 shadow-[0_0_40px_rgba(0,242,254,0.1)]">
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-medium">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#4facfe] font-black">Gesture AI</span>, a revolutionary browser-based platform that translates your hand gestures into interactive commands. Whether you want to draw in mid-air, challenge an AI in Rock Paper Scissors, or test your memory, everything is controlled securely and privately through your webcam. No extra hardware, no downloads—just seamless spatial computing directly in your browser.
          </p>
        </div>
      </section>

      {/* Full Feature Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">12 Powerful Features</h2>
          <p className="text-xl text-slate-400">Jump directly into any module from right here.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <Link 
                to={feat.path} 
                key={feat.name}
                className="glass-panel p-6 flex flex-col items-center justify-center text-center group hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`w-16 h-16 rounded-2xl ${feat.bg} flex items-center justify-center mb-4 border ${feat.border} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className={`${feat.color}`} size={32} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00f2fe] transition-colors">{feat.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="relative z-10 max-w-7xl mx-auto px-4 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Cutting Edge Tech</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Built with modern web technologies to ensure zero-latency performance and beautiful aesthetics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TECH_STACK.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <div key={tech.name} className="glass-panel p-8 text-center group hover:bg-white/5 transition-colors cursor-default">
                <Icon size={48} className="mx-auto mb-6 text-slate-300 group-hover:text-primary transition-colors" />
                <h3 className="text-2xl font-bold text-white mb-2">{tech.name}</h3>
                <p className="text-slate-400 font-medium">{tech.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-16 text-center bg-[#030712] backdrop-blur-md flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-button mb-8 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-primary/5 hover:bg-primary/10 transition-colors">
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
  );
}
