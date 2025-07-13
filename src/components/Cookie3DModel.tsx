import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Cookie } from '../types/game';

interface Cookie3DModelProps {
  cookie: Cookie;
  onClick?: () => void;
}

export const Cookie3DModel: React.FC<Cookie3DModelProps> = React.memo(({ cookie, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const cookieRef = useRef<THREE.Mesh>(null);
  const { type, health, maxHealth, isSelected, x, y } = cookie;
  const healthPercentage = (health / maxHealth) * 100;

  // Convert 2D position to 3D
  const position3D: [number, number, number] = useMemo(() => [
    (x - 400) / 50, // Center and scale
    0.5, // Height above ground
    (y - 300) / 50  // Center and scale
  ], [x, y]);

  // Create cookie geometry (optimized)
  const cookieGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(type.size / 100, type.size / 100, 0.25, 16); // Reduced segments from 32 to 16
    return geometry;
  }, [type.size]);

  // Create materials (optimized)
  const cookieMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(type.color),
      roughness: 0.8,
      metalness: 0.1,
    });
    return material;
  }, [type.color]);

  const chipMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(type.secondaryColor),
      roughness: 0.6,
      metalness: 0.2,
    });
  }, [type.secondaryColor]);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position3D[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Magical element specific animations (simplified)
      if (type.magicalElement === 'fire') {
        groupRef.current.rotation.y += 0.02;
      } else if (type.magicalElement === 'lightning') {
        groupRef.current.rotation.y += 0.03;
      }

      // Selection glow effect
      if (isSelected && cookieRef.current) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        cookieRef.current.scale.setScalar(scale);
      } else if (cookieRef.current) {
        cookieRef.current.scale.setScalar(1);
      }
    }
  });

  // Generate fewer chocolate chip positions for better performance
  const chipPositions = useMemo(() => {
    const positions = [];
    const numChips = 4; // Reduced from 8-12 to 4
    for (let i = 0; i < numChips; i++) {
      const angle = (i / numChips) * Math.PI * 2;
      const radius = 0.4 * (type.size / 100);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.13;
      positions.push([x, y, z]);
    }
    return positions;
  }, [type.size]);

  return (
    <group ref={groupRef} position={position3D} onClick={onClick}>
      {/* Main Cookie Body */}
      <mesh ref={cookieRef} geometry={cookieGeometry} material={cookieMaterial} />

      {/* Chocolate Chips (reduced) */}
      {chipPositions.map((pos, i) => (
        <Sphere key={i} args={[0.03]} position={pos as [number, number, number]}>
          <primitive object={chipMaterial} />
        </Sphere>
      ))}

      {/* Simplified Magical Element Effects */}
      {type.magicalElement === 'fire' && (
        <group>
          {/* Reduced fire particles */}
          {[...Array(3)].map((_, i) => (
            <Sphere 
              key={i}
              args={[0.02]} 
              position={[
                (Math.random() - 0.5) * 0.4,
                0.3 + Math.random() * 0.2,
                (Math.random() - 0.5) * 0.4
              ]}
            >
              <meshBasicMaterial 
                color="#ff4500"
                transparent 
                opacity={0.7}
                emissive="#ff4500"
                emissiveIntensity={0.8}
              />
            </Sphere>
          ))}
        </group>
      )}

      {type.magicalElement === 'ice' && (
        <group>
          {/* Simplified ice crystals */}
          {[...Array(2)].map((_, i) => (
            <Box 
              key={i}
              args={[0.05, 0.2, 0.05]} 
              position={[
                Math.cos((i / 2) * Math.PI * 2) * 0.3,
                0.4,
                Math.sin((i / 2) * Math.PI * 2) * 0.3
              ]}
            >
              <meshBasicMaterial 
                color="#87ceeb" 
                transparent 
                opacity={0.8}
                emissive="#87ceeb"
                emissiveIntensity={0.4}
              />
            </Box>
          ))}
        </group>
      )}

      {type.magicalElement === 'lightning' && (
        <group>
          {/* Simplified lightning bolt */}
          <Box args={[0.02, 0.3, 0.02]} position={[0, 0.5, 0]}>
            <meshBasicMaterial 
              color="#ffff00" 
              emissive="#ffff00"
              emissiveIntensity={1.2}
            />
          </Box>
        </group>
      )}

      {/* Health Bar - 3D representation */}
      <group position={[0, -0.4, 0]}>
        <Box args={[0.8, 0.06, 0.12]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        <Box 
          args={[0.8 * (healthPercentage / 100), 0.07, 0.13]} 
          position={[0.4 * (healthPercentage / 100 - 1), 0, 0]}
        >
          <meshStandardMaterial 
            color={healthPercentage > 60 ? "#22c55e" : healthPercentage > 30 ? "#eab308" : "#ef4444"} 
            emissive={healthPercentage > 60 ? "#22c55e" : healthPercentage > 30 ? "#eab308" : "#ef4444"}
            emissiveIntensity={0.2}
          />
        </Box>
      </group>

      {/* Cookie Name */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {type.name}
      </Text>

      {/* Selection Ring (simplified) */}
      {isSelected && (
        <Cylinder args={[type.size / 60, type.size / 60, 0.03, 16]} position={[0, -0.1, 0]}>
          <meshBasicMaterial 
            color={type.color} 
            transparent 
            opacity={0.6}
            emissive={type.color}
            emissiveIntensity={0.4}
          />
        </Cylinder>
      )}

      {/* Magical Aura */}
      <Sphere args={[type.size / 60]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color={type.color} 
          transparent 
          opacity={0.1}
          emissive={type.color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </group>
  );
});

Cookie3DModel.displayName = 'Cookie3DModel';