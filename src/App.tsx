import React, { Suspense, lazy } from 'react';
import './App.css';

// Lazy load the heavy 3D game component
const Game3D = lazy(() => import('./components/Game3D').then(module => ({ default: module.Game3D })));

// Simple loading component
const GameLoader = () => (
  <div className="min-h-screen enchanted-bg flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl text-yellow-400 font-bold">Loading Cookie Warriors...</h2>
      <p className="text-yellow-300 mt-2">Preparing the enchanted forest battle</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <Suspense fallback={<GameLoader />}>
        <Game3D />
      </Suspense>
    </div>
  );
}

export default App;