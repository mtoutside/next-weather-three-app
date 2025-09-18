'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ShaderMaterial, Color } from 'three';
import { Color as ThreeColor, MathUtils } from 'three';
import { thunderFragmentShader, thunderVertexShader } from '../shaders/thunder';
import { computeRainFactors } from '../lib/rainFactors';
import { computeThunderFactors } from '../lib/thunderFactors';

export type ThunderShaderSphereProps = {
  temp01?: number;
  wind01?: number;
};

const BASE_COLOR = new ThreeColor('#4b5d8d');
const HIGHLIGHT_COLOR = new ThreeColor('#f6f1d6');

export default function ThunderShaderSphere({
  temp01 = 0.5,
  wind01 = 0,
}: ThunderShaderSphereProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoiseScale: { value: 1 },
      uNoiseStrength: { value: 0.35 },
      uWobbleStrength: { value: 0.08 },
      uFlowSpeed: { value: 0.6 },
      uOpacity: { value: 0.85 },
      uHighlightGain: { value: 1.2 },
      uShadowStrength: { value: 0.2 },
      uRippleMix: { value: 0.4 },
      uJitterFreq: { value: [90, 110] as [number, number] },
      uJitterPhase: { value: [1.0, 1.0] as [number, number] },
      uJitterScale: { value: [0.006, 0.006] as [number, number] },
      uFlashIntensity: { value: 0.4 },
      uBaseColor: { value: BASE_COLOR.clone() },
      uHighlightColor: { value: HIGHLIGHT_COLOR.clone() },
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const rainFactors = computeRainFactors({ temp01, wind01 });
    const thunderFactors = computeThunderFactors({ wind01 });
    const lerpSpeed = Math.min(delta * 3.5, 1.0);

    uniforms.uTime.value += delta * rainFactors.flowSpeed * 1.2;
    uniforms.uNoiseScale.value = MathUtils.lerp(
      uniforms.uNoiseScale.value,
      rainFactors.noiseScale,
      lerpSpeed,
    );
    uniforms.uNoiseStrength.value = MathUtils.lerp(
      uniforms.uNoiseStrength.value,
      rainFactors.noiseStrength * 1.1,
      lerpSpeed,
    );
    uniforms.uWobbleStrength.value = MathUtils.lerp(
      uniforms.uWobbleStrength.value,
      rainFactors.wobbleStrength * 1.2,
      lerpSpeed,
    );
    uniforms.uFlowSpeed.value = MathUtils.lerp(
      uniforms.uFlowSpeed.value,
      rainFactors.flowSpeed * 1.4,
      lerpSpeed,
    );
    uniforms.uOpacity.value = MathUtils.lerp(
      uniforms.uOpacity.value,
      rainFactors.opacity,
      lerpSpeed,
    );
    uniforms.uHighlightGain.value = MathUtils.lerp(
      uniforms.uHighlightGain.value,
      rainFactors.highlightGain * 1.3,
      lerpSpeed,
    );
    uniforms.uShadowStrength.value = MathUtils.lerp(
      uniforms.uShadowStrength.value,
      rainFactors.highlightGain * 0.2,
      lerpSpeed,
    );
    uniforms.uRippleMix.value = MathUtils.lerp(
      uniforms.uRippleMix.value,
      rainFactors.rippleMix * 1.4,
      lerpSpeed,
    );

    const jitterFreq = uniforms.uJitterFreq.value as [number, number];
    jitterFreq[0] = MathUtils.lerp(jitterFreq[0], thunderFactors.jitterFreq.x, lerpSpeed);
    jitterFreq[1] = MathUtils.lerp(jitterFreq[1], thunderFactors.jitterFreq.y, lerpSpeed);

    const jitterPhase = uniforms.uJitterPhase.value as [number, number];
    jitterPhase[0] = MathUtils.lerp(jitterPhase[0], thunderFactors.jitterPhase.x, lerpSpeed);
    jitterPhase[1] = MathUtils.lerp(jitterPhase[1], thunderFactors.jitterPhase.y, lerpSpeed);

    const jitterScale = uniforms.uJitterScale.value as [number, number];
    jitterScale[0] = MathUtils.lerp(jitterScale[0], thunderFactors.jitterScale.x, lerpSpeed);
    jitterScale[1] = MathUtils.lerp(jitterScale[1], thunderFactors.jitterScale.y, lerpSpeed);

    uniforms.uFlashIntensity.value = MathUtils.lerp(
      uniforms.uFlashIntensity.value,
      thunderFactors.flashIntensity,
      lerpSpeed,
    );

    const baseColor = uniforms.uBaseColor.value as Color;
    baseColor.setHSL(0.58 - wind01 * 0.05, 0.35 + wind01 * 0.15, 0.45 + (1 - temp01) * 0.1);

    const highlightColor = uniforms.uHighlightColor.value as Color;
    highlightColor.copy(baseColor).lerp(new ThreeColor('#ffe9a8'), 0.6).offsetHSL(0.0, 0.05, 0.1);

    mat.needsUpdate = true;
  });

  return (
    <mesh position={[0, -0.05, 5.2]} renderOrder={1}>
      <sphereGeometry args={[1.65, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={thunderVertexShader}
        fragmentShader={thunderFragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
