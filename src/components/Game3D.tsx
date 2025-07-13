import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Cookie, CakeMonster as CakeMonsterType, GameState } from '../types/game';
import { COOKIE_TYPES } from '../data/cookieTypes';
import { CookieSelector } from './CookieSelector';
import { Cookie3DModel } from './Cookie3DModel';
import { CakeMonster3DModel } from './CakeMonster3DModel';

// 3D Forest Environment
const ForestEnvironment: React.FC = () => {
  return (
    <group>
      {/* Ground */}
      <Box args={[20, 0.1, 15]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#2D5016" />
      </Box>

      {/* Trees */}
      {[...Array(8)].map((_, i) => {
        const x = (Math.random() - 0.5) * 18;
        const z = (Math.random() - 0.5) * 13;
        const height = 2 + Math.random() * 2;
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Trunk */}
            <Cylinder args={[0.2, 0.3, height]} position={[0, height / 2, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Cylinder>
            {/* Leaves */}
            <Sphere args={[0.8]} position={[0, height + 0.5, 0]}>
              <meshStandardMaterial color="#228B22" />
            </Sphere>
          </group>
        );
      })}

      {/* Magical Mushrooms */}
      {[...Array(5)].map((_, i) => {
        const x = (Math.random() - 0.5) * 16;
        const z = (Math.random() - 0.5) * 11;
        
        return (
          <group key={i} position={[x, 0, z]}>
            <Cylinder args={[0.05, 0.08, 0.3]} position={[0, 0.15, 0]}>
              <meshStandardMaterial color="#F5F5DC" />
            </Cylinder>
            <Sphere args={[0.15]} position={[0, 0.35, 0]}>
              <meshStandardMaterial 
                color="#FF6347" 
                emissive="#FF6347"
                emissiveIntensity={0.1}
              />
            </Sphere>
            {/* White spots */}
            <Sphere args={[0.03]} position={[0.08, 0.35, 0.08]}>
              <meshStandardMaterial color="white" />
            </Sphere>
            <Sphere args={[0.02]} position={[-0.06, 0.38, 0.06]}>
              <meshStandardMaterial color="white" />
            </Sphere>
          </group>
        );
      })}

      {/* Magical Particles */}
      {[...Array(20)].map((_, i) => {
        const x = (Math.random() - 0.5) * 20;
        const y = Math.random() * 3 + 1;
        const z = (Math.random() - 0.5) * 15;
        
        return (
          <Sphere key={i} args={[0.02]} position={[x, y, z]}>
            <meshBasicMaterial 
              color="#FFD700" 
              emissive="#FFD700"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </Sphere>
        );
      })}
    </group>
  );
};

// Camera Controller for clicking
const CameraController: React.FC<{ onArenaClick: (x: number, y: number) => void }> = ({ onArenaClick }) => {
  const { camera, raycaster, scene } = useThree();
  
  const handleClick = useCallback((event: MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera({ x, y }, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      // Convert 3D position back to 2D game coordinates
      const gameX = (point.x * 50) + 400;
      const gameY = (point.z * 50) + 300;
      onArenaClick(gameX, gameY);
    }
  }, [camera, raycaster, scene, onArenaClick]);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [handleClick]);

  return null;
};

// Main 3D Game Component
export const Game3D: React.FC = () => {
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
  const getRandomPosition = useCallback(() => ({
    x: Math.random() * 600 + 100,
    y: Math.random() * 400 + 100,
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
      createCookie('fire-cookie', { x: 250, y: 300 }),
      createCookie('ice-cookie', { x: 300, y: 250 }),
      createCookie('lightning-cookie', { x: 200, y: 350 }),
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
            Cookie Warriors 3D
          </h1>
          <h2 className="text-2xl text-yellow-300 mb-8">Enchanted Forest Battle</h2>
          
          <div className="mb-8">
            <p className="text-white text-lg mb-4">
              Experience the magical cookie warriors in stunning 3D! Battle against menacing cake monsters in an immersive enchanted forest.
            </p>
            <p className="text-gray-300">
              Click on the 3D battlefield to deploy your chosen cookie warrior. Each cookie has unique magical abilities and 3D models!
            </p>
          </div>

          <button
            onClick={startGame}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 magical-glow"
          >
            Start 3D Battle!
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
          <h1 className="game-title text-3xl text-yellow-400">Cookie Warriors 3D</h1>
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

        {/* 3D Game Arena */}
        <div className="flex-1">
          <div className="w-full h-[600px] border-4 border-yellow-500 border-opacity-50 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [0, 8, 12], fov: 60 }}
              style={{ background: 'linear-gradient(to bottom, #1a2e0a, #2d5016)' }}
            >
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1} 
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFD700" />

              {/* Environment */}
              <ForestEnvironment />

              {/* Game Objects */}
              {gameState.cookies.map((cookie) => (
                <Cookie3DModel
                  key={cookie.id}
                  cookie={cookie}
                  onClick={() => selectCookie(cookie.id)}
                />
              ))}

              {gameState.monsters.map((monster) => (
                <CakeMonster3DModel key={monster.id} monster={monster} />
              ))}

              {/* Camera Controls */}
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2}
                minDistance={5}
                maxDistance={20}
              />

              {/* Click Handler */}
              <CameraController onArenaClick={addCookie} />

              {/* Instructions */}
              <Text
                position={[-8, 4, 0]}
                fontSize={0.3}
                color="white"
                anchorX="left"
                anchorY="middle"
              >
                Click to deploy cookies!
              </Text>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
};