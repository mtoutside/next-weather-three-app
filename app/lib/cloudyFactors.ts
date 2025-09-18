export type CloudyFactors = {
  waveFreq: number;
  waveAmp: number;
  secondaryAmp: number;
  swirlStrength: number;
  opacity: number;
  hueShift: number;
};

export type ComputeCloudyFactorsParams = {
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

export function computeCloudyFactors({
  temp01 = 0.5,
  precip01 = 0,
  wind01 = 0,
}: ComputeCloudyFactorsParams): CloudyFactors {
  const temp = clamp01(temp01);
  const precip = clamp01(precip01);
  const wind = clamp01(wind01);

  const waveFreq = 0.8 + precip * 1.1 + wind * 0.4;
  const waveAmp = 0.35 + precip * 0.45 + (1 - temp) * 0.2;
  const secondaryAmp = 0.12 + wind * 0.18;
  const swirlStrength = 0.1 + wind * 0.4;
  const opacity = 0.65 + precip * 0.25 + (1 - temp) * 0.05;
  const hueShift = (1 - temp) * 0.08 + precip * 0.05;

  return {
    waveFreq,
    waveAmp,
    secondaryAmp,
    swirlStrength,
    opacity: Math.min(opacity, 1),
    hueShift,
  };
}
