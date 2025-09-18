import { useCallback, useMemo, useState } from 'react';
import { normalizeTempC, normalizePrecipProbability, normalizeWindSpeed } from '../lib/normalize';

export type WeatherRow = {
  time: string;
  temperature_2m: number;
  weathercode?: number;
  precipitation_probability?: number;
  windspeed_10m?: number;
};

export type ProcessedWeatherData = {
  temperature_2m: number;
  weathercode?: number;
  precipitation_probability?: number;
  windspeed_10m?: number;
  temp01: number;
  precip01: number;
  wind01: number;
};

export type UseWeatherDataReturn = {
  weatherData: ProcessedWeatherData | null;
  allRows: WeatherRow[] | null;
  loading: boolean;
  error: string | null;
  fetchWeatherData: (lat: string, lon: string) => Promise<void>;
};

export function useWeatherData(): UseWeatherDataReturn {
  const [rows, setRows] = useState<WeatherRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weatherData = useMemo(() => {
    const row = rows?.[0];
    if (!row) return null;

    return {
      temperature_2m: row.temperature_2m,
      weathercode: row.weathercode,
      precipitation_probability: row.precipitation_probability,
      windspeed_10m: row.windspeed_10m,
      temp01: normalizeTempC(row.temperature_2m),
      precip01:
        typeof row.precipitation_probability === 'number'
          ? normalizePrecipProbability(row.precipitation_probability)
          : 0,
      wind01: typeof row.windspeed_10m === 'number' ? normalizeWindSpeed(row.windspeed_10m) : 0,
    };
  }, [rows]);

  const fetchWeatherData = useCallback(async (lat: string, lon: string) => {
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

      const out: WeatherRow[] = [];
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
  }, []);

  return {
    weatherData,
    allRows: rows,
    loading,
    error,
    fetchWeatherData,
  };
}
