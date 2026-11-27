"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LoaderScreen({ fading = false }: { fading?: boolean }) {
  return (
    <div id="page-loader" role="status" aria-label="Загрузка страницы" className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black px-8 transition-opacity duration-300 motion-reduce:transition-none ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}>
      <Image src="/brand/tehnikum-logo-white.svg" alt="" width={1843} height={227} priority className="h-auto w-full max-w-[22rem]" />
      <div aria-hidden="true" className="mt-10 h-px w-24 overflow-hidden bg-white/25">
        <div className="h-full w-1/3 animate-map-loading bg-brand-red motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export default function PageLoader() {
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let removal: ReturnType<typeof setTimeout> | undefined;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setFading(true);
      removal = setTimeout(() => setVisible(false), 300);
    };
    const fallback = setTimeout(finish, 4000);
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    return () => {
      clearTimeout(fallback);
      clearTimeout(removal);
      window.removeEventListener("load", finish);
    };
  }, []);

  return visible ? <LoaderScreen fading={fading} /> : null;
}
