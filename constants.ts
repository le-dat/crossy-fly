
import { Lane } from './types';

export const GRID_SIZE = 50; // px
export const VISIBLE_LANES = 12;
export const LANE_WIDTH = 1000; // virtual width for car wrapping
export const PLAYER_START_Y = 0;
export const WIN_SCORE = 10;

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
  { id: 10, type: 'GRASS' }, // Goal area
];

export const COLORS = {
  GRASS: '#a3e635',
  ROAD: '#334155',
  PLAYER: '#ffffff',
  CARS: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'],
};
