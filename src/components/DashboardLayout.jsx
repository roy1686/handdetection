import React, { useState, useEffect } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Hand, LayoutDashboard, Scissors, Edit3, Calculator, Activity, Map, Brain, Info, Menu, Puzzle, CircleDashed, ArrowDownCircle, Languages, Aperture, Code, Layers, Cpu, Heart } from 'lucide-react';
import AnimatedPage from './AnimatedPage';

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

const sidebarVariants = {
  open: { width: '18rem', transition: { type: 'spring', stiffness: 200, damping: 20 } },
  closed: { width: '5rem', transition: { type: 'spring', stiffness: 200, damping: 20 } },
  mobileOpen: { x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  mobileClosed: { x: '-100%', transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function DashboardLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] selection:bg-primary/30">
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        variants={sidebarVariants}
        initial={isMobile ? "mobileClosed" : "closed"}
        animate={isMobile ? (isSidebarOpen ? "mobileOpen" : "mobileClosed") : (isSidebarOpen ? "open" : "closed")}
        className="glass-panel rounded-none border-r border-white/5 flex flex-col absolute md:relative z-50 h-full overflow-hidden"
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="whitespace-nowrap">
                <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] to-[#4facfe] flex items-center gap-2">
                  <Camera size={28} className="text-[#00f2fe]" />
                  Gesture AI
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <motion.div 
          className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide space-y-1 relative"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div variants={itemVariants} key={item.name} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/10 border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Link
                  to={item.path}
                  className={`
                    relative flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group
                    ${!isActive ? 'hover:bg-white/5 border border-transparent' : ''}
                  `}
                  title={!isSidebarOpen ? item.name : ''}
                >
                  {isActive && (
                    <motion.div layoutId="activeNavEdge" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#00f2fe] rounded-r-full shadow-[0_0_10px_#00f2fe]"></motion.div>
                  )}
                  
                  <Icon size={22} className={`
                    relative z-10 shrink-0
                    ${isActive ? 'text-[#00f2fe]' : 'text-slate-400 group-hover:text-white'} 
                    transition-colors
                  `} />
                  
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`ml-4 font-bold whitespace-nowrap relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <Link
            to="/about"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-bold overflow-hidden"
          >
            <Info size={22} className="shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="ml-4 whitespace-nowrap">
                  About
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-[#030712]">
        {/* Mobile Menu Toggle */}
        <AnimatePresence>
          {!isSidebarOpen && isMobile && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-40 p-2 rounded-xl bg-slate-800/80 text-white backdrop-blur-md border border-slate-700 shadow-lg"
            >
              <Menu size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              {outlet}
            </AnimatedPage>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
