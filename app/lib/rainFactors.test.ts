import { describe, expect, it } from 'vitest';
import { computeRainFactors } from './rainFactors';

describe('computeRainFactors', () => {
  it('降水量が増えるとノイズ強度が高まる', () => {
    const light = computeRainFactors({ precip01: 0.1 });
    const heavy = computeRainFactors({ precip01: 0.9 });
    expect(heavy.noiseStrength).toBeGreaterThan(light.noiseStrength);
  });

  it('風速が増えると流速が高まる', () => {
    const calm = computeRainFactors({ wind01: 0.0 });
    const windy = computeRainFactors({ wind01: 1.0 });
    expect(windy.flowSpeed).toBeGreaterThan(calm.flowSpeed);
  });

  it('降水が強くなるほどリップルが強まる', () => {
    const light = computeRainFactors({ precip01: 0.2 });
    const heavy = computeRainFactors({ precip01: 0.9 });
    expect(heavy.rippleMix).toBeGreaterThan(light.rippleMix);
  });

  it('結果が期待レンジに収まる', () => {
    const factors = computeRainFactors({ temp01: 0.5, precip01: 0.5, wind01: 0.5 });
    expect(factors.noiseScale).toBeGreaterThanOrEqual(0.5);
    expect(factors.noiseScale).toBeLessThanOrEqual(2.0);
    expect(factors.noiseStrength).toBeGreaterThan(0);
    expect(factors.noiseStrength).toBeLessThanOrEqual(1);
    expect(factors.wobbleStrength).toBeGreaterThanOrEqual(0);
    expect(factors.opacity).toBeGreaterThan(0);
    expect(factors.opacity).toBeLessThanOrEqual(1);
  });
});
