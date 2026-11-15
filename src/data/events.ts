// Official Atrium feed, checked 2026-11-15. Dates are publication dates.
// Summaries based on linked posts; current availability not independently verified.
export const events = [
  {
    id: "tehnobox-vol-2",
    title: "TEHNOBOX VOL. 2",
    publishedAt: "2026-10-13",
    publishedLabel: "13 октября 2026",
    location: "Москва · Большая Дмитровка и Атриум",
    description: "Завтрак в фирменной коробке: новые сэндвичи, гарнир и напиток на выбор. Внутри — керамика Moroz Ceramics.",
    image: "/images/events/tehnobox-vol-2.webp",
    sourceUrl: "https://tehnikumbistro.ru/tpost/hjf4bl28l1-tehnobox-vol-2",
    paragraphs: [
      "В московских бистро представили вторую версию TEHNOBOX: обновили коробку, сэндвичи и подарок. Завтрак можно собрать на свой вкус.",
      "На выбор — сэндвич с индейкой и чеддером или с тунцом, кимчи и яйцом, картофель или батат фри, а также напиток. Подарок — посуда ручной работы из совместной коллекции с Moroz Ceramics.",
      "В публикации от 13 октября указаны Большая Дмитровка и «Атриум», время с 9:00 до 12:00 и стоимость 2 290 ₽. Количество боксов ограничено; наличие и условия уточняйте в бистро.",
    ],
  },
  {
    id: "say-cheese",
    title: "Скажи «Сыыыр»!",
    publishedAt: "2026-10-12",
    publishedLabel: "12 октября 2026",
    location: "Москва · Московские бистро",
    description: "Совместное меню «Техникума» и Hochland: чизбургер в сырном бассейне, фри с пастрами и малиновый чизкейк.",
    image: "/images/events/say-cheese.webp",
    sourceUrl: "https://tehnikumbistro.ru/tpost/kkejb654t1-skazhi-siiir",
    paragraphs: [
      "«Техникум» и Hochland представили совместное меню из трёх блюд в московских бистро.",
      "Чизбургер подают с расплавленным Эмменталем, картофель фри с пастрами — с сырным соусом, а малиновый чизкейк готовят на творожном сыре Hochland.",
      "Новость опубликована 12 октября 2026 года. Дата окончания предложения не указана; доступность меню уточняйте в выбранном бистро.",
    ],
  },
  {
    id: "pumpkin-season",
    title: "Сезон тыквы в «Техникумах»",
    publishedAt: "2026-09-30",
    publishedLabel: "30 сентября 2026",
    location: "Москва · Московские бистро",
    description: "Осенний спешл от шефа Данила Суслова: запечённая тыква с творожным сыром и тыквенный суп с пармезаном.",
    image: "/images/events/pumpkin-season.webp",
    sourceUrl: "https://tehnikumbistro.ru/tpost/k1u6n6v9o1-sezon-tikvi-v-tehnikumah",
    paragraphs: [
      "В московских бистро появился сезонный спешл с тыквой. Шеф Данил Суслов предложил два сочетания тыквы с сыром.",
      "Запечённую медовую тыкву дополняют творожным сыром и кленовым сиропом, а тыквенный суп — пармезаном.",
      "В публикации от 30 сентября 2026 года указаны цены 690 ₽ и 550 ₽ соответственно. Срок действия спешла не указан; наличие и актуальные цены уточняйте в бистро.",
    ],
  },
];

export type BistroEvent = (typeof events)[number];
