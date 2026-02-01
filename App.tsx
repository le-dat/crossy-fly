import React, { useState, useCallback, useEffect, useRef } from "react";
import { GameState } from "./types";
import { LANES_CONFIG, MAX_LOGS, PLAYER_X_MAX } from "./constants";
import { useGameLoop } from "./hooks/useGameLoop";
import GameWorld from "./components/GameWorld";
import LogSidebar from "./components/LogSidebar";
import Header from "./components/Header";
import Overlay from "./components/Overlay";

// Mobile d-pad layout: 3-col grid, null = empty spacer cell
const MOBILE_BUTTONS: Array<{ dx: number; dy: number; d: string } | null> = [
  null,
  { dx: 0, dy: 1, d: "M5 15l7-7 7 7" },
  null,
  { dx: -1, dy: 0, d: "M15 19l-7-7 7-7" },
  { dx: 0, dy: -1, d: "M19 9l-7 7-7-7" },
  { dx: 1, dy: 0, d: "M9 5l7 7-7 7" },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerPos: { x: 5, y: 0 },
    score: 0,
    isGameOver: false,
    isWon: false,
    logs: ["Welcome to Crossyfluffle!", "Use Arrow Keys to move."],
  });

  const restartRef = useRef(false);

  const addLog = useCallback((message: string) => {
    setGameState((prev) => ({
      ...prev,
      logs: [message, ...prev.logs].slice(0, MAX_LOGS),
    }));
  }, []);

  const handleCollision = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
      logs: ["CRASH! Oh no, Fluffle!", ...prev.logs].slice(0, MAX_LOGS),
    }));
  }, []);

  const cars = useGameLoop({
    playerPos: gameState.playerPos,
    isGameOver: gameState.isGameOver,
    isWon: gameState.isWon,
    restartRef,
    onCollision: handleCollision,
  });

  const handleMove = useCallback(
    (dx: number, dy: number) => {
      setGameState((prev) => {
        if (prev.isGameOver || prev.isWon) return prev;

        const newX = Math.max(0, Math.min(prev.playerPos.x + dx, PLAYER_X_MAX));
        const newY = Math.max(0, Math.min(prev.playerPos.y + dy, LANES_CONFIG.length - 1));

        if (newX === prev.playerPos.x && newY === prev.playerPos.y) return prev;

        const direction = dy > 0 ? "Forward" : dy < 0 ? "Backward" : dx > 0 ? "Right" : "Left";
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
    },
    [addLog],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          handleMove(0, 1);
          break;
        case "ArrowDown":
          handleMove(0, -1);
          break;
        case "ArrowLeft":
          handleMove(-1, 0);
          break;
        case "ArrowRight":
          handleMove(1, 0);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  const restartGame = () => {
    restartRef.current = true;
    setGameState({
      playerPos: { x: 5, y: 0 },
      score: 0,
      isGameOver: false,
      isWon: false,
      logs: ["Game Restarted!", "Good luck Fluffle!"],
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
          {MOBILE_BUTTONS.map((btn, i) =>
            btn ? (
              <button
                key={`${btn.dx},${btn.dy}`}
                onClick={() => handleMove(btn.dx, btn.dy)}
                className="p-4 bg-white/10 rounded-xl active:bg-white/20"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.d} />
                </svg>
              </button>
            ) : (
              <div key={`spacer-${i}`} />
            ),
          )}
        </div>
      </div>

      {/* Right Sidebar Log */}
      <div className="w-full md:w-80 h-48 md:h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-bold uppercase tracking-wider text-sm opacity-60">Movement Log</h2>
          <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded">
            Real-time
          </span>
        </div>
        <LogSidebar logs={gameState.logs} />
      </div>
    </div>
  );
};

export default App;
