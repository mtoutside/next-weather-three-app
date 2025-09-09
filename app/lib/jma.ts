export type HourlyTemperature = {
  time: string;
  temperature_2m: number;
};

export function buildJmaUrl(params: { latitude: number; longitude: number }) {
  const { latitude, longitude } = params;
  const url = new URL('https://api.open-meteo.com/v1/jma');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('hourly', 'temperature_2m');
  url.searchParams.set('timezone', 'auto');
  return url.toString();
}

export async function fetchJmaHourlyTemperature(params: {
  latitude: number;
  longitude: number;
}): Promise<HourlyTemperature[]> {
  const url = buildJmaUrl(params);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`JMA API request failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    hourly?: { time?: string[]; temperature_2m?: number[] };
  };
  const times: string[] = data.hourly?.time ?? [];
  const temps: number[] = data.hourly?.temperature_2m ?? [];
  // 正常化: time と temperature_2m の長さが一致する範囲で返す
  const len = Math.min(times.length, temps.length);
  const result: HourlyTemperature[] = [];
  for (let i = 0; i < len; i++) {
    result.push({ time: times[i], temperature_2m: temps[i] });
  }
  return result;
}
