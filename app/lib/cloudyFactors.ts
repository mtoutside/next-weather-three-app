export type CloudyFactors = {
  noiseScale: number;
  noiseStrength: number;
  wobbleStrength: number;
  flowSpeed: number;
  opacity: number;
  highlightGain: number;
  shadowStrength: number;
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

  const invTemp = 1 - temp;

  const noiseScale = 0.8 + invTemp * 0.9; // 寒いほど雲が広がる
  const noiseStrength = 0.18 + precip * 0.28 + invTemp * 0.05;
  const wobbleStrength = 0.05 + wind * 0.12;
  const flowSpeed = 0.25 + wind * 0.9;
  const opacity = 0.6 + precip * 0.25 + invTemp * 0.05;
  const highlightGain = 1.0 + invTemp * 0.35;
  const shadowStrength = 0.18 + precip * 0.25;

  return {
    noiseScale,
    noiseStrength,
    wobbleStrength,
    flowSpeed,
    opacity: Math.min(opacity, 1),
    highlightGain,
    shadowStrength,
  };
}
