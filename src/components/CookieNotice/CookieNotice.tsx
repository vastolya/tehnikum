"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const ACCEPTED_KEY = "tehnikum-cookie-notice-accepted";
const DISMISSED_KEY = "tehnikum-cookie-notice-dismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const noticeRef = useRef<HTMLElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const closingRef = useRef(false);

  useLayoutEffect(() => {
    const notice = noticeRef.current;
    if (!visible || !notice) return;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animationRef.current = notice.animate(
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
      );
    }

    return () => {
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [visible]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setVisible(
          localStorage.getItem(ACCEPTED_KEY) !== "1" &&
            sessionStorage.getItem(DISMISSED_KEY) !== "1",
        );
      } catch {
        setVisible(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function dismiss(accepted: boolean) {
    if (closingRef.current) return;
    closingRef.current = true;
    try {
      if (accepted) localStorage.setItem(ACCEPTED_KEY, "1");
      else sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // The notice can still be closed when browser storage is unavailable.
    }
    const notice = noticeRef.current;
    if (!notice || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    const { opacity, transform } = getComputedStyle(notice);
    animationRef.current?.cancel();
    const animation = notice.animate(
      [{ opacity, transform }, { opacity: 0, transform: "translateY(12px)" }],
      { duration: 240, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "both" },
    );
    animationRef.current = animation;
    animation.onfinish = () => setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      ref={noticeRef}
      aria-label="Уведомление о cookies"
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-[520px] flex-col items-stretch gap-3 rounded border border-brand-ink/8 bg-white px-5 py-4 text-brand-ink shadow-[0_6px_28px_-8px_rgb(0_0_0/20%)] sm:bottom-6 sm:flex-row sm:items-center sm:gap-5 sm:pr-12"
    >
      <p className="pr-5 text-xs leading-[1.6] sm:pr-0">
        Продолжая пользоваться сайтом, вы соглашаетесь с использованием cookie
      </p>
      <button
        type="button"
        onClick={() => dismiss(true)}
        className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-brand-red px-5 font-brand text-lg leading-none font-light text-white underline-offset-4 transition-colors duration-200 hover:bg-brand-red/90 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red motion-reduce:transition-none"
      >
        <span className="[text-box:trim-both_cap_alphabetic]">Принять</span>
      </button>
      <button
        type="button"
        aria-label="Закрыть уведомление о cookies"
        onClick={() => dismiss(false)}
        className="absolute top-1 right-1 flex size-8 cursor-pointer items-center justify-center rounded-sm text-brand-ink/45 transition-colors duration-200 hover:bg-brand-ink/5 hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red motion-reduce:transition-none"
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m2 2 12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </aside>
  );
}
