"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCustomLocations, CustomLocation } from "../locations/AddLocationForm";
import { fetchWeather } from "../lib/weather";
import { ForecastHour, WeatherModel } from "../types/weather";
import ScoreBadge from "./ScoreBadge";
import WindArrow from "./WindArrow";
import WeatherIcon from "./WeatherIcon";

function windDirLabel(deg: number): string {
  const dirs = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  return dirs[Math.round(deg / 45) % 8];
}

function getScoreLabel(score: number) {
  if (score >= 75) return { label: "Отлично", color: "text-green-400" };
  if (score >= 50) return { label: "Хорошо",  color: "text-lime-400"  };
  if (score >= 30) return { label: "Сложно",  color: "text-yellow-400" };
  return { label: "Не лететь", color: "text-red-400" };
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
}

function isToday(dateStr: string): boolean {
  const today = new Date().toLocaleDateString("ru-RU", {
    timeZone: "Asia/Yekaterinburg",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).split(".").reverse().join("-");
  return dateStr === today;
}

function getBestDayHour(hours: ForecastHour[], dateStr: string): ForecastHour | null {
  const dayHours = hours.filter((h) => {
    if (!h.time.startsWith(dateStr)) return false;
    const hour = new Date(h.time).getHours();
    return hour >= 10 && hour <= 16;
  });
  if (!dayHours.length) return null;
  return dayHours.reduce((best, cur) => cur.flyingScore > best.flyingScore ? cur : best);
}

export interface StaticLocationDay {
  id: string;
  name: string;
  winds: string;
  hour: ForecastHour;
}

interface AnyLocationDay {
  id: string;
  name: string;
  winds: string;
  hour: ForecastHour;
  href: string;
}

interface Props {
  staticByDay: Record<string, StaticLocationDay[]>;
  dates: string[];
  model: WeatherModel;
}

export default function DaysSummary({ staticByDay, dates, model }: Props) {
  const [customByDay, setCustomByDay] = useState<Record<string, AnyLocationDay[]>>({});
  const [customLoaded, setCustomLoaded] = useState(false);

  useEffect(() => {
    const locs: CustomLocation[] = loadCustomLocations();
    if (locs.length === 0) { setCustomLoaded(true); return; }

    Promise.all(
      locs.map((loc) =>
        fetchWeather(loc.lat, loc.lon, loc.winds, model)
          .then((hours) => ({ loc, hours }))
          .catch(() => null)
      )
    ).then((results) => {
      const map: Record<string, AnyLocationDay[]> = {};
      for (const dateStr of dates) {
        for (const r of results) {
          if (!r) continue;
          const hour = getBestDayHour(r.hours, dateStr);
          if (!hour) continue;
          if (!map[dateStr]) map[dateStr] = [];
          map[dateStr].push({
            id: r.loc.id,
            name: r.loc.name,
            winds: r.loc.winds,
            hour,
            href: `/forecast?lat=${r.loc.lat}&lon=${r.loc.lon}&winds=${encodeURIComponent(r.loc.winds)}&name=${encodeURIComponent(r.loc.name)}`,
          });
        }
      }
      setCustomByDay(map);
      setCustomLoaded(true);
    });
  }, [model, dates]);

  return (
    <>
      {dates.map((dateStr) => {
        const staticItems: AnyLocationDay[] = (staticByDay[dateStr] ?? []).map((item) => ({
          ...item,
          href: `/forecast?loc=${item.id}`,
        }));
        const customItems: AnyLocationDay[] = customByDay[dateStr] ?? [];

        const allItems = [...staticItems, ...customItems]
          .sort((a, b) => b.hour.flyingScore - a.hour.flyingScore)
          .slice(0, 10);

        const bestScore = allItems[0]?.hour.flyingScore ?? 0;
        const { color } = getScoreLabel(bestScore);
        const today = isToday(dateStr);

        return (
          <section key={dateStr} className="mb-5 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className={`text-sm font-bold capitalize ${today ? "text-white" : "text-gray-300"}`}>
                {formatDayLabel(dateStr)}
              </h2>
              {today && (
                <span className="text-xs font-normal bg-blue-600 text-white px-2 py-0.5 rounded-full">сегодня</span>
              )}
              {!customLoaded && (
                <span className="text-xs text-gray-600">загрузка...</span>
              )}
              <span className={`text-xs ${color} ml-auto`}>лучшее: {bestScore}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2">
              {allItems.map(({ id, name, winds, hour, href }) => {
                const matchBorder =
                  hour.windDirMatch === "perfect" ? "border-green-500/50 bg-green-900/15" :
                  hour.windDirMatch === "good"    ? "border-lime-500/40 bg-lime-900/10" :
                  hour.windDirMatch === "off"     ? "border-yellow-500/25 bg-yellow-900/5" :
                  hour.windDirMatch === "bad"     ? "border-red-500/25 bg-red-900/5" :
                                                    "border-white/10 bg-white/5";
                const dirColor =
                  hour.windDirMatch === "perfect" ? "text-green-400" :
                  hour.windDirMatch === "good"    ? "text-lime-400" :
                  hour.windDirMatch === "off"     ? "text-yellow-400" :
                  hour.windDirMatch === "bad"     ? "text-red-400" :
                                                    "text-gray-400";

                return (
                  <Link
                    key={id + dateStr}
                    href={href}
                    className={`rounded-xl border p-1.5 sm:p-3 transition-all active:scale-95 hover:brightness-125 ${matchBorder}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-xs font-medium text-gray-200 leading-tight line-clamp-1 sm:line-clamp-2">{name}</span>
                      <ScoreBadge score={hour.flyingScore} compact />
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <WindArrow degrees={hour.windDir80m} size={12} color="#a78bfa" />
                      <span className="text-violet-300 font-bold text-sm">{hour.windSpeed80m.toFixed(1)}</span>
                      <span className="text-gray-500 text-xs">м/с</span>
                      <span className={`text-xs font-medium ${dirColor}`}>{windDirLabel(hour.windDir80m)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>↑<span className="text-orange-300">{hour.windGusts.toFixed(1)}</span></span>
                      <span className="flex items-center gap-0.5">
                        <WeatherIcon code={hour.weatherCode} />
                        <span className="text-gray-600">{new Date(hour.time).getHours()}:00</span>
                      </span>
                      <span className="text-gray-300">{hour.temperature.toFixed(0)}°</span>
                    </div>
                    <div className="hidden sm:block mt-1 text-gray-600 text-xs truncate">{winds}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
