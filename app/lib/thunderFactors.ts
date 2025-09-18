export type ThunderFactors = {
  jitterFreq: { x: number; y: number };
  jitterPhase: { x: number; y: number };
  jitterScale: { x: number; y: number };
  flashIntensity: number;
};

export type ComputeThunderFactorsParams = {
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

export function computeThunderFactors({ wind01 = 0 }: ComputeThunderFactorsParams): ThunderFactors {
  const wind = clamp01(wind01);

  const jitterFreq = {
    x: 70 + wind * 40,
    y: 90 + wind * 45,
  };
  const jitterPhase = {
    x: 1.2,
    y: 0.8 + wind * 1.2,
  };
  const jitterScale = {
    x: 0.004 + wind * 0.006,
    y: 0.004 + wind * 0.006,
  };
  const flashIntensity = 0.3 + wind * 0.6;

  return {
    jitterFreq,
    jitterPhase,
    jitterScale,
    flashIntensity,
  };
}
