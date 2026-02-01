import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Car, Vector2 } from "../types";
import {
  LANES_CONFIG,
  COLORS,
  CARS_PER_LANE,
  CAR_TYPES,
  PLAYER_X_MAX,
  LANE_WIDTH_PX,
  PLAYER_WIDTH_PX,
  CAR_WIDTHS_PX,
} from "../constants";
import React from "react";

let nextId = 0;

function initCars(): Car[] {
  const cars: Car[] = [];
  LANES_CONFIG.forEach((lane, idx) => {
    if (lane.type === "ROAD") {
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

  const animateRef = useRef<FrameRequestCallback>();

  // Sync refs and animate callback after each render, before paint.
  // useLayoutEffect runs before useEffect, so animateRef is ready when the loop starts.
  useLayoutEffect(() => {
    playerPosRef.current = playerPos;
    isGameOverRef.current = isGameOver;
    isWonRef.current = isWon;
    onCollisionRef.current = onCollision;

    animateRef.current = (time: number) => {
      // Handle restart signal from App
      if (restartRef.current) {
        setCars(initCars());
        lastUpdateRef.current = null;
        collisionFiredRef.current = false;
        restartRef.current = false;
      }

      // Skip the very first frame — lastUpdateRef starts null so deltaTime
      // would be enormous (time - 0). Record timestamp and move on.
      if (lastUpdateRef.current !== null) {
        const deltaTime = time - lastUpdateRef.current;

        setCars((prevCars) => {
          const nextCars = prevCars.map((car) => {
            const lane = LANES_CONFIG[car.laneIndex];
            const speed = (lane.speed || 0) * (deltaTime / 16); // normalize to 60 fps
            let nextX = car.x + speed;
            if (nextX > 110) nextX = -10;
            if (nextX < -10) nextX = 110;
            return { ...car, x: nextX };
          });

          // Collision detection — AABB overlap using actual rendered widths
          const pos = playerPosRef.current;
          const playerLeft = (pos.x / PLAYER_X_MAX) * 100;
          const playerRight = playerLeft + (PLAYER_WIDTH_PX / LANE_WIDTH_PX) * 100;

          const collision = nextCars.some((car) => {
            if (car.laneIndex !== pos.y) return false;
            const carRight = car.x + (CAR_WIDTHS_PX[car.type] / LANE_WIDTH_PX) * 100;
            return car.x < playerRight && carRight > playerLeft;
          });

          if (
            collision &&
            !isGameOverRef.current &&
            !isWonRef.current &&
            !collisionFiredRef.current
          ) {
            collisionFiredRef.current = true;
            onCollisionRef.current();
          }

          return nextCars;
        });
      }

      lastUpdateRef.current = time;
      requestRef.current = requestAnimationFrame(animateRef.current!);
    };
  });

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateRef.current!);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return cars;
}
