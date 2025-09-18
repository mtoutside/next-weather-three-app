export type SnowFactors = {
  blizzardFactor: number;
  snowflakeAmount: number;
  baseSaturation: number;
  baseLightness: number;
  highlightStrength: number;
};

export type ComputeSnowFactorsParams = {
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

export function computeSnowFactors({
  temp01 = 0.5,
  wind01 = 0,
}: ComputeSnowFactorsParams): SnowFactors {
  const temp = clamp01(temp01);
  const wind = clamp01(wind01);

  const blizzardFactor = 0.05 + wind * 0.4;
  const snowflakeAmount = Math.min(200, 80 + wind * 60);
  const baseSaturation = 0.12 + wind * 0.08;
  const baseLightness = 0.88 - (1 - temp) * 0.05;
  const highlightStrength = 0.35 + (1 - temp) * 0.35;

  return {
    blizzardFactor,
    snowflakeAmount,
    baseSaturation,
    baseLightness,
    highlightStrength,
  };
}
