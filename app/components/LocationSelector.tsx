"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LOCATIONS, Location } from "../lib/locations";

interface Props {
  current: Location;
}

export default function LocationSelector({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("loc", e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={current.id}
      onChange={handleChange}
      className="bg-gray-800 border border-white/10 text-white text-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px] sm:max-w-none"
    >
      {LOCATIONS.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  );
}
