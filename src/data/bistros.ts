// Map page data. Source: the mind-map diagram supplied by the user on 05.11.2026.
// These are supplied design data, not independently verified opening statuses.
// Do not add phone numbers, coordinates, opening dates or routes by inference.
export const locations = [
  {
    id: "moscow-dmitrovka",
    name: { ru: "Москва — Большая Дмитровка", en: "Moscow — Bolshaya Dmitrovka" },
    address: { ru: "ул. Большая Дмитровка, 7/5, стр. 2", en: "7/5 Bolshaya Dmitrovka St., Bldg. 2" },
    mapQuery: "Москва, Большая Дмитровка, 7/5, строение 2",
    // Supplied by the user on 14.11.2026, only for this address.
    openingHours: { ru: "Ежедневно 09:00–00:00", en: "Daily 09:00–00:00" },
    phone: { display: "+7 (499) 136-73-36", href: "tel:+74991367336" },
    mapUrl: "https://yandex.ru/maps/org/tehnikum/1753926793/?indoorLevel=1&ll=37.614742%2C55.760849&z=17",
  },
  {
    id: "moscow-atrium",
    name: { ru: "Москва — Атриум", en: "Moscow — Atrium" },
    address: { ru: "ул. Земляной Вал, 33", en: "33 Zemlyanoy Val St." },
    mapQuery: "Москва, Земляной Вал, 33",
  },
  {
    id: "tyumen",
    name: { ru: "Тюмень — Ленина", en: "Tyumen — Lenina" },
    address: { ru: "ул. Ленина, 10", en: "10 Lenina St." },
    mapQuery: "Тюмень, Ленина, 10",
    // Supplied by the user on 14.11.2026, only for Tyumen.
    mapUrl: "https://yandex.ru/maps/55/tyumen/house/ulitsa_lenina_10/YkwYcwVjSU0GQFttfX10eHtqbQ==/",
    phone: { display: "+7 (3452) 50-04-59", href: "tel:+73452500459" },
    phoneLabel: "Телефон администратора",
    openingHours: { ru: "Пн–Чт, Вс 09:00–23:00\nПт–Сб 09:00–01:00", en: "Mon–Thu, Sun 09:00–23:00\nFri–Sat 09:00–01:00" },
    contactLinks: [
      { label: "Telegram", href: "https://t.me/+79020317317" },
      { label: "MAX", href: "https://max.ru/+79020317317" },
    ],
  },
  {
    id: "novosibirsk",
    name: { ru: "Новосибирск — Советская", en: "Novosibirsk — Sovetskaya" },
    address: { ru: "ул. Советская, 18, 1 этаж", en: "18 Sovetskaya St., 1st floor" },
    mapQuery: "Новосибирск, Советская, 18",
    // Supplied by the user on 14.11.2026, only for Novosibirsk.
    mapUrl: "https://yandex.ru/maps/65/novosibirsk/house/sovetskaya_ulitsa_18/bEsYfwZmTkIEQFtvfXxycX1rbQ==/",
    phone: { display: "+7 (939) 824-43-23", href: "tel:+79398244323" },
    phoneLabel: "Телефон менеджера",
    openingHours: { ru: "Пн–Пт 08:00–00:00\nСб–Вс 10:00–00:00", en: "Mon–Fri 08:00–00:00\nSat–Sun 10:00–00:00" },
    contactLinks: [
      { label: "WhatsApp", href: "https://api.whatsapp.com/send/?phone=79398224040&text=%D0%9E%D0%B1%D1%80%D0%B0%D1%89%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B8%D0%B7+%D0%AF%D0%BD%D0%B4%D0%B5%D0%BA%D1%81+%D0%9A%D0%B0%D1%80%D1%82%0A%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21+%D0%9C%D0%B5%D0%BD%D1%8F+%D0%B7%D0%B0%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D0%BE%D0%B2%D0%B0%D0%BB%D0%BE+%D0%B2%D0%B0%D1%88%D0%B5+%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5&type=phone_number&app_absent=0" },
      { label: "Telegram", href: "https://t.me/tehnikumnsk" },
      { label: "MAX", href: "https://max.ru/+7+(966)+505-02-29" },
      { label: "VK", href: "https://vk.ru/tehnikumnsk" },
    ],
  },
  {
    id: "rostov",
    name: { ru: "Ростов-на-Дону — Соборный", en: "Rostov-on-Don — Soborny" },
    address: { ru: "пер. Соборный, 19", en: "19 Soborny Lane" },
    mapQuery: "Ростов-на-Дону, Соборный переулок, 19",
    // Supplied by the user on 14.11.2026, only for Rostov-on-Don.
    mapUrl: "https://yandex.ru/maps/39/rostov-na-donu/house/soborny_pereulok_19/Z0AYcQZgQEYDQFptfX5weH5mYw==/",
    phone: { display: "+7 (863) 322-42-28", href: "tel:+78633224228" },
    openingHours: { ru: "Ежедневно 09:00–00:00", en: "Daily 09:00–00:00" },
    contactLinks: [
      { label: "Telegram", href: "https://t.me/TehnikumRostov" },
      { label: "MAX", href: "https://max.ru/u/f9LHodD0cOJkPzFvrPM2UrxHWyb86TtZA9qx3VLyv2Fjn45yxhwpDxP2VeE" },
    ],
  },
  {
    id: "rosa-khutor",
    name: { ru: "Роза Хутор", en: "Rosa Khutor" },
    // Address confirmed at https://sch.tehnikumbistro.ru/contacts on 06.11.2026.
    address: { ru: "площадь Мзымты, 1", en: "1 Mzymta Square" },
    mapQuery: "Сочи, Роза Хутор, площадь Мзымты, 1",
    status: { ru: "До встречи в зимнем сезоне", en: "See you in the winter season" },
  },
  {
    id: "perm",
    name: { ru: "Пермь — Окулова", en: "Perm — Okulova" },
    // Address, hours and phone supplied by the user on 27.11.2026 for Perm.
    address: { ru: "ул. Окулова, 14, 1 этаж, Ленинский район, Пермь, 614068", en: "14 Okulova St., 1st floor, Leninsky District, Perm, 614068" },
    mapQuery: "Пермь, улица Окулова, 14",
    openingHours: { ru: "Ежедневно 18:00–24:00", en: "Daily 18:00–24:00" },
    phone: { display: "+7 (342) 248-02-22", href: "tel:+73422480222" },
  },
  {
    id: "almaty",
    name: { ru: "Алма-Ата", en: "Almaty" },
    status: { ru: "Скоро открытие", en: "Coming soon" },
  },
  {
    id: "izhevsk",
    name: { ru: "Ижевск", en: "Izhevsk" },
    status: { ru: "Скоро открытие", en: "Coming soon" },
  },
] as const;
