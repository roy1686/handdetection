import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Camera, Hand, LayoutDashboard, Scissors, Edit3, Calculator, Activity, Map, Brain, Info, Menu, Puzzle, CircleDashed, ArrowDownCircle, Languages, Aperture, Code, Layers, Cpu, Heart } from 'lucide-react';

const navItems = [
  { name: 'Hand Detection', path: '/app', icon: Camera },
  { name: 'Finger Counter', path: '/app/finger-counter', icon: Hand },
  { name: 'Air Canvas', path: '/app/air-canvas', icon: Edit3 },
  { name: 'Rock Paper Scissors', path: '/app/rock-paper-scissors', icon: Scissors },
  { name: 'Gesture Calculator', path: '/app/calculator', icon: Calculator },
  { name: 'Screenshot', path: '/app/screenshot', icon: Aperture },
  { name: 'Speed Tracker', path: '/app/speed-tracker', icon: Activity },
  { name: 'Hand Heatmap', path: '/app/heatmap', icon: Map },
  { name: 'Gesture Memory', path: '/app/memory', icon: Brain },
  { name: 'Picture Puzzle', path: '/app/picture-puzzle', icon: Puzzle },
  { name: 'Tic-Tac-Toe', path: '/app/tic-tac-toe', icon: CircleDashed },
  { name: 'Catch Game', path: '/app/catch-game', icon: ArrowDownCircle },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712]">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'} 
        transition-all duration-500 ease-in-out
        glass-panel rounded-none border-r border-white/5 flex flex-col absolute md:relative z-50 h-full
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {isSidebarOpen && (
            <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] to-[#4facfe] flex items-center gap-2">
              <Camera size={28} className="text-[#00f2fe]" />
              Gesture AI
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary/20 to-blue-600/10 border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                    : 'hover:bg-white/5 border border-transparent'}
                `}
                title={!isSidebarOpen ? item.name : ''}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#00f2fe] rounded-r-full shadow-[0_0_10px_#00f2fe]"></div>
                )}
                
                <Icon size={22} className={`
                  ${isActive ? 'text-[#00f2fe]' : 'text-slate-400 group-hover:text-white'} 
                  transition-colors
                `} />
                
                {isSidebarOpen && (
                  <span className={`ml-4 font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-3">
          <Link
            to="/about"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-bold"
          >
            <Info size={22} />
            {isSidebarOpen && <span className="ml-4">About</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className={`md:hidden absolute top-4 left-4 z-40 p-2 rounded-xl bg-slate-800/80 text-white backdrop-blur-md border border-slate-700 shadow-lg transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <Menu size={24} />
        </button>

        {/* Top Glow Effect */}
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[30%] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scrollbar-hide">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
