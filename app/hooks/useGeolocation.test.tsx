// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

function defineMockGeolocation(impl: Geolocation) {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: impl,
    writable: true,
    configurable: true,
  });
}

describe('useGeolocation', () => {
  const originalGeo = navigator.geolocation;

  afterEach(() => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeo,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('returns unsupported when geolocation is not available', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });
    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.request();
    });
    expect(result.current.status).toBe('unsupported');
  });

  it('resolves success with coordinates', async () => {
    const mockGet = vi.fn((success: PositionCallback) => {
      const pos = {
        coords: {
          latitude: 35.0,
          longitude: 139.0,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as unknown as GeolocationPosition;
      // call success sync to simplify
      success(pos);
    });
    defineMockGeolocation({
      getCurrentPosition: mockGet as unknown as Geolocation['getCurrentPosition'],
      watchPosition: vi.fn() as unknown as Geolocation['watchPosition'],
      clearWatch: vi.fn() as unknown as Geolocation['clearWatch'],
    } as Geolocation);

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.request();
    });
    expect(result.current.status).toBe('success');
    expect(result.current.coords).toEqual({ latitude: 35, longitude: 139 });
  });

  it('handles permission denied as denied status', () => {
    const mockGet = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
      const err = { code: 1, message: 'Permission denied' } as GeolocationPositionError;
      error(err);
    });
    defineMockGeolocation({
      getCurrentPosition: mockGet as unknown as Geolocation['getCurrentPosition'],
      watchPosition: vi.fn() as unknown as Geolocation['watchPosition'],
      clearWatch: vi.fn() as unknown as Geolocation['clearWatch'],
    } as Geolocation);

    const { result } = renderHook(() => useGeolocation());
    act(() => {
      result.current.request();
    });
    expect(result.current.status).toBe('denied');
    expect(result.current.error).toMatch(/Permission denied/);
  });
});
