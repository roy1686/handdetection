import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hand, Camera, Activity, Edit3, Scissors, Map, Brain, Calculator, Puzzle, CircleDashed, ArrowDownCircle, Languages } from 'lucide-react';

const features = [
  { name: 'Hand Detection', icon: Camera, desc: 'Real-time hand tracking and landmark visualization.' },
  { name: 'Finger Counter', icon: Hand, desc: 'Count raised fingers dynamically using AI.' },
  { name: 'Air Canvas', icon: Edit3, desc: 'Draw in the air using your index finger.' },
  { name: 'Rock Paper Scissors', icon: Scissors, desc: 'Play against the computer using hand gestures.' },
  { name: 'Gesture Calculator', icon: Calculator, desc: 'Calculate numbers using finger gestures.' },
  { name: 'Speed Tracker', icon: Activity, desc: 'Measure how fast your hands are moving.' },
  { name: 'Hand Heatmap', icon: Map, desc: 'Visualize your most frequent hand movements.' },
  { name: 'Gesture Memory', icon: Brain, desc: 'Test your memory by repeating gesture sequences.' },
  { name: 'Picture Puzzle', icon: Puzzle, desc: 'Pinch and drag to solve picture puzzles with hand tracking.' },
  { name: 'Tic-Tac-Toe', icon: CircleDashed, desc: 'Play by pointing at grid cells.' },
  { name: 'Catch Game', icon: ArrowDownCircle, desc: 'Catch falling objects with a virtual basket.' },
  { name: 'Sign Language', icon: Languages, desc: 'Learn and test basic ASL alphabet letters.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="p-6 flex justify-between items-center relative z-10 max-w-7xl mx-auto">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">GestureAI</div>
        <Link to="/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Experience <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Hand Tracking</span> in Your Browser.
          </h1>
          <p className="text-xl text-slate-400 mb-12">
            Explore real-time computer vision capabilities without any backend server. Fast, private, and smooth 60 FPS hand tracking using MediaPipe and React.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/app" 
              className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]"
            >
              Launch App
            </Link>
            <a 
              href="https://github.com/google/mediapipe" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg transition-all border border-slate-700"
            >
              Learn about MediaPipe
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-32 w-full"
        >
          <h2 className="text-3xl font-bold mb-12 text-center">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="glass-panel p-6 hover:translate-y-[-5px] transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
