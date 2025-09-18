'use client';

import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { fragmentShader as fbmFragment, vertexShader as fbmVertex } from '../shaders/fbm';
import { createFbmUniforms, smoothFollow } from '../hooks/useShaderFBOTexture';
import { useShaderFBOTexture } from '../hooks/useShaderFBOTexture';

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

  useFrame(() => {
    // 回転アニメーションは現在未実装
  });

  return (
    <mesh position={[0, 0, 5.5]} rotation={[0, 0, 0]} renderOrder={1}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial map={tex} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

// CSS風エフェクトを3D空間で表現するヘルパー
function CSS3DEffect({
  weathercode,
  precip01 = 0,
}: {
  weathercode?: number;
  temp01?: number;
  precip01?: number;
  wind01?: number;
}) {
  // 雨エフェクト
  if (
    (weathercode && weathercode >= 51 && weathercode <= 67) ||
    (weathercode && weathercode >= 80 && weathercode <= 82)
  ) {
    const rainDrops = useMemo(() => {
      const count = Math.floor(5 + (precip01 || 0) * 15);
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 8,
        z: Math.random() * 3,
        speed: 0.05 + Math.random() * 0.1,
      }));
    }, [precip01]);

    return (
      <group renderOrder={2}>
        {rainDrops.map((drop) => (
          <mesh key={drop.id} position={[drop.x, drop.y, drop.z]}>
            <cylinderGeometry args={[0.01, 0.01, 0.2]} />
            <meshBasicMaterial color="#64a4d6" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // 雪エフェクト
  if (
    (weathercode && weathercode >= 71 && weathercode <= 77) ||
    (weathercode && weathercode >= 85 && weathercode <= 86)
  ) {
    const snowFlakes = useMemo(() => {
      const count = Math.floor(3 + (precip01 || 0) * 10);
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 6,
        z: Math.random() * 4,
        size: 0.03 + Math.random() * 0.05,
      }));
    }, [precip01]);

    return (
      <group renderOrder={2}>
        {snowFlakes.map((flake) => (
          <mesh key={flake.id} position={[flake.x, flake.y, flake.z]}>
            <sphereGeometry args={[flake.size, 6, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  return null;
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
  // クリアスフィア（晴れ・快晴）
  if (weathercode === 0 || weathercode === 1) {
    return <ClearSphere3D temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  // その他の天気はCSS風エフェクトを3D化
  return (
    <CSS3DEffect weathercode={weathercode} precip01={precip01} temp01={temp01} wind01={wind01} />
  );
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
