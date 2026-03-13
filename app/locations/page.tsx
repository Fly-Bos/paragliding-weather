import Link from "next/link";
import { LOCATIONS } from "../lib/locations";
import AddLocationForm from "./AddLocationForm";

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm shrink-0">
              ← Сводка
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Справочник локаций</h1>
          </div>
          <p className="text-gray-500 text-xs">{LOCATIONS.length} точек · Оренбургская область</p>
        </header>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-500">
                  <th className="text-left px-3 py-2 font-medium">#</th>
                  <th className="text-left px-3 py-2 font-medium">Название</th>
                  <th className="text-left px-3 py-2 font-medium">Координаты</th>
                  <th className="text-left px-3 py-2 font-medium">Ветер</th>
                  <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Примечание</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {LOCATIONS.map((loc, i) => (
                  <tr key={loc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-gray-200">{loc.name}</div>
                      <div className="text-xs text-gray-600 font-mono">{loc.id}</div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}
                    </td>
                    <td className="px-3 py-2.5 text-blue-300 text-xs whitespace-nowrap">{loc.winds}</td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs hidden sm:table-cell">
                      {loc.notes ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/forecast?loc=${loc.id}`}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add form */}
        <AddLocationForm />

      </div>
    </main>
  );
}
