'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import TweakpanePanel from './TweakpanePanel';

interface SpinningBoxProps {
  rotationSpeed: { x: number; y: number };
  position: { x: number; y: number; z: number };
  color: string;
  scale: number;
}

function SpinningBox({ rotationSpeed, position, color, scale }: SpinningBoxProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed.x;
      meshRef.current.rotation.y += delta * rotationSpeed.y;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function ThreeScene() {
  const [debugParams, setDebugParams] = useState({
    rotationSpeedX: 0.6,
    rotationSpeedY: 0.8,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    color: '#ff8c42',
    scale: 1,
    ambientIntensity: 0.4,
    directionalIntensity: 1,
    directionalX: 5,
    directionalY: 5,
    directionalZ: 5,
    cameraFov: 60,
    showTweakpane: true,
  });

  const handleParamsChange = (
    newParams: Record<string, string | number | boolean | [number, number, number]>,
  ) => {
    setDebugParams((prev) => ({ ...prev, ...newParams }));
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '60vh',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
        }}
      >
        <Canvas camera={{ position: [3, 3, 5], fov: debugParams.cameraFov }} shadows>
          <ambientLight intensity={debugParams.ambientIntensity} />
          <directionalLight
            position={[
              debugParams.directionalX,
              debugParams.directionalY,
              debugParams.directionalZ,
            ]}
            intensity={debugParams.directionalIntensity}
            castShadow
          />
          <SpinningBox
            rotationSpeed={{ x: debugParams.rotationSpeedX, y: debugParams.rotationSpeedY }}
            position={{
              x: debugParams.positionX,
              y: debugParams.positionY,
              z: debugParams.positionZ,
            }}
            color={debugParams.color}
            scale={debugParams.scale}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#e5e5e5" />
          </mesh>
        </Canvas>
      </div>
      {debugParams.showTweakpane && (
        <TweakpanePanel
          params={debugParams}
          onParamsChange={handleParamsChange}
          title="Three.js Debug Panel"
        />
      )}
    </>
  );
}
