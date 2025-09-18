'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ShaderMaterial, Color } from 'three';
import { Color as ThreeColor, MathUtils } from 'three';
import { snowFragmentShader, snowVertexShader } from '../shaders/snow';
import { computeSnowFactors } from '../lib/snowFactors';

export type SnowShaderTorusKnotProps = {
  temp01?: number;
  precip01?: number;
  wind01?: number;
};

const BASE_COLOR = new ThreeColor('#6f747d');
const HIGHLIGHT_COLOR = new ThreeColor('#ffffff');

export default function SnowShaderTorusKnot({
  temp01 = 0.5,
  precip01 = 0,
  wind01 = 0,
}: SnowShaderTorusKnotProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBlizzardFactor: { value: 0.2 },
      uSnowflakeAmount: { value: 120 },
      uBaseColor: { value: BASE_COLOR.clone() },
      uHighlightColor: { value: HIGHLIGHT_COLOR.clone() },
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const factors = computeSnowFactors({ temp01, precip01, wind01 });
    const lerpSpeed = Math.min(delta * 2.5, 1.0);

    uniforms.uTime.value += delta;
    uniforms.uBlizzardFactor.value = MathUtils.lerp(
      uniforms.uBlizzardFactor.value,
      factors.blizzardFactor,
      lerpSpeed,
    );
    uniforms.uSnowflakeAmount.value = MathUtils.lerp(
      uniforms.uSnowflakeAmount.value,
      factors.snowflakeAmount,
      lerpSpeed,
    );

    const baseColor = uniforms.uBaseColor.value as Color;
    baseColor.setHSL(0.6, factors.baseSaturation, factors.baseLightness);

    const highlightColor = uniforms.uHighlightColor.value as Color;
    highlightColor
      .copy(baseColor)
      .lerp(new ThreeColor('#ffffff'), MathUtils.clamp(factors.highlightStrength, 0.0, 1.0));

    mat.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0, 5.3]} renderOrder={1}>
      <torusKnotGeometry args={[1.2, 0.35, 256, 48, 2, 3]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={snowVertexShader}
        fragmentShader={snowFragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
