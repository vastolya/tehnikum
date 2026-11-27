"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import HeroShade from "@/components/Hero/HeroShade";
import MovingBackground from "@/components/Hero/MovingBackground";
import Gallery from "@/components/Gallery/Gallery";
import Events from "@/components/Events/Events";
import Franchise from "@/components/Franchise/Franchise";
import ContactDialog from "@/components/Franchise/ContactDialog";
import ActionButton from "@/components/Franchise/ActionButton";
import CausticBackground from "@/components/Franchise/CausticBackground";
import ClosingSlide from "@/components/ClosingSlide/ClosingSlide";
import { events, type BistroEvent } from "@/data/events";
import ArrowLink from "@/components/ArrowLink/ArrowLink";
import { revealText } from "@/lib/reveal-text";

const slides = [
  { id: "hero", label: "Главная", background: null, position: "center" },
  { id: "about", label: "О проекте", background: "/images/slides/about.webp", position: "60% center" },
  { id: "gallery", label: "Галерея", background: null, position: "center" },
  { id: "events", label: "События", background: null, position: "center" },
  { id: "franchise", label: "Франшиза", background: null, position: "65% center" },
  { id: "partners", label: "Партнёры", background: "/images/gallery/atmosphere-9.webp", position: "center" },
  { id: "footer", label: "Техникум", background: null, position: "center" },
];
const content: Record<string, { title: string; description: string; image: string; paragraphs: string[] }> = {
  about: {
    title: "Городское бистро с честной гастрономией",
    description: "За кофе по пути, на быстрый обед или на вечер с друзьями. В «Техникуме» ты среди своих.",
    image: "/images/slides/about-details.webp",
    paragraphs: ["«Техникум» — городское гастробистро White Rabbit Family. Завтраки, кофе, нескучная еда, десерты и коктейли — на каждый день и для разных планов. Здесь ценят твоё время, любят хорошую еду и встречают по-дружески."],
  },
  franchise: {
    title: "Техникум в вашем городе",
    description: "Городское бистро от White Rabbit Family.",
    image: "/images/bistros/rostov.webp",
    paragraphs: ["«Техникум» — городское гастробистро White Rabbit Family с авторской кухней, открытой кухней и коктейлями на каждый день. Совместный проект Бориса Зарькова и Владимира Мухина."],
  },
};

