
import React from 'react';
import { LANES_CONFIG, COLORS } from '../constants';
import { Car } from '../types';

interface GameWorldProps {
  playerPos: { x: number; y: number };
  cars: Car[];
  isGameOver: boolean;
}

const GameWorld: React.FC<GameWorldProps> = ({ playerPos, cars, isGameOver }) => {
  return (
    <div className="relative w-[1000px] h-[800px] perspective-[1000px] overflow-hidden">
      <div className="iso-container absolute inset-0 origin-center flex flex-col-reverse justify-start items-center p-20">
        {LANES_CONFIG.map((lane, idx) => (
          <div
            key={lane.id}
            className={`relative w-[1200px] h-16 mb-0 ${
              lane.type === 'GRASS' ? 'bg-[#a3e635]' : 'bg-[#334155]'
            } border-b border-black/10`}
            style={{ 
              transform: `translateZ(${idx * 0.1}px)`,
              boxShadow: lane.type === 'ROAD' ? 'inset 0 10px 15px -3px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {/* Lane Details */}
            {lane.type === 'ROAD' && (
              <div className="absolute top-1/2 left-0 w-full h-[2px] border-t-2 border-dashed border-white/20 -translate-y-1/2" />
            )}

            {/* Static decorations (Trees on Grass) */}
            {lane.type === 'GRASS' && idx % 3 === 0 && (
              <>
                <Tree x={5} />
                <Tree x={25} />
                <Tree x={75} />
                <Tree x={95} />
              </>
            )}

            {/* Cars */}
            {cars.filter(c => c.laneIndex === idx).map(car => (
              <div
                key={car.id}
                className="absolute top-1/2 -translate-y-1/2 transition-transform duration-300"
                style={{ left: `${car.x}%`, transform: `translateY(-50%)` }}
              >
                <CarSprite type={car.type} color={car.color} flipped={LANES_CONFIG[idx].speed! < 0} />
              </div>
            ))}

            {/* Player */}
            {playerPos.y === idx && (
              <div
                className="absolute top-1/2 -translate-y-1/2 z-50 transition-all duration-150"
                style={{ 
                  left: `${(playerPos.x / 10) * 100}%`,
                  transform: `translateY(-50%) translateZ(10px) ${isGameOver ? 'rotateX(90deg)' : ''}` 
                }}
              >
                <FluffleSprite />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Tree: React.FC<{ x: number }> = ({ x }) => (
  <div className="absolute -top-12" style={{ left: `${x}%` }}>
    <div className="w-8 h-12 bg-emerald-700 rounded-t-full relative shadow-lg">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-orange-950" />
    </div>
  </div>
);

const CarSprite: React.FC<{ type: string; color: string; flipped: boolean }> = ({ type, color, flipped }) => {
  const width = type === 'van' ? 'w-24' : type === 'jeep' ? 'w-20' : 'w-16';
  const height = type === 'van' ? 'h-10' : 'h-8';
  return (
    <div className={`${width} ${height} rounded-lg relative shadow-xl transform ${flipped ? 'scale-x-[-1]' : ''}`} style={{ backgroundColor: color }}>
      <div className="absolute top-1 left-2 right-2 h-1/2 bg-sky-100/30 rounded-t" />
      <div className="absolute bottom-1 left-1 w-4 h-4 bg-gray-900 rounded-full" />
      <div className="absolute bottom-1 right-1 w-4 h-4 bg-gray-900 rounded-full" />
    </div>
  );
};

const FluffleSprite: React.FC = () => (
  <div className="w-10 h-10 relative flex items-center justify-center">
    {/* Body */}
    <div className="w-8 h-8 bg-white rounded-full relative shadow-md">
      {/* Ears */}
      <div className="absolute -top-4 left-0 w-3 h-6 bg-white rounded-t-full border-r border-gray-100" />
      <div className="absolute -top-4 right-0 w-3 h-6 bg-white rounded-t-full border-l border-gray-100" />
      {/* Eyes */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full" />
    </div>
    {/* Shadow */}
    <div className="absolute -bottom-1 w-6 h-2 bg-black/20 rounded-full" />
  </div>
);

export default GameWorld;
