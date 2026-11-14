"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { BrowserMap, BrowserMarker, LngLat, MapLibreSdk } from "@/lib/maplibre-browser";
import { CLUSTER_TRANSITION_MS } from "./cluster-transitions";

export default function NativeMapMarker({ map, sdk, coordinates, from, exitTo, children }: {
  map: BrowserMap;
  sdk: MapLibreSdk;
  coordinates: LngLat;
  from?: LngLat;
  exitTo?: LngLat;
  children: ReactNode;
}) {
  // This component mounts only after the browser map has loaded.
  const [element] = useState(() => document.createElement("div"));
  const markerRef = useRef<BrowserMarker | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef({ coordinates: from ?? coordinates, opacity: from ? 0 : 1, scale: from ? 0.65 : 1 });
  const [longitude, latitude] = exitTo ?? coordinates;
  const exiting = Boolean(exitTo);

  useLayoutEffect(() => {
    const marker = new sdk.Marker({ element, anchor: "center", subpixelPositioning: true });
    marker.setLngLat(visualRef.current.coordinates).addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, sdk, element]);

  useLayoutEffect(() => {
    const marker = markerRef.current;
    const content = contentRef.current;
    if (!marker || !content) return;
    const start = { ...visualRef.current };
    const destination: LngLat = [longitude, latitude];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const started = performance.now();
    let frame = 0;

    function draw(progress: number) {
      // Project both endpoints each frame so a moving camera never leaves the
      // animation behind. The SDK wrapper transform remains untouched.
      const origin = map.project(start.coordinates);
      const target = map.project(destination);
      const position = map.unproject({
        x: origin.x + (target.x - origin.x) * progress,
        y: origin.y + (target.y - origin.y) * progress,
      });
      const opacity = start.opacity + ((exiting ? 0 : 1) - start.opacity) * progress;
      const scale = start.scale + ((exiting ? 0.5 : 1) - start.scale) * progress;
      const current: LngLat = progress === 1 ? destination : [position.lng, position.lat];
      visualRef.current = { coordinates: current, opacity, scale };
      marker!.setLngLat(current);
      content!.style.opacity = String(opacity);
      content!.style.transform = `scale(${scale})`;
    }

    function tick(now: number) {
      const time = reducedMotion.matches ? 1 : Math.min((now - started) / CLUSTER_TRANSITION_MS, 1);
      draw(1 - (1 - time) ** 3);
      if (time < 1) frame = requestAnimationFrame(tick);
    }

    function finish() {
      if (!reducedMotion.matches) return;
      cancelAnimationFrame(frame);
      draw(1);
    }

    draw(reducedMotion.matches ? 1 : 0);
    frame = requestAnimationFrame(tick);
    reducedMotion.addEventListener("change", finish);
    return () => {
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", finish);
    };
  }, [map, sdk, longitude, latitude, exiting]);

  // MapLibre owns the wrapper transform. React only renders the button content.
  return createPortal(<div ref={contentRef} className={exiting ? "pointer-events-none" : undefined}>{children}</div>, element);
}
