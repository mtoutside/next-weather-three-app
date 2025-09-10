"use client";

import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useShaderFBOTexture } from '../hooks/useShaderFBOTexture';

function SphereWithFbmTexture({ temp01 = 0.5 }: { temp01?: number }) {
  const tex = useShaderFBOTexture({ temp01, base: 512, max: 1024 });
  return (
    <mesh>
      <sphereGeometry args={[0.9, 64, 64]} />
      <meshStandardMaterial map={tex as THREE.Texture} roughness={1} metalness={0} />
    </mesh>
  );
}

export default function MappedSphereFBO({ temp01 = 0.5 }: { temp01?: number }) {
  return (
    <div style={{ width: '100%', height: '50vh', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 2.2], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        <SphereWithFbmTexture temp01={temp01} />
      </Canvas>
    </div>
  );
}

