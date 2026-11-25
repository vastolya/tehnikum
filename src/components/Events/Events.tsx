"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ArrowLink from "@/components/ArrowLink/ArrowLink";
import { events, type BistroEvent } from "@/data/events";
import { revealText } from "@/lib/reveal-text";
import HeroShade from "@/components/Hero/HeroShade";
import MovingBackground from "@/components/Hero/MovingBackground";

export default function Events({ active, onDetails, initialEventId }: { active: boolean; onDetails: (event: BistroEvent) => void; initialEventId?: string }) {
  const [index, setIndex] = useState(() => Math.max(0, events.findIndex((event) => event.id === initialEventId)));
  const textRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const previousIndexRef = useRef(index);
  const directionRef = useRef(1);
  const photoAnimationsRef = useRef<Animation[]>([]);
  const event = events[index];
  const select = (direction: number) => {
    directionRef.current = direction;
    setIndex((current) => (current + direction + events.length) % events.length);
  };

  useLayoutEffect(() => {
    const previous = previousIndexRef.current;
    previousIndexRef.current = index;
    if (previous === index) return;
    photoAnimationsRef.current.forEach((animation) => animation.cancel());
    photoAnimationsRef.current = [];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frames = photoRef.current?.querySelectorAll<HTMLElement>("[data-event-photo]");
    const outgoing = frames?.[previous];
    const incoming = frames?.[index];
    const direction = directionRef.current;
    const options: KeyframeAnimationOptions = { duration: 750, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
    if (outgoing) photoAnimationsRef.current.push(outgoing.animate([
      { opacity: 1, transform: "translateX(0) scale(1)", filter: "brightness(1)" },
      { opacity: 0, transform: `translateX(${-direction * 8}%) scale(1.06)`, filter: "brightness(.7)" },
    ], options));
    if (incoming) photoAnimationsRef.current.push(incoming.animate([
      { opacity: 0, transform: `translateX(${direction * 12}%) scale(1.08)`, filter: "brightness(.7)" },
      { opacity: 1, transform: "translateX(0) scale(1)", filter: "brightness(1)" },
    ], options));
  }, [index]);

  useEffect(() => () => photoAnimationsRef.current.forEach((animation) => animation.cancel()), []);

  useEffect(() => {
    const photo = photoRef.current;
    const section = photo?.closest<HTMLElement>("[data-motion-area]");
    if (!photo || !section || !active) return;
    const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 768px)");
    let target = 0;
    let current = 0;
    let frame = 0;
    let start = 0;
    const draw = (time: number) => {
      if (!start) start = time;
      current += (target - current) * 0.025;
      const elapsed = (time - start) / 1000;
      const tide = Math.sin(elapsed * 1.4) * 0.6 + Math.sin(elapsed * 2.1 + 0.7) * 0.25;
      const shift = Math.max(1, 3 + current + tide);
      photo.style.maskImage = `linear-gradient(to right, transparent ${shift}%, black ${25 + shift}%)`;
      frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      target = 0;
      current = 0;
      start = 0;
      photo.style.maskImage = "";
      if (motion.matches) frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = section.getBoundingClientRect();
      target = ((event.clientX - bounds.left) / bounds.width - 0.5) * 1.6;
    };
    const reset = () => { target = 0; };
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", reset);
    motion.addEventListener("change", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      photo.style.maskImage = "";
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", sync);
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active || !textRef.current) return;
    const animations = revealText(textRef.current);
    return () => animations.forEach((animation) => animation.cancel());
  }, [active, index]);

  return (
    <div data-motion-area role="region" aria-label="Афиша событий" aria-roledescription="карусель" className="relative isolate h-full bg-black" onKeyDown={(e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        select(e.key === "ArrowLeft" ? -1 : 1);
      }
    }} onTouchStart={(e) => {
      touchRef.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }} onTouchCancel={() => { touchRef.current = null; }} onTouchEnd={(e) => {
      const start = touchRef.current;
      touchRef.current = null;
      if (!start) return;
      const dx = start.x - e.changedTouches[0].clientX;
      const dy = start.y - e.changedTouches[0].clientY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) select(dx > 0 ? 1 : -1);
    }}>
      <div ref={photoRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:left-[40%] md:[mask-image:linear-gradient(to_right,transparent_0%,black_25%)]">
        <MovingBackground>{events.map((item, i) => <div key={item.id} data-event-photo className={`absolute inset-0 ${i === index ? "opacity-100" : "opacity-0"}`}><Image src={item.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div>)}</MovingBackground>
        <div className="absolute inset-x-0 top-0 hidden h-[30%] bg-linear-to-b from-black/75 to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-[30%] bg-linear-to-t from-black/75 to-transparent md:block" />
      </div>
      <div className="absolute inset-0 md:hidden"><HeroShade /></div>
      <div className="relative z-10 flex h-full flex-col px-page-gutter pt-36 pb-[max(2rem,env(safe-area-inset-bottom))] md:pb-[12dvh]">
        <div ref={textRef} className="flex min-h-0 flex-1 flex-col items-start justify-center max-md:justify-end max-md:pb-8 md:max-w-[45%]">
          <p data-reveal className="border-b border-brand-red pb-1.5 font-brand-mono text-xs leading-relaxed text-white/80">События</p>
          <p data-reveal className="mt-4 font-brand-mono text-xs leading-relaxed text-white/70">{event.location}{event.eventDateLabel && <><br />{event.eventDateLabel}</>}</p>
          <h2 data-reveal className="mt-6 text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">
            <span className="underline decoration-brand-red decoration-2 underline-offset-8">{event.title}</span>
          </h2>
          <p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white/80">{event.description}</p>
          <div data-reveal className="mt-6"><ArrowLink onClick={() => onDetails(event)}>Подробнее</ArrowLink></div>
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          {[-1, 1].map((direction) => <button key={direction} type="button" onClick={() => select(direction)} aria-label={direction < 0 ? "Предыдущее событие" : "Следующее событие"} className="group grid size-14 cursor-pointer place-items-center rounded-full border border-white/45 transition-colors duration-250 hover:border-brand-red hover:bg-brand-red focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none sm:size-20">
            <svg aria-hidden="true" width="32" height="24" viewBox="0 0 32 24" fill="none" className={direction < 0 ? "rotate-180" : ""}><path d="M2 12h27m-6-5 6 5-6 5" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>)}
          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">Карточка {index + 1} из {events.length}: {event.title}.</p>
        </div>
      </div>
    </div>
  );
}
