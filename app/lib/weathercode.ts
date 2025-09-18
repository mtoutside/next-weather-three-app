/**
 * Open-Meteo/WMO weathercode を日本語に変換する。
 * 参考: https://open-meteo.com/en/docs
 */
const WEATHERCODE_MAP: Record<number, string> = {
  0: '快晴',
  1: '晴れ',
  2: '薄曇り',
  3: '曇り',
  45: '霧',
  48: '着氷性の霧',
  51: '霧雨（弱）',
  53: '霧雨（中）',
  55: '霧雨（強）',
  56: '着氷性の霧雨（弱）',
  57: '着氷性の霧雨（強）',
  61: '雨（弱）',
  63: '雨（中）',
  65: '雨（強）',
  66: '着氷性の雨（弱）',
  67: '着氷性の雨（強）',
  71: '雪（弱）',
  73: '雪（中）',
  75: '雪（強）',
  77: '霧雪',
  80: 'にわか雨（弱）',
  81: 'にわか雨（中）',
  82: 'にわか雨（強）',
  85: 'にわか雪（弱）',
  86: 'にわか雪（強）',
  95: '雷雨',
  96: 'ひょうを伴う雷雨（弱〜中）',
  99: 'ひょうを伴う雷雨（強）',
};

export function weathercodeToJa(code: number): string {
  return WEATHERCODE_MAP[code] ?? '不明';
}

// TweakPane用の天気コード選択肢を取得
export function getWeathercodeOptions(): Array<{ text: string; value: number }> {
  return Object.entries(WEATHERCODE_MAP).map(([code, label]) => ({
    text: `${code}: ${label}`,
    value: Number(code),
  }));
}
