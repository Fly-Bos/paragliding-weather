import { Suspense } from "react";
import { fetchWeather, windDirLabel, MODEL_LABELS } from "./lib/weather";
import { LOCATIONS } from "./lib/locations";
import { ForecastHour, WeatherModel } from "./types/weather";
import WindArrow from "./components/WindArrow";
import WeatherIcon, { metarToWmoCode } from "./components/WeatherIcon";
import ModelSelector from "./components/ModelSelector";
import CurrentTime from "./components/CurrentTime";
import DaysSummary from "./components/DaysSummary";
import LocationsCount from "./components/LocationsCount";

interface LocationDay {
  id: string;
  name: string;
  lat: number;
  lon: number;
  winds: string;
  hour: ForecastHour;
}

function getBestDayHour(hours: ForecastHour[], dateStr: string): ForecastHour | null {
  const dayHours = hours.filter((h) => {
    if (!h.time.startsWith(dateStr)) return false;
    const hour = new Date(h.time).getHours();
    return hour >= 10 && hour <= 16;
  });
  if (!dayHours.length) return null;
  return dayHours.reduce((best, cur) =>
    cur.flyingScore > best.flyingScore ? cur : best
  );
}

function getDayDates(hours: ForecastHour[]): string[] {
  const seen = new Set<string>();
  for (const h of hours) seen.add(h.time.split("T")[0]);
  return Array.from(seen).sort();
}


interface MetarData {
  rawOb: string;
  obsTime: number;
  temp: number;
  dewp: number;
  wdir: number | null;
  wspd: number;
  wgst: number | null;
  visib: number | string;
  altim: number;
  wxString?: string;
  clouds?: { cover: string; base: number }[];
  fltcat?: string;
}

