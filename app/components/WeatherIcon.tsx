// WMO Weather interpretation codes → emoji + label
export function wmoEmoji(code: number): string {
  if (code === 0)               return "☀️";
  if (code === 1)               return "🌤️";
  if (code === 2)               return "⛅";
  if (code === 3)               return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "🌡️";
}

export function wmoLabel(code: number): string {
  if (code === 0)               return "Ясно";
  if (code === 1)               return "Преим. ясно";
  if (code === 2)               return "Перем. облачно";
  if (code === 3)               return "Пасмурно";
  if (code === 45 || code === 48) return "Туман";
  if (code >= 51 && code <= 57) return "Морось";
  if (code >= 61 && code <= 67) return "Дождь";
  if (code >= 71 && code <= 77) return "Снег";
  if (code >= 80 && code <= 82) return "Ливень";
  if (code >= 85 && code <= 86) return "Снег/ливень";
  if (code >= 95 && code <= 99) return "Гроза";
  return "–";
}

interface Props {
  code: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function WeatherIcon({ code, size = "sm", showLabel = false }: Props) {
  const emoji = wmoEmoji(code);
  const label = wmoLabel(code);
  const fontSize = size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";

  return (
    <span title={label} className={`inline-flex items-center gap-1 leading-none select-none ${fontSize}`}>
      {emoji}
      {showLabel && <span className="text-xs text-gray-400">{label}</span>}
    </span>
  );
}
