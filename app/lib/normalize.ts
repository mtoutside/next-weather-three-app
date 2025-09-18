export function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * 温度(摂氏)を0..1に正規化して返す。
 * 既定レンジ: -10℃..40℃（気候に合わせて調整可）
 */
export function normalizeTempC(tempC: number, min = -10, max = 40): number {
  if (!Number.isFinite(tempC) || !Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return 0.5;
  }
  const t = (tempC - min) / (max - min);
  return clamp01(t);
}

/**
 * 降水確率(0..100%)を0..1へ正規化。異常値はクランプ。
 */
export function normalizePrecipProbability(prob: number): number {
  if (!Number.isFinite(prob)) return 0;
  return clamp01(prob / 100);
}

/**
 * 風速(m/s)を0..1へ正規化。既定レンジは 0..30m/s（台風レベルを上限想定）。
 */
export function normalizeWindSpeed(speed: number, max = 30): number {
  if (!Number.isFinite(speed) || !Number.isFinite(max) || max <= 0) return 0;
  return clamp01(speed / max);
}
