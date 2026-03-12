"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { WindHeight } from "../types/weather";

const HEIGHTS: WindHeight[] = [10, 80, 120, 180];

interface Props {
  current: WindHeight;
}

export default function HeightSelector({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (h: WindHeight) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("height", String(h));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 mr-1">Высота:</span>
      {HEIGHTS.map((h) => (
        <button
          key={h}
          onClick={() => handleClick(h)}
          className={`text-xs px-2 py-1 rounded-md transition-colors ${
            current === h
              ? "bg-blue-600 text-white font-semibold"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          {h}м
        </button>
      ))}
    </div>
  );
}
