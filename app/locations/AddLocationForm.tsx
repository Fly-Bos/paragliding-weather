"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface CustomLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  winds: string;
  notes: string;
}

const STORAGE_KEY = "custom_locations";

export function loadCustomLocations(): CustomLocation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomLocations(locs: CustomLocation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locs));
}

export default function AddLocationForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", lat: "", lon: "", winds: "", notes: "" });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = "custom_" + form.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_а-яё]/gi, "") + "_" + Date.now();

    const newLoc: CustomLocation = {
      id,
      name: form.name,
      lat: parseFloat(form.lat),
      lon: parseFloat(form.lon),
      winds: form.winds,
      notes: form.notes,
    };

    const existing = loadCustomLocations();
    saveCustomLocations([...existing, newLoc]);
    setSaved(true);
    setForm({ name: "", lat: "", lon: "", winds: "", notes: "" });
    setTimeout(() => {
      setSaved(false);
      router.refresh();
    }, 1500);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Добавить локацию</h2>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Название</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Моя горка"
            className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Рабочий ветер</label>
          <input
            required
            value={form.winds}
            onChange={(e) => setForm({ ...form, winds: e.target.value })}
            placeholder="ЮЗ / Ю"
            className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Широта (lat)</label>
          <input
            required
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            placeholder="52.259647"
            className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Долгота (lon)</label>
          <input
            required
            type="number"
            step="any"
            value={form.lon}
            onChange={(e) => setForm({ ...form, lon: e.target.value })}
            placeholder="55.278912"
            className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Примечание (необязательно)</label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Сложный старт"
            className="w-full bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Сохранить локацию
          </button>
          {saved && (
            <span className="ml-3 text-sm text-green-400">Сохранено! Появится в сводке.</span>
          )}
        </div>
      </form>
    </div>
  );
}
