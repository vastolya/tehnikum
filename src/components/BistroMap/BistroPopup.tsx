"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { locations } from "@/data/bistros";
import type { BrowserMap, LngLat, MapLibreSdk } from "@/lib/maplibre-browser";
import { popupPosition } from "./popup-position";

// Photo assignments: city folders and the user's Dmitrovka clarification.
const photos: Record<string, string> = {
  "moscow-dmitrovka": "/images/bistros/moscow-dmitrovka.webp",
  novosibirsk: "/images/bistros/novosibirsk.webp",
  rostov: "/images/bistros/rostov.webp",
  tyumen: "/images/bistros/tyumen.webp",
};

export default function BistroPopup({ map, sdk, viewport, coordinates, location, onClose }: {
  map: BrowserMap;
  sdk: MapLibreSdk;
  viewport: HTMLElement;
  coordinates: LngLat;
  location: (typeof locations)[number];
  onClose: () => void;
}) {
  const [element] = useState(() => {
    const container = document.createElement("div");
    container.style.zIndex = "10";
    return container;
  });
  const cardRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  const [longitude, latitude] = coordinates;
  const photo = photos[location.id];
  const photoPlaceholder = !photo && location.id === "moscow-atrium";

  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);

  useLayoutEffect(() => {
    const marker = new sdk.Marker({ element, anchor: "center", subpixelPositioning: true });
    marker.setLngLat([longitude, latitude]).addTo(map);

    function placeCard() {
      const card = cardRef.current;
      if (!card) return;
      const position = popupPosition(map.project([longitude, latitude]),
        { width: viewport.clientWidth, height: viewport.clientHeight },
        { width: card.offsetWidth, height: card.offsetHeight });
      card.style.left = `${position.x}px`;
      card.style.top = `${position.y}px`;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
    }
    function closeOnMap() { closeRef.current(); }

    const observer = new ResizeObserver(placeCard);
    if (cardRef.current) observer.observe(cardRef.current);
    observer.observe(viewport);
    map.on("move", placeCard);
    map.on("click", closeOnMap);
    document.addEventListener("keydown", closeOnEscape);
    placeCard();
    return () => {
      marker.remove();
      observer.disconnect();
      map.off("move", placeCard);
      map.off("click", closeOnMap);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [map, sdk, viewport, element, longitude, latitude]);

  return createPortal(
    <section
      ref={cardRef}
      id={`bistro-details-${location.id}`}
      aria-label={`Информация о бистро: ${location.name.ru}`}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      className="absolute w-[min(420px,calc(100vw-2rem))] animate-map-enter rounded-2xl bg-white font-brand-mono text-brand-ink shadow-[0_12px_40px_rgb(44_42_38/0.22)] [animation-duration:240ms] motion-reduce:animate-none"
    >
      <div className="max-h-[calc(100svh-7rem)] overflow-y-auto overscroll-contain rounded-[inherit] p-1.5">
        {photo && <Image src={photo} alt={`Бистро Техникум — ${location.name.ru}`} width={960} height={600} sizes="(max-width: 451px) calc(100vw - 32px), 420px" className="aspect-8/5 w-full rounded-xl object-cover" />}
        {photoPlaceholder && <div className="flex aspect-8/5 w-full flex-col items-center justify-center gap-3 rounded-xl bg-brand-grey/60 text-brand-ink/50">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true"><rect x="5" y="5" width="26" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="13" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="m6 27 8-8 6 6 4-4 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          <span className="text-xs">Фото пока нет</span>
        </div>}
        <div className={`px-6 pb-5 ${photo || photoPlaceholder ? "pt-5" : "pt-6 pr-14"}`}>
          <h2 className="font-brand text-[28px] leading-tight font-light">{location.name.ru}</h2>
          {"status" in location && <p className="mt-3 text-xs leading-5 text-brand-ink/70">{location.status.ru}</p>}
          <dl className="mt-4 space-y-3 text-sm leading-6">
            <div>
              <dt className="text-brand-ink/60">Адрес</dt>
              <dd className="mt-0.5">{"address" in location ? location.address.ru : "—"}</dd>
            </div>
            <div>
              <dt className="text-brand-ink/60">{"phoneLabel" in location ? location.phoneLabel : "Телефон"}</dt>
              <dd className="mt-0.5">{"phone" in location ? <a href={location.phone.href} className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red">{location.phone.display}</a> : "—"}</dd>
            </div>
            <div>
              <dt className="text-brand-ink/60">Время работы</dt>
              <dd className="mt-0.5 whitespace-pre-line">{"openingHours" in location ? location.openingHours.ru : "—"}</dd>
            </div>
          </dl>
          {"address" in location && (
            <a href={"mapUrl" in location ? location.mapUrl : `https://yandex.ru/maps/?text=${encodeURIComponent(location.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-[13px] text-brand-red underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red" aria-label={`${location.name.ru} — открыть адрес в новой вкладке`}>Открыть адрес ↗</a>
          )}
          {"contactLinks" in location && <nav aria-label="Связаться с бистро" className="mt-2 flex flex-wrap gap-x-5 border-t border-brand-ink/10 pt-2">
            {location.contactLinks.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} — ${location.name.ru}, в новой вкладке`} className="inline-flex min-h-11 items-center text-[13px] underline underline-offset-4 hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red">{link.label} ↗</a>)}
          </nav>}
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Закрыть информацию о бистро" className="absolute -top-3 -right-2 grid size-11 cursor-pointer place-items-center rounded-full border border-brand-ink/10 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" /></svg>
      </button>
    </section>, element);
}
