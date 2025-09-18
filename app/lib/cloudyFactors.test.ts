import { describe, expect, it } from 'vitest';
import { computeCloudyFactors } from './cloudyFactors';

describe('computeCloudyFactors', () => {
  it('降水量が増えるとノイズ強度が高まる', () => {
    const light = computeCloudyFactors({ precip01: 0.1 });
    const heavy = computeCloudyFactors({ precip01: 0.9 });
    expect(heavy.noiseStrength).toBeGreaterThan(light.noiseStrength);
  });

  it('風速が増えると流速が高まる', () => {
    const calm = computeCloudyFactors({ wind01: 0.0 });
    const windy = computeCloudyFactors({ wind01: 1.0 });
    expect(windy.flowSpeed).toBeGreaterThan(calm.flowSpeed);
  });

  it('気温が低いほどスケールが大きくなる', () => {
    const warm = computeCloudyFactors({ temp01: 0.9 });
    const cold = computeCloudyFactors({ temp01: 0.1 });
    expect(cold.noiseScale).toBeGreaterThan(warm.noiseScale);
  });

  it('結果が期待レンジに収まる', () => {
    const factors = computeCloudyFactors({ temp01: 0.5, precip01: 0.5, wind01: 0.5 });
    expect(factors.noiseScale).toBeGreaterThanOrEqual(0.5);
    expect(factors.noiseScale).toBeLessThanOrEqual(2.0);
    expect(factors.noiseStrength).toBeGreaterThan(0);
    expect(factors.noiseStrength).toBeLessThanOrEqual(0.6);
    expect(factors.wobbleStrength).toBeGreaterThanOrEqual(0);
    expect(factors.opacity).toBeGreaterThan(0);
    expect(factors.opacity).toBeLessThanOrEqual(1);
  });
});
