import { WeatherData, ForecastHour, WindHeight } from "../types/weather";
export type { WindHeight };

// Русские обозначения сторон света → градусы
const DIR_DEG: Record<string, number> = {
  "С": 0, "ССВ": 22.5, "СВ": 45, "ВСВ": 67.5,
  "В": 90, "ВЮВ": 112.5, "ЮВ": 135, "ЮЮВ": 157.5,
  "Ю": 180, "ЮЮЗ": 202.5, "ЮЗ": 225, "ЗЮЗ": 247.5,
  "З": 270, "ЗСЗ": 292.5, "ЗС": 292.5, "СЗ": 315, "ССЗ": 337.5,
};

// Возвращает массив допустимых градусов из строки типа "Ю / ЮЮВ" или "ЗЮЗ–ЗС"
function parseWorkingWinds(winds: string): number[] {
  if (winds === "–") return [];
  const result: Set<number> = new Set();
  const ALL_DIRS = Object.keys(DIR_DEG);

  for (const part of winds.split("/").map((s) => s.trim())) {
    if (part.includes("–")) {
      // Диапазон: расширяем до всех секторов между двумя направлениями
      const [fromStr, toStr] = part.split("–").map((s) => s.trim());
      const fromDeg = DIR_DEG[fromStr];
      const toDeg = DIR_DEG[toStr];
      if (fromDeg === undefined || toDeg === undefined) continue;
      // Идём по всем 16 направлениям, берём те что в диапазоне (по кратчайшей дуге)
      for (const dir of ALL_DIRS) {
        const d = DIR_DEG[dir];
        const spanCW = ((toDeg - fromDeg + 360) % 360);
        const pos = ((d - fromDeg + 360) % 360);
        if (pos <= spanCW) result.add(d);
      }
    } else {
      const deg = DIR_DEG[part];
      if (deg !== undefined) result.add(deg);
    }
  }
  return Array.from(result);
}

// Минимальное угловое расстояние (0–180) от текущего ветра до ближайшего рабочего
function minAngularDiff(current: number, targets: number[]): number {
  let min = 180;
  for (const t of targets) {
    const diff = Math.abs(((current - t + 180 + 360) % 360) - 180);
    if (diff < min) min = diff;
  }
  return min;
}

export type WindDirMatch = "perfect" | "good" | "off" | "bad" | "any";

// Рабочий диапазон: 0–45°. За пределами 45° — полный штраф −100.
// Внутри диапазона косинусная модель: penalty = -100 × (1 − cos(θ × 2)), чтобы при 45° = −100.
// Примеры: 0°→0, 15°→−13, 22.5°→−29, 30°→−50, 45°→−100, >45°→−100
function calcWindDirMatch(currentDeg: number, workingWinds: string): { match: WindDirMatch; penalty: number } {
  const targets = parseWorkingWinds(workingWinds);
  if (targets.length === 0) return { match: "any", penalty: 0 };

  const diff = minAngularDiff(currentDeg, targets); // 0–180°

  let penalty: number;
  if (diff > 45) {
    penalty = -100;
  } else {
    const rad = (diff * 2 * Math.PI) / 180;
    penalty = -Math.round(100 * (1 - Math.cos(rad)));
  }

  let match: WindDirMatch;
  if (diff <= 15)      match = "perfect";
  else if (diff <= 30) match = "good";
  else if (diff <= 45) match = "off";
  else                 match = "bad";

  return { match, penalty };
}

export async function fetchWeather(lat: number, lon: number, workingWinds = "–"): Promise<ForecastHour[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "wind_speed_10m",
      "wind_speed_80m",
      "wind_speed_120m",
      "wind_speed_180m",
      "wind_direction_10m",
      "wind_direction_80m",
      "wind_direction_120m",
      "wind_direction_180m",
      "wind_gusts_10m",
      "precipitation_probability",
      "precipitation",
      "cloudcover",
      "cloudcover_low",
      "cape",
      "visibility",
    ].join(",")
  );
  url.searchParams.set("wind_speed_unit", "ms");
  url.searchParams.set("timezone", "Asia/Yekaterinburg");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error("Failed to fetch weather data");

  const data: WeatherData = await res.json();
  return parseHourly(data, workingWinds);
}

