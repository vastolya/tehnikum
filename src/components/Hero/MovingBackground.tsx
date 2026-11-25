"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

export default function MovingBackground({ src, position = "center", priority = false, children }: { src?: string; position?: string; priority?: boolean; children?: ReactNode }) {
  
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = imageRef.current?.closest<HTMLElement>("[data-motion-area]") ?? imageRef.current?.parentElement;
    const image = imageRef.current;
    if (!section || !image) return;

    const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let start = 0;
    const reset = () => {
      targetX = 0;
      targetY = 0;
    };
    const animate = (time: number) => {
      if (!motion.matches) {
        image.style.transform = "";
        frame = 0;
        return;
      }
      if (!start) start = time;
      const elapsed = (time - start) / 1000;
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;
      const x = currentX + Math.sin(elapsed * 0.35) * 0.2;
      const y = currentY + Math.sin(elapsed * 0.27) * 0.16;
      image.style.transform = `scale(1.025) translate3d(${x}%, ${y}%, 0)`;
      frame = requestAnimationFrame(animate);
    };
    const syncMotion = () => {
      reset();
      if (motion.matches && !frame) frame = requestAnimationFrame(animate);
      if (!motion.matches && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        image.style.transform = "";
      }
    };
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType !== "mouse") return;
      const bounds = section.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      targetX = -x * 1.2;
      targetY = -y * 1.2;
    };

    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", reset);
    motion.addEventListener("change", syncMotion);
    syncMotion();
    return () => {
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", syncMotion);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={imageRef} className="pointer-events-none absolute inset-0 [@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:scale-[1.025]">{src && <Image src={src} alt="" fill priority={priority} sizes="100vw" style={{ objectPosition: position }} className="object-cover" />}{children}</div>;
}
