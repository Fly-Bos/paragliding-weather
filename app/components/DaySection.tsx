"use client";

import { ForecastHour, WindHeight } from "../types/weather";
import { formatDate } from "../lib/weather";
import HourRow from "./HourRow";
import ScoreBadge from "./ScoreBadge";

interface Props {
  date: string;
  hours: ForecastHour[];
  height: WindHeight;
}

export default function DaySection({ date, hours, height }: Props) {
  const dayHours = hours.filter((h) => {
    const hr = new Date(h.time).getHours();
    return hr >= 6 && hr < 21;
  });
  const bestDayScore = dayHours.length
    ? Math.max(...dayHours.map((h) => h.flyingScore))
    : Math.max(...hours.map((h) => h.flyingScore));

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold text-white capitalize">{formatDate(date)}</h2>
        <ScoreBadge score={bestDayScore} />
        <span className="text-xs text-gray-500">лучшее за день</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-white/10">
              <th className="py-2 px-3 text-left">Время</th>
              <th className="py-2 px-3 text-left">Оценка</th>
              <th className="py-2 px-3 text-right">Темп</th>
              <th className="py-2 px-3 text-left">
                Ветер {height}м
                {height !== 80 && (
                  <span className="ml-1 text-gray-600">(оценка по 80м)</span>
                )}
              </th>
              <th className="py-2 px-3 text-left">Порывы</th>
              <th className="py-2 px-3 text-center">Дождь</th>
              <th className="py-2 px-3 text-center">Облака</th>
              <th className="py-2 px-3 text-center">CAPE</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <HourRow key={hour.time} hour={hour} height={height} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
