'use client';

import React from 'react';
import MappedSphereFBO from './MappedSphereFBO';

export type WeatherObjectProps = {
  weathercode?: number;
  temp01?: number;
  precip01?: number;
  wind01?: number;
};

// クリアスフィア（weathercode 0-1: 晴れ・快晴）
function ClearSphere({ temp01, precip01, wind01 }: Omit<WeatherObjectProps, 'weathercode'>) {
  return <MappedSphereFBO temp01={temp01} precip01={precip01} wind01={wind01} />;
}

// レイヤーシェル（weathercode 2-4, 45, 48: 曇り・霧）
function CloudyShell({ precip01, wind01 }: Omit<WeatherObjectProps, 'weathercode'>) {
  return (
    <div
      style={{
        width: '100%',
        height: '50vh',
        background: 'linear-gradient(45deg, rgba(150,150,150,0.3), rgba(200,200,200,0.1))',
        border: '1px solid rgba(180,180,180,0.3)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#aaa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          background: `radial-gradient(circle, rgba(180,180,180,${0.1 + (precip01 || 0) * 0.3}) 20%, transparent 70%)`,
          animation: `float ${3 + (wind01 || 0) * 2}s ease-in-out infinite`,
        }}
      />
      <span style={{ zIndex: 1 }}>
        ☁️ 曇り系オブジェクト
        <br />
        <small>
          (降水: {precip01?.toFixed(2)}, 風: {wind01?.toFixed(2)})
        </small>
      </span>
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-10px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
}

// リップルプレーン（weathercode 51-67, 80-82: 雨系）
function RainPlane({ precip01, wind01 }: Omit<WeatherObjectProps, 'weathercode'>) {
  return (
    <div
      style={{
        width: '100%',
        height: '50vh',
        background: 'linear-gradient(180deg, rgba(100,150,200,0.3), rgba(50,100,150,0.1))',
        border: '1px solid rgba(100,150,200,0.3)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7bb3d9',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: Math.floor(5 + (precip01 || 0) * 10) }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '2px',
            height: `${10 + Math.random() * 20}px`,
            background: 'rgba(100,150,200,0.7)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `rain ${0.5 + Math.random() * 0.5}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <span style={{ zIndex: 1 }}>
        🌧️ 雨系オブジェクト
        <br />
        <small>
          (降水: {precip01?.toFixed(2)}, 風: {wind01?.toFixed(2)})
        </small>
      </span>
      <style jsx>{`
        @keyframes rain {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ストリーマー（weathercode 71-77, 85-86: 雪系）
function SnowStreamer({ temp01, precip01, wind01 }: Omit<WeatherObjectProps, 'weathercode'>) {
  return (
    <div
      style={{
        width: '100%',
        height: '50vh',
        background: 'linear-gradient(180deg, rgba(200,220,250,0.3), rgba(180,200,230,0.1))',
        border: '1px solid rgba(200,220,250,0.3)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c8dcfa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: Math.floor(3 + (precip01 || 0) * 8) }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${3 + Math.random() * 4}px`,
            height: `${3 + Math.random() * 4}px`,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `snow ${2 + Math.random() * 2}s linear infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
      <span style={{ zIndex: 1 }}>
        ❄️ 雪系オブジェクト
        <br />
        <small>
          (温度: {temp01?.toFixed(2)}, 風: {wind01?.toFixed(2)})
        </small>
      </span>
      <style jsx>{`
        @keyframes snow {
          0% {
            transform: translateY(-10px) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100px) translateX(${(wind01 || 0) * 20}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// プラズマスパイア（weathercode 95-99: 雷雨系）
function ThunderstormSpire({ precip01, wind01 }: Omit<WeatherObjectProps, 'weathercode'>) {
  return (
    <div
      style={{
        width: '100%',
        height: '50vh',
        background: 'linear-gradient(45deg, rgba(80,50,120,0.4), rgba(120,80,150,0.2))',
        border: '1px solid rgba(150,100,200,0.3)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#b088d4',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '3px',
          height: '80%',
          background: 'linear-gradient(180deg, rgba(255,255,100,0.9), rgba(150,100,255,0.7))',
          left: '50%',
          top: '10%',
          transform: 'translateX(-50%)',
          animation: `lightning ${0.8 + (precip01 || 0) * 0.5}s ease-in-out infinite`,
          filter: 'blur(1px)',
        }}
      />
      <span style={{ zIndex: 1 }}>
        ⚡ 雷雨系オブジェクト
        <br />
        <small>
          (強度: {precip01?.toFixed(2)}, 風: {wind01?.toFixed(2)})
        </small>
      </span>
      <style jsx>{`
        @keyframes lightning {
          0%,
          90% {
            opacity: 0.3;
            transform: translateX(-50%) scaleY(1);
          }
          5%,
          15% {
            opacity: 1;
            transform: translateX(-50%) scaleY(1.2);
          }
          10% {
            opacity: 0.7;
            transform: translateX(-50%) scaleY(0.8);
          }
        }
      `}</style>
    </div>
  );
}

// メインコンポーネント
export default function WeatherObject({
  weathercode,
  temp01,
  precip01,
  wind01,
}: WeatherObjectProps) {
  // 天気コードに応じた3Dオブジェクトの選択
  if (weathercode == null) {
    return (
      <div
        style={{
          width: '100%',
          height: '50vh',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
        }}
      >
        天気データを取得してください
      </div>
    );
  }

  // クリアスフィア（晴れ・快晴）
  if (weathercode === 0 || weathercode === 1) {
    return <ClearSphere temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  // レイヤーシェル（曇り・霧）
  if ([2, 3, 4, 45, 48].includes(weathercode)) {
    return <CloudyShell temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  // リップルプレーン（雨系）
  if ((weathercode >= 51 && weathercode <= 67) || (weathercode >= 80 && weathercode <= 82)) {
    return <RainPlane temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  // ストリーマー（雪系）
  if ((weathercode >= 71 && weathercode <= 77) || (weathercode >= 85 && weathercode <= 86)) {
    return <SnowStreamer temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  // プラズマスパイア（雷雨系）
  if (weathercode >= 95 && weathercode <= 99) {
    return <ThunderstormSpire temp01={temp01} precip01={precip01} wind01={wind01} />;
  }

  // その他の天気コード
  return (
    <div
      style={{
        width: '100%',
        height: '50vh',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
      }}
    >
      未対応の天気コード: {weathercode}
    </div>
  );
}
