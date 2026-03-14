"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CustomLocation, loadCustomLocations, saveCustomLocations } from "./AddLocationForm";

export default function CustomLocationsList({ startIndex }: { startIndex: number }) {
  const [locs, setLocs] = useState<CustomLocation[]>([]);

  useEffect(() => {
    setLocs(loadCustomLocations());
  }, []);

  const remove = (id: string) => {
    const updated = locs.filter((l) => l.id !== id);
    saveCustomLocations(updated);
    setLocs(updated);
  };

  if (locs.length === 0) return null;

  return (
    <>
      <tr className="border-b border-white/10">
        <td colSpan={6} className="px-3 py-2 text-xs text-gray-600 font-medium bg-white/3">
          Пользовательские локации
        </td>
      </tr>
      {locs.map((loc, i) => (
        <tr key={loc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
          <td className="px-3 py-2.5 text-gray-600 text-xs">{startIndex + i + 1}</td>
          <td className="px-3 py-2.5">
            <div className="font-medium text-gray-200">{loc.name}</div>
            {loc.notes && <div className="text-xs text-gray-600">{loc.notes}</div>}
          </td>
          <td className="px-3 py-2.5 font-mono text-xs text-gray-400 whitespace-nowrap">
            {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}
          </td>
          <td className="px-3 py-2.5 text-blue-300 text-xs whitespace-nowrap">{loc.winds}</td>
          <td className="px-3 py-2.5 text-gray-600 text-xs hidden sm:table-cell">—</td>
          <td className="px-3 py-2.5 text-right">
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/forecast?lat=${loc.lat}&lon=${loc.lon}&winds=${encodeURIComponent(loc.winds)}&name=${encodeURIComponent(loc.name)}`}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap"
              >
                Прогноз
              </Link>
              <a
                href={`https://yandex.ru/maps/?ll=${loc.lon},${loc.lat}&z=15&l=sat,skl&pt=${loc.lon},${loc.lat}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-400 transition-colors whitespace-nowrap"
              >
                Карта
              </a>
              <button
                onClick={() => remove(loc.id)}
                className="text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                Удалить
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
