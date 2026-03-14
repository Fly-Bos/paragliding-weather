"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCustomLocations, CustomLocation } from "../locations/AddLocationForm";
import { ForecastHour, WeatherModel } from "../types/weather";
import ScoreBadge from "./ScoreBadge";
import WindArrow from "./WindArrow";

function windDirLabel(deg: number): string {
  const dirs = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  return dirs[Math.round(deg / 45) % 8];
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

function getDayDates(hours: ForecastHour[]): string[] {
  const seen = new Set<string>();
  for (const h of hours) seen.add(h.time.split("T")[0]);
  return Array.from(seen).sort();
}

interface DayEntry {
  loc: CustomLocation;
  hour: ForecastHour;
}

export default function CustomLocations({ model, dates }: { model: WeatherModel; dates: string[] }) {
  const [byDay, setByDay] = useState<Record<string, DayEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locs = loadCustomLocations();
    if (locs.length === 0) { setLoading(false); return; }

    Promise.all(
      locs.map((loc) =>
        fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}&winds=${encodeURIComponent(loc.winds)}&model=${model}`)
          .then((r) => r.json())
          .then((hours: ForecastHour[]) => ({ loc, hours }))
          .catch(() => null)
      )
    ).then((results) => {
      const allDates = results.find((r) => r)
        ? getDayDates(results.find((r) => r)!.hours)
        : dates;

      const map: Record<string, DayEntry[]> = {};
      for (const dateStr of allDates) {
        const entries: DayEntry[] = [];
        for (const r of results) {
          if (!r) continue;
          const hour = getBestDayHour(r.hours, dateStr);
          if (hour) entries.push({ loc: r.loc, hour });
        }
        entries.sort((a, b) => b.hour.flyingScore - a.hour.flyingScore);
        if (entries.length) map[dateStr] = entries;
      }
      setByDay(map);
      setLoading(false);
    });
  }, [model, dates]);

  const locs = typeof window !== "undefined" ? loadCustomLocations() : [];
  if (locs.length === 0) return null;
  if (loading) return (
    <div className="text-xs text-gray-600 mb-4">Загрузка пользовательских локаций...</div>
  );
  if (Object.keys(byDay).length === 0) return null;

  return (
    <>
      {Object.entries(byDay).map(([dateStr, entries]) => (
        <div key={dateStr} className="mb-2">
          <div className="text-xs text-gray-600 mb-1.5 flex items-center gap-1">
            <span className="text-blue-500">★</span>
            Мои локации · {dateStr}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2">
            {entries.map(({ loc, hour }) => {
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
                  key={loc.id}
                  href={`/forecast?lat=${loc.lat}&lon=${loc.lon}&winds=${encodeURIComponent(loc.winds)}&name=${encodeURIComponent(loc.name)}`}
                  className={`rounded-xl border p-1.5 sm:p-3 transition-all active:scale-95 hover:brightness-125 ${matchBorder}`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-medium text-gray-200 leading-tight line-clamp-2">{loc.name}</span>
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
                    <span className="text-gray-600">{new Date(hour.time).getHours()}:00</span>
                    <span className="text-gray-300">{hour.temperature.toFixed(0)}°</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
