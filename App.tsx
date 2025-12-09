import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SCATTERED);

  const toggleState = () => {
    setAppState((prev) => 
      prev === AppState.SCATTERED ? AppState.TREE_SHAPE : AppState.SCATTERED
    );
  };

  return (
    <div className="w-full h-screen relative bg-[#050805]">
      {/* UI Overlay */}
      <Overlay currentState={appState} onToggle={toggleState} />

      {/* 3D Scene */}
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene appState={appState} />
        </Suspense>
      </Canvas>
      
      {/* Loading Bar */}
      <Loader 
        containerStyles={{ background: '#050805' }}
        innerStyles={{ background: '#333', width: '200px' }}
        barStyles={{ background: '#D4AF37', height: '5px' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'Cinzel, serif', fontSize: '12px' }}
      />
    </div>
  );
};

export default App;