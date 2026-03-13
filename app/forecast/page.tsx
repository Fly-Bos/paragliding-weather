import { Suspense } from "react";
import Link from "next/link";
import { fetchWeather, MODEL_LABELS } from "../lib/weather";
import { findLocation } from "../lib/locations";
import { ForecastHour, WindHeight, WeatherModel } from "../types/weather";
import DaySection from "../components/DaySection";
import WindChart from "../components/WindChart";
import LocationSelector from "../components/LocationSelector";
import HeightSelector from "../components/HeightSelector";
import ModelSelector from "../components/ModelSelector";
import CurrentTime from "../components/CurrentTime";

function groupByDay(hours: ForecastHour[]): Record<string, ForecastHour[]> {
  const groups: Record<string, ForecastHour[]> = {};
  for (const hour of hours) {
    const day = hour.time.split("T")[0];
    if (!groups[day]) groups[day] = [];
    groups[day].push(hour);
  }
  return groups;
}

function parseHeight(raw?: string): WindHeight {
  const n = Number(raw);
  if (n === 10 || n === 80 || n === 120 || n === 180) return n;
  return 80;
}

const VALID_MODELS: WeatherModel[] = ["best_match", "ecmwf_ifs025", "icon_seamless", "gfs_seamless", "gem_seamless"];
function parseModel(raw?: string): WeatherModel {
  if (VALID_MODELS.includes(raw as WeatherModel)) return raw as WeatherModel;
  return "best_match";
}

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; height?: string; model?: string; lat?: string; lon?: string; winds?: string; name?: string }>;
}) {
  const params = await searchParams;
  const height = parseHeight(params.height);
  const model = parseModel(params.model);

  // Кастомная локация передаётся через lat/lon/winds/name
  const customLat = parseFloat(params.lat ?? "");
  const customLon = parseFloat(params.lon ?? "");
  const isCustom = !isNaN(customLat) && !isNaN(customLon);

  const location = isCustom
    ? { id: "custom", name: params.name ?? "Локация", lat: customLat, lon: customLon, winds: params.winds ?? "–", notes: undefined }
    : findLocation(params.loc ?? "maryevka");

  const hours = await fetchWeather(location.lat, location.lon, location.winds, model);
  const byDay = groupByDay(hours);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

        {/* Header */}
        <header className="mb-6 sm:mb-8">
          {/* Back + title */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 text-sm shrink-0"
            >
              ← Сводка
            </Link>
            <h1 className="text-xl sm:text-3xl font-bold text-white truncate">{location.name}</h1>
          </div>

          {/* Controls — только для стандартных локаций */}
          {!isCustom && (
            <div className="flex flex-col gap-2">
              <Suspense>
                <LocationSelector current={location} />
              </Suspense>
              <div className="flex flex-wrap gap-2">
                <Suspense>
                  <HeightSelector current={height} />
                </Suspense>
                <Suspense>
                  <ModelSelector current={model} />
                </Suspense>
              </div>
            </div>
          )}
          {isCustom && (
            <div className="flex flex-wrap gap-2">
              <Suspense>
                <HeightSelector current={height} />
              </Suspense>
              <Suspense>
                <ModelSelector current={model} />
              </Suspense>
            </div>
          )}

          {/* Meta */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            <a
              href={`https://yandex.ru/maps/?ll=${location.lon},${location.lat}&z=14&l=sat,skl&pt=${location.lon},${location.lat}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            </a>
            <a
              href={`https://www.windy.com/${location.lat.toFixed(3)}/${location.lon.toFixed(3)}/wind?${location.lat.toFixed(3)},${location.lon.toFixed(3)},13`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Windy
            </a>
            {location.winds !== "–" && (
              <span>
                Рабочий: <span className="text-blue-300">{location.winds}</span>
                {location.notes && <span className="ml-1 text-gray-600">· {location.notes}</span>}
              </span>
            )}
            <span className="sm:ml-auto"><CurrentTime /></span>
          </div>
        </header>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-5 sm:mb-6 text-xs">
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

        {/* Wind chart */}
        <WindChart hours={hours} height={height} />

        {/* Cape explanation */}
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-3 mb-6 text-xs text-gray-400 flex flex-wrap gap-2 sm:gap-4">
          <span className="font-semibold text-gray-300">CAPE:</span>
          <span className="text-gray-500">&lt;100 — спокойно</span>
          <span className="text-yellow-400">100–500 — слабые термики</span>
          <span className="text-orange-400">500–1000 — сильные</span>
          <span className="text-red-400">&gt;1000 — опасно</span>
        </div>

        {/* Days */}
        {Object.entries(byDay).map(([date, dayHours]) => (
          <DaySection key={date} date={`${date}T00:00`} hours={dayHours} height={height} />
        ))}

        <footer className="text-center text-xs text-gray-700 py-4">
          open-meteo.com · {MODEL_LABELS[model]} · оценка по 80м · обновление каждые 30 мин
        </footer>
      </div>
    </main>
  );
}
