import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latitude = parseFloat(searchParams.get('lat') || '');
  const longitude = parseFloat(searchParams.get('lon') || '');
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return new Response(JSON.stringify({ error: 'lat/lon are required numbers' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // JMA モデルでは降水確率が取得できないため forecast API を利用する
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'hourly',
    'temperature_2m,weathercode,precipitation_probability,windspeed_10m',
  );
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'upstream error', status: res.status }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
