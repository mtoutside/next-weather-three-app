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
    <div className={styles.page} style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 背景シェーダ - 画面全体を覆う */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
        }}
      >
        <WeatherThreeScene
          temp01={weatherData?.temp01}
          precip01={weatherData?.precip01}
          wind01={weatherData?.wind01}
        />
      </div>

      <main className={styles.main} style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              margin: 0,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Weather App
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.8)',
              margin: '0.5rem 0 0 0',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            リアルタイム天気予報
          </p>
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
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              緯度:
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="35.6762"
                style={{
                  width: 100,
                  padding: 4,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 4,
                }}
              />
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              経度:
              <input
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="139.6503"
                style={{
                  width: 100,
                  padding: 4,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 4,
                }}
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
              style={{
                padding: '4px 12px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {geo.status === 'loading' ? '取得中…' : '現在地'}
            </button>
            <button
              onClick={handleFetchData}
              disabled={disabled}
              style={{
                padding: '4px 16px',
                fontWeight: 600,
                backgroundColor: 'rgba(100,150,255,0.9)',
                color: 'white',
                border: '1px solid rgba(100,150,255,0.5)',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {loading ? '読み込み中…' : '天気取得'}
            </button>
          </div>

          {error && (
            <p
              style={{
                color: 'rgba(255,100,100,0.9)',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '8px',
                borderRadius: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              エラー: {error}
            </p>
          )}
          {geo.error && (
            <p
              style={{
                color: 'rgba(255,200,100,0.9)',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '8px',
                borderRadius: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              位置情報エラー: {geo.error}
            </p>
          )}
        </section>

        {/* 天気情報表示セクション */}
        {weatherData && (
          <section style={{ marginBottom: '2rem' }}>
            <div
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: '1.5rem',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
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
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>天気</h3>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>
                    {weatherData.weathercode != null
                      ? weathercodeToJa(weatherData.weathercode)
                      : '不明'}
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>気温</h3>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                    {weatherData.temperature_2m}°C
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>
                    降水確率
                  </h3>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>
                    {weatherData.precipitation_probability ?? '--'}%
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>風速</h3>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>
                    {weatherData.windspeed_10m ?? '--'} m/s
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3Dオブジェクト表示セクション */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h3
              style={{
                margin: '0 0 1rem 0',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              天気に応じた3Dオブジェクト
              {weatherData?.weathercode != null && (
                <small
                  style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 400,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  (コード: {weatherData.weathercode})
                </small>
              )}
            </h3>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              minHeight: '50vh',
            }}
          >
            <div style={{ maxWidth: '600px', width: '100%' }}>
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
            <a
              href="/open-meteo"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                transition: 'color 0.3s ease',
              }}
            >
              データ確認ページ
            </a>
            <a
              href="/fbo-example"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                transition: 'color 0.3s ease',
              }}
            >
              FBO例
            </a>
            <a
              href="/three"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                transition: 'color 0.3s ease',
              }}
            >
              Three.jsデモ
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
