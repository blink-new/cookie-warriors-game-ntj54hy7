import React from 'react';
import { Cookie } from '../types/game';

interface CookieWarriorProps {
  cookie: Cookie;
  onClick?: () => void;
}

export const CookieWarrior: React.FC<CookieWarriorProps> = ({ cookie, onClick }) => {
  const { type, health, maxHealth, isSelected, x, y } = cookie;
  const healthPercentage = (health / maxHealth) * 100;

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-110 magical-glow' : 'hover:scale-105'
      } cookie-bounce`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${type.size}px`,
        height: `${type.size}px`,
        transform: `translate(-50%, -50%)`,
      }}
      onClick={onClick}
    >
      {/* Cookie Body */}
      <div
        className="relative w-full h-full rounded-full border-4 border-opacity-80 shadow-lg"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${type.secondaryColor}, ${type.color})`,
          borderColor: type.secondaryColor,
        }}
      >
        {/* Magical Element Symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-2xl sparkle"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}
          >
            {type.emoji}
          </span>
        </div>

        {/* Cookie Chips/Decorations */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white opacity-60"></div>
        <div className="absolute bottom-3 right-2 w-1.5 h-1.5 rounded-full bg-white opacity-60"></div>
        <div className="absolute top-4 right-3 w-1 h-1 rounded-full bg-white opacity-60"></div>

        {/* Selection Ring */}
        {isSelected && (
          <div 
            className="absolute -inset-2 rounded-full border-2 border-dashed animate-spin"
            style={{ borderColor: type.color, animationDuration: '3s' }}
          ></div>
        )}

        {/* Magical Aura */}
        <div 
          className="absolute -inset-1 rounded-full opacity-30 animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${type.color}40, transparent 70%)`,
          }}
        ></div>
      </div>

      {/* Health Bar */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${healthPercentage}%`,
            background: healthPercentage > 60 ? '#22c55e' : healthPercentage > 30 ? '#eab308' : '#ef4444'
          }}
        ></div>
      </div>

      {/* Cookie Name */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white text-center whitespace-nowrap">
        {type.name}
      </div>
    </div>
  );
};