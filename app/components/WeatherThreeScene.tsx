'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

  const vertex = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform float uTemp; // 0..1（低温→高温）
    varying vec2 vUv;

    // 簡易ノイズ: sin/cos 合成
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * sin(p.x) * cos(p.y);
        p *= 2.0;
        a *= 0.5;
      }
      return v * 0.5 + 0.5; // 0..1
    }

    void main() {
      // 温度で色相を補間（寒色→暖色）
      vec3 cold = vec3(0.2, 0.5, 1.0);
      vec3 warm = vec3(1.0, 0.35, 0.1);
      vec3 base = mix(cold, warm, clamp(uTemp, 0.0, 1.0));

      // 温度によって動きの速さと明滅強度が変化
      float speed = mix(0.3, 1.2, uTemp);
      float n = fbm(vUv * 6.0 + vec2(uTime * speed, uTime * 0.7 * speed));
      float glow = mix(0.2, 0.9, uTemp);
      vec3 col = base * mix(0.7, 1.3, n * glow);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

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
