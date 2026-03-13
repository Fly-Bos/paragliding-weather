"use client";

import { useState } from "react";

export default function AddLocationForm() {
  const [form, setForm] = useState({ name: "", lat: "", lon: "", winds: "", notes: "" });
  const [snippet, setSnippet] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = form.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const notes = form.notes ? `, notes: "${form.notes}"` : "";
    setSnippet(
      `  { id: "${id}", name: "${form.name}", lat: ${form.lat}, lon: ${form.lon}, winds: "${form.winds}"${notes} },`
    );
  };

  const copy = () => navigator.clipboard.writeText(snippet);

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
            placeholder="Марьевка"
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
            Сгенерировать запись
          </button>
        </div>
      </form>

      {snippet && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Добавьте в <code className="text-blue-300">app/lib/locations.ts</code></span>
            <button
              onClick={copy}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Копировать
            </button>
          </div>
          <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-green-300 font-mono break-all whitespace-pre-wrap">
            {snippet}
          </pre>
        </div>
      )}
    </div>
  );
}
