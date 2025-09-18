'use client';

import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { fragmentShader as fbmFragment, vertexShader as fbmVertex } from '../shaders/fbm';
import { createFbmUniforms, smoothFollow } from '../hooks/useShaderFBOTexture';

export function TemperatureShaderPlane({
  temp01 = 0.5,
  precip01 = 0,
  wind01 = 0,
}: {
  temp01?: number;
  precip01?: number;
  wind01?: number;
}) {
  const uniforms = useMemo(
    () =>
      createFbmUniforms({
        temp01: temp01 ?? 0.5,
        precip01: precip01 ?? 0,
        wind01: wind01 ?? 0,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const targetTemp = temp01 ?? 0.5;
    const targetPrecip = precip01 ?? 0;
    const targetWind = wind01 ?? 0;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uTemp.value = smoothFollow(uniforms.uTemp.value, targetTemp, 0.05);
    uniforms.uPrecip.value = smoothFollow(uniforms.uPrecip.value, targetPrecip, 0.1);
    uniforms.uWind.value = smoothFollow(uniforms.uWind.value, targetWind, 0.08);
  });

  const vertex = fbmVertex;
  const fragment = fbmFragment;

  return (
    <mesh>
      <planeGeometry args={[4, 3, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} />
    </mesh>
  );
}

export default function WeatherThreeScene({
  temp01,
  precip01,
  wind01,
}: {
  temp01?: number;
  precip01?: number;
  wind01?: number;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <TemperatureShaderPlane temp01={temp01} precip01={precip01} wind01={wind01} />
      </Canvas>
    </div>
  );
}
