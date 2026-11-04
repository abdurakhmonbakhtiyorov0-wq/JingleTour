/** Снимки с Wikimedia Commons: авторы и лицензии для страницы /photo-credits. */
export interface PhotoCredit {
  title: string;
  author: string;
  license: string;
  source: string;
}

export const LICENSE_URLS: Readonly<Record<string, string>> = {
  "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
  "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
};

export const PHOTO_CREDITS: readonly PhotoCredit[] = [
  {
    title: "Dubai skyscrapers, coastline and Burj Al-Arab",
    author: "Ahmad Ardity",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Dubai_skyscrapers,_coastline_and_Burj_Al-Arab.jpg",
  },
  {
    title: "Burj Khalifa Night View 01",
    author: "Sergei Gussev",
    license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Burj_Khalifa_Night_View_01.jpg",
  },
  {
    title: "Perge columns mountains",
    author: "Saffron Blaze",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Perge_columns_mountains.jpg",
  },
  {
    title: "Bai Chay beach, Ha Long, Vietnam, 20240129 0915 3958",
    author: "Jakub Hałun",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Bai_Chay_beach,_Ha_Long,_Vietnam,_20240129_0915_3958.jpg",
  },
  {
    title: "Hoi An (I)",
    author: "Supanut Arunoprayote",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Hoi_An_(I).jpg",
  },
  {
    title: "Ton Sai Beach 02",
    author: "Krzysztof Golik",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Ton_Sai_Beach_02.jpg",
  },
  {
    title: "Ton Sai Beach 03",
    author: "Krzysztof Golik",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Ton_Sai_Beach_03.jpg",
  },
  {
    title: "Langkawi Malaysia Fisherboat-at-Pantai-Pasir-Hitam-01",
    author: "Uwe Aranas (CEphoto)",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Langkawi_Malaysia_Fisherboat-at-Pantai-Pasir-Hitam-01.jpg",
  },
  {
    title: "2016 Kuala Lumpur, Petronas Towers (18)",
    author: "Marcin Konsek",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2016_Kuala_Lumpur,_Petronas_Towers_(18).jpg",
  },
  {
    title: "Sigiriya",
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Sigiriya.jpg",
  },
  {
    title: "The Nine Arches Bridge",
    author: "MichaelJames2468",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:The_Nine_Arches_Bridge.jpg",
  },
  {
    title: "Baku, Azerbaiyán, 2016-09-26, DD 02",
    author: "Diego Delso",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Baku,_Azerbaiy%C3%A1n,_2016-09-26,_DD_02.jpg",
  },
  {
    title: "Baku, Azerbaiyán, 2016-09-26, DD 207-209 PAN",
    author: "Diego Delso",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Baku,_Azerbaiy%C3%A1n,_2016-09-26,_DD_207-209_PAN.jpg",
  },
  {
    title: "20090529 Great Wall 8185",
    author: "Jakub Hałun",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:20090529_Great_Wall_8185.jpg",
  },
  {
    title: "20090529 Great Wall 8216",
    author: "Jakub Hałun",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:20090529_Great_Wall_8216.jpg",
  },
  {
    title: "All Gizah Pyramids",
    author: "Ricardo Liberato",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg",
  },
  {
    title: "Bathala (Maldives) 6",
    author: "Gzzz",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Bathala_(Maldives)_6.jpg",
  },
  {
    title: "Beach, pier and cloud. Eriyadu, Maldives",
    author: "Ввласенко",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Beach,_pier_and_cloud._Eriyadu,_Maldives.jpg",
  },
  {
    title: "Batumi sunset",
    author: "Dmitry A. Mottl",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Batumi_sunset.jpg",
  },
  {
    title: "2014 Tbilisi, Domy na Starym Mieście (04)",
    author: "Marcin Konsek",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2014_Tbilisi,_Domy_na_Starym_Mie%C5%9Bcie_(04).jpg",
  },
  {
    title: "Gergeti Trinity Church, Mountain pasture, Georgia",
    author: "Vyacheslav Argenberg",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Gergeti_Trinity_Church,_Mountain_pasture,_Georgia.jpg",
  },
  {
    title: "Beach in Kurskoe, Kirghizistan 02",
    author: "Bgag",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Beach_in_Kurskoe,_Kirghizistan_02.jpg",
  },
  {
    title: "Kichi Ak Suu Sanctuary, Issyk Kul Region, Kyrgyzstan 03",
    author: "Vilya Shoni",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Kichi_Ak_Suu_Sanctuary,_Issyk_Kul_Region,_Kyrgyzstan_03.jpg",
  },
  {
    title: "Jeti-Ögüz Rocks - Issyk-Kul Region, Jeti-Oguz District",
    author: "Jiří Komárek",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Jeti-%C3%96g%C3%BCz_Rocks_-_Issyk-Kul_Region,_Jeti-Oguz_District.jpg",
  },
  {
    title: "Doha - West Bay Skyline 01",
    author: "P. Hughes",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Doha_-_West_Bay_Skyline_01.jpg",
  },
  {
    title: "Doha - West Bay Skyline 02",
    author: "P. Hughes",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Doha_-_West_Bay_Skyline_02.jpg",
  },
  {
    title: "Souq Waqif, Doha, Catar, 2013-08-05, DD 09",
    author: "Diego Delso",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Souq_Waqif,_Doha,_Catar,_2013-08-05,_DD_09.JPG",
  },
  {
    title: "Bahía de Al Mirani, Mascate, Omán, 2024-08-14, DD 44",
    author: "Diego Delso",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Bah%C3%ADa_de_Al_Mirani,_Mascate,_Om%C3%A1n,_2024-08-14,_DD_44.jpg",
  },
  {
    title: "Nizwa Fort Detail",
    author: "Martin Falbisoner",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Nizwa_Fort_Detail.JPG",
  },
  {
    title: "Nizwa Fort and Minaret of Friday Mosque",
    author: "Martin Falbisoner",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Nizwa_Fort_and_Minaret_of_Friday_Mosque.JPG",
  },
  {
    title: "Batu Bolong Temple, Tanah Lot, Bali, Indonesia, 20220827 1012 1173",
    author: "Jakub Hałun",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Batu_Bolong_Temple,_Tanah_Lot,_Bali,_Indonesia,_20220827_1012_1173.jpg",
  },
  {
    title: "Rice terraces, Bali",
    author: "Vyacheslav Argenberg",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Rice_terraces,_Bali.jpg",
  },
  {
    title: "North view of Charles Bridge from Mánesův most, Prague 20160808 1",
    author: "DXR",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:North_view_of_Charles_Bridge_from_M%C3%A1nes%C5%AFv_most,_Prague_20160808_1.jpg",
  },
  {
    title: "Prague Charles Bridge 2021 11",
    author: "Scotch Mist",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Prague_Charles_Bridge_2021_11.jpg",
  },
  {
    title: "Cascading staircase Kislovodsk",
    author: "Anton Zelenov",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Cascading_staircase_Kislovodsk.jpg",
  },
  {
    title: "Chugush Range - Sochi National Park - 2021",
    author: "Victor Gleim",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Chugush_Range_-_Sochi_National_Park_-_2021.jpg",
  },
  {
    title: "Glaciers of the south-eastern slope of Elbrus",
    author: "Александр Байдуков",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Glaciers_of_the_south-eastern_slope_of_Elbrus.jpg",
  },
  {
    title: "Mada'in Saleh 2017",
    author: "Ahmad AlHasanat",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Mada%27in_Saleh_2017.jpg",
  },
  {
    title: "Close-up shot of the Green Dome at The Prophet's Mosque (Al Masjid-e-Nabawi)",
    author: "TheHadiRahim",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Close-up_shot_of_the_Green_Dome_at_The_Prophet%27s_Mosque_(Al_Masjid-e-Nabawi).jpg",
  },
  {
    title: "Madeena masjid nabavi 12122008230",
    author: "Bluemangoa2z",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Madeena_masjid_nabavi_12122008230.jpg",
  },
  {
    title: "Zhangjiajie National Forest Park",
    author: "Kuruman from Tokyo, Japan",
    license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Zhangjiajie_National_Forest_Park.jpg",
  },
  {
    title: "Baku",
    author: "автор на странице снимка",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Baku_(126198285).jpeg",
  },
];
