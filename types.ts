export type LaneType = "GRASS" | "ROAD";

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
  type: "sedan" | "van" | "jeep";
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
