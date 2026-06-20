import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Camera, Hand, LayoutDashboard, Scissors, Edit3, Calculator, Activity, Map, Brain, Info, Menu, Puzzle, CircleDashed, ArrowDownCircle, Languages } from 'lucide-react';

const navItems = [
  { name: 'Hand Detection', path: '/app', icon: Camera },
  { name: 'Finger Counter', path: '/app/finger-counter', icon: Hand },
  { name: 'Air Canvas', path: '/app/air-canvas', icon: Edit3 },
  { name: 'Rock Paper Scissors', path: '/app/rock-paper-scissors', icon: Scissors },
  { name: 'Gesture Calculator', path: '/app/calculator', icon: Calculator },
  { name: 'Speed Tracker', path: '/app/speed-tracker', icon: Activity },
  { name: 'Hand Heatmap', path: '/app/heatmap', icon: Map },
  { name: 'Gesture Memory', path: '/app/memory', icon: Brain },
  { name: 'Picture Puzzle', path: '/app/picture-puzzle', icon: Puzzle },
  { name: 'Tic-Tac-Toe', path: '/app/tic-tac-toe', icon: CircleDashed },
  { name: 'Catch Game', path: '/app/catch-game', icon: ArrowDownCircle },
  { name: 'Sign Language', path: '/app/sign-language', icon: Languages },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out glass-panel m-4 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          {isSidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">GestureAI</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-700/50">
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-xl transition-all ${
                      isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="min-w-[20px]" />
                    {isSidebarOpen && <span className="ml-3 truncate text-sm">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-700/50">
          <Link to="/about" className="flex items-center p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
            <Info size={20} className="min-w-[20px]" />
            {isSidebarOpen && <span className="ml-3 text-sm">About</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pl-0 overflow-hidden flex flex-col">
        <div className="glass-panel flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
