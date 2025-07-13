import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CakeMonster } from '../types/game';

interface CakeMonster3DModelProps {
  monster: CakeMonster;
}

export const CakeMonster3DModel: React.FC<CakeMonster3DModelProps> = React.memo(({ monster }) => {
  const groupRef = useRef<THREE.Group>(null);
  const cakeRef = useRef<THREE.Mesh>(null);
  const { health, maxHealth, x, y, size, type } = monster;
  const healthPercentage = (health / maxHealth) * 100;

  // Convert 2D position to 3D
  const position3D: [number, number, number] = useMemo(() => [
    (x - 400) / 50,
    0.5,
    (y - 300) / 50
  ], [x, y]);

  // Create cake geometry (optimized)
  const cakeGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(size / 100, size / 120, size / 60, 12); // Reduced segments from 16 to 12
  }, [size]);

  const getMonsterColors = () => {
    switch (type) {
      case 'boss':
        return { 
          primary: '#8B0000', 
          secondary: '#FF1493', 
          frosting: '#FFB6C1',
          decoration: '#FFD700'
        };
      default:
        return { 
          primary: '#8B4513', 
          secondary: '#DEB887', 
          frosting: '#F5DEB3',
          decoration: '#FF69B4'
        };
    }
  };

  const colors = getMonsterColors();

  // Create materials (optimized)
  const cakeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.primary),
      roughness: 0.6,
      metalness: 0.1,
    });
  }, [colors.primary]);

  const frostingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.frosting),
      roughness: 0.3,
      metalness: 0.05,
    });
  }, [colors.frosting]);

  useFrame((state) => {
    if (groupRef.current) {
      // Menacing floating animation
      groupRef.current.position.y = position3D[1] + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      groupRef.current.rotation.y += 0.01;
      
      // Pulsing effect for boss
      if (type === 'boss' && cakeRef.current) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        cakeRef.current.scale.setScalar(scale);
      }
    }
  });

  // Generate fewer decoration positions for better performance
  const decorationPositions = useMemo(() => {
    const positions = [];
    const numDecorations = type === 'boss' ? 6 : 4; // Reduced from 12/8 to 6/4
    for (let i = 0; i < numDecorations; i++) {
      const angle = (i / numDecorations) * Math.PI * 2;
      const radius = 0.7 * (size / 100);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (size / 120) + 0.05;
      positions.push([x, y, z]);
    }
    return positions;
  }, [size, type]);

  return (
    <group ref={groupRef} position={position3D}>
      {/* Main Cake Body */}
      <mesh ref={cakeRef} geometry={cakeGeometry} material={cakeMaterial} />

      {/* Cake Layers */}
      <Cylinder 
        args={[size / 110, size / 110, 0.08]} 
        position={[0, size / 120, 0]}
      >
        <primitive object={frostingMaterial} />
      </Cylinder>

      {/* Top Frosting Layer */}
      <Cylinder 
        args={[size / 120, size / 120, 0.06]} 
        position={[0, (size / 120) + 0.08, 0]}
      >
        <meshStandardMaterial 
          color={colors.secondary} 
          roughness={0.2}
          metalness={0.1}
        />
      </Cylinder>

      {/* Cake Decorations (reduced) */}
      {decorationPositions.map((pos, i) => (
        <Sphere 
          key={i} 
          args={[0.02]} 
          position={pos as [number, number, number]}
        >
          <meshStandardMaterial 
            color={i % 3 === 0 ? colors.decoration : i % 3 === 1 ? "#FF0000" : "#00FF00"} 
            emissive={i % 3 === 0 ? colors.decoration : i % 3 === 1 ? "#FF0000" : "#00FF00"}
            emissiveIntensity={0.3}
          />
        </Sphere>
      ))}

      {/* Evil Eyes */}
      <group position={[0, size / 80, size / 100]}>
        <Sphere args={[0.06]} position={[0.12, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
        <Sphere args={[0.06]} position={[-0.12, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
        {/* Pupils */}
        <Sphere args={[0.03]} position={[0.12, 0, 0.05]}>
          <meshBasicMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={0.8} 
          />
        </Sphere>
        <Sphere args={[0.03]} position={[-0.12, 0, 0.05]}>
          <meshBasicMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={0.8} 
          />
        </Sphere>
      </group>

      {/* Evil Mouth */}
      <Box 
        args={[0.15, 0.03, 0.08]} 
        position={[0, size / 120, size / 90]}
      >
        <meshBasicMaterial color="#000000" />
      </Box>

      {/* Simplified Sharp Teeth */}
      {[...Array(3)].map((_, i) => (
        <Box 
          key={i}
          args={[0.02, 0.06, 0.02]} 
          position={[
            -0.03 + (i * 0.03),
            (size / 120) - 0.03,
            (size / 90) + 0.02
          ]}
        >
          <meshStandardMaterial color="#ffffff" />
        </Box>
      ))}

      {/* Boss Crown (simplified) */}
      {type === 'boss' && (
        <group position={[0, size / 40, 0]}>
          <Cylinder args={[0.18, 0.12, 0.12, 6]}>
            <meshStandardMaterial 
              color="#ffd700" 
              metalness={0.9}
              roughness={0.1}
              emissive="#ffd700"
              emissiveIntensity={0.3}
            />
          </Cylinder>
          {/* Reduced crown jewels */}
          {[...Array(3)].map((_, i) => (
            <Sphere 
              key={i}
              args={[0.02]} 
              position={[
                Math.cos((i / 3) * Math.PI * 2) * 0.15,
                0.08,
                Math.sin((i / 3) * Math.PI * 2) * 0.15
              ]}
            >
              <meshBasicMaterial 
                color={i % 2 === 0 ? "#ff0000" : "#0000ff"} 
                emissive={i % 2 === 0 ? "#ff0000" : "#0000ff"}
                emissiveIntensity={0.6}
              />
            </Sphere>
          ))}
        </group>
      )}

      {/* Menacing Aura */}
      <Sphere args={[size / 60]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color={colors.primary} 
          transparent 
          opacity={0.15}
          emissive={colors.primary}
          emissiveIntensity={0.4}
        />
      </Sphere>

      {/* Reduced Dark Energy Particles */}
      {[...Array(type === 'boss' ? 4 : 2)].map((_, i) => (
        <Sphere 
          key={i}
          args={[0.015]} 
          position={[
            (Math.random() - 0.5) * (size / 40),
            Math.random() * (size / 60) + 0.2,
            (Math.random() - 0.5) * (size / 40)
          ]}
        >
          <meshBasicMaterial 
            color="#8B0000" 
            transparent 
            opacity={0.8}
            emissive="#8B0000"
            emissiveIntensity={0.6}
          />
        </Sphere>
      ))}

      {/* Health Bar */}
      <group position={[0, -size / 60, 0]}>
        <Box args={[0.8, 0.06, 0.12]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        <Box 
          args={[0.8 * (healthPercentage / 100), 0.07, 0.13]} 
          position={[0.4 * (healthPercentage / 100 - 1), 0, 0]}
        >
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444"
            emissiveIntensity={0.3}
          />
        </Box>
      </group>

      {/* Monster Label */}
      <Text
        position={[0, -size / 40, 0]}
        fontSize={0.1}
        color="#ff6666"
        anchorX="center"
        anchorY="middle"
      >
        {type === 'boss' ? 'Cake Boss' : 'Cake Monster'}
      </Text>
    </group>
  );
});

CakeMonster3DModel.displayName = 'CakeMonster3DModel';