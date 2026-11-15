"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

type Language = "ru" | "en";

const menuItems = [
  { label: "О проекте", id: "about" },
  { label: "Галерея", id: "gallery" },
  { label: "События", id: "events" },
  { label: "Франшиза", id: "franchise" },
  { label: "Партнерам", id: "partners" },
];

export default function Header({ activeId, onNavigate }: { activeId?: string; onNavigate?: (id: string) => void }) {
  const [language, setLanguage] = useState<Language>("ru");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const closingRef = useRef(false);
  const pendingSectionRef = useRef<string | null>(null);

  function closeMenu() {
    const panel = panelRef.current;
    const shade = shadeRef.current;
    if (!panel || !shade || closingRef.current) return;
    closingRef.current = true;
    const transform = getComputedStyle(panel).transform;
    const opacity = getComputedStyle(shade).opacity;
    animationsRef.current.forEach((animation) => animation.cancel());
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    const panelAnimation = panel.animate(
      [{ transform }, { transform: "translateX(100%)" }],
      { duration, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );
    const shadeAnimation = shade.animate([{ opacity }, { opacity: 0 }], { duration, fill: "forwards" });
    animationsRef.current = [panelAnimation, shadeAnimation];
    panelAnimation.finished.then(() => setMenuOpen(false)).catch(() => {});
  }

  useLayoutEffect(() => {
    if (!menuOpen) {
      const id = pendingSectionRef.current;
      pendingSectionRef.current = null;
      if (id) {
        if (onNavigate) {
          onNavigate(id);
          return;
        }
        const section = document.getElementById(id);
        if (section) {
          window.history.pushState(null, "", `#${id}`);
          section.focus({ preventScroll: true });
          section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
        }
      }
      return;
    }
    const dialog = menuRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closingRef.current = false;
    dialog.showModal();
    // Keep autofocus from scrolling the dialog toward the offscreen panel.
    dialog.focus({ preventScroll: true });
    dialog.scrollLeft = 0;
    dialog.scrollTop = 0;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    animationsRef.current = [
      panelRef.current!.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
        { duration, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      ),
      shadeRef.current!.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: "forwards" }),
    ];
    return () => {
      animationsRef.current.forEach((animation) => animation.cancel());
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, onNavigate]);

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex min-h-29 items-center justify-between gap-8 bg-transparent px-page-gutter py-6 font-brand-mono text-white max-sm:min-h-32 max-sm:flex-wrap max-sm:gap-x-4 max-sm:gap-y-2 max-sm:py-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-white [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-white">
      <Link className="inline-flex shrink-0 py-3" href="/" aria-label="Техникум — главная">
        <Image
          src="/brand/tehnikum-logo-white.svg"
          alt="Техникум"
          width={232}
          height={29}
          className="block h-auto w-58 max-sm:w-42.5"
          priority
        />
      </Link>

      <div className="flex items-center gap-9 max-sm:contents">
        <button
          type="button"
          aria-label={language === "ru" ? "Язык шапки: русский. Switch to English" : "Header language: English. Переключить на русский"}
          className="inline-flex h-12 w-11 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent px-1 text-sm leading-none text-white uppercase transition-colors hover:text-white max-sm:ml-auto"
          onClick={() => setLanguage((current) => current === "ru" ? "en" : "ru")}
        >
          <span className="[text-box:trim-both_cap_alphabetic]">{language}</span>
        </button>

        <Link
          href="/map"
          lang={language}
          className="inline-grid h-12 shrink-0 items-center justify-items-center font-brand text-2xl leading-none font-light whitespace-nowrap text-white underline-offset-4 hover:underline max-sm:order-1 max-sm:w-full [&_span]:[text-box:trim-both_cap_alphabetic]"
        >
          <span aria-hidden={language !== "ru"} className={`col-start-1 row-start-1 ${language !== "ru" ? "invisible" : ""}`}>Выбрать бистро</span>
          <span aria-hidden={language !== "en"} className={`col-start-1 row-start-1 ${language !== "en" ? "invisible" : ""}`}>Choose a bistro</span>
        </Link>
        <button
          type="button"
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
          aria-controls="header-menu"
          onClick={() => setMenuOpen(true)}
          className="flex size-12 shrink-0 cursor-pointer flex-col items-center justify-center gap-2"
        >
          <span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-white" />
          <span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-white" />
          <span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-white" />
        </button>
      </div>
      <dialog
        ref={menuRef}
        id="header-menu"
        aria-label="Меню сайта"
        tabIndex={-1}
        autoFocus
        onClose={() => setMenuOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-clip border-0 bg-transparent p-0 text-white outline-none backdrop:bg-transparent"
      >
        <div ref={shadeRef} aria-hidden="true" onClick={closeMenu} className="absolute inset-0 bg-black/60 opacity-0 backdrop-blur-sm" />
        <div ref={panelRef} className="absolute inset-y-0 right-0 flex h-full w-full max-w-[30rem] flex-col overflow-y-auto rounded-l-2xl bg-brand-ink px-8 py-6 [transform:translateX(100%)] will-change-transform sm:px-14">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={closeMenu}
            className="relative ml-auto flex size-12 shrink-0 cursor-pointer items-center justify-center"
          >
            <span aria-hidden="true" className="absolute h-0.5 w-10 rotate-45 rounded-full bg-white" />
            <span aria-hidden="true" className="absolute h-0.5 w-10 -rotate-45 rounded-full bg-white" />
          </button>
          <ul className="mt-14 flex flex-col gap-4 pb-10 font-brand text-[1.75rem] leading-[1.2] font-light sm:text-[2rem]">
            {menuItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`/#${item.id}`}
                  aria-current={activeId === item.id ? "location" : undefined}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || closingRef.current) return;
                    event.preventDefault();
                    pendingSectionRef.current = item.id;
                    closeMenu();
                  }}
                  className="inline-block cursor-pointer py-2 text-white decoration-brand-red decoration-1 underline-offset-8 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white aria-[current=location]:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </header>
  );
}
