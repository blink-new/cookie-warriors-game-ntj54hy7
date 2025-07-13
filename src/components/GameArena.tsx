import React, { useState, useEffect, useCallback } from 'react';
import { Cookie, CakeMonster as CakeMonsterType, GameState } from '../types/game';
import { COOKIE_TYPES } from '../data/cookieTypes';
import { CookieWarrior } from './CookieWarrior';
import { CakeMonster } from './CakeMonster';
import { CookieSelector } from './CookieSelector';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;

export const GameArena: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    cookies: [],
    monsters: [],
    score: 0,
    wave: 1,
    gameStatus: 'menu',
    selectedCookieType: 'fire-cookie'
  });

  const [selectedCookie, setSelectedCookie] = useState<string | null>(null);

  // Generate random position within arena bounds
  const getRandomPosition = useCallback((margin = 50) => ({
    x: Math.random() * (ARENA_WIDTH - margin * 2) + margin,
    y: Math.random() * (ARENA_HEIGHT - margin * 2) + margin,
  }), []);

  // Create a new cookie
  const createCookie = useCallback((typeId: string, position?: { x: number; y: number }) => {
    const cookieType = COOKIE_TYPES.find(t => t.id === typeId);
    if (!cookieType) return null;

    const pos = position || getRandomPosition();
    
    return {
      id: `cookie-${Date.now()}-${Math.random()}`,
      type: cookieType,
      x: pos.x,
      y: pos.y,
      health: cookieType.health,
      maxHealth: cookieType.health,
      isSelected: false,
      direction: Math.random() * Math.PI * 2,
      lastAttack: 0,
    };
  }, [getRandomPosition]);

  // Create a new monster
  const createMonster = useCallback((type: 'basic' | 'boss' = 'basic') => {
    const pos = getRandomPosition();
    
    return {
      id: `monster-${Date.now()}-${Math.random()}`,
      x: pos.x,
      y: pos.y,
      health: type === 'boss' ? 200 : 80,
      maxHealth: type === 'boss' ? 200 : 80,
      type,
      size: type === 'boss' ? 60 : 45,
      speed: type === 'boss' ? 1 : 2,
      damage: type === 'boss' ? 30 : 15,
      lastAttack: 0,
    };
  }, [getRandomPosition]);

  // Start the game
  const startGame = useCallback(() => {
    const initialCookies = [
      createCookie('fire-cookie', { x: 150, y: 300 }),
      createCookie('ice-cookie', { x: 200, y: 250 }),
      createCookie('lightning-cookie', { x: 100, y: 350 }),
    ].filter(Boolean) as Cookie[];

    const initialMonsters = [
      createMonster('basic'),
      createMonster('basic'),
    ];

    setGameState(prev => ({
      ...prev,
      cookies: initialCookies,
      monsters: initialMonsters,
      gameStatus: 'playing',
      score: 0,
      wave: 1,
    }));
  }, [createCookie, createMonster]);

  // Add a new cookie to the battlefield
  const addCookie = useCallback((x: number, y: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const newCookie = createCookie(gameState.selectedCookieType, { x, y });
    if (newCookie) {
      setGameState(prev => ({
        ...prev,
        cookies: [...prev.cookies, newCookie],
      }));
    }
  }, [gameState.selectedCookieType, gameState.gameStatus, createCookie]);

  // Handle arena click
  const handleArenaClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addCookie(x, y);
  }, [addCookie]);

  // Select a cookie
  const selectCookie = useCallback((cookieId: string) => {
    setSelectedCookie(cookieId);
    setGameState(prev => ({
      ...prev,
      cookies: prev.cookies.map(cookie => ({
        ...cookie,
        isSelected: cookie.id === cookieId,
      })),
    }));
  }, []);

  // Game loop for movement and combat
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const newCookies = [...prev.cookies];
        const newMonsters = [...prev.monsters];

        // Simple AI: Move monsters towards cookies
        newMonsters.forEach(monster => {
          const nearestCookie = newCookies.reduce((nearest, cookie) => {
            const distToMonster = Math.sqrt(
              Math.pow(cookie.x - monster.x, 2) + Math.pow(cookie.y - monster.y, 2)
            );
            const distToNearest = nearest ? Math.sqrt(
              Math.pow(nearest.x - monster.x, 2) + Math.pow(nearest.y - monster.y, 2)
            ) : Infinity;
            
            return distToMonster < distToNearest ? cookie : nearest;
          }, null as Cookie | null);

          if (nearestCookie) {
            const dx = nearestCookie.x - monster.x;
            const dy = nearestCookie.y - monster.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              monster.x += (dx / distance) * monster.speed;
              monster.y += (dy / distance) * monster.speed;
            }
          }
        });

        return {
          ...prev,
          cookies: newCookies,
          monsters: newMonsters,
        };
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState.gameStatus]);

  // Spawn new monsters periodically
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const spawnTimer = setInterval(() => {
      setGameState(prev => {
        if (prev.monsters.length < 5) {
          const newMonster = createMonster(Math.random() < 0.1 ? 'boss' : 'basic');
          return {
            ...prev,
            monsters: [...prev.monsters, newMonster],
          };
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(spawnTimer);
  }, [gameState.gameStatus, createMonster]);

  if (gameState.gameStatus === 'menu') {
    return (
      <div className="min-h-screen enchanted-bg flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="game-title text-6xl text-yellow-400 mb-4 magical-glow">
            Cookie Warriors
          </h1>
          <h2 className="text-2xl text-yellow-300 mb-8">Enchanted Forest Battle</h2>
          
          <div className="mb-8">
            <p className="text-white text-lg mb-4">
              Choose your magical cookie warriors and defend the enchanted forest from the evil cake monsters!
            </p>
            <p className="text-gray-300">
              Click on the battlefield to deploy your chosen cookie warrior. Each cookie has unique magical abilities!
            </p>
          </div>

          {/* Cookie Preview */}
          <div className="mb-8 flex justify-center space-x-4">
            {COOKIE_TYPES.slice(0, 4).map((cookieType) => (
              <div key={cookieType.id} className="text-center">
                <div
                  className="w-16 h-16 rounded-full border-4 border-opacity-80 shadow-lg mx-auto mb-2 cookie-bounce"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${cookieType.secondaryColor}, ${cookieType.color})`,
                    borderColor: cookieType.secondaryColor,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl sparkle">{cookieType.emoji}</span>
                  </div>
                </div>
                <p className="text-sm text-yellow-300">{cookieType.name}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startGame}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 magical-glow"
          >
            Start Battle!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen enchanted-bg p-4">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <h1 className="game-title text-3xl text-yellow-400">Cookie Warriors</h1>
          <div className="flex space-x-6 mt-2">
            <span>Score: <span className="text-yellow-300">{gameState.score}</span></span>
            <span>Wave: <span className="text-yellow-300">{gameState.wave}</span></span>
            <span>Cookies: <span className="text-green-300">{gameState.cookies.length}</span></span>
            <span>Monsters: <span className="text-red-300">{gameState.monsters.length}</span></span>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'menu' }))}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
          >
            Menu
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Cookie Selector */}
        <div className="w-80">
          <CookieSelector
            selectedType={gameState.selectedCookieType}
            onSelectType={(typeId) => setGameState(prev => ({ ...prev, selectedCookieType: typeId }))}
          />
        </div>

        {/* Game Arena */}
        <div className="flex-1">
          <div
            className="relative bg-gradient-to-b from-green-900 to-green-800 border-4 border-yellow-500 border-opacity-50 rounded-lg overflow-hidden cursor-crosshair"
            style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}
            onClick={handleArenaClick}
          >
            {/* Forest Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 text-4xl">🌲</div>
              <div className="absolute top-20 right-20 text-3xl">🌳</div>
              <div className="absolute bottom-20 left-20 text-3xl">🌿</div>
              <div className="absolute bottom-10 right-10 text-4xl">🌲</div>
              <div className="absolute top-1/2 left-1/4 text-2xl">🍄</div>
              <div className="absolute top-1/3 right-1/3 text-2xl">🌸</div>
            </div>

            {/* Magical Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                ></div>
              ))}
            </div>

            {/* Cookies */}
            {gameState.cookies.map((cookie) => (
              <CookieWarrior
                key={cookie.id}
                cookie={cookie}
                onClick={() => selectCookie(cookie.id)}
              />
            ))}

            {/* Monsters */}
            {gameState.monsters.map((monster) => (
              <CakeMonster key={monster.id} monster={monster} />
            ))}

            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
              Click anywhere to deploy your selected cookie warrior!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};