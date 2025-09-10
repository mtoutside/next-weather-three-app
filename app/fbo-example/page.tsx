"use client";
import React, { useMemo, useState } from 'react';
import MappedSphereFBO from '../components/MappedSphereFBO';
import { normalizeTempC } from '../lib/normalize';

export default function FboExamplePage() {
  const [tempC, setTempC] = useState(20);
  const temp01 = useMemo(() => normalizeTempC(tempC), [tempC]);
  return (
    <div style={{ padding: 24 }}>
      <h1>FBO マッピング最小例（fbm→テクスチャ→Sphere）</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label>
          tempC:
          <input
            type="number"
            step="1"
            value={tempC}
            onChange={(e) => setTempC(Number(e.target.value))}
            style={{ marginLeft: 6, width: 100 }}
          />
        </label>
        <span>正規化: {temp01.toFixed(3)}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <MappedSphereFBO temp01={temp01} />
      </div>
    </div>
  );
}

