'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ShaderMaterial, Color } from 'three';
import { Color as ThreeColor, MathUtils } from 'three';
import { cloudyFragmentShader, cloudyVertexShader } from '../shaders/cloudy';
import { computeCloudyFactors } from '../lib/cloudyFactors';

export type CloudyShaderSphereProps = {
  temp01?: number;
  wind01?: number;
};

const BASE_COLOR = new ThreeColor('#d4dbea');
const HIGHLIGHT_COLOR = new ThreeColor('#f5f8ff');

export default function CloudyShaderSphere({ temp01 = 0.5, wind01 = 0 }: CloudyShaderSphereProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaveFreq: { value: 1 },
      uWaveAmp: { value: 0.4 },
      uSecondaryAmp: { value: 0.12 },
      uSwirlStrength: { value: 0.1 },
      uOpacity: { value: 0.75 },
      uHueShift: { value: 0.05 },
      uBaseColor: { value: BASE_COLOR.clone() },
      uHighlightColor: { value: HIGHLIGHT_COLOR.clone() },
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const factors = computeCloudyFactors({ temp01, wind01 });
    const lerpSpeed = Math.min(delta * 2.5, 1.0);

    uniforms.uTime.value += delta;
    uniforms.uWaveFreq.value = MathUtils.lerp(
      uniforms.uWaveFreq.value,
      factors.waveFreq,
      lerpSpeed,
    );
    uniforms.uWaveAmp.value = MathUtils.lerp(uniforms.uWaveAmp.value, factors.waveAmp, lerpSpeed);
    uniforms.uSecondaryAmp.value = MathUtils.lerp(
      uniforms.uSecondaryAmp.value,
      factors.secondaryAmp,
      lerpSpeed,
    );
    uniforms.uSwirlStrength.value = MathUtils.lerp(
      uniforms.uSwirlStrength.value,
      factors.swirlStrength,
      lerpSpeed,
    );
    uniforms.uOpacity.value = MathUtils.lerp(uniforms.uOpacity.value, factors.opacity, lerpSpeed);
    uniforms.uHueShift.value = MathUtils.lerp(
      uniforms.uHueShift.value,
      factors.hueShift,
      lerpSpeed,
    );

    const baseColor = uniforms.uBaseColor.value as Color;
    baseColor.setHSL(0.58 - factors.hueShift * 0.5, 0.1 + wind01 * 0.05, 0.8);

    const highlightColor = uniforms.uHighlightColor.value as Color;
    highlightColor.copy(baseColor).lerp(new ThreeColor('#ffffff'), 0.3 + (1 - temp01) * 0.1);

    mat.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0.1, 5.3]} renderOrder={1}>
      <sphereGeometry args={[1.55, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={cloudyVertexShader}
        fragmentShader={cloudyFragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
