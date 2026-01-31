
export type LaneType = 'GRASS' | 'ROAD';

export interface Lane {
  id: number;
  type: LaneType;
  speed?: number; // positive for right, negative for left
  carDensity?: number;
}

export interface Car {
  id: number;
  laneIndex: number;
  x: number; // percentage of width
  color: string;
  type: 'sedan' | 'van' | 'jeep';
}

export interface Tree {
  id: number;
  laneIndex: number;
  x: number; // percentage of width
}

export interface GameState {
  playerPos: { x: number; y: number };
  score: number;
  isGameOver: boolean;
  isWon: boolean;
  logs: string[];
}

export interface Vector2 {
  x: number;
  y: number;
}
