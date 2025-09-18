'use client';
import { useCallback, useMemo, useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import WeatherThreeScene from '../components/WeatherThreeScene';
import { normalizeTempC, normalizePrecipProbability, normalizeWindSpeed } from '../lib/normalize';
import { weathercodeToJa } from '../lib/weathercode';

type Row = {
  time: string;
  temperature_2m: number;
  weathercode?: number;
  precipitation_probability?: number;
  windspeed_10m?: number;
};

export default function OpenMeteoPage() {
  const [lat, setLat] = useState<string>('35.6762'); // Tokyo
  const [lon, setLon] = useState<string>('139.6503');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geo = useGeolocation({ enableHighAccuracy: false, maximumAge: 60_000 });
  const temp01 = useMemo(() => {
    const t = rows?.[0]?.temperature_2m;
    return typeof t === 'number' ? normalizeTempC(t) : undefined;
  }, [rows]);
  const precip01 = useMemo(() => {
    const p = rows?.[0]?.precipitation_probability;
    return typeof p === 'number' ? normalizePrecipProbability(p) : undefined;
  }, [rows]);
  const wind01 = useMemo(() => {
    const w = rows?.[0]?.windspeed_10m;
    return typeof w === 'number' ? normalizeWindSpeed(w) : undefined;
  }, [rows]);

  const disabled = useMemo(() => loading, [loading]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      const url = `/api/jma?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`request failed: ${res.status}`);
      const data = await res.json();
      const times: string[] = data?.hourly?.time ?? [];
      const temps: number[] = data?.hourly?.temperature_2m ?? [];
      const wcodes: number[] = data?.hourly?.weathercode ?? [];
      const probs: number[] = data?.hourly?.precipitation_probability ?? [];
      const winds: number[] = data?.hourly?.windspeed_10m ?? [];
      const len = Math.min(
        times.length,
        temps.length || Number.POSITIVE_INFINITY,
        wcodes.length || Number.POSITIVE_INFINITY,
        probs.length || Number.POSITIVE_INFINITY,
        winds.length || Number.POSITIVE_INFINITY,
      );
      const out: Row[] = [];
      for (let i = 0; i < Math.min(len, 8); i++) {
        out.push({
          time: times[i],
          temperature_2m: temps[i],
          weathercode: wcodes[i],
          precipitation_probability: probs[i],
          windspeed_10m: winds[i],
        });
      }
      setRows(out);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Open-Meteo Forecast API 動作確認</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <label>
          lat:
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="35.6762"
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          lon:
          <input
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="139.6503"
            style={{ marginLeft: 4 }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            if (geo.status === 'idle' || geo.status === 'error' || geo.status === 'denied')
              geo.request();
            if (geo.coords) {
              setLat(geo.coords.latitude.toFixed(4));
              setLon(geo.coords.longitude.toFixed(4));
            }
          }}
          disabled={geo.status === 'loading'}
        >
          {geo.status === 'loading' ? '現在地 取得中…' : '現在地を使う'}
        </button>
        <button onClick={fetchData} disabled={disabled}>
          {loading ? 'Loading…' : 'Fetch'}
        </button>
      </div>

      {geo.status === 'unsupported' && (
        <p style={{ color: '#b26a00' }}>このブラウザはGeolocationに対応していません。</p>
      )}
      {geo.status === 'denied' && (
        <p style={{ color: '#b26a00' }}>
          位置情報の利用が拒否されました。手入力で続行してください。
        </p>
      )}
      {geo.error && <p style={{ color: 'crimson' }}>Geo Error: {geo.error}</p>}

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {rows && (
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>time</th>
              <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>temperature_2m (°C)</th>
              <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>weathercode</th>
              <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>
                precipitation_probability (%)
              </th>
              <th style={{ border: '1px solid #ccc', padding: '4px 8px' }}>windspeed_10m (m/s)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.time}>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.time}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.temperature_2m}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>
                  {r.weathercode}{' '}
                  {typeof r.weathercode === 'number' ? `(${weathercodeToJa(r.weathercode)})` : ''}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>
                  {r.precipitation_probability ?? ''}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>
                  {r.windspeed_10m ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 16 }}>
        <h2>温度連動シェーダ</h2>
        <p style={{ marginTop: 4, color: '#666' }}>
          現在の取得データの先頭の値を使用して色や動きを変化させます。
          {typeof temp01 === 'number' && (
            <>
              {' '}
              正規化温度: <code>{temp01.toFixed(3)}</code>
            </>
          )}
          {typeof precip01 === 'number' && rows?.[0]?.precipitation_probability != null && (
            <>
              {' '}
              | 降水確率: <code>{rows[0].precipitation_probability}%</code> (
              <code>{precip01.toFixed(3)}</code>)
            </>
          )}
          {typeof wind01 === 'number' && rows?.[0]?.windspeed_10m != null && (
            <>
              {' '}
              | 風速: <code>{rows[0].windspeed_10m} m/s</code> (<code>{wind01.toFixed(3)}</code>)
            </>
          )}
          {rows?.[0]?.weathercode != null && (
            <>
              {' '}
              | 天気: <code>{weathercodeToJa(rows[0].weathercode!)}</code>
            </>
          )}
        </p>
        <WeatherThreeScene temp01={temp01} wind01={wind01} />
      </div>
    </div>
  );
}
