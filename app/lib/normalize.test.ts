import { describe, it, expect } from 'vitest';
import {
  clamp01,
  normalizeTempC,
  normalizePrecipProbability,
  normalizeWindSpeed,
} from './normalize';

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

  it('normalizePrecipProbability maps 0..100 -> 0..1 and clamps', () => {
    expect(normalizePrecipProbability(0)).toBe(0);
    expect(normalizePrecipProbability(50)).toBe(0.5);
    expect(normalizePrecipProbability(100)).toBe(1);
    expect(normalizePrecipProbability(-10)).toBe(0);
    expect(normalizePrecipProbability(150)).toBe(1);
    expect(normalizePrecipProbability(NaN as unknown as number)).toBe(0);
  });

  it('normalizeWindSpeed maps to 0..1 based on default range and clamps', () => {
    expect(normalizeWindSpeed(0)).toBe(0);
    expect(normalizeWindSpeed(15)).toBeCloseTo(0.5, 6);
    expect(normalizeWindSpeed(30)).toBe(1);
    expect(normalizeWindSpeed(-5)).toBe(0);
    expect(normalizeWindSpeed(60)).toBe(1);
    expect(normalizeWindSpeed(NaN as unknown as number)).toBe(0);
  });
});
