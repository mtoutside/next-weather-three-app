'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fragmentShader as fbmFragment, vertexShader as fbmVertex } from '../shaders/fbm';

export function TemperatureShaderPlane({ temp01 = 0.5 }: { temp01?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTemp: { value: temp01 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const m = matRef.current;
    m.uniforms.uTime.value = clock.elapsedTime;
    // なめらかに現在の温度に追従
    m.uniforms.uTemp.value += (temp01 - m.uniforms.uTemp.value) * 0.05;
  });

  const vertex = fbmVertex;
  const fragment = fbmFragment;

  return (
    <mesh>
      <planeGeometry args={[4, 3, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
      />
    </mesh>
  );
}

export default function WeatherThreeScene({ temp01 }: { temp01?: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: '60vh',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
        background: '#000',
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <TemperatureShaderPlane temp01={temp01} />
      </Canvas>
    </div>
  );
}
