export type WindHeight = 10 | 80 | 120 | 180;
export type WeatherModel = "best_match" | "ecmwf_ifs025" | "icon_seamless" | "gfs_seamless" | "gem_seamless";

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  wind_speed_10m: number[];
  wind_speed_80m: number[];
  wind_speed_100m: number[];
  wind_speed_120m: number[];
  wind_speed_180m: number[];
  wind_direction_10m: number[];
  wind_direction_80m: number[];
  wind_direction_100m: number[];
  wind_direction_120m: number[];
  wind_direction_180m: number[];
  wind_gusts_10m: number[];
  dew_point_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  cloudcover: number[];
  cloudcover_low: number[];
  cape: number[];
  visibility: number[];
  weather_code: number[];
}

export interface WeatherData {
  hourly: HourlyWeather;
  hourly_units: Record<string, string>;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ForecastHour {
  time: string;
  temperature: number;
  windSpeed10m: number;
  windSpeed80m: number;
  windSpeed120m: number;
  windSpeed180m: number;
  windDir10m: number;
  windDir80m: number;
  windDir120m: number;
  windDir180m: number;
  windGusts: number;
  precipProb: number;
  precip: number;
  cloudcover: number;
  cloudcoverLow: number;
  cape: number;
  visibility: number;
  flyingScore: number;
  cloudBase: number;
  windDirMatch: "perfect" | "good" | "off" | "bad" | "any";
  weatherCode: number;
}
