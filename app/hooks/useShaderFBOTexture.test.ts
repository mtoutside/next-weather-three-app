import { describe, it, expect } from 'vitest';
import { createFbmUniforms, smoothFollow, getFboSize } from './useShaderFBOTexture';

describe('useShaderFBOTexture helpers', () => {
  it('createFbmUniforms は渡した初期値を保持する', () => {
    const u = createFbmUniforms({ temp01: 0.3, precip01: 0.4, wind01: 0.2 });
    expect(u.uTime.value).toBe(0);
    expect(u.uTemp.value).toBeCloseTo(0.3, 6);
    expect(u.uPrecip.value).toBeCloseTo(0.4, 6);
    expect(u.uWind.value).toBeCloseTo(0.2, 6);
  });

  it('createFbmUniforms は既定値を 0.5/0/0 で設定する', () => {
    const u = createFbmUniforms();
    expect(u.uTemp.value).toBeCloseTo(0.5, 6);
    expect(u.uPrecip.value).toBe(0);
    expect(u.uWind.value).toBe(0);
  });

  it('smoothFollow は目標へ収束する', () => {
    let v = 0;
    for (let i = 0; i < 10; i++) {
      v = smoothFollow(v, 1, 0.2);
    }
    expect(v).toBeGreaterThan(0.85); // 十分近づく
    expect(v).toBeLessThan(1);
  });

  it('getFboSize はDPRと上限を考慮する', () => {
    expect(getFboSize({ base: 512, max: 1024, dpr: 2 })).toBe(1024);
    expect(getFboSize({ base: 512, max: 800, dpr: 2 })).toBe(800);
    expect(getFboSize({ base: 512, max: 2048, dpr: 0.5 })).toBe(256);
  });
});
