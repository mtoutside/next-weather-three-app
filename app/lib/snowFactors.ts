export type SnowFactors = {
  waveFreq: number;
  waveAmp: number;
  swirlSpeed: number;
  fogStrength: number;
  highlightMix: number;
  opacity: number;
};

export type ComputeSnowFactorsParams = {
  temp01?: number;
  precip01?: number;
  wind01?: number;
};

function clamp01(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) {
    return 0;
  }
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function computeSnowFactors({
  temp01 = 0.5,
  precip01 = 0,
  wind01 = 0,
}: ComputeSnowFactorsParams): SnowFactors {
  const temp = clamp01(temp01);
  const precip = clamp01(precip01);
  const wind = clamp01(wind01);

  const waveFreq = 0.8 + wind * 0.6;
  const waveAmp = 0.15 + precip * 0.35 + (1 - temp) * 0.2;
  const swirlSpeed = 0.4 + wind * 1.2;
  const fogStrength = 0.3 + precip * 0.5 + (1 - temp) * 0.2;
  const highlightMix = 0.4 + (1 - temp) * 0.4;
  const opacity = Math.min(0.65 + precip * 0.25 + (1 - temp) * 0.1, 1);

  return {
    waveFreq,
    waveAmp,
    swirlSpeed,
    fogStrength,
    highlightMix,
    opacity,
  };
}
