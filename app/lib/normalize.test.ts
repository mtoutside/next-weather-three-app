import { describe, it, expect } from 'vitest';
import { clamp01, normalizeTempC } from './normalize';

describe('normalize', () => {
  it('clamp01 clamps values', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(2)).toBe(1);
  });

  it('normalizeTempC maps to 0..1 within range', () => {
    expect(normalizeTempC(-10)).toBe(0);
    expect(normalizeTempC(40)).toBe(1);
    expect(normalizeTempC(15)).toBeCloseTo(0.5, 5);
  });

  it('normalizeTempC clamps outside', () => {
    expect(normalizeTempC(-100)).toBe(0);
    expect(normalizeTempC(100)).toBe(1);
  });

  it('normalizeTempC handles bad input', () => {
    expect(normalizeTempC(NaN)).toBe(0.5);
    // min==max
    expect(normalizeTempC(10, 0, 0)).toBe(0.5);
  });
});
