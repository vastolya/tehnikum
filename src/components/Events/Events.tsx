"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import ArrowLink from "@/components/ArrowLink/ArrowLink";
import { events, type BistroEvent } from "@/data/events";
import { revealText } from "@/lib/reveal-text";

export default function Events({ active, onDetails }: { active: boolean; onDetails: (event: BistroEvent) => void }) {
  const [index, setIndex] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const event = events[index];
  const select = (direction: number) => setIndex((current) => (current + direction + events.length) % events.length);

  useLayoutEffect(() => {
    if (!active || !textRef.current) return;
    const animations = revealText(textRef.current);
    return () => animations.forEach((animation) => animation.cancel());
  }, [active, index]);

  return (
    <div role="region" aria-label="Афиша событий" aria-roledescription="карусель" className="relative isolate h-full bg-black" onKeyDown={(e) => {
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 md:right-[38%] md:[mask-image:linear-gradient(to_right,black_0%,rgb(0_0_0/0.9)_50%,transparent_98%)]">
        {events.map((item, i) => <Image key={item.id} src={item.image} alt="" fill sizes="(min-width: 768px) 62vw, 100vw" className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`} />)}
        <div className="pointer-events-none absolute inset-0 z-0 bg-black/25" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-black/70 via-black/35 to-black md:from-black/50 md:via-transparent md:to-black/20" />
      <div className="relative z-10 flex h-full flex-col px-page-gutter pt-36 pb-[max(2rem,env(safe-area-inset-bottom))] md:pl-[51.4%] md:pb-[12dvh]">
        <div ref={textRef} className="flex min-h-0 flex-1 flex-col items-start justify-center max-md:justify-end max-md:pb-8">
          <p data-reveal className="border-b border-brand-red pb-1.5 font-brand-mono text-xs leading-relaxed text-white/80">События</p>
          <p data-reveal className="mt-4 font-brand-mono text-xs leading-relaxed text-white/70">{event.location}<br />Опубликовано <time dateTime={event.publishedAt}>{event.publishedLabel}</time></p>
          <h2 data-reveal className="mt-6 text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">
            <button type="button" onClick={() => onDetails(event)} className="cursor-pointer text-left underline decoration-brand-red decoration-2 underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white">{event.title}</button>
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
