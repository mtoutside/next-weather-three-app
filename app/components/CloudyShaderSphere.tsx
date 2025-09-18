'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ShaderMaterial, Color } from 'three';
import { Color as ThreeColor, MathUtils } from 'three';
import { cloudyFragmentShader, cloudyVertexShader } from '../shaders/cloudy';
import { computeCloudyFactors } from '../lib/cloudyFactors';

export type CloudyShaderSphereProps = {
  temp01?: number;
  precip01?: number;
  wind01?: number;
};

const BASE_COLOR = new ThreeColor('#cfd7e6');
const HIGHLIGHT_COLOR = new ThreeColor('#f4f7ff');

export default function CloudyShaderSphere({
  temp01 = 0.5,
  precip01 = 0,
  wind01 = 0,
}: CloudyShaderSphereProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoiseScale: { value: 1 },
      uNoiseStrength: { value: 0.25 },
      uWobbleStrength: { value: 0.05 },
      uFlowSpeed: { value: 0.4 },
      uOpacity: { value: 0.75 },
      uHighlightGain: { value: 1.0 },
      uShadowStrength: { value: 0.25 },
      uBaseColor: { value: BASE_COLOR.clone() },
      uHighlightColor: { value: HIGHLIGHT_COLOR.clone() },
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const factors = computeCloudyFactors({ temp01, precip01, wind01 });
    const lerpSpeed = Math.min(delta * 3.0, 1.0);

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
    uniforms.uShadowStrength.value = MathUtils.lerp(
      uniforms.uShadowStrength.value,
      factors.shadowStrength,
      lerpSpeed,
    );

    const baseColor = uniforms.uBaseColor.value as Color;
    const hue = MathUtils.lerp(0.6, 0.52, Math.min(precip01, 1));
    const saturation = 0.08 + precip01 * 0.12;
    const lightness = MathUtils.lerp(0.82, 0.72, Math.min(precip01 + (1 - temp01) * 0.5, 1));
    baseColor.setHSL(hue, saturation, lightness);

    const highlightColor = uniforms.uHighlightColor.value as Color;
    highlightColor.copy(baseColor).lerp(new ThreeColor('#ffffff'), 0.25 + wind01 * 0.2);

    mat.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0.15, 5.2]} renderOrder={1}>
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
