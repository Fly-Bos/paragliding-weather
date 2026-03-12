"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ForecastHour, WindHeight } from "../types/weather";
import { formatTime } from "../lib/weather";

function windSpeedForHeight(h: ForecastHour, height: WindHeight) {
  if (height === 10)  return h.windSpeed10m;
  if (height === 120) return h.windSpeed120m;
  if (height === 180) return h.windSpeed180m;
  return h.windSpeed80m;
}

interface Props {
  hours: ForecastHour[];
  height: WindHeight;
}

export default function WindChart({ hours, height }: Props) {
  const heightKey = `${height}м`;
  const daytime = hours.filter((h) => {
    const hr = new Date(h.time).getHours();
    return hr >= 5 && hr <= 21;
  });

  const data = daytime.map((h) => ({
    isoTime: h.time,
    time: formatTime(h.time),
    "10м": +h.windSpeed10m.toFixed(1),
    [heightKey]: +windSpeedForHeight(h, height).toFixed(1),
    Порывы: +h.windGusts.toFixed(1),
  }));

  // Первый час каждого дня — для разделителей и меток
  const dayStartTimes = new Set<string>();
  const dayBoundaryTimes: string[] = [];
  const seenDays = new Set<string>();
  data.forEach((d) => {
    const day = new Date(d.isoTime).toDateString();
    if (!seenDays.has(day)) {
      seenDays.add(day);
      dayStartTimes.add(d.isoTime);
      if (dayStartTimes.size > 1) dayBoundaryTimes.push(d.isoTime);
    }
  });

  const tickFormatter = (isoTime: string) => {
    const d = new Date(isoTime);
    if (dayStartTimes.has(isoTime)) {
      return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric" });
    }
    return formatTime(isoTime);
  };

  // Показываем каждые 2 часа, но всегда включаем первый час дня
  const tickIndices = data.reduce<number[]>((acc, d, i) => {
    if (dayStartTimes.has(d.isoTime) || i % 2 === 0) acc.push(i);
    return acc;
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
      <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">Ветер (м/с) — 7 дней · 10м и {height}м</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="isoTime"
            ticks={tickIndices.map((i) => data[i].isoTime)}
            tickFormatter={tickFormatter}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          {dayBoundaryTimes.map((t) => (
            <ReferenceLine
              key={t}
              x={t}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 2"
            />
          ))}
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              color: "#e5e7eb",
              fontSize: 11,
              padding: "4px 8px",
            }}
            labelStyle={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}
            itemStyle={{ padding: "1px 0" }}
            formatter={(value, name) => [`${value} м/с`, name]}
            labelFormatter={(isoTime) => {
              if (typeof isoTime !== "string") return String(isoTime);
              const d = new Date(isoTime);
              return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) +
                " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
            }}
          />
          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
          <ReferenceLine y={7} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
          <ReferenceLine y={3} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="10м"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
          />
          {height !== 10 && (
            <Line
              type="monotone"
              dataKey={heightKey}
              stroke="#a78bfa"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          )}
          <Line
            type="monotone"
            dataKey="Порывы"
            stroke="#fb923c"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="2 3"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="text-green-400">── 3 м/с</span> идеал
        <span className="text-red-400">── 7 м/с</span> предел
      </div>
    </div>
  );
}
