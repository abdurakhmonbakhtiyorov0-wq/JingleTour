/**
 * Страны, которые встречаются в постах канала.
 * `aliases` — начала слов в нижнем регистре: «турци» найдёт «Турция», «Турции», «Турцию».
 */
export interface Country {
  slug: string;
  name: string;
  /** Форма для фраз «Туры в …». */
  inName: string;
  flag: string;
  aliases: readonly string[];
}

export const COUNTRIES = [
  {
    slug: "uae",
    name: "ОАЭ",
    inName: "ОАЭ",
    flag: "🇦🇪",
    aliases: ["оаэ", "дубай", "дубае", "абу-даби", "абу даби", "шардж", "рас-эль-хайм", "фуджейр", "dubay", "dubai"],
  },
  {
    slug: "turkey",
    name: "Турция",
    inName: "Турцию",
    flag: "🇹🇷",
    aliases: [
      "турци", "стамбул", "анталь", "алань", "каппадок", "памуккал", "трабзон", "ризе", "кемер",
      "белек", "сиде", "бодрум", "мармарис", "измир", "газипаш", "фетхие", "turkiya", "istanbul",
    ],
  },
  {
    slug: "vietnam",
    name: "Вьетнам",
    inName: "Вьетнам",
    flag: "🇻🇳",
    aliases: ["вьетнам", "фукуок", "фукуоке", "нячанг", "камран", "дананг", "халонг", "vyetnam", "vietnam"],
  },
  {
    slug: "thailand",
    name: "Таиланд",
    inName: "Таиланд",
    flag: "🇹🇭",
    aliases: ["таиланд", "тайланд", "пхукет", "паттай", "самуи", "краби", "бангкок", "tailand", "phuket"],
  },
  {
    slug: "malaysia",
    name: "Малайзия",
    inName: "Малайзию",
    flag: "🇲🇾",
    aliases: ["малайзи", "лангкави", "куала-лумпур", "куала лумпур", "пенанг", "malayziya", "langkawi"],
  },
  {
    slug: "sri-lanka",
    name: "Шри-Ланка",
    inName: "Шри-Ланку",
    flag: "🇱🇰",
    aliases: ["шри-ланк", "шри ланк", "велигам", "коломбо", "бентот", "хиккадув", "weligama"],
  },
  {
    slug: "azerbaijan",
    name: "Азербайджан",
    inName: "Азербайджан",
    flag: "🇦🇿",
    aliases: ["азербайджан", "баку", "нафталан", "габал", "шахдаг", "boku", "naftalan"],
  },
  {
    slug: "china",
    name: "Китай",
    inName: "Китай",
    flag: "🇨🇳",
    aliases: ["китай", "китая", "китае", "чэнду", "ченду", "чунцин", "чжанцзяцзе", "пекин", "шанхай", "санья", "хайнань", "гуанчжоу", "xitoy"],
  },
  {
    slug: "egypt",
    name: "Египет",
    inName: "Египет",
    flag: "🇪🇬",
    aliases: ["египет", "египт", "шарм", "хургад", "каир", "марса-алам", "misr"],
  },
  {
    slug: "maldives",
    name: "Мальдивы",
    inName: "Мальдивы",
    flag: "🇲🇻",
    aliases: ["мальдив", "мале ", "maldiv"],
  },
  {
    slug: "georgia",
    name: "Грузия",
    inName: "Грузию",
    flag: "🇬🇪",
    aliases: ["грузи", "тбилиси", "батуми", "кутаиси"],
  },
  {
    slug: "kyrgyzstan",
    name: "Кыргызстан",
    inName: "Кыргызстан",
    flag: "🇰🇬",
    aliases: ["кыргызстан", "киргиз", "иссык-кул", "иссык кул", "бишкек", "чолпон"],
  },
  {
    slug: "qatar",
    name: "Катар",
    inName: "Катар",
    flag: "🇶🇦",
    aliases: ["катар", "доха", "дохе"],
  },
  {
    slug: "oman",
    name: "Оман",
    inName: "Оман",
    flag: "🇴🇲",
    aliases: ["оман", "салал", "маскат"],
  },
  {
    slug: "indonesia",
    name: "Индонезия",
    inName: "Индонезию",
    flag: "🇮🇩",
    aliases: ["индонези", "бали"],
  },
  {
    slug: "czechia",
    name: "Чехия",
    inName: "Чехию",
    flag: "🇨🇿",
    aliases: ["чехи", "карловы вар", "праг"],
  },
  {
    slug: "russia",
    name: "Россия",
    inName: "Россию",
    flag: "🇷🇺",
    aliases: ["кисловодск", "ессентук", "железноводск", "пятигорск", "сочи", "минеральные воды"],
  },
  {
    slug: "saudi-arabia",
    name: "Саудовская Аравия",
    inName: "Саудовскую Аравию",
    flag: "🇸🇦",
    aliases: ["саудовск", "умра", "умру", "мекк", "медин"],
  },
] as const satisfies readonly Country[];

export type CountrySlug = (typeof COUNTRIES)[number]["slug"];

const bySlug = new Map<string, Country>(COUNTRIES.map((c) => [c.slug, c]));

/**
 * Находит страну по slug.
 * @param slug - например «turkey»
 * @returns страна или undefined, если такой нет в списке
 */
export function getCountry(slug: string | null | undefined): Country | undefined {
  return slug ? bySlug.get(slug) : undefined;
}

/**
 * Проверяет, что строка — известный slug страны.
 * @param value - любая строка
 * @returns true, если это slug из COUNTRIES
 */
export function isCountrySlug(value: string): value is CountrySlug {
  return bySlug.has(value);
}
