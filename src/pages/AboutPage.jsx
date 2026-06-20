import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Eye, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-primary hover:text-blue-400 mb-8 transition-colors">
          <ArrowLeft className="mr-2" size={20} /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-extrabold text-white mb-6">About GestureAI</h1>
        
        <div className="glass-panel p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
          <p className="mb-4">
            GestureAI is a modern, client-side web application that leverages advanced computer vision 
            to track hand movements and recognize gestures in real-time, directly within your browser. 
            Built without a backend server, it ensures maximum privacy, zero latency from network overhead, 
            and a seamless 60 FPS experience.
          </p>
          <p>
            It features various interactive tools and games, demonstrating the power of edge AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="glass-panel p-8">
            <Cpu className="text-secondary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">How it Works</h3>
            <p className="text-sm">
              The application accesses your webcam feed and processes each frame using a lightweight machine learning model.
              It identifies 21 3D landmarks on your hand, which are then used to calculate angles, distances, and gesture states
              (like raised fingers) through custom mathematical algorithms.
            </p>
          </div>
          
          <div className="glass-panel p-8">
            <Eye className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">MediaPipe Vision</h3>
            <p className="text-sm">
              Powered by Google's MediaPipe framework, the hand tracking model is optimized to run natively via WebAssembly (WASM) 
              and WebGL. It provides state-of-the-art accuracy in detecting hands and fingers even under difficult lighting conditions.
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Technology Stack</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <Zap className="text-yellow-400 mr-3 mt-1 shrink-0" size={20} />
              <div>
                <strong className="text-white block">Frontend: React & Vite</strong>
                <span>Provides a blazing fast, component-based UI with client-side routing.</span>
              </div>
            </li>
            <li className="flex items-start">
              <Zap className="text-blue-400 mr-3 mt-1 shrink-0" size={20} />
              <div>
                <strong className="text-white block">Styling: Tailwind CSS</strong>
                <span>Utility-first CSS framework used for the glassmorphism effects and fully responsive design.</span>
              </div>
            </li>
            <li className="flex items-start">
              <Zap className="text-purple-400 mr-3 mt-1 shrink-0" size={20} />
              <div>
                <strong className="text-white block">AI: @mediapipe/hands</strong>
                <span>Handles the heavy lifting of computer vision directly in the browser.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
