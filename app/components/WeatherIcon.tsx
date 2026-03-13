// WMO Weather interpretation codes → Material Symbols (Google Fonts)
// https://fonts.google.com/icons

export function wmoLabel(code: number): string {
  if (code === 0)                return "Ясно";
  if (code === 1)                return "Преим. ясно";
  if (code === 2)                return "Перем. облачно";
  if (code === 3)                return "Пасмурно";
  if (code === 45 || code === 48) return "Туман";
  if (code >= 51 && code <= 57)  return "Морось";
  if (code >= 61 && code <= 67)  return "Дождь";
  if (code >= 71 && code <= 77)  return "Снег";
  if (code >= 80 && code <= 82)  return "Ливень";
  if (code >= 85 && code <= 86)  return "Снег/ливень";
  if (code >= 95 && code <= 99)  return "Гроза";
  return "–";
}

// Material Symbols icon name + color
function wmoIcon(code: number): { icon: string; color: string } {
  if (code === 0)                return { icon: "wb_sunny",           color: "#facc15" }; // ясно
  if (code === 1)                return { icon: "partly_cloudy_day",  color: "#fbbf24" }; // преим. ясно
  if (code === 2)                return { icon: "partly_cloudy_day",  color: "#94a3b8" }; // перем. облачно
  if (code === 3)                return { icon: "cloud",              color: "#94a3b8" }; // пасмурно
  if (code === 45 || code === 48) return { icon: "foggy",             color: "#9ca3af" }; // туман
  if (code >= 51 && code <= 57)  return { icon: "grain",             color: "#93c5fd" }; // морось
  if (code >= 61 && code <= 67)  return { icon: "rainy",             color: "#60a5fa" }; // дождь
  if (code >= 71 && code <= 77)  return { icon: "ac_unit",           color: "#bfdbfe" }; // снег
  if (code >= 80 && code <= 82)  return { icon: "rainy",             color: "#3b82f6" }; // ливень
  if (code >= 85 && code <= 86)  return { icon: "weather_mix",       color: "#bfdbfe" }; // снег+дождь
  if (code >= 95 && code <= 99)  return { icon: "thunderstorm",      color: "#a78bfa" }; // гроза
  return { icon: "device_thermostat", color: "#6b7280" };
}

interface Props {
  code: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function WeatherIcon({ code, size = "sm", showLabel = false }: Props) {
  const { icon, color } = wmoIcon(code);
  const label = wmoLabel(code);
  const fontSize = size === "lg" ? "24px" : size === "md" ? "20px" : "16px";

  return (
    <span title={label} className="inline-flex items-center gap-1 leading-none select-none">
      <span
        className="material-symbols-outlined"
        style={{ fontSize, color, lineHeight: 1, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        {icon}
      </span>
      {showLabel && <span className="text-xs text-gray-400">{label}</span>}
    </span>
  );
}
