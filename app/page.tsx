'use client';
import { useMemo, useState } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeatherData } from './hooks/useWeatherData';
import WeatherThreeScene from './components/WeatherThreeScene';
import WeatherObject from './components/WeatherObject';
import { weathercodeToJa } from './lib/weathercode';
import styles from './page.module.css';

export default function WeatherApp() {
  const [lat, setLat] = useState<string>('35.6762'); // Tokyo
  const [lon, setLon] = useState<string>('139.6503');
  const geo = useGeolocation({ enableHighAccuracy: false, maximumAge: 60_000 });
  const { weatherData, loading, error, fetchWeatherData } = useWeatherData();

  const disabled = useMemo(() => loading, [loading]);

  const handleFetchData = () => {
    fetchWeatherData(lat, lon);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Weather App</h1>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>リアルタイム天気予報</p>
        </header>

        {/* 位置情報・データ取得セクション */}
        <section style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              緯度:
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="35.6762"
                style={{ width: 100, padding: 4 }}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              経度:
              <input
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="139.6503"
                style={{ width: 100, padding: 4 }}
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
              style={{ padding: '4px 12px' }}
            >
              {geo.status === 'loading' ? '取得中…' : '現在地'}
            </button>
            <button
              onClick={handleFetchData}
              disabled={disabled}
              style={{ padding: '4px 16px', fontWeight: 600 }}
            >
              {loading ? '読み込み中…' : '天気取得'}
            </button>
          </div>

          {error && <p style={{ color: 'crimson', textAlign: 'center' }}>エラー: {error}</p>}
          {geo.error && (
            <p style={{ color: '#b26a00', textAlign: 'center' }}>位置情報エラー: {geo.error}</p>
          )}
        </section>

        {/* 天気情報表示セクション */}
        {weatherData && (
          <section style={{ marginBottom: '2rem' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#888' }}>天気</h3>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
                    {weatherData.weathercode != null
                      ? weathercodeToJa(weatherData.weathercode)
                      : '不明'}
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#888' }}>気温</h3>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                    {weatherData.temperature_2m}°C
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#888' }}>降水確率</h3>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
                    {weatherData.precipitation_probability ?? '--'}%
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#888' }}>風速</h3>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
                    {weatherData.windspeed_10m ?? '--'} m/s
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3Dビジュアライゼーションセクション */}
        <section style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              minHeight: '60vh',
            }}
          >
            {/* 背景シェーダ */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
                天気に応じた背景エフェクト
              </h3>
              <WeatherThreeScene
                temp01={weatherData?.temp01}
                precip01={weatherData?.precip01}
                wind01={weatherData?.wind01}
              />
            </div>

            {/* 3Dオブジェクト */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
                天気に応じた3Dオブジェクト
                {weatherData?.weathercode != null && (
                  <small style={{ display: 'block', color: '#888', fontWeight: 400 }}>
                    (コード: {weatherData.weathercode})
                  </small>
                )}
              </h3>
              <WeatherObject
                weathercode={weatherData?.weathercode}
                temp01={weatherData?.temp01}
                precip01={weatherData?.precip01}
                wind01={weatherData?.wind01}
              />
            </div>
          </div>
        </section>

        {/* フッター・リンク */}
        <footer style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/open-meteo" style={{ color: '#888', textDecoration: 'none' }}>
              データ確認ページ
            </a>
            <a href="/fbo-example" style={{ color: '#888', textDecoration: 'none' }}>
              FBO例
            </a>
            <a href="/three" style={{ color: '#888', textDecoration: 'none' }}>
              Three.jsデモ
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
