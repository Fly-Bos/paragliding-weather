"use client";

import { useEffect, useState } from "react";
import { ForecastHour, WeatherModel } from "../types/weather";
import WindArrow from "./WindArrow";
import ScoreBadge from "./ScoreBadge";
import WeatherIcon from "./WeatherIcon";

function windDirLabel(deg: number): string {
  const dirs = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  return dirs[Math.round(deg / 45) % 8];
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
}

interface Props {
  name: string;
  lat: number;
  lon: number;
  winds: string;
  dateStr: string;
  model: WeatherModel;
  locationId?: string;
  onClose: () => void;
}

export default function LocationPopup({ name, lat, lon, winds, dateStr, model, locationId, onClose }: Props) {
  const [hours, setHours] = useState<ForecastHour[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setHours(null);
    setError(false);
    const params = new URLSearchParams({ lat: String(lat), lon: String(lon), winds, model });
    fetch(`/api/weather?${params}`)
      .then((r) => r.json())
      .then((data: ForecastHour[]) => {
        setHours(data.filter((h) => {
          if (!h.time.startsWith(dateStr)) return false;
          const hr = new Date(h.time).getHours();
          return hr >= 10 && hr <= 20;
        }));
      })
      .catch(() => setError(true));
  }, [lat, lon, winds, dateStr, model]);

  const forecastHref = locationId
    ? `/forecast?loc=${locationId}&model=${model}`
    : `/forecast?lat=${lat}&lon=${lon}&winds=${encodeURIComponent(winds)}&name=${encodeURIComponent(name)}&model=${model}`;

  const yandexHref = `https://yandex.ru/maps/?pt=${lon},${lat}&z=14&l=sat`;
  const windyHref = `https://www.windy.com/?${lat},${lon},12`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:px-3"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-gray-900 border-t sm:border border-white/10 sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <div className="text-sm font-semibold text-white">{name}</div>
            <div className="text-xs text-gray-500 capitalize">{formatDayLabel(dateStr)}</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={forecastHref}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              Подробнее
            </a>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors text-lg leading-none px-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Location info */}
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {winds !== "–" && <span>Ветер: <span className="text-gray-300">{winds}</span></span>}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a href={yandexHref} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors">
              Яндекс.Карты
            </a>
            <a href={windyHref} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors">
              Windy
            </a>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2 overflow-y-auto flex-1">
          {error && (
            <div className="text-center text-red-400 text-sm py-6">Ошибка загрузки</div>
          )}
          {!error && !hours && (
            <div className="text-center text-gray-500 text-sm py-6">Загрузка...</div>
          )}
          {hours && hours.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-6">Нет данных</div>
          )}
          {hours && hours.length > 0 && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-600 border-b border-white/5">
                  <th className="text-left pb-1.5 font-normal">Час</th>
                  <th className="text-center pb-1.5 font-normal">Оценка</th>
                  <th className="text-center pb-1.5 font-normal">Ветер 80м</th>
                  <th className="text-right pb-1.5 font-normal">Пор.</th>
                  <th className="text-right pb-1.5 font-normal">°C / ☁м</th>
                </tr>
              </thead>
              <tbody>
                {hours.map((h) => {
                  const hr = new Date(h.time).getHours();
                  const dirColor =
                    h.windDirMatch === "perfect" ? "text-green-400" :
                    h.windDirMatch === "good"    ? "text-lime-400" :
                    h.windDirMatch === "off"     ? "text-yellow-400" :
                    h.windDirMatch === "bad"     ? "text-red-400" :
                                                   "text-gray-400";
                  return (
                    <tr key={h.time} className="border-b border-white/5 last:border-0">
                      <td className="py-1.5 text-gray-400">{hr}:00</td>
                      <td className="py-1.5 text-center">
                        <ScoreBadge score={h.flyingScore} compact />
                      </td>
                      <td className="py-1.5">
                        <div className="flex items-center justify-center gap-1">
                          <WindArrow degrees={h.windDir80m} size={11} color="#a78bfa" />
                          <span className="text-violet-300 font-bold">{h.windSpeed80m.toFixed(1)}</span>
                          <span className={dirColor}>{windDirLabel(h.windDir80m)}</span>
                          <WeatherIcon code={h.weatherCode} />
                        </div>
                      </td>
                      <td className="py-1.5 text-right text-orange-300">↑{h.windGusts.toFixed(1)}</td>
                      <td className="py-1.5 text-right text-gray-400">
                        {h.temperature.toFixed(0)}° / {h.cloudBase}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
