import { describe, expect, it } from 'vitest';
import { computeThunderFactors } from './thunderFactors';

describe('computeThunderFactors', () => {
  it('風が強いほど周波数が高まる', () => {
    const calm = computeThunderFactors({ wind01: 0 });
    const windy = computeThunderFactors({ wind01: 1 });
    expect(windy.jitterFreq.x).toBeGreaterThan(calm.jitterFreq.x);
    expect(windy.jitterFreq.y).toBeGreaterThan(calm.jitterFreq.y);
  });

  it('降水量が増えるほど揺れ幅が増える', () => {
    const light = computeThunderFactors({ precip01: 0.1 });
    const heavy = computeThunderFactors({ precip01: 0.9 });
    expect(heavy.jitterScale.x).toBeGreaterThan(light.jitterScale.x);
    expect(heavy.jitterScale.y).toBeGreaterThan(light.jitterScale.y);
  });

  it('降水と風でフラッシュ強度が上がる', () => {
    const calm = computeThunderFactors({ precip01: 0, wind01: 0 });
    const active = computeThunderFactors({ precip01: 0.8, wind01: 0.9 });
    expect(active.flashIntensity).toBeGreaterThan(calm.flashIntensity);
  });
});
