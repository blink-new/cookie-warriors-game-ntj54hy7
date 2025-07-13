import React from 'react';
import { CakeMonster as CakeMonsterType } from '../types/game';

interface CakeMonsterProps {
  monster: CakeMonsterType;
}

export const CakeMonster: React.FC<CakeMonsterProps> = ({ monster }) => {
  const { health, maxHealth, x, y, size, type } = monster;
  const healthPercentage = (health / maxHealth) * 100;

  const getMonsterColor = () => {
    switch (type) {
      case 'boss':
        return { primary: '#8B0000', secondary: '#FF1493', emoji: '🎂' };
      default:
        return { primary: '#8B4513', secondary: '#DEB887', emoji: '🧁' };
    }
  };

  const colors = getMonsterColor();

  return (
    <div
      className="absolute transition-all duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      {/* Monster Body */}
      <div
        className="relative w-full h-full rounded-lg border-4 border-opacity-80 shadow-lg float"
        style={{
          background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
          borderColor: colors.primary,
        }}
      >
        {/* Monster Face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">{colors.emoji}</span>
        </div>

        {/* Evil Eyes */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>

        {/* Menacing Aura */}
        <div 
          className="absolute -inset-1 rounded-lg opacity-30 animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${colors.primary}60, transparent 70%)`,
          }}
        ></div>

        {/* Boss Crown */}
        {type === 'boss' && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="text-yellow-400 text-lg">👑</span>
          </div>
        )}
      </div>

      {/* Health Bar */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full bg-red-500"
          style={{ width: `${healthPercentage}%` }}
        ></div>
      </div>

      {/* Monster Type Label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-300 text-center whitespace-nowrap">
        {type === 'boss' ? 'Cake Boss' : 'Cake Monster'}
      </div>
    </div>
  );
};