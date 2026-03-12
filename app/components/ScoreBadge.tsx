"use client";

import { getScoreLabel } from "../lib/weather";

interface Props {
  score: number;
  large?: boolean;
  compact?: boolean;
}

export default function ScoreBadge({ score, large = false, compact = false }: Props) {
  const { label, color } = getScoreLabel(score);
  const bg =
    score >= 75
      ? "bg-green-900/40 border-green-500/40"
      : score >= 50
      ? "bg-lime-900/40 border-lime-500/40"
      : score >= 30
      ? "bg-yellow-900/40 border-yellow-500/40"
      : "bg-red-900/40 border-red-500/40";

  if (large) {
    return (
      <div className={`inline-flex flex-col items-center px-4 py-2 rounded-xl border ${bg}`}>
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className={`text-sm ${color}`}>{label}</span>
      </div>
    );
  }

  if (compact) {
    return (
      <span className={`inline-block px-1.5 py-0.5 rounded border text-xs font-bold ${bg} ${color} shrink-0`}>
        {score}
      </span>
    );
  }

  return (
    <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-semibold ${bg} ${color}`}>
      {score} · {label}
    </span>
  );
}
