
import React from 'react';

interface OverlayProps {
  isGameOver: boolean;
  isWon: boolean;
  onRestart: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ isGameOver, isWon, onRestart }) => {
  if (!isGameOver && !isWon) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-slate-800 p-8 rounded-3xl border border-white/10 shadow-2xl text-center max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-300">
        <div className={`mb-6 p-4 rounded-2xl ${isWon ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <div className="text-6xl mb-4">
            {isWon ? '🏆' : '💥'}
          </div>
          <h2 className={`pixel-font text-2xl mb-2 ${isWon ? 'text-green-400' : 'text-red-400'}`}>
            {isWon ? 'VICTORY!' : 'GAME OVER'}
          </h2>
          <p className="text-white/60 text-sm">
            {isWon 
              ? 'Fluffle made it across safely! You are a master of traffic navigation.' 
              : 'Fluffle got flattened! Be more careful next time.'}
          </p>
        </div>
        
        <button
          onClick={onRestart}
          className="w-full py-4 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 rounded-xl pixel-font text-sm transition-all shadow-[0_4px_0_rgb(3,105,161)] active:shadow-none active:translate-y-1"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default Overlay;
