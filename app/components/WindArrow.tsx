"use client";

interface Props {
  degrees: number;
  size?: number;
  color?: string;
}

export default function WindArrow({ degrees, size = 24, color = "#60a5fa" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${degrees + 180}deg)` }}
      className="inline-block"
    >
      <polygon
        points="12,2 8,18 12,15 16,18"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}
