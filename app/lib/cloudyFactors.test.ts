import { describe, expect, it } from 'vitest';
import { computeCloudyFactors } from './cloudyFactors';

describe('computeCloudyFactors', () => {
  it('降水量が増えると波の振幅が増える', () => {
    const light = computeCloudyFactors({ precip01: 0.1 });
    const heavy = computeCloudyFactors({ precip01: 0.9 });
    expect(heavy.waveAmp).toBeGreaterThan(light.waveAmp);
  });

  it('風速が増えると渦度が増える', () => {
    const calm = computeCloudyFactors({ wind01: 0.0 });
    const windy = computeCloudyFactors({ wind01: 1.0 });
    expect(windy.swirlStrength).toBeGreaterThan(calm.swirlStrength);
  });

  it('気温が低いほど色味が青寄りになる', () => {
    const warm = computeCloudyFactors({ temp01: 0.9 });
    const cold = computeCloudyFactors({ temp01: 0.1 });
    expect(cold.hueShift).toBeGreaterThan(warm.hueShift);
  });

  it('結果が期待レンジに収まる', () => {
    const factors = computeCloudyFactors({ temp01: 0.5, precip01: 0.5, wind01: 0.5 });
    expect(factors.waveFreq).toBeGreaterThan(0);
    expect(factors.waveAmp).toBeGreaterThan(0);
    expect(factors.secondaryAmp).toBeGreaterThanOrEqual(0);
    expect(factors.opacity).toBeLessThanOrEqual(1);
  });
});
