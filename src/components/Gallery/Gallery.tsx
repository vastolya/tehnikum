"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { galleryCollections as collections } from "@/data/gallery";

type Category = keyof typeof collections;
const photos = Object.entries(collections).flatMap(([category, items]) =>
  items.map((photo, index) => ({ ...photo, category, index })),
);

function Chevron({ previous = false }: { previous?: boolean }) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={`transition-[rotate] duration-250 ease-out motion-reduce:transition-none ${previous ? "rotate-180" : "rotate-0"}`}>
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Gallery({ active }: { active: boolean }) {
  const [selection, setSelection] = useState<{ category: Category; index: number }>({ category: "atmosphere", index: 0 });
  const { category, index } = selection;
  const [cursorVisible, setCursorVisible] = useState(false);
  const [previous, setPrevious] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorFrameRef = useRef<number | null>(null);
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const previousSelectionRef = useRef(selection);
  const directionRef = useRef(1);
  const animationsRef = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    const prior = previousSelectionRef.current;
    previousSelectionRef.current = selection;
    if (prior.category === category && prior.index === index) return;
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frames = galleryRef.current?.querySelectorAll<HTMLElement>("[data-gallery-photo]");
    const outgoing = Array.from(frames ?? []).find((frame) => frame.dataset.galleryPhoto === `${prior.category}-${prior.index}`);
    const incoming = Array.from(frames ?? []).find((frame) => frame.dataset.galleryPhoto === `${category}-${index}`);
    const direction = directionRef.current;
    const options: KeyframeAnimationOptions = { duration: 750, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
    if (outgoing) animationsRef.current.push(outgoing.animate([
      { opacity: 1, transform: "translateX(0) scale(1)", filter: "brightness(1)" },
      { opacity: 0, transform: `translateX(${-direction * 8}%) scale(1.06)`, filter: "brightness(.7)" },
    ], options));
    if (incoming) animationsRef.current.push(incoming.animate([
      { opacity: 0, transform: `translateX(${direction * 12}%) scale(1.08)`, filter: "brightness(.7)" },
      { opacity: 1, transform: "translateX(0) scale(1)", filter: "brightness(1)" },
    ], options));
  }, [selection, category, index]);

  useEffect(() => () => animationsRef.current.forEach((animation) => animation.cancel()), []);

  useEffect(() => () => {
    if (cursorFrameRef.current !== null) cancelAnimationFrame(cursorFrameRef.current);
    cursorFrameRef.current = null;
  }, [active]);

  const select = useCallback((direction: number) => {
    directionRef.current = direction;
    setSelection((current) => ({
      ...current,
      index: (current.index + direction + collections[current.category].length) % collections[current.category].length,
    }));
  }, []);

  useEffect(() => {
    const section = galleryRef.current?.closest("section");
    if (!active || !section) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof Element && event.target.closest("[role=switch]"))) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        select(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    section.addEventListener("keydown", keydown);
    return () => section.removeEventListener("keydown", keydown);
  }, [active, select]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => select(1), 3000);
    return () => window.clearTimeout(timer);
  }, [active, selection, select]);

  function moveCursor(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    cursorPositionRef.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (cursorFrameRef.current === null) {
      cursorFrameRef.current = requestAnimationFrame(() => {
        cursorFrameRef.current = null;
        const { x, y } = cursorPositionRef.current;
        if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    }
    const overControl = event.target instanceof Element && Boolean(event.target.closest("[role=switch], a"));
    if (!overControl) setPrevious(event.clientX - bounds.left < bounds.width / 2);
    setCursorVisible(!overControl);
  }

  return (
    <div
      ref={galleryRef}
      role="region"
      aria-label="Фотографии бистро"
      aria-roledescription="карусель"
      className="absolute inset-0 isolate overflow-hidden [@media(hover:hover)_and_(pointer:fine)]:cursor-none"
      onPointerMove={moveCursor}
      onClick={(event) => {
        if (performance.now() < suppressClickUntil.current || (event.target instanceof Element && event.target.closest("[role=switch], a"))) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        select(event.clientX - bounds.left < bounds.width / 2 ? -1 : 1);
      }}
      onPointerDown={(event) => {
        touchRef.current = event.pointerType === "touch" ? { x: event.clientX, y: event.clientY } : null;
      }}
      onPointerUp={(event) => {
        const start = touchRef.current;
        touchRef.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          suppressClickUntil.current = performance.now() + 500;
          select(dx > 0 ? -1 : 1);
        }
      }}
      onPointerCancel={() => { touchRef.current = null; }}
      onPointerLeave={() => setCursorVisible(false)}
    >
      {photos.map((photo) => (
        <div
          key={photo.src}
          data-gallery-photo={`${photo.category}-${photo.index}`}
          aria-hidden={photo.category !== category || photo.index !== index}
          className={`pointer-events-none absolute inset-0 ${photo.category === category && photo.index === index ? "opacity-100" : "opacity-0"}`}
        >
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" loading={active ? "eager" : "lazy"} className="object-cover" draggable={false} />
        </div>
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[30%] bg-linear-to-b from-black/75 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[30%] bg-linear-to-t from-black/75 to-transparent" />
      <button
        type="button"
        role="switch"
        aria-label="Категория галереи: атмосфера. Выключено — кухня и бар"
        aria-checked={category === "atmosphere"}
        onClick={() => {
          directionRef.current = category === "menu" ? 1 : -1;
          setSelection({ category: category === "menu" ? "atmosphere" : "menu", index: 0 });
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.stopPropagation();
            directionRef.current = event.key === "ArrowLeft" ? -1 : 1;
            setSelection({ category: event.key === "ArrowLeft" ? "menu" : "atmosphere", index: 0 });
          }
        }}
        className="group absolute right-page-gutter bottom-[max(2rem,env(safe-area-inset-bottom))] z-20 flex min-h-11 cursor-pointer items-center gap-4 rounded-full font-brand text-xl leading-none font-light text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-10 sm:gap-5 sm:text-2xl"
      >
        <span className={`transition-opacity duration-200 motion-reduce:transition-none ${category === "menu" ? "opacity-100" : "[@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:opacity-100"}`}>Кухня и бар</span>
        <span aria-hidden="true" className="relative h-9 w-16 rounded-full border border-white/80">
          <span className={`absolute top-1 left-1 size-6.5 rounded-full bg-brand-red transition-transform duration-300 ease-in-out motion-reduce:transition-none ${category === "atmosphere" ? "translate-x-7" : "translate-x-0"}`} />
        </span>
        <span className={`transition-opacity duration-200 motion-reduce:transition-none ${category === "atmosphere" ? "opacity-100" : "[@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:opacity-100"}`}>Атмосфера</span>
      </button>
      <Link href="/map" className="absolute bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] left-page-gutter z-20 inline-flex min-h-11 items-center font-brand text-xl leading-none font-light text-white underline decoration-brand-red underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-10 sm:text-2xl">
        Посмотреть меню ↗
      </Link>
      <div ref={cursorRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-10 hidden [@media(hover:hover)_and_(pointer:fine)]:block">
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div className={`grid size-20 place-items-center rounded-full bg-brand-red text-white transition-[scale,opacity] duration-250 ease-out motion-reduce:transition-none lg:size-24 ${active && cursorVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
            <Chevron previous={previous} />
          </div>
        </div>
      </div>
    </div>
  );
}
