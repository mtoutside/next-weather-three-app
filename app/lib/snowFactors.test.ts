import { describe, expect, it } from 'vitest';
import { computeSnowFactors } from './snowFactors';

describe('computeSnowFactors', () => {
  it('降水量が増えると波の振幅が増える', () => {
    const light = computeSnowFactors({ precip01: 0.1 });
    const heavy = computeSnowFactors({ precip01: 0.9 });
    expect(heavy.waveAmp).toBeGreaterThan(light.waveAmp);
  });

  it('風が強いほど渦速度が増える', () => {
    const calm = computeSnowFactors({ wind01: 0 });
    const windy = computeSnowFactors({ wind01: 1 });
    expect(windy.swirlSpeed).toBeGreaterThan(calm.swirlSpeed);
  });

  it('気温が低いほどハイライトが強まる', () => {
    const warm = computeSnowFactors({ temp01: 0.9 });
    const cold = computeSnowFactors({ temp01: 0.1 });
    expect(cold.highlightMix).toBeGreaterThan(warm.highlightMix);
  });

  it('結果が期待レンジに収まる', () => {
    const factors = computeSnowFactors({ temp01: 0.5, precip01: 0.5, wind01: 0.5 });
    expect(factors.waveFreq).toBeGreaterThan(0);
    expect(factors.waveAmp).toBeGreaterThan(0);
    expect(factors.fogStrength).toBeGreaterThanOrEqual(0);
    expect(factors.opacity).toBeLessThanOrEqual(1);
  });
});
