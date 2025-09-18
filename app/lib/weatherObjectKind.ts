export type WeatherObjectKind = 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'unknown';

const CLOUDY_CODES = new Set([2, 3, 4, 45, 48]);

const RAIN_RANGES: Array<[number, number]> = [
  [51, 67],
  [80, 82],
];

const SNOW_RANGES: Array<[number, number]> = [
  [71, 77],
  [85, 86],
];

const THUNDER_RANGE: [number, number] = [95, 99];

function isInRanges(value: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => value >= start && value <= end);
}

export function resolveWeatherObjectKind(weathercode?: number): WeatherObjectKind {
  if (typeof weathercode !== 'number' || Number.isNaN(weathercode)) {
    return 'unknown';
  }

  if (weathercode === 0 || weathercode === 1) {
    return 'clear';
  }

  if (CLOUDY_CODES.has(weathercode)) {
    return 'cloudy';
  }

  if (isInRanges(weathercode, RAIN_RANGES)) {
    return 'rain';
  }

  if (isInRanges(weathercode, SNOW_RANGES)) {
    return 'snow';
  }

  if (weathercode >= THUNDER_RANGE[0] && weathercode <= THUNDER_RANGE[1]) {
    return 'thunder';
  }

  return 'unknown';
}
