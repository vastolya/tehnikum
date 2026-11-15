"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Gallery from "@/components/Gallery/Gallery";
import Events from "@/components/Events/Events";
import Franchise from "@/components/Franchise/Franchise";
import ClosingSlide from "@/components/ClosingSlide/ClosingSlide";
import type { BistroEvent } from "@/data/events";
import ArrowLink from "@/components/ArrowLink/ArrowLink";
import { revealText } from "@/lib/reveal-text";

const slides = [
  { id: "hero", label: "Главная", background: null, position: "center" },
  { id: "about", label: "О проекте", background: "/images/slides/about.webp", position: "60% center" },
  { id: "gallery", label: "Галерея", background: null, position: "center" },
  { id: "events", label: "События", background: null, position: "center" },
  { id: "franchise", label: "Франшиза", background: null, position: "65% center" },
  { id: "footer", label: "Техникум", background: null, position: "center" },
];
const content: Record<string, { title: string; description: string; image: string; paragraphs: string[] }> = {
  about: {
    title: "Городское бистро Техникум на каждый день",
    description: "Новые вкусы. Знакомое чувство — быть собой.",
    image: "/images/slides/about-details.webp",
    paragraphs: ["Техникум — сеть бистро с интересной гастрономией на каждый день. Понятная еда, необычные сочетания и общение без барьеров.", "Для встреч и спонтанных планов. Для новых вкусов и привычного городского ритма."],
  },
  franchise: {
    title: "Техникум в вашем городе",
    description: "Городское бистро от White Rabbit Family.",
    image: "/images/bistros/rostov.webp",
    paragraphs: ["Техникум — городское бистро White Rabbit Family. В основе формата — гастрономия на каждый день, авторская кухня и непринуждённая атмосфера.", "Завтраки, основное меню и коктейли создают разные поводы для встречи: от начала дня до вечера с друзьями.", "Хотите открыть Техникум в своём городе? Расскажите о себе и вашем проекте команде франчайзинга White Rabbit Family."],
  },
};

export default function HomePresentation() {
  const [active, setActive] = useState(0);
  const [detailsIndex, setDetailsIndex] = useState(1);
  const [detailsSequence, setDetailsSequence] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<BistroEvent | null>(null);
  const details = selectedEvent ?? content[slides[detailsIndex].id];
  const activeRef = useRef(0);
  const viewportRef = useRef<HTMLElement>(null);
  const detailsDialogRef = useRef<HTMLDialogElement>(null);
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

  function openDetails(event?: BistroEvent) {
    const dialog = detailsDialogRef.current;
    if (!dialog || dialog.open) return;
    setSelectedEvent(event ?? null);
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

  useEffect(() => () => { detailsAnimationRef.current?.cancel(); }, []);

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
    const index = slides.findIndex((slide) => slide.id === (id === "partners" ? "franchise" : id));
    if (index >= 0) selectSlide(index, true);
  }, [selectSlide]);

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
      if (window.location.hash === "#partners") window.history.replaceState(null, "", "#franchise");
      const index = slides.findIndex((slide) => `#${slide.id}` === window.location.hash);
      selectSlide(index < 0 ? 0 : index, false, false);
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
      <main ref={viewportRef} aria-label="Презентация Техникума" className="absolute inset-0 touch-pinch-zoom overflow-clip">
        {slides.map((slide, index) => (
          <section key={slide.id} id={slide.id} inert={index !== active} tabIndex={-1} aria-label={slide.label} aria-roledescription="слайд" style={{ opacity: index === active ? 1 : 0, zIndex: index === active ? 1 : 0, pointerEvents: index === active ? "auto" : "none" }} className="absolute inset-0 isolate overflow-clip bg-black outline-none transition-opacity duration-400 ease-in-out motion-reduce:transition-none">
            {slide.background && <>
              <Image src={slide.background} alt="" fill sizes="100vw" style={{ objectPosition: slide.position }} className="object-cover" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-r from-black/85 via-black/45 to-black/20" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-black/70 via-transparent to-black/45" />
            </>}
            {slide.id === "hero" ? (
              <Hero />
            ) : slide.id === "gallery" ? (
              <Gallery active={index === active} />
            ) : slide.id === "events" ? (
              <Events active={index === active} onDetails={openDetails} />
            ) : slide.id === "franchise" ? (
              <Franchise onDetails={() => openDetails()} />
            ) : slide.id === "footer" ? (
              <ClosingSlide />
            ) : (
              <div className="relative z-10 flex h-full min-h-0 flex-col px-page-gutter pt-36 pb-24 max-sm:pt-40">
                  <div className="flex min-h-0 max-w-3xl flex-1 flex-col items-start justify-center">
                    <p data-reveal className="border-b border-brand-red pb-1.5 font-brand-mono text-xs leading-relaxed text-white/80">{slide.label}</p>
                    <h2 data-reveal className="mt-6 text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">{content[slide.id].title}</h2>
                    <p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white/90 sm:text-base">{content[slide.id].description}</p>
                    <div data-reveal className="mt-6"><ArrowLink onClick={() => openDetails()}>Подробнее</ArrowLink></div>
                  </div>
              </div>
            )}
          </section>
        ))}
      </main>
      <dialog ref={detailsDialogRef} aria-labelledby="details-title" onCancel={(event) => { event.preventDefault(); closeDetails(); }} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-black p-0 text-white backdrop:bg-transparent">
        <Image src={details.image} alt="" fill sizes="100vw" loading="eager" className="object-cover object-[60%_center]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-black/80" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-r from-black/50 to-transparent" />
        <div className="relative z-10 h-full overflow-y-auto overscroll-contain md:mr-24">
          <div className="flex min-h-full flex-col justify-center px-page-gutter py-24 md:px-[12vw] md:py-20">
            <h2 data-reveal id="details-title" className="self-start border-b border-brand-red pb-2 font-brand text-4xl leading-tight font-light sm:text-5xl md:text-6xl">{selectedEvent?.title ?? slides[detailsIndex].label}</h2>
            {selectedEvent && <p data-reveal className="mt-6 font-brand-mono text-sm leading-relaxed text-white/70">{selectedEvent.location}<br />Опубликовано <time dateTime={selectedEvent.publishedAt}>{selectedEvent.publishedLabel}</time></p>}
            <div className="mt-8 max-w-4xl space-y-6 font-brand-mono text-base leading-[1.7] sm:mt-12 sm:text-xl md:text-2xl">
              {details.paragraphs.map((paragraph) => <p data-reveal key={paragraph}>{paragraph}</p>)}
            </div>
            {!selectedEvent && slides[detailsIndex].id === "franchise" && <a data-reveal href="mailto:franchising@wrf.su?subject=Tehnikum" className="mt-8 self-start font-brand-mono text-sm underline decoration-brand-red underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Обсудить франшизу ↗</a>}
          </div>
        </div>
        <button type="button" autoFocus onClick={closeDetails} aria-label="Закрыть подробности" className="absolute top-4 right-4 z-20 grid size-14 cursor-pointer place-items-center bg-black text-white transition-colors hover:bg-brand-red focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white motion-reduce:transition-none md:inset-y-0 md:right-0 md:h-full md:w-24">
          <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="m4 4 24 24M28 4 4 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </dialog>
    </div>
  );
}

