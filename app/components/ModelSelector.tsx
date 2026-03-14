"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { WeatherModel } from "../types/weather";

const MODELS: { id: WeatherModel; label: string; hint: string }[] = [
  { id: "best_match",    label: "Авто",  hint: "Лучшая доступная"    },
  { id: "ecmwf_ifs025",  label: "ECMWF", hint: "Европейский, ~25км"  },
  { id: "icon_seamless", label: "ICON",  hint: "Немецкий DWD, ~11км" },
  { id: "gfs_seamless",  label: "GFS",   hint: "США NOAA, 16 дней"   },
  { id: "gem_seamless",  label: "GEM",   hint: "Канада, ~15км"       },
];

interface Props {
  current: WeatherModel;
}

export default function ModelSelector({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (model: WeatherModel) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("model", model);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 mr-1 shrink-0">Модель:</span>
      <div className="flex flex-1 gap-1">
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => handleClick(m.id)}
            title={m.hint}
            className={`flex-1 sm:flex-none text-xs px-2 py-1 rounded-md transition-colors ${
              current === m.id
                ? "bg-violet-600 text-white font-semibold"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
