'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error' | 'unsupported' | 'denied';

export type Coords = { latitude: number; longitude: number };

/**
 * 位置情報を明示トリガで取得する最小フック。
 * - 初期状態は `idle`
 * - `request()` 呼び出しで処理開始
 * - 非対応時: `unsupported`
 * - 拒否時: `denied`
 */
export function useGeolocation(options?: PositionOptions) {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const request = useCallback(() => {
    setError(null);
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;
    if (!geo) {
      setStatus('unsupported');
      return;
    }
    setStatus('loading');
    requestedRef.current = true;
    geo.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        setStatus('success');
      },
      (err) => {
        setError(err?.message ?? 'geolocation error');
        // PERMISSION_DENIED = 1
        if (typeof err?.code === 'number' && err.code === 1) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      },
      options,
    );
  }, [options]);

  const state = useMemo(
    () => ({ status, coords, error, requested: requestedRef.current }),
    [status, coords, error],
  );

  return { ...state, request } as const;
}
