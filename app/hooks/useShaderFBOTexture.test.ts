import { describe, it, expect } from 'vitest';
import { createFbmUniforms, smoothFollow, getFboSize } from './useShaderFBOTexture';

describe('useShaderFBOTexture helpers', () => {
  it('createFbmUniforms 初期値が正しい', () => {
    const u = createFbmUniforms(0.3);
    expect(u.uTime.value).toBe(0);
    expect(u.uTemp.value).toBeCloseTo(0.3, 6);
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

