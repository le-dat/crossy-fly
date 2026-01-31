
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, LaneType, Car, Tree } from './types';
import { LANES_CONFIG, COLORS, GRID_SIZE, WIN_SCORE } from './constants';
import GameWorld from './components/GameWorld';
import LogSidebar from './components/LogSidebar';
import Header from './components/Header';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerPos: { x: 5, y: 0 }, // Grid indices
    score: 0,
    isGameOver: false,
    isWon: false,
    logs: ['Welcome to Crossyfluffle!', 'Use Arrow Keys to move.'],
  });

  const [cars, setCars] = useState<Car[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const requestRef = useRef<number>();

  // Initialize Cars
  useEffect(() => {
    const initialCars: Car[] = [];
    LANES_CONFIG.forEach((lane, idx) => {
      if (lane.type === 'ROAD') {
        // Simple heuristic for car spacing
        for (let i = 0; i < 3; i++) {
          initialCars.push({
            id: Math.random(),
            laneIndex: idx,
            x: Math.random() * 100,
            color: COLORS.CARS[Math.floor(Math.random() * COLORS.CARS.length)],
            type: ['sedan', 'van', 'jeep'][Math.floor(Math.random() * 3)] as any,
          });
        }
      }
    });
    setCars(initialCars);
  }, []);

  const addLog = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      logs: [message, ...prev.logs].slice(0, 50),
    }));
  }, []);

  const handleMove = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (prev.isGameOver || prev.isWon) return prev;

      const newX = Math.max(0, Math.min(prev.playerPos.x + dx, 10));
      const newY = Math.max(0, Math.min(prev.playerPos.y + dy, LANES_CONFIG.length - 1));

      if (newX === prev.playerPos.x && newY === prev.playerPos.y) return prev;

      const direction = dy > 0 ? 'Forward' : dy < 0 ? 'Backward' : dx > 0 ? 'Right' : 'Left';
      addLog(`Moved ${direction} to (${newX}, ${newY})`);

      const newScore = Math.max(prev.score, newY);
      const isWon = newY >= LANES_CONFIG.length - 1;

      return {
        ...prev,
        playerPos: { x: newX, y: newY },
        score: newScore,
        isWon,
      };
    });
  }, [addLog]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': handleMove(0, 1); break;
        case 'ArrowDown': handleMove(0, -1); break;
        case 'ArrowLeft': handleMove(-1, 0); break;
        case 'ArrowRight': handleMove(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Game Loop for traffic
  const animate = useCallback((time: number) => {
    if (lastUpdateRef.current !== undefined) {
      const deltaTime = time - lastUpdateRef.current;
      
      setCars(prevCars => {
        const nextCars = prevCars.map(car => {
          const lane = LANES_CONFIG[car.laneIndex];
          const speed = (lane.speed || 0) * (deltaTime / 16); // Normalize to 60fps
          let nextX = car.x + speed;
          if (nextX > 110) nextX = -10;
          if (nextX < -10) nextX = 110;
          return { ...car, x: nextX };
        });

        // Collision Check
        const playerLane = gameState.playerPos.y;
        const playerXPercent = (gameState.playerPos.x / 10) * 100;
        
        const collision = nextCars.some(car => {
          if (car.laneIndex !== playerLane) return false;
          // Car collision box: roughly 8-10% of width
          return Math.abs(car.x - playerXPercent) < 7;
        });

        if (collision && !gameState.isGameOver && !gameState.isWon) {
          setGameState(prev => ({ ...prev, isGameOver: true }));
          addLog('CRASH! Oh no, Fluffle!');
        }

        return nextCars;
      });
    }
    lastUpdateRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [gameState.playerPos, gameState.isGameOver, gameState.isWon, addLog]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const restartGame = () => {
    setGameState({
      playerPos: { x: 5, y: 0 },
      score: 0,
      isGameOver: false,
      isWon: false,
      logs: ['Game Restarted!', 'Good luck Fluffle!'],
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-900 text-white">
      {/* Left Main Content */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden">
        <Header score={gameState.score} />
        
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <GameWorld 
            playerPos={gameState.playerPos} 
            cars={cars} 
            isGameOver={gameState.isGameOver}
          />
          
          <Overlay 
            isGameOver={gameState.isGameOver} 
            isWon={gameState.isWon} 
            onRestart={restartGame} 
          />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden grid grid-cols-3 gap-2 p-6 absolute bottom-0">
          <div />
          <button onClick={() => handleMove(0, 1)} className="p-4 bg-white/10 rounded-xl active:bg-white/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <div />
          <button onClick={() => handleMove(-1, 0)} className="p-4 bg-white/10 rounded-xl active:bg-white/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => handleMove(0, -1)} className="p-4 bg-white/10 rounded-xl active:bg-white/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={() => handleMove(1, 0)} className="p-4 bg-white/10 rounded-xl active:bg-white/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Right Sidebar Log */}
      <div className="w-full md:w-80 h-48 md:h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-bold uppercase tracking-wider text-sm opacity-60">Movement Log</h2>
          <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded">Real-time</span>
        </div>
        <LogSidebar logs={gameState.logs} />
      </div>
    </div>
  );
};

export default App;
