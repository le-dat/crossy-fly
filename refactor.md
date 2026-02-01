# Refactor: Crossyfluffle — maintainability

---

## 1. `types.ts` — remove dead `Tree`, unify `playerPos` to `Vector2`

```typescript
export type LaneType = 'GRASS' | 'ROAD';

export interface Lane {
  id: number;
  type: LaneType;
  speed?: number; // positive = right, negative = left
  carDensity?: number;
}

export interface Car {
  id: number;
  laneIndex: number;
  x: number; // percentage of viewport width
  color: string;
  type: 'sedan' | 'van' | 'jeep';
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameState {
  playerPos: Vector2;
  score: number;
  isGameOver: boolean;
  isWon: boolean;
  logs: string[];
}
```

**What changed & why:**
- `Tree` interface removed — never instantiated anywhere; the `<Tree>` in GameWorld.tsx is a local component, unrelated
- `Vector2` moved above `GameState` and used for `playerPos` — was a redundant inline `{ x; y }`

---

## 2. `constants.ts` — remove dead exports, add named constants

```typescript
import { Lane } from './types';

export const PLAYER_START_Y = 0;
export const WIN_SCORE = 10;

export const CARS_PER_LANE = 3;
export const COLLISION_THRESHOLD = 7; // % of viewport width
export const MAX_LOGS = 50;
export const PLAYER_X_MAX = 10; // rightmost grid column

export const CAR_TYPES = ['sedan', 'van', 'jeep'] as const;

export const LANES_CONFIG: Lane[] = [
  { id: 0, type: 'GRASS' },
  { id: 1, type: 'ROAD', speed: 0.15, carDensity: 0.3 },
  { id: 2, type: 'ROAD', speed: -0.2, carDensity: 0.4 },
  { id: 3, type: 'GRASS' },
  { id: 4, type: 'ROAD', speed: 0.25, carDensity: 0.2 },
  { id: 5, type: 'ROAD', speed: -0.1, carDensity: 0.5 },
  { id: 6, type: 'GRASS' },
  { id: 7, type: 'ROAD', speed: 0.3, carDensity: 0.25 },
  { id: 8, type: 'ROAD', speed: -0.25, carDensity: 0.35 },
  { id: 9, type: 'GRASS' },
  { id: 10, type: 'GRASS' },
];

export const COLORS = {
  GRASS: '#a3e635',
  ROAD: '#334155',
  PLAYER: '#ffffff',
  CARS: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'],
};
```

**What changed & why:**
- Removed `GRID_SIZE`, `VISIBLE_LANES`, `LANE_WIDTH` — imported in App.tsx but never used in any expression
- Added `CARS_PER_LANE`, `COLLISION_THRESHOLD`, `MAX_LOGS`, `PLAYER_X_MAX` — were magic numbers scattered across App.tsx
- Added `CAR_TYPES` as a typed `const` array — replaces the `as any` cast during car init

---

## 3. `vite.config.ts` — remove dead Gemini API config

