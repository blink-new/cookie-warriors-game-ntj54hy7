import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Cookie } from '../types/game';

interface Cookie3DModelProps {
  cookie: Cookie;
  onClick?: () => void;
}

export const Cookie3DModel: React.FC<Cookie3DModelProps> = ({ cookie, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const cookieRef = useRef<THREE.Mesh>(null);
  const { type, health, maxHealth, isSelected, x, y } = cookie;
  const healthPercentage = (health / maxHealth) * 100;

  // Convert 2D position to 3D
  const position3D: [number, number, number] = [
    (x - 400) / 50, // Center and scale
    0.5, // Height above ground
    (y - 300) / 50  // Center and scale
  ];

  // Create cookie texture pattern
  const cookieGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(type.size / 100, type.size / 100, 0.25, 32);
    return geometry;
  }, [type.size]);

  // Create materials
  const cookieMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(type.color),
      roughness: 0.8,
      metalness: 0.1,
      bumpScale: 0.1,
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
      
      // Magical element specific animations
      if (type.magicalElement === 'fire') {
        groupRef.current.rotation.y += 0.02;
      } else if (type.magicalElement === 'ice') {
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
        groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime) * 0.1;
      } else if (type.magicalElement === 'lightning') {
        groupRef.current.rotation.y += 0.03;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
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

  // Generate chocolate chip positions
  const chipPositions = useMemo(() => {
    const positions = [];
    const numChips = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numChips; i++) {
      const angle = (i / numChips) * Math.PI * 2 + Math.random() * 0.5;
      const radius = (0.3 + Math.random() * 0.4) * (type.size / 100);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.13 + Math.random() * 0.02;
      positions.push([x, y, z]);
    }
    return positions;
  }, [type.size]);

  return (
    <group ref={groupRef} position={position3D} onClick={onClick}>
      {/* Main Cookie Body */}
      <mesh ref={cookieRef} geometry={cookieGeometry} material={cookieMaterial}>
        {/* Cookie surface bumps for texture */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = (0.2 + Math.random() * 0.3) * (type.size / 100);
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <Sphere 
              key={i}
              args={[0.02]} 
              position={[x, 0.13, z]}
            >
              <meshStandardMaterial 
                color={type.color} 
                roughness={0.9}
                transparent
                opacity={0.3}
              />
            </Sphere>
          );
        })}
      </mesh>

      {/* Chocolate Chips */}
      {chipPositions.map((pos, i) => (
        <Sphere key={i} args={[0.03 + Math.random() * 0.02]} position={pos as [number, number, number]}>
          <primitive object={chipMaterial} />
        </Sphere>
      ))}

      {/* Magical Element Effects */}
      {type.magicalElement === 'fire' && (
        <group>
          {/* Fire particles */}
          {[...Array(6)].map((_, i) => (
            <Sphere 
              key={i}
              args={[0.02 + Math.random() * 0.01]} 
              position={[
                (Math.random() - 0.5) * 0.4,
                0.3 + Math.random() * 0.2,
                (Math.random() - 0.5) * 0.4
              ]}
            >
              <meshBasicMaterial 
                color={i % 2 === 0 ? "#ff4500" : "#ff6600"} 
                transparent 
                opacity={0.7}
                emissive={i % 2 === 0 ? "#ff4500" : "#ff6600"}
                emissiveIntensity={0.8}
              />
            </Sphere>
          ))}
        </group>
      )}

      {type.magicalElement === 'ice' && (
        <group>
          {/* Ice crystals */}
          {[...Array(4)].map((_, i) => (
            <Box 
              key={i}
              args={[0.05, 0.2, 0.05]} 
              position={[
                Math.cos((i / 4) * Math.PI * 2) * 0.3,
                0.4,
                Math.sin((i / 4) * Math.PI * 2) * 0.3
              ]}
              rotation={[0, (i / 4) * Math.PI * 2, 0]}
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
          {/* Lightning bolts */}
          <Box args={[0.02, 0.3, 0.02]} position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 6]}>
            <meshBasicMaterial 
              color="#ffff00" 
              emissive="#ffff00"
              emissiveIntensity={1.2}
            />
          </Box>
          <Box args={[0.02, 0.2, 0.02]} position={[0.08, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <meshBasicMaterial 
              color="#ffff00" 
              emissive="#ffff00"
              emissiveIntensity={1.2}
            />
          </Box>
          <Box args={[0.02, 0.15, 0.02]} position={[-0.06, 0.35, 0]} rotation={[0, 0, Math.PI / 3]}>
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
        outlineWidth={0.01}
        outlineColor="black"
      >
        {type.name}
      </Text>

      {/* Selection Ring */}
      {isSelected && (
        <group>
          <Cylinder args={[type.size / 60, type.size / 60, 0.03, 32]} position={[0, -0.1, 0]}>
            <meshBasicMaterial 
              color={type.color} 
              transparent 
              opacity={0.6}
              emissive={type.color}
              emissiveIntensity={0.4}
            />
          </Cylinder>
          {/* Rotating selection particles */}
          {[...Array(8)].map((_, i) => (
            <Sphere 
              key={i}
              args={[0.02]} 
              position={[
                Math.cos((i / 8) * Math.PI * 2) * (type.size / 70),
                -0.05,
                Math.sin((i / 8) * Math.PI * 2) * (type.size / 70)
              ]}
            >
              <meshBasicMaterial 
                color={type.secondaryColor} 
                emissive={type.secondaryColor}
                emissiveIntensity={0.8}
              />
            </Sphere>
          ))}
        </group>
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
};