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
  wind01 = 0,
}: ComputeRainFactorsParams): RainFactors {
  const temp = clamp01(temp01);
  const wind = clamp01(wind01);

  const coldness = 1 - temp;

  const noiseScale = 0.7 + coldness * 0.6;
  const noiseStrength = 0.25 + wind * 0.15;
  const wobbleStrength = 0.06 + wind * 0.12;
  const flowSpeed = 0.45 + wind * 1.0;
  const opacity = Math.min(0.6 + coldness * 0.15, 1);
  const highlightGain = 1.0 + coldness * 0.2;
  const rippleMix = 0.2 + wind * 0.5;

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
