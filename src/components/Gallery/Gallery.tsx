"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const cursorFrameRef = useRef<number | null>(null);
  const cursorPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => () => {
    if (cursorFrameRef.current !== null) cancelAnimationFrame(cursorFrameRef.current);
    cursorFrameRef.current = null;
  }, [active]);

  const select = useCallback((direction: number) => {
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
    const overSwitch = event.target instanceof Element && Boolean(event.target.closest("[role=switch]"));
    if (!overSwitch) setPrevious(event.clientX - bounds.left < bounds.width / 2);
    setCursorVisible(!overSwitch);
  }

  return (
    <div
      ref={galleryRef}
      role="region"
      aria-label="Фотографии бистро"
      aria-roledescription="карусель"
      className="absolute inset-0 isolate overflow-hidden"
      onPointerMove={moveCursor}
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
      onPointerLeave={() => {
        setCursorVisible(false);
      }}
    >
      {photos.map((photo) => (
        <div
          key={photo.src}
          aria-hidden={photo.category !== category || photo.index !== index}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out motion-reduce:transition-none ${photo.category === category && photo.index === index ? "opacity-100" : "opacity-0"}`}
        >
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" loading={active ? "eager" : "lazy"} className="object-cover" draggable={false} />
        </div>
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-black/55 via-transparent to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[40%] bg-linear-to-t from-black/65 via-black/25 via-35% to-transparent" />
      {[-1, 1].map((direction) => (
        <button
          key={direction}
          type="button"
          aria-label={direction === -1 ? "Предыдущее фото" : "Следующее фото"}
          onClick={() => {
            if (performance.now() >= suppressClickUntil.current) select(direction);
          }}
          className={`absolute inset-y-0 w-1/2 cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white [@media(hover:hover)_and_(pointer:fine)]:cursor-none ${direction === -1 ? "left-0" : "right-0"}`}
        />
      ))}
      <button
        type="button"
        role="switch"
        aria-label="Категория галереи: атмосфера. Выключено — меню"
        aria-checked={category === "atmosphere"}
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          setCursorVisible(false);
        }}
        onClick={() => {
          setSelection({ category: category === "menu" ? "atmosphere" : "menu", index: 0 });
          setCursorVisible(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.stopPropagation();
            setSelection({ category: event.key === "ArrowLeft" ? "menu" : "atmosphere", index: 0 });
          }
        }}
        className="group absolute right-page-gutter bottom-[max(2rem,env(safe-area-inset-bottom))] z-20 flex min-h-11 cursor-pointer items-center gap-4 rounded-full font-brand text-xl leading-none font-light text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-10 sm:gap-5 sm:text-2xl"
      >
        <span className={`transition-opacity duration-200 motion-reduce:transition-none ${category === "menu" ? "opacity-100" : "[@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:opacity-100"}`}>Меню</span>
        <span aria-hidden="true" className="relative h-9 w-16 rounded-full border border-white/80">
          <span className={`absolute top-1 left-1 size-6.5 rounded-full bg-brand-red transition-transform duration-300 ease-in-out motion-reduce:transition-none ${category === "atmosphere" ? "translate-x-7" : "translate-x-0"}`} />
        </span>
        <span className={`transition-opacity duration-200 motion-reduce:transition-none ${category === "atmosphere" ? "opacity-100" : "[@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-visible:opacity-100"}`}>Атмосфера</span>
      </button>
      <p className="sr-only" aria-live={active ? "polite" : "off"} aria-atomic="true">
        {category === "menu" ? "Меню" : "Атмосфера"}: фото {index + 1} из {collections[category].length}
      </p>
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 hidden [@media(hover:hover)_and_(pointer:fine)]:block"
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div className={`grid size-20 place-items-center rounded-full bg-brand-red text-white transition-[scale,opacity] duration-250 ease-out motion-reduce:transition-none lg:size-24 ${active && cursorVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
            <Chevron previous={previous} />
          </div>
        </div>
      </div>
    </div>
  );
}
