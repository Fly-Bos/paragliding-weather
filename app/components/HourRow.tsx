"use client";

import { ForecastHour, WindHeight } from "../types/weather";
import { formatTime, windDirLabel } from "../lib/weather";
import WindArrow from "./WindArrow";
import ScoreBadge from "./ScoreBadge";
import WeatherIcon from "./WeatherIcon";

interface Props {
  hour: ForecastHour;
  height: WindHeight;
}

function windSpeedForHeight(hour: ForecastHour, h: WindHeight) {
  if (h === 10)  return hour.windSpeed10m;
  if (h === 120) return hour.windSpeed120m;
  if (h === 180) return hour.windSpeed180m;
  return hour.windSpeed80m;
}

function windDirForHeight(hour: ForecastHour, h: WindHeight) {
  if (h === 10)  return hour.windDir10m;
  if (h === 120) return hour.windDir120m;
  if (h === 180) return hour.windDir180m;
  return hour.windDir80m;
}

export default function HourRow({ hour, height }: Props) {
  const isNight = () => {
    const h = new Date(hour.time).getHours();
    return h < 6 || h >= 21;
  };

  const selSpeed = windSpeedForHeight(hour, height);
  const selDir   = windDirForHeight(hour, height);

  return (
    <tr
      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
        isNight() ? "opacity-50" : ""
      }`}
    >
      {/* Time + weather icon */}
      <td className="py-2 px-3 text-gray-300 font-mono text-sm whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <WeatherIcon code={hour.weatherCode} size="md" />
          {formatTime(hour.time)}
        </div>
      </td>

      {/* Flying score */}
      <td className="py-2 px-3">
        <ScoreBadge score={hour.flyingScore} />
      </td>

      {/* Temp */}
      <td className="py-2 px-3 text-gray-200 text-sm text-right">
        {hour.temperature.toFixed(0)}°C
      </td>

      {/* Wind at selected height — with match color based on 80m score */}
      <td className="py-2 px-3 text-sm">
        <div className="flex items-center gap-1">
          <WindArrow degrees={selDir} size={18} color="#a78bfa" />
          <span className="text-violet-300 font-semibold">
            {selSpeed.toFixed(1)}
          </span>
          <span className="text-gray-500 text-xs">м/с</span>
          <span
            className={`text-xs ml-1 font-medium ${
              hour.windDirMatch === "perfect" ? "text-green-400" :
              hour.windDirMatch === "good"    ? "text-lime-400" :
              hour.windDirMatch === "off"     ? "text-yellow-400" :
              hour.windDirMatch === "bad"     ? "text-red-400" :
              "text-gray-500"
            }`}
            title={
              hour.windDirMatch === "perfect" ? "Рабочий ветер — идеально (по 80м)" :
              hour.windDirMatch === "good"    ? "Близко к рабочему (по 80м)" :
              hour.windDirMatch === "off"     ? "Не рабочий ветер (по 80м)" :
              hour.windDirMatch === "bad"     ? "Встречный / нерабочий (по 80м)" :
              "Любой ветер подходит"
            }
          >
            {windDirLabel(selDir)}
          </span>
        </div>
      </td>

      {/* Gusts */}
      <td className="py-2 px-3 text-sm text-orange-300 font-mono">
        ↑{hour.windGusts.toFixed(1)}
        <span className="text-gray-500 text-xs ml-1">м/с</span>
      </td>

      {/* Precip prob */}
      <td className="py-2 px-3 text-sm text-center">
        <span
          className={
            hour.precipProb > 50
              ? "text-blue-400 font-semibold"
              : hour.precipProb > 20
              ? "text-blue-300"
              : "text-gray-500"
          }
        >
          {hour.precipProb}%
        </span>
      </td>

      {/* Cloud */}
      <td className="py-2 px-3 text-sm text-center text-gray-400">
        {hour.cloudcover}%
      </td>

      {/* CAPE */}
      <td className="py-2 px-3 text-sm text-center font-mono">
        <span
          className={
            hour.cape > 1000
              ? "text-red-400 font-bold"
              : hour.cape > 500
              ? "text-orange-400"
              : hour.cape > 100
              ? "text-yellow-400"
              : "text-gray-500"
          }
        >
          {hour.cape.toFixed(0)}
        </span>
      </td>

      {/* Cloud base */}
      <td className="py-2 px-3 text-sm text-center font-mono text-gray-400" title="Расчётная высота нижней кромки облаков (LCL)">
        {hour.cloudBase}м
      </td>
    </tr>
  );
}