function parseHourly(data: WeatherData, workingWinds: string): ForecastHour[] {
  const h = data.hourly;
  return h.time.map((time, i) => {
    const windSpeed10m = h.wind_speed_10m[i];
    const windSpeed80m = h.wind_speed_80m[i];
    const windDir80m = h.wind_direction_80m[i];
    const gusts = h.wind_gusts_10m[i];
    const precipProb = h.precipitation_probability[i];
    const cloudcover = h.cloudcover[i];
    const cape = h.cape[i];
    // Оценка и направление — всегда по 80м
    const { match: windDirMatch, penalty: windDirPenalty } = calcWindDirMatch(windDir80m, workingWinds);

    return {
      time,
      temperature: h.temperature_2m[i],
      windSpeed10m,
      windSpeed80m,
      windSpeed120m: h.wind_speed_120m[i],
      windSpeed180m: h.wind_speed_180m[i],
      windDir10m: h.wind_direction_10m[i],
      windDir80m,
      windDir120m: h.wind_direction_120m[i],
      windDir180m: h.wind_direction_180m[i],
      windGusts: gusts,
      precipProb,
      precip: h.precipitation[i],
      cloudcover,
      cloudcoverLow: h.cloudcover_low[i],
      cape,
      visibility: h.visibility[i],
      windDirMatch,
      flyingScore: calcFlyingScore({
        windSpeed: windSpeed80m,
        windSpeed80: windSpeed80m,
        gusts,
        precipProb,
        cloudcover,
        cape,
        windDirPenalty,
      }),
    };
  });
}

function calcFlyingScore({
  windSpeed,
  windSpeed80,
  gusts,
  precipProb,
  cloudcover,
  cape,
  windDirPenalty,
}: {
  windSpeed: number;
  windSpeed80: number;
  gusts: number;
  precipProb: number;
  cloudcover: number;
  cape: number;
  windDirPenalty: number;
}): number {
  let score = 100;

  // Wind at 10m:
  // < 2 м/с — слабый, смысла нет
  // 2–3 м/с — комфортно для полей
  // 3–6 м/с — оптимально
  // 6–8 м/с — возможно, но риск турбулентности
  // 8–10 м/с — нежелательно
  // > 10 м/с — опасно
  if (windSpeed < 3)       score -= 35;
  else if (windSpeed > 10) score -= 65;
  else if (windSpeed > 8)  score -= 40;
  else if (windSpeed > 6)  score -= 15;
  // 3–6 м/с — без штрафа (оптимум)

  // Сдвиг ветра по высоте (разница 10м → 80м)
  const shear = windSpeed80 - windSpeed;
  if (shear > 5) score -= 20;
  if (shear > 8) score -= 20;

  // Порывы: опасны если сильно превышают средний
  const gustDiff = gusts - windSpeed;
  if (gustDiff > 4) score -= 20;
  if (gustDiff > 7) score -= 20;

  // Осадки
  if (precipProb > 50)      score -= 40;
  else if (precipProb > 20) score -= 15;

  // Облачность
  if (cloudcover > 80) score -= 10;

  // CAPE: термики / нестабильность
  if (cape > 1000)      score -= 40;
  else if (cape > 500)  score -= 20;
  else if (cape > 100)  score -= 5;

  // Соответствие рабочему направлению ветра для этой точки
  score += windDirPenalty;

  return Math.max(0, Math.min(100, score));
}

export function getScoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 75) return { label: "Отлично", color: "text-green-400" };
  if (score >= 50) return { label: "Хорошо", color: "text-lime-400" };
  if (score >= 30) return { label: "Сложно", color: "text-yellow-400" };
  return { label: "Не лететь", color: "text-red-400" };
}

export function formatTime(isoTime: string): string {
  const d = new Date(isoTime);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(isoTime: string): string {
  const d = new Date(isoTime);
  return d.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function windDirLabel(deg: number): string {
  const dirs = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  return dirs[Math.round(deg / 45) % 8];
}
