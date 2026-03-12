export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  winds: string;
  notes?: string;
}

export const LOCATIONS: Location[] = [
  { id: "maryevka",       name: "Марьевка",             lat: 52.259647, lon: 55.278912, winds: "Ю / ЮЮВ" },
  { id: "maryevka2",      name: "Марьевка 2",            lat: 52.260803, lon: 55.267925, winds: "ЮЗ" },
  { id: "grebeni",        name: "Гребни",                lat: 51.941302, lon: 55.278225, winds: "СЗ",            notes: "Сложный старт" },
  { id: "favor",          name: "Фавор",                 lat: 52.198822, lon: 55.291958, winds: "В / ВЮВ" },
  { id: "bulanovo",       name: "Буланово",              lat: 52.451302, lon: 55.196257, winds: "ЮЗ",            notes: "Отличная горка" },
  { id: "anatolyevka",    name: "Анатольевка",           lat: 52.14276,  lon: 55.387573, winds: "ЗЮЗ / ЗС" },
  { id: "kamennaya_yama", name: "Каменная Яма",          lat: 52.174142, lon: 55.321312, winds: "СВ",            notes: "Маленькая горка" },
  { id: "giryyal",        name: "Гирьял",                lat: 51.449728, lon: 56.461487, winds: "В / ВЮВ",       notes: "Маршрут 7 км" },
  { id: "mayachnaya",     name: "Маячная",               lat: 51.394279, lon: 56.681213, winds: "СВ / ССВ" },
  { id: "verblyuzhka",    name: "Верблюжка",             lat: 51.387879, lon: 56.809831, winds: "СВ / ЗЮЗ / Ю",  notes: "Сложные термики" },
  { id: "bezymyanka",     name: "Безымянка",             lat: 51.402204, lon: 56.788373, winds: "ЮЗ" },
  { id: "bezymyanka2",    name: "Безымянка 2",           lat: 51.40622,  lon: 56.792493, winds: "ВСВ" },
  { id: "kondorovka",     name: "Кондуровка",            lat: 51.545054, lon: 56.72164,  winds: "В",             notes: "Термический потенциал" },
  { id: "novogafarovo",   name: "Новогафарово",          lat: 51.633735, lon: 56.678295, winds: "З",             notes: "Удобный термический выход" },
  { id: "andreevka",      name: "Андреевка",             lat: 51.977796, lon: 56.686707, winds: "ЮЗ / Ю / ЮВ",  notes: "Плато, идеальные термики" },
  { id: "andreevka2",     name: "Андреевка (низ)",       lat: 51.949238, lon: 56.652031, winds: "З" },
  { id: "tazlarovo",      name: "Тазларово",             lat: 52.140389, lon: 56.725416, winds: "В / ЗЮЗ / З",   notes: "Плато" },
  { id: "glk_dolina",     name: "ГЛК Долина",            lat: 51.508582, lon: 57.341423, winds: "ВЮВ / ЮВ" },
  { id: "shaytan",        name: "Шайтан",                lat: 51.526101, lon: 57.381806, winds: "СЗ" },
  { id: "pokurley",       name: "Покурлей",              lat: 51.8865576, lon: 56.4455652, winds: "ЮВ" },
  { id: "kovylovka",      name: "Ковыловка",             lat: 52.041127,  lon: 56.658480,  winds: "ЗСЗ / СЗ" },
];

export const DEFAULT_LOCATION = LOCATIONS[0];

export function findLocation(id: string): Location {
  return LOCATIONS.find((l) => l.id === id) ?? DEFAULT_LOCATION;
}
