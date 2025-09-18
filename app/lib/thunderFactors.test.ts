import { describe, expect, it } from 'vitest';
import { computeThunderFactors } from './thunderFactors';

describe('computeThunderFactors', () => {
  it('風が強いほど周波数が高まる', () => {
    const calm = computeThunderFactors({ wind01: 0 });
    const windy = computeThunderFactors({ wind01: 1 });
    expect(windy.jitterFreq.x).toBeGreaterThan(calm.jitterFreq.x);
    expect(windy.jitterFreq.y).toBeGreaterThan(calm.jitterFreq.y);
  });

  it('風が強いほど揺れ幅が増える', () => {
    const calm = computeThunderFactors({ wind01: 0 });
    const windy = computeThunderFactors({ wind01: 1 });
    expect(windy.jitterScale.x).toBeGreaterThan(calm.jitterScale.x);
    expect(windy.jitterScale.y).toBeGreaterThan(calm.jitterScale.y);
  });

  it('風でフラッシュ強度が上がる', () => {
    const calm = computeThunderFactors({ wind01: 0 });
    const active = computeThunderFactors({ wind01: 0.9 });
    expect(active.flashIntensity).toBeGreaterThan(calm.flashIntensity);
  });
});