```typescript
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

**What changed & why:**
- Removed `loadEnv` and the `({ mode }) =>` factory — only existed to read `GEMINI_API_KEY`
- Removed `define` block — `process.env.API_KEY` / `process.env.GEMINI_API_KEY` are never referenced in the app

---

## 4. `hooks/useGameLoop.ts` — NEW FILE (create `hooks/` directory)

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import { Car, Vector2 } from '../types';
import {
  LANES_CONFIG,
  COLORS,
  CARS_PER_LANE,
  CAR_TYPES,
  COLLISION_THRESHOLD,
  PLAYER_X_MAX,
} from '../constants';
import React from 'react';

let nextId = 0;

function initCars(): Car[] {
  const cars: Car[] = [];
  LANES_CONFIG.forEach((lane, idx) => {
    if (lane.type === 'ROAD') {
      for (let i = 0; i < CARS_PER_LANE; i++) {
        cars.push({
          id: nextId++,
          laneIndex: idx,
          x: Math.random() * 100,
          color: COLORS.CARS[Math.floor(Math.random() * COLORS.CARS.length)],
          type: CAR_TYPES[Math.floor(Math.random() * CAR_TYPES.length)],
        });
      }
    }
  });
  return cars;
}

interface UseGameLoopProps {
  playerPos: Vector2;
  isGameOver: boolean;
  isWon: boolean;
  restartRef: React.MutableRefObject<boolean>;
  onCollision: () => void;
}

export function useGameLoop({
  playerPos,
  isGameOver,
  isWon,
  restartRef,
  onCollision,
}: UseGameLoopProps): Car[] {
  const [cars, setCars] = useState<Car[]>(initCars);

  // Refs so the animate callback never closes over stale state
  const playerPosRef = useRef(playerPos);
  const isGameOverRef = useRef(isGameOver);
  const isWonRef = useRef(isWon);
  const onCollisionRef = useRef(onCollision);
  const collisionFiredRef = useRef(false); // prevents double-fire in concurrent mode
  const lastUpdateRef = useRef<number | null>(null);
  const requestRef = useRef<number>();

  // Sync refs every render (no useEffect needed — runs synchronously)
  playerPosRef.current = playerPos;
  isGameOverRef.current = isGameOver;
  isWonRef.current = isWon;
  onCollisionRef.current = onCollision;

  const animate = useCallback((time: number) => {
    // Handle restart signal from App
    if (restartRef.current) {
      setCars(initCars());
      lastUpdateRef.current = null;
      collisionFiredRef.current = false;
      restartRef.current = false;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    // Skip the very first frame — lastUpdateRef starts null so deltaTime
    // would be enormous (time - 0). Record timestamp and move on.
    if (lastUpdateRef.current !== null) {
      const deltaTime = time - lastUpdateRef.current;

      setCars(prevCars => {
        const nextCars = prevCars.map(car => {
          const lane = LANES_CONFIG[car.laneIndex];
          const speed = (lane.speed || 0) * (deltaTime / 16); // normalize to 60 fps
          let nextX = car.x + speed;
          if (nextX > 110) nextX = -10;
          if (nextX < -10) nextX = 110;
          return { ...car, x: nextX };
        });

        // Collision detection
        const pos = playerPosRef.current;
        const playerXPercent = (pos.x / PLAYER_X_MAX) * 100;

        const collision = nextCars.some(car => {
          if (car.laneIndex !== pos.y) return false;
          return Math.abs(car.x - playerXPercent) < COLLISION_THRESHOLD;
        });

        if (collision && !isGameOverRef.current && !isWonRef.current && !collisionFiredRef.current) {
          collisionFiredRef.current = true;
          onCollisionRef.current();
        }

        return nextCars;
      });
    }

    lastUpdateRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Empty deps is intentional: animate reads everything via refs.

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return cars;
}
```

**What this fixes:**
- **Stale closure bug:** Old `animate` closed over `gameState.playerPos` etc., which recreated the callback on every state change, restarting the RAF loop. Now it reads refs — callback is created once, loop never restarts.
- **First-frame teleport:** `lastUpdateRef` starts `null`. Frame 1 just records the timestamp; cars don't move until frame 2 with a normal ~16 ms delta.
- **`as any` cast:** `CAR_TYPES[...]` is typed; TypeScript infers `'sedan' | 'van' | 'jeep'` automatically.
- **Random IDs:** `nextId++` is deterministic and unique.
- **Concurrent-mode double-fire:** `collisionFiredRef` guards `onCollision()`.

---

## 5. `App.tsx` — use the hook, remove game loop, deduplicate buttons

