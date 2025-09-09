import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildJmaUrl, fetchJmaHourlyTemperature } from './jma';

describe('buildJmaUrl', () => {
  it('緯度経度と hourly=temperature_2m を含むURLを生成する', () => {
    const url = buildJmaUrl({ latitude: 35.0, longitude: 139.0 });
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe('https://api.open-meteo.com/v1/jma');
    expect(u.searchParams.get('latitude')).toBe('35');
    expect(u.searchParams.get('longitude')).toBe('139');
    expect(u.searchParams.get('hourly')).toBe('temperature_2m');
  });
});

describe('fetchJmaHourlyTemperature', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  it('hourly の time と temperature_2m をペアにして返す', async () => {
    const mockJson: { hourly: { time: string[]; temperature_2m: number[] } } = {
      hourly: {
        time: ['2025-01-02T00:00', '2025-01-02T01:00', '2025-01-02T02:00'],
        temperature_2m: [3.2, 3.0, 2.8],
      },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJson,
    } as unknown as Response);

    const result = await fetchJmaHourlyTemperature({ latitude: 35.0, longitude: 139.0 });
    expect(result).toEqual([
      { time: '2025-01-02T00:00', temperature_2m: 3.2 },
      { time: '2025-01-02T01:00', temperature_2m: 3.0 },
      { time: '2025-01-02T02:00', temperature_2m: 2.8 },
    ]);
  });

  it('API エラー時は例外を投げる', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as unknown as Response);
    await expect(fetchJmaHourlyTemperature({ latitude: 35.0, longitude: 139.0 })).rejects.toThrow(
      'JMA API request failed: 500',
    );
  });

  it('長さが不一致の場合は一致する範囲のみ返す', async () => {
    const mockJson: { hourly: { time: string[]; temperature_2m: number[] } } = {
      hourly: {
        time: ['t1', 't2'],
        temperature_2m: [10],
      },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJson,
    } as unknown as Response);
    const result = await fetchJmaHourlyTemperature({ latitude: 35, longitude: 139 });
    expect(result).toEqual([{ time: 't1', temperature_2m: 10 }]);
  });
});
