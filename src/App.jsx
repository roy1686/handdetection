import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import HandDetection from './pages/HandDetection';
import FingerCounter from './pages/FingerCounter';
import AirCanvas from './pages/AirCanvas';
import RockPaperScissors from './pages/RockPaperScissors';
import GestureCalculator from './pages/GestureCalculator';
import SpeedTracker from './pages/SpeedTracker';
import HandHeatmap from './pages/HandHeatmap';
import GestureMemory from './pages/GestureMemory';
import AboutPage from './pages/AboutPage';

// New Features
import PicturePuzzle from './pages/PicturePuzzle';
import TicTacToe from './pages/TicTacToe';
import CatchGame from './pages/CatchGame';
import SignLanguageDemo from './pages/SignLanguageDemo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<HandDetection />} />
          <Route path="finger-counter" element={<FingerCounter />} />
          <Route path="air-canvas" element={<AirCanvas />} />
          <Route path="rock-paper-scissors" element={<RockPaperScissors />} />
          <Route path="calculator" element={<GestureCalculator />} />
          <Route path="speed-tracker" element={<SpeedTracker />} />
          <Route path="heatmap" element={<HandHeatmap />} />
          <Route path="memory" element={<GestureMemory />} />
          <Route path="picture-puzzle" element={<PicturePuzzle />} />
          <Route path="tic-tac-toe" element={<TicTacToe />} />
          <Route path="catch-game" element={<CatchGame />} />
          <Route path="sign-language" element={<SignLanguageDemo />} />
        </Route>
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
