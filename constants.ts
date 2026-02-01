import { Lane } from "./types";

export const PLAYER_START_Y = 0;
export const WIN_SCORE = 10;

export const CARS_PER_LANE = 3;
export const MAX_LOGS = 50;
export const PLAYER_X_MAX = 10; // rightmost grid column

// Lane width must match w-[1200px] in GameWorld
export const LANE_WIDTH_PX = 1200;
// Must stay in sync with the Tailwind widths used in GameWorld's CarSprite / FluffleSprite
export const PLAYER_WIDTH_PX = 40; // w-10
export const CAR_WIDTHS_PX: Record<string, number> = {
  sedan: 64, // w-16
  van: 96, // w-24
  jeep: 80, // w-20
};

export const CAR_TYPES = ["sedan", "van", "jeep"] as const;

export const LANES_CONFIG: Lane[] = [
  { id: 0, type: "GRASS" },
  { id: 1, type: "ROAD", speed: 0.15, carDensity: 0.3 },
  { id: 2, type: "ROAD", speed: -0.2, carDensity: 0.4 },
  { id: 3, type: "GRASS" },
  { id: 4, type: "ROAD", speed: 0.25, carDensity: 0.2 },
  { id: 5, type: "ROAD", speed: -0.1, carDensity: 0.5 },
  { id: 6, type: "GRASS" },
  { id: 7, type: "ROAD", speed: 0.3, carDensity: 0.25 },
  { id: 8, type: "ROAD", speed: -0.25, carDensity: 0.35 },
  { id: 9, type: "GRASS" },
  { id: 10, type: "GRASS" },
];

export const COLORS = {
  GRASS: "#a3e635",
  ROAD: "#334155",
  PLAYER: "#ffffff",
  CARS: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
};
