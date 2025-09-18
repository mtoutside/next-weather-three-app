'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { fragmentShader as fbmFragment, vertexShader as fbmVertex } from '../shaders/fbm';
import { createFbmUniforms, smoothFollow } from '../hooks/useShaderFBOTexture';
import { useShaderFBOTexture } from '../hooks/useShaderFBOTexture';
import { resolveWeatherObjectKind } from '../lib/weatherObjectKind';
import type { Group } from 'three';
import RainShaderSphere from './RainShaderSphere';
import CloudyShaderSphere from './CloudyShaderSphere';
import SnowShaderTorusKnot from './SnowShaderTorusKnot';

// 背景シェーダープレーン（深度書き込み無効）
export function BackgroundShaderPlane({
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
    [], // 初期化時のみ作成
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
function ClearSphere3D({
  temp01 = 0.5,
  precip01 = 0,
  wind01 = 0,
}: {
  temp01?: number;
  precip01?: number;
  wind01?: number;
}) {
  const tex = useShaderFBOTexture({ temp01, precip01, wind01, base: 256, max: 512 });
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.15 * delta;
    groupRef.current.rotation.x = 0.1 + (temp01 ?? 0.5) * 0.2;
  });

  return (
    <group ref={groupRef} position={[0, 0, 5.5]} renderOrder={1}>
      <mesh>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial map={tex} roughness={0.2} metalness={0.2} />
      </mesh>
    </group>
  );
}

function ThunderSpire3D({
  precip01 = 0,
  wind01 = 0,
}: {
  temp01?: number;
  precip01?: number;
  wind01?: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const intensity = 0.6 + (precip01 ?? 0) * 0.8;
    groupRef.current.rotation.y += (0.4 + (wind01 ?? 0) * 0.5) * delta;
    groupRef.current.children.forEach((child, index) => {
      const phase = (index + 1) * 0.5;
      child.scale.setScalar(1 + Math.sin(performance.now() * 0.002 + phase) * 0.1 * intensity);
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 5]} renderOrder={2}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.4, 3, 16, 1, true]} />
        <meshStandardMaterial
          color="#ffe066"
          emissive="#ffd26f"
          emissiveIntensity={1 + (precip01 ?? 0) * 1.5}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.08, 16, 64]} />
        <meshStandardMaterial color="#a47de5" emissive="#805ad5" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.08, 16, 64]} />
        <meshStandardMaterial color="#805ad5" emissive="#5b46a3" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// 天気に応じた3Dオブジェクト選択（メモ化）
const Weather3DObject = React.memo(function Weather3DObject({
  weathercode,
  temp01,
  precip01,
  wind01,
}: {
  weathercode?: number;
  temp01?: number;
  precip01?: number;
  wind01?: number;
}) {
  const kind = resolveWeatherObjectKind(weathercode);

  if (kind === 'clear') {
    return <ClearSphere3D temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  if (kind === 'cloudy') {
    return <CloudyShaderSphere temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  if (kind === 'rain') {
    return <RainShaderSphere temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  if (kind === 'snow') {
    return <SnowShaderTorusKnot temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  if (kind === 'thunder') {
    return <ThunderSpire3D temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  return null;
});

// メイン統合コンポーネント
export default function UnifiedWeatherScene({
  temp01,
  precip01,
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
        <BackgroundShaderPlane temp01={temp01} precip01={precip01} wind01={wind01} />

        {/* 天気に応じた3Dオブジェクト（前面） */}
        <Weather3DObject
          weathercode={weathercode}
          temp01={temp01}
          precip01={precip01}
          wind01={wind01}
        />
      </Canvas>
    </div>
  );
}
