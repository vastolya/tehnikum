"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { locations } from "@/data/bistros";
import { mapCities } from "@/data/map-cities";
import { mapPoints } from "@/data/map-points";
import { OVERVIEW_BOUNDS, prepareMapStyle, type BrowserMap, type Bounds, type LngLat, type MapLibreSdk, type MapStyle } from "@/lib/maplibre-browser";
import { clusterPoints, type PointCluster } from "./cluster-points";
import NativeMapMarker from "./NativeMapMarker";
import BistroPopup from "./BistroPopup";
import { locationCameraOffset } from "./popup-position";
import { CLUSTER_TRANSITION_MS, clusterKey, transitionClusters, type TransitionCluster } from "./cluster-transitions";

type LoadState = "loading" | "ready" | "error";

export default function BistroMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<BrowserMap | null>(null);
  const pendingLocationRef = useRef<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [clusters, setClusters] = useState<TransitionCluster[]>([]);
  const clustersRef = useRef<TransitionCluster[]>([]);
  const [markerContext, setMarkerContext] = useState<{ map: BrowserMap; sdk: MapLibreSdk; viewport: HTMLElement } | null>(null);
  const selectedBistro = locations.find((location) => location.id === selectedLocation);
  const selectedPoint = mapPoints.find((point) => point.id === selectedLocation);
  const popupVisible = loadState === "ready" && selectedBistro && selectedPoint && clusters.some((cluster) => !cluster.exitTo && cluster.ids.length === 1 && cluster.ids[0] === selectedLocation);

  function closeDetails() {
    setSelectedLocation(null);
    pendingLocationRef.current = null;
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const controller = new AbortController();
    let disposed = false;
    let starting = false;
    let retryScript: HTMLScriptElement | undefined;
    let timeout: ReturnType<typeof setTimeout>;
    let clusterTimeout: ReturnType<typeof setTimeout> | undefined;
    let topology = "";
    clustersRef.current = [];
    const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function updateClusters() {
      const map = mapRef.current;
      if (!map || disposed) return;
      const currentZoom = map.getZoom();
      // Include off-screen points so dragging never needs to remount a marker.
      const positions = mapPoints.map((point) => ({ id: point.id, ...map.project(point.coordinates) }));
      const next = clusterPoints(positions, currentZoom).map((cluster) => {
        const point = cluster.ids.length === 1 ? mapPoints.find((item) => item.id === cluster.ids[0]) : undefined;
        const center = map.unproject({ x: cluster.x, y: cluster.y });
        return { ...cluster, coordinates: point?.coordinates ?? [center.lng, center.lat] as LngLat };
      });
      const nextTopology = next.map(clusterKey).sort().join(";");
      if (nextTopology === topology) return;
      topology = nextTopology;
      clearTimeout(clusterTimeout);
      const updated = motionReduced ? next : transitionClusters(clustersRef.current, next);
      clustersRef.current = updated;
      setClusters(updated);
      if (updated.some((cluster) => "exitTo" in cluster && cluster.exitTo)) {
        clusterTimeout = setTimeout(() => {
          if (disposed) return;
          clustersRef.current = clustersRef.current.filter((cluster) => !cluster.exitTo);
          setClusters(clustersRef.current);
        }, CLUSTER_TRANSITION_MS + 40);
      }
    }

    function showError() {
      if (!disposed) setLoadState("error");
    }

    async function start() {
      if (starting || disposed || !window.tehnikumMapLibre) return;
      starting = true;
      setLoadState("loading");
      clearTimeout(timeout);
      timeout = setTimeout(showError, 25000);
      try {
        await document.fonts.ready;
        const fontFamily = getComputedStyle(document.body).fontFamily.split(",")[0].trim().replaceAll('"', "");
        await document.fonts.load(`14px "${fontFamily}"`);
        const response = await fetch("https://tiles.openfreemap.org/styles/positron", { signal: controller.signal });
        if (!response.ok) throw new Error("Map style unavailable");
        const style = await response.json() as MapStyle;
        if (!Array.isArray(style.layers) || !style.sources) throw new Error("Invalid map style");
        if (disposed) return;
        const map = new window.tehnikumMapLibre.Map({
          container: container!,
          style: prepareMapStyle(style, fontFamily),
          center: [60, 51],
          zoom: 4,
          minZoom: 2,
          maxZoom: 18,
          attributionControl: false,
          renderWorldCopies: false,
          dragRotate: false,
          pitchWithRotate: false,
        });
        mapRef.current = map;
        // Check membership during zoom; React updates only when groups change.
        // MapLibre still owns marker positioning during camera movement.
        map.on("zoom", updateClusters);
        map.on("moveend", updateClusters);
        map.on("resize", updateClusters);
        map.on("load", () => {
          if (disposed) return;
          clearTimeout(timeout);
          setMarkerContext({ map, sdk: window.tehnikumMapLibre!, viewport: container! });
          setLoadState("ready");
          const pendingPoint = mapPoints.find((point) => point.id === pendingLocationRef.current);
          if (pendingPoint) {
            map.flyTo({ center: pendingPoint.coordinates, zoom: pendingPoint.precision === "building" ? 15 : 10, duration: motionReduced ? 0 : 700, offset: locationCameraOffset(window.innerWidth, window.innerHeight) });
          } else {
            map.fitBounds(OVERVIEW_BOUNDS, {
              padding: { top: 60, bottom: window.innerWidth < 768 ? 260 : 70, left: window.innerWidth < 768 ? 30 : 430, right: 70 },
              duration: motionReduced ? 0 : 700,
            });
          }
          updateClusters();
        });
        updateClusters();
      } catch {
        if (!controller.signal.aborted) showError();
      }
    }

    window.addEventListener("tehnikum:map-ready", start);
    window.addEventListener("tehnikum:map-error", showError);
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);
    timeout = setTimeout(showError, 25000);
    if (window.tehnikumMapLibre) void start();
    else if (window.tehnikumMapLibreError || attempt > 0) {
      retryScript = document.createElement("script");
      retryScript.type = "module";
      retryScript.src = `/scripts/maplibre-loader.js?retry=${attempt}`;
      retryScript.onerror = showError;
      document.head.appendChild(retryScript);
    }

    return () => {
      disposed = true;
      controller.abort();
      clearTimeout(timeout);
      clearTimeout(clusterTimeout);
      observer.disconnect();
      retryScript?.remove();
      window.removeEventListener("tehnikum:map-ready", start);
      window.removeEventListener("tehnikum:map-error", showError);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [attempt]);

  function flyToLocation(locationId: string) {
    const point = mapPoints.find((item) => item.id === locationId);
    if (!point) return;
    pendingLocationRef.current = point.id;
    setSelectedLocation(locationId);
    mapRef.current?.flyTo({
      center: point.coordinates,
      zoom: point.precision === "building" ? 15 : 10,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900,
      offset: locationCameraOffset(window.innerWidth, window.innerHeight),
    });
  }

  function openCluster(cluster: PointCluster) {
    if (cluster.ids.length === 1) {
      flyToLocation(cluster.ids[0]);
      return;
    }
    closeDetails();
    const points = mapPoints.filter((point) => cluster.ids.includes(point.id));
    const lngs = points.map((point) => point.coordinates[0]);
    const lats = points.map((point) => point.coordinates[1]);
    const bounds: Bounds = [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
    mapRef.current?.fitBounds(bounds, {
      padding: { top: 90, bottom: window.innerWidth < 768 ? 260 : 90, left: window.innerWidth < 768 ? 50 : 430, right: 90 },
      maxZoom: 17,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700,
    });
  }

  return (
    <div className="relative h-svh min-h-[600px] animate-map-enter overflow-hidden bg-brand-grey font-brand-mono text-brand-ink motion-reduce:animate-none">
      <Script src="/scripts/maplibre-loader.js" type="module" strategy="afterInteractive" onError={() => { window.tehnikumMapLibreError = true; setLoadState("error"); }} />
      <div ref={containerRef} className={`absolute! inset-0 h-full w-full font-brand-mono! transition-opacity duration-700 ease-out motion-reduce:transition-none ${loadState === "ready" ? "opacity-100" : "opacity-0"} [&_.maplibregl-canvas]:grayscale [&_.maplibregl-canvas:focus-visible]:outline-2 [&_.maplibregl-canvas:focus-visible]:outline-brand-red`} aria-label="Интерактивная карта бистро: перемещение, масштабирование колёсиком и жестами" />

      <div role="status" className={`pointer-events-none absolute top-8 right-22 z-20 w-28 transition-opacity duration-300 motion-reduce:transition-none md:top-11 md:right-26 ${loadState === "loading" ? "opacity-100" : "opacity-0"}`}>
        <span className="sr-only">{loadState === "loading" ? "Карта загружается" : loadState === "ready" ? "Карта готова" : "Карта недоступна"}</span>
        <div aria-hidden="true">
          <Image src="/brand/tehnikum-logo.svg" alt="" width={112} height={14} className="h-auto w-full" />
          <div className="mt-3 h-px overflow-hidden bg-brand-ink/10">
            <span className={`block h-full w-1/3 bg-brand-red motion-reduce:animate-none ${loadState === "loading" ? "animate-map-loading" : ""}`} />
          </div>
        </div>
      </div>
      {loadState === "error" && (
        <div role="alert" className="absolute top-20 right-6 left-6 z-20 max-w-sm rounded-xl bg-white p-6 shadow-xl md:top-8 md:right-24 md:left-auto">
          <p className="font-brand text-2xl font-light">Не удалось загрузить карту</p>
          <p className="mt-3 text-xs leading-relaxed text-brand-ink/70">Проверьте подключение к интернету. Адреса бистро доступны в списке.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-3 min-h-11 cursor-pointer text-xs underline underline-offset-4">Попробовать снова</button>
        </div>
      )}

      {loadState === "ready" && markerContext && (
        <>
          {clusters.map((cluster) => {
            const point = cluster.ids.length === 1 ? mapPoints.find((item) => item.id === cluster.ids[0]) : undefined;
            const city = point ? mapCities.find((item) => item.locationIds.includes(point.id)) : undefined;
            const location = point ? locations.find((item) => item.id === point.id) : undefined;
            const symbol = point?.id === "moscow-atrium" ? undefined : city?.symbol;
            const active = selectedLocation !== null && cluster.ids.includes(selectedLocation);
            return (
              <NativeMapMarker key={clusterKey(cluster)} map={markerContext.map} sdk={markerContext.sdk} coordinates={cluster.coordinates} from={cluster.from} exitTo={cluster.exitTo}>
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); openCluster(cluster); }}
                aria-label={location ? location.name.ru : `Приблизить группу: ${cluster.count} локаций`}
                aria-pressed={active}
                aria-expanded={location ? Boolean(active && popupVisible) : undefined}
                aria-controls={location && active && popupVisible ? `bistro-details-${location.id}` : undefined}
                disabled={Boolean(cluster.exitTo)}
                aria-hidden={cluster.exitTo ? true : undefined}
                tabIndex={cluster.exitTo ? -1 : undefined}
                className={`relative flex shrink-0 cursor-pointer items-center justify-center rounded-full shadow-[0_4px_14px_rgb(44_42_38/0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red ${city ? "size-20 border border-white bg-brand-grey text-brand-ink hover:bg-white" : "size-14 border-2 border-white bg-brand-red font-brand-mono text-lg font-normal text-white"} ${active ? "ring-2 ring-brand-red ring-offset-2 ring-offset-white" : ""}`}
              >
                {city ? (
                  <>
                    {symbol ? <Image src={`/brand/cities/${symbol}.svg`} alt="" width={56} height={48} className="h-12 w-14 object-contain" /> : <Image src="/brand/tehnikum-logo-compact.svg" alt="" width={64} height={64} className="size-16 object-contain" />}
                  </>
                ) : <span className="leading-none tabular-nums [text-box:trim-both_cap_alphabetic]">{cluster.count}</span>}
              </button>
              </NativeMapMarker>
            );
          })}
        </>
      )}

      {popupVisible && markerContext && <BistroPopup key={selectedBistro.id} map={markerContext.map} sdk={markerContext.sdk} viewport={markerContext.viewport} coordinates={selectedPoint.coordinates} location={selectedBistro} onClose={closeDetails} />}

      <aside className={`absolute right-4 bottom-10 left-4 z-20 max-h-[40svh] animate-map-panel-enter rounded-2xl bg-white shadow-2xl motion-reduce:animate-none md:top-6 md:right-auto md:bottom-auto md:left-6 md:max-h-[calc(100svh-3rem)] md:w-[360px] ${popupVisible ? "max-[1100px]:hidden" : ""}`} aria-label="Выбор бистро">
        <div className="flex max-h-[inherit] flex-col overflow-hidden rounded-[inherit]">
          <div className="shrink-0 px-6 pt-6 pb-4 md:px-7 md:pt-8">
            <h1 className="font-brand text-[28px] leading-[1.15] font-light md:whitespace-nowrap">Выбрать бистро</h1>
          </div>
          <ul className="min-h-0 divide-y divide-brand-ink/10 overflow-y-auto overscroll-contain px-6 pb-6 md:px-7">
            {locations.map((location) => {
              const active = selectedLocation === location.id;
              const [cityName, placeName] = location.name.ru.split(" — ");
              return (
                <li key={location.id}>
                  <button type="button" aria-pressed={active} onClick={() => flyToLocation(location.id)} className="group block min-h-11 w-full cursor-pointer py-3.5 text-left text-brand-ink transition-colors hover:text-brand-red aria-pressed:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red">
                    <span className="block text-base leading-6 font-bold">{cityName}</span>
                    {placeName && <span className="mt-0.5 block text-[13px] leading-5 text-brand-ink/75 group-hover:text-brand-red group-aria-pressed:text-brand-red">{placeName}</span>}
                    {"status" in location && <span className="mt-1 block text-xs leading-5 text-brand-ink/70">{location.status.ru}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <Link href="/" aria-label="Закрыть карту и вернуться на главную" className="absolute top-5 right-5 z-30 grid size-12 place-items-center rounded-full bg-white/95 focus-visible:outline-2 focus-visible:outline-brand-red md:top-8 md:right-8">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m5 5 18 18M23 5 5 23" stroke="currentColor" strokeWidth="1.5" /></svg>
      </Link>

      <div className="absolute right-0 bottom-0 left-0 z-10 flex flex-wrap justify-end gap-x-2 bg-white/85 px-3 py-2 text-[9px] text-brand-ink/70 [&_a]:underline [&_a]:underline-offset-2">
        <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre</a>
        <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>
        <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">© OpenMapTiles</a>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>
        <a href="https://mapterhorn.com/attribution" target="_blank" rel="noopener noreferrer">© Mapterhorn</a>
      </div>
    </div>
  );
}
