'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ShaderMaterial, Color } from 'three';
import { Color as ThreeColor, MathUtils } from 'three';
import { rainFragmentShader, rainVertexShader } from '../shaders/rain';
import { computeRainFactors } from '../lib/rainFactors';

export type RainShaderSphereProps = {
  temp01?: number;
  wind01?: number;
};

const BASE_COLOR = new ThreeColor('#5d7aa5');
const HIGHLIGHT_COLOR = new ThreeColor('#a8c4ef');

export default function RainShaderSphere({ temp01 = 0.5, wind01 = 0 }: RainShaderSphereProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoiseScale: { value: 1 },
      uNoiseStrength: { value: 0.25 },
      uWobbleStrength: { value: 0.05 },
      uFlowSpeed: { value: 0.4 },
      uOpacity: { value: 0.75 },
      uHighlightGain: { value: 1.1 },
      uShadowStrength: { value: 0.25 },
      uRippleMix: { value: 0.2 },
      uBaseColor: { value: BASE_COLOR.clone() },
      uHighlightColor: { value: HIGHLIGHT_COLOR.clone() },
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const factors = computeRainFactors({ temp01, wind01 });
    const lerpSpeed = Math.min(delta * 3.2, 1.0);

    uniforms.uTime.value += delta * factors.flowSpeed;
    uniforms.uNoiseScale.value = MathUtils.lerp(
      uniforms.uNoiseScale.value,
      factors.noiseScale,
      lerpSpeed,
    );
    uniforms.uNoiseStrength.value = MathUtils.lerp(
      uniforms.uNoiseStrength.value,
      factors.noiseStrength,
      lerpSpeed,
    );
    uniforms.uWobbleStrength.value = MathUtils.lerp(
      uniforms.uWobbleStrength.value,
      factors.wobbleStrength,
      lerpSpeed,
    );
    uniforms.uFlowSpeed.value = MathUtils.lerp(
      uniforms.uFlowSpeed.value,
      factors.flowSpeed,
      lerpSpeed,
    );
    uniforms.uOpacity.value = MathUtils.lerp(uniforms.uOpacity.value, factors.opacity, lerpSpeed);
    uniforms.uHighlightGain.value = MathUtils.lerp(
      uniforms.uHighlightGain.value,
      factors.highlightGain,
      lerpSpeed,
    );
    uniforms.uRippleMix.value = MathUtils.lerp(
      uniforms.uRippleMix.value,
      factors.rippleMix,
      lerpSpeed,
    );

    const baseColor = uniforms.uBaseColor.value as Color;
    const hue = MathUtils.lerp(0.58, 0.5, Math.min(wind01 * 0.4, 1));
    const saturation = 0.2 + wind01 * 0.15;
    const lightness = MathUtils.lerp(0.55, 0.7, Math.max(0.1, 1 - temp01 * 0.4));
    baseColor.setHSL(hue, saturation, lightness);

    const highlightColor = uniforms.uHighlightColor.value as Color;
    highlightColor
      .copy(baseColor)
      .lerp(new ThreeColor('#d3e7ff'), 0.35 + wind01 * 0.2)
      .offsetHSL(0, 0.02, 0.05);

    mat.needsUpdate = true;
  });

  return (
    <mesh position={[0, -0.1, 5.4]} renderOrder={1}>
      <sphereGeometry args={[1.6, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={rainVertexShader}
        fragmentShader={rainFragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
