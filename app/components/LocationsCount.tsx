"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCustomLocations } from "../locations/AddLocationForm";

function pluralLoc(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} локация`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} локации`;
  return `${n} локаций`;
}

export default function LocationsCount({ staticCount }: { staticCount: number }) {
  const [total, setTotal] = useState(staticCount);

  useEffect(() => {
    const custom = loadCustomLocations().length;
    setTotal(staticCount + custom);
  }, [staticCount]);

  return (
    <Link href="/locations" className="hover:text-blue-300 transition-colors shrink-0">
      {pluralLoc(total)}
    </Link>
  );
}
