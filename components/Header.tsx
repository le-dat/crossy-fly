
import React from 'react';

interface HeaderProps {
  score: number;
}

const Header: React.FC<HeaderProps> = ({ score }) => {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
      <h1 className="pixel-font text-4xl mb-2 text-white drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
        CROSSYFLUFFLE
      </h1>
      <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-4">
        <span className="text-xs uppercase tracking-widest opacity-60">Score</span>
        <span className="pixel-font text-xl text-yellow-400">{score}</span>
      </div>
    </div>
  );
};

export default Header;
