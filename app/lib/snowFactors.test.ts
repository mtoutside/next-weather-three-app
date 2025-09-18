import { describe, expect, it } from 'vitest';
import { computeSnowFactors } from './snowFactors';

describe('computeSnowFactors', () => {
  it('風が強いほどブリザード係数が増える', () => {
    const calm = computeSnowFactors({ wind01: 0 });
    const windy = computeSnowFactors({ wind01: 1 });
    expect(windy.blizzardFactor).toBeGreaterThan(calm.blizzardFactor);
  });

  it('気温が低いほどハイライトが強まる', () => {
    const warm = computeSnowFactors({ temp01: 0.9 });
    const cold = computeSnowFactors({ temp01: 0.1 });
    expect(cold.highlightStrength).toBeGreaterThan(warm.highlightStrength);
  });

  it('結果が期待レンジに収まる', () => {
    const factors = computeSnowFactors({ temp01: 0.5, wind01: 0.5 });
    expect(factors.blizzardFactor).toBeGreaterThan(0);
    expect(factors.snowflakeAmount).toBeGreaterThan(0);
    expect(factors.baseLightness).toBeLessThanOrEqual(1);
    expect(factors.highlightStrength).toBeGreaterThan(0);
  });
});