async function fetchMetars(): Promise<Record<string, MetarData>> {
  try {
    const res = await fetch(
      "https://aviationweather.gov/api/data/metar?ids=UWOO,UWOR&format=json",
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    if (!Array.isArray(data)) return {};
    return Object.fromEntries(data.map((m: MetarData & { icaoId?: string }) => [m.icaoId ?? "", m]));
  } catch {
    return {};
  }
}

const VALID_MODELS: WeatherModel[] = ["best_match", "ecmwf_ifs025", "icon_seamless", "gfs_seamless", "gem_seamless"];
function parseModel(raw?: string): WeatherModel {
  if (VALID_MODELS.includes(raw as WeatherModel)) return raw as WeatherModel;
  return "best_match";
}

async function fetchBatched(model: WeatherModel, batchSize = 5, delayMs = 300) {
  const results = [];
  for (let i = 0; i < LOCATIONS.length; i += batchSize) {
    const batch = LOCATIONS.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((loc) =>
        fetchWeather(loc.lat, loc.lon, loc.winds, model)
          .then((hours) => ({ loc, hours }))
          .catch(() => null)
      )
    );
    results.push(...batchResults);
    if (i + batchSize < LOCATIONS.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string }>;
}) {
  const params = await searchParams;
  const model = parseModel(params.model);
  const [results, metars] = await Promise.all([fetchBatched(model), fetchMetars()]);

  const firstResult = results.find((r: { loc: { id: string }; hours: ForecastHour[] } | null) => r !== null);
  if (!firstResult) return <div className="text-white p-8">Ошибка загрузки данных</div>;
  const dates = getDayDates(firstResult.hours);

  const byDay: Record<string, LocationDay[]> = {};
  for (const dateStr of dates) {
    const items: LocationDay[] = [];
    for (const result of results) {
      if (!result) continue;
      const hour = getBestDayHour(result.hours, dateStr);
      if (!hour) continue;
      items.push({ id: result.loc.id, name: result.loc.name, lat: result.loc.lat, lon: result.loc.lon, winds: result.loc.winds, hour });
    }
    items.sort((a, b) => b.hour.flyingScore - a.hour.flyingScore);
    byDay[dateStr] = items;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

        {/* Header */}
        <header className="mb-5 sm:mb-8">
          {/* Top row: label + time */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <a href="/locations" className="flex items-center gap-1.5 text-blue-400 text-xs min-w-0 hover:text-blue-300 transition-colors">
              <span className="shrink-0">🪂</span>
              <span className="truncate">Оренбургская область · </span>
              <LocationsCount staticCount={LOCATIONS.length} />
            </a>
            <CurrentTime />
          </div>
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Сводка на 7 дней</h1>
          <p className="text-gray-500 text-xs mt-0.5 mb-2">лучший час 10–16:00 · ветер 80м</p>
          {/* Model selector — full width on mobile */}
          <Suspense>
            <ModelSelector current={model} />
          </Suspense>
        </header>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-6 sm:mb-8 text-xs">
          {[
            { label: "Отлично",   sub: "75–100", color: "text-green-400",  bg: "bg-green-900/30 border-green-600/30"  },
            { label: "Хорошо",    sub: "50–74",  color: "text-lime-400",   bg: "bg-lime-900/30 border-lime-600/30"    },
            { label: "Сложно",    sub: "30–49",  color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-600/30"},
            { label: "Не лететь", sub: "0–29",   color: "text-red-400",    bg: "bg-red-900/30 border-red-600/30"      },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2 ${item.bg}`}>
              <div className={`font-semibold text-xs sm:text-sm ${item.color}`}>{item.label}</div>
              <div className="text-gray-600 text-xs hidden sm:block">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* METAR UWOO + UWOR */}
        {Object.keys(metars).length > 0 && (() => {
          const AIRPORTS: { id: string; label: string }[] = [
            { id: "UWOO", label: "UWOO Оренбург" },
            { id: "UWOR", label: "UWOR Орск" },
          ];
          return (
            <div className="grid grid-cols-2 gap-2 mb-5 sm:mb-6">
              {AIRPORTS.map(({ id, label }) => {
                const m = metars[id];
                if (!m) return null;
                const windMs = (m.wspd * 0.514).toFixed(1);
                const gustMs = m.wgst ? (m.wgst * 0.514).toFixed(1) : null;
                const visKm = typeof m.visib === "number"
                  ? (m.visib >= 6 ? "6+" : (m.visib * 1.609).toFixed(1))
                  : m.visib;
                const qnh = m.altim ? Math.round(m.altim * 33.864) : null;
                const fltColor =
                  m.fltcat === "VFR"  ? "text-green-400" :
                  m.fltcat === "MVFR" ? "text-lime-400" :
                  m.fltcat === "IFR"  ? "text-yellow-400" :
                                        "text-red-400";
                const obsTime = new Date(m.obsTime * 1000).toLocaleString("ru-RU", {
                  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                  timeZone: "Asia/Yekaterinburg",
                });
                const wmoCode = metarToWmoCode(m.wxString, m.clouds);
                return (
                  <div key={id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <WeatherIcon code={wmoCode} size="md" />
                      <span className="text-xs font-semibold text-gray-200 flex-1">✈ {label}</span>
                      {m.fltcat && <span className={`text-xs font-bold ${fltColor}`}>{m.fltcat}</span>}
                    </div>

                    {/* Main info row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-2">
                      <span className="flex items-center gap-1">
                        {m.wdir !== null && <WindArrow degrees={m.wdir} size={12} color="#60a5fa" />}
                        <span className="text-blue-300 font-bold">{windMs}</span>
                        {gustMs && <span className="text-orange-300">↑{gustMs}</span>}
                        <span className="text-gray-500">м/с</span>
                        {m.wdir !== null && <span className="text-gray-400">{windDirLabel(m.wdir)}</span>}
                      </span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-300">{m.temp}°/{m.dewp}°</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-400">вид {visKm} км</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-400">QNH {qnh}</span>
                    </div>


                    <div className="mt-1.5 text-xs text-gray-700 text-right">{obsTime} Екб</div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Days — static + custom locations merged and ranked */}
        <DaysSummary staticByDay={byDay} dates={dates} model={model} />

        {/* Scoring explanation */}
        <section className="mt-4 mb-6 bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-sm text-gray-400 space-y-4">
          <h2 className="text-base font-semibold text-gray-200">Как считается оценка</h2>
          <p className="text-gray-500 text-xs">
            Оценка рассчитывается для каждого часа на основе данных ветра на высоте 80м. Максимум — 100 баллов.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Wind direction */}
            <div>
              <div className="text-xs font-semibold text-gray-300 mb-2">Направление ветра — главный фактор</div>
              <p className="text-xs text-gray-500 mb-2">
                Рабочий диапазон: <span className="text-gray-300">0–45°</span>. За пределами 45° — полный штраф −100.
                Внутри диапазона косинусная модель: <span className="text-gray-300">−100 × (1 − cos(θ × 2))</span>
              </p>
              <div className="grid grid-cols-4 gap-1 text-xs">
                {[
                  { deg: "0°",   penalty: "0",    label: "идеал",   color: "text-green-400" },
                  { deg: "15°",  penalty: "−13",  label: "отлично", color: "text-green-400" },
                  { deg: "22°",  penalty: "−29",  label: "хорошо",  color: "text-lime-400"  },
                  { deg: "30°",  penalty: "−50",  label: "сложно",  color: "text-yellow-400"},
                  { deg: "37°",  penalty: "−71",  label: "сложно",  color: "text-yellow-400"},
                  { deg: "45°",  penalty: "−100", label: "нельзя",  color: "text-red-400"   },
                  { deg: ">45°", penalty: "−100", label: "нельзя",  color: "text-red-400"   },
                ].map((r) => (
                  <div key={r.deg} className="bg-white/5 rounded p-1.5 text-center">
                    <div className="text-gray-300 font-mono">{r.deg}</div>
                    <div className={`font-semibold ${r.color}`}>{r.penalty}</div>
                    <div className="text-gray-600 text-xs">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other factors */}
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-300 mb-1.5">Скорость ветра (80м)</div>
                <div className="space-y-0.5 text-xs">
                  {[
                    { range: "< 3 м/с",   pen: "−35", note: "слишком слабый" },
                    { range: "3–6 м/с",   pen: "0",   note: "оптимум"        },
                    { range: "6–8 м/с",   pen: "−15", note: "риск турбул."   },
                    { range: "8–10 м/с",  pen: "−40", note: "нежелательно"   },
                    { range: "> 10 м/с",  pen: "−65", note: "опасно"         },
                  ].map((r) => (
                    <div key={r.range} className="flex justify-between gap-2">
                      <span className="text-gray-400 font-mono w-20 shrink-0">{r.range}</span>
                      <span className={`font-semibold w-8 shrink-0 ${r.pen === "0" ? "text-green-400" : "text-orange-400"}`}>{r.pen}</span>
                      <span className="text-gray-600">{r.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-300 mb-1.5">Остальные параметры</div>
                <div className="space-y-0.5 text-xs">
                  {[
                    { cond: "Порывы > ср. на 4 м/с", pen: "−20" },
                    { cond: "Порывы > ср. на 7 м/с", pen: "−40" },
                    { cond: "Сдвиг ветра 10→80м > 5", pen: "−20" },
                    { cond: "Осадки > 50%",           pen: "−40" },
                    { cond: "Осадки 20–50%",          pen: "−15" },
                    { cond: "CAPE 100–500",           pen: "−5"  },
                    { cond: "CAPE 500–1000",          pen: "−20" },
                    { cond: "CAPE > 1000",            pen: "−40" },
                  ].map((r) => (
                    <div key={r.cond} className="flex justify-between gap-2">
                      <span className="text-gray-500">{r.cond}</span>
                      <span className="text-orange-400 font-semibold shrink-0">{r.pen}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Models */}
          <div>
            <div className="text-xs font-semibold text-gray-300 mb-2">Модели прогноза</div>
            <div className="grid sm:grid-cols-2 gap-1 text-xs">
              {[
                { id: "best_match",    name: "Авто",  res: "—",      days: "7",  desc: "Open-Meteo выбирает лучшую модель автоматически" },
                { id: "ecmwf_ifs025",  name: "ECMWF", res: "~25 км", days: "10", desc: "Европейский центр, считается самым точным глобально" },
                { id: "icon_seamless", name: "ICON",  res: "~11 км", days: "7",  desc: "Немецкий DWD, высокое разрешение, хорош для России" },
                { id: "gfs_seamless",  name: "GFS",   res: "~25 км", days: "16", desc: "США NOAA, самый длинный прогноз — 16 дней" },
                { id: "gem_seamless",  name: "GEM",   res: "~15 км", days: "10", desc: "Канадская CMC, хорошая точность для средних широт" },
              ].map((m) => (
                <div key={m.id} className={`flex gap-2 rounded p-1.5 ${model === m.id ? "bg-violet-900/20 border border-violet-500/30" : "bg-white/5"}`}>
                  <span className={`font-semibold w-10 shrink-0 ${model === m.id ? "text-violet-300" : "text-gray-300"}`}>{m.name}</span>
                  <span className="text-gray-600 w-12 shrink-0">{m.res} · {m.days}д</span>
                  <span className="text-gray-500">{m.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-600">
            Данные: Open-Meteo · модель {MODEL_LABELS[model]} · прогноз обновляется каждые 30 мин · высота ветра 80м
          </p>
        </section>

        <footer className="text-center text-xs text-gray-700 py-4">
          open-meteo.com · {MODEL_LABELS[model]} · обновление каждые 30 мин
        </footer>
      </div>
    </main>
  );
}
