import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "../../lib/weather";
import { WeatherModel } from "../../types/weather";

const VALID_MODELS: WeatherModel[] = ["best_match", "ecmwf_ifs025", "icon_seamless", "gfs_seamless", "gem_seamless"];

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const lat = parseFloat(p.get("lat") ?? "");
  const lon = parseFloat(p.get("lon") ?? "");
  const winds = p.get("winds") ?? "–";
  const rawModel = p.get("model") ?? "best_match";
  const model: WeatherModel = VALID_MODELS.includes(rawModel as WeatherModel)
    ? (rawModel as WeatherModel)
    : "best_match";

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "lat/lon required" }, { status: 400 });
  }

  try {
    const hours = await fetchWeather(lat, lon, winds, model);
    return NextResponse.json(hours, {
      headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