export default function HomePresentation() {
  const [active, setActive] = useState(0);
  const [detailsIndex, setDetailsIndex] = useState(1);
  const [detailsSequence, setDetailsSequence] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<BistroEvent | null>(null);
  const [contactKind, setContactKind] = useState<"franchise" | "partners">("franchise");
  const details = selectedEvent ?? content[slides[detailsIndex].id];
  const activeRef = useRef(0);
  const viewportRef = useRef<HTMLElement>(null);
  const detailsDialogRef = useRef<HTMLDialogElement>(null);
  const contactDialogRef = useRef<HTMLDialogElement>(null);
  const contactAnimationRef = useRef<Animation | null>(null);
  const contactClosingRef = useRef(false);
  const detailsAnimationRef = useRef<Animation | null>(null);
  const detailsClosingRef = useRef(false);
  const detailsTextAnimationsRef = useRef<Animation[]>([]);
  const lockedUntil = useRef(0);

  useLayoutEffect(() => {
    if (slides[active].id === "events") return;
    const section = viewportRef.current?.querySelector(`#${slides[active].id}`);
    const animations = section ? revealText(section) : [];
    return () => animations.forEach((animation) => animation.cancel());
  }, [active]);

  useLayoutEffect(() => {
    const dialog = detailsDialogRef.current;
    if (detailsSequence === 0 || !dialog?.open) return;
    detailsTextAnimationsRef.current = revealText(dialog);
    return () => detailsTextAnimationsRef.current.forEach((animation) => animation.cancel());
  }, [detailsSequence]);

  function openDetails(event?: BistroEvent, updateHistory = true) {
    const dialog = detailsDialogRef.current;
    if (!dialog || dialog.open) return;
    setSelectedEvent(event ?? null);
    if (event && updateHistory) window.history.pushState(null, "", `#events/${event.id}`);
    setDetailsIndex(activeRef.current);
    setDetailsSequence((sequence) => sequence + 1);
    detailsAnimationRef.current?.cancel();
    detailsClosingRef.current = false;
    dialog.showModal();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400;
    detailsAnimationRef.current = dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: "ease-out" });
  }

  function closeDetails() {
    const dialog = detailsDialogRef.current;
    if (!dialog || !dialog.open || detailsClosingRef.current) return;
    if (window.location.hash.startsWith("#events/")) window.history.replaceState(null, "", "#events");
    detailsClosingRef.current = true;
    const opacity = getComputedStyle(dialog).opacity;
    detailsAnimationRef.current?.cancel();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400;
    const animation = dialog.animate([{ opacity }, { opacity: 0 }], { duration, easing: "ease-in", fill: "forwards" });
    detailsAnimationRef.current = animation;
    animation.finished.then(() => {
      dialog.close();
      detailsTextAnimationsRef.current.forEach((textAnimation) => textAnimation.cancel());
      animation.cancel();
      detailsClosingRef.current = false;
    }).catch(() => {});
  }

  function openContact(kind: "franchise" | "partners" = "franchise") {
    const dialog = contactDialogRef.current;
    if (!dialog || dialog.open) return;
    setContactKind(kind);
    dialog.showModal();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400;
    contactAnimationRef.current = dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: "ease-out" });
  }

  function closeContact() {
    const dialog = contactDialogRef.current;
    if (!dialog?.open || contactClosingRef.current) return;
    contactClosingRef.current = true;
    const opacity = getComputedStyle(dialog).opacity;
    contactAnimationRef.current?.cancel();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650;
    const animation = dialog.animate([{ opacity }, { opacity: 0 }], { duration, easing: "ease-in-out", fill: "forwards" });
    contactAnimationRef.current = animation;
    animation.finished.then(() => {
      dialog.close();
      animation.cancel();
      contactClosingRef.current = false;
    }).catch(() => {});
  }

  useEffect(() => () => { detailsAnimationRef.current?.cancel(); contactAnimationRef.current?.cancel(); }, []);

  const selectSlide = useCallback((index: number, focus = false, updateHistory = true) => {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    activeRef.current = next;
    setActive(next);
    lockedUntil.current = performance.now() + 440;
    if (updateHistory && window.location.hash !== `#${slides[next].id}`) {
      window.history.pushState(null, "", `#${slides[next].id}`);
    }
    if (focus) requestAnimationFrame(() => document.getElementById(slides[next].id)?.focus({ preventScroll: true }));
  }, []);

  const navigate = useCallback((id: string) => {
    const index = slides.findIndex((slide) => slide.id === id);
    if (index >= 0) selectSlide(index, true);
  }, [selectSlide]);

  const syncEventRef = useRef<(event: BistroEvent | undefined) => void>(() => {});
  useEffect(() => { syncEventRef.current = (event) => {
    const dialog = detailsDialogRef.current;
    if (event) {
      if (dialog?.open) {
        setSelectedEvent(event);
        setDetailsSequence((sequence) => sequence + 1);
      } else openDetails(event, false);
    } else if (dialog?.open && selectedEvent) {
      detailsAnimationRef.current?.cancel();
      dialog.close();
    }
  }; });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let wheelTotal = 0;
    let lastWheel = 0;
    let lastDelta = 0;
    let gestureConsumed = false;
    let touchStart: { x: number; y: number } | null = null;
    const menuOpen = () => Boolean(document.querySelector("dialog[open]"));
    const syncHash = () => {
      const event = events.find((item) => `#events/${item.id}` === window.location.hash);
      const index = event ? slides.findIndex((slide) => slide.id === "events") : slides.findIndex((slide) => `#${slide.id}` === window.location.hash);
      selectSlide(index < 0 ? 0 : index, false, false);
      syncEventRef.current(event);
    };
    const wheel = (event: WheelEvent) => {
      if (menuOpen() || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
      if (delta === 0) return;
      // Re-arm on a short pause, reversal, or fresh impulse after the momentum tail.
      const freshGesture = gap > 90 || Math.sign(delta) !== Math.sign(lastDelta) || (Math.abs(lastDelta) < 8 && Math.abs(delta) >= 18);
      lastDelta = delta;
      if (freshGesture) { wheelTotal = 0; gestureConsumed = false; }
      if (now < lockedUntil.current || gestureConsumed) return;
      if (Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0;
      wheelTotal += delta;
      if (Math.abs(wheelTotal) >= 18) {
        selectSlide(activeRef.current + Math.sign(wheelTotal));
        wheelTotal = 0;
        gestureConsumed = true;
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (menuOpen() || event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, [contenteditable=true]"))) return;
      let next: number;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) next = activeRef.current + (event.shiftKey ? -1 : 1);
      else if (["ArrowUp", "PageUp"].includes(event.key)) next = activeRef.current - 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = slides.length - 1;
      else return;
      event.preventDefault();
      if (performance.now() >= lockedUntil.current) selectSlide(next, true);
    };
    const touchstart = (event: TouchEvent) => {
      touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    };
    const touchend = (event: TouchEvent) => {
      if (!touchStart || menuOpen() || performance.now() < lockedUntil.current) return;
      const touch = event.changedTouches[0];
      const dy = touchStart.y - touch.clientY;
      const dx = touchStart.x - touch.clientX;
      touchStart = null;
      if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) selectSlide(activeRef.current + Math.sign(dy));
    };
    syncHash();
    viewport.addEventListener("wheel", wheel, { passive: false });
    viewport.addEventListener("touchstart", touchstart, { passive: true });
    viewport.addEventListener("touchend", touchend, { passive: true });
    window.addEventListener("keydown", keydown);
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      viewport.removeEventListener("wheel", wheel);
      viewport.removeEventListener("touchstart", touchstart);
      viewport.removeEventListener("touchend", touchend);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [selectSlide]);

  return (
    <div className="fixed inset-0 isolate overflow-clip bg-black text-white">
      <Header activeId={slides[active].id} onNavigate={navigate} />
      <main ref={viewportRef} aria-label="Презентация Техникума" className="absolute inset-0 touch-pan-y touch-pinch-zoom overflow-clip">
        {slides.map((slide, index) => (
          <section key={slide.id} id={slide.id} inert={index !== active} tabIndex={-1} aria-label={slide.label} aria-roledescription="слайд" style={{ opacity: index === active ? 1 : 0, zIndex: index === active ? 1 : 0, pointerEvents: index === active ? "auto" : "none" }} className="absolute inset-0 isolate overflow-clip bg-black outline-none transition-opacity duration-400 ease-in-out motion-reduce:transition-none">
            {slide.background && <>
              <MovingBackground src={slide.background} position={slide.position} />
              <HeroShade />
            </>}
            {slide.id === "hero" ? (
              <Hero />
            ) : slide.id === "gallery" ? (
              <Gallery active={index === active} />
            ) : slide.id === "events" ? (
              <Events key={selectedEvent?.id ?? "events"} initialEventId={selectedEvent?.id} active={index === active} onDetails={openDetails} />
            ) : slide.id === "franchise" ? (
              <Franchise onDetails={() => openDetails()} onContact={() => openContact()} />
            ) : slide.id === "partners" ? (
              <div className="relative z-10 flex h-full flex-col justify-center px-page-gutter pt-36 pb-24 max-sm:pt-40"><div className="max-w-xl"><h2 data-reveal className="text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">Идеи для совместных проектов</h2><p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white/90 sm:text-base">Расскажите нам о вашей идее и возможностях сотрудничества.</p><div data-reveal className="mt-8"><ActionButton type="button" onClick={() => openContact("partners")} arrow>Заполнить форму</ActionButton></div></div></div>
            ) : slide.id === "footer" ? (
              <ClosingSlide />
            ) : (
              <div className="relative z-10 flex h-full min-h-0 flex-col px-page-gutter pt-36 pb-24 max-sm:pt-40">
                  <div className="flex min-h-0 max-w-3xl flex-1 flex-col items-start justify-center">
                    <h2 data-reveal className="text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">{content[slide.id].title}</h2>
                    <p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white/90 sm:text-base">{content[slide.id].description}</p>
                    <div data-reveal className="mt-6"><ArrowLink onClick={() => openDetails()}>О проекте</ArrowLink></div>
                  </div>
              </div>
            )}
          </section>
        ))}
      </main>
      <dialog ref={detailsDialogRef} aria-labelledby="details-title" onCancel={(event) => { event.preventDefault(); closeDetails(); }} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-black p-0 text-white backdrop:bg-transparent">
        {!selectedEvent && slides[detailsIndex].id === "about" ? <CausticBackground /> : (selectedEvent || slides[detailsIndex].id !== "franchise") && <><Image src={details.image} alt="" fill sizes="100vw" loading="eager" className="object-cover object-[60%_center]" /><HeroShade /></>}
        <div className="relative z-10 h-full overflow-y-auto overscroll-contain md:mr-24">
          <div className="mx-auto flex min-h-full max-w-[90rem] flex-col justify-center px-page-gutter py-24 md:px-[8vw] md:py-20">
            {!selectedEvent && slides[detailsIndex].id === "franchise" ? <h2 data-reveal id="details-title" className="self-start"><Image src="/brand/tehnikum-logo.svg" alt="Техникум" width={1843} height={227} className="h-auto w-64 max-w-full sm:w-96" /></h2> : <h2 data-reveal id="details-title" className="self-start border-b border-brand-red pb-2 font-brand text-4xl leading-tight font-light sm:text-5xl md:text-6xl">{selectedEvent?.title ?? slides[detailsIndex].label}</h2>}
            {selectedEvent && <p data-reveal className="mt-6 font-brand-mono text-sm leading-relaxed text-white/70">{selectedEvent.location}<br />{selectedEvent.eventDateLabel}</p>}
            <div className="mt-8 max-w-4xl space-y-6 font-brand-mono text-base leading-[1.7] sm:mt-12 sm:text-xl md:text-2xl">
              {details.paragraphs.map((paragraph) => <p data-reveal key={paragraph}>{paragraph}</p>)}
            </div>
            {!selectedEvent && slides[detailsIndex].id === "franchise" && <div className="mt-12 w-full space-y-16 font-brand-mono text-sm leading-relaxed sm:text-base">
              <Image src="/images/franchise-source/bistro.jpg" alt="Интерьер бистро с росписью на стене" width={1680} height={1120} className="aspect-[16/7] w-full rounded-lg object-cover" />
              <section>
                <h3 className="font-brand text-3xl font-light">Условия франшизы</h3>
                <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[["Паушальный взнос", "25 млн ₽"], ["Роялти", "6%"], ["Инвестиции", "от 150 млн ₽"], ["Выручка в год", "от 220 млн ₽"], ["Окупаемость", "от 36 месяцев"], ["Срок открытия", "7–10 месяцев"]].map(([label, value]) => <div key={label} className="border-t border-white/30 pt-3"><dt className="text-white/70">{label}</dt><dd className="mt-2 text-xl">{value}</dd></div>)}
                </dl>
                <p className="mt-6 text-white/70">Сумма инвестиций может изменяться в зависимости от конфигурации и площади бистро. Уточняйте актуальные условия у команды франчайзинга.</p>
              </section>
              <section>
                <h3 className="font-brand text-3xl font-light">10 преимуществ франчайзинга WRF</h3>
                <ol className="mt-6 grid list-decimal gap-x-10 gap-y-4 pl-5 sm:grid-cols-2"><li>Сильный бренд</li><li>Эффективная бизнес-модель с высокой доходностью</li><li>Помощь в открытии бистро и обучении команды</li><li>Единые стандарты процессов и меню</li><li>Централизованные поставщики</li><li>Общая маркетинговая стратегия</li><li>Инновационные технологии</li><li>Поддержка 24/7</li><li>Интеграция в бизнес-стратегию компании</li><li>Возможность развивать другие бренды WRF</li></ol>
              </section>
              <section>
                <h3 className="font-brand text-3xl font-light">Ключевые характеристики</h3>
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">{[["Тип заведения", "Гастробистро"], ["Часы работы", "Завтрак, обед, ужин"], ["Ценовой сегмент", "Средний"], ["Обслуживание", "À la carte"], ["Кухня", "Современная гастрономия с азиатскими акцентами и комфортной едой на каждый день"], ["Атмосфера", "Комфортная и демократичная, для повседневных визитов и вечернего отдыха"], ["Поводы для визита", "Завтрак, бизнес-ланч, деловая или семейная встреча, встреча с друзьями, свидание, новый кулинарный опыт в одиночестве и ужин до или после культурных событий"]].map(([label, value]) => <div key={label} className="border-t border-white/30 pt-3"><dt className="text-white/70">{label}</dt><dd className="mt-2">{value}</dd></div>)}</dl>
              </section>
              <section>
                <h3 className="font-brand text-3xl font-light">Преимущества Техникума</h3>
                <ul className="mt-6 space-y-4"><li><strong>Стандарты White Rabbit Family.</strong> Единые требования к качеству, сервису и операционному управлению.</li><li><strong>Сервис уровня Michelin.</strong> Внимание к гостям и высокий уровень обслуживания.</li><li><strong>Локации с высоким пешеходным трафиком.</strong> Центральные и востребованные районы города.</li><li><strong>Средний чек и маржинальность.</strong> Ориентиры: 1 800 ₽ и 35–42% соответственно.</li><li><strong>Быстрая подача.</strong> Большинство позиций готовятся не более 20 минут.</li><li><strong>Гастрономия на каждый день.</strong> Понятное меню и частые повторные визиты.</li><li><strong>Авторские коктейли и бар.</strong> Собственные заготовки, сезонные обновления и высокая доля барной выручки.</li><li><strong>Городская атмосфера.</strong> Пространство для деловых встреч, обедов и вечернего отдыха.</li></ul>
              </section>
              <section className="border-t border-white/25 pt-10">
                <h3 className="font-brand text-3xl font-light">Ядро целевой аудитории</h3>
                <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start md:gap-16">
                  <div><p className="text-lg text-brand-red">Ключевая аудитория формата</p><div className="mt-8 border-l border-brand-red pl-6"><p className="font-brand text-4xl font-light">18–40 лет</p><p className="mt-6">Активные люди, которые стремятся к балансу работы и отдыха, следят за здоровьем, ценят качество и разумные цены, любят пробовать новое без крайностей.</p></div></div>
                  <div className="relative ml-4 mb-4 before:absolute before:inset-0 before:translate-x-[-1rem] before:translate-y-4 before:rounded-lg before:border before:border-white/25"><Image src="/images/franchise-source/audience.png" alt="" width={1344} height={896} className="relative aspect-square w-full rounded-lg object-cover" /></div>
                </div>
              </section>
            </div>}
            {!selectedEvent && slides[detailsIndex].id === "franchise" && <button type="button" data-reveal onClick={() => openContact()} className="mt-8 cursor-pointer self-start font-brand-mono text-sm underline decoration-brand-red underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Обсудить франшизу ↗</button>}
          </div>
        </div>
        <button type="button" autoFocus onClick={closeDetails} aria-label="Закрыть подробности" className={`absolute top-4 right-4 z-20 grid size-14 cursor-pointer place-items-center text-white transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white motion-reduce:transition-none ${!selectedEvent && slides[detailsIndex].id === "about" ? "bg-transparent hover:text-brand-red md:top-1/2 md:right-5 md:-translate-y-1/2" : "bg-black hover:bg-brand-red md:inset-y-0 md:right-0 md:h-full md:w-24"}`}>
          <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="m4 4 24 24M28 4 4 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </dialog>
      <ContactDialog dialogRef={contactDialogRef} kind={contactKind} onClose={closeContact} />
    </div>
  );
}

