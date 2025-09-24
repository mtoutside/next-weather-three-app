'use client';
import { useMemo, useState } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeatherData } from './hooks/useWeatherData';
import UnifiedWeatherScene from './components/UnifiedWeatherScene';
import TweakpanePanel from './components/TweakpanePanel';
import { weathercodeToJa, getWeathercodeOptions } from './lib/weathercode';
import styles from './page.module.css';

export default function WeatherApp() {
  const [lat, setLat] = useState<string>('35.6762'); // Tokyo
  const [lon, setLon] = useState<string>('139.6503');
  const geo = useGeolocation({ enableHighAccuracy: false, maximumAge: 60_000 });
  const { weatherData, loading, error, fetchWeatherData } = useWeatherData();

  // TweakPane用の調整可能パラメータ（初期値固定で無限再レンダーを防ぐ）
  const [tweakParams, setTweakParams] = useState({
    tempOverride: 0.5,
    windOverride: 0,
    weathercodeOverride: 0,
    useRealData: true, // 実データ使用フラグ
  });

  const disabled = useMemo(() => loading, [loading]);

  const handleFetchData = () => {
    fetchWeatherData(lat, lon);
  };

  // 天気コード選択肢
  const weathercodeOptions = useMemo(() => getWeathercodeOptions(), []);

  // 実データまたはTweakパラメータの決定
  const finalParams = useMemo(() => {
    if (tweakParams.useRealData && weatherData) {
      return {
        temp01: weatherData.temp01,
        precip01: weatherData.precip01,
        wind01: weatherData.wind01,
        weathercode: weatherData.weathercode,
      };
    }
    return {
      temp01: tweakParams.tempOverride,
      precip01: 0,
      wind01: tweakParams.windOverride,
      weathercode: tweakParams.weathercodeOverride,
    };
  }, [weatherData, tweakParams]);

  return (
    <div className={styles.page} style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 統合背景シェーダ + 3Dオブジェクト - 画面全体を覆う */}
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
        <UnifiedWeatherScene
          temp01={finalParams.temp01}
          precip01={finalParams.precip01}
          wind01={finalParams.wind01}
          weathercode={finalParams.weathercode}
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
          <section style={{ marginTop: 'auto' }}>
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
      </main>

      {/* TweakPane デバッグパネル */}
      <TweakpanePanel
        title="Weather Debug Panel"
        params={tweakParams}
        onParamsChange={(newParams) => setTweakParams(newParams as typeof tweakParams)}
        customOptions={{
          weathercodeOverride: weathercodeOptions,
        }}
      />
    </div>
  );
}