```typescript
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState } from './types';
import { LANES_CONFIG, MAX_LOGS, PLAYER_X_MAX } from './constants';
import { useGameLoop } from './hooks/useGameLoop';
import GameWorld from './components/GameWorld';
import LogSidebar from './components/LogSidebar';
import Header from './components/Header';
import Overlay from './components/Overlay';

// Mobile d-pad layout: 3-col grid, null = empty spacer cell
const MOBILE_BUTTONS: Array<{ dx: number; dy: number; d: string } | null> = [
  null,
  { dx: 0,  dy: 1,  d: 'M5 15l7-7 7 7' },
  null,
  { dx: -1, dy: 0,  d: 'M15 19l-7-7 7-7' },
  { dx: 0,  dy: -1, d: 'M19 9l-7 7-7-7' },
  { dx: 1,  dy: 0,  d: 'M9 5l7 7-7 7' },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerPos: { x: 5, y: 0 },
    score: 0,
    isGameOver: false,
    isWon: false,
    logs: ['Welcome to Crossyfluffle!', 'Use Arrow Keys to move.'],
  });

  const restartRef = useRef(false);

  const addLog = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      logs: [message, ...prev.logs].slice(0, MAX_LOGS),
    }));
  }, []);

  const handleCollision = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      logs: ['CRASH! Oh no, Fluffle!', ...prev.logs].slice(0, MAX_LOGS),
    }));
  }, []);

  const cars = useGameLoop({
    playerPos: gameState.playerPos,
    isGameOver: gameState.isGameOver,
    isWon: gameState.isWon,
    restartRef,
    onCollision: handleCollision,
  });

  const handleMove = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (prev.isGameOver || prev.isWon) return prev;

      const newX = Math.max(0, Math.min(prev.playerPos.x + dx, PLAYER_X_MAX));
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
        case 'ArrowUp':    handleMove(0, 1);  break;
        case 'ArrowDown':  handleMove(0, -1); break;
        case 'ArrowLeft':  handleMove(-1, 0); break;
        case 'ArrowRight': handleMove(1, 0);  break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const restartGame = () => {
    restartRef.current = true;
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
          {MOBILE_BUTTONS.map((btn, i) =>
            btn ? (
              <button key={`${btn.dx},${btn.dy}`} onClick={() => handleMove(btn.dx, btn.dy)} className="p-4 bg-white/10 rounded-xl active:bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.d} />
                </svg>
              </button>
            ) : (
              <div key={`spacer-${i}`} />
            )
          )}
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
```

**What changed & why:**
- Removed: `Car`, `LaneType`, `Tree` type imports; `GRID_SIZE`, `WIN_SCORE`, `COLORS` constant imports; car `useState`; car init `useEffect`; entire `animate` + its `useEffect`; `lastUpdateRef`, `requestRef`
- Added: `useGameLoop` hook call; `restartRef`; `handleCollision` (combines isGameOver + log in one setState — one render instead of two)
- `PLAYER_X_MAX` replaces the hardcoded `10` in `handleMove`
- `MAX_LOGS` replaces the hardcoded `50` in `addLog` and `handleCollision`
- Mobile buttons: 4 copy-paste JSX blocks → `MOBILE_BUTTONS.map()` preserving exact same grid layout

---

## 6. `components/GameWorld.tsx` — fix unsafe assertion, use COLORS constant

Only two lines change. Everything else stays identical.

**Line 19-25** (the lane `<div>`) — merge `backgroundColor` into the existing `style` prop, remove color from className:

```tsx
          <div
            key={lane.id}
            className="relative w-[1200px] h-16 mb-0 border-b border-black/10"
            style={{
              backgroundColor: lane.type === 'GRASS' ? COLORS.GRASS : COLORS.ROAD,
              transform: `translateZ(${idx * 0.1}px)`,
              boxShadow: lane.type === 'ROAD' ? 'inset 0 10px 15px -3px rgba(0,0,0,0.3)' : 'none',
            }}
          >
```

**Line 49** — replace non-null assertion:

```tsx
// Before
flipped={LANES_CONFIG[idx].speed! < 0}

// After
flipped={(LANES_CONFIG[idx].speed ?? 0) < 0}
```

---

## Verification checklist

1. `pnpm dev` — starts on port 3000, no TS errors, no console errors
2. Arrow keys move the player; score increments going up
3. Reach lane 10 → "VICTORY!" overlay appears
4. Walk into traffic → "GAME OVER" overlay + crash log entry
5. "PLAY AGAIN" resets everything and a new game is playable
6. Resize to mobile width → d-pad buttons appear and work
7. Cars wrap cleanly at screen edges, no teleport on page load
