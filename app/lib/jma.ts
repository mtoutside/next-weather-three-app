export type HourlyTemperature = {
  time: string;
  temperature_2m: number;
};

export function buildJmaUrl(params: { latitude: number; longitude: number }) {
  const { latitude, longitude } = params;
  // /v1/jma では降水確率が提供されないため forecast API を利用する
  const url = new URL('https://api.open-meteo.com/v1/forecast');
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

export function buildJmaUrlWithFields(params: {
  latitude: number;
  longitude: number;
  hourly: string[];
}) {
  const { latitude, longitude, hourly } = params;
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('hourly', hourly.join(','));
  url.searchParams.set('timezone', 'auto');
  return url.toString();
}

export type HourlyWeather = {
  time: string;
  temperature_2m?: number;
  weathercode?: number;
  precipitation_probability?: number;
  windspeed_10m?: number;
};

export async function fetchJmaHourlyWeather(params: {
  latitude: number;
  longitude: number;
}): Promise<HourlyWeather[]> {
  const url = buildJmaUrlWithFields({
    latitude: params.latitude,
    longitude: params.longitude,
    hourly: ['temperature_2m', 'weathercode', 'precipitation_probability', 'windspeed_10m'],
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`JMA API request failed: ${res.status}`);
  const data = (await res.json()) as {
    hourly?: {
      time?: string[];
      temperature_2m?: number[];
      weathercode?: number[];
      precipitation_probability?: number[];
      windspeed_10m?: number[];
    };
  };
  const times = data.hourly?.time ?? [];
  const t = data.hourly?.temperature_2m ?? [];
  const w = data.hourly?.weathercode ?? [];
  const p = data.hourly?.precipitation_probability ?? [];
  const ws = data.hourly?.windspeed_10m ?? [];
  // 欠損フィールドは長さ制約に含めず、存在する配列の最短に合わせる
  const lengths: number[] = [times.length];
  if (t.length) lengths.push(t.length);
  if (w.length) lengths.push(w.length);
  if (p.length) lengths.push(p.length);
  if (ws.length) lengths.push(ws.length);
  const len = Math.min(...lengths);
  const out: HourlyWeather[] = [];
  for (let i = 0; i < len; i++) {
    out.push({
      time: times[i],
      temperature_2m: t[i],
      weathercode: w[i],
      precipitation_probability: p[i],
      windspeed_10m: ws[i],
    });
  }
  return out;
}
