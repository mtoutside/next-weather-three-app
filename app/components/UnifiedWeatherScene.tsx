'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fragmentShader as fbmFragment, vertexShader as fbmVertex } from '../shaders/fbm';
import { sphereVertexShader, sphereFbmFragmentShader } from '../shaders/sphereFbm';
import { resolveWeatherObjectKind } from '../lib/weatherObjectKind';
import type { Group } from 'three';
import RainShaderSphere from './RainShaderSphere';
import CloudyShaderSphere from './CloudyShaderSphere';
import SnowShaderTorusKnot from './SnowShaderTorusKnot';
import ThunderShaderSphere from './ThunderShaderSphere';

type WeatherUniformName = 'uTime' | 'uTemp' | 'uWind';
export type WeatherUniforms = Record<WeatherUniformName, THREE.IUniform<number>>;

function createUniform(value: number): THREE.IUniform<number> {
  return { value };
}

export function createFbmUniforms({
  temp01 = 0.5,
  wind01 = 0,
}: {
  temp01?: number;
  wind01?: number;
} = {}): WeatherUniforms {
  return {
    uTime: createUniform(0),
    uTemp: createUniform(temp01),
    uWind: createUniform(wind01),
  } satisfies WeatherUniforms;
}

export function smoothFollow(current: number, target: number, alpha = 0.05) {
  return current + (target - current) * alpha;
}

// 背景シェーダープレーン（深度書き込み無効）
export function BackgroundShaderPlane({
  temp01 = 0.5,
  wind01 = 0,
}: {
  temp01?: number;
  wind01?: number;
}) {
  const uniforms = useMemo(
    () =>
      createFbmUniforms({
        temp01: temp01 ?? 0.5,
        wind01: wind01 ?? 0,
      }),
    [], // 初期化時のみ作成
  );

  useFrame(({ clock }) => {
    const targetTemp = temp01 ?? 0.5;
    const targetWind = wind01 ?? 0;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uTemp.value = smoothFollow(uniforms.uTemp.value, targetTemp, 0.05);
    uniforms.uWind.value = smoothFollow(uniforms.uWind.value, targetWind, 0.08);
  });

  return (
    <mesh position={[0, 0, -15]} renderOrder={-1}>
      <planeGeometry args={[150, 100, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={fbmVertex}
        fragmentShader={fbmFragment}
        depthWrite={false} // 深度書き込み無効
        depthTest={false} // 深度テスト無効で確実に背景に
        transparent={false}
      />
    </mesh>
  );
}

// クリアスフィア（晴れ・快晴用）
function ClearSphere3D({ temp01 = 0.5, wind01 = 0 }: { temp01?: number; wind01?: number }) {
  const groupRef = useRef<Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTemp: { value: temp01 ?? 0.5 },
      uWind: { value: wind01 ?? 0 },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.15 * delta;
    groupRef.current.rotation.x = 0.1 + (temp01 ?? 0.5) * 0.2;

    // uniforms更新
    uniforms.uTime.value += delta;
    uniforms.uTemp.value = smoothFollow(uniforms.uTemp.value, temp01 ?? 0.5, 0.05);
    uniforms.uWind.value = smoothFollow(uniforms.uWind.value, wind01 ?? 0, 0.08);
  });

  return (
    <group ref={groupRef} position={[0, 0, 5.5]} renderOrder={1}>
      <mesh>
        <sphereGeometry args={[1.5, 48, 48]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={sphereVertexShader}
          fragmentShader={sphereFbmFragmentShader}
        />
      </mesh>
    </group>
  );
}

// 天気に応じた3Dオブジェクト選択（メモ化）
const Weather3DObject = React.memo(function Weather3DObject({
  weathercode,
  temp01,
  wind01,
}: {
  weathercode?: number;
  temp01?: number;
  wind01?: number;
}) {
  const kind = resolveWeatherObjectKind(weathercode);

  if (kind === 'clear') {
    return <ClearSphere3D temp01={temp01} wind01={wind01} />;
  }

  if (kind === 'cloudy') {
    return <CloudyShaderSphere temp01={temp01} wind01={wind01} />;
  }

  if (kind === 'rain') {
    return <RainShaderSphere temp01={temp01} wind01={wind01} />;
  }

  if (kind === 'snow') {
    return <SnowShaderTorusKnot temp01={temp01} wind01={wind01} />;
  }

  if (kind === 'thunder') {
    return <ThunderShaderSphere temp01={temp01} wind01={wind01} />;
  }

  return null;
});

// メイン統合コンポーネント
export default function UnifiedWeatherScene({
  temp01,
  precip01: _precip01,
  wind01,
  weathercode,
}: {
  temp01?: number;
  precip01?: number;
  wind01?: number;
  weathercode?: number;
}) {
  // ライティング設定をメモ化
  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#4a90e2" />
      </>
    ),
    [],
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 120 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }} // パフォーマンス最適化
      >
        {/* ライティング */}
        {lights}

        {/* 背景シェーダー（最背面） */}
        <BackgroundShaderPlane temp01={temp01} wind01={wind01} />

        {/* 天気に応じた3Dオブジェクト（前面） */}
        <Weather3DObject weathercode={weathercode} temp01={temp01} wind01={wind01} />
      </Canvas>
    </div>
  );
}
