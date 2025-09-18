export type ThunderFactors = {
  jitterFreq: { x: number; y: number };
  jitterPhase: { x: number; y: number };
  jitterScale: { x: number; y: number };
  flashIntensity: number;
};

export type ComputeThunderFactorsParams = {
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

export function computeThunderFactors({
  precip01 = 0,
  wind01 = 0,
}: ComputeThunderFactorsParams): ThunderFactors {
  const precip = clamp01(precip01);
  const wind = clamp01(wind01);

  const jitterFreq = {
    x: 70 + wind * 40,
    y: 90 + wind * 45,
  };
  const jitterPhase = {
    x: 1.2 + precip * 1.8,
    y: 0.8 + wind * 1.2,
  };
  const jitterScale = {
    x: 0.004 + precip * 0.01 + wind * 0.004,
    y: 0.004 + precip * 0.008 + wind * 0.006,
  };
  const flashIntensity = 0.3 + precip * 0.4 + wind * 0.3;

  return {
    jitterFreq,
    jitterPhase,
    jitterScale,
    flashIntensity,
  };
}
