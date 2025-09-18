export type RainFactors = {
  noiseScale: number;
  noiseStrength: number;
  wobbleStrength: number;
  flowSpeed: number;
  opacity: number;
  highlightGain: number;
  rippleMix: number;
};

export type ComputeRainFactorsParams = {
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

export function computeRainFactors({
  temp01 = 0.5,
  precip01 = 0,
  wind01 = 0,
}: ComputeRainFactorsParams): RainFactors {
  const temp = clamp01(temp01);
  const precip = clamp01(precip01);
  const wind = clamp01(wind01);

  const coldness = 1 - temp;

  const noiseScale = 0.7 + coldness * 0.8 + precip * 0.3;
  const noiseStrength = 0.2 + precip * 0.45 + wind * 0.1;
  const wobbleStrength = 0.04 + wind * 0.15;
  const flowSpeed = 0.35 + wind * 1.1 + precip * 0.3;
  const opacity = Math.min(0.55 + precip * 0.35 + coldness * 0.1, 1);
  const highlightGain = 1.1 + precip * 0.3;
  const rippleMix = 0.1 + precip * 0.7;

  return {
    noiseScale,
    noiseStrength,
    wobbleStrength,
    flowSpeed,
    opacity,
    highlightGain,
    rippleMix,
  };
}
