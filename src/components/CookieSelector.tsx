import React from 'react';
import { CookieType } from '../types/game';
import { COOKIE_TYPES } from '../data/cookieTypes';

interface CookieSelectorProps {
  selectedType: string;
  onSelectType: (typeId: string) => void;
}

export const CookieSelector: React.FC<CookieSelectorProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-yellow-500 border-opacity-30">
      <h3 className="text-yellow-400 font-semibold mb-3 text-center">Choose Your Cookie Warrior</h3>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {COOKIE_TYPES.map((cookieType) => (
          <CookieTypeCard
            key={cookieType.id}
            cookieType={cookieType}
            isSelected={selectedType === cookieType.id}
            onClick={() => onSelectType(cookieType.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface CookieTypeCardProps {
  cookieType: CookieType;
  isSelected: boolean;
  onClick: () => void;
}

const CookieTypeCard: React.FC<CookieTypeCardProps> = ({ cookieType, isSelected, onClick }) => {
  return (
    <div
      className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
        isSelected 
          ? 'border-yellow-400 bg-yellow-400 bg-opacity-20 scale-105' 
          : 'border-gray-600 hover:border-gray-400 hover:bg-gray-800 hover:bg-opacity-50'
      }`}
      onClick={onClick}
    >
      {/* Cookie Preview */}
      <div className="flex items-center justify-center mb-2">
        <div
          className="w-12 h-12 rounded-full border-2 border-opacity-80 shadow-lg relative float"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${cookieType.secondaryColor}, ${cookieType.color})`,
            borderColor: cookieType.secondaryColor,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg sparkle">{cookieType.emoji}</span>
          </div>
          {/* Cookie chips */}
          <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-white opacity-60"></div>
          <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-white opacity-60"></div>
        </div>
      </div>

      {/* Cookie Info */}
      <div className="text-center">
        <h4 className="text-white font-medium text-sm mb-1">{cookieType.name}</h4>
        <p className="text-gray-300 text-xs mb-2">{cookieType.magicalElement}</p>
        
        {/* Stats */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">HP:</span>
            <span className="text-green-400">{cookieType.health}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">DMG:</span>
            <span className="text-red-400">{cookieType.damage}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">SPD:</span>
            <span className="text-blue-400">{cookieType.speed}</span>
          </div>
        </div>

        {/* Ability */}
        <div className="mt-2 p-1 bg-black bg-opacity-30 rounded text-xs">
          <span className="text-yellow-300">{cookieType.ability}</span>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-black text-xs">✓</span>
        </div>
      )}
    </div>
  );
};