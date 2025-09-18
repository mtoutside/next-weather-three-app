import { describe, expect, it } from 'vitest';
import { resolveWeatherObjectKind } from './weatherObjectKind';

describe('resolveWeatherObjectKind', () => {
  it('undefined の場合は unknown を返す', () => {
    expect(resolveWeatherObjectKind(undefined)).toBe('unknown');
  });

  it('晴れ系の weathercode 0,1 を clear に分類する', () => {
    expect(resolveWeatherObjectKind(0)).toBe('clear');
    expect(resolveWeatherObjectKind(1)).toBe('clear');
  });

  it('曇り・霧系 weathercode を cloudy に分類する', () => {
    expect(resolveWeatherObjectKind(2)).toBe('cloudy');
    expect(resolveWeatherObjectKind(3)).toBe('cloudy');
    expect(resolveWeatherObjectKind(4)).toBe('cloudy');
    expect(resolveWeatherObjectKind(45)).toBe('cloudy');
    expect(resolveWeatherObjectKind(48)).toBe('cloudy');
  });

  it('雨系 weathercode を rain に分類する', () => {
    expect(resolveWeatherObjectKind(51)).toBe('rain');
    expect(resolveWeatherObjectKind(67)).toBe('rain');
    expect(resolveWeatherObjectKind(80)).toBe('rain');
    expect(resolveWeatherObjectKind(82)).toBe('rain');
  });

  it('雪系 weathercode を snow に分類する', () => {
    expect(resolveWeatherObjectKind(71)).toBe('snow');
    expect(resolveWeatherObjectKind(77)).toBe('snow');
    expect(resolveWeatherObjectKind(85)).toBe('snow');
    expect(resolveWeatherObjectKind(86)).toBe('snow');
  });

  it('雷系 weathercode を thunder に分類する', () => {
    expect(resolveWeatherObjectKind(95)).toBe('thunder');
    expect(resolveWeatherObjectKind(99)).toBe('thunder');
  });

  it('対応外の weathercode は unknown を返す', () => {
    expect(resolveWeatherObjectKind(142)).toBe('unknown');
  });
});
