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

const BASE_COLOR = new ThreeColor('#dbe8ff');
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
      uWaveFreq: { value: 1 },
      uWaveAmp: { value: 0.2 },
      uSwirlSpeed: { value: 0.6 },
      uFogStrength: { value: 0.4 },
      uHighlightMix: { value: 0.5 },
      uOpacity: { value: 0.8 },
      uBaseColor: { value: BASE_COLOR.clone() },
      uHighlightColor: { value: HIGHLIGHT_COLOR.clone() },
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const factors = computeSnowFactors({ temp01, precip01, wind01 });
    const lerpSpeed = Math.min(delta * 2.8, 1.0);

    uniforms.uTime.value += delta;
    uniforms.uWaveFreq.value = MathUtils.lerp(
      uniforms.uWaveFreq.value,
      factors.waveFreq,
      lerpSpeed,
    );
    uniforms.uWaveAmp.value = MathUtils.lerp(uniforms.uWaveAmp.value, factors.waveAmp, lerpSpeed);
    uniforms.uSwirlSpeed.value = MathUtils.lerp(
      uniforms.uSwirlSpeed.value,
      factors.swirlSpeed,
      lerpSpeed,
    );
    uniforms.uFogStrength.value = MathUtils.lerp(
      uniforms.uFogStrength.value,
      factors.fogStrength,
      lerpSpeed,
    );
    uniforms.uHighlightMix.value = MathUtils.lerp(
      uniforms.uHighlightMix.value,
      factors.highlightMix,
      lerpSpeed,
    );
    uniforms.uOpacity.value = MathUtils.lerp(uniforms.uOpacity.value, factors.opacity, lerpSpeed);

    const baseColor = uniforms.uBaseColor.value as Color;
    baseColor.setHSL(0.6, 0.15 + precip01 * 0.1, 0.88 - precip01 * 0.15);

    const highlightColor = uniforms.uHighlightColor.value as Color;
    highlightColor.copy(baseColor).lerp(new ThreeColor('#ffffff'), 0.4 + (1 - temp01) * 0.3);

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
