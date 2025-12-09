import React from 'react';
import { AppState } from '../types';

interface OverlayProps {
  currentState: AppState;
  onToggle: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ currentState, onToggle }) => {
  const isTree = currentState === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
      {/* Header */}
      <header className="flex flex-col items-center mt-4">
        <h1 className="text-4xl md:text-6xl text-[#D4AF37] font-bold tracking-widest uppercase drop-shadow-lg" style={{ fontFamily: 'Cinzel, serif' }}>
          Mila's Wish
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-2"></div>
        <p className="text-[#a8cfba] mt-2 font-serif italic text-lg tracking-wider opacity-80" style={{ fontFamily: 'Playfair Display, serif' }}>
          May you have a Happy Christmas.
        </p>
      </header>

      {/* Footer / Controls */}
      <footer className="mb-8 w-full flex justify-center pointer-events-auto">
        <button
          onClick={onToggle}
          className={`
            group relative px-12 py-4 border-2 border-[#D4AF37] 
            bg-[#002211]/80 backdrop-blur-md overflow-hidden transition-all duration-500
            hover:bg-[#D4AF37] hover:text-[#002211] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]
            text-[#D4AF37] uppercase tracking-[0.2em] font-bold text-sm md:text-base
          `}
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          <span className="relative z-10 transition-transform duration-300">
            {isTree ? "Scatter Wealth" : "Build the Legacy"}
          </span>
          
          {/* Shine effect */}
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        </button>
      </footer>
    </div>
  );
};

export default Overlay;