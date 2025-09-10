import { describe, it, expect } from 'vitest';
import { weathercodeToJa } from './weathercode';

describe('weathercodeToJa', () => {
  it('主要コードを日本語に変換する', () => {
    expect(weathercodeToJa(0)).toBe('快晴');
    expect(weathercodeToJa(1)).toBe('晴れ');
    expect(weathercodeToJa(2)).toBe('薄曇り');
    expect(weathercodeToJa(3)).toBe('曇り');
    expect(weathercodeToJa(45)).toBe('霧');
    expect(weathercodeToJa(48)).toBe('着氷性の霧');
    expect(weathercodeToJa(51)).toBe('霧雨（弱）');
    expect(weathercodeToJa(55)).toBe('霧雨（強）');
    expect(weathercodeToJa(61)).toBe('雨（弱）');
    expect(weathercodeToJa(63)).toBe('雨（中）');
    expect(weathercodeToJa(65)).toBe('雨（強）');
    expect(weathercodeToJa(71)).toBe('雪（弱）');
    expect(weathercodeToJa(75)).toBe('雪（強）');
    expect(weathercodeToJa(80)).toBe('にわか雨（弱）');
    expect(weathercodeToJa(82)).toBe('にわか雨（強）');
    expect(weathercodeToJa(95)).toBe('雷雨');
    expect(weathercodeToJa(96)).toBe('ひょうを伴う雷雨（弱〜中）');
    expect(weathercodeToJa(99)).toBe('ひょうを伴う雷雨（強）');
  });

  it('未知コードは"不明"で返す', () => {
    expect(weathercodeToJa(1234)).toBe('不明');
  });
});

